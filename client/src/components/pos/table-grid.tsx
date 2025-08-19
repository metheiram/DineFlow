import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { Table } from "@shared/schema";

export default function TableGrid() {
  const queryClient = useQueryClient();
  
  const { data: tables, isLoading } = useQuery<Table[]>({
    queryKey: ["/api/tables"],
  });

  const updateTableMutation = useMutation({
    mutationFn: async ({ tableId, status }: { tableId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/tables/${tableId}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
    },
  });

  if (isLoading) {
    return (
      <Card className="neu-card p-6 rounded-2xl border-0 h-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-elegant-800">Table Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-elegant-200 p-3 rounded-xl animate-pulse h-16"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTableStyle = (status: string) => {
    switch (status) {
      case "occupied":
        return "table-occupied text-white";
      case "available":
        return "table-free text-success-800";
      case "reserved":
        return "table-reserved text-orange-800";
      case "cleaning":
        return "bg-elegant-300 text-elegant-700";
      default:
        return "bg-elegant-200 text-elegant-600";
    }
  };

  const getStatusText = (table: Table) => {
    switch (table.status) {
      case "occupied":
        return [`${table.seats} guests`, "45 min"]; // In production, get real data
      case "available":
        return ["Available", "Clean"];
      case "reserved":
        return ["Reserved", "2:30 PM"]; // In production, get real reservation time
      case "cleaning":
        return ["Cleaning", "5 min"];
      default:
        return ["Unknown", ""];
    }
  };

  const statusCounts = tables?.reduce((acc, table) => {
    acc[table.status] = (acc[table.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <Card className="neu-card p-6 rounded-2xl border-0 h-full">
      <CardHeader className="p-0 mb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-elegant-800">Table Status</CardTitle>
          <Button variant="link" className="text-accent-600 hover:text-accent-700 font-medium p-0">
            Manage
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {tables?.slice(0, 6).map((table) => {
            const [line1, line2] = getStatusText(table);
            
            return (
              <Button
                key={table.id}
                onClick={() => {
                  // Cycle through statuses for demo
                  const statuses = ["available", "occupied", "reserved", "cleaning"];
                  const currentIndex = statuses.indexOf(table.status);
                  const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                  updateTableMutation.mutate({ tableId: table.id, status: nextStatus });
                }}
                className={`${getTableStyle(table.status)} p-3 rounded-xl text-center transition-all hover:scale-105 cursor-pointer h-auto flex flex-col border-0`}
                disabled={updateTableMutation.isPending}
                data-testid={`table-${table.number}`}
              >
                <div className="font-bold mb-1">Table {table.number}</div>
                <div className="text-xs opacity-90">{line1}</div>
                <div className="text-xs opacity-75">{line2}</div>
              </Button>
            );
          })}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-elegant-600 text-sm">Occupied</span>
            </div>
            <span className="text-elegant-800 font-semibold">
              {statusCounts.occupied || 0} tables
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success-400 rounded-full"></div>
              <span className="text-elegant-600 text-sm">Available</span>
            </div>
            <span className="text-elegant-800 font-semibold">
              {statusCounts.available || 0} tables
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span className="text-elegant-600 text-sm">Reserved</span>
            </div>
            <span className="text-elegant-800 font-semibold">
              {statusCounts.reserved || 0} tables
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
