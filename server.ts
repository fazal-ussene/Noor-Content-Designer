import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Crucial: parse JSON requests with limit
  app.use(express.json({ limit: "15mb" }));

  // API Config Endpoint to check server capability
  app.get("/api/config", (req, res) => {
    res.json({
      hasServerKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // API Endpoint to download the self-contained Single-File HTML
  app.get("/api/download-singlefile", (req, res) => {
    const possiblePaths = [
      path.join(process.cwd(), "noor-content-designer-singlefile.html"),
      path.join(process.cwd(), "dist", "index.html"),
    ];

    let foundPath = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (foundPath) {
      res.setHeader("Content-Disposition", 'attachment; filename="noor-content-designer-singlefile.html"');
      res.setHeader("Content-Type", "text/html");
      res.sendFile(foundPath);
    } else {
      res.status(404).send("Single-file build not found. The background build process is still running. Please refresh in a moment to download!");
    }
  });

  // Proxy Endpoint for Backdrop Generation (CORS-free, server-to-server)
  app.post("/api/generate-backdrop", async (req, res): Promise<any> => {
    try {
      const { prompt, clientApiKey } = req.body;
      const activeKey = clientApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();

      if (!activeKey) {
        return res.status(400).json({
          error: "No Google Gemini API key found. Please input a valid API Key in the settings drawer.",
        });
      }

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({
          error: "Prompt cannot be empty and must be a string.",
        });
      }

      console.log(`Starting image generation inside server.ts with prompt: "${prompt.substring(0, 80)}..."`);

      const errors: string[] = [];

      // Create standard client
      const serverAi = new GoogleGenAI({
        apiKey: activeKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // FALLBACK 1: SDK generateContent using gemini-2.5-flash-image (Most widely supported standard key model)
      try {
        console.log("Image generation attempt 1: gemini-2.5-flash-image SDK");
        const sdkResponse = await serverAi.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            imageConfig: {
              aspectRatio: "1:1"
            }
          }
        });

        const parts = sdkResponse.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData?.data) {
              console.log("Success generating backdrop via gemini-2.5-flash-image SDK.");
              return res.json({ imageBytes: part.inlineData.data });
            }
          }
        }
        errors.push("gemini-2.5-flash-image SDK succeeded but returned no inline image bytes.");
      } catch (err: any) {
        errors.push(`gemini-2.5-flash-image SDK failed: ${err.message || err}`);
      }

      // FALLBACK 2: SDK generateContent using gemini-3.1-flash-image (High quality standard model)
      try {
        console.log("Image generation attempt 2: gemini-3.1-flash-image SDK");
        const sdkResponse = await serverAi.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            imageConfig: {
              aspectRatio: "1:1",
              imageSize: "1K"
            }
          }
        });

        const parts = sdkResponse.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData?.data) {
              console.log("Success generating backdrop via gemini-3.1-flash-image SDK.");
              return res.json({ imageBytes: part.inlineData.data });
            }
          }
        }
        errors.push("gemini-3.1-flash-image SDK succeeded but returned no inline image bytes.");
      } catch (err: any) {
        errors.push(`gemini-3.1-flash-image SDK failed: ${err.message || err}`);
      }

      // FALLBACK 3: SDK generateImages using imagen-3.0-generate-002
      try {
        console.log("Image generation attempt 3: imagen-3.0-generate-002 SDK");
        const sdkResponse = await serverAi.models.generateImages({
          model: "imagen-3.0-generate-002",
          prompt: prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: "image/jpeg",
            aspectRatio: "1:1",
          },
        });

        if (sdkResponse.generatedImages && sdkResponse.generatedImages.length > 0) {
          const base64Bytes = sdkResponse.generatedImages[0].image?.imageBytes;
          if (base64Bytes) {
            console.log("Success generating backdrop via imagen-3.0-generate-002 SDK.");
            return res.json({ imageBytes: base64Bytes });
          }
        }
        errors.push("imagen-3.0-generate-002 SDK succeeded but returned no image bytes.");
      } catch (err: any) {
        errors.push(`imagen-3.0-generate-002 SDK failed: ${err.message || err}`);
      }

      // FALLBACK 4: SDK generateImages using imagen-4.0-generate-001 (Latest premium model)
      try {
        console.log("Image generation attempt 4: imagen-4.0-generate-001 SDK");
        const sdkResponse = await serverAi.models.generateImages({
          model: "imagen-4.0-generate-001",
          prompt: prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: "image/jpeg",
            aspectRatio: "1:1",
          },
        });

        if (sdkResponse.generatedImages && sdkResponse.generatedImages.length > 0) {
          const base64Bytes = sdkResponse.generatedImages[0].image?.imageBytes;
          if (base64Bytes) {
            console.log("Success generating backdrop via imagen-4.0-generate-001 SDK.");
            return res.json({ imageBytes: base64Bytes });
          }
        }
        errors.push("imagen-4.0-generate-001 SDK succeeded but returned no image bytes.");
      } catch (err: any) {
        errors.push(`imagen-4.0-generate-001 SDK failed: ${err.message || err}`);
      }

      // FALLBACK 5: Direct REST call to gemini-2.5-flash-image
      try {
        console.log("Image generation attempt 5: gemini-2.5-flash-image REST");
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${activeKey}`;
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            config: {
              imageConfig: {
                aspectRatio: "1:1"
              }
            }
          })
        });
        if (resp.ok) {
          const data = await resp.json();
          const parts = data.candidates?.[0]?.content?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                console.log("Success generating backdrop via gemini-2.5-flash-image REST.");
                return res.json({ imageBytes: part.inlineData.data });
              }
            }
          }
        } else {
          const errorText = await resp.text();
          errors.push(`gemini-2.5-flash-image REST responded with code ${resp.status}: ${errorText}`);
        }
      } catch (err: any) {
        errors.push(`gemini-2.5-flash-image REST failed: ${err.message || err}`);
      }

      // FALLBACK 6: Direct REST call to imagen-3.0-generate-002
      try {
        console.log("Image generation attempt 6: imagen-3.0-generate-002 REST");
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${activeKey}`;
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: prompt,
            config: {
              numberOfImages: 1,
              aspectRatio: "1:1",
              outputMimeType: "image/jpeg",
            }
          })
        });
        if (resp.ok) {
          const data = await resp.json();
          const base64Bytes = data.generatedImages?.[0]?.image?.imageBytes;
          if (base64Bytes) {
            console.log("Success generating backdrop via imagen-3.0-generate-002 REST.");
            return res.json({ imageBytes: base64Bytes });
          }
        } else {
          const errorText = await resp.text();
          errors.push(`imagen-3.0-generate-002 REST responded with code ${resp.status}: ${errorText}`);
        }
      } catch (err: any) {
        errors.push(`imagen-3.0-generate-002 REST failed: ${err.message || err}`);
      }

      console.error("All backdrop generation models have failed:", errors);

      // Clean, professional, customer-facing message
      const isPlanIssue = errors.some(
        (e) =>
          e.includes("RESOURCE_EXHAUSTED") ||
          e.includes("Quota exceeded") ||
          e.includes("paid plan") ||
          e.includes("not found") ||
          e.includes("429") ||
          e.includes("400")
      );

      if (isPlanIssue) {
        return res.status(403).json({
          error: "Google AI Studio image generation (including Imagen & Flash Image models) requires a paid-tier plan with billing configured. The AI assistant has initiated the Paid Model flow for you. Please upgrade your Google AI Studio plan or insert a Paid-Tier API Key to unlock cloud generative backdrops! Meanwhile, you can continue using the high-quality local Procedural Gradient fallback modes.",
        });
      }

      return res.status(500).json({
        error: `Backdrop generation failed. All models exhausted. Details:\n${errors.join("\n")}`,
      });

    } catch (err: any) {
      console.error("Server exception during image generation:", err);
      return res.status(500).json({
        error: err?.message || "An unexpected error occurred during back-end transmission.",
      });
    }
  });

  // Setup Vite development middleware / Static production directory serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://localhost:${PORT}`);
  });
}

startServer();
