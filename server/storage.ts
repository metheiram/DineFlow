import { type Staff, type InsertStaff, type MenuCategory, type InsertMenuCategory, type MenuItem, type InsertMenuItem, type Table, type InsertTable, type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type OrderWithItems, type MenuItemWithCategory } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Staff methods
  getStaff(id: string): Promise<Staff | undefined>;
  getStaffByUsername(username: string): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  
  // Menu methods
  getMenuCategories(): Promise<MenuCategory[]>;
  createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory>;
  getMenuItems(): Promise<MenuItemWithCategory[]>;
  getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, item: Partial<MenuItem>): Promise<MenuItem | undefined>;
  
  // Table methods
  getTables(): Promise<Table[]>;
  getTable(id: string): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: string, table: Partial<Table>): Promise<Table | undefined>;
  
  // Order methods
  getOrders(): Promise<OrderWithItems[]>;
  getActiveOrders(): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems>;
  updateOrder(id: string, order: Partial<Order>): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Order items methods
  updateOrderItem(id: string, item: Partial<OrderItem>): Promise<OrderItem | undefined>;
  
  // Stats methods
  getDailyStats(): Promise<{
    dailySales: number;
    activeOrders: number;
    tableOccupancy: number;
    staffOnline: number;
  }>;
}

export class MemStorage implements IStorage {
  private staff: Map<string, Staff> = new Map();
  private menuCategories: Map<string, MenuCategory> = new Map();
  private menuItems: Map<string, MenuItem> = new Map();
  private tables: Map<string, Table> = new Map();
  private orders: Map<string, Order> = new Map();
  private orderItems: Map<string, OrderItem> = new Map();
  private orderCounter = 1000;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize staff
    const adminStaff: Staff = {
      id: randomUUID(),
      username: "admin",
      password: "admin123", // In production, this should be hashed
      name: "Sarah Johnson",
      role: "manager",
      isActive: true,
      createdAt: new Date(),
    };
    this.staff.set(adminStaff.id, adminStaff);

    // Initialize menu categories
    const categories = [
      { name: "Popular", icon: "fas fa-star", order: 0 },
      { name: "Appetizers", icon: "fas fa-bacon", order: 1 },
      { name: "Main Courses", icon: "fas fa-drumstick-bite", order: 2 },
      { name: "Pizza", icon: "fas fa-pizza-slice", order: 3 },
      { name: "Beverages", icon: "fas fa-glass-martini-alt", order: 4 },
      { name: "Desserts", icon: "fas fa-ice-cream", order: 5 },
    ];

    categories.forEach(cat => {
      const category: MenuCategory = {
        id: randomUUID(),
        ...cat,
        isActive: true,
      };
      this.menuCategories.set(category.id, category);
    });

    // Initialize menu items
    const categoryArray = Array.from(this.menuCategories.values());
    const popularCat = categoryArray.find(c => c.name === "Popular")!;
    const mainCat = categoryArray.find(c => c.name === "Main Courses")!;
    const appetizerCat = categoryArray.find(c => c.name === "Appetizers")!;
    const beverageCat = categoryArray.find(c => c.name === "Beverages")!;
    const dessertCat = categoryArray.find(c => c.name === "Desserts")!;

    const items = [
      {
        categoryId: popularCat.id,
        name: "Gourmet Beef Burger",
        description: "Angus beef patty with aged cheddar, lettuce, tomato",
        price: "16.50",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        preparationTime: 15,
        order: 0,
      },
      {
        categoryId: popularCat.id,
        name: "Margherita Pizza",
        description: "Fresh tomato sauce, mozzarella, basil leaves",
        price: "18.00",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        preparationTime: 20,
        order: 1,
      },
      {
        categoryId: appetizerCat.id,
        name: "Caesar Salad",
        description: "Crisp romaine, parmesan, croutons, caesar dressing",
        price: "12.50",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        preparationTime: 10,
        order: 0,
      },
      {
        categoryId: mainCat.id,
        name: "Grilled Salmon",
        description: "Atlantic salmon with herbs and lemon butter",
        price: "24.00",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        preparationTime: 25,
        order: 0,
      },
      {
        categoryId: dessertCat.id,
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with molten center, vanilla ice cream",
        price: "9.50",
        image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        preparationTime: 12,
        order: 0,
      },
      {
        categoryId: beverageCat.id,
        name: "Artisan Coffee",
        description: "Premium espresso blend with steamed milk",
        price: "4.50",
        image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        preparationTime: 5,
        order: 0,
      },
    ];

