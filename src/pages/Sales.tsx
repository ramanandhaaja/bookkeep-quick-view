
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

interface Sale {
  id: string;
  customer: string;
  date: string;
  amount: string;
  status: string;
}

const initialSales: Sale[] = [
  {
    id: "INV-001",
    customer: "Acme Corp",
    date: "2025-05-01",
    amount: "$1,200.00",
    status: "Paid",
  },
  {
    id: "INV-002",
    customer: "Globex",
    date: "2025-05-02",
    amount: "$850.00",
    status: "Pending",
  },
  {
    id: "INV-003",
    customer: "Stark Industries",
    date: "2025-05-03",
    amount: "$3,700.00",
    status: "Overdue",
  },
  {
    id: "INV-004",
    customer: "Wayne Enterprises",
    date: "2025-05-04",
    amount: "$2,150.00",
    status: "Paid",
  },
  {
    id: "INV-005",
    customer: "Umbrella Corp",
    date: "2025-05-05",
    amount: "$960.00",
    status: "Pending",
  },
];

const Sales = () => {
  const [sales] = useState<Sale[]>(initialSales);
  const [searchTerm, setSearchTerm] = useState("");

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
          <Button>
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
            {filteredSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.id}</TableCell>
                <TableCell>{sale.customer}</TableCell>
                <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                <TableCell>{sale.amount}</TableCell>
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
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" /> View Sale
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" /> Generate Invoice
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

export default Sales;
