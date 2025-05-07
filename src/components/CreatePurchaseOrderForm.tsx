
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, IndianRupee } from "lucide-react";
import { 
  PurchaseOrder, 
  PurchaseItem, 
  savePurchaseOrder, 
  generateId,
  formatCurrency 
} from "@/lib/storage";
import { generatePurchaseOrderPDF, savePDF } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

interface CreatePurchaseOrderFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreatePurchaseOrderForm = ({ open, onClose, onSuccess }: CreatePurchaseOrderFormProps) => {
  const { toast } = useToast();
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<PurchaseOrder["status"]>("Pending");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([
    { id: generateId("ITM"), description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [enableTax, setEnableTax] = useState<boolean>(false);
  const [generatePDF, setGeneratePDF] = useState<boolean>(false);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: generateId("ITM"), description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof PurchaseItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setItems(newItems);
  };

  const calculateSubtotal = (): number => {
    return items.reduce((total, item) => {
      return total + item.quantity * item.unitPrice;
    }, 0);
  };

  const calculateTaxAmount = (subtotal: number): number => {
    return enableTax ? (subtotal * taxRate) / 100 : 0;
  };

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTaxAmount(subtotal);
    return subtotal + taxAmount;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplier) {
      toast({
        title: "Error",
        description: "Please enter supplier name",
        variant: "destructive",
      });
      return;
    }

    if (items.some(item => !item.description || item.quantity <= 0)) {
      toast({
        title: "Error",
        description: "Please fill all item details correctly",
        variant: "destructive",
      });
      return;
    }

    const subtotal = calculateSubtotal();
    const taxAmount = calculateTaxAmount(subtotal);

    const newPurchaseOrder: PurchaseOrder = {
      id: generateId("PO"),
      supplier,
      date,
      deliveryDate,
      amount: calculateTotal(),
      status,
      items,
      ...(enableTax && { tax: { percentage: taxRate, amount: taxAmount } }),
      notes: notes || undefined,
    };

    try {
      savePurchaseOrder(newPurchaseOrder);
      
      // Generate PDF only if the option is selected
      if (generatePDF) {
        const doc = generatePurchaseOrderPDF(newPurchaseOrder);
        savePDF(doc, `purchase_order_${newPurchaseOrder.id}.pdf`);
        toast({
          title: "Success",
          description: `Purchase Order ${newPurchaseOrder.id} created and PDF generated successfully`,
        });
      } else {
        toast({
          title: "Success",
          description: `Purchase Order ${newPurchaseOrder.id} created successfully`,
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save purchase order",
        variant: "destructive",
      });
      console.error("Error saving purchase order:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Purchase Order</DialogTitle>
          <DialogDescription>
            Add new purchase order information and items
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier Name</Label>
                <Input
                  id="supplier"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Enter supplier name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Expected Delivery Date</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: PurchaseOrder["status"]) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Items</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddItem}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center border p-3 rounded-md"
                  >
                    <div className="col-span-5">
                      <Label htmlFor={`item-${index}-description`}>
                        Description
                      </Label>
                      <Input
                        id={`item-${index}-description`}
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        placeholder="Item description"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`item-${index}-quantity`}>Quantity</Label>
                      <Input
                        id={`item-${index}-quantity`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`item-${index}-price`}>Unit Price</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          id={`item-${index}-price`}
                          type="number"
                          min="0"
                          step="1000"
                          className="pl-8"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "unitPrice",
                              Number(e.target.value)
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-span-2 flex items-end justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="enable-tax" 
                    checked={enableTax} 
                    onCheckedChange={(checked) => setEnableTax(checked === true)} 
                  />
                  <Label htmlFor="enable-tax">Enable Tax</Label>
                </div>
                
                {enableTax && (
                  <div className="flex items-center space-x-4">
                    <div className="w-1/4">
                      <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                      <Input
                        id="tax-rate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        required={enableTax}
                      />
                    </div>
                    <div className="text-sm text-gray-500 pt-6">
                      Tax Amount: {formatCurrency(calculateTaxAmount(calculateSubtotal()))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end text-lg font-medium">
                <div className="space-y-1 text-right">
                  <div className="text-sm text-muted-foreground">Subtotal: {formatCurrency(calculateSubtotal())}</div>
                  {enableTax && (
                    <div className="text-sm text-muted-foreground">Tax: {formatCurrency(calculateTaxAmount(calculateSubtotal()))}</div>
                  )}
                  <div>Total: {formatCurrency(calculateTotal())}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter additional notes"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="generate-pdf" 
                checked={generatePDF} 
                onCheckedChange={(checked) => setGeneratePDF(checked === true)} 
              />
              <Label htmlFor="generate-pdf">Generate PDF after saving</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Purchase Order</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePurchaseOrderForm;
