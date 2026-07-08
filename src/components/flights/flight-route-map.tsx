"use client";

import { useEffect, useMemo, useRef } from "react";
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

function createMarkerIcon(focused: boolean) {
  const size = focused ? 16 : 12;
  const anchor = size / 2;

  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:#0284c7;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)${focused ? ";box-shadow:0 0 0 3px rgba(2,132,199,.35)" : ""}"></div>`,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
  });
}

function FitBounds({
  points,
  enabled,
}: {
  points: FlightMapPoint[];
  enabled: boolean;
}) {
  const map = useMap();
  const bounds = useMemo(() => getMapBounds(points), [points]);

  useEffect(() => {
    if (!enabled || !bounds) return;
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 10 });
  }, [bounds, enabled, map]);

  return null;
}

function FocusAirport({ point }: { point: FlightMapPoint | null }) {
  const map = useMap();

  useEffect(() => {
    if (!point) return;
    map.flyTo([point.lat, point.lng], 11, { duration: 0.45 });
  }, [map, point]);

  return null;
}

function AirportMarker({
  point,
  index,
  total,
  focused,
}: {
  point: FlightMapPoint;
  index: number;
  total: number;
  focused: boolean;
}) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (!focused) return;
    markerRef.current?.openPopup();
  }, [focused]);

  return (
    <Marker
      ref={markerRef}
      position={[point.lat, point.lng]}
      icon={createMarkerIcon(focused)}
    >
      <Popup className="flight-map-popup" minWidth={168} maxWidth={180}>
        <MapAirportPopupContent point={point} index={index} total={total} />
      </Popup>
    </Marker>
  );
}

interface FlightRouteMapProps {
  entry: FlightMapEntry | null;
  focusedAirport?: string | null;
  className?: string;
  mapHeightClassName?: string;
}

export function FlightRouteMap({
  entry,
  focusedAirport = null,
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
  const focusedPoint =
    focusedAirport != null
      ? (entry.points.find((point) => point.code === focusedAirport) ?? null)
      : null;

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
        <FitBounds points={entry.points} enabled={!focusedPoint} />
        <FocusAirport point={focusedPoint} />
        <Polyline positions={positions} color="#0284c7" weight={3} opacity={0.85} />
        {entry.points.map((point, index) => (
          <AirportMarker
            key={`${point.code}-${point.stop_type}-${point.lat}`}
            point={point}
            index={index}
            total={entry.points.length}
            focused={point.code === focusedAirport}
          />
        ))}
      </MapContainer>
    </div>
  );
}
