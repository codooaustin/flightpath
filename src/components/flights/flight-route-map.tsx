"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
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
import { getMapRouteColor, getMapTileUrl } from "@/lib/flights/map-tiles";
import { MapAirportPopupContent } from "@/components/flights/map-airport-popup-content";
import "leaflet/dist/leaflet.css";

function createMarkerIcon(focused: boolean, isDark: boolean) {
  const size = focused ? 16 : 12;
  const anchor = size / 2;
  const borderColor = isDark ? "#e2e8f0" : "white";
  const focusRing = focused
    ? isDark
      ? ";box-shadow:0 0 0 3px rgba(56,189,248,.4)"
      : ";box-shadow:0 0 0 3px rgba(2,132,199,.35)"
    : "";

  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:#0284c7;border:2px solid ${borderColor};box-shadow:0 1px 4px rgba(0,0,0,.3)${focusRing}"></div>`,
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

function ScrollWheelZoomOnHover() {
  const map = useMap();

  useEffect(() => {
    map.scrollWheelZoom.disable();

    const container = map.getContainer();
    const enableZoom = () => map.scrollWheelZoom.enable();
    const disableZoom = () => map.scrollWheelZoom.disable();

    container.addEventListener("mouseenter", enableZoom);
    container.addEventListener("mouseleave", disableZoom);

    return () => {
      container.removeEventListener("mouseenter", enableZoom);
      container.removeEventListener("mouseleave", disableZoom);
      map.scrollWheelZoom.disable();
    };
  }, [map]);

  return null;
}

function AirportMarker({
  point,
  index,
  total,
  focused,
  isDark,
}: {
  point: FlightMapPoint;
  index: number;
  total: number;
  focused: boolean;
  isDark: boolean;
}) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (!focused) return;
    markerRef.current?.openPopup();
  }, [focused]);

  const icon = useMemo(
    () => createMarkerIcon(focused, isDark),
    [focused, isDark]
  );

  return (
    <Marker ref={markerRef} position={[point.lat, point.lng]} icon={icon}>
      <Popup className="flight-map-popup" minWidth={0} maxWidth={200}>
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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const tileUrl = getMapTileUrl(isDark);
  const routeColor = getMapRouteColor(isDark);

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
      className={`flight-route-map relative isolate z-0 overflow-hidden rounded-lg border ${className ?? ""}`}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={9}
        className={`${mapHeightClassName} w-full`}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <ScrollWheelZoomOnHover />
        <TileLayer key={tileUrl} url={tileUrl} />
        <FitBounds points={entry.points} enabled={!focusedPoint} />
        <FocusAirport point={focusedPoint} />
        <Polyline
          positions={positions}
          color={routeColor}
          weight={3}
          opacity={0.85}
        />
        {entry.points.map((point, index) => (
          <AirportMarker
            key={`${point.code}-${point.stop_type}-${point.lat}`}
            point={point}
            index={index}
            total={entry.points.length}
            focused={point.code === focusedAirport}
            isDark={isDark}
          />
        ))}
      </MapContainer>
    </div>
  );
}
