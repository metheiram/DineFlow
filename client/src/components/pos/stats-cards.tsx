import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { DollarSign, ClipboardList, Armchair, Users, TrendingUp, Clock } from "lucide-react";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats/daily"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="neu-card p-6 rounded-2xl border-0 animate-pulse">
            <div className="h-20 bg-elegant-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Today's Sales",
      value: `$${stats?.dailySales?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      iconBg: "bg-success-100",
      iconColor: "text-success-600",
      trend: "+12.5%",
      trendText: "vs yesterday",
      trendIcon: TrendingUp,
      trendColor: "text-success-600",
    },
    {
      title: "Active Orders",
      value: stats?.activeOrders?.toString() || "0",
      icon: ClipboardList,
      iconBg: "bg-accent-100",
      iconColor: "text-accent-600",
      trend: "Avg wait: 12 min",
      trendIcon: Clock,
      trendColor: "text-elegant-500",
    },
    {
      title: "Table Occupancy",
      value: `${stats?.tableOccupancy || 0}%`,
      icon: Armchair,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      trend: "68 of 80 seats",
      trendIcon: Users,
      trendColor: "text-elegant-500",
    },
    {
      title: "Staff Online",
      value: stats?.staffOnline?.toString() || "0",
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: "All systems active",
      trendColor: "text-success-600",
      dot: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trendIcon;
        
        return (
          <Card key={stat.title} className="neu-card p-6 rounded-2xl border-0" data-testid={`stat-${stat.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-elegant-500 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-elegant-800">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                <Icon className={`${stat.iconColor} text-xl`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.dot && (
                <span className="w-2 h-2 bg-success-500 rounded-full mr-2"></span>
              )}
              {TrendIcon && (
                <TrendIcon className={`${stat.trendColor} text-sm mr-1`} />
              )}
              <span className={`${stat.trendColor} text-sm font-medium mr-1`}>
                {stat.trend}
              </span>
              {stat.trendText && (
                <span className="text-elegant-500 text-sm">{stat.trendText}</span>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
