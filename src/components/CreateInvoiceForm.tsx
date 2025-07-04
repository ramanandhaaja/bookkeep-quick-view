
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
  Invoice, 
  SaleItem, 
  saveInvoice, 
  generateId,
  formatCurrency 
} from "@/lib/storage";
import { generateInvoicePDF, savePDF } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

interface CreateInvoiceFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateInvoiceForm = ({ open, onClose, onSuccess }: CreateInvoiceFormProps) => {
  const { toast } = useToast();
  const [customer, setCustomer] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<Invoice["status"]>("Pending");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<SaleItem[]>([
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
    field: keyof SaleItem,
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

    if (!customer) {
      toast({
        title: "Error",
        description: "Please enter customer name",
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

    const newInvoice: Invoice = {
      id: generateId("INV"),
      customer,
      date,
      dueDate,
      amount: calculateTotal(),
      status,
      items,
      ...(enableTax && { tax: { percentage: taxRate, amount: taxAmount } }),
      notes: notes || undefined,
    };

    try {
      saveInvoice(newInvoice);
      
      // Generate PDF only if the option is selected
      if (generatePDF) {
        const doc = generateInvoicePDF(newInvoice);
        savePDF(doc, `invoice_${newInvoice.id}.pdf`);
        toast({
          title: "Success",
          description: `Invoice ${newInvoice.id} created and PDF generated successfully`,
        });
      } else {
        toast({
          title: "Success",
          description: `Invoice ${newInvoice.id} created successfully`,
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      });
      console.error("Error saving invoice:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Add new invoice information and items
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input
                  id="customer"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="Enter customer name"
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
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: Invoice["status"]) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
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
            <Button type="submit">Create Invoice</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceForm;
