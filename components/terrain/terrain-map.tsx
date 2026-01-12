"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Map,
  Truck,
  Flame,
  Route,
  Loader2,
  Navigation,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Locate,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Position = {
  lat: number;
  lng: number;
};

type TerrainMapProps = {
  vehiclePosition: Position | null;
  incidentPosition: Position | null;
  vehicleLabel?: string;
  incidentAddress?: string | null;
};

// Simple map placeholder component (will be replaced with MapLibre when installed)
export function TerrainMap({
  vehiclePosition,
  incidentPosition,
  vehicleLabel,
  incidentAddress,
}: TerrainMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate route using OSRM
  const calculateRoute = async () => {
    if (!vehiclePosition || !incidentPosition) return;

    setIsCalculatingRoute(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${vehiclePosition.lng},${vehiclePosition.lat};${incidentPosition.lng},${incidentPosition.lat}?overview=false`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMin = Math.round(route.duration / 60);
        setRouteInfo({
          distance: `${distanceKm} km`,
          duration: `${durationMin} min`,
        });
      }
    } catch (err) {
      console.error("Error calculating route:", err);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Calculate route on mount if both positions are available
  useEffect(() => {
    if (vehiclePosition && incidentPosition) {
      calculateRoute();
    }
  }, [
    vehiclePosition?.lat,
    vehiclePosition?.lng,
    incidentPosition?.lat,
    incidentPosition?.lng,
  ]);

  // Open in Google Maps with directions
  const openNavigation = () => {
    if (!vehiclePosition || !incidentPosition) return;
    const url = `https://www.google.com/maps/dir/${vehiclePosition.lat},${vehiclePosition.lng}/${incidentPosition.lat},${incidentPosition.lng}`;
    window.open(url, "_blank");
  };

  // Center of the map (midpoint between vehicle and incident, or just one of them)
  const getCenter = () => {
    if (vehiclePosition && incidentPosition) {
      return {
        lat: (vehiclePosition.lat + incidentPosition.lat) / 2,
        lng: (vehiclePosition.lng + incidentPosition.lng) / 2,
      };
    }
    return vehiclePosition || incidentPosition || { lat: 45.75, lng: 4.85 }; // Default to Lyon
  };

  const center = getCenter();
  const hasPositions = vehiclePosition || incidentPosition;

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Carte & Itinéraire</CardTitle>
          </div>
          {routeInfo && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Route className="w-3 h-3" />
                {routeInfo.distance}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Navigation className="w-3 h-3" />
                {routeInfo.duration}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Map Container */}
        <div className="relative h-[300px] bg-muted">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : hasPositions ? (
            <>
              {/* Static map placeholder - will be replaced with MapLibre */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                {/* Grid pattern */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px",
                  }}
                />

                {/* Vehicle marker */}
                {vehiclePosition && (
                  <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping" />
                      <div className="relative w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      {vehicleLabel && (
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <Badge className="bg-blue-600 text-white text-xs">
                            {vehicleLabel}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Incident marker */}
                {incidentPosition && (
                  <div className="absolute top-2/3 right-1/3 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-orange-500/20 rounded-full animate-pulse" />
                      <div className="relative w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Flame className="w-5 h-5 text-white" />
                      </div>
                      {incidentAddress && (
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap max-w-[150px]">
                          <Badge className="bg-orange-600 text-white text-xs truncate">
                            Incident
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Route line (simplified) */}
                {vehiclePosition && incidentPosition && (
                  <svg className="absolute inset-0 pointer-events-none">
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
                      </marker>
                    </defs>
                    <line
                      x1="33%"
                      y1="33%"
                      x2="67%"
                      y2="67%"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeDasharray="8,4"
                      markerEnd="url(#arrowhead)"
                    />
                  </svg>
                )}

                {/* Map info overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                  <div className="text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded">
                    Carte simplifiée - Installez MapLibre pour la carte
                    interactive
                  </div>
                </div>
              </div>

              {/* Map controls */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <Button size="icon" variant="secondary" className="h-8 w-8">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8">
                  <Locate className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <AlertCircle className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">Aucune position disponible</p>
            </div>
          )}
        </div>

        {/* Navigation Button */}
        {vehiclePosition && incidentPosition && (
          <div className="p-3 border-t bg-muted/30">
            <Button className="w-full gap-2" onClick={openNavigation}>
              <Navigation className="w-4 h-4" />
              Lancer la navigation GPS
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
