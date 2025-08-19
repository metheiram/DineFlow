import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";

interface TopBarProps {
  title: string;
  description: string;
  onNewOrder?: () => void;
}

export default function TopBar({ title, description, onNewOrder }: TopBarProps) {
  return (
    <div className="bg-white border-b border-elegant-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-elegant-800">{title}</h2>
          <p className="text-elegant-500">{description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            className="neu-button border-0 px-6 py-3 rounded-xl text-elegant-700 font-medium hover:text-accent-600"
            data-testid="button-notifications"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          {onNewOrder && (
            <Button 
              onClick={onNewOrder}
              className="bg-accent-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-accent-600 transition-colors shadow-lg"
              data-testid="button-new-order"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
