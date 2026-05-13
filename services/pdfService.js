import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";

/**
 * Genera un PDF a partir de HTML usando Chromium headless.
 *
 * - En producción (Linux/Railway): usa @sparticuz/chromium (binario optimizado).
 * - En local (Mac/Windows): usa el puppeteer normal que descarga su propio Chromium.
 *
 * Reutiliza el browser entre peticiones para evitar el cold start.
 */

let browserPromise = null;

async function launchBrowser() {
  // En producción, Railway expone NODE_ENV=production y estamos en Linux.
  // En local (Mac/Windows) usamos puppeteer completo.
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    return puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  // Desarrollo local: importar puppeteer dinámicamente para que no falle
  // si no está instalado en producción.
  const { default: puppeteer } = await import("puppeteer");
  return puppeteer.launch({ headless: true });
}

async function getBrowser() {
  if (browserPromise) return browserPromise;
  browserPromise = launchBrowser();
  return browserPromise;
}

export async function htmlToPdf(html) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 15000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "12mm",
        right: "12mm",
        bottom: "12mm",
        left: "12mm",
      },
    });

    return pdfBuffer;
  } finally {
    await page.close();
  }
}

process.on("SIGTERM", async () => {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
  }
});