import { useState } from "react";
import TopBar from "@/components/layout/topbar";
import StatsCards from "@/components/pos/stats-cards";
import ActiveOrders from "@/components/pos/active-orders";
import TableGrid from "@/components/pos/table-grid";
import OrderModal from "@/components/pos/order-modal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UtensilsCrossed, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const quickActions = [
    {
      title: "New Order",
      description: "Start taking a new order",
      icon: Plus,
      iconBg: "bg-accent-100",
      iconColor: "text-accent-600",
      onClick: () => setIsOrderModalOpen(true),
    },
    {
      title: "Menu Management",
      description: "Update dishes and prices",
      icon: UtensilsCrossed,
      iconBg: "bg-warning-100",
      iconColor: "text-warning-600",
      onClick: () => {}, // Navigate to menu page
    },
    {
      title: "Daily Report",
      description: "View today's analytics",
      icon: BarChart3,
      iconBg: "bg-success-100",
      iconColor: "text-success-600",
      onClick: () => {}, // Navigate to reports page
    },
  ];

  return (
    <>
      <TopBar
        title="Dashboard"
        description="Welcome back, manage your restaurant efficiently"
        onNewOrder={() => setIsOrderModalOpen(true)}
      />
      
      <div className="flex-1 overflow-auto p-6" data-testid="dashboard-content">
        <StatsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <ActiveOrders />
          </div>
          <div>
            <TableGrid />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Button
                key={action.title}
                onClick={action.onClick}
                className="neu-card p-6 rounded-2xl text-left hover:shadow-neu-lg transition-all group h-auto flex items-center space-x-4 border-0"
                data-testid={`quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`w-12 h-12 ${action.iconBg} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <Icon className={`${action.iconColor} text-xl`} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-elegant-800">{action.title}</h4>
                  <p className="text-elegant-500 text-sm">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </>
  );
}
