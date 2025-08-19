import TopBar from "@/components/layout/topbar";
import ActiveOrders from "@/components/pos/active-orders";

export default function Orders() {
  return (
    <>
      <TopBar
        title="Orders"
        description="Manage and track all restaurant orders"
      />
      
      <div className="flex-1 overflow-auto p-6">
        <ActiveOrders />
      </div>
    </>
  );
}
