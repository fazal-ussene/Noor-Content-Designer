import React, { useRef, useEffect, useState } from "react";
import { GraphicSettings, OVERLAY_COLORS } from "../types";
import { Sliders, RefreshCw, FileImage } from "lucide-react";

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + " " + word;
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

interface DawahCanvasProps {
  settings: GraphicSettings;
  logoUrl: string | null;
  logoScale: number;
  onRedrawTrigger?: (redrawFn: () => void) => void;
  onDrawComplete?: (dataUrl: string) => void;
}

export const DawahCanvas: React.FC<DawahCanvasProps> = ({
  settings,
  logoUrl,
  logoScale,
  onRedrawTrigger,
  onDrawComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Monitor font loading to ensure Amiri and Playfair Display are pixel perfect
  useEffect(() => {
    let active = true;
    if (typeof document !== "undefined" && "fonts" in document && document.fonts && typeof document.fonts.ready !== "undefined") {
      document.fonts.ready
        .then(() => {
          if (active) setFontsLoaded(true);
        })
        .catch((err) => {
          console.warn("document.fonts.ready error, using fallback:", err);
          if (active) setFontsLoaded(true);
        });
    } else {
      const timer = setTimeout(() => {
        if (active) setFontsLoaded(true);
      }, 1200);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }
    return () => {
      active = false;
    };
  }, []);

  // Load BG Image when custom base64 string changes
  useEffect(() => {
    if (!settings.customBase64Image || settings.proceduralArtMode) {
      setBgImage(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setBgImage(img);
    };
    img.onerror = (e) => {
      console.warn("Could not load custom background image backdrop:", e);
      setBgImage(null);
    };
    img.src = settings.customBase64Image;
  }, [settings.customBase64Image, settings.proceduralArtMode]);

  // Load Logo Image when logo dataurl/file changes
  useEffect(() => {
    if (!logoUrl) {
      setLogoImage(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setLogoImage(img);
    };
    img.onerror = (e) => {
      console.warn("Could not load custom branding logo image:", e);
      setLogoImage(null);
    };
    img.src = logoUrl;
  }, [logoUrl]);

  const drawStarPattern = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    points: number = 8
  ) => {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? r : r * 0.45;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  const drawMosquePath = (ctx: CanvasRenderingContext2D) => {
    const bottom = 1080;
    
    // Draw glowing sunset aura
    const glow = ctx.createRadialGradient(540, 950, 50, 540, 950, 400);
    glow.addColorStop(0, "rgba(251, 191, 36, 0.25)"); // bright warm gold glow
    glow.addColorStop(0.5, "rgba(180, 83, 9, 0.05)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(540, 950, 400, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    // Deep silhouette fill
    ctx.fillStyle = "rgba(10, 15, 20, 0.98)";
    ctx.beginPath();
    ctx.moveTo(0, bottom);

    // Left base
    ctx.lineTo(150, bottom);
    ctx.lineTo(150, bottom - 40);
    ctx.lineTo(250, bottom - 40);
    ctx.lineTo(250, bottom);

    // Minaret Left Tower
    ctx.lineTo(340, bottom);
    ctx.lineTo(340, bottom - 320); // main shaft
    ctx.lineTo(330, bottom - 320);
    ctx.lineTo(330, bottom - 340); // balcony 1
    ctx.lineTo(350, bottom - 340);
    ctx.lineTo(340, bottom - 340);
    ctx.lineTo(340, bottom - 420); // upper tower
    ctx.lineTo(335, bottom - 425);
    ctx.lineTo(345, bottom - 425);
    // Minaret tip
    ctx.lineTo(340, bottom - 460);
    ctx.lineTo(340, bottom);

    // Center Dome Platform
    ctx.lineTo(400, bottom);
    ctx.lineTo(400, bottom - 80);
    ctx.lineTo(420, bottom - 100);
    ctx.lineTo(450, bottom - 100);
    ctx.lineTo(450, bottom - 120);
    ctx.lineTo(630, bottom - 120);
    ctx.lineTo(630, bottom - 100);
    ctx.lineTo(660, bottom - 100);
    ctx.lineTo(680, bottom - 80);
    ctx.lineTo(680, bottom);

    // Minaret Right Tower
    ctx.lineTo(740, bottom);
    ctx.lineTo(740, bottom - 320); // main shaft
    ctx.lineTo(730, bottom - 320);
    ctx.lineTo(730, bottom - 340); // balcony 1
    ctx.lineTo(750, bottom - 340);
    ctx.lineTo(740, bottom - 340);
    ctx.lineTo(740, bottom - 420); // upper tower
    ctx.lineTo(735, bottom - 425);
    ctx.lineTo(745, bottom - 425);
    // Minaret tip
    ctx.lineTo(740, bottom - 460);
    ctx.lineTo(740, bottom);

    // Right base
    ctx.lineTo(830, bottom);
    ctx.lineTo(830, bottom - 40);
    ctx.lineTo(930, bottom - 40);
    ctx.lineTo(930, bottom);
    ctx.lineTo(1080, bottom);

    // Add Main Dome curve in the center
    // Centered at cx=540
    // Dome base width from x=450 to x=630 (width = 180)
    // Left springing point (450, bottom - 120)
    // Right springing point (630, bottom - 120)
    // Dome top height is around bottom - 270 (height = 150)
    ctx.moveTo(450, bottom - 120);
    // Draw architectural onion dome curve using cubic beziers
    ctx.bezierCurveTo(430, bottom - 220, 480, bottom - 290, 540, bottom - 290);
    ctx.bezierCurveTo(600, bottom - 290, 650, bottom - 220, 630, bottom - 120);
    ctx.closePath();
    ctx.fill();

    // Draw tiny spire gold star & crescent at minarets/dome
    ctx.restore();

    // Spire on main dome top
    const goldGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
    goldGrad.addColorStop(0, "#BF953F");
    goldGrad.addColorStop(0.5, "#FCF6BA");
    goldGrad.addColorStop(1, "#AA771C");
    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.rect(538, bottom - 330, 4, 40);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(540, bottom - 335, 6, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Define gold metallic gradient globally within current render sequence
    const goldGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
    goldGrad.addColorStop(0, "#bf953f");
    goldGrad.addColorStop(0.25, "#fcf6ba");
    goldGrad.addColorStop(0.5, "#b38728");
    goldGrad.addColorStop(0.75, "#fbf5b7");
    goldGrad.addColorStop(1, "#aa771c");

    // 1. CLEAR CANVAS
    ctx.clearRect(0, 0, 1080, 1080);

    // 2. DRAW BASE BACKGROUND
    // We choose the primary color based on settings
    const overlayConfig = OVERLAY_COLORS[settings.overlayColor];

    if (bgImage && !settings.proceduralArtMode) {
      // Draw background image scaling to cover 1:1 ratio
      const cWidth = 1080;
      const cHeight = 1080;
      const imgRatio = bgImage.width / bgImage.height;
      let dx = 0, dy = 0, dw = cWidth, dh = cHeight;

      if (imgRatio > 1) {
        // wider than high
        dw = cHeight * imgRatio;
        dx = (cWidth - dw) / 2;
      } else {
        // taller than wide
        dh = cWidth / imgRatio;
        dy = (cHeight - dh) / 2;
      }
      ctx.drawImage(bgImage, dx, dy, dw, dh);
    } else {
      // Procedural Background: Beautiful Linear & Radial Gradients
      const baseGradient = ctx.createLinearGradient(0, 0, 1080, 1080);
      if (settings.overlayColor === "emerald") {
        baseGradient.addColorStop(0, "#011c11");
        baseGradient.addColorStop(0.5, "#022c1d");
        baseGradient.addColorStop(1, "#000603");
      } else if (settings.overlayColor === "navy") {
        baseGradient.addColorStop(0, "#020f1d");
        baseGradient.addColorStop(0.5, "#10253e");
        baseGradient.addColorStop(1, "#01060d");
      } else if (settings.overlayColor === "aubergine") {
        baseGradient.addColorStop(0, "#12051f");
        baseGradient.addColorStop(0.5, "#250d3a");
        baseGradient.addColorStop(1, "#05010a");
      } else if (settings.overlayColor === "crimson") {
        baseGradient.addColorStop(0, "#1c0205");
        baseGradient.addColorStop(0.5, "#30040a");
        baseGradient.addColorStop(1, "#050001");
      } else if (settings.overlayColor === "amber") {
        baseGradient.addColorStop(0, "#1c0e01");
        baseGradient.addColorStop(0.5, "#301a02");
        baseGradient.addColorStop(1, "#050200");
      } else if (settings.overlayColor === "teal") {
        baseGradient.addColorStop(0, "#011c1d");
        baseGradient.addColorStop(0.5, "#022e30");
        baseGradient.addColorStop(1, "#000708");
      } else if (settings.overlayColor === "forest") {
        baseGradient.addColorStop(0, "#021c0b");
        baseGradient.addColorStop(0.5, "#032e13");
        baseGradient.addColorStop(1, "#000702");
      } else if (settings.overlayColor === "onyx") {
        baseGradient.addColorStop(0, "#0a0a0a");
        baseGradient.addColorStop(0.5, "#151515");
        baseGradient.addColorStop(1, "#000000");
      } else {
        // Slate / charcoal
        baseGradient.addColorStop(0, "#111827");
        baseGradient.addColorStop(0.5, "#1e293b");
        baseGradient.addColorStop(1, "#030712");
      }
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, 1080, 1080);

      // Add elegant radial lighting highlight from center
      const radialGrad = ctx.createRadialGradient(540, 540, 50, 540, 540, 600);
      radialGrad.addColorStop(0, "rgba(255, 255, 255, 0.05)");
      radialGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, 1080, 1080);
    }

    // 3. APPLY SHADING OVERLAY FOR LEGIBILITY
    ctx.fillStyle = overlayConfig.hex;
    ctx.globalAlpha = settings.overlayOpacity;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.globalAlpha = 1.0; // Reset alpha

    // 4. DRAW PROCEDURAL VISUAL ACCENTS based on style
    if (settings.visualStyle === "Abstract Geometric" || settings.proceduralArtMode) {
      ctx.save();
      ctx.strokeStyle = "rgba(251, 191, 36, 0.04)"; // delicate gold watermark outline
      ctx.lineWidth = 1;
      
      // Draw Concentric Sacred Geometries in the center background
      for (let r = 150; r <= 600; r += 150) {
        ctx.beginPath();
        ctx.arc(540, 540, r, 0, Math.PI * 2);
        ctx.stroke();

        // Overlay star shapes
        ctx.save();
        ctx.strokeStyle = "rgba(251, 191, 36, 0.03)";
        drawStarPattern(ctx, 540, 540, r + 40, 8);
        ctx.stroke();
        drawStarPattern(ctx, 540, 540, r + 40, 12);
        ctx.stroke();
        ctx.restore();
      }

      // Corner geometric triangles
      ctx.strokeStyle = "rgba(251, 191, 36, 0.06)";
      ctx.beginPath();
      ctx.moveTo(100, 150);
      ctx.lineTo(150, 100);
      ctx.moveTo(980, 150);
      ctx.lineTo(930, 100);
      ctx.moveTo(100, 930);
      ctx.lineTo(150, 980);
      ctx.stroke();
      ctx.restore();
    }

    if (settings.visualStyle === "Calming Nature") {
      ctx.save();
      // Starry sky accents on background if procedural
      if (settings.proceduralArtMode) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        // Spawn stable pseudo-random star field based on simple seeding
        let seed = 42;
        const random = () => {
          const x = Math.sin(seed++) * 10000;
          return x - Math.floor(x);
        };
        for (let i = 0; i < 60; i++) {
          const sx = random() * 1080;
          const sy = random() * 450; // top half star field
          const size = random() * 2.5 + 0.5;
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    if (settings.visualStyle === "Mosque Silhouette") {
      drawMosquePath(ctx);
    }

    if (settings.visualStyle === "Classic Medina Dome") {
      ctx.save();
      const cx = 540;
      const cy = 940;
      
      // Medina Green Dome fill
      ctx.fillStyle = "rgba(4, 120, 87, 0.4)";
      ctx.strokeStyle = goldGrad;
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      ctx.moveTo(cx - 130, cy);
      ctx.bezierCurveTo(cx - 150, cy - 120, cx - 80, cy - 200, cx, cy - 200);
      ctx.bezierCurveTo(cx + 80, cy - 200, cx + 150, cy - 120, cx + 130, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Dome spire finial
      ctx.beginPath();
      ctx.moveTo(cx, cy - 200);
      ctx.lineTo(cx, cy - 250);
      ctx.stroke();

      // Golden spheres on spire
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.arc(cx, cy - 215, 6, 0, Math.PI * 2);
      ctx.arc(cx, cy - 230, 4, 0, Math.PI * 2);
      ctx.arc(cx, cy - 242, 3, 0, Math.PI * 2);
      ctx.fill();

      // High-Contrast Moorish Sanctuary Arch border framing
      ctx.strokeStyle = "rgba(251, 191, 36, 0.15)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(120, 980);
      ctx.lineTo(120, 400);
      ctx.bezierCurveTo(120, 240, 340, 180, 540, 180);
      ctx.bezierCurveTo(740, 180, 960, 240, 960, 400);
      ctx.lineTo(960, 980);
      ctx.stroke();

      ctx.restore();
    }

    if (settings.visualStyle === "Islamic Arabesque Pattern") {
      ctx.save();
      ctx.strokeStyle = "rgba(251, 191, 36, 0.05)";
      ctx.lineWidth = 1;
      const cellSize = 135;
      for (let x = cellSize / 2; x < 1080; x += cellSize) {
        for (let y = cellSize / 2; y < 1080; y += cellSize) {
          drawStarPattern(ctx, x, y, 40, 8);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(x, y, 20, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    if (settings.visualStyle === "Symmetrical Floral Mandalas") {
      ctx.save();
      ctx.translate(540, 540);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.06)";
      ctx.lineWidth = 1.2;
      
      const petals = 12;
      for (let i = 0; i < petals; i++) {
        ctx.rotate((Math.PI * 2) / petals);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-60, -120, 0, -250);
        ctx.quadraticCurveTo(60, -120, 0, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -180);
        ctx.stroke();

        ctx.fillStyle = "rgba(251, 191, 36, 0.03)";
        ctx.beginPath();
        ctx.arc(0, -200, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      
      ctx.lineWidth = 1;
      for (let r = 50; r <= 150; r += 50) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (settings.visualStyle === "Celestial Moonlit Desert") {
      ctx.save();
      
      const mx = 850;
      const my = 230;
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.arc(mx, my, 45, -Math.PI / 2.3, Math.PI / 2.3);
      ctx.arc(mx + 18, my, 38, Math.PI / 2.5, -Math.PI / 2.5, true);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(251, 191, 36, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mx - 10, my - 30);
      ctx.lineTo(mx - 10, my + 40);
      ctx.stroke();
      
      ctx.fillStyle = "#ffffff";
      drawStarPattern(ctx, mx - 10, my + 45, 8, 4);
      ctx.fill();

      ctx.fillStyle = "rgba(10, 15, 20, 0.95)";
      ctx.beginPath();
      ctx.moveTo(0, 1080);
      ctx.lineTo(0, 920);
      ctx.quadraticCurveTo(280, 840, 540, 930);
      ctx.quadraticCurveTo(800, 1000, 1080, 900);
      ctx.lineTo(1080, 1080);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = goldGrad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "rgba(15, 23, 31, 0.85)";
      ctx.beginPath();
      ctx.moveTo(0, 1080);
      ctx.lineTo(0, 960);
      ctx.quadraticCurveTo(340, 990, 680, 910);
      ctx.quadraticCurveTo(880, 870, 1080, 950);
      ctx.lineTo(1080, 1080);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      let seed = 12345;
      const getRand = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };
      for (let i = 0; i < 40; i++) {
        const sx = getRand() * 1080;
        const sy = getRand() * 600;
        ctx.beginPath();
        const size = getRand() * 2 + 0.5;
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (settings.visualStyle === "Abstract Kaaba Silhouette") {
      ctx.save();
      const kSize = 180;
      const kx = 540 - (kSize / 2);
      const ky = 1080 - 260;
      
      const cubeGrad = ctx.createLinearGradient(kx, ky, kx + kSize, ky + kSize);
      cubeGrad.addColorStop(0, "#121417");
      cubeGrad.addColorStop(0.5, "#0b0c0e");
      cubeGrad.addColorStop(1, "#020304");
      
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 20;
      ctx.fillStyle = cubeGrad;
      ctx.strokeStyle = "rgba(251, 191, 36, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(kx, ky, kSize, kSize + 80);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = goldGrad;
      ctx.fillRect(kx, ky + 40, kSize, 12);

      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(kx, ky + 46);
      ctx.lineTo(kx + kSize, ky + 46);
      ctx.stroke();

      const doorW = 45;
      const doorH = 75;
      const doorX = 540 - (doorW / 2);
      const doorY = ky + kSize - 20;
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.rect(doorX, doorY, doorW, doorH);
      ctx.fill();
      
      ctx.strokeStyle = "#121417";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(doorX + 2, doorY + 2, doorW - 4, doorH - 4);
      ctx.beginPath();
      ctx.moveTo(540, doorY);
      ctx.lineTo(540, doorY + doorH);
      ctx.stroke();

      const mist = ctx.createRadialGradient(540, ky + kSize, 20, 540, ky + kSize, 220);
      mist.addColorStop(0, "rgba(251, 191, 36, 0.1)");
      mist.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = mist;
      ctx.beginPath();
      ctx.arc(540, ky + kSize, 220, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 5. DRAW GOLD METALLIC BORDERS & DECORATIVE FRAME
    if (settings.showGoldBorders && settings.borderStyle !== "none") {
      ctx.save();
      ctx.strokeStyle = goldGrad;
      
      if (settings.borderStyle === "thin") {
        ctx.lineWidth = 3;
        ctx.strokeRect(50, 50, 980, 980);
      } else if (settings.borderStyle === "double") {
        ctx.lineWidth = 4;
        ctx.strokeRect(45, 45, 990, 990);
        ctx.lineWidth = 1.5;
        ctx.strokeRect(58, 58, 964, 964);
      } else if (settings.borderStyle === "ornate") {
        // Elegant double borders with ornate geometric inner lines
        ctx.lineWidth = 4;
        ctx.strokeRect(45, 45, 990, 990);
        ctx.lineWidth = 1.5;
        ctx.strokeRect(58, 58, 964, 964);

        // Intricate ornate corners
        ctx.lineWidth = 2;
        // Top-left
        ctx.strokeRect(70, 70, 30, 30);
        ctx.beginPath();
        ctx.moveTo(58, 85); ctx.lineTo(85, 85); ctx.lineTo(85, 58);
        ctx.stroke();

        // Top-right
        ctx.strokeRect(980, 70, 30, 30);
        ctx.beginPath();
        ctx.moveTo(1022, 85); ctx.lineTo(995, 85); ctx.lineTo(995, 58);
        ctx.stroke();

        // Bottom-left
        ctx.strokeRect(70, 980, 30, 30);
        ctx.beginPath();
        ctx.moveTo(58, 995); ctx.lineTo(85, 995); ctx.lineTo(85, 1022);
        ctx.stroke();

        // Bottom-right
        ctx.strokeRect(980, 980, 30, 30);
        ctx.beginPath();
        ctx.moveTo(1022, 995); ctx.lineTo(995, 995); ctx.lineTo(995, 1022);
        ctx.stroke();
      } else if (settings.borderStyle === "thick") {
        ctx.lineWidth = 12;
        ctx.strokeRect(52, 52, 976, 976);
        ctx.lineWidth = 2;
        ctx.strokeRect(72, 72, 936, 936);
      } else if (settings.borderStyle === "triple") {
        ctx.lineWidth = 4;
        ctx.strokeRect(45, 45, 990, 990);
        ctx.lineWidth = 2;
        ctx.strokeRect(56, 56, 968, 968);
        ctx.lineWidth = 1;
        ctx.strokeRect(65, 65, 950, 950);
      } else if (settings.borderStyle === "dotted-bead") {
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 50, 980, 980);
        
        ctx.fillStyle = goldGrad;
        // Top and bottom dot paths
        for (let x = 70; x <= 1010; x += 30) {
          ctx.beginPath();
          ctx.arc(x, 68, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, 1012, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        // Left and right dot paths
        for (let y = 98; y <= 982; y += 30) {
          ctx.beginPath();
          ctx.arc(68, y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(1012, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (settings.borderStyle === "arch-dome") {
        // Double fine outer frame
        ctx.lineWidth = 2;
        ctx.strokeRect(45, 45, 990, 990);
        ctx.lineWidth = 1;
        ctx.strokeRect(52, 52, 976, 976);

        // Mihrab Arch
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(80, 1005);
        ctx.lineTo(80, 420);
        // Pointed arch curves
        ctx.quadraticCurveTo(80, 275, 260, 235);
        ctx.quadraticCurveTo(320, 215, 320, 195);
        ctx.bezierCurveTo(320, 120, 500, 120, 540, 90);
        ctx.bezierCurveTo(580, 120, 760, 120, 760, 195);
        ctx.quadraticCurveTo(760, 215, 820, 235);
        ctx.quadraticCurveTo(1000, 275, 1000, 420);
        ctx.lineTo(1000, 1005);
        ctx.stroke();
      } else if (settings.borderStyle === "floral-corners") {
        ctx.lineWidth = 2.5;
        ctx.strokeRect(50, 50, 980, 980);
        
        const drawCornerFloral = (cx: number, cy: number, rotRad: number) => {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rotRad);
          
          // Draw elegant vine arc
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 48, -Math.PI / 2, 0);
          ctx.stroke();
          
          // Draw leaves / floral buds along the vine arc
          ctx.fillStyle = goldGrad;
          
          // Leaf 1
          ctx.beginPath();
          ctx.ellipse(26, -38, 12, 6, -Math.PI / 6, 0, Math.PI * 2);
          ctx.fill();
          
          // Leaf 2
          ctx.beginPath();
          ctx.ellipse(38, -16, 10, 5, Math.PI / 12, 0, Math.PI * 2);
          ctx.fill();
          
          // Leaf 3 at tip of arc
          ctx.beginPath();
          ctx.ellipse(48, 12, 12, 6, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Inner decorative flower bud structure
          ctx.beginPath();
          ctx.arc(22, 22, 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Petals
          for (let d = 0; d < 5; d++) {
            const angle = (d * Math.PI * 2) / 5;
            ctx.beginPath();
            ctx.arc(22 + Math.cos(angle) * 7, 22 + Math.sin(angle) * 7, 3, 0, Math.PI * 2);
            ctx.fill();
          }
          
          ctx.restore();
        };
        
        // Render 4 corners
        drawCornerFloral(72, 72, 0);                 // Top-Left
        drawCornerFloral(1008, 72, Math.PI / 2);      // Top-Right
        drawCornerFloral(1008, 1008, Math.PI);        // Bottom-Right
        drawCornerFloral(72, 1008, -Math.PI / 2);     // Bottom-Left
      }
      ctx.restore();
    }

    // 6. DRAW TOP DIVIDER ORNAMENT
    if (settings.topDividerStyle !== "none") {
      ctx.save();
      ctx.fillStyle = goldGrad;
      ctx.strokeStyle = goldGrad;

      const targetY = 175;

      if (settings.topDividerStyle === "star") {
        // Draw centered 8-pointed star
        drawStarPattern(ctx, 540, targetY, 18, 8);
        ctx.fill();

        // Fine lateral lines running outwards
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(540 - 35, targetY);
        ctx.lineTo(540 - 150, targetY);
        ctx.moveTo(540 + 35, targetY);
        ctx.lineTo(540 + 150, targetY);
        ctx.stroke();

        // Small flanking dots
        ctx.beginPath();
        ctx.arc(540 - 160, targetY, 3, 0, Math.PI * 2);
        ctx.arc(540 + 160, targetY, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (settings.topDividerStyle === "crescent") {
        // Crescent & tiny star
        ctx.beginPath();
        ctx.arc(538, targetY, 16, -Math.PI / 2.2, Math.PI / 2.2);
        // subtract inner arc to form crescent
        ctx.arc(544, targetY, 13, Math.PI / 2.5, -Math.PI / 2.5, true);
        ctx.closePath();
        ctx.fill();

        // draw tiny star
        drawStarPattern(ctx, 554, targetY - 4, 6, 5);
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(510, targetY); ctx.lineTo(400, targetY);
        ctx.moveTo(570, targetY); ctx.lineTo(680, targetY);
        ctx.stroke();
      } else if (settings.topDividerStyle === "divider") {
        // Simple diamond layout
        ctx.beginPath();
        ctx.moveTo(540, targetY - 8);
        ctx.lineTo(548, targetY);
        ctx.lineTo(540, targetY + 8);
        ctx.lineTo(532, targetY);
        ctx.closePath();
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(515, targetY); ctx.lineTo(380, targetY);
        ctx.moveTo(565, targetY); ctx.lineTo(700, targetY);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 7. CONTENT RENDERING (Arabic then English then Citation)
    // Vertical centering layout
    // We compute total height of elements to perfect center them!
    const elementsCoords = {
      arabicY: 0,
      englishY: 0,
      refY: 0,
    };

    ctx.save();

    // Word Wrap details
    const maxWidth = 860;
    
    // Arabic Prep
    ctx.font = `bold ${settings.arabicFontSize}px "Amiri", serif`;
    const arabicLines = settings.arabicText 
      ? settings.arabicText.split("\n").flatMap(line => {
          // Keep manual line breaks, and further word wrap if too long
          const words = line.trim().split(" ");
          if (words.length <= 1) return [line];
          return wrapText(ctx, line, maxWidth);
        })
      : [];
    const arabicLineHeight = settings.arabicFontSize * 1.5;
    const arabicBlockHeight = arabicLines.length * arabicLineHeight;

    // English Prep
    ctx.font = `italic ${settings.englishFontSize}px "Playfair Display", "Times New Roman", serif`;
    const englishLines = settings.englishText
      ? settings.englishText.split("\n").flatMap(line => {
          return wrapText(ctx, line, maxWidth);
        })
      : [];
    const englishLineHeight = settings.englishFontSize * 1.45;
    const englishBlockHeight = englishLines.length * englishLineHeight;

    // Reference Prep
    ctx.font = `600 ${settings.refFontSize}px "Montserrat", sans-serif`;
    const refText = (settings.referenceText || "").trim();
    const refHeight = refText ? settings.refFontSize * 2 : 0;

    // Inter-block Spacers
    const spacer1 = settings.arabicText && settings.englishText ? 50 : 0;
    const spacer2 = settings.englishText && refText ? 40 : 0;

    const totalContentHeight = arabicBlockHeight + spacer1 + englishBlockHeight + spacer2 + refHeight;
    
    // Perfect vertical centering
    // We start from centerY - totalContentHeight/2
    // If we have a top ornament or bottom silhouette, we shift slightly to balance
    let startY = 540 - (totalContentHeight / 2);
    
    if (
      settings.visualStyle === "Mosque Silhouette" ||
      settings.visualStyle === "Classic Medina Dome" ||
      settings.visualStyle === "Celestial Moonlit Desert" ||
      settings.visualStyle === "Abstract Kaaba Silhouette"
    ) {
      // Shift upward slightly to avoid clashing with the lower silhouette
      startY -= 45;
    }
    if (settings.topDividerStyle !== "none") {
      // Ensure we don't bleed back into the top ornament
      const safeTop = 220;
      if (startY < safeTop) startY = safeTop;
    }

    // 7a. DRAW ARABIC LINES
    if (arabicLines.length > 0) {
      ctx.font = `bold ${settings.arabicFontSize}px "Amiri", "Georgia", serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      
      // Arabic shadow for massive depth
      ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      let currentArabicY = startY;
      for (const line of arabicLines) {
        ctx.fillText(line, 540, currentArabicY);
        currentArabicY += arabicLineHeight;
      }
      startY += arabicBlockHeight;
    }

    // Apply spacer
    startY += spacer1;

    // 7b. DRAW ENGLISH LINES
    if (englishLines.length > 0) {
      ctx.font = `500 ${settings.englishFontSize}px "Playfair Display", serif`;
      ctx.fillStyle = "#f3f4f6"; // lovely warm off-white
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      // Subtitle shadow text protection
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 1.5;
      ctx.shadowOffsetY = 1.5;

      let currentEnglishY = startY;
      for (const line of englishLines) {
        ctx.fillText(line, 540, currentEnglishY);
        currentEnglishY += englishLineHeight;
      }
      startY += englishBlockHeight;
    }

    // Apply spacer
    startY += spacer2;

    // 7c. DRAW CITATION SOURCE
    if (refText) {
      // Elegant gold reference signature
      ctx.font = `bold ${settings.refFontSize}px "Montserrat", sans-serif`;
      ctx.fillStyle = goldGrad;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Letter spacing simulation by splitting letters is possible, 
      // but standard bold fine text looks stellar automatically.
      ctx.fillText(refText.toUpperCase(), 540, startY);
    }

    ctx.restore(); // Restore shadow-free drawing state

    // 8. LOGO & BRAND SIGNATURE WATERMARK (Stamped nicely)
    ctx.save();
    const padding = 100;
    
    const isCenteredLayout =
      settings.visualStyle === "Mosque Silhouette" ||
      settings.visualStyle === "Classic Medina Dome" ||
      settings.visualStyle === "Celestial Moonlit Desert" ||
      settings.visualStyle === "Abstract Kaaba Silhouette";
    
    if (logoImage) {
      // Scale uploaded logo dynamically
      const maxLogoW = 120 * logoScale;
      const maxLogoH = 120 * logoScale;
      const logoRatio = logoImage.width / logoImage.height;
      let lw = maxLogoW;
      let lh = maxLogoH;

      if (logoRatio > 1) {
        lh = maxLogoW / logoRatio;
      } else {
        lw = maxLogoH * logoRatio;
      }

      // Draw bottom-right corner or bottom center depending on the layout structure
      const lx = isCenteredLayout
        ? 540 - (lw / 2) // center bottom
        : 1080 - padding - lw; // right bottom
      
      const ly = isCenteredLayout
        ? 1000 - lh // above bottom edge
        : 1080 - padding - lh;

      // Draw shadow backing for brand logo to contrast correctly
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 8;
      ctx.drawImage(logoImage, lx, ly, lw, lh);
    } else if (settings.watermarkText) {
      // Draw simple design credit watermark in tiny spaced gold/white
      ctx.font = `500 16px "Montserrat", sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      
      ctx.textAlign = isCenteredLayout ? "center" : "right";
      
      const wx = isCenteredLayout ? 540 : 1080 - padding;
      const wy = 1080 - 75;

      ctx.fillText(settings.watermarkText, wx, wy);
    }
    ctx.restore();

    // 9. PROPAGATE DATA BACK TO PARENT
    if (onDrawComplete) {
      try {
        onDrawComplete(canvas.toDataURL("image/jpeg", 0.95));
      } catch (err) {
        console.warn("Could not retrieve canvas data URL (e.g. tainted canvas or sandbox restrictions):", err);
      }
    }
  };

  // Redraw whenever changes happen
  useEffect(() => {
    drawCanvas();
  }, [settings, bgImage, logoImage, fontsLoaded, logoScale]);

  // Hook parent trigger reference
  useEffect(() => {
    if (onRedrawTrigger) {
      onRedrawTrigger(drawCanvas);
    }
  }, [onRedrawTrigger, settings, bgImage, logoImage]);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Absolute Header with Status tags */}
      <div className="w-full flex justify-between items-center mb-4 pb-3 border-b border-gray-200 font-medium">
        <span className="flex items-center gap-2 text-natural-primary font-cinzel text-sm tracking-wide font-extrabold select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-natural-primary animate-pulse" />
          Islamic Design Canvas
        </span>
        <span className="text-xs font-mono text-natural-muted font-bold">
          1080 × 1080 px (1:1 Ratio)
        </span>
      </div>

      {/* Render canvas scaled down responsively */}
      <div className="relative w-full aspect-square max-w-[420px] shadow-2xl rounded-xl overflow-hidden border border-gray-200 bg-[#090b0e]">
        <canvas
          id="dawah-graphic-canvas"
          ref={canvasRef}
          width={1080}
          height={1080}
          className="w-full h-full object-contain"
          style={{ display: "block" }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 justify-center w-full max-w-[420px]">
        <button
          id="canvas-trigger-redraw"
          onClick={drawCanvas}
          type="button"
          className="flex items-center justify-center gap-2 flex-1 px-3 py-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-natural-primary text-xs font-bold rounded-xl transition-colors border border-gray-200 shadow-sm cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Force Canvas Repaint
        </button>
      </div>
    </div>
  );
};
