# cv-agent worker

Cloudflare Worker que responde preguntas sobre el CV de Carlos usando **Cloudflare Workers AI** (Llama 3.1 8B) — 100% gratis dentro del free tier de Cloudflare.

## Deploy (una sola vez)

```bash
cd worker
npm install -g wrangler
wrangler login        # OAuth a Cloudflare en el browser
wrangler deploy       # despliega el worker
```

`wrangler deploy` te devuelve la URL: `https://cv-agent.<tu-subdominio>.workers.dev`. Esa URL hay que pegarla en `index.html` (constante `AGENT_URL`).

**No hay secrets que setear** — Workers AI usa la cuenta de Cloudflare directamente.

## Costo

- **Workers:** 100k requests/día gratis.
- **Workers AI:** 10k neurons/día gratis. Llama 3.1 8B consume ~50-150 neurons por respuesta corta → alcanza para ~80-200 conversaciones diarias.

Si querés más volumen o mejor calidad: el plan Workers Paid arranca en USD 5/mes y multiplica los límites x10.

## Cambiar de modelo

En `src/worker.js`, constante `MODEL`. Alternativas dentro del free tier:
- `@cf/meta/llama-3.1-8b-instruct` (default, balance ok)
- `@cf/mistral/mistral-7b-instruct-v0.1` (más rápido)
- `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (más calidad, paga por neurons usados pero sigue siendo cheap)

Catálogo completo: https://developers.cloudflare.com/workers-ai/models/

## Test local

```bash
wrangler dev --remote   # --remote es necesario para usar Workers AI
# en otra terminal:
curl -X POST http://localhost:8787 \
  -H 'origin: http://localhost:8000' \
  -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"que hace Carlos?"}]}'
```
