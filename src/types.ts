export type VisualStyle = 
  | "Minimalist" 
  | "Mosque Silhouette" 
  | "Abstract Geometric" 
  | "Calming Nature"
  | "Classic Medina Dome"
  | "Islamic Arabesque Pattern"
  | "Symmetrical Floral Mandalas"
  | "Celestial Moonlit Desert"
  | "Abstract Kaaba Silhouette";

export type OverlayColor = 
  | "slate" 
  | "emerald" 
  | "navy" 
  | "aubergine"
  | "crimson"
  | "amber"
  | "teal"
  | "forest"
  | "onyx";

export interface GraphicSettings {
  arabicText: string;
  englishText: string;
  referenceText: string;
  visualStyle: VisualStyle;
  overlayOpacity: number; // 0 to 1
  overlayColor: OverlayColor;
  showGoldBorders: boolean;
  borderStyle: "none" | "thin" | "double" | "ornate" | "thick" | "triple" | "dotted-bead" | "arch-dome" | "floral-corners";
  topDividerStyle: "none" | "star" | "crescent" | "divider";
  arabicFontSize: number;
  englishFontSize: number;
  refFontSize: number;
  watermarkText: string;
  logoScale: number; // multiplier for size scaling
  customBase64Image: string; // If fetched from Gemini
  proceduralArtMode: boolean; // True to generate gradient pattern locally instead of Gemini call
}

export const OVERLAY_COLORS: Record<OverlayColor, { name: string; hex: string; gradient: string }> = {
  slate: {
    name: "Midnight Slate (Cool Gray/Charcoal)",
    hex: "#0c0f14",
    gradient: "from-[#111827] to-[#030712]",
  },
  emerald: {
    name: "Sacred Emerald (Islamic Green)",
    hex: "#052216",
    gradient: "from-[#022c1d] to-[#01140d]",
  },
  navy: {
    name: "Celestial Navy (Deep Blue)",
    hex: "#041525",
    gradient: "from-[#0a1e36] to-[#020a13]",
  },
  aubergine: {
    name: "Royal Aubergine (Deep Plum)",
    hex: "#1d0e2c",
    gradient: "from-[#250d3c] to-[#0a0212]",
  },
  crimson: {
    name: "Royal Crimson (Deep Ruby Red)",
    hex: "#1a0307",
    gradient: "from-[#29080d] to-[#0a0102]",
  },
  amber: {
    name: "Spiritual Amber (Warm Gold/Ochre)",
    hex: "#1c1103",
    gradient: "from-[#2e1c05] to-[#0a0601]",
  },
  teal: {
    name: "Mystic Teal (Deep Ocean Blue-Green)",
    hex: "#011617",
    gradient: "from-[#022426] to-[#000809]",
  },
  forest: {
    name: "Sacred Olive (Ancient Forest Green)",
    hex: "#04150a",
    gradient: "from-[#082613] to-[#010803]",
  },
  onyx: {
    name: "Obsidian Onyx (Shadow Black/Gold)",
    hex: "#050505",
    gradient: "from-[#0d0d0d] to-[#000000]",
  },
};
