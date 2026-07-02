export interface BrowseResult {
  url: string;
  title: string;
  text: string;
  screenshot: string;
  error?: string;
}

export interface SearchResult {
  ok: boolean;
  results: Array<{ title: string; url: string; snippet: string }>;
  answerBox?: string;
  error?: string;
}

const DISABLED_BROWSER_MESSAGE =
  'Navegacion visual deshabilitada en Cloudflare Workers. Playwright/Chromium debe ejecutarse en Node/VPS. Para busqueda web usa SERPER_API_KEY.';

export async function browsePage(url: string): Promise<BrowseResult> {
  return {
    url,
    title: 'Navegador no disponible en Cloudflare',
    text: DISABLED_BROWSER_MESSAGE,
    screenshot: '',
    error: DISABLED_BROWSER_MESSAGE,
  };
}

export async function searchWeb(
  query: string,
  serperApiKey?: string,
  gl = 'cl',
): Promise<SearchResult> {
  if (!serperApiKey) {
    return {
      ok: false,
      results: [],
      error: 'SERPER_API_KEY no configurada. En Cloudflare no hay fallback con Playwright/Chromium.',
    };
  }

  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': serperApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 8, gl, hl: 'es' }),
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      return { ok: false, results: [], error: `Serper respondio HTTP ${res.status}` };
    }

    const data = await res.json() as {
      organic?: Array<{ title?: string; link?: string; snippet?: string }>;
      answerBox?: { answer?: string; snippet?: string };
      knowledgeGraph?: { description?: string };
    };

    return {
      ok: true,
      results: (data.organic ?? []).map((r) => ({
        title: r.title ?? '',
        url: r.link ?? '',
        snippet: r.snippet ?? '',
      })),
      answerBox: data.answerBox?.answer ?? data.answerBox?.snippet ?? data.knowledgeGraph?.description,
    };
  } catch (err) {
    return { ok: false, results: [], error: err instanceof Error ? err.message : String(err) };
  }
}
