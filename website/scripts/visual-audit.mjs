/**
 * WHY
 * Provides evidence for responsive checks beyond successful compilation.
 *
 * HOW
 * Opens selected public/admin routes at required viewport widths, captures screenshots,
 * and records horizontal overflow or runtime errors.
 *
 * WHAT
 * Generates `docs/visual-audit/report.md`, `report.json`, and PNG screenshots.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const widths = [320, 360, 375, 390, 412, 430, 768, 820, 1024, 1280, 1366, 1440, 1920, 2560];
const routes = [
  { name: "web-home", url: "http://localhost:3000/" },
  { name: "web-destinos", url: "http://localhost:3000/destinos" },
  { name: "web-mapa", url: "http://localhost:3000/mapa" },
  { name: "admin-dashboard", url: "http://localhost:3001/dashboard" },
  { name: "admin-destinos", url: "http://localhost:3001/destinos" }
];

const outputDir = path.resolve("docs/visual-audit");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const route of routes) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: width < 768 ? 760 : 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    const response = await page.goto(route.url, { waitUntil: "networkidle", timeout: 30000 });
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyWidth: document.body.scrollWidth
    }));
    const screenshot = `${route.name}-${width}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: true });
    await page.close();

    results.push({
      route: route.name,
      width,
      status: response?.status() ?? 0,
      horizontalOverflow: metrics.scrollWidth > metrics.clientWidth || metrics.bodyWidth > metrics.clientWidth,
      metrics,
      errors,
      screenshot
    });
  }
}

await browser.close();

const failing = results.filter((item) => item.status >= 400 || item.horizontalOverflow || item.errors.length > 0);
const rows = results.map((item) => `| ${item.route} | ${item.width} | ${item.status} | ${item.horizontalOverflow ? "yes" : "no"} | ${item.errors.length} | ${item.screenshot} |`).join("\n");
const markdown = `# Visual Audit\n\n## Summary\n\n- Routes checked: ${routes.length}\n- Viewport widths checked: ${widths.join(", ")}\n- Total checks: ${results.length}\n- Failing checks: ${failing.length}\n\n## Results\n\n| Route | Width | HTTP | Overflow | Console errors | Screenshot |\n|---|---:|---:|---|---:|---|\n${rows}\n`;

await writeFile(path.join(outputDir, "report.json"), JSON.stringify({ results, failing }, null, 2));
await writeFile(path.join(outputDir, "report.md"), markdown);

if (failing.length > 0) {
  console.error(`${failing.length} visual audit checks failed.`);
  process.exit(1);
}
