import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Save, AlertTriangle } from "lucide-react";

// Define the structure for current location data
interface CurrentLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

// Define possible location status states
type LocationStatus = "idle" | "loading" | "active" | "error";

interface CurrentLocationCardProps {
  currentLocation: CurrentLocation | null;
  locationStatus: LocationStatus;
  errorMessage: string;
  onGetLocation: () => void;
  onSaveLocation: () => void;
  isSaving: boolean;
}

export default function CurrentLocationCard({
  currentLocation,
  locationStatus,
  errorMessage,
  onGetLocation,
  onSaveLocation,
  isSaving,
}: CurrentLocationCardProps) {
  return (
    <Card className="bg-surface rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-text-primary">Current Location</h2>
          <Button
            onClick={onGetLocation}
            disabled={locationStatus === "loading"}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            {locationStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Get Location
              </>
            )}
          </Button>
        </div>

        {/* Loading State */}
        {locationStatus === "loading" && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-text-secondary">Getting your location...</span>
          </div>
        )}

        {/* Location Data Display */}
        {currentLocation && locationStatus === "active" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Latitude
                </label>
                <div className="text-lg font-mono text-text-primary">
                  {currentLocation.latitude.toFixed(6)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Longitude
                </label>
                <div className="text-lg font-mono text-text-primary">
                  {currentLocation.longitude.toFixed(6)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Accuracy
                </label>
                <div className="text-sm text-text-primary">
                  ±{Math.round(currentLocation.accuracy)} meters
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Timestamp
                </label>
                <div className="text-sm text-text-primary">
                  {currentLocation.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Save Location Button */}
            <Button
              onClick={onSaveLocation}
              disabled={isSaving}
              className="w-full bg-secondary hover:bg-secondary-dark text-white mt-4"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save This Location
                </>
              )}
            </Button>
          </div>
        )}

        {/* Error State */}
        {locationStatus === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-error text-lg mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-error">Location Access Error</h3>
                <p className="text-sm text-red-600 mt-1">
                  {errorMessage || "Unable to access your location. Please check your browser settings."}
                </p>
                <div className="mt-3 text-xs text-red-600">
                  <p><strong>Troubleshooting tips:</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Make sure location services are enabled in your browser</li>
                    <li>Check that you're using HTTPS (required for geolocation)</li>
                    <li>Try refreshing the page and allowing location access</li>
                    <li>Disable any ad blockers that might interfere</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Idle State */}
        {locationStatus === "idle" && (
          <div className="text-center py-8">
            <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-medium text-text-secondary mb-1">
              Ready to Get Your Location
            </h3>
            <p className="text-xs text-text-secondary">
              Click "Get Location" to retrieve your current coordinates
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
