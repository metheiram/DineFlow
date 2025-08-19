import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, createOrderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const staff = await storage.getStaffByUsername(username);
      if (!staff || staff.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!staff.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }

      // In production, use proper session management
      res.json({ 
        success: true, 
        staff: { 
          id: staff.id, 
          name: staff.name, 
          role: staff.role,
          username: staff.username 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    res.json({ success: true });
  });

  // Stats routes
  app.get("/api/stats/daily", async (req, res) => {
    try {
      const stats = await storage.getDailyStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Menu routes
  app.get("/api/menu/categories", async (req, res) => {
    try {
      const categories = await storage.getMenuCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/menu/items", async (req, res) => {
    try {
      const { categoryId } = req.query;
      if (categoryId) {
        const items = await storage.getMenuItemsByCategory(categoryId as string);
        res.json(items);
      } else {
        const items = await storage.getMenuItems();
        res.json(items);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post("/api/menu/items", async (req, res) => {
    try {
      const item = await storage.createMenuItem(req.body);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Failed to create menu item" });
    }
  });

  app.patch("/api/menu/items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.updateMenuItem(id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Failed to update menu item" });
    }
  });

  // Table routes
  app.get("/api/tables", async (req, res) => {
    try {
      const tables = await storage.getTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tables" });
    }
  });

  app.patch("/api/tables/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const table = await storage.updateTable(id, req.body);
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      res.status(400).json({ message: "Failed to update table" });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const { active } = req.query;
      const orders = active === "true" 
        ? await storage.getActiveOrders()
        : await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { tableId, customerName, items } = createOrderSchema.parse(req.body);
      
      // Calculate totals
      const menuItems = await storage.getMenuItems();
      const subtotal = items.reduce((sum, item) => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        return sum + (menuItem ? parseFloat(menuItem.price) * item.quantity : 0);
      }, 0);

      const tax = subtotal * 0.0825; // 8.25% tax
      const serviceCharge = subtotal * 0.05; // 5% service charge
      const total = subtotal + tax + serviceCharge;

      const orderData = {
        tableId,
        customerName,
        staffId: "admin-staff-id", // In production, get from session
        status: "pending" as const,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        serviceCharge: serviceCharge.toFixed(2),
        total: total.toFixed(2),
        paymentStatus: "pending" as const,
      };

      const orderItems = items.map(item => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: menuItem ? menuItem.price : "0",
          modifications: item.modifications,
          status: "pending" as const,
        };
      });

      const order = await storage.createOrder(orderData, orderItems);
      
      // Update table status if table order
      if (tableId) {
        await storage.updateTable(tableId, { status: "occupied" });
      }

      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // If order is completed/paid, free up table
      if (status === "paid" && order.tableId) {
        await storage.updateTable(order.tableId, { status: "available" });
      }

      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Failed to update order status" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.updateOrder(id, req.body);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Failed to update order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
