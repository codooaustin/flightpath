export const MAP_TILE_LAYERS = {
  light: [
    {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    },
  ],
  dark: [
    {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    },
    {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    },
  ],
} as const;

export const MAP_ROUTE_COLORS = {
  light: "#0284c7",
  dark: "#38bdf8",
} as const;

export function getMapTileLayers(isDark: boolean) {
  return isDark ? MAP_TILE_LAYERS.dark : MAP_TILE_LAYERS.light;
}

export function getMapRouteColor(isDark: boolean) {
  return isDark ? MAP_ROUTE_COLORS.dark : MAP_ROUTE_COLORS.light;
}
