
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
import { useState } from "react";

interface PurchaseOrder {
  id: string;
  supplier: string;
  date: string;
  deliveryDate: string;
  amount: string;
  status: string;
}

const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-001",
    supplier: "Office Supplies Co",
    date: "2025-05-01",
    deliveryDate: "2025-05-08",
    amount: "$450.00",
    status: "Fulfilled",
  },
  {
    id: "PO-002",
    supplier: "Tech Hardware Inc",
    date: "2025-05-02",
    deliveryDate: "2025-05-15",
    amount: "$1,275.00",
    status: "Pending",
  },
  {
    id: "PO-003",
    supplier: "Business Services Ltd",
    date: "2025-05-03",
    deliveryDate: "2025-05-10",
    amount: "$780.00",
    status: "Cancelled",
  },
  {
    id: "PO-004",
    supplier: "Furniture Outlet",
    date: "2025-05-04",
    deliveryDate: "2025-06-01",
    amount: "$2,850.00",
    status: "Fulfilled",
  },
  {
    id: "PO-005",
    supplier: "Digital Marketing Agency",
    date: "2025-05-05",
    deliveryDate: "2025-05-12",
    amount: "$1,500.00",
    status: "Pending",
  },
];

const PurchaseOrders = () => {
  const [purchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [searchTerm, setSearchTerm] = useState("");

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
          <Button>
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
            {filteredPurchaseOrders.map((po) => (
              <TableRow key={po.id}>
                <TableCell>{po.id}</TableCell>
                <TableCell>{po.supplier}</TableCell>
                <TableCell>{new Date(po.date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(po.deliveryDate).toLocaleDateString()}</TableCell>
                <TableCell>{po.amount}</TableCell>
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
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" /> View
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
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
};

export default PurchaseOrders;
