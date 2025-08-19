import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { MoreHorizontal } from "lucide-react";
import type { OrderWithItems } from "@shared/schema";

export default function ActiveOrders() {
  const queryClient = useQueryClient();
  
  const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders?active=true"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
    },
  });

  if (isLoading) {
    return (
      <Card className="neu-card p-6 rounded-2xl border-0 h-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-elegant-800">Active Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-elegant-200 animate-pulse">
                <div className="h-16 bg-elegant-100 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-orange-100 text-orange-600";
      case "ready":
        return "bg-success-100 text-success-600";
      case "served":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-elegant-100 text-elegant-600";
    }
  };

  const getTimeAgo = (date: string | Date) => {
    const now = new Date();
    const orderTime = new Date(date);
    const diffMs = now.getTime() - orderTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 min ago";
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1h ago";
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  return (
    <Card className="neu-card p-6 rounded-2xl border-0 h-full">
      <CardHeader className="p-0 mb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-elegant-800">Active Orders</CardTitle>
          <Button variant="link" className="text-accent-600 hover:text-accent-700 font-medium p-0">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-4">
          {orders?.map((order) => (
            <div
              key={order.id}
              className="bg-white p-4 rounded-xl border border-elegant-200 hover:border-accent-300 transition-all"
              data-testid={`order-${order.orderNumber}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                    <span className="text-accent-600 font-bold">
                      {order.table ? `T${order.table.number}` : "TO"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-elegant-800">
                      {order.customerName || `Order #${order.orderNumber}`}
                    </p>
                    <p className="text-sm text-elegant-500">
                      {new Date(order.createdAt!).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })} • {getTimeAgo(order.createdAt!)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getStatusColor(order.status)} border-0 capitalize`}>
                    {order.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-elegant-400 hover:text-elegant-600 p-1">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-elegant-600">
                  <span>{order.items.length}</span> items • 
                  <span className="font-semibold ml-1">${order.total}</span>
                </div>
                <div className="flex space-x-2">
                  {order.status === "preparing" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: "ready" })}
                      className="px-3 py-1 bg-success-100 text-success-600 text-xs font-medium rounded-lg hover:bg-success-200 transition-colors border-0"
                      disabled={updateStatusMutation.isPending}
                      data-testid={`button-ready-${order.orderNumber}`}
                    >
                      Mark Ready
                    </Button>
                  )}
                  {order.status === "ready" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: "served" })}
                      className="px-3 py-1 bg-accent-100 text-accent-600 text-xs font-medium rounded-lg hover:bg-accent-200 transition-colors border-0"
                      disabled={updateStatusMutation.isPending}
                      data-testid={`button-serve-${order.orderNumber}`}
                    >
                      Serve
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3 py-1 bg-elegant-100 text-elegant-600 text-xs font-medium rounded-lg hover:bg-elegant-200 transition-colors border-0"
                    data-testid={`button-details-${order.orderNumber}`}
                  >
                    Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {!orders?.length && (
            <div className="text-center py-8">
              <p className="text-elegant-500">No active orders</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
