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
import { X } from "lucide-react";
import { 
  JournalEntry, 
  JournalLineItem, 
  saveJournalEntry, 
  generateId
} from "@/lib/supabaseStorage";
import { useToast } from "@/hooks/use-toast";
import CategorySelect from "./CategorySelect";
import AccountSelect from "./AccountSelect";

interface CreateJournalEntryFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateJournalEntryForm = ({ open, onClose, onSuccess }: CreateJournalEntryFormProps) => {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<JournalLineItem[]>([
    { id: generateId("JLI"), account: "", description: "", debit: 0, credit: 0 },
    { id: generateId("JLI"), account: "", description: "", debit: 0, credit: 0 },
  ]);

  const resetForm = () => {
    setDescription("");
    setReference("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setLineItems([
      { id: generateId("JLI"), account: "", description: "", debit: 0, credit: 0 },
      { id: generateId("JLI"), account: "", description: "", debit: 0, credit: 0 },
    ]);
  };

  const updateLineItem = (
    index: number,
    field: keyof JournalLineItem,
    value: string | number
  ) => {
    const newLineItems = [...lineItems];
    if (field === 'debit' || field === 'credit') {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      newLineItems[index] = {
        ...newLineItems[index],
        [field]: numValue,
      };
      
      // Auto-balance: when one item has debit, the other should have credit
      if (numValue > 0) {
        const otherIndex = index === 0 ? 1 : 0;
        const oppositeField = field === 'debit' ? 'credit' : 'debit';
        newLineItems[otherIndex] = {
          ...newLineItems[otherIndex],
          [oppositeField]: numValue,
          [field]: 0,
        };
      }
    } else {
      newLineItems[index] = {
        ...newLineItems[index],
        [field]: value,
      };
    }
    setLineItems(newLineItems);
  };

  const calculateTotals = () => {
    const totalDebit = lineItems.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = lineItems.reduce((sum, item) => sum + item.credit, 0);
    return { totalDebit, totalCredit };
  };

  const isBalanced = () => {
    const { totalDebit, totalCredit } = calculateTotals();
    return Math.abs(totalDebit - totalCredit) < 0.01;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description) {
      toast({
        title: "Error",
        description: "Please enter a description",
        variant: "destructive",
      });
      return;
    }

    if (lineItems.some(item => !item.account || !item.description)) {
      toast({
        title: "Error",
        description: "Please fill in all line item details",
        variant: "destructive",
      });
      return;
    }

    if (!isBalanced()) {
      toast({
        title: "Error",
        description: "Journal entry must be balanced (debits must equal credits)",
        variant: "destructive",
      });
      return;
    }

    const { totalDebit, totalCredit } = calculateTotals();

    const newJournalEntry: JournalEntry = {
      id: generateId("JE"),
      date,
      description,
      reference: reference || undefined,
      category: category || undefined,
      notes: notes || undefined,
      totalDebit,
      totalCredit,
      lineItems,
    };

    try {
      await saveJournalEntry(newJournalEntry);
      
      toast({
        title: "Success",
        description: `Journal entry ${newJournalEntry.id} created successfully`,
      });
      
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save journal entry",
        variant: "destructive",
      });
      console.error("Error saving journal entry:", error);
    }
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const balanced = isBalanced();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Journal Entry</DialogTitle>
          <DialogDescription>
            Create a new journal entry with balanced debits and credits (2 accounts only)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter journal entry description"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference (Optional)</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Enter reference number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <CategorySelect
                  value={category}
                  onValueChange={setCategory}
                  categories={[]}
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

            <div className="space-y-4">
              <Label>Journal Entry Items (2 accounts required)</Label>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-end border p-3 rounded-md"
                  >
                    <div className="col-span-3">
                      <Label htmlFor={`account-${index}`}>Account</Label>
                      <AccountSelect
                        value={item.account}
                        onValueChange={(value) =>
                          updateLineItem(index, "account", value)
                        }
                        placeholder="Select or create account"
                      />
                    </div>
                    <div className="col-span-4">
                      <Label htmlFor={`line-description-${index}`}>
                        Description
                      </Label>
                      <Input
                        id={`line-description-${index}`}
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(index, "description", e.target.value)
                        }
                        placeholder="Line item description"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`debit-${index}`}>Debit</Label>
                      <Input
                        id={`debit-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.debit}
                        onChange={(e) =>
                          updateLineItem(index, "debit", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`credit-${index}`}>Credit</Label>
                      <Input
                        id={`credit-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.credit}
                        onChange={(e) =>
                          updateLineItem(index, "credit", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <div className="text-sm text-muted-foreground">
                        {index === 0 ? "Dr." : "Cr."}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                <div className="flex gap-6">
                  <div>
                    <span className="text-sm font-medium">Total Debits: </span>
                    <span className="font-mono">{totalDebit.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Total Credits: </span>
                    <span className="font-mono">{totalCredit.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      balanced ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm">
                    {balanced ? "Balanced" : "Not Balanced"}
                  </span>
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
            <Button type="submit" disabled={!balanced}>
              Create Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJournalEntryForm;
