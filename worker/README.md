# cv-agent worker

Cloudflare Worker que responde preguntas sobre el CV de Carlos usando **Cloudflare Workers AI** — dentro del free tier de Cloudflare.

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
- **Workers AI:** 10k neurons/día gratis. Un modelo 8B consume ~50-150 neurons por respuesta corta; el 70B fp8-fast del primer lugar de la cadena consume bastante más. Para el tráfico de un CV personal alcanza de sobra.

Si querés más volumen o mejor calidad: el plan Workers Paid arranca en USD 5/mes y multiplica los límites x10.

## Modelos

En `src/worker.js`, constante `MODELS`: es una **cadena de fallback**, se prueban en orden y
gana el primero que responde. La respuesta incluye `model` para saber cuál contestó.

Existe por una razón concreta: el modelo fijo original (`@cf/meta/llama-3.1-8b-instruct`) se
deprecó el 2026-05-30 y el widget quedó devolviendo 502 sin que nadie se enterara. Con la
cadena, la próxima deprecación degrada a un modelo menor en vez de romper el chat.

Cuando agregues o cambies modelos, verificá contra el catálogo — los IDs se deprecan seguido:
https://developers.cloudflare.com/workers-ai/models/

## Test local

```bash
wrangler dev --remote   # --remote es necesario para usar Workers AI
# en otra terminal:
curl -X POST http://localhost:8787 \
  -H 'origin: http://localhost:8000' \
  -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"que hace Carlos?"}]}'
```
