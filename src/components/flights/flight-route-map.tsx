"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { FlightMapEntry, FlightMapPoint } from "@/lib/flights/map-data";
import { getMapBounds } from "@/lib/flights/map-data";
import { MapAirportPopupContent } from "@/components/flights/map-airport-popup-content";
import "leaflet/dist/leaflet.css";

const markerIcon = L.divIcon({
  className: "",
  html: `<div style="width:12px;height:12px;border-radius:9999px;background:#0284c7;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function FitBounds({ points }: { points: FlightMapPoint[] }) {
  const map = useMap();
  const bounds = useMemo(() => getMapBounds(points), [points]);

  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 10 });
  }, [bounds, map]);

  return null;
}

interface FlightRouteMapProps {
  entry: FlightMapEntry | null;
  className?: string;
  mapHeightClassName?: string;
}

export function FlightRouteMap({
  entry,
  className,
  mapHeightClassName = "h-48",
}: FlightRouteMapProps) {
  if (!entry || entry.points.length === 0) {
    const message =
      entry && entry.unresolvedCodes.length > 0
        ? `Could not locate ${entry.unresolvedCodes.join(", ")} on the map. Check the airport codes and try again.`
        : "Add airport codes to a flight to see the route map.";

    return (
      <div
        className={`flex items-center justify-center rounded-lg border bg-muted/30 px-4 text-center text-sm text-muted-foreground ${mapHeightClassName} ${className ?? ""}`}
      >
        {message}
      </div>
    );
  }

  const center = entry.points[0];
  const positions = entry.points.map(
    (point) => [point.lat, point.lng] as [number, number]
  );

  return (
    <div
      className={`relative isolate z-0 overflow-hidden rounded-lg border ${className ?? ""}`}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={9}
        className={`${mapHeightClassName} w-full`}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds points={entry.points} />
        <Polyline positions={positions} color="#0284c7" weight={3} opacity={0.85} />
        {entry.points.map((point, index) => (
          <Marker
            key={`${point.code}-${point.stop_type}-${point.lat}`}
            position={[point.lat, point.lng]}
            icon={markerIcon}
          >
            <Popup
              className="flight-map-popup"
              minWidth={220}
              maxWidth={280}
            >
              <MapAirportPopupContent
                point={point}
                index={index}
                total={entry.points.length}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
