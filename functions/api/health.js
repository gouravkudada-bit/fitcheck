// Cloudflare Pages Function: GET /api/health
export async function onRequestGet(context) {
  const hasKey = Boolean(context.env?.GEMINI_API_KEY);
  return new Response(
    JSON.stringify({
      status: 'ok',
      platform: 'cloudflare-pages',
      hasApiKey: hasKey,
      timestamp: new Date().toISOString(),
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
