#!/usr/bin/env node
/**
 * 🎯 POR QUÉ: Evitar regresiones de navegación, formularios y rendimiento detectadas por la auditoría maestra.
 * ⚙️ CÓMO: Aplica transformaciones idempotentes y acotadas a los HTML públicos, sin eliminar contenido ni alterar lógica de negocio.
 * 📦 QUÉ: Normaliza el canal oficial de YouTube, tipa botones de acción y difiere imágenes no críticas ya identificadas por su contexto.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html"));
let changedFiles = 0;
let typedButtons = 0;
let deferredImages = 0;

for (const file of htmlFiles) {
  const filePath = path.join(root, file);
  const original = fs.readFileSync(filePath, "utf8");
  let html = original.replaceAll('href="https://youtube.com"', 'href="https://youtube.com/@baqueanonicaragua"');

  html = html.replace(/<button(?![^>]*\btype=)([^>]*)>/gi, (_match, attributes) => {
    typedButtons += 1;
    return `<button type="button"${attributes}>`;
  });

  let imageIndex = 0;
  html = html.replace(/<img\b([^>]*)>/gi, (tag, attributes) => {
    imageIndex += 1;
    if (/\bloading=/i.test(attributes)) return tag;
    const isCritical = imageIndex <= 3 || /\b(hero|logo|brand|navbar|above-fold)\b|fetchpriority\s*=\s*["']high/i.test(attributes);
    if (isCritical) return tag;
    deferredImages += 1;
    const decoding = /\bdecoding=/i.test(attributes) ? "" : ' decoding="async"';
    return `<img loading="lazy"${decoding}${attributes}>`;
  });

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    changedFiles += 1;
  }
}

console.log(`Hardening applied: ${changedFiles} files, ${typedButtons} buttons, ${deferredImages} deferred images.`);
