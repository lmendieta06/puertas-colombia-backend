import puppeteerCore from "puppeteer-core";

let browserPromise = null;

async function launchBrowser() {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    // En Railway: usar el Chromium instalado por apt en el Dockerfile
    return puppeteerCore.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
      ],
    });
  }

  // Local: usar puppeteer completo
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