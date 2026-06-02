import { VisualStyle, OverlayColor } from "../types";

/**
 * Creates a highly customized prompt tailored for the Imagen 3 model
 * based on selected aesthetic styles and core topic mood.
 */
export function generateDawahPrompt(
  visualStyle: VisualStyle,
  overlayColor: OverlayColor,
  topic: string,
  rawText: string
): string {
  // Extract key themes or words to enrich the prompt context
  const cleanTopic = topic ? topic.trim() : "Divine peace and reflection";
  const briefText = rawText ? rawText.trim().substring(0, 80).replace(/["'\n]/g, "") : "";
  
  let styleDetails = "";
  
  switch (visualStyle) {
    case "Minimalist":
      styleDetails = `A minimalist modern abstract background, elegant gold line motif, micro-textures, quiet meditative space, very subtle geometric accents, soft glowing aura in the center, high-contrast, designed specifically for social media overlay text.`;
      break;
    case "Mosque Silhouette":
      styleDetails = `A glowing ethereal dusk skyline, faint starry celestial cosmos, beautiful backlighting, silhouette outline of traditional mosque dome and elegant tall minarets at the base, misty soft cloud elements, majestic and quiet.`;
      break;
    case "Abstract Geometric":
      styleDetails = `A breathtaking symmetrical Islamic geometric star pattern, sacred geometry lines, intricate premium golden floral arabesque shapes, thin golden lines, luxury tile mandala, beautifully centered composition.`;
      break;
    case "Calming Nature":
      styleDetails = `A serene nature scenery, rolling quiet desert sand dunes under a cosmic soft night sky, a thin brilliant crescent moon, soft starlight, serene olive trees or palm fronds softly visible silhouetted at the top borders, peaceful and calming.`;
      break;
    case "Classic Medina Dome":
      styleDetails = `A magnificent depiction of the classic green dome of Al-Masjid an-Nabawi in Medina, soft lighting, morning glow, fine decorative gold borders, and elegant crescent silhouettes.`;
      break;
    case "Islamic Arabesque Pattern":
      styleDetails = `An intricate continuous seamless Islamic arabesque pattern with geometric interlocking star grids, sacred linear math art, gold foil micro-detailing, and exquisite symmetry.`;
      break;
    case "Symmetrical Floral Mandalas":
      styleDetails = `A circular symmetrical floral mandala with complex layered petals and elegant blooming gold outlines, radiating spiritual peace and harmony.`;
      break;
    case "Celestial Moonlit Desert":
      styleDetails = `Quiet desert dunes under an expansive sparkling celestial starry night sky, with a bright thin crescent moon, floating dust motes, and a tranquil warm spiritual atmosphere.`;
      break;
    case "Abstract Kaaba Silhouette":
      styleDetails = `An abstract geometric silhouette of the Holy Kaaba in Mecca, featuring the golden calligraphic door (Kiswa gate) details in deep golds, surrounded by a soft radiating mist of spiritual light.`;
      break;
  }

  // Define overlay colors to inject color harmony directly into the generative model
  let colorMood = "";
  switch (overlayColor) {
    case "emerald":
      colorMood = "dominated by rich deep emerald green, gold highlights, and dark forest ambient undertones";
      break;
    case "navy":
      colorMood = "saturated with deep cosmic indigo blue, royal midnight teal, and faint golden starlight";
      break;
    case "aubergine":
      colorMood = "infused with luxury deep royal purple, dark aubergine plum, and subtle golden mist";
      break;
    case "crimson":
      colorMood = "washed with rich deep imperial crimson red, dark ruby shadows, and royal warm gold sparkle";
      break;
    case "amber":
      colorMood = "bathed in warm spiritual amber, dark rich ochre gradients, and divine gold shimmer";
      break;
    case "teal":
      colorMood = "designed in mystic deep teal and sea blue-green, soft luminous highlights, and dark ocean tones";
      break;
    case "forest":
      colorMood = "themed in ancient sacred olive and deep forest green, natural gold details, and earthy shadows";
      break;
    case "onyx":
      colorMood = "crafted in elegant obsidian onyx black, dark graphite, with contrasting sparkling pure gold accents";
      break;
    case "slate":
    default:
      colorMood = "designed in elegant dark charcoal gray, warm ivory highlights, and cool slate undertones";
      break;
  }

  // Combine these into one pristine descriptive prompt
  const fullPrompt = `Islamic dawah post background graphic. Topic: ${cleanTopic}. Concept description: ${styleDetails} Color palette: ${colorMood}. Perfect center spacing for text overlays. Absolute award-winning high resolution, cinematic lighting, 8k, photorealistic details, spiritual, calm, respectful, no text, no letters, no human faces, no animal figures.`;

  return fullPrompt;
}

interface ImageGenerationResponse {
  imageBytes: string;
  error?: string;
}

/**
 * Make a direct client-side fetch request to Google Gemini's REST API using the user-provided API key.
 * Uses the latest image generation model: imagen-3.0-generate-002
 */
export async function generateImagenBackground(
  apiKey: string,
  prompt: string
): Promise<ImageGenerationResponse> {
  // Call our secure Express backend proxy route to bypass CORS constraint completely
  try {
    const response = await fetch("/api/generate-backdrop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        clientApiKey: apiKey, // Optional client key, server-side process.env can fall back
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiErrorMessage = errorData?.error || response.statusText;
      return {
        imageBytes: "",
        error: `Generation failed: ${apiErrorMessage}`,
      };
    }

    const data = await response.json();
    if (data && data.imageBytes) {
      return { imageBytes: data.imageBytes };
    }

    return {
      imageBytes: "",
      error: "No image bytes returned from server proxy.",
    };
  } catch (err: any) {
    return {
      imageBytes: "",
      error: `Network error: Could not complete generation. ${err?.message || ""}`,
    };
  }
}
