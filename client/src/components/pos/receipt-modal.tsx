import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, Mail, Check, Utensils } from "lucide-react";
import type { OrderWithItems } from "@shared/schema";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: OrderWithItems | null;
}

export default function ReceiptModal({ isOpen, onClose, order }: ReceiptModalProps) {
  if (!order) return null;

  const receiptNumber = `R${new Date().getFullYear()}-${order.orderNumber.toString().padStart(6, '0')}`;
  const currentDate = new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="h-8 w-8 text-accent-600" />
            </div>
            <h2 className="text-2xl font-bold text-elegant-800">Elegant Restaurant</h2>
            <p className="text-elegant-500">Fine Dining Experience</p>
          </div>

          {/* Receipt Details */}
          <Card className="neu-input p-6 rounded-xl mb-6 border-0">
            <div className="text-center mb-4">
              <p className="text-sm text-elegant-500" data-testid="text-receipt-number">Receipt #{receiptNumber}</p>
              <p className="text-sm text-elegant-500" data-testid="text-receipt-table">
                {order.table ? `Table ${order.table.number}` : "Take Away"} • Server: {order.staff.name}
              </p>
              <p className="text-sm text-elegant-500" data-testid="text-receipt-date">
                {currentDate.toLocaleDateString()} • {currentDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>

            <div className="border-t border-elegant-200 pt-4">
              <div className="space-y-2 text-sm">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between" data-testid={`receipt-item-${item.menuItem.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <span>{item.quantity}× {item.menuItem.name}</span>
                    <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-elegant-200 pt-3 mt-4">
                <div className="flex justify-between text-sm text-elegant-600">
                  <span>Subtotal</span>
                  <span data-testid="text-receipt-subtotal">${order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-elegant-600">
                  <span>Tax (8.25%)</span>
                  <span data-testid="text-receipt-tax">${order.tax}</span>
                </div>
                <div className="flex justify-between text-sm text-elegant-600">
                  <span>Service Charge</span>
                  <span data-testid="text-receipt-service">${order.serviceCharge}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-elegant-800 mt-2 pt-2 border-t border-elegant-200">
                  <span>Total</span>
                  <span data-testid="text-receipt-total">${order.total}</span>
                </div>
              </div>

              <div className="text-center mt-4 pt-4 border-t border-elegant-200">
                <p className="text-xs text-elegant-500">Payment Method: {order.paymentMethod || "Credit Card"} ****4567</p>
                <p className="text-xs text-elegant-500">Status: {order.paymentStatus === "paid" ? "Paid" : "Pending"}</p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="neu-button py-3 rounded-xl text-elegant-700 font-medium border-0"
              data-testid="button-print-receipt"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              className="neu-button py-3 rounded-xl text-elegant-700 font-medium border-0"
              data-testid="button-email-receipt"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
          </div>

          <Button
            onClick={onClose}
            className="w-full mt-4 bg-accent-500 text-white py-3 rounded-xl font-medium hover:bg-accent-600 transition-colors"
            data-testid="button-done-receipt"
          >
            <Check className="mr-2 h-4 w-4" />
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
