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
