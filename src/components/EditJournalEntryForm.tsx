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
  JournalEntry, 
  JournalLineItem, 
  updateJournalEntry, 
  generateId
} from "@/lib/supabaseStorage";
import { useToast } from "@/hooks/use-toast";
import CategorySelect from "./CategorySelect";
import AccountSelect from "./AccountSelect";

interface EditJournalEntryFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  journalEntry: JournalEntry;
}

const EditJournalEntryForm = ({ open, onClose, onSuccess, journalEntry }: EditJournalEntryFormProps) => {
  const { toast } = useToast();
  const [description, setDescription] = useState(journalEntry.description);
  const [reference, setReference] = useState(journalEntry.reference || "");
  const [category, setCategory] = useState(journalEntry.category || "");
  const [date, setDate] = useState(journalEntry.date);
  const [notes, setNotes] = useState(journalEntry.notes || "");
  const [lineItems, setLineItems] = useState<JournalLineItem[]>([]);

  useEffect(() => {
    if (journalEntry) {
      setDescription(journalEntry.description);
      setReference(journalEntry.reference || "");
      setCategory(journalEntry.category || "");
      setDate(journalEntry.date);
      setNotes(journalEntry.notes || "");
      
      // Ensure exactly 2 line items with proper number conversion
      const existingItems = journalEntry.lineItems || [];
      if (existingItems.length >= 2) {
        setLineItems([
          {
            ...existingItems[0],
            debit: Number(existingItems[0].debit) || 0,
            credit: Number(existingItems[0].credit) || 0
          },
          {
            ...existingItems[1],
            debit: Number(existingItems[1].debit) || 0,
            credit: Number(existingItems[1].credit) || 0
          }
        ]);
      } else if (existingItems.length === 1) {
        setLineItems([
          {
            ...existingItems[0],
            debit: Number(existingItems[0].debit) || 0,
            credit: Number(existingItems[0].credit) || 0
          },
          { id: generateId("JLI"), account: "", description: "", debit: 0, credit: 0 }
        ]);
      } else {
        setLineItems([
          { id: generateId("JLI"), account: "", description: "", debit: 0, credit: 0 },
          { id: generateId("JLI"), account: "", description: "", debit: 0, credit: 0 }
        ]);
      }
    }
  }, [journalEntry]);

  const updateLineItem = (
    index: number,
    field: keyof JournalLineItem,
    value: string | number
  ) => {
    const newLineItems = [...lineItems];
    if (field === 'debit' || field === 'credit') {
      const numValue = typeof value === 'string' ? (parseFloat(value) || 0) : (Number(value) || 0);
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
    const totalDebit = lineItems.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
    const totalCredit = lineItems.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
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

    const updatedJournalEntry: JournalEntry = {
      id: journalEntry.id,
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
      await updateJournalEntry(updatedJournalEntry);
      
      toast({
        title: "Success",
        description: `Journal entry ${updatedJournalEntry.id} updated successfully`,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update journal entry",
        variant: "destructive",
      });
      console.error("Error updating journal entry:", error);
    }
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const balanced = isBalanced();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Journal Entry</DialogTitle>
          <DialogDescription>
            Update journal entry with balanced debits and credits (2 accounts only)
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
              Update Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditJournalEntryForm;
