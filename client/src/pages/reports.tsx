import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TopBar from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar, 
  BarChart3,
  PieChart,
  Download,
  Filter
} from "lucide-react";

export default function Reports() {
  const [dateFilter, setDateFilter] = useState("today");
  const [staffFilter, setStaffFilter] = useState("all");

  const { data: stats } = useQuery({
    queryKey: ["/api/stats/daily"],
  });

  const reportCards = [
    {
      title: "Total Sales",
      value: "$1,248.50",
      change: "+12.5%",
      changeType: "increase",
      icon: DollarSign,
      iconBg: "bg-success-100",
      iconColor: "text-success-600",
    },
    {
      title: "Orders Completed",
      value: "127",
      change: "+8.2%",
      changeType: "increase",
      icon: BarChart3,
      iconBg: "bg-accent-100",
      iconColor: "text-accent-600",
    },
    {
      title: "Average Order Value",
      value: "$24.60",
      change: "-2.1%",
      changeType: "decrease",
      icon: TrendingUp,
      iconBg: "bg-warning-100",
      iconColor: "text-warning-600",
    },
    {
      title: "Staff Performance",
      value: "8.7/10",
      change: "+0.3",
      changeType: "increase",
      icon: Users,
      iconBg: "bg-accent-100",
      iconColor: "text-accent-600",
    },
  ];

  const topItems = [
    { name: "Gourmet Beef Burger", orders: 23, revenue: "$379.50" },
    { name: "Margherita Pizza", orders: 18, revenue: "$324.00" },
    { name: "Grilled Salmon", orders: 15, revenue: "$360.00" },
    { name: "Caesar Salad", orders: 12, revenue: "$150.00" },
    { name: "Chocolate Lava Cake", orders: 8, revenue: "$76.00" },
  ];

  const salesByHour = [
    { hour: "9AM", sales: 120 },
    { hour: "10AM", sales: 180 },
    { hour: "11AM", sales: 240 },
    { hour: "12PM", sales: 480 },
    { hour: "1PM", sales: 520 },
    { hour: "2PM", sales: 360 },
    { hour: "3PM", sales: 180 },
    { hour: "4PM", sales: 160 },
    { hour: "5PM", sales: 280 },
    { hour: "6PM", sales: 640 },
    { hour: "7PM", sales: 720 },
    { hour: "8PM", sales: 580 },
  ];

  return (
    <>
      <TopBar
        title="Reports & Analytics"
        description="View detailed sales reports and business insights"
      />
      
      <div className="flex-1 overflow-auto p-6" data-testid="reports-content">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-elegant-600" />
            <span className="text-elegant-700 font-medium">Filters:</span>
          </div>
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="neu-input border-0 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="neu-input border-0 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              <SelectItem value="sarah">Sarah Johnson</SelectItem>
              <SelectItem value="mike">Mike Chen</SelectItem>
              <SelectItem value="anna">Anna Rodriguez</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="neu-button border-0 px-4 py-2 rounded-xl text-elegant-700 font-medium"
            data-testid="button-export-report"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {reportCards.map((card) => {
            const Icon = card.icon;
            
            return (
              <Card key={card.title} className="neu-card p-6 rounded-2xl border-0" data-testid={`report-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-elegant-500 text-sm font-medium">{card.title}</p>
                    <p className="text-3xl font-bold text-elegant-800">{card.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`${card.iconColor} text-xl`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Badge 
                    className={`${
                      card.changeType === 'increase' ? 'bg-success-100 text-success-600' : 'bg-red-100 text-red-600'
                    } border-0 mr-2`}
                  >
                    {card.change}
                  </Badge>
                  <span className="text-elegant-500 text-sm">vs last period</span>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Chart */}
          <div className="lg:col-span-2">
            <Card className="neu-card p-6 rounded-2xl border-0 h-full">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-elegant-800">Sales by Hour</CardTitle>
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-accent-600" />
                    <span className="text-sm text-elegant-600">Hourly Breakdown</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="space-y-4">
                  {salesByHour.map((data) => (
                    <div key={data.hour} className="flex items-center">
                      <div className="w-16 text-sm text-elegant-600 font-medium">
                        {data.hour}
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="bg-elegant-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-accent-400 to-accent-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(data.sales / 720) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-16 text-right text-sm font-semibold text-elegant-800">
                        ${data.sales}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Items */}
          <div>
            <Card className="neu-card p-6 rounded-2xl border-0 h-full">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-xl font-bold text-elegant-800">Top Selling Items</CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div key={item.name} className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-elegant-200">
                      <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                        <span className="text-accent-600 font-bold text-sm">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-elegant-800 text-sm">{item.name}</p>
                        <p className="text-xs text-elegant-500">{item.orders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent-600 text-sm">{item.revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="mt-8">
          <Card className="neu-card p-6 rounded-2xl border-0">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-bold text-elegant-800">Staff Performance Today</CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: "Sarah Johnson", role: "Manager", orders: 45, tips: "$127.50", rating: 9.2 },
                  { name: "Mike Chen", role: "Server", orders: 38, tips: "$98.30", rating: 8.8 },
                  { name: "Anna Rodriguez", role: "Server", orders: 32, tips: "$89.20", rating: 8.5 },
                  { name: "James Wilson", role: "Server", orders: 28, tips: "$76.40", rating: 8.1 },
                ].map((staff) => (
                  <div key={staff.name} className="bg-white p-4 rounded-xl border border-elegant-200">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 text-accent-600" />
                      </div>
                      <h4 className="font-semibold text-elegant-800">{staff.name}</h4>
                      <p className="text-xs text-elegant-500 capitalize mb-3">{staff.role}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-elegant-600">Orders:</span>
                          <span className="font-semibold text-elegant-800">{staff.orders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-elegant-600">Tips:</span>
                          <span className="font-semibold text-success-600">{staff.tips}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-elegant-600">Rating:</span>
                          <Badge className="bg-accent-100 text-accent-600 border-0">
                            {staff.rating}/10
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}