import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TopBar from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Search, 
  Star,
  Clock,
  Edit,
  Trash2,
  Coffee,
  UtensilsCrossed,
  Cake,
  Wine,
  Salad
} from "lucide-react";
import type { MenuCategory, MenuItemWithCategory } from "@shared/schema";

const getCategoryIcon = (categoryName: string) => {
  switch (categoryName.toLowerCase()) {
    case 'appetizers':
      return Salad;
    case 'main courses':
    case 'popular':
      return UtensilsCrossed;
    case 'beverages':
      return Coffee;
    case 'desserts':
      return Cake;
    case 'pizza':
      return UtensilsCrossed;
    default:
      return UtensilsCrossed;
  }
};

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const queryClient = useQueryClient();

  const { data: categories, isLoading: categoriesLoading } = useQuery<MenuCategory[]>({
    queryKey: ["/api/menu/categories"],
  });

  const { data: menuItems, isLoading: itemsLoading } = useQuery<MenuItemWithCategory[]>({
    queryKey: ["/api/menu/items"],
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ itemId, isAvailable }: { itemId: string; isAvailable: boolean }) => {
      const res = await apiRequest("PATCH", `/api/menu/items/${itemId}`, { isAvailable });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu/items"] });
    },
  });

  // Set default category when categories load
  if (categories?.length && !selectedCategory) {
    setSelectedCategory(categories[0].id);
  }

  const filteredItems = menuItems?.filter(item => {
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  if (categoriesLoading || itemsLoading) {
    return (
      <>
        <TopBar
          title="Menu Management"
          description="Manage your restaurant's menu items and categories"
        />
        
        <div className="flex-1 overflow-auto p-6">
          <div className="animate-pulse">
            <div className="flex space-x-4 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 w-32 bg-elegant-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-80 bg-elegant-200 rounded-2xl"></div>
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
        title="Menu Management"
        description="Manage your restaurant's menu items and categories"
      />
      
      <div className="flex-1 overflow-auto p-6" data-testid="menu-content">
        {/* Search and Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-elegant-400" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neu-input border-0 pl-10 w-80"
                data-testid="input-search-menu-items"
              />
            </div>
          </div>
          
          <Button
            className="bg-accent-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-accent-600 transition-colors"
            data-testid="button-add-menu-item"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {categories?.map((category) => {
            const Icon = getCategoryIcon(category.name);
            const isActive = selectedCategory === category.id;
            
            return (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-accent-500 text-white shadow-neu-md"
                    : "neu-button text-elegant-700 hover:bg-accent-100 border-0"
                }`}
                data-testid={`category-tab-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.name}</span>
                <Badge className="bg-white/20 text-current border-0 ml-2">
                  {filteredItems.filter(item => item.categoryId === category.id).length}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="neu-card p-0 rounded-2xl border-0 overflow-hidden hover:scale-105 transition-transform" data-testid={`menu-item-card-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
              {/* Item Image */}
              {item.image && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className={`${
                      item.isAvailable ? 'bg-success-500 text-white' : 'bg-red-500 text-white'
                    } border-0`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  {selectedCategory === categories?.find(c => c.name === "Popular")?.id && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-warning-500 text-white border-0 flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-elegant-800 text-lg mb-1">{item.name}</h3>
                    <p className="text-elegant-500 text-sm line-clamp-2">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-accent-600">${item.price}</span>
                    {item.preparationTime && (
                      <div className="flex items-center text-elegant-500 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {item.preparationTime}min
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => toggleAvailabilityMutation.mutate({ 
                      itemId: item.id, 
                      isAvailable: !item.isAvailable 
                    })}
                    disabled={toggleAvailabilityMutation.isPending}
                    className={`flex-1 py-2 rounded-xl font-medium transition-colors ${
                      item.isAvailable
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-success-100 text-success-600 hover:bg-success-200"
                    }`}
                    data-testid={`button-toggle-availability-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.isAvailable ? 'Make Unavailable' : 'Make Available'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="neu-button border-0 p-2"
                    data-testid={`button-edit-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Edit className="h-4 w-4 text-elegant-600" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="neu-button border-0 p-2"
                    data-testid={`button-delete-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <UtensilsCrossed className="h-16 w-16 text-elegant-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-elegant-600 mb-2">No items found</h3>
            <p className="text-elegant-500">Try adjusting your search or select a different category</p>
          </div>
        )}

        {/* Category Statistics */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-elegant-800 mb-6">Category Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.map((category) => {
              const Icon = getCategoryIcon(category.name);
              const categoryItems = menuItems?.filter(item => item.categoryId === category.id) || [];
              const availableItems = categoryItems.filter(item => item.isAvailable).length;
              
              return (
                <Card key={category.id} className="neu-card p-6 rounded-2xl border-0" data-testid={`category-stats-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-accent-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-elegant-800">{category.name}</h4>
                      <p className="text-elegant-500 text-sm">
                        {availableItems} of {categoryItems.length} available
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-accent-600">{categoryItems.length}</p>
                      <p className="text-xs text-elegant-500">items</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
