import { useState, useEffect } from "react";
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
import { X, Plus, FileText } from "lucide-react";
import { 
  Sale, 
  SaleItem, 
  saveSale, 
  generateId,
  formatCurrency,
  getAllCategoriesFromTransactions,
  Item
} from "@/lib/supabaseStorage";
import { generateSalePDF, savePDF } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import CategorySelect from "./CategorySelect";
import CustomerSelect from "./CustomerSelect";
import ItemSelect from "./ItemSelect";

interface CreateSaleFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateSaleForm = ({ open, onClose, onSuccess }: CreateSaleFormProps) => {
  const { toast } = useToast();
  const [customer, setCustomer] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<Sale["status"]>("Pending");
  const [notes, setNotes] = useState("");
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [items, setItems] = useState<SaleItem[]>([
    { id: generateId("ITM"), description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryList = await getAllCategoriesFromTransactions();
        setCategories(categoryList);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

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

  const handleItemSelect = (index: number, item: Item) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      description: item.name,
      unitPrice: item.unit_price,
    };
    setItems(newItems);
  };

  const calculateSubtotal = (): number => {
    return items.reduce((total, item) => {
      return total + item.quantity * item.unitPrice;
    }, 0);
  };

  const calculateTaxAmount = (): number => {
    return (calculateSubtotal() * taxPercentage) / 100;
  };

  const calculateTotal = (): number => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);

    const newSale: Sale = {
      id: generateId("INV"),
      customer,
      date,
      amount: calculateTotal(),
      status,
      items,
      notes: notes || undefined,
      tax: taxPercentage > 0 ? {
        percentage: taxPercentage,
        amount: calculateTaxAmount()
      } : undefined,
      category: category || undefined,
    };

    try {
      await saveSale(newSale);
      
      toast({
        title: "Success",
        description: `Sale ${newSale.id} created successfully`,
      });
      
      // Reset form
      setCustomer("");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);
      setStatus("Pending");
      setNotes("");
      setTaxPercentage(0);
      setItems([{ id: generateId("ITM"), description: "", quantity: 1, unitPrice: 0 }]);
      
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save sale",
        variant: "destructive",
      });
      console.error("Error saving sale:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePDF = () => {
    const newSale: Sale = {
      id: generateId("INV"),
      customer,
      date,
      amount: calculateTotal(),
      status,
      items,
      notes: notes || undefined,
      tax: taxPercentage > 0 ? {
        percentage: taxPercentage,
        amount: calculateTaxAmount()
      } : undefined,
      category: category || undefined,
    };
    
    const doc = generateSalePDF(newSale);
    savePDF(doc, `sale_${newSale.id}.pdf`);
    
    toast({
      title: "Success",
      description: "PDF generated successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Sale</DialogTitle>
          <DialogDescription>
            Add new sale information and items
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name</Label>
                <CustomerSelect
                  value={customer}
                  onValueChange={setCustomer}
                  placeholder="Select or create customer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <CategorySelect
                  value={category}
                  onValueChange={setCategory}
                  categories={categories}
                  placeholder="Select or create category"
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: Sale["status"]) => setStatus(value)}>
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
                        Item
                      </Label>
                      <ItemSelect
                        value={item.description}
                        onValueChange={(value) => handleItemChange(index, "description", value)}
                        onItemSelect={(selectedItem) => handleItemSelect(index, selectedItem)}
                        placeholder="Select or create item"
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
                      <Input
                        id={`item-${index}-price`}
                        type="number"
                        min="0"
                        step="0.01"
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxPercentage">Tax Percentage (%)</Label>
                  <Input
                    id="taxPercentage"
                    type="number"
                    min="0"
                    step="0.1"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col justify-end space-y-1">
                  {taxPercentage > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax ({taxPercentage}%):</span>
                        <span>{formatCurrency(calculateTaxAmount())}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGeneratePDF}
              className="mr-2"
            >
              <FileText className="h-4 w-4 mr-2" /> Create Invoice (PDF)
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Sale"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSaleForm;
