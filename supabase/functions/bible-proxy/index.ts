// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const ABBREVS = [
  "gn","ex","lv","nm","dt",
  "js","jz","rt","1sm","2sm","1rs","2rs","1cr","2cr","ed","ne","et",
  "job","sl","pv","ec","ct",
  "is","jr","lm","ez","dn",
  "os","jl","am","ob","jn","mq","na","hc","sf","ag","zc","ml",
  "mt","mc","lc","jo","at",
  "rm","1co","2co","gl","ef","fp","cl","1ts","2ts","1tm","2tm","tt","fm",
  "hb","tg","1pe","2pe","1jo","2jo","3jo","jd","ap"
];

serve(async (req) => {
  const url = new URL(req.url);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (url.pathname !== "/") {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: CORS_HEADERS });
  }

  if (url.searchParams.get("path") === "health") {
    return new Response(JSON.stringify({ ok: true }), { headers: CORS_HEADERS });
  }

  const book = (url.searchParams.get("book") || "").toLowerCase();
  const chapterStr = url.searchParams.get("chapter") || "";
  const chapter = parseInt(chapterStr, 10);

  if (!book || isNaN(chapter) || chapter <= 0) {
    return new Response(JSON.stringify({ error: "Parâmetros inválidos. Use ?book=gn&chapter=1" }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  const bookIndex = ABBREVS.indexOf(book);
  if (bookIndex === -1) {
    return new Response(JSON.stringify({ error: "Livro não suportado" }), { status: 400, headers: CORS_HEADERS });
  }
  const bookId = bookIndex + 1; // IDs canônicos 1..66

  // Try provider 1: bible-edge (NVI PT-BR)
  try {
    const edgeRes = await fetch(`https://bible-edge.onrender.com/books/${bookId}/chapters/${chapter}/verses`);
    if (edgeRes.ok) {
      const data: Array<{ verse: number; text: string }> = await edgeRes.json();
      const verses = data.map((v) => ({ number: v.verse, text: v.text }));
      return new Response(JSON.stringify({ book: { abbrev: book }, chapter: { number: chapter, verses: verses.length }, verses }), {
        headers: CORS_HEADERS,
      });
    }
  } catch (_e) {
    // fall through to next provider
  }

  // Fallback provider: ABíbliaDigital (também NVI)
  try {
    const abiblia = await fetch(`https://www.abibliadigital.com.br/api/verses/nvi/${book}/${chapter}`);
    if (abiblia.ok) {
      const payload = await abiblia.json();
      // payload.verses: [{ number, text }]
      const verses = payload.verses?.map((v: any) => ({ number: v.number, text: v.text })) || [];
      return new Response(JSON.stringify({ book: { abbrev: book }, chapter: { number: chapter, verses: verses.length }, verses }), {
        headers: CORS_HEADERS,
      });
    }
  } catch (_e) {
    // ignore
  }

  return new Response(JSON.stringify({ error: "Falha ao obter capítulo de provedores" }), { status: 502, headers: CORS_HEADERS });
});
