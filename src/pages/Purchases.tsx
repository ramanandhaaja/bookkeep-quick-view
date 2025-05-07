
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Download, FileText, Trash, Filter } from "lucide-react";
import CreatePurchaseForm from "@/components/CreatePurchaseForm";
import { getPurchases, deletePurchase, Purchase } from "@/lib/storage";
import { generatePurchasePDF, savePDF } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    .format(amount);
};

const Purchases = () => {
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const loadPurchases = () => {
    const loadedPurchases = getPurchases();
    setPurchases(loadedPurchases);
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const handleDeletePurchase = (id: string) => {
    if (window.confirm("Are you sure you want to delete this purchase?")) {
      try {
        deletePurchase(id);
        loadPurchases();
        toast({
          title: "Success",
          description: "Purchase deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete purchase",
          variant: "destructive",
        });
      }
    }
  };

  const handleGeneratePDF = (purchase: Purchase) => {
    const doc = generatePurchasePDF(purchase);
    savePDF(doc, `purchase_${purchase.id}.pdf`);
    toast({
      title: "Success",
      description: "PDF generated successfully",
    });
  };

  const filteredPurchases = purchases.filter((purchase) =>
    purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout
      title="Purchases"
      subtitle="Manage and track your purchase transactions"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Input
              placeholder="Search purchases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[300px]"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={() => setIsCreateFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Purchase
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.id}</TableCell>
                  <TableCell>{purchase.supplier}</TableCell>
                  <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCurrency(purchase.amount)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        purchase.status === "Received"
                          ? "bg-green-100 text-green-800"
                          : purchase.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {purchase.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleGeneratePDF(purchase)}>
                          <FileText className="mr-2 h-4 w-4" /> View PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePurchase(purchase.id)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No purchases found. Create your first purchase by clicking "Add Purchase".
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreatePurchaseForm
        open={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSuccess={loadPurchases}
      />
    </Layout>
  );
};

export default Purchases;
