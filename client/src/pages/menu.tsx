import TopBar from "@/components/layout/topbar";

export default function Menu() {
  return (
    <>
      <TopBar
        title="Menu Management"
        description="Manage your restaurant's menu items and categories"
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="text-center py-20">
          <p className="text-elegant-500 text-lg">Menu management coming soon...</p>
        </div>
      </div>
    </>
  );
}
