
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { 
  getJournalEntries, 
  deleteJournalEntry, 
  formatCurrency,
  JournalEntry 
} from "@/lib/storage";
import CreateJournalEntryForm from "@/components/CreateJournalEntryForm";
import EditJournalEntryForm from "@/components/EditJournalEntryForm";
import { useToast } from "@/hooks/use-toast";

const JournalEntries = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setJournalEntries(getJournalEntries());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this journal entry?")) {
      deleteJournalEntry(id);
      setJournalEntries(getJournalEntries());
      toast({
        title: "Success",
        description: "Journal entry deleted successfully",
      });
    }
  };

  const handleCreateSuccess = () => {
    setJournalEntries(getJournalEntries());
    setIsCreateFormOpen(false);
    toast({
      title: "Success",
      description: "Journal entry created successfully",
    });
  };

  const handleEditSuccess = () => {
    setJournalEntries(getJournalEntries());
    setEditingEntry(null);
    toast({
      title: "Success",
      description: "Journal entry updated successfully",
    });
  };

  return (
    <Layout
      title="Journal Entries"
      subtitle="Manual accounting transactions for reporting"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          {journalEntries.length} journal entries
        </div>
        <Button onClick={() => setIsCreateFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Journal Entry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journal Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {journalEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No journal entries yet. Create your first journal entry to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journalEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.date).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>{entry.reference || "-"}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>
                      {entry.category ? (
                        <Badge variant="secondary">{entry.category}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(entry.totalDebit)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(entry.totalCredit)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingEntry(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateJournalEntryForm
        open={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
        onSuccess={handleCreateSuccess}
      />

      {editingEntry && (
        <EditJournalEntryForm
          open={!!editingEntry}
          onOpenChange={(open) => !open && setEditingEntry(null)}
          journalEntry={editingEntry}
          onSuccess={handleEditSuccess}
        />
      )}
    </Layout>
  );
};

export default JournalEntries;
