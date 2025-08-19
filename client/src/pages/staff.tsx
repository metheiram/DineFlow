import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TopBar from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Search, 
  UserCog,
  Shield,
  Users,
  ChefHat,
  Coffee,
  Settings,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Star,
  Eye,
  EyeOff
} from "lucide-react";
import type { Staff } from "@shared/schema";

const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return Shield;
    case 'manager':
      return UserCog;
    case 'server':
      return Coffee;
    case 'kitchen':
      return ChefHat;
    default:
      return Users;
  }
};

const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return "bg-red-100 text-red-600";
    case 'manager':
      return "bg-accent-100 text-accent-600";
    case 'server':
      return "bg-success-100 text-success-600";
    case 'kitchen':
      return "bg-warning-100 text-warning-600";
    default:
      return "bg-elegant-100 text-elegant-600";
  }
};

export default function Staff() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: staff, isLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const toggleStaffStatusMutation = useMutation({
    mutationFn: async ({ staffId, isActive }: { staffId: string; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/staff/${staffId}`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
  });

  const filteredStaff = staff?.filter(member => {
    const matchesSearch = !searchTerm || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && member.isActive) ||
      (statusFilter === "inactive" && !member.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  // Mock performance data (in real app this would come from API)
  const getStaffPerformance = (staffId: string) => {
    const performances = {
      "1": { ordersToday: 45, totalSales: 1248.50, rating: 9.2, hoursWorked: 8.5 },
      "2": { ordersToday: 38, totalSales: 987.30, rating: 8.8, hoursWorked: 8.0 },
      "3": { ordersToday: 32, totalSales: 756.20, rating: 8.5, hoursWorked: 7.5 },
      "4": { ordersToday: 28, totalSales: 645.40, rating: 8.1, hoursWorked: 8.0 },
    };
    return performances[staffId as keyof typeof performances] || { ordersToday: 0, totalSales: 0, rating: 0, hoursWorked: 0 };
  };

  if (isLoading) {
    return (
      <>
        <TopBar
          title="Staff Management"
          description="Manage restaurant staff and permissions"
        />
        
        <div className="flex-1 overflow-auto p-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-elegant-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar
        title="Staff Management"
        description="Manage restaurant staff and permissions"
      />
      
      <div className="flex-1 overflow-auto p-6" data-testid="staff-content">
        {/* Search and Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-elegant-400" />
              <Input
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neu-input border-0 pl-10 w-80"
                data-testid="input-search-staff"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="neu-input border-0 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="server">Server</SelectItem>
                <SelectItem value="kitchen">Kitchen</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="neu-input border-0 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-accent-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-accent-600 transition-colors"
            data-testid="button-add-staff"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Staff Member
          </Button>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredStaff.map((member) => {
            const RoleIcon = getRoleIcon(member.role);
            const performance = getStaffPerformance(member.id);
            
            return (
              <Card key={member.id} className="neu-card p-6 rounded-2xl border-0" data-testid={`staff-card-${member.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardHeader className="p-0 mb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-accent-100 text-accent-600 text-lg font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-elegant-800">{member.name}</CardTitle>
                      <div className="flex items-center space-x-2 mb-2">
                        <RoleIcon className="h-4 w-4 text-elegant-500" />
                        <Badge className={`${getRoleColor(member.role)} border-0 capitalize`}>
                          {member.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-elegant-500">@{member.username}</p>
                    </div>
                    
                    <div className="text-right">
                      <Switch
                        checked={member.isActive}
                        onCheckedChange={(checked) => 
                          toggleStaffStatusMutation.mutate({ 
                            staffId: member.id, 
                            isActive: checked 
                          })
                        }
                        disabled={toggleStaffStatusMutation.isPending}
                        data-testid={`switch-active-${member.name.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                      <p className="text-xs text-elegant-500 mt-1">
                        {member.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Performance Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent-600">{performance.ordersToday}</p>
                      <p className="text-xs text-elegant-500">Orders Today</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success-600">${performance.totalSales.toFixed(0)}</p>
                      <p className="text-xs text-elegant-500">Sales Today</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="h-4 w-4 text-warning-500" />
                        <p className="text-lg font-bold text-elegant-800">{performance.rating}</p>
                      </div>
                      <p className="text-xs text-elegant-500">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-elegant-800">{performance.hoursWorked}h</p>
                      <p className="text-xs text-elegant-500">Hours Today</p>
                    </div>
                  </div>

                  {/* Login Info */}
                  <div className="bg-elegant-50 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-elegant-600">Last Login:</span>
                      <span className="font-medium text-elegant-800">
                        {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-elegant-600">Username:</span>
                      <span className="font-medium text-elegant-800">@{member.username}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 neu-button border-0 py-2 text-sm"
                      data-testid={`button-edit-${member.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 neu-button border-0 py-2 text-sm"
                      data-testid={`button-view-details-${member.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Details
                    </Button>
                  </div>

                  {/* Delete Button (only for non-admin roles) */}
                  {member.role !== 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 neu-button border-0 py-2 text-sm text-red-600 hover:bg-red-50"
                      data-testid={`button-delete-${member.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Staff
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-elegant-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-elegant-600 mb-2">No staff members found</h3>
            <p className="text-elegant-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Staff Overview */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-elegant-800 mb-6">Staff Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: "Total Staff", 
                value: staff?.length.toString() || "0", 
                icon: Users, 
                color: "bg-accent-100 text-accent-600",
                subtitle: `${staff?.filter(s => s.isActive).length || 0} active`
              },
              { 
                title: "Servers", 
                value: staff?.filter(s => s.role === 'server').length.toString() || "0", 
                icon: Coffee, 
                color: "bg-success-100 text-success-600",
                subtitle: "Front of house"
              },
              { 
                title: "Kitchen Staff", 
                value: staff?.filter(s => s.role === 'kitchen').length.toString() || "0", 
                icon: ChefHat, 
                color: "bg-warning-100 text-warning-600",
                subtitle: "Back of house"
              },
              { 
                title: "Management", 
                value: staff?.filter(s => ['admin', 'manager'].includes(s.role)).length.toString() || "0", 
                icon: Shield, 
                color: "bg-red-100 text-red-600",
                subtitle: "Admin & managers"
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="neu-card p-6 rounded-2xl border-0" data-testid={`staff-overview-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${stat.color.split(' ')[0]} rounded-xl flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${stat.color.split(' ')[1]} ${stat.color.split(' ')[2]}`} />
                    </div>
                    <div>
                      <p className="text-elegant-500 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-elegant-800">{stat.value}</p>
                      <p className="text-xs text-elegant-500">{stat.subtitle}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-elegant-800 mb-6">Today's Schedule</h3>
          <Card className="neu-card p-6 rounded-2xl border-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {staff?.filter(s => s.isActive).map((member) => {
                const RoleIcon = getRoleIcon(member.role);
                const performance = getStaffPerformance(member.id);
                
                return (
                  <div key={member.id} className="bg-white p-4 rounded-xl border border-elegant-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-accent-100 text-accent-600 text-sm">
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-elegant-800 text-sm">{member.name}</h4>
                        <div className="flex items-center space-x-1">
                          <RoleIcon className="h-3 w-3 text-elegant-500" />
                          <span className="text-xs text-elegant-500 capitalize">{member.role}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-elegant-600">Shift:</span>
                        <span className="text-elegant-800 font-medium">9:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-elegant-600">Hours:</span>
                        <span className="text-elegant-800 font-medium">{performance.hoursWorked}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-elegant-600">Status:</span>
                        <Badge className="bg-success-100 text-success-600 border-0 text-xs">
                          On Duty
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
