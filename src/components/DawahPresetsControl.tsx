import React from "react";
import { DawahPreset, DAWAH_PRESETS } from "../data/dawahPresets";
import { Check } from "lucide-react";

interface DawahPresetsControlProps {
  onSelectPreset: (preset: DawahPreset) => void;
  selectedId: string | null;
}

export const DawahPresetsControl: React.FC<DawahPresetsControlProps> = ({
  onSelectPreset,
  selectedId,
}) => {
  const [activeCategory, setActiveCategory] = React.useState<"All" | "Quran" | "Hadith" | "Reflection">("All");

  const filteredPresets = DAWAH_PRESETS.filter(
    (p) => activeCategory === "All" || p.category === activeCategory
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

      <p className="text-xs text-natural-muted mb-4 font-sans leading-relaxed">
        Select a pre-formatted verse or Hadith to populate the designer. You can then edit or augment the text anyway you like.
      </p>

      {/* Categories filter tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-natural-light rounded-xl border border-gray-200/60">
        {(["All", "Quran", "Hadith", "Reflection"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            type="button"
            className={`flex-1 text-center py-1.5 px-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
              activeCategory === cat
                ? "bg-natural-primary text-white shadow-sm"
                : "text-natural-muted hover:text-natural-primary hover:bg-white/60"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Presets scrollable list */}
      <div className="space-y-3 max-h-[310px] overflow-y-auto pr-1 select-none custom-scrollbar">
        {filteredPresets.map((preset) => {
          const isSelected = selectedId === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`group relative text-left p-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "bg-natural-primary/5 border-natural-primary shadow-sm"
                  : "bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-natural-light/40"
              }`}
            >
              {/* Category tag */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${
                  preset.category === "Quran"
                    ? "bg-emerald-100 text-emerald-800"
                    : preset.category === "Hadith"
                    ? "bg-sky-100 text-sky-800"
                    : "bg-purple-100 text-purple-800"
                }`}>
                  {preset.category} — {preset.topic}
                </span>
                
                {isSelected && (
                  <Check className="h-4 w-4 text-white bg-natural-primary rounded-full p-0.5" />
                )}
              </div>

              {/* Arabic preview if available */}
              {preset.arabic && (
                <p className="text-right text-base font-amiri text-natural-dark mb-1.5 leading-relaxed dir-rtl truncate group-hover:text-natural-primary transition-colors">
                  {preset.arabic}
                </p>
              )}

              {/* English preview */}
              <p className="text-xs text-natural-muted italic line-clamp-2 leading-relaxed font-playfair group-hover:text-natural-dark">
                "{preset.text}"
              </p>

              {/* Reference */}
              <div className="mt-2 text-[10px] font-mono tracking-wider text-natural-muted uppercase flex items-center justify-between">
                <span>{preset.reference}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-natural-primary font-bold">
                  Load Preset →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

