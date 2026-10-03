/**
 * SVG presentation attributes do not resolve CSS variables, so Recharts needs
 * literal values. Keep in sync with the tokens in `app/globals.css`.
 */
export const chartPalette = {
  plum: "#3d2d2e",
  plumSoft: "#574243",
  popcorn: "#f8de8d",
  cerulean: "#9bb7d4",
  ceruleanSoft: "#c5d6e8",
  muted: "#7b6a66",
  line: "rgba(61, 45, 46, 0.10)",
  stroke: "rgba(61, 45, 46, 0.25)",
} as const;
