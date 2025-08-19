import TopBar from "@/components/layout/topbar";
import TableGrid from "@/components/pos/table-grid";

export default function Tables() {
  return (
    <>
      <TopBar
        title="Table Management"
        description="Monitor and manage table status and reservations"
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <TableGrid />
        </div>
      </div>
    </>
  );
}
