# Cloudflare-side fixes for AI agent readiness

This file lists the changes that **cannot** be made from the docs repo
(`atomiq-docs`) and have to be configured on the Cloudflare side that
fronts the Azure Blob Storage origin for `docs.atomiq.exchange`.

Pair this with the in-repo changes already shipped:

- `static/robots.txt` — explicit AI bot allow-list + sitemap reference + content signals
- `static/openapi.json` — REST API OpenAPI 3.1 spec served at `/openapi.json`
- `static/.well-known/api-catalog` — RFC 9727 linkset pointing at the OpenAPI spec
- `@signalwire/docusaurus-plugin-llms-txt` — emits `/llms.txt`, `/llms-full.txt`, and per-route `.md` mirrors
- `docusaurus.config.js` sitemap — now emits `<lastmod>` per URL

Baseline scores (2026-05-06) — for measuring before/after:

| Audit | Before |
|---|---|
| auditdocs.fun | 80/100 (B) |
| Cloudflare Agent Readiness | 8/100 (Level 0 — Not Ready) |

---

## 1. Make sure our `robots.txt` reaches the origin

**Symptom (Cloudflare audit):** `robots.txt exists but appears invalid (no User-agent directive)` — the served content is Cloudflare's auto-generated content-signals file, not ours.

**Fix:** disable Cloudflare's auto-`robots.txt` (or content-signals) feature for the `docs.atomiq.exchange` zone so the file we ship in `static/robots.txt` (which Docusaurus copies to `build/robots.txt`) is what gets served.

**Where:** Cloudflare dashboard → the zone for `atomiq.exchange` → Bots → AI Audit / Content signals (the exact path varies by plan; the feature is sometimes called "AI bot management" or "Content signals managed robots.txt"). Toggle off the auto-managed `robots.txt` for the docs subdomain.

After deploying the docs build, verify:

```bash
curl -s https://docs.atomiq.exchange/robots.txt | head -5
# First line should be: # Atomiq Docs — robots.txt
```

---

## 2. Markdown content negotiation (Accept: text/markdown)

**Symptom (Cloudflare audit):** `Site does not support Markdown for Agents` — requests with `Accept: text/markdown` get HTML back.

**Fix:** add a Cloudflare Worker (or a Transform Rule on Enterprise) that, when the request `Accept` header includes `text/markdown`, internally rewrites the URL to the `.md` mirror.

The llms.txt plugin emits a `<route>.md` next to every `<route>/index.html`, so the rewrite is purely path-level.

```js
// Cloudflare Worker — paste into a route bound to docs.atomiq.exchange/*
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const accept = request.headers.get('Accept') || '';

    // Only intercept GET / HEAD on HTML-shaped paths.
    if (
      (request.method === 'GET' || request.method === 'HEAD') &&
      accept.toLowerCase().includes('text/markdown') &&
      !url.pathname.endsWith('.md') &&
      !url.pathname.endsWith('.json') &&
      !url.pathname.endsWith('.txt') &&
      !url.pathname.match(/\.[a-z0-9]{2,4}$/i) // skip assets (.png, .css, .js, …)
    ) {
      // Map  "/foo/bar/"  →  "/foo/bar.md"
      // and  "/foo/bar"   →  "/foo/bar.md"
      const stripped = url.pathname.replace(/\/$/, '') || '/';
      const mdPath = stripped === '/' ? '/index.md' : `${stripped}.md`;
      const mdUrl = new URL(mdPath, url.origin);

      const upstream = await fetch(mdUrl.toString(), request);
      if (upstream.status === 200) {
        const headers = new Headers(upstream.headers);
        headers.set('Content-Type', 'text/markdown; charset=utf-8');
        headers.set('Vary', 'Accept');
        return new Response(upstream.body, {
          status: 200,
          headers,
        });
      }
    }

    return fetch(request);
  },
};
```

**Verify after deploy:**

```bash
curl -sI -H 'Accept: text/markdown' https://docs.atomiq.exchange/rest-api-guide/ \
  | grep -i content-type
# Expect: content-type: text/markdown; charset=utf-8
```

---

## 3. Link response headers (RFC 8288)

**Symptom (Cloudflare audit):** `No Link headers found on homepage`.

**Fix:** add a Transform Rule (or extend the Worker above) that adds Link headers to every HTML response. These advertise the API catalog, OpenAPI spec, and llms.txt to agents that read response headers for resource discovery.

**Cloudflare Transform Rule — Set Static Headers (recommended):**

| Header name | Value |
|---|---|
| `Link` | `</.well-known/api-catalog>; rel="api-catalog"` |
| (append) | `</openapi.json>; rel="service-desc"; type="application/json"` |
| (append) | `</llms.txt>; rel="alternate"; type="text/plain"; title="LLM index"` |
| (append) | `</sitemap.xml>; rel="sitemap"` |

Cloudflare's UI lets you set multiple `Link` headers; alternatively combine them into a single comma-separated value. Apply to the rule expression `(http.host eq "docs.atomiq.exchange" and starts_with(http.request.uri.path, "/"))`.

**Verify:**

```bash
curl -sI https://docs.atomiq.exchange/ | grep -i ^link
```

---

## 4. (Optional) Web Bot Auth directory

Cloudflare's Web Bot Auth lets verified AI agents authenticate themselves. If you want to participate, publish:

```
/.well-known/http-message-signatures-directory
```

This is a JSON file listing the public keys you trust. Cloudflare can auto-populate it via their Bot Management offering. Lower priority than items 1–3.

---

## 5. (Future) MCP server card and agent skills

Once we ship an Atomiq MCP server:

- `/.well-known/mcp/server-card.json` — SEP-1649 server card pointing at the MCP transport endpoint.
- `/.well-known/agent-skills/index.json` — Cloudflare Agent Skills Discovery v0.2.0 index of skills (e.g. `quote-swap`, `monitor-swap`).

Both are static JSON files we can drop into `static/.well-known/` once the MCP server's transport URL is known.

---

## Verification checklist after deploy

```bash
# 1. Our robots.txt is being served
curl -s https://docs.atomiq.exchange/robots.txt | head -3

# 2. AI bot rules present
curl -s https://docs.atomiq.exchange/robots.txt | grep -E '^User-agent: (GPTBot|ClaudeBot)'

# 3. Sitemap has lastmod
curl -s https://docs.atomiq.exchange/sitemap.xml | grep -m1 lastmod

# 4. llms.txt exists
curl -sI https://docs.atomiq.exchange/llms.txt | head -1

# 5. OpenAPI spec reachable
curl -sI https://docs.atomiq.exchange/openapi.json | head -1

# 6. API catalog reachable (note: linkset+json content-type ideal but JSON OK)
curl -sI https://docs.atomiq.exchange/.well-known/api-catalog | head -1

# 7. Markdown negotiation (after Worker deploy)
curl -sI -H 'Accept: text/markdown' https://docs.atomiq.exchange/rest-api-guide/ | grep -i content-type

# 8. Link headers (after Transform Rule deploy)
curl -sI https://docs.atomiq.exchange/ | grep -i ^link
```

Re-run https://auditdocs.fun and Cloudflare's agent-readiness scanner to confirm the score increase.
