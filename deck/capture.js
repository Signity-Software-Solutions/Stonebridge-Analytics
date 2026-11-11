// Capture the six deck screenshots from the running app at exactly 1440x860.
// The tour choice is preset in sessionStorage so no dialog or tour layer is
// in frame, and each scripted run is given time to finish on its own.
const puppeteer = require("puppeteer");

const BASE = "http://localhost:3100";
const SHOTS = [
  { file: "shots/shot-login.jpg", url: "/login", settleMs: 1500 },
  { file: "shots/shot-home.jpg", url: "/home?s=grouped", settleMs: 1500 },
  { file: "shots/shot-report.jpg", url: "/reports/program-spend?s=grouped", settleMs: 11000, scrollTo: 520 },
  { file: "shots/shot-guarded.jpg", url: "/reports/program-spend?s=guarded", settleMs: 9000, scrollTo: 520 },
  { file: "shots/shot-ask.jpg", url: "/ask?s=grouped", settleMs: 11000 },
  { file: "shots/shot-usage.jpg", url: "/analytics?s=grouped", settleMs: 1500 },
  { file: "shots/shot-catalog.jpg", url: "/reports?s=grouped", settleMs: 1500 },
];

(async () => {
  const browser = await puppeteer.launch({ headless: "new", executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 860 });
  await page.evaluateOnNewDocument(() => {
    try {
      window.sessionStorage.setItem("stonebridge-tour-choice", "explore");
    } catch {}
  });
  for (const s of SHOTS) {
    await page.goto(BASE + s.url, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, s.settleMs));
    if (s.scrollTo) {
      await page.evaluate((y) => window.scrollTo({ top: y }), s.scrollTo);
      await new Promise((r) => setTimeout(r, 600));
    }
    await page.screenshot({ path: s.file, type: "jpeg", quality: 90 });
    console.log("captured", s.file);
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
