
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
import { Plus, MoreHorizontal, Download, FileText, Trash, Filter, Printer, Send } from "lucide-react";
import CreatePurchaseOrderForm from "@/components/CreatePurchaseOrderForm";
import { getPurchaseOrders, deletePurchaseOrder, PurchaseOrder } from "@/lib/storage";
import { generatePurchaseOrderPDF, savePDF } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    .format(amount);
};

const PurchaseOrders = () => {
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const loadPurchaseOrders = () => {
    const loadedPurchaseOrders = getPurchaseOrders();
    setPurchaseOrders(loadedPurchaseOrders);
  };

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const handleDeletePurchaseOrder = (id: string) => {
    if (window.confirm("Are you sure you want to delete this purchase order?")) {
      try {
        deletePurchaseOrder(id);
        loadPurchaseOrders();
        toast({
          title: "Success",
          description: "Purchase order deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete purchase order",
          variant: "destructive",
        });
      }
    }
  };

  const handleGeneratePDF = (po: PurchaseOrder) => {
    const doc = generatePurchaseOrderPDF(po);
    savePDF(doc, `purchase_order_${po.id}.pdf`);
    toast({
      title: "Success",
      description: "PDF generated successfully",
    });
  };

  const filteredPurchaseOrders = purchaseOrders.filter((po) =>
    po.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout
      title="Purchase Orders"
      subtitle="Create and manage purchase orders"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Input
              placeholder="Search purchase orders..."
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
            <Plus className="h-4 w-4 mr-2" /> Create PO
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO #</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchaseOrders.length > 0 ? (
              filteredPurchaseOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell>{po.id}</TableCell>
                  <TableCell>{po.supplier}</TableCell>
                  <TableCell>{new Date(po.date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(po.deliveryDate).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCurrency(po.amount)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        po.status === "Fulfilled"
                          ? "bg-green-100 text-green-800"
                          : po.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {po.status}
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
                        <DropdownMenuItem onClick={() => handleGeneratePDF(po)}>
                          <FileText className="mr-2 h-4 w-4" /> View PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" /> Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4" /> Print
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" /> Mark as Fulfilled
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePurchaseOrder(po.id)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No purchase orders found. Create your first purchase order by clicking "Create PO".
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreatePurchaseOrderForm
        open={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSuccess={loadPurchaseOrders}
      />
    </Layout>
  );
};

export default PurchaseOrders;
