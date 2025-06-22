import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  FileText,
  BookOpen,
  Users,
  Settings,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Tags,
  Package,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Sales & Revenue",
      icon: ShoppingCart,
      children: [
        { title: "Sales", href: "/sales" },
      ],
    },
    {
      title: "Purchases & Expenses",
      icon: Receipt,
      children: [
        { title: "Purchases", href: "/purchases" },
      ],
    },
    {
      title: "Accounting",
      icon: BookOpen,
      children: [
        { title: "Journal Entries", href: "/journal-entries" },
      ],
    },
    {
      title: "Master Data",
      icon: FileText,
      children: [
        { title: "Contacts", href: "/contacts" },
        { title: "Categories", href: "/categories" },
        { title: "Items", href: "/items" },
      ],
    },
    {
      title: "Reports",
      icon: BarChart3,
      href: "/reporting",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  const isActive = (href: string) => location.pathname === href;
  const isParentActive = (children?: { href: string }[]) =>
    children?.some(child => isActive(child.href));

  return (
    <div className="h-screen w-64 border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Accounting System</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-2">
          {menuItems.map((item) => {
            const isExpanded = expandedSections.includes(item.title);
            const hasChildren = item.children && item.children.length > 0;
            const parentActive = hasChildren && isParentActive(item.children);

            return (
              <div key={item.title}>
                <Button
                  variant={
                    (item.href && isActive(item.href)) || parentActive
                      ? "secondary"
                      : "ghost"
                  }
                  className={cn(
                    "w-full justify-start",
                    hasChildren && "pr-2"
                  )}
                  onClick={() => {
                    if (hasChildren) {
                      toggleSection(item.title);
                    } else if (item.href) {
                      navigate(item.href);
                    }
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span className="flex-1 text-left">{item.title}</span>
                  {hasChildren && (
                    <div className="ml-auto">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </Button>

                {hasChildren && isExpanded && (
                  <div className="ml-4 space-y-1 pt-1">
                    {item.children?.map((child) => (
                      <Button
                        key={child.href}
                        variant={isActive(child.href) ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => navigate(child.href)}
                      >
                        <span className="ml-2">{child.title}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
