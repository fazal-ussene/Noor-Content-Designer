import React, { useState, useEffect, useRef } from "react";
import { DawahCanvas } from "./components/DawahCanvas";
import { DawahPreset } from "./data/dawahPresets";
import { DawahPresetsControl } from "./components/DawahPresetsControl";
import { GraphicSettings, OVERLAY_COLORS, VisualStyle, OverlayColor } from "./types";
import {
  Download,
  Sliders,
  Feather,
  Check,
  Palette,
  Eye,
  EyeOff,
  Type,
  FileImage,
  AlertCircle,
  Copy,
  Plus,
  Compass,
  CornerDownRight,
  RefreshCw,
} from "lucide-react";

// Safe localStorage wrapper to prevent crashes in restricted sandbox preview iframes
const safeStorage = {
  getItem: (key: string): string => {
    try {
      return localStorage.getItem(key) || "";
    } catch {
      return "";
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write denied by browser sandbox:", e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage remove denied by browser sandbox:", e);
    }
  }
};

export default function App() {
  // Check if running inside Google AI Studio preview or dev container
  const isHostedInAistudio = typeof window !== "undefined" && (
    window.location.hostname.includes("run.app") ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) && window.location.protocol !== "file:";

  // --- 1. CONFIGURATION STATES ---
  // Active tab in settings
  const [activeTab, setActiveTab] = useState<"content" | "style" | "decor" | "brand">("content");

  // Selection tracking
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>("quran-sabr-1");

  // Global settings for the canvas card
  const [settings, setSettings] = useState<GraphicSettings>({
    arabicText: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    englishText: "Indeed, with hardship [will be] ease.",
    referenceText: "Surah Al-Sharh [94:6]",
    visualStyle: "Mosque Silhouette",
    overlayOpacity: 0.55,
    overlayColor: "emerald",
    showGoldBorders: true,
    borderStyle: "double",
    topDividerStyle: "star",
    arabicFontSize: 46,
    englishFontSize: 30,
    refFontSize: 18,
    watermarkText: "@nur_al_islam",
    logoScale: 1.0,
    customBase64Image: "", // starts empty -> renders beautiful gradient originally
    proceduralArtMode: true,
  });

  // Brand Logo state (stores local Image DataURL)
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string>("");

  // Loading and feedback states
  const [notification, setNotification] = useState<string | null>(null);

  // High-res preview data url (returned from canvas drawing on completeness)
  const [compiledDataUrl, setCompiledDataUrl] = useState<string>("");

  // Ref container to trigger redrawing manually if needed
  const redrawTriggerRef = useRef<(() => void) | null>(null);

  // Ref to track notification auto-clear to avoid timers overlap
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- 2. CONVENIENCE SIDE EFFECTS ---
  // Temporarily display notification alert safely
  const showNotification = (msg: string) => {
    setNotification(msg);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Clear timers on component unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  // --- 3. DOCK HANDLERS ---
  const handleSelectPreset = (preset: DawahPreset) => {
    setSelectedPresetId(preset.id);
    setSettings((prev) => ({
      ...prev,
      arabicText: preset.arabic || "",
      englishText: preset.text,
      referenceText: preset.reference,
    }));
    showNotification(`Imported preset on topic: ${preset.topic}`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showNotification("Please upload a valid image file (PNG/JPG logo).");
        return;
      }
      setLogoFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoUrl(reader.result as string);
        showNotification("Branding logo imported to canvas!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearLogo = () => {
    setLogoUrl(null);
    setLogoFileName("");
    showNotification("Branding logo removed from canvas.");
  };

  // Compile and trigger browser download
  const handleDownloadImage = () => {
    if (!compiledDataUrl) {
      showNotification("Canvas is still loading fonts and textures. Please wait a millisecond and retry.");
      return;
    }

    const link = document.createElement("a");
    // Generate clean file name based on topic or reference
    const cleanRef = settings.referenceText
      ? settings.referenceText.replace(/[^a-zA-Z0-9]/g, "_")
      : "Dawah_Post";
    
    link.download = `NurDesign_${cleanRef}_1080px.jpg`;
    link.href = compiledDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification("Downloaded high-quality 1080x1080px graphic successfully!");
  };

  const handleRandomizeAccents = () => {
    const colors: OverlayColor[] = ["slate", "emerald", "navy", "aubergine"];
    const styles: VisualStyle[] = ["Minimalist", "Mosque Silhouette", "Abstract Geometric", "Calming Nature"];
    const dividers = ["none", "star", "crescent", "divider"] as const;
    const borders = ["none", "thin", "double", "ornate", "thick", "triple", "dotted-bead", "arch-dome", "floral-corners"] as const;

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomDivider = dividers[Math.floor(Math.random() * dividers.length)];
    const randomBorder = borders[Math.floor(Math.random() * borders.length)];

    setSettings((prev) => ({
      ...prev,
      overlayColor: randomColor,
      visualStyle: randomStyle,
      topDividerStyle: randomDivider,
      borderStyle: randomBorder,
      overlayOpacity: parseFloat((Math.random() * 0.3 + 0.45).toFixed(2)), // between 0.45 and 0.75
    }));

    showNotification("Applied stylized aura accent combinations!");
  };

  return (
    <div className="relative min-h-screen bg-natural-bg text-natural-dark selection:bg-natural-primary selection:text-white overflow-x-hidden font-sans pb-16">
      
      {/* GLOBAL GLOWING HEADER ACCENT */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-natural-primary/5 via-natural-primary/2 to-transparent blur-3xl rounded-full pointer-events-none" />

      {/* Floating notifications */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-natural-primary/40 text-natural-dark font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 max-w-sm animate-fade-in text-xs">
          <span className="w-2 h-2 rounded-full bg-natural-primary animate-pulse" />
          {notification}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* TOP BRAND HERO BLOCK */}
        <header className="flex flex-col md:flex-row justify-between items-center py-6 mb-6 border-b border-gray-200 gap-4">
          <div className="text-center md:text-left">
            <h1 id="main-app-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-natural-primary font-cinzel flex items-center justify-center md:justify-start gap-3 select-none transition-all duration-300 hover:scale-[1.01] origin-left">
              <span className="w-9 h-9 bg-natural-primary text-white flex items-center justify-center rounded-xl shadow border border-natural-primary/10 shadow-md">
                ن
              </span>
              Noor Content Designer
            </h1>
            <p className="text-xs text-natural-muted mt-1.5 max-w-md font-sans leading-relaxed">
              Automate the composition of premium, high-contrast social media graphics for Islamic Dawah, optimized for Instagram, Facebook, and WhatsApp.
            </p>
          </div>


        </header>



        {/* MAIN DESIGN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-stretch items-start">
          
          {/* LEFT PANEL: Workspace Settings Dashboard (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col gap-6 h-full">
            
            {/* 1. Style Adjuster tabs */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex-1 flex flex-col justify-start">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
                <h3 className="text-sm font-bold tracking-wider text-natural-primary font-cinzel flex items-center gap-2">
                  <Sliders className="h-4 w-4" />
                  Designer Customizations
                </h3>
              </div>

              {/* Tab Selector buttons */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-natural-light rounded-xl border border-gray-200/60 mb-5">
                <button
                  type="button"
                  onClick={() => setActiveTab("content")}
                  className={`py-2 text-center rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    activeTab === "content" ? "bg-white text-natural-primary shadow-sm" : "text-natural-muted hover:text-natural-primary"
                  }`}
                >
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("style")}
                  className={`py-2 text-center rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    activeTab === "style" ? "bg-white text-natural-primary shadow-sm" : "text-natural-muted hover:text-natural-primary"
                  }`}
                >
                  Style
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("decor")}
                  className={`py-2 text-center rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    activeTab === "decor" ? "bg-white text-natural-primary shadow-sm" : "text-natural-muted hover:text-natural-primary"
                  }`}
                >
                  Ornaments
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("brand")}
                  className={`py-2 text-center rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    activeTab === "brand" ? "bg-white text-natural-primary shadow-sm" : "text-natural-muted hover:text-natural-primary"
                  }`}
                >
                  Branding
                </button>
              </div>

              {/* Tab 1: Typography Contents */}
              {activeTab === "content" && (
                <div id="settings-tab-content" className="space-y-4 animate-fade-in text-xs">
                  <div>
                    <label className="block text-natural-muted mb-1.5 font-bold flex items-center justify-between">
                      <span>Arabic Text Script (Optional)</span>
                    </label>
                    <textarea
                      id="input-arabic-text"
                      rows={2}
                      value={settings.arabicText}
                      onChange={(e) => setSettings({ ...settings, arabicText: e.target.value })}
                      placeholder="Insert Arabic text script (e.g. القرآن الكريم)..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-right font-amiri text-natural-dark focus:outline-none focus:border-natural-primary focus:ring-1 focus:ring-natural-primary/20"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-natural-muted mb-1.5 font-bold flex items-center justify-between">
                      <span>Quran Translation / Hadith / Quote</span>
                    </label>
                    <textarea
                      id="input-english-text"
                      rows={3}
                      value={settings.englishText}
                      onChange={(e) => setSettings({ ...settings, englishText: e.target.value })}
                      placeholder="Insert dawah translation or spiritual reflection text..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs leading-relaxed text-natural-dark focus:outline-none focus:border-natural-primary focus:ring-1 focus:ring-natural-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-natural-muted mb-1.5 font-bold">Reference Source Tag</label>
                      <input
                        id="input-reference-text"
                        type="text"
                        value={settings.referenceText}
                        onChange={(e) => setSettings({ ...settings, referenceText: e.target.value })}
                        placeholder="e.g. Sahih Muslim [2566]"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-natural-dark focus:outline-none focus:border-natural-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-natural-muted mb-1.5 font-bold flex justify-between">
                        <span>Source Font Size</span>
                        <span className="font-mono text-natural-primary font-bold">{settings.refFontSize}px</span>
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="28"
                        step="1"
                        value={settings.refFontSize}
                        onChange={(e) => setSettings({ ...settings, refFontSize: parseInt(e.target.value) })}
                        className="w-full accent-natural-primary bg-gray-100 h-1.5 rounded-lg appearance-none cursor-pointer mt-3"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-natural-muted mb-1.5 font-bold flex justify-between">
                        <span>Arabic Script Size</span>
                        <span className="font-mono text-natural-primary font-bold">{settings.arabicFontSize}px</span>
                      </label>
                      <input
                        type="range"
                        min="28"
                        max="64"
                        step="1"
                        value={settings.arabicFontSize}
                        onChange={(e) => setSettings({ ...settings, arabicFontSize: parseInt(e.target.value) })}
                        className="w-full accent-natural-primary bg-gray-100 h-1.5 rounded-lg appearance-none cursor-pointer mt-3"
                      />
                    </div>

                    <div>
                      <label className="block text-natural-muted mb-1.5 font-bold flex justify-between">
                        <span>English Script Size</span>
                        <span className="font-mono text-natural-primary font-bold">{settings.englishFontSize}px</span>
                      </label>
                      <input
                        type="range"
                        min="18"
                        max="48"
                        step="1"
                        value={settings.englishFontSize}
                        onChange={(e) => setSettings({ ...settings, englishFontSize: parseInt(e.target.value) })}
                        className="w-full accent-natural-primary bg-gray-100 h-1.5 rounded-lg appearance-none cursor-pointer mt-3"
                      />
                    </div>
                  </div>
                </div>
              )}


                     {/* Tab 2: Theme Aesthetics */}
              {activeTab === "style" && (
                <div id="settings-tab-style" className="space-y-4 animate-fade-in text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-natural-muted mb-1.5 font-bold">Aesthetic Visual Layout</label>
                      <select
                        id="select-visual-style"
                        value={settings.visualStyle}
                        onChange={(e) => setSettings({ ...settings, visualStyle: e.target.value as VisualStyle })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-natural-dark focus:outline-none focus:border-natural-primary cursor-pointer"
                      >
                        <option value="Minimalist">Minimalist Gold (Prisline)</option>
                        <option value="Mosque Silhouette">Mosque Silhouette Aura</option>
                        <option value="Abstract Geometric">Abstract Geometric Mandala</option>
                        <option value="Calming Nature">Calming Dunes & Night Sky</option>
                        <option value="Classic Medina Dome">Classic Medina Dome (Emerald / Gold)</option>
                        <option value="Islamic Arabesque Pattern">Islamic Arabesque Pattern (Geometric Grid)</option>
                        <option value="Symmetrical Floral Mandalas">Symmetrical Floral Mandalas (Floral Petals)</option>
                        <option value="Celestial Moonlit Desert">Celestial Moonlit Desert (Dunes & Crescent)</option>
                        <option value="Abstract Kaaba Silhouette">Abstract Kaaba Silhouette (Kiswa Gate)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-natural-muted mb-1.5 font-bold">Background Overlay Palette</label>
                      <select
                        id="select-overlay-color"
                        value={settings.overlayColor}
                        onChange={(e) => setSettings({ ...settings, overlayColor: e.target.value as OverlayColor })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-natural-dark focus:outline-none focus:border-natural-primary cursor-pointer"
                      >
                        {Object.entries(OVERLAY_COLORS).map(([key, item]) => (
                          <option key={key} value={key}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-natural-muted mb-1.5 font-bold flex justify-between">
                      <span>Overlay Contrast Darkening Layer</span>
                      <span className="font-mono text-natural-primary font-bold">{Math.round(settings.overlayOpacity * 100)}%</span>
                    </label>
                    <p className="text-[10px] text-gray-400 mb-2 font-sans font-medium">
                      Increasing overlay opacity guarantees high contrast for Quranic Arabic text against complex generative skies.
                    </p>
                    <input
                      type="range"
                      min="0.1"
                      max="0.95"
                      step="0.05"
                      value={settings.overlayOpacity}
                      onChange={(e) => setSettings({ ...settings, overlayOpacity: parseFloat(e.target.value) })}
                      className="w-full accent-natural-primary bg-gray-150 h-1.5 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Borders & Ornaments */}
              {activeTab === "decor" && (
                <div id="settings-tab-decor" className="space-y-4 animate-fade-in text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-natural-muted mb-1.5 font-bold">Gold Framing Style</label>
                      <select
                        value={settings.borderStyle}
                        onChange={(e) => setSettings({ ...settings, borderStyle: e.target.value as any })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-natural-dark focus:outline-none focus:border-natural-primary cursor-pointer"
                      >
                        <option value="none">No Gold Borders</option>
                        <option value="thin">Thin Single Line</option>
                        <option value="double">Fine Double Outline</option>
                        <option value="ornate">Ornate Royal Corners</option>
                        <option value="thick">Thick Premium Border</option>
                        <option value="triple">Triple Royal Outline</option>
                        <option value="dotted-bead">Dotted Gold Bead Accent</option>
                        <option value="arch-dome">Imperial Arch Dome</option>
                        <option value="floral-corners">Symmetrical Floral Corners</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-natural-muted mb-1.5 font-bold">Top Divider Emblem</label>
                      <select
                        value={settings.topDividerStyle}
                        onChange={(e) => setSettings({ ...settings, topDividerStyle: e.target.value as any })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-natural-dark focus:outline-none focus:border-natural-primary cursor-pointer"
                      >
                        <option value="none">No Top Divider</option>
                        <option value="star">Centered 8-Pointed Star</option>
                        <option value="crescent">Crescent Moon & Star</option>
                        <option value="divider">Classic Geometric Lines</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="font-bold text-natural-dark block text-xs font-cinzel">Render Metallic Gold Luster</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5 font-medium">
                        Displays high-end golden gradients representing traditional dawah script prints.
                      </span>
                    </div>
                    <label className="inline-flex relative items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.showGoldBorders}
                        onChange={(e) => setSettings({ ...settings, showGoldBorders: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-natural-primary peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 4: Branding Customizations */}
              {activeTab === "brand" && (
                <div id="settings-tab-brand" className="space-y-4 animate-fade-in text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-natural-muted mb-1.5 font-bold">Digital Logo Overlay File</label>
                      <div className="relative flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-natural-dark shadow-sm">
                        <span className="truncate max-w-[130px] font-mono select-all">
                          {logoFileName ? logoFileName : "No brand logo uploaded"}
                        </span>
                        
                        {logoUrl ? (
                          <button
                            type="button"
                            onClick={handleClearLogo}
                            className="text-rose-600 hover:text-rose-700 font-bold"
                          >
                            Remove
                          </button>
                        ) : (
                          <label className="text-natural-primary hover:text-natural-primary-hover font-bold cursor-pointer">
                            Browse Logo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-natural-muted mb-1.5 font-bold">Sign Watermark / Channel Handle</label>
                      <input
                        type="text"
                        value={settings.watermarkText}
                        onChange={(e) => setSettings({ ...settings, watermarkText: e.target.value })}
                        placeholder="e.g. @sabr_dawah"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-natural-dark focus:outline-none focus:border-natural-primary shadow-sm"
                      />
                    </div>
                  </div>

                  {logoUrl && (
                    <div>
                      <label className="block text-natural-muted mb-1.5 font-bold flex justify-between">
                        <span>Stamp Scaling Size Multiplier</span>
                        <span className="font-mono text-natural-primary font-bold">{settings.logoScale}x</span>
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={settings.logoScale}
                        onChange={(e) => setSettings({ ...settings, logoScale: parseFloat(e.target.value) })}
                        className="w-full accent-natural-primary bg-gray-150 h-1.5 rounded-lg appearance-none cursor-pointer mt-1"
                      />
                    </div>
                  )}

                  <div className="p-3 bg-natural-light border border-gray-200/50 rounded-xl">
                    <span className="text-natural-muted text-[10px] leading-relaxed block font-medium">
                      💡 <b>Pro Branding Tip:</b> Providing a transparent <b>PNG logo</b> places your digital watermark beautifully in the bottom right corner without any disturbing background frames!
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between gap-3 flex-wrap shadow-sm">
              <span className="text-[11px] text-natural-muted font-sans flex items-center gap-1.5 font-medium">
                <Compass className="h-4 w-4 text-natural-primary shrink-0" />
                Want visual aesthetic recommendations?
              </span>
              <button
                type="button"
                id="randomize-button"
                onClick={handleRandomizeAccents}
                className="px-3.5 py-1.5 bg-white hover:bg-gray-50 active:bg-gray-100 text-natural-primary rounded-lg text-xs font-bold tracking-wide border border-gray-200 hover:text-natural-primary-hover transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Palette className="h-3.5 w-3.5 text-natural-primary" />
                Randomize Aesthetics
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: Live Scaled Preview & Download (5 Columns) */}
          <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6 lg:max-w-xl lg:mx-auto xl:max-w-none w-full h-full">
            
            {/* Display DawahCanvas */}
            <div className="bg-[#fdfcf7] p-4 sm:p-6 rounded-2xl border border-gray-250 shadow-sm flex flex-col items-center justify-center flex-1">
              <DawahCanvas
                settings={settings}
                logoUrl={logoUrl}
                logoScale={settings.logoScale}
                onRedrawTrigger={(redrawKey) => {
                  redrawTriggerRef.current = redrawKey;
                }}
                onDrawComplete={(urlStr) => {
                  setCompiledDataUrl(urlStr);
                }}
              />
            </div>

            {/* Artwork Export & Download Actions */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col gap-3">
                <button
                  id="trigger-download-composite"
                  type="button"
                  onClick={handleDownloadImage}
                  className="w-full px-4 py-3 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold text-xs tracking-wide rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-700/10"
                >
                  <Download className="h-4 w-4" />
                  Download Final Post Artwork
                </button>
              </div>

              {isHostedInAistudio && (
                <div className="pt-3 border-t border-gray-100">
                  <h4 className="text-[11px] font-bold text-natural-primary uppercase tracking-wider mb-2">Publishing & Export Tools</h4>
                  <a
                    href="/api/download-singlefile"
                    download="noor-content-designer-singlefile.html"
                    className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-300/60 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-gray-600" />
                    Download Complete App (Single-File HTML)
                  </a>
                  <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                    Downloads a self-contained, fully-functional single HTML file version of Noor Content Designer. You can open it offline in any browser, or directly upload/publish it to **GitHub Pages**!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar Footer */}
      <footer className="mt-12 h-12 bg-[#5a5a40] text-white/80 px-4 sm:px-8 flex items-center justify-between text-[10px] uppercase tracking-widest rounded-t-xl select-none max-w-7xl mx-auto shadow-sm">
        <div className="flex gap-4 sm:gap-6">
          <span>Developed by: <span className="text-white font-bold">Fazal Ussene</span></span>
          <span className="hidden sm:inline">Format: <span className="text-white font-bold">JPG / 300DPI</span></span>
        </div>
        <div id="footer-copyright-text">
          © 2026 Islamic Social Media Design • Automated Graphic Engine v3.0
        </div>
      </footer>
    </div>
  );
}
