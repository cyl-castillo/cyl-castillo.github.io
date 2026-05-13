# cv-agent worker

Cloudflare Worker que proxea mensajes desde la landing a la Anthropic API con un system prompt limitado al CV de Carlos.

## Deploy (una sola vez)

```bash
cd worker
npm install -g wrangler
wrangler login                              # abre browser, OAuth a Cloudflare
wrangler secret put ANTHROPIC_API_KEY       # pega tu sk-ant-... cuando pregunte
wrangler deploy                             # despliega y te da la URL
```

Tras `wrangler deploy` vas a recibir una URL tipo `https://cv-agent.<tu-subdominio>.workers.dev`.

Copiá esa URL y pegala en `index.html` reemplazando el placeholder en la constante `AGENT_URL`.

## Rate limiting (opcional, recomendado)

En el dashboard de Cloudflare → Workers → cv-agent → Settings → Rate Limiting, sumá una rule:
- 10 requests / 1 minute por IP

## Costo estimado

Con `claude-haiku-4-5`, ~600 tokens out + 1500 in por respuesta = ~USD 0.0015 por mensaje. Mil conversaciones = ~USD 1.50.

## Local test

```bash
wrangler dev
# en otra terminal:
curl -X POST http://localhost:8787 \
  -H 'origin: http://localhost:8000' \
  -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"que hace Carlos?"}]}'
```
