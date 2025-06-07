import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLocationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for location tracking functionality
  // All routes are prefixed with /api for clear separation

  // GET /api/locations - Retrieve all saved locations
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // POST /api/locations - Save a new location
  app.post("/api/locations", async (req, res) => {
    try {
      // Validate the request body using our Zod schema
      const locationData = insertLocationSchema.parse(req.body);
      
      // Save to storage
      const newLocation = await storage.createLocation(locationData);
      
      res.status(201).json(newLocation);
    } catch (error) {
      console.error("Error creating location:", error);
      
      if (error instanceof z.ZodError) {
        // Send validation errors back to client
        res.status(400).json({ 
          message: "Invalid location data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to save location" });
      }
    }
  });

  // DELETE /api/locations/:id - Delete a specific location
  app.delete("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid location ID" });
      }

      const deleted = await storage.deleteLocation(id);
      
      if (deleted) {
        res.json({ message: "Location deleted successfully" });
      } else {
        res.status(404).json({ message: "Location not found" });
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // DELETE /api/locations - Clear all locations
  app.delete("/api/locations", async (req, res) => {
    try {
      await storage.clearAllLocations();
      res.json({ message: "All locations cleared successfully" });
    } catch (error) {
      console.error("Error clearing locations:", error);
      res.status(500).json({ message: "Failed to clear locations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
