
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
import { X, Plus } from "lucide-react";
import { 
  Purchase, 
  PurchaseItem, 
  savePurchase, 
  generateId,
  getAllCategoriesFromTransactions,
  Item
} from "@/lib/supabaseStorage";
import { generatePurchasePDF, savePDF } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import CategorySelect from "./CategorySelect";
import SupplierSelect from "./SupplierSelect";
import ItemSelect from "./ItemSelect";

interface CreatePurchaseFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreatePurchaseForm = ({ open, onClose, onSuccess }: CreatePurchaseFormProps) => {
  const { toast } = useToast();
  const [supplier, setSupplier] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<Purchase["status"]>("Pending");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([
    { id: generateId("ITM"), description: "", quantity: 1, unitPrice: 0 },
  ]);
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

  const handleItemSelect = (index: number, item: Item) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      description: item.name,
      unitPrice: item.unit_price,
    };
    setItems(newItems);
  };

  const calculateTotal = (): number => {
    return items.reduce((total, item) => {
      return total + item.quantity * item.unitPrice;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    const newPurchase: Purchase = {
      id: generateId("PO"),
      supplier,
      date,
      amount: calculateTotal(),
      status,
      items,
      notes: notes || undefined,
      category: category || undefined,
    };

    try {
      await savePurchase(newPurchase);
      
      // Generate and save PDF
      const doc = generatePurchasePDF(newPurchase);
      savePDF(doc, `purchase_${newPurchase.id}.pdf`);
      
      toast({
        title: "Success",
        description: `Purchase ${newPurchase.id} created successfully`,
      });
      
      // Reset form
      setSupplier("");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);
      setStatus("Pending");
      setNotes("");
      setItems([{ id: generateId("ITM"), description: "", quantity: 1, unitPrice: 0 }]);
      
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save purchase",
        variant: "destructive",
      });
      console.error("Error saving purchase:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Purchase</DialogTitle>
          <DialogDescription>
            Add new purchase information and items
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier Name</Label>
                <SupplierSelect
                  value={supplier}
                  onValueChange={setSupplier}
                  placeholder="Select or create supplier"
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
              <Select value={status} onValueChange={(value: Purchase["status"]) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Received">Received</SelectItem>
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

              <div className="flex justify-end text-lg font-medium">
                Total: ${calculateTotal().toFixed(2)}
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
            <Button type="submit">Create Purchase</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePurchaseForm;
