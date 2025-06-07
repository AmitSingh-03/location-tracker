import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Trash2, Eye, Loader2 } from "lucide-react";
import type { Location } from "@shared/schema";

interface LocationHistoryCardProps {
  locations: Location[];
  isLoading: boolean;
  onClearHistory: () => void;
  isClearing: boolean;
}

export default function LocationHistoryCard({
  locations,
  isLoading,
  onClearHistory,
  isClearing,
}: LocationHistoryCardProps) {
  const { toast } = useToast();

  // Mutation for deleting individual locations
  const deleteLocationMutation = useMutation({
    mutationFn: async (locationId: number) => {
      const response = await apiRequest("DELETE", `/api/locations/${locationId}`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch locations after successful deletion
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Location Deleted",
        description: "The location has been removed from your history.",
      });
    },
    onError: (error) => {
      console.error("Failed to delete location:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the location. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteLocation = (locationId: number) => {
    deleteLocationMutation.mutate(locationId);
  };

  const handleViewLocation = (location: Location) => {
    // In a real app, this could center the map on this location
    // For now, we'll just show a toast with the coordinates
    toast({
      title: "Location Details",
      description: `${location.name}: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
    });
  };

  const formatTimeAgo = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-surface rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-text-primary">Location History</h2>
            <p className="text-sm text-text-secondary">
              {isLoading ? "Loading..." : `${locations.length} locations saved`}
            </p>
          </div>
          {locations.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onClearHistory}
              disabled={isClearing}
              className="text-error hover:text-red-800"
            >
              {isClearing ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-1 h-3 w-3" />
                  Clear All
                </>
              )}
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-6 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Locations List */}
        {!isLoading && locations.length > 0 && (
          <div className="space-y-3">
            {locations.map((location) => (
              <div
                key={location.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="text-primary text-sm flex-shrink-0" />
                      <span className="text-sm font-medium text-text-primary">
                        {location.name}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {formatTimeAgo(location.timestamp)}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary font-mono space-y-1">
                      <div>
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </div>
                      {location.accuracy && (
                        <div className="text-text-secondary">
                          Accuracy: ±{Math.round(location.accuracy)} meters
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewLocation(location)}
                      className="text-primary hover:text-primary-dark p-1 h-auto"
                      title="View location details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLocation(location.id)}
                      disabled={deleteLocationMutation.isPending}
                      className="text-error hover:text-red-800 p-1 h-auto"
                      title="Delete location"
                    >
                      {deleteLocationMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && locations.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-medium text-text-secondary mb-1">
              No locations saved yet
            </h3>
            <p className="text-xs text-text-secondary">
              Get your current location and save it to see it here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
