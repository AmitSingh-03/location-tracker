import { pgTable, text, serial, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for authentication (keep existing)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Location tracking table - stores saved location entries
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // User-friendly name for the location
  latitude: real("latitude").notNull(), // Geographic latitude coordinate
  longitude: real("longitude").notNull(), // Geographic longitude coordinate
  accuracy: real("accuracy"), // GPS accuracy in meters
  timestamp: timestamp("timestamp").notNull().defaultNow(), // When location was recorded
});

// Schema for inserting new locations (excludes auto-generated fields)
export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  timestamp: true,
});

// Schema for user registration/login
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// TypeScript types for our data structures
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
