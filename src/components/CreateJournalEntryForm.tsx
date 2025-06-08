
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
import { Plus, Trash2 } from "lucide-react";
import { 
  saveJournalEntry, 
  generateId, 
  getAllCategoriesFromTransactions,
  JournalEntry,
  JournalLineItem 
} from "@/lib/storage";
import CategorySelect from "./CategorySelect";

interface CreateJournalEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateJournalEntryForm = ({ open, onOpenChange, onSuccess }: CreateJournalEntryFormProps) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<JournalLineItem[]>([
    { id: generateId("JLI"), account: "", description: "", debit: 0, credit: 0 },
    { id: generateId("JLI"), account: "", description: "", debit: 0, credit: 0 },
  ]);

  const categories = getAllCategoriesFromTransactions();

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: generateId("JLI"), account: "", description: "", debit: 0, credit: 0 }
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 2) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof JournalLineItem, value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotals = () => {
    const totalDebit = lineItems.reduce((sum, item) => sum + (item.debit || 0), 0);
    const totalCredit = lineItems.reduce((sum, item) => sum + (item.credit || 0), 0);
    return { totalDebit, totalCredit };
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isBalanced) {
      alert("Journal entry must be balanced (Total Debit must equal Total Credit)");
      return;
    }

    const journalEntry: JournalEntry = {
      id: generateId("JE"),
      date,
      description,
      reference: reference.trim() || undefined,
      lineItems: lineItems.filter(item => item.account.trim() && (item.debit > 0 || item.credit > 0)),
      totalDebit,
      totalCredit,
      notes: notes.trim() || undefined,
      category: category || undefined,
    };

    saveJournalEntry(journalEntry);
    
    // Reset form
    setDate(new Date().toISOString().split('T')[0]);
    setDescription("");
    setReference("");
    setCategory("");
    setNotes("");
    setLineItems([
      { id: generateId("JLI"), account: "", description: "", debit: 0, credit: 0 },
      { id: generateId("JLI"), account: "", description: "", debit: 0, credit: 0 },
    ]);
    
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Journal Entry</DialogTitle>
          <DialogDescription>
            Create a manual journal entry for accounting transactions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., INV-001, CHK-123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Journal entry description"
              required
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

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Line Items</Label>
              <Button type="button" onClick={addLineItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-medium text-sm">
                <div className="col-span-3">Account</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-2">Debit</div>
                <div className="col-span-2">Credit</div>
                <div className="col-span-1">Action</div>
              </div>
              
              {lineItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 p-3 border-t">
                  <div className="col-span-3">
                    <Input
                      value={item.account}
                      onChange={(e) => updateLineItem(item.id, "account", e.target.value)}
                      placeholder="Account name"
                      size="sm"
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                      placeholder="Line description"
                      size="sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.debit || ""}
                      onChange={(e) => updateLineItem(item.id, "debit", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      size="sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.credit || ""}
                      onChange={(e) => updateLineItem(item.id, "credit", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      size="sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="grid grid-cols-12 gap-2 p-3 border-t bg-muted/50 font-medium">
                <div className="col-span-7">Total</div>
                <div className="col-span-2 text-right">{totalDebit.toFixed(2)}</div>
                <div className="col-span-2 text-right">{totalCredit.toFixed(2)}</div>
                <div className="col-span-1"></div>
              </div>
              
              {!isBalanced && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm">
                  ⚠️ Journal entry is not balanced. Total Debit ({totalDebit.toFixed(2)}) must equal Total Credit ({totalCredit.toFixed(2)}).
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isBalanced}>
              Create Journal Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJournalEntryForm;
