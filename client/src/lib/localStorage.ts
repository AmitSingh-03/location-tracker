// Local storage utilities for persisting location data in the browser
// This allows users to keep their location history even after refreshing the page

import type { InsertLocation } from "@shared/schema";

// Key used to store location data in localStorage
const STORAGE_KEY = "location-tracker-history";

/**
 * Extended location type that includes a unique ID for local storage
 * This helps us manage locations stored locally vs on the server
 */
interface StoredLocation extends InsertLocation {
  id: string;
  timestamp: string; // Stored as ISO string for JSON compatibility
}

/**
 * Save a location to browser's localStorage
 * This provides offline functionality and immediate feedback to users
 * 
 * @param location - The location data to save
 */
export function saveLocationToLocalStorage(location: InsertLocation): void {
  try {
    // Get existing locations from storage
    const existingLocations = getLocationsFromLocalStorage();
    
    // Create new location with unique ID and timestamp
    const newLocation: StoredLocation = {
      ...location,
      id: generateUniqueId(),
      timestamp: new Date().toISOString(),
    };
    
    // Add new location to the beginning of the array (newest first)
    const updatedLocations = [newLocation, ...existingLocations];
    
    // Keep only the last 50 locations to prevent localStorage from getting too large
    const limitedLocations = updatedLocations.slice(0, 50);
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedLocations));
    
    console.log("💾 Location saved to localStorage:", newLocation);
  } catch (error) {
    console.error("❌ Failed to save location to localStorage:", error);
    // localStorage might be disabled or full, but we don't want to crash the app
  }
}

/**
 * Get all locations from localStorage
 * Returns an empty array if no locations are stored or if there's an error
 */
export function getLocationsFromLocalStorage(): StoredLocation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    
    const locations = JSON.parse(stored) as StoredLocation[];
    
    // Validate that we got an array
    if (!Array.isArray(locations)) {
      console.warn("⚠️ Invalid location data in localStorage, resetting");
      clearLocationsFromLocalStorage();
      return [];
    }
    
    console.log(`📚 Loaded ${locations.length} locations from localStorage`);
    return locations;
  } catch (error) {
    console.error("❌ Failed to load locations from localStorage:", error);
    return [];
  }
}

/**
 * Remove a specific location from localStorage by ID
 * 
 * @param id - The unique ID of the location to remove
 */
export function removeLocationFromLocalStorage(id: string): void {
  try {
    const locations = getLocationsFromLocalStorage();
    const filteredLocations = locations.filter(location => location.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLocations));
    console.log("🗑️ Location removed from localStorage:", id);
  } catch (error) {
    console.error("❌ Failed to remove location from localStorage:", error);
  }
}

/**
 * Clear all locations from localStorage
 * This is useful for the "Clear All" functionality
 */
export function clearLocationsFromLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("🧹 All locations cleared from localStorage");
  } catch (error) {
    console.error("❌ Failed to clear locations from localStorage:", error);
  }
}

/**
 * Get the count of locations stored locally
 * Useful for displaying statistics to the user
 */
export function getLocationCountFromLocalStorage(): number {
  return getLocationsFromLocalStorage().length;
}

/**
 * Generate a unique ID for local storage
 * Uses timestamp and random number to ensure uniqueness
 */
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if localStorage is available in the current browser
 * Some browsers or private browsing modes might disable localStorage
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = "localStorage-test";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.warn("⚠️ localStorage is not available:", error);
    return false;
  }
}

/**
 * Get the approximate size of data stored in localStorage for this app
 * Useful for debugging storage issues
 */
export function getStorageSize(): number {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? data.length : 0;
  } catch (error) {
    return 0;
  }
}
