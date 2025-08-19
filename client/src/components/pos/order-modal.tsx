import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { X, Plus, Minus, Trash2, Utensils, Save, Printer } from "lucide-react";
import type { MenuCategory, MenuItemWithCategory, Table } from "@shared/schema";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderItem {
  menuItemId: string;
  menuItem: MenuItemWithCategory;
  quantity: number;
  modifications?: string;
}

export default function OrderModal({ isOpen, onClose }: OrderModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const queryClient = useQueryClient();

  const { data: categories } = useQuery<MenuCategory[]>({
    queryKey: ["/api/menu/categories"],
    enabled: isOpen,
  });

  const { data: menuItems } = useQuery<MenuItemWithCategory[]>({
    queryKey: ["/api/menu/items"],
    enabled: isOpen,
  });

  const { data: tables } = useQuery<Table[]>({
    queryKey: ["/api/tables"],
    enabled: isOpen,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await apiRequest("POST", "/api/orders", orderData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
      handleClose();
    },
  });

  // Set default category when categories load
  useEffect(() => {
    if (categories?.length && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const handleClose = () => {
    setOrderItems([]);
    setSelectedTable("");
    setCustomerName("");
    setSearchTerm("");
    onClose();
  };

  const addToOrder = (menuItem: MenuItemWithCategory) => {
    const existingItem = orderItems.find(item => item.menuItemId === menuItem.id);
    
    if (existingItem) {
      setOrderItems(items =>
        items.map(item =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems(items => [
        ...items,
        {
          menuItemId: menuItem.id,
          menuItem,
          quantity: 1,
        }
      ]);
    }
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(menuItemId);
    } else {
      setOrderItems(items =>
        items.map(item =>
          item.menuItemId === menuItemId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const removeFromOrder = (menuItemId: string) => {
    setOrderItems(items => items.filter(item => item.menuItemId !== menuItemId));
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => 
      sum + (parseFloat(item.menuItem.price) * item.quantity), 0
    );
    const tax = subtotal * 0.0825; // 8.25%
    const serviceCharge = subtotal * 0.05; // 5%
    const total = subtotal + tax + serviceCharge;

    return { subtotal, tax, serviceCharge, total };
  };

  const handleSubmitOrder = () => {
    if (orderItems.length === 0) return;

    const orderData = {
      tableId: selectedTable || undefined,
      customerName: customerName || undefined,
      items: orderItems.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        modifications: item.modifications,
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  const filteredItems = menuItems?.filter(item => {
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && item.isAvailable;
  }) || [];

  const { subtotal, tax, serviceCharge, total } = calculateTotals();
  const availableTables = tables?.filter(t => t.status === "available") || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex h-full">
          {/* Categories Sidebar */}
          <div className="w-80 bg-elegant-50 border-r border-elegant-200 flex flex-col">
            <DialogHeader className="p-6 border-b border-elegant-200">
              <DialogTitle className="text-xl font-bold text-elegant-800">Menu Categories</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-auto p-4 space-y-2">
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neu-input border-0 mb-4"
                data-testid="input-search-menu"
              />
              
              {categories?.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full p-4 rounded-xl font-medium border-0 ${
                    selectedCategory === category.id
                      ? "bg-accent-500 text-white"
                      : "text-elegant-700 hover:bg-white transition-colors"
                  }`}
                  data-testid={`category-${category.name.toLowerCase()}`}
                >
                  <i className={`${category.icon} mr-2`}></i>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-elegant-200 flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-elegant-800">
                {categories?.find(c => c.id === selectedCategory)?.name || "Menu Items"}
              </DialogTitle>
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-elegant-500 hover:text-elegant-700"
                data-testid="button-close-order-modal"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="neu-card p-4 rounded-xl cursor-pointer hover:scale-105 transition-transform"
                    data-testid={`menu-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h4 className="font-bold text-elegant-800 mb-1">{item.name}</h4>
                    <p className="text-elegant-500 text-sm mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-accent-600">${item.price}</span>
                      <Button
                        onClick={() => addToOrder(item)}
                        className="neu-button px-4 py-2 rounded-lg text-accent-600 font-medium border-0"
                        data-testid={`button-add-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredItems.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-elegant-500">No items found</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-96 bg-elegant-50 border-l border-elegant-200 flex flex-col">
            <div className="p-6 border-b border-elegant-200">
              <div className="flex items-center justify-between mb-4">
                <DialogTitle className="text-xl font-bold text-elegant-800">Current Order</DialogTitle>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="neu-input border-0 w-32">
                    <SelectValue placeholder="Table" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Take Away</SelectItem>
                    {availableTables.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        Table {table.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Input
                placeholder="Customer name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="neu-input border-0"
                data-testid="input-customer-name"
              />
            </div>
            
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {orderItems.map((item) => (
                <div
                  key={item.menuItemId}
                  className="bg-white p-4 rounded-xl border border-elegant-200"
                  data-testid={`order-item-${item.menuItem.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-elegant-800">{item.menuItem.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromOrder(item.menuItemId)}
                      className="text-red-500 hover:text-red-700 p-1"
                      data-testid={`button-remove-${item.menuItem.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="neu-button w-8 h-8 rounded-lg flex items-center justify-center text-accent-600 font-bold border-0 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-medium text-elegant-800 w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="neu-button w-8 h-8 rounded-lg flex items-center justify-center text-accent-600 font-bold border-0 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="font-bold text-accent-600">
                      ${(parseFloat(item.menuItem.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  {item.modifications && (
                    <p className="text-xs text-elegant-500 mt-2">{item.modifications}</p>
                  )}
                </div>
              ))}
              
              {orderItems.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-elegant-500">No items added</p>
                </div>
              )}
            </div>
            
            {/* Order Totals */}
            {orderItems.length > 0 && (
              <div className="p-6 border-t border-elegant-200">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-elegant-600">
                    <span>Subtotal</span>
                    <span data-testid="text-subtotal">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-elegant-600">
                    <span>Tax (8.25%)</span>
                    <span data-testid="text-tax">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-elegant-600">
                    <span>Service Charge</span>
                    <span data-testid="text-service">${serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-elegant-200 pt-3">
                    <div className="flex justify-between text-xl font-bold text-elegant-800">
                      <span>Total</span>
                      <span data-testid="text-total">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={createOrderMutation.isPending}
                    className="w-full bg-accent-500 text-white py-4 rounded-xl font-semibold hover:bg-accent-600 transition-colors"
                    data-testid="button-send-to-kitchen"
                  >
                    {createOrderMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <Utensils className="mr-2 h-4 w-4" />
                        Send to Kitchen
                      </>
                    )}
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="neu-button py-3 rounded-xl text-elegant-700 font-medium border-0"
                      data-testid="button-save-order"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      className="neu-button py-3 rounded-xl text-elegant-700 font-medium border-0"
                      data-testid="button-print-order"
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
