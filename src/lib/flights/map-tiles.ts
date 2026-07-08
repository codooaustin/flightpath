export const MAP_TILE_URLS = {
  light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
} as const;

export const MAP_ROUTE_COLORS = {
  light: "#0284c7",
  dark: "#38bdf8",
} as const;

export function getMapTileUrl(isDark: boolean) {
  return isDark ? MAP_TILE_URLS.dark : MAP_TILE_URLS.light;
}

export function getMapRouteColor(isDark: boolean) {
  return isDark ? MAP_ROUTE_COLORS.dark : MAP_ROUTE_COLORS.light;
}
