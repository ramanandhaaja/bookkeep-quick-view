
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
import { Plus, MoreHorizontal, Download, FileText, Trash, Filter, Pencil } from "lucide-react";
import CreateSaleForm from "@/components/CreateSaleForm";
import EditSaleForm from "@/components/EditSaleForm";
import { getSales, deleteSale, Sale } from "@/lib/storage";
import { generateSalePDF, savePDF } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    .format(amount);
};

const Sales = () => {
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const loadSales = () => {
    const loadedSales = getSales();
    setSales(loadedSales);
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleDeleteSale = (id: string) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        deleteSale(id);
        loadSales();
        toast({
          title: "Success",
          description: "Sale deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete sale",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsEditFormOpen(true);
  };

  const handleGeneratePDF = (sale: Sale) => {
    const doc = generateSalePDF(sale);
    savePDF(doc, `sale_${sale.id}.pdf`);
    toast({
      title: "Success",
      description: "PDF generated successfully",
    });
  };

  const filteredSales = sales.filter((sale) =>
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout
      title="Sales"
      subtitle="Manage and track your sales transactions"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Input
              placeholder="Search sales..."
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
            <Plus className="h-4 w-4 mr-2" /> Add Sale
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.id}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCurrency(sale.amount)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        sale.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : sale.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sale.status}
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
                        <DropdownMenuItem onClick={() => handleEditSale(sale)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleGeneratePDF(sale)}>
                          <FileText className="mr-2 h-4 w-4" /> View PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteSale(sale.id)}>
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
                  No sales found. Create your first sale by clicking "Add Sale".
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateSaleForm
        open={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSuccess={loadSales}
      />

      {selectedSale && (
        <EditSaleForm
          open={isEditFormOpen}
          onClose={() => {
            setIsEditFormOpen(false);
            setSelectedSale(null);
          }}
          onSuccess={loadSales}
          sale={selectedSale}
        />
      )}
    </Layout>
  );
};

export default Sales;
