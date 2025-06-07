import { users, locations, type User, type InsertUser, type Location, type InsertLocation } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface defining all CRUD operations needed for our app
export interface IStorage {
  // User operations (existing)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Location operations for tracking functionality
  getAllLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  deleteLocation(id: number): Promise<boolean>;
  clearAllLocations(): Promise<boolean>;
}

// In-memory storage implementation for learning purposes
// Note: In production, you'd use a real database
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private locations: Map<number, Location>;
  private currentUserId: number;
  private currentLocationId: number;

  constructor() {
    this.users = new Map();
    this.locations = new Map();
    this.currentUserId = 1;
    this.currentLocationId = 1;
  }

  // User methods (existing functionality)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Location tracking methods
  async getAllLocations(): Promise<Location[]> {
    // Return all locations sorted by timestamp (newest first)
    return Array.from(this.locations.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentLocationId++;
    const location: Location = {
      ...insertLocation,
      id,
      timestamp: new Date(),
      accuracy: insertLocation.accuracy ?? null,
    };
    this.locations.set(id, location);
    return location;
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }

  async clearAllLocations(): Promise<boolean> {
    this.locations.clear();
    return true;
  }
}

// Database storage implementation using PostgreSQL
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllLocations(): Promise<Location[]> {
    return await db.select().from(locations).orderBy(locations.timestamp);
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location || undefined;
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db
      .insert(locations)
      .values({
        ...insertLocation,
        accuracy: insertLocation.accuracy ?? null,
      })
      .returning();
    return location;
  }

  async deleteLocation(id: number): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async clearAllLocations(): Promise<boolean> {
    await db.delete(locations);
    return true;
  }
}

export const storage = new DatabaseStorage();
