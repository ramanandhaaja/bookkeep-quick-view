
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Sales from "@/pages/Sales";
import Purchases from "@/pages/Purchases";
import Invoices from "@/pages/Invoices";
import PurchaseOrders from "@/pages/PurchaseOrders";
import JournalEntries from "@/pages/JournalEntries";
import Contacts from "@/pages/Contacts";
import Categories from "@/pages/Categories";
import Items from "@/pages/Items";
import Reporting from "@/pages/Reporting";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/journal-entries" element={<JournalEntries />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/items" element={<Items />} />
          <Route path="/reporting" element={<Reporting />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
