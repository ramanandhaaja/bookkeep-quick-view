
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  ClipboardList, 
  Users, 
  Settings,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();

  return (
    <div className={cn("h-screen w-64 bg-sidebar p-4 flex flex-col border-r", className)}>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-accounting-primary">BookKeep</h1>
        <p className="text-xs text-muted-foreground">Simple Accounting</p>
      </div>
      
      <nav className="space-y-1 flex-1">
        <SidebarItem to="/" icon={<LayoutDashboard size={20} />} text="Dashboard" active={location.pathname === "/"} />
        <SidebarItem to="/sales" icon={<ArrowUpRight size={20} />} text="Sales" active={location.pathname === "/sales"} />
        <SidebarItem to="/purchases" icon={<ArrowDownRight size={20} />} text="Purchases" active={location.pathname === "/purchases"} />
        <SidebarItem to="/invoices" icon={<FileText size={20} />} text="Invoices" active={location.pathname === "/invoices"} />
        <SidebarItem to="/purchase-orders" icon={<ClipboardList size={20} />} text="Purchase Orders" active={location.pathname === "/purchase-orders"} />
        <SidebarItem to="/contacts" icon={<Users size={20} />} text="Contacts" active={location.pathname === "/contacts"} />
        <SidebarItem to="/reporting" icon={<BarChart3 size={20} />} text="Reporting" active={location.pathname === "/reporting"} />
      </nav>
      
      <div className="mt-auto">
        <SidebarItem to="/settings" icon={<Settings size={20} />} text="Settings" active={location.pathname === "/settings"} />
      </div>
    </div>
  );
};

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}

const SidebarItem = ({ to, icon, text, active }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        active 
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
          : "text-foreground/70 hover:bg-sidebar-accent/50"
      )}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
};

export default Sidebar;