    items.forEach(item => {
      const menuItem: MenuItem = {
        id: randomUUID(),
        ...item,
        isAvailable: true,
      };
      this.menuItems.set(menuItem.id, menuItem);
    });

    // Initialize tables
    for (let i = 1; i <= 15; i++) {
      const table: Table = {
        id: randomUUID(),
        number: i,
        seats: i <= 5 ? 4 : i <= 10 ? 6 : 8,
        status: i <= 8 ? "occupied" : i <= 12 ? "available" : "reserved",
        x: (i - 1) % 5,
        y: Math.floor((i - 1) / 5),
      };
      this.tables.set(table.id, table);
    }

    // Initialize some sample orders
    this.createSampleOrders();
  }

  private createSampleOrders() {
    const staffArray = Array.from(this.staff.values());
    const tablesArray = Array.from(this.tables.values()).filter(t => t.status === "occupied");
    const menuItemsArray = Array.from(this.menuItems.values());

    // Create a few sample orders
    tablesArray.slice(0, 3).forEach((table, index) => {
      const order: Order = {
        id: randomUUID(),
        orderNumber: this.orderCounter++,
        tableId: table.id,
        staffId: staffArray[0].id,
        customerName: ["Smith Party", "Johnson Family", "Wilson Group"][index],
        status: ["preparing", "ready", "preparing"][index],
        subtotal: "45.50",
        tax: "3.75",
        serviceCharge: "2.25",
        total: "51.50",
        paymentStatus: "pending",
        createdAt: new Date(Date.now() - (index + 1) * 10 * 60 * 1000), // 10, 20, 30 minutes ago
        updatedAt: new Date(),
      };
      this.orders.set(order.id, order);

      // Add order items
      const selectedItems = menuItemsArray.slice(0, 2 + index);
      selectedItems.forEach(menuItem => {
        const orderItem: OrderItem = {
          id: randomUUID(),
          orderId: order.id,
          menuItemId: menuItem.id,
          quantity: 1,
          price: menuItem.price,
          status: order.status === "ready" ? "ready" : "preparing",
        };
        this.orderItems.set(orderItem.id, orderItem);
      });
    });
  }

  // Staff methods
  async getStaff(id: string): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async getStaffByUsername(username: string): Promise<Staff | undefined> {
    return Array.from(this.staff.values()).find(s => s.username === username);
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const staff: Staff = {
      ...insertStaff,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.staff.set(staff.id, staff);
    return staff;
  }

  // Menu methods
  async getMenuCategories(): Promise<MenuCategory[]> {
    return Array.from(this.menuCategories.values()).sort((a, b) => a.order - b.order);
  }

  async createMenuCategory(insertCategory: InsertMenuCategory): Promise<MenuCategory> {
    const category: MenuCategory = {
      ...insertCategory,
      id: randomUUID(),
    };
    this.menuCategories.set(category.id, category);
    return category;
  }

  async getMenuItems(): Promise<MenuItemWithCategory[]> {
    const items = Array.from(this.menuItems.values());
    const categories = Array.from(this.menuCategories.values());
    
    return items.map(item => ({
      ...item,
      category: categories.find(c => c.id === item.categoryId)!,
    })).sort((a, b) => a.order - b.order);
  }

  async getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values())
      .filter(item => item.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const item: MenuItem = {
      ...insertItem,
      id: randomUUID(),
    };
    this.menuItems.set(item.id, item);
    return item;
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const item = this.menuItems.get(id);
    if (!item) return undefined;
    
    const updated = { ...item, ...updates };
    this.menuItems.set(id, updated);
    return updated;
  }

  // Table methods
  async getTables(): Promise<Table[]> {
    return Array.from(this.tables.values()).sort((a, b) => a.number - b.number);
  }

  async getTable(id: string): Promise<Table | undefined> {
    return this.tables.get(id);
  }

  async createTable(insertTable: InsertTable): Promise<Table> {
    const table: Table = {
      ...insertTable,
      id: randomUUID(),
    };
    this.tables.set(table.id, table);
    return table;
  }

  async updateTable(id: string, updates: Partial<Table>): Promise<Table | undefined> {
    const table = this.tables.get(id);
    if (!table) return undefined;
    
    const updated = { ...table, ...updates };
    this.tables.set(id, updated);
    return updated;
  }

  // Order methods
  async getOrders(): Promise<OrderWithItems[]> {
    return this.buildOrdersWithItems(Array.from(this.orders.values()));
  }

  async getActiveOrders(): Promise<OrderWithItems[]> {
    const activeOrders = Array.from(this.orders.values())
      .filter(order => !["paid", "cancelled"].includes(order.status))
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
    
    return this.buildOrdersWithItems(activeOrders);
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const ordersWithItems = this.buildOrdersWithItems([order]);
    return ordersWithItems[0];
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const order: Order = {
      ...insertOrder,
      id: randomUUID(),
      orderNumber: this.orderCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(order.id, order);

    // Create order items
    for (const insertItem of items) {
      const orderItem: OrderItem = {
        ...insertItem,
        id: randomUUID(),
        orderId: order.id,
      };
      this.orderItems.set(orderItem.id, orderItem);
    }

    const ordersWithItems = this.buildOrdersWithItems([order]);
    return ordersWithItems[0];
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updated = { 
      ...order, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.orders.set(id, updated);
    return updated;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    return this.updateOrder(id, { status });
  }

  async updateOrderItem(id: string, updates: Partial<OrderItem>): Promise<OrderItem | undefined> {
    const item = this.orderItems.get(id);
    if (!item) return undefined;
    
    const updated = { ...item, ...updates };
    this.orderItems.set(id, updated);
    return updated;
  }

  async getDailyStats(): Promise<{
    dailySales: number;
    activeOrders: number;
    tableOccupancy: number;
    staffOnline: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = Array.from(this.orders.values())
      .filter(order => {
        const orderDate = new Date(order.createdAt!);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime() && order.paymentStatus === "paid";
      });

    const dailySales = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    
    const activeOrders = Array.from(this.orders.values())
      .filter(order => !["paid", "cancelled"].includes(order.status)).length;

    const tables = Array.from(this.tables.values());
    const occupiedTables = tables.filter(t => t.status === "occupied").length;
    const tableOccupancy = Math.round((occupiedTables / tables.length) * 100);

    const staffOnline = Array.from(this.staff.values())
      .filter(s => s.isActive).length;

    return {
      dailySales,
      activeOrders,
      tableOccupancy,
      staffOnline,
    };
  }

  private buildOrdersWithItems(orders: Order[]): OrderWithItems[] {
    return orders.map(order => {
      const items = Array.from(this.orderItems.values())
        .filter(item => item.orderId === order.id)
        .map(item => ({
          ...item,
          menuItem: this.menuItems.get(item.menuItemId)!,
        }));

      const table = order.tableId ? this.tables.get(order.tableId) : undefined;
      const staff = this.staff.get(order.staffId)!;

      return {
        ...order,
        items,
        table,
        staff,
      };
    });
  }
}

export const storage = new MemStorage();
