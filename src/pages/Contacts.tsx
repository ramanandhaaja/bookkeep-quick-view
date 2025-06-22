
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
import { Plus, MoreHorizontal, Download, FileText, Trash, Filter, Mail, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getContacts, 
  deleteContact, 
  formatCurrency, 
  Contact 
} from "@/lib/supabaseStorage";
import { useToast } from "@/hooks/use-toast";

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [contactType, setContactType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadContacts = async () => {
    try {
      setLoading(true);
      const loadedContacts = await getContacts();
      setContacts(loadedContacts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteContact(id);
        loadContacts();
        toast({
          title: "Success",
          description: "Contact deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete contact",
          variant: "destructive",
        });
        console.error("Error deleting contact:", error);
      }
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (contactType === "all") return matchesSearch;
    return matchesSearch && contact.type.toLowerCase() === contactType.toLowerCase();
  });

  if (loading) {
    return (
      <Layout title="Contacts" subtitle="Manage your customers and suppliers">
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Loading contacts...</div>
        </div>
      </Layout>
    );
  }

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
            onDelete={handleDelete}
          />
        </TabsContent>
        
        <TabsContent value="customer" className="mt-0">
          <ContactList 
            contacts={filteredContacts} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onDelete={handleDelete}
          />
        </TabsContent>
        
        <TabsContent value="supplier" className="mt-0">
          <ContactList 
            contacts={filteredContacts} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onDelete={handleDelete}
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
  onDelete: (id: string) => void;
}

const ContactList = ({ contacts, searchTerm, setSearchTerm, onDelete }: ContactListProps) => {
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
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.email || "—"}</TableCell>
                  <TableCell>{contact.phone || "—"}</TableCell>
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
                        {contact.email && (
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" /> Send Email
                          </DropdownMenuItem>
                        )}
                        {contact.phone && (
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" /> Call
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600" 
                          onClick={() => onDelete(contact.id)}
                        >
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
                  No contacts found. Create your first contact by using the customer or supplier dropdowns in sales/purchases.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default Contacts;
