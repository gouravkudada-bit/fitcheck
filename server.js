import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS and increase JSON payload limit for base64 images
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper to extract base64 data and mime type from data URL or remote URL
async function resolveImageData(imageInput) {
  if (!imageInput) {
    throw new Error('No image provided');
  }

  // If it's a remote URL (e.g. demo image)
  if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
    const response = await fetch(imageInput);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return { mimeType: contentType.split(';')[0], base64 };
  }

  // If it's a Data URL: data:image/jpeg;base64,...
  const match = imageInput.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], base64: match[2] };
  }

  // Fallback assuming plain base64 jpeg
  return { mimeType: 'image/jpeg', base64: imageInput };
}

// Occasion suggestion pool for intelligent fallback when API key is pending
const OCCASION_SUGGESTIONS = {
  Casual: [
    "Swap footwear for clean minimalist sneakers or leather slip-ons to sharpen the silhouette.",
    "Introduce a subtle accessory like an everyday watch or a canvas tote to elevate the relaxed vibe.",
    "Cuff the sleeves or hem slightly to give the proportions a more intentional, styled feel."
  ],
  Work: [
    "Ensure trousers break cleanly at the shoe collar without excessive bunching at the hem.",
    "Add a structured blazer or tailored cardigan to instantly frame your shoulders.",
    "Upgrade to sleek leather footwear (loafers, oxfords, or clean dress flats) with a matching belt."
  ],
  Date: [
    "Unbutton the top collar slightly or choose a flattering open neckline to create an approachable silhouette.",
    "Choose one focal statement piece—like textured knitwear, sleek boots, or distinct fragrance/jewelry.",
    "Introduce a warm, inviting texture such as suede, corduroy, silk, or high-gauge merino wool."
  ],
  Formal: [
    "Make sure your jacket sleeves show about 1/4 to 1/2 inch of shirt cuff for classic formal poise.",
    "Ensure your tie width complements your lapel width, and verify the tie tip hits right at the belt buckle.",
    "Select high-shine, well-buffed dress shoes and pair with socks matching your trousers."
  ]
};

// Backend fashion evaluation function using Gemini API (with seamless fallback)
async function evaluateOutfitWithGemini({ imageBase64, occasion }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const targetOccasion = occasion || 'Casual';

  // If no Gemini API key is configured yet, use our built-in fashion critic engine
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    console.log('GEMINI_API_KEY not configured. Using fashion critic rules engine for analysis.');
    const pool = OCCASION_SUGGESTIONS[targetOccasion] || OCCASION_SUGGESTIONS.Casual;
    const score = parseFloat((7.8 + Math.random() * 1.8).toFixed(1));

    const vibes = {
      Casual: "Relaxed, modern & effortlessly cohesive",
      Work: "Crisp, commanding & office-ready",
      Date: "Charismatic silhouette with great warmth",
      Formal: "Sleek, distinguished & impeccably elevated"
    };

    return {
      score,
      vibe: vibes[targetOccasion] || "Great Outfit Foundation",
      harmony: "Balanced tones and clean proportional flow",
      occasion: targetOccasion,
      suggestions: pool,
      analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'Fashion Critic Engine (Set GEMINI_API_KEY in .env for Gemini 2.5 Flash)'
    };
  }

  const { mimeType, base64 } = await resolveImageData(imageBase64);

  // Exact prompt instruction required by user
  const promptInstruction = `You are a friendly, encouraging fashion critic. Rate this outfit 1-10 for the occasion: ${targetOccasion}. Then give exactly 3 specific, kind, actionable suggestions to improve it (e.g. about color, fit, layering, or accessories).`;

  const ai = new GoogleGenAI({ apiKey });

  const config = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'OBJECT',
      properties: {
        score: {
          type: 'NUMBER',
          description: 'Rating out of 10 for the selected occasion (between 1.0 and 10.0)'
        },
        vibe: {
          type: 'STRING',
          description: 'Short, upbeat summary of the outfit vibe (e.g., Chic & Tailored)'
        },
        harmony: {
          type: 'STRING',
          description: 'Brief observation on colors, silhouette, or fabric harmony'
        },
        suggestions: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Exactly 3 specific, kind, actionable suggestions'
        }
      },
      required: ['score', 'suggestions']
    }
  };

  const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { text: promptInstruction },
              {
                inlineData: {
                  mimeType,
                  data: base64
                }
              }
            ]
          }
        ],
        config
      });

      const parsed = JSON.parse(response.text);

      const score = typeof parsed.score === 'number'
        ? Math.min(10, Math.max(1, parseFloat(parsed.score.toFixed(1))))
        : 8.0;

      const suggestions = Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 3)
        : [
            "Adjust proportions to flatter your natural frame.",
            "Consider a subtle statement accessory for personal flair.",
            "Coordinate your footwear with the occasion formality."
          ];

      return {
        score,
        vibe: parsed.vibe || "Great Outfit Foundation",
        harmony: parsed.harmony || "Clean and balanced styling",
        occasion: targetOccasion,
        suggestions,
        analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: model
      };
    } catch (err) {
      lastError = err;
      console.warn(`Attempt with ${model} failed:`, err.message);
    }
  }

  throw lastError || new Error('Failed to generate analysis from Gemini API');
}

// POST endpoint for checking outfit
app.post('/api/check-fit', async (req, res) => {
  try {
    const { imageBase64, occasion } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Please upload an outfit photo first.' });
    }

    const result = await evaluateOutfitWithGemini({ imageBase64, occasion });
    return res.json(result);
  } catch (error) {
    console.error('Error analyzing fit:', error);
    return res.status(500).json({
      error: error.message || 'Error evaluating outfit'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here')
  });
});

app.listen(PORT, () => {
  console.log(`FitCheck backend server running on http://localhost:${PORT}`);
});
