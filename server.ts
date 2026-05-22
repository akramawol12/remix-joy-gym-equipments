import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client helper to prevent startup crashes when GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for smart fitness gym layout and equipment consultation
app.post("/api/gemini/advisor", async (req, res) => {
  try {
    const { budget, goals, space, extraInfo } = req.body;

    const queryPrompt = `
      Create a tailored premium gym equipment buying and room setup recommendation for:
      - Budget: $${budget || 2000}
      - Training Goals: ${goals || "General Fitness, Strength Training"}
      - Available Space: ${space || "Spare Bedroom / Studio"}
      - Additional requests/equipment preferences: ${extraInfo || "None"}

      Joy Gym Equipments sells the following luxury items:
      1. Chrome Adjustable Dumbbell Set (Pair 5-50 lbs): $349
      2. Joy Smart Interactive Treadmill (Custom carbon fiber, auto-recline): $1,499
      3. Commercial Squat Rack & Power Cage (Heavy-duty gold accents): $899
      4. Olympic 7ft Barbell with 255 lbs Rubber Plate Set (Gold collar locks): $590
      5. Joy Kinetic Air Bike (Dual belt system, LCD monitor): $699
      6. Heavy-Duty Multi-Angle Flat/Incline/Decline Bench: $249
      7. Premium Vulcanized Rubber Gym Flooring (Per 100 sq.ft tile pack): $180

      Respond with a creative layout plan, which equipment of ours fits their budget & goals, layout configuration tips for their space, and a motivational message.
    `;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: queryPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A high-end, motivational title for the user's custom layout plan" },
            recommendedProducts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  reason: { type: Type.STRING, description: "Why this product is recommended for their goals" }
                },
                required: ["name", "price", "reason"]
              }
            },
            totalEstimatedPrice: { type: Type.NUMBER, description: "Sum of recommended items suitable to their budget" },
            layoutStrategy: { type: Type.STRING, description: "Detailed 3D setup layout plan for their room space" },
            professionalAdvice: { type: Type.STRING, description: "Professional advice on equipment installation, floor safety, or acoustics" },
            motivationalQuote: { type: Type.STRING, description: "An energetic personalized fitness motivation quote" }
          },
          required: ["title", "recommendedProducts", "totalEstimatedPrice", "layoutStrategy", "professionalAdvice", "motivationalQuote"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response text returned from Gemini API");
    }

    res.json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("Gemini Advisor API error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate recommendation. Check your Gemini API Key configuration."
    });
  }
});

// Setup Vite in development vs serving static files in production
async function startServer() {
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
    console.log(`Server configured and running on http://localhost:${PORT}`);
  });
}

startServer();
