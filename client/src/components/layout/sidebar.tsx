import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  ChartLine, 
  ClipboardList, 
  UtensilsCrossed, 
  Armchair, 
  CreditCard, 
  FileText, 
  Users, 
  LogOut,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: ChartLine },
  { name: "Orders", href: "/orders", icon: ClipboardList },
  { name: "Menu", href: "/menu", icon: UtensilsCrossed },
  { name: "Tables", href: "/tables", icon: Armchair },
  { name: "Checkout", href: "/checkout", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Staff", href: "/staff", icon: Users },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="w-80 bg-elegant-700 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-elegant-600">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-accent-400 rounded-xl flex items-center justify-center neu-button">
            <UtensilsCrossed className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Elegant POS</h1>
            <p className="text-elegant-300 text-sm">Restaurant Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start space-x-3 p-4 rounded-xl transition-all ${
                  isActive
                    ? "bg-accent-500 text-white hover:bg-accent-600"
                    : "text-elegant-300 hover:text-white hover:bg-elegant-600"
                }`}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-elegant-600">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-elegant-600">
          <div className="w-10 h-10 bg-accent-400 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">{user?.name}</p>
            <p className="text-xs text-elegant-300 capitalize">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="text-elegant-300 hover:text-white"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
