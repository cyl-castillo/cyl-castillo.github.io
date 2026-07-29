# cyl-castillo.github.io

Landing page personal / CV de Carlos M. Castillo Chacón.

Sitio: https://cyl-castillo.github.io

## Cómo publicar

1. Crear el repo público en GitHub con el nombre **exacto** `cyl-castillo.github.io`.
2. Pushear:

   ```bash
   cd /home/father/Documents/workspaces/cyl-castillo.github.io
   git add -A
   git commit -m "init: landing CV"
   git branch -M main
   git remote add origin git@github.com:cyl-castillo/cyl-castillo.github.io.git
   git push -u origin main
   ```

3. GitHub Pages se activa solo para repos `<user>.github.io` en la rama `main`. En 1-2 min queda en `https://cyl-castillo.github.io`.

## Editar

Todo está en `index.html` (HTML + CSS embebido, sin build). Ajustá textos, agregá secciones o experiencia y volvé a pushear.

El contenido está escrito en el HTML **y** en el diccionario `I18N` del final: el HTML
es lo que ven los crawlers y los previews de LinkedIn/WhatsApp, el diccionario es lo que
se aplica al cambiar de idioma. Al tocar un texto hay que cambiarlo en los dos lugares,
y el estático tiene que coincidir **exacto** con la entrada `es` — si difieren, el texto
parpadea al cargar.

`?lang=es` / `?lang=en` fuerzan el idioma por URL (útil para compartir un link ya en un
idioma, y necesario para generar el PDF).

## Chequeo antes de pushear

```bash
node tools/check.mjs
```

Offline, no toca nada, sale con código 1 si hay algo bloqueante. Verifica lo que
se desincroniza solo:

- el HTML estático contra el diccionario `I18N` (y la paridad de claves es/en);
- que `cv.pdf` y `og-cover.png` no hayan quedado atrás del HTML del que salen —
  tanto sin commitear como ya commiteado;
- que las empresas y las métricas del sitio estén también en el `PROFILE` del worker.

Las métricas salen como WARN, no como error: el `PROFILE` puede decir lo mismo con
otras palabras. Un WARN pide una mirada, no bloquea.

Corre solo antes de cada push mediante un hook. Como `.git/` no se versiona, hay que
instalarlo una vez por clone:

```bash
./tools/install-hooks.sh
```

Para saltear un push puntual: `git push --no-verify`. Para desinstalarlo:
`rm .git/hooks/pre-push`.

## Assets derivados

Dos archivos del repo **no se editan a mano**: se generan desde el HTML.

```bash
./tools/build-assets.sh
```

- `og-cover.png` — portada social (`og:image`), 1200x630, desde `tools/og-cover.html`.
- `cv.pdf` — CV imprimible, desde `index.html` usando su bloque `@media print`.

Si editás `index.html` o `tools/og-cover.html`, corré el script y commiteá el resultado;
si no, el PDF y la portada quedan mostrando una versión vieja del CV. Necesita
`chromium` (o `chrome`) en el PATH.

## Chat agent

El widget ✦ pega contra un Cloudflare Worker que vive en `worker/`. Su perfil — lo único
que el agente puede afirmar — está en `worker/src/worker.js`: si agregás experiencia o
proyectos al sitio, actualizá también ese `PROFILE` y redeployá, o el chat va a
contradecir a la página. Ver `worker/README.md`.
