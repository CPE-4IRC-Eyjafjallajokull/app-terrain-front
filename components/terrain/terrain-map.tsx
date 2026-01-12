"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import MapGL, {
  Marker,
  Source,
  Layer,
  type MapRef,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Locate,
  AlertCircle,
} from "lucide-react";
import {
  MAP_STYLE_URL,
  LYON_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_MIN_ZOOM,
  MAP_MAX_ZOOM,
  LYON_BOUNDS,
} from "@/lib/map/config";

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

type RouteGeometry = {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  properties: Record<string, unknown>;
};

export function TerrainMap({
  vehiclePosition,
  incidentPosition,
  vehicleLabel,
  incidentAddress,
}: TerrainMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<RouteGeometry | null>(
    null,
  );
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const hasCalculatedRoute = useRef(false);

  // Calculate route using internal geo/route API
  const calculateRoute = useCallback(async () => {
    if (!vehiclePosition || !incidentPosition) return;

    setIsCalculatingRoute(true);
    try {
      const response = await fetch("/api/geo/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: {
            latitude: vehiclePosition.lat,
            longitude: vehiclePosition.lng,
          },
          to: {
            latitude: incidentPosition.lat,
            longitude: incidentPosition.lng,
          },
          snap_start: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Route calculation failed");
      }

      const data = await response.json();

      if (data) {
        // Extract distance and duration from response
        const distanceKm = data.distance_km
          ? data.distance_km.toFixed(1)
          : data.distance
            ? (data.distance / 1000).toFixed(1)
            : "?";
        const durationMin = data.duration_min
          ? Math.round(data.duration_min)
          : data.duration
            ? Math.round(data.duration / 60)
            : "?";

        setRouteInfo({
          distance: `${distanceKm} km`,
          duration: `${durationMin} min`,
        });

        // Set route geometry for display on map (GeoJSON LineString)
        if (data.geometry) {
          setRouteGeometry({
            type: "Feature",
            geometry: data.geometry,
            properties: {},
          });
        } else if (data.polyline) {
          // If API returns polyline coordinates array
          setRouteGeometry({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: data.polyline,
            },
            properties: {},
          });
        }
      }
    } catch (err) {
      console.error("Error calculating route:", err);
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [vehiclePosition, incidentPosition]);

  // Auto-calculate route ONCE when positions are available and map is loaded
  useEffect(() => {
    if (
      vehiclePosition &&
      incidentPosition &&
      isMapLoaded &&
      !hasCalculatedRoute.current
    ) {
      hasCalculatedRoute.current = true;
      calculateRoute();
    }
  }, [vehiclePosition, incidentPosition, isMapLoaded, calculateRoute]);

  // Fit bounds to show both markers
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    const map = mapRef.current.getMap();

    if (vehiclePosition && incidentPosition) {
      // Fit to both positions
      const bounds = new maplibregl.LngLatBounds(
        [vehiclePosition.lng, vehiclePosition.lat],
        [incidentPosition.lng, incidentPosition.lat],
      );
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 40, right: 40 },
        maxZoom: 15,
        duration: 800,
      });
    } else if (vehiclePosition) {
      map.easeTo({
        center: [vehiclePosition.lng, vehiclePosition.lat],
        zoom: 14,
        duration: 800,
      });
    } else if (incidentPosition) {
      map.easeTo({
        center: [incidentPosition.lng, incidentPosition.lat],
        zoom: 14,
        duration: 800,
      });
    }
  }, [vehiclePosition, incidentPosition, isMapLoaded]);

  // Open in Google Maps with directions
  const openNavigation = () => {
    if (!vehiclePosition || !incidentPosition) return;
    const url = `https://www.google.com/maps/dir/${vehiclePosition.lat},${vehiclePosition.lng}/${incidentPosition.lat},${incidentPosition.lng}`;
    window.open(url, "_blank");
  };

  // Center on vehicle
  const centerOnVehicle = () => {
    if (!mapRef.current || !vehiclePosition) return;
    mapRef.current.getMap().easeTo({
      center: [vehiclePosition.lng, vehiclePosition.lat],
      zoom: 15,
      duration: 500,
    });
  };

  const hasPositions = vehiclePosition || incidentPosition;

  // Initial view state
  const initialViewState = {
    latitude: vehiclePosition?.lat || incidentPosition?.lat || LYON_CENTER.lat,
    longitude: vehiclePosition?.lng || incidentPosition?.lng || LYON_CENTER.lng,
    zoom: MAP_DEFAULT_ZOOM,
  };

  return (
    <Card className="border-orange-200 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-lg">
              {incidentPosition ? "Carte & Itinéraire" : "Position du véhicule"}
            </CardTitle>
          </div>
          {routeInfo && (
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="gap-1 bg-orange-100 text-orange-700"
              >
                <Route className="w-3 h-3" />
                {routeInfo.distance}
              </Badge>
              <Badge
                variant="secondary"
                className="gap-1 bg-orange-100 text-orange-700"
              >
                <Navigation className="w-3 h-3" />
                {routeInfo.duration}
              </Badge>
            </div>
          )}
          {isCalculatingRoute && (
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Calcul...
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Map Container */}
        <div className="relative h-[300px]">
          {hasPositions ? (
            <>
              <MapGL
                ref={mapRef}
                mapLib={maplibregl}
                mapStyle={MAP_STYLE_URL}
                initialViewState={initialViewState}
                minZoom={MAP_MIN_ZOOM}
                maxZoom={MAP_MAX_ZOOM}
                maxBounds={LYON_BOUNDS}
                dragRotate={false}
                touchPitch={false}
                attributionControl={false}
                onLoad={() => setIsMapLoaded(true)}
                style={{ width: "100%", height: "100%" }}
              >
                {/* Route line */}
                {routeGeometry && (
                  <Source id="route" type="geojson" data={routeGeometry}>
                    <Layer
                      id="route-line-casing"
                      type="line"
                      paint={{
                        "line-color": "#ffffff",
                        "line-width": 8,
                        "line-opacity": 0.8,
                      }}
                    />
                    <Layer
                      id="route-line"
                      type="line"
                      paint={{
                        "line-color": "#f97316",
                        "line-width": 5,
                        "line-opacity": 0.9,
                      }}
                    />
                  </Source>
                )}

                {/* Vehicle Marker */}
                {vehiclePosition && (
                  <Marker
                    latitude={vehiclePosition.lat}
                    longitude={vehiclePosition.lng}
                    anchor="center"
                  >
                    <div
                      className="relative cursor-pointer"
                      data-map-interactive="true"
                    >
                      <div className="absolute -inset-3 bg-blue-500/30 rounded-full animate-ping" />
                      <div className="relative w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      {vehicleLabel && (
                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <Badge className="bg-blue-600 text-white text-xs shadow-md">
                            {vehicleLabel}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Marker>
                )}

                {/* Incident Marker */}
                {incidentPosition && (
                  <Marker
                    latitude={incidentPosition.lat}
                    longitude={incidentPosition.lng}
                    anchor="center"
                  >
                    <div
                      className="relative cursor-pointer"
                      data-map-interactive="true"
                    >
                      <div className="absolute -inset-3 bg-orange-500/30 rounded-full animate-pulse" />
                      <div className="relative w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Flame className="w-5 h-5 text-white" />
                      </div>
                      {incidentAddress && (
                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap max-w-[120px]">
                          <Badge className="bg-orange-600 text-white text-xs shadow-md truncate">
                            Incident
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Marker>
                )}
              </MapGL>

              {/* Map controls overlay */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {vehiclePosition && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 shadow-md"
                    onClick={centerOnVehicle}
                    title="Centrer sur le véhicule"
                  >
                    <Locate className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Loading overlay */}
              {!isMapLoaded && (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center text-muted-foreground">
              <AlertCircle className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">Aucune position disponible</p>
            </div>
          )}
        </div>

        {/* Navigation Button */}
        {vehiclePosition && incidentPosition && (
          <div className="p-3 border-t bg-muted/30">
            <Button
              className="w-full gap-2 bg-orange-600 hover:bg-orange-700"
              onClick={openNavigation}
            >
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
