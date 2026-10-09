/*
 * Exporta los banners a PNG con el tamaño exacto de cada plataforma.
 *
 * Requisitos: npm i playwright   (y un Chromium instalado)
 * Uso:        node scripts/export-banners.js
 * Opcional:   PLAYWRIGHT_CHROMIUM_PATH=/ruta/a/chromium node scripts/export-banners.js
 *
 * Salida: assets/banners/primera-consulta/{estilo}-{ancho}x{alto}.png
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const source = "file://" + path.join(root, "assets/banners/source/banner.html");
const outDir = path.join(root, "assets/banners/primera-consulta");

const styles = ["organic", "editorial", "gradient"];
const sizes = [
  { key: "og", width: 1200, height: 630 },     // compartir en redes y vista previa de enlaces
  { key: "square", width: 1080, height: 1080 }, // post de Instagram
  { key: "cover", width: 820, height: 312 },    // portada de Facebook (escritorio)
];

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });

  for (const style of styles) {
    for (const size of sizes) {
      const page = await browser.newPage({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1 });
      await page.goto(`${source}?style=${style}&size=${size.key}`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);

      const banner = await page.$("#banner");
      const box = await banner.boundingBox();
      if (Math.round(box.width) !== size.width || Math.round(box.height) !== size.height) {
        throw new Error(`${style}-${size.key}: tamaño ${box.width}x${box.height}, se esperaba ${size.width}x${size.height}`);
      }

      const file = path.join(outDir, `${style}-${size.width}x${size.height}.png`);
      await banner.screenshot({ path: file });
      console.log("OK", path.relative(root, file));
      await page.close();
    }
  }

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
