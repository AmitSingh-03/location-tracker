// Geolocation utilities for getting device location
// This module wraps the browser's geolocation API in convenient async functions

/**
 * Options for geolocation requests
 * These control how the browser gets location data
 */
const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true, // Use GPS if available for better accuracy
  timeout: 10000, // Wait maximum 10 seconds for location
  maximumAge: 60000, // Use cached location if less than 1 minute old
};

/**
 * Get the current device location once
 * Returns a Promise that resolves with the position or rejects with an error
 * 
 * This is useful when you just want to get the location once, like when
 * the user clicks a "Get Location" button
 */
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    console.log("🔍 Requesting current position...");

    // Request current position from the browser
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("✅ Position received:", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy + " meters",
        });
        resolve(position);
      },
      (error) => {
        console.error("❌ Geolocation error:", error);
        
        // Convert GeolocationPositionError to more readable messages
        let errorMessage = "Unknown location error";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        
        reject(new Error(errorMessage));
      },
      GEOLOCATION_OPTIONS
    );
  });
}

/**
 * Watch the device location continuously
 * Returns a watch ID that can be used to stop watching later
 * 
 * This is useful for real-time location tracking, like in navigation apps
 * The callback function will be called every time the location changes
 */
export function watchPosition(
  onSuccess: (position: GeolocationPosition) => void,
  onError?: (error: GeolocationPositionError) => void
): number {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by this browser");
  }

  console.log("👀 Starting to watch position...");

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      console.log("📍 Position update:", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy + " meters",
        timestamp: new Date(position.timestamp).toLocaleTimeString(),
      });
      onSuccess(position);
    },
    (error) => {
      console.error("❌ Watch position error:", error);
      if (onError) onError(error);
    },
    GEOLOCATION_OPTIONS
  );

  return watchId;
}

/**
 * Stop watching the device location
 * Pass the watch ID returned from watchPosition()
 */
export function clearWatch(watchId: number): void {
  console.log("🛑 Stopping location watch:", watchId);
  navigator.geolocation.clearWatch(watchId);
}

/**
 * Check if geolocation is available in the current browser
 * Returns true if supported, false otherwise
 */
export function isGeolocationSupported(): boolean {
  return "geolocation" in navigator;
}

/**
 * Request permission for geolocation (if supported by browser)
 * Some browsers allow checking permissions before requesting location
 */
export async function checkGeolocationPermission(): Promise<PermissionState | null> {
  if (!navigator.permissions) {
    console.log("❓ Permissions API not supported");
    return null;
  }

  try {
    const permission = await navigator.permissions.query({ name: "geolocation" });
    console.log("🔒 Geolocation permission status:", permission.state);
    return permission.state;
  } catch (error) {
    console.error("❌ Error checking geolocation permission:", error);
    return null;
  }
}
