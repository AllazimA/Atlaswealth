// GLOBAL ASSET CLASS COLOR SYSTEM
// DO NOT MODIFY - Used consistently across all charts and reports

export const ASSET_COLORS = {
  // Equities / Stocks - Bloomberg Orange
  stocks: {
    hex: "#FF6F00",
    rgb: [255, 111, 0],
    name: "Equities"
  },
  
  // Fixed Income / Bonds - Muted Institutional Green
  bonds: {
    hex: "#22c55e",
    rgb: [34, 197, 94],
    name: "Fixed Income"
  },
  
  // ETFs - Professional Blue
  etfs: {
    hex: "#3b82f6",
    rgb: [59, 130, 246],
    name: "ETFs"
  },
  
  // Cash & Cash Equivalents - Deep Red
  cash: {
    hex: "#dc2626",
    rgb: [220, 38, 38],
    name: "Cash"
  },
  
  // Alternatives - Muted Purple
  alternatives: {
    hex: "#a855f7",
    rgb: [168, 85, 247],
    name: "Alternatives"
  }
};

// Get color by asset type key
export function getAssetColor(assetType) {
  const key = assetType?.toLowerCase();
  return ASSET_COLORS[key] || ASSET_COLORS.stocks;
}

// Get all colors as hex array for charts
export function getChartColors() {
  return [
    ASSET_COLORS.stocks.hex,
    ASSET_COLORS.bonds.hex,
    ASSET_COLORS.etfs.hex,
    ASSET_COLORS.cash.hex,
    ASSET_COLORS.alternatives.hex
  ];
}

// Get all colors as RGB array for PDFs
export function getPDFColors() {
  return [
    ASSET_COLORS.stocks.rgb,
    ASSET_COLORS.bonds.rgb,
    ASSET_COLORS.etfs.rgb,
    ASSET_COLORS.cash.rgb,
    ASSET_COLORS.alternatives.rgb
  ];
}

// Map asset type to color index
export function getColorForAsset(assetName) {
  const name = assetName?.toLowerCase();
  if (name?.includes('stock') || name?.includes('equit')) return ASSET_COLORS.stocks.hex;
  if (name?.includes('bond') || name?.includes('fixed')) return ASSET_COLORS.bonds.hex;
  if (name?.includes('etf')) return ASSET_COLORS.etfs.hex;
  if (name?.includes('cash')) return ASSET_COLORS.cash.hex;
  if (name?.includes('alternative')) return ASSET_COLORS.alternatives.hex;
  return ASSET_COLORS.stocks.hex;
}