import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, CreditCard, Banknote, Smartphone, Gift, ArrowLeft, Check } from "lucide-react";
import type { OrderWithItems } from "@shared/schema";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: OrderWithItems | null;
  onPaymentComplete?: () => void;
}

type PaymentMethod = "card" | "cash" | "mobile" | "gift_card";

export default function CheckoutModal({ isOpen, onClose, order, onPaymentComplete }: CheckoutModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: "card" as PaymentMethod,
      name: "Credit Card",
      icon: CreditCard,
      bgColor: "bg-accent-100",
      iconColor: "text-accent-600",
    },
    {
      id: "cash" as PaymentMethod,
      name: "Cash",
      icon: Banknote,
      bgColor: "bg-success-100",
      iconColor: "text-success-600",
    },
    {
      id: "mobile" as PaymentMethod,
      name: "Mobile Pay",
      icon: Smartphone,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      id: "gift_card" as PaymentMethod,
      name: "Gift Card",
      icon: Gift,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onPaymentComplete?.();
    onClose();
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between p-0 mb-8">
          <DialogTitle className="text-2xl font-bold text-elegant-800">Checkout</DialogTitle>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-elegant-500 hover:text-elegant-700"
            data-testid="button-close-checkout"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        {/* Payment Methods */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-elegant-800 mb-4">Payment Method</h3>
          <div className="grid grid-cols-2 gap-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedPaymentMethod === method.id;
              
              return (
                <Button
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`neu-card p-6 rounded-xl text-center hover:shadow-neu-md transition-all group h-auto flex flex-col border-0 ${
                    isSelected ? "ring-2 ring-accent-500" : ""
                  }`}
                  data-testid={`payment-method-${method.id}`}
                >
                  <Icon className={`${method.iconColor} text-3xl mb-3 group-hover:scale-110 transition-transform`} />
                  <p className="font-medium text-elegant-800">{method.name}</p>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <Card className="neu-card p-6 rounded-xl border-0 mb-8">
          <h3 className="text-lg font-semibold text-elegant-800 mb-4">
            Order Summary - {order.table ? `Table ${order.table.number}` : "Take Away"}
          </h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-elegant-600">
                <span>
                  {item.quantity}× {item.menuItem.name}
                </span>
                <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            
            <div className="border-t border-elegant-200 pt-3 mt-3">
              <div className="flex justify-between text-elegant-600">
                <span>Subtotal</span>
                <span data-testid="text-checkout-subtotal">${order.subtotal}</span>
              </div>
              <div className="flex justify-between text-elegant-600">
                <span>Tax (8.25%)</span>
                <span data-testid="text-checkout-tax">${order.tax}</span>
              </div>
              <div className="flex justify-between text-elegant-600">
                <span>Service Charge</span>
                <span data-testid="text-checkout-service">${order.serviceCharge}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-elegant-800 mt-2">
                <span>Total</span>
                <span data-testid="text-checkout-total">${order.total}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="neu-button py-4 rounded-xl text-elegant-700 font-semibold border-0"
            data-testid="button-back-to-order"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Order
          </Button>
          <Button
            onClick={handleProcessPayment}
            disabled={isProcessing}
            className="bg-success-500 text-white py-4 rounded-xl font-semibold hover:bg-success-600 transition-colors pulse-success"
            data-testid="button-process-payment"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Process Payment
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
