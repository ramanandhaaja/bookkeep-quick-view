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
import { Plus, MoreHorizontal, Download, FileText, Trash, Filter, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/storage";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  balance: number;
}

const initialContacts: Contact[] = [
  {
    id: "C-001",
    name: "Acme Corp",
    email: "contact@acme.com",
    phone: "(555) 123-4567",
    type: "Customer",
    balance: 1200000,
  },
  {
    id: "C-002",
    name: "Globex",
    email: "info@globex.com",
    phone: "(555) 234-5678",
    type: "Customer",
    balance: 850000,
  },
  {
    id: "C-003",
    name: "Office Supplies Co",
    email: "orders@officesupplies.com",
    phone: "(555) 345-6789",
    type: "Supplier",
    balance: 450000,
  },
  {
    id: "C-004",
    name: "Stark Industries",
    email: "info@stark.com",
    phone: "(555) 456-7890",
    type: "Customer",
    balance: 3700000,
  },
  {
    id: "C-005",
    name: "Tech Hardware Inc",
    email: "sales@techhardware.com",
    phone: "(555) 567-8901",
    type: "Supplier",
    balance: 1275000,
  },
];

const Contacts = () => {
  const [contacts] = useState<Contact[]>(initialContacts);
  const [searchTerm, setSearchTerm] = useState("");
  const [contactType, setContactType] = useState<string>("all");

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (contactType === "all") return matchesSearch;
    return matchesSearch && contact.type.toLowerCase() === contactType.toLowerCase();
  });

  return (
    <Layout
      title="Contacts"
      subtitle="Manage your customers and suppliers"
    >
      <Tabs defaultValue="all" onValueChange={setContactType}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="customer">Customers</TabsTrigger>
            <TabsTrigger value="supplier">Suppliers</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Contact
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <ContactList 
            contacts={filteredContacts} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </TabsContent>
        
        <TabsContent value="customer" className="mt-0">
          <ContactList 
            contacts={filteredContacts} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </TabsContent>
        
        <TabsContent value="supplier" className="mt-0">
          <ContactList 
            contacts={filteredContacts} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

interface ContactListProps {
  contacts: Contact[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const ContactList = ({ contacts, searchTerm, setSearchTerm }: ContactListProps) => {
  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      contact.type === "Customer"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {contact.type}
                  </span>
                </TableCell>
                <TableCell>{formatCurrency(contact.balance)}</TableCell>
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
                        <FileText className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" /> Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className="mr-2 h-4 w-4" /> Call
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
    </>
  );
};

export default Contacts;
