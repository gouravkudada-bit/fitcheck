// Cloudflare Worker entry point for FitCheck with Static Assets

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

const VIBES = {
  Casual: "Relaxed, modern & effortlessly cohesive",
  Work: "Crisp, commanding & office-ready",
  Date: "Charismatic silhouette with great warmth",
  Formal: "Sleek, distinguished & impeccably elevated"
};

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

async function resolveImageData(imageInput) {
  if (!imageInput) {
    throw new Error('No image provided');
  }

  // If remote URL (e.g. demo image)
  if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
    const res = await fetch(imageInput);
    if (!res.ok) {
      throw new Error(`Failed to fetch image from URL: ${res.statusText}`);
    }
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);
    return { mimeType: contentType.split(';')[0], base64 };
  }

  // If Data URL
  const match = imageInput.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], base64: match[2] };
  }

  // Fallback assuming plain base64
  return { mimeType: 'image/jpeg', base64: imageInput };
}

function fallbackEvaluation(occasion) {
  const targetOccasion = occasion || 'Casual';
  const pool = OCCASION_SUGGESTIONS[targetOccasion] || OCCASION_SUGGESTIONS.Casual;
  const score = parseFloat((7.8 + Math.random() * 1.8).toFixed(1));

  return {
    score,
    vibe: VIBES[targetOccasion] || "Great Outfit Foundation",
    harmony: "Balanced neutral tones and clean proportional flow",
    occasion: targetOccasion,
    suggestions: pool,
    analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    modelUsed: 'Fashion Critic Engine (Worker Fallback)'
  };
}

async function evaluateWithGemini({ apiKey, base64, mimeType, occasion }) {
  const promptInstruction = `You are a friendly, encouraging fashion critic. Rate this outfit 1-10 for the occasion: ${occasion}. Then give exactly 3 specific, kind, actionable suggestions to improve it (e.g. about color, fit, layering, or accessories).`;

  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                score: { type: 'NUMBER', description: 'Rating out of 10' },
                vibe: { type: 'STRING', description: 'Short upbeat summary' },
                harmony: { type: 'STRING', description: 'Observation on colors and silhouette' },
                suggestions: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                  description: 'Exactly 3 specific, actionable suggestions'
                }
              },
              required: ['score', 'suggestions']
            }
          }
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API returned ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        throw new Error('Gemini API did not return candidates');
      }

      const parsed = JSON.parse(candidateText);
      const score = typeof parsed.score === 'number'
        ? Math.min(10, Math.max(1, parseFloat(parsed.score.toFixed(1))))
        : 8.5;

      const suggestions = Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 3)
        : (OCCASION_SUGGESTIONS[occasion] || OCCASION_SUGGESTIONS.Casual);

      return {
        score,
        vibe: parsed.vibe || VIBES[occasion] || "Great Outfit Foundation",
        harmony: parsed.harmony || "Clean and balanced styling",
        occasion,
        suggestions,
        analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: `${model} (Cloudflare Worker)`
      };
    } catch (err) {
      lastError = err;
      console.warn(`Attempt with ${model} failed:`, err.message);
    }
  }

  throw lastError || new Error('Failed to evaluate outfit with Gemini');
}

async function handleCheckFit(request, env) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed. Use POST.' }, 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON in request body' }, 400);
  }

  const { imageBase64, occasion } = body || {};

  if (!imageBase64) {
    return jsonResponse({ error: 'Please upload an outfit photo first.' }, 400);
  }

  const targetOccasion = occasion || 'Casual';
  const apiKey = (env?.GEMINI_API_KEY || '').trim();

  // If live Gemini API key is configured
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const { mimeType, base64 } = await resolveImageData(imageBase64);
      const result = await evaluateWithGemini({
        apiKey,
        base64,
        mimeType,
        occasion: targetOccasion,
      });
      return jsonResponse(result, 200);
    } catch (err) {
      console.warn('Gemini API error, falling back to Fashion Critic Engine:', err.message);
      const fallback = fallbackEvaluation(targetOccasion);
      return jsonResponse(fallback, 200);
    }
  }

  // Fallback when no API key configured
  const fallback = fallbackEvaluation(targetOccasion);
  return jsonResponse(fallback, 200);
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, '') || '/';

    try {
      // API routes
      if (pathname === '/api/check-fit') {
        return await handleCheckFit(request, env);
      }

      if (pathname === '/api/health') {
        const hasKey = Boolean(
          env?.GEMINI_API_KEY &&
          env.GEMINI_API_KEY.trim() !== '' &&
          env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
        );
        return jsonResponse({
          status: 'ok',
          platform: 'cloudflare-worker',
          hasApiKey: hasKey,
          timestamp: new Date().toISOString(),
        });
      }

      // Catch-all for undefined API endpoints
      if (pathname.startsWith('/api')) {
        return jsonResponse({ error: `API route not found: ${pathname}` }, 404);
      }

      // Serve static assets via Workers Assets binding
      if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
        return await env.ASSETS.fetch(request);
      }

      return jsonResponse({ error: 'Asset handler unavailable' }, 404);
    } catch (err) {
      console.error('Unhandled Worker error:', err);
      return jsonResponse({
        error: err.message || 'Internal Server Error'
      }, 500);
    }
  }
};
