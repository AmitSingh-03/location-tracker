import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getCurrentLocation, watchPosition, clearWatch } from "@/lib/geolocation";
import { saveLocationToLocalStorage, getLocationsFromLocalStorage } from "@/lib/localStorage";
import CurrentLocationCard from "@/components/current-location-card";
import LocationHistoryCard from "@/components/location-history-card";
import LocationMap from "@/components/location-map";
import { useToast } from "@/hooks/use-toast";
import { MapPin, GraduationCap } from "lucide-react";
import type { Location, InsertLocation } from "@shared/schema";

// Define the structure for our current location state
interface CurrentLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

// Define possible location status states
type LocationStatus = "idle" | "loading" | "active" | "error";

export default function LocationTracker() {
  // React hooks for managing component state
  // useState creates state variables that trigger re-renders when changed
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { toast } = useToast(); // For showing user notifications

  // Fetch saved locations from the server using React Query
  // This automatically handles loading states, caching, and re-fetching
  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ["/api/locations"],
    // queryFn is already configured in our queryClient setup
  });

  // Mutation for saving locations to the server
  // Mutations are used for data changes (POST, PUT, DELETE)
  const saveLocationMutation = useMutation({
    mutationFn: async (location: InsertLocation) => {
      const response = await apiRequest("POST", "/api/locations", location);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch locations after successful save
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Location Saved",
        description: "Your location has been saved successfully!",
      });
    },
    onError: (error) => {
      console.error("Failed to save location:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save location. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for clearing all locations
  const clearLocationsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/locations");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "History Cleared",
        description: "All locations have been removed.",
      });
    },
    onError: (error) => {
      console.error("Failed to clear locations:", error);
      toast({
        title: "Clear Failed",
        description: "Failed to clear location history.",
        variant: "destructive",
      });
    },
  });

  // Function to get current location once
  const handleGetCurrentLocation = async () => {
    setLocationStatus("loading");
    setErrorMessage("");

    try {
      console.log("🔍 Getting current location...");
      const position = await getCurrentLocation();
      
      const newLocation: CurrentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(),
      };

      setCurrentLocation(newLocation);
      setLocationStatus("active");
      
      // Also save to localStorage for persistence
      saveLocationToLocalStorage({
        name: `Location ${new Date().toLocaleTimeString()}`,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        accuracy: newLocation.accuracy,
      });

      console.log("📍 Location obtained:", newLocation);
      
      toast({
        title: "Location Found",
        description: "Successfully retrieved your current location!",
      });

    } catch (error) {
      console.error("❌ Geolocation error:", error);
      setLocationStatus("error");
      
      // Provide user-friendly error messages
      let message = "Unable to get your location.";
      if (error instanceof Error) {
        if (error.message.includes("denied")) {
          message = "Location access was denied. Please enable location services.";
        } else if (error.message.includes("unavailable")) {
          message = "Location services are unavailable on this device.";
        } else if (error.message.includes("timeout")) {
          message = "Location request timed out. Please try again.";
        }
      }
      
      setErrorMessage(message);
      toast({
        title: "Location Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  // Function to save the current location with a custom name
  const handleSaveLocation = async () => {
    if (!currentLocation) {
      toast({
        title: "No Location",
        description: "Please get your current location first.",
        variant: "destructive",
      });
      return;
    }

    const locationName = `Location ${new Date().toLocaleString()}`;
    
    const newLocation: InsertLocation = {
      name: locationName,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      accuracy: currentLocation.accuracy,
    };

    // Save to server via mutation
    saveLocationMutation.mutate(newLocation);
  };

  // Function to clear all saved locations
  const handleClearHistory = () => {
    clearLocationsMutation.mutate();
  };

  // Cleanup function to stop watching position when component unmounts
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Calculate status text for the header
  const getStatusText = () => {
    switch (locationStatus) {
      case "loading":
        return "Getting location...";
      case "active":
        return "Location found";
      case "error":
        return "Location error";
      default:
        return "Ready to track";
    }
  };

  // Get CSS class for status indicator
  const getStatusClass = () => {
    switch (locationStatus) {
      case "loading":
        return "location-status-indicator bg-yellow-500";
      case "active":
        return "location-status-indicator location-status-active";
      case "error":
        return "location-status-indicator location-status-error";
      default:
        return "location-status-indicator location-status-idle";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - App navigation and title */}
      <header className="bg-surface shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-medium text-text-primary">Location Tracker</h1>
                <p className="text-sm text-text-secondary">Learn React Development</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={getStatusClass()} />
                <span className="text-sm text-text-secondary">{getStatusText()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Current Location & Map */}
          <div className="space-y-6">
            {/* Current Location Card */}
            <CurrentLocationCard
              currentLocation={currentLocation}
              locationStatus={locationStatus}
              errorMessage={errorMessage}
              onGetLocation={handleGetCurrentLocation}
              onSaveLocation={handleSaveLocation}
              isSaving={saveLocationMutation.isPending}
            />

            {/* Map Display */}
            <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-text-primary mb-4">Map View</h2>
              <LocationMap 
                currentLocation={currentLocation}
                savedLocations={locations}
              />
            </div>
          </div>

          {/* Right Column: Location History & Tutorial */}
          <div className="space-y-6">
            {/* Location History */}
            <LocationHistoryCard
              locations={locations}
              isLoading={locationsLoading}
              onClearHistory={handleClearHistory}
              isClearing={clearLocationsMutation.isPending}
            />

            {/* Tutorial Card - Educational content for learning */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="text-white text-sm" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-2">Learning Tips</h3>
                  <div className="text-sm text-text-secondary space-y-2">
                    <p>• This app uses React hooks like <code className="bg-blue-100 px-1 rounded text-xs">useState</code> and <code className="bg-blue-100 px-1 rounded text-xs">useEffect</code></p>
                    <p>• Location data is stored both locally and on the server</p>
                    <p>• The geolocation API requires HTTPS in production</p>
                    <p>• Check the browser console for detailed logs and errors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-text-secondary mb-2">
              Built with React • Designed for Learning • Open Source Ready
            </p>
            <div className="flex justify-center space-x-4 text-xs text-text-secondary">
              <span>• Geolocation API</span>
              <span>• Local Storage</span>
              <span>• Responsive Design</span>
              <span>• Material Design</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
