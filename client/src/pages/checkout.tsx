import TopBar from "@/components/layout/topbar";

export default function Checkout() {
  return (
    <>
      <TopBar
        title="Checkout"
        description="Process payments and complete orders"
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="text-center py-20">
          <p className="text-elegant-500 text-lg">Checkout system coming soon...</p>
        </div>
      </div>
    </>
  );
}
