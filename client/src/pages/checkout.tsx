import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TopBar from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CheckoutModal from "@/components/pos/checkout-modal";
import ReceiptModal from "@/components/pos/receipt-modal";
import { apiRequest } from "@/lib/queryClient";
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Gift,
  Clock,
  User,
  Receipt,
  CheckCircle,
  AlertCircle,
  Search,
  Filter
} from "lucide-react";
import type { OrderWithItems } from "@shared/schema";

export default function Checkout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, paymentMethod, paymentStatus }: { 
      orderId: string; 
      paymentMethod: string; 
      paymentStatus: string; 
    }) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}`, { 
        paymentMethod, 
        paymentStatus,
        status: paymentStatus === "paid" ? "paid" : "served"
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
    },
  });

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = !searchTerm || 
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toString().includes(searchTerm) ||
      (order.table && order.table.number.toString().includes(searchTerm));
    
    const matchesStatus = statusFilter === "all" || order.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus && ["served", "ready"].includes(order.status);
  }) || [];

  const handleProcessPayment = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setShowCheckoutModal(true);
  };

  const handlePaymentComplete = () => {
    if (selectedOrder) {
      updateOrderMutation.mutate({
        orderId: selectedOrder.id,
        paymentMethod: "card",
        paymentStatus: "paid"
      });
      setShowCheckoutModal(false);
      setShowReceiptModal(true);
    }
  };

  const handleViewReceipt = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setShowReceiptModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-elegant-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success-100 text-success-600";
      case "pending":
        return "bg-warning-100 text-warning-600";
      default:
        return "bg-elegant-100 text-elegant-600";
    }
  };

  const paymentMethods = [
    { id: "card", name: "Credit Card", icon: CreditCard, color: "text-accent-600" },
    { id: "cash", name: "Cash", icon: Banknote, color: "text-success-600" },
    { id: "mobile", name: "Mobile Pay", icon: Smartphone, color: "text-purple-600" },
    { id: "gift_card", name: "Gift Card", icon: Gift, color: "text-warning-600" },
  ];

  if (isLoading) {
    return (
      <>
        <TopBar
          title="Checkout"
          description="Process payments and complete orders"
        />
        
        <div className="flex-1 overflow-auto p-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-elegant-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar
        title="Checkout"
        description="Process payments and complete orders"
      />
      
      <div className="flex-1 overflow-auto p-6" data-testid="checkout-content">
        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-elegant-400" />
              <Input
                placeholder="Search orders, tables, or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neu-input border-0 pl-10 w-80"
                data-testid="input-search-orders"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-elegant-600" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="neu-input border-0 w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending Payment</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment Method Quick Actions */}
          <div className="flex items-center space-x-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <Button
                  key={method.id}
                  variant="outline"
                  className="neu-button border-0 px-3 py-2"
                  data-testid={`quick-payment-${method.id}`}
                >
                  <Icon className={`h-4 w-4 ${method.color} mr-2`} />
                  <span className="text-elegant-700">{method.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="neu-card p-6 rounded-2xl border-0" data-testid={`checkout-order-${order.orderNumber}`}>
              <CardHeader className="p-0 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                      <span className="text-accent-600 font-bold">
                        {order.table ? `T${order.table.number}` : "TO"}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-elegant-800">
                        Order #{order.orderNumber}
                      </CardTitle>
                      <p className="text-elegant-500 text-sm">
                        {order.customerName || "Walk-in Customer"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(order.paymentStatus)}
                      <Badge className={`${getStatusColor(order.paymentStatus)} border-0 capitalize`}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-elegant-500">
                      {new Date(order.createdAt!).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-elegant-600">
                        {item.quantity}× {item.menuItem.name}
                      </span>
                      <span className="font-semibold text-elegant-800">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-elegant-500">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="border-t border-elegant-200 pt-4 mb-4">
                  <div className="flex justify-between text-sm text-elegant-600 mb-1">
                    <span>Subtotal</span>
                    <span>${order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-elegant-600 mb-1">
                    <span>Tax</span>
                    <span>${order.tax}</span>
                  </div>
                  <div className="flex justify-between text-sm text-elegant-600 mb-2">
                    <span>Service</span>
                    <span>${order.serviceCharge}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-elegant-800">
                    <span>Total</span>
                    <span>${order.total}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  {order.paymentStatus === "pending" ? (
                    <Button
                      onClick={() => handleProcessPayment(order)}
                      className="flex-1 bg-accent-500 text-white py-2 rounded-xl font-medium hover:bg-accent-600 transition-colors"
                      data-testid={`button-process-payment-${order.orderNumber}`}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Process Payment
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleViewReceipt(order)}
                      className="flex-1 bg-success-500 text-white py-2 rounded-xl font-medium hover:bg-success-600 transition-colors"
                      data-testid={`button-view-receipt-${order.orderNumber}`}
                    >
                      <Receipt className="mr-2 h-4 w-4" />
                      View Receipt
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    className="neu-button border-0 px-4 py-2 rounded-xl"
                    data-testid={`button-order-details-${order.orderNumber}`}
                  >
                    Details
                  </Button>
                </div>

                {/* Payment Method (if paid) */}
                {order.paymentStatus === "paid" && order.paymentMethod && (
                  <div className="mt-3 pt-3 border-t border-elegant-200">
                    <div className="flex items-center text-sm text-elegant-600">
                      <User className="h-4 w-4 mr-1" />
                      <span>Paid via {order.paymentMethod} • Server: {order.staff.name}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-elegant-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-elegant-600 mb-2">No orders ready for checkout</h3>
            <p className="text-elegant-500">Orders will appear here when they're ready for payment processing</p>
          </div>
        )}

        {/* Daily Summary */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-elegant-800 mb-6">Today's Payment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { 
                title: "Total Processed", 
                value: "$1,248.50", 
                icon: CreditCard, 
                color: "bg-accent-100 text-accent-600",
                orders: "42 orders"
              },
              { 
                title: "Cash Payments", 
                value: "$324.80", 
                icon: Banknote, 
                color: "bg-success-100 text-success-600",
                orders: "12 orders"
              },
              { 
                title: "Card Payments", 
                value: "$847.20", 
                icon: CreditCard, 
                color: "bg-accent-100 text-accent-600",
                orders: "28 orders"
              },
              { 
                title: "Pending", 
                value: "$76.50", 
                icon: Clock, 
                color: "bg-warning-100 text-warning-600",
                orders: "2 orders"
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="neu-card p-6 rounded-2xl border-0" data-testid={`payment-summary-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${stat.color.split(' ')[0]} rounded-xl flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${stat.color.split(' ')[1]} ${stat.color.split(' ')[2]}`} />
                    </div>
                    <div>
                      <p className="text-elegant-500 text-sm font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold text-elegant-800">{stat.value}</p>
                      <p className="text-xs text-elegant-500">{stat.orders}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        order={selectedOrder}
        onPaymentComplete={handlePaymentComplete}
      />

      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        order={selectedOrder}
      />
    </>
  );
}
