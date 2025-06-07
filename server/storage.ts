import { users, locations, type User, type InsertUser, type Location, type InsertLocation } from "@shared/schema";

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

export const storage = new MemStorage();
