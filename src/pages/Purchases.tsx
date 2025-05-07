
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
import { useState } from "react";

interface Purchase {
  id: string;
  supplier: string;
  date: string;
  amount: string;
  status: string;
}

const initialPurchases: Purchase[] = [
  {
    id: "PO-001",
    supplier: "Office Supplies Co",
    date: "2025-05-01",
    amount: "$450.00",
    status: "Received",
  },
  {
    id: "PO-002",
    supplier: "Tech Hardware Inc",
    date: "2025-05-02",
    amount: "$1,275.00",
    status: "Pending",
  },
  {
    id: "PO-003",
    supplier: "Business Services Ltd",
    date: "2025-05-03",
    amount: "$780.00",
    status: "Cancelled",
  },
  {
    id: "PO-004",
    supplier: "Furniture Outlet",
    date: "2025-05-04",
    amount: "$2,850.00",
    status: "Received",
  },
  {
    id: "PO-005",
    supplier: "Digital Marketing Agency",
    date: "2025-05-05",
    amount: "$1,500.00",
    status: "Pending",
  },
];

const Purchases = () => {
  const [purchases] = useState<Purchase[]>(initialPurchases);
  const [searchTerm, setSearchTerm] = useState("");

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
          <Button>
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
            {filteredPurchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{purchase.id}</TableCell>
                <TableCell>{purchase.supplier}</TableCell>
                <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                <TableCell>{purchase.amount}</TableCell>
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
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" /> View Purchase
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" /> Create Purchase Order
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

export default Purchases;
