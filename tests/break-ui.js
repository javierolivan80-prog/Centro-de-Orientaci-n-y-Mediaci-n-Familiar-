/*
 * Prueba de datos extremos (solo desarrollo, no se publica).
 *
 * Carga la web con valores realistas pero muy largos en js/config.js y la revisa
 * a varios anchos y con el texto ampliado al 200 %. Falla si algo se sale de la
 * pantalla o si un elemento queda cortado.
 *
 * Requisitos: npm i playwright   (y un Chromium instalado)
 * Uso:        node tests/break-ui.js
 * Opcional:   PLAYWRIGHT_CHROMIUM_PATH=/ruta/a/chromium node tests/break-ui.js
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const pages = ["index.html", "legal.html"];

// Valores largos pero plausibles (nombres, correos y direcciones reales tienen esta forma)
const worstCase = {
  centerName: "Centro de Orientación, Mediación y Terapia Familiar Santa María de los Ángeles y San José de la Montaña, S.L.P.",
  phone: "+34 (0) 91 123 45 67 / +34 600 123 456 (WhatsApp)",
  phoneHref: "+34911234567",
  email: "atencion.familias.y.parejas.consultas@centro-de-orientacion-y-mediacion-familiar.example.com",
  address: "Calle del Doctor Fernández-Rodríguez de la Concepción Arenal, 128, 3.º B, Edificio Torre Norte, 28001 Alcalá de Henares, Madrid",
  schedule: "De lunes a jueves de 9:00 a 14:00 y de 16:00 a 20:00; viernes de 9:00 a 14:00; sábados con cita previa",
  founderName: "Aleksandra Wiśniewska-Kowalczyk de la Cruz y Fernández",
  founderTraining: "Licenciatura en Psicología por la Universidad Complutense de Madrid y Grado en Trabajo Social por la Universidad de Navarra",
  founderMaster: "Máster Universitario en Orientación y Mediación Familiar · Universidad de Navarra (UNAV)",
  founderExperience: "Experiencia en servicios sociales, centros de orientación familiar y programas de apoyo a la parentalidad positiva",
  founderApproach: "Enfoque centrado en la persona, sistémico y de mediación transformativa, adaptado a cada familia",
  founderMotivation: "Acompañar a las familias en los momentos en que más lo necesitan, con respeto y sin juicios",
  socials: [
    { name: "Instagram del centro", url: "https://www.instagram.com/example" },
    { name: "Facebook del centro de orientación familiar", url: "https://www.facebook.com/example" },
    { name: "LinkedIn", url: "https://www.linkedin.com/company/example" },
    { name: "YouTube", url: "https://www.youtube.com/@example" },
  ],
  formEndpoint: "",
};

const widths = [320, 375, 768, 1440];
const problems = [];

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });

  for (const file of pages) {
    for (const zoom of [100, 200]) {
      for (const width of widths) {
        const page = await browser.newPage({ viewport: { width, height: 800 } });
        const label = `${file} @${width}px, texto ${zoom}%`;

        await page.route("**/js/config.js", (route) => {
          const body = "window.SITE_CONFIG = " + JSON.stringify(worstCase) + ";";
          route.fulfill({ contentType: "application/javascript", body });
        });

        await page.goto("file://" + path.join(root, file), { waitUntil: "load" });
        if (zoom !== 100) await page.addStyleTag({ content: `html { font-size: ${zoom}% !important; }` });
        await page.evaluate(() =>
          document.querySelectorAll(".reveal, .photo").forEach((el) => el.classList.add("is-visible"))
        );
        await page.waitForTimeout(700);

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (overflow > 0) problems.push(`${label}: desbordamiento horizontal de ${overflow}px`);

        // Elementos cuyo borde derecho supera el ancho de la ventana
        const offenders = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          const out = [];
          document.querySelectorAll("body *").forEach((el) => {
            const cs = getComputedStyle(el);
            if (cs.position === "fixed" || cs.visibility === "hidden" || el.closest("[inert]")) return;
            if (el.closest(".hp") || el.closest(".panel:not(.is-active)")) return;
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.right > vw + 1) out.push(el.tagName.toLowerCase() + "." + (el.className || "").toString().split(" ")[0]);
          });
          return out.slice(0, 5);
        });
        if (offenders.length) problems.push(`${label}: elementos fuera de pantalla -> ${offenders.join(", ")}`);

        // Texto cortado dentro de cajas con overflow oculto
        const clipped = await page.evaluate(() => {
          const out = [];
          document.querySelectorAll(".contact-list *, .profile-data dd, .footer-grid *, .btn, .brand *").forEach((el) => {
            if (el.closest("[inert]") || !el.children.length === 0) return;
            const cs = getComputedStyle(el);
            if (cs.overflow !== "visible" && el.scrollWidth > el.clientWidth + 1) {
              out.push(el.tagName.toLowerCase() + "." + (el.className || "").toString().split(" ")[0]);
            }
          });
          return out.slice(0, 5);
        });
        if (clipped.length) problems.push(`${label}: texto cortado -> ${clipped.join(", ")}`);

        await page.close();
      }
    }
  }

  await browser.close();

  if (problems.length) {
    console.log("PROBLEMAS ENCONTRADOS:");
    problems.forEach((p) => console.log(" - " + p));
    process.exit(1);
  }
  console.log("Sin problemas: ningún desbordamiento ni texto cortado con datos extremos.");
})().catch((error) => {
  console.error(error);
  process.exit(2);
});
