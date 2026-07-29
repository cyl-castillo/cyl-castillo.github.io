// Chequeo previo al push. Corre offline y no toca nada:
//
//   node tools/check.mjs
//
// El sitio guarda el mismo dato en tres lugares que se desincronizan solos:
// el HTML estatico, el diccionario I18N, y el PROFILE del worker (mas dos
// artefactos, cv.pdf y og-cover.png, que se generan del HTML). Editar uno y
// olvidar los otros no rompe nada visible: el sitio queda bien y el PDF o el
// chat siguen diciendo lo viejo. Esto lo caza antes de publicarlo.
//
// FAIL bloquea; WARN pide una mirada.

import { readFileSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = (f) => join(ROOT, f);

const fails = [];
const warns = [];
const fail = (m) => fails.push(m);
const warn = (m) => warns.push(m);

const html = readFileSync(p("index.html"), "utf8");
const worker = readFileSync(p("worker/src/worker.js"), "utf8");

// ── 1. HTML estatico vs diccionario ────────────────────────────────────────
// El HTML es lo que ven los crawlers; el diccionario, lo que se aplica al
// cambiar de idioma. Si difieren, el texto parpadea al cargar.
const I18N = eval(
  html.slice(html.indexOf("const I18N = {"), html.indexOf("const STORAGE_KEY"))
    .replace(/;\s*$/, "")
    .replace("const I18N =", "(") + ")"
);

const body = html.slice(html.indexOf("<body>"), html.indexOf("<script>"));
const seen = new Set();
let ok = 0;
for (const m of body.matchAll(/<(\w+)([^>]*\bdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g)) {
  const key = m[3];
  seen.add(key);
  const text = m[4].replace(/<[^>]+>/g, "").trim();
  const expected = (I18N.es[key] ?? "").trim();
  if (!text) fail(`i18n: <${m[1]} data-i18n="${key}"> esta vacio en el HTML`);
  else if (text !== expected) fail(`i18n: "${key}" difiere entre el HTML y el diccionario es`);
  else ok++;
}
for (const k of Object.keys(I18N.es)) {
  if (!k.startsWith("agent.") && !seen.has(k)) warn(`i18n: la clave "${k}" no la usa ningun elemento`);
}
const esk = Object.keys(I18N.es).sort().join(",");
const enk = Object.keys(I18N.en).sort().join(",");
if (esk !== enk) fail("i18n: las claves es y en no coinciden");

// ── 2. Artefactos al dia ───────────────────────────────────────────────────
// Se comparan por commit, no por mtime: en un clone todos los mtime son iguales.
// Sin trim sobre la salida entera: en --porcelain los dos primeros caracteres
// son el estado, y recortar el espacio inicial de la primera linea desplaza el
// nombre del archivo un caracter (index.html -> ndex.html).
const git = (args) => {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
  } catch {
    return "";
  }
};
const dirty = new Set(
  git(["status", "--porcelain"])
    .split("\n")
    .filter((l) => l.length > 3)
    .map((l) => l.slice(3).trim())
);
const commitTime = (f) => Number(git(["log", "-1", "--format=%ct", "--", f]).trim() || 0);

for (const [src, out] of [["index.html", "cv.pdf"], ["tools/og-cover.html", "og-cover.png"]]) {
  if (!existsSync(p(out))) {
    fail(`assets: falta ${out} — corre ./tools/build-assets.sh`);
    continue;
  }
  if (dirty.has(src) && !dirty.has(out)) {
    fail(`assets: editaste ${src} pero ${out} sigue igual — corre ./tools/build-assets.sh`);
  } else if (!dirty.has(src) && !dirty.has(out) && commitTime(src) > commitTime(out)) {
    fail(`assets: ${out} se commiteo antes que ${src} — regeneralo y commitealo`);
  }
}

// ── 3. PROFILE del worker vs el sitio ──────────────────────────────────────
// El agente solo puede afirmar lo que dice su PROFILE: si el sitio suma un
// dato y el PROFILE no, el chat contradice a la pagina.
const expSection = body.slice(body.indexOf('id="experience"'), body.indexOf('id="skills"'));
const companies = [...expSection.matchAll(/<div class="meta">([^<]+)<\/div>/g)]
  .map((m) => m[1].split("·")[0].trim())
  .filter(Boolean);
for (const c of new Set(companies)) {
  if (!worker.includes(c)) fail(`profile: "${c}" esta en el sitio pero no en el PROFILE del worker`);
}

// El PROFILE esta en ingles: se compara contra el diccionario en.
for (const [key, text] of Object.entries(I18N.en)) {
  if (!/^(exp\.r\d\.desc|proj\.p\d\.desc)$/.test(key)) continue;
  for (const m of text.matchAll(/(\d[\d.,]*)\s+[a-z]+/gi)) {
    const phrase = m[0];
    if (/^(19|20)\d{2}$/.test(m[1])) continue; // un ano no es una metrica
    if (!worker.includes(phrase)) {
      warn(`profile: "${phrase}" (de ${key}) no aparece tal cual en el PROFILE — revisa que el chat sepa el dato`);
    }
  }
}

// ── salida ─────────────────────────────────────────────────────────────────
console.log(`i18n: ${seen.size} elementos, ${ok} coinciden con el diccionario`);
for (const w of warns) console.log(`  WARN  ${w}`);
for (const f of fails) console.log(`  FAIL  ${f}`);
console.log();
if (fails.length) {
  console.log(`${fails.length} problema(s) que bloquean. No pushees asi.`);
  process.exit(1);
}
console.log(warns.length ? `sin bloqueantes, ${warns.length} warning(s).` : "todo en orden.");
