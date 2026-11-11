// Stonebridge case study deck, in the house portfolio grammar: white ground, big
// dark serif titles, azure accents, solid azure icon circles, light blue
// tinted cards with thin borders, numbered circle process row, azure header
// table, grey case study footer.
const pptxgen = require("pptxgenjs");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const Fi = require("react-icons/fi");

const SKILL = "C:/Users/SSSPL-L-109/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/6818903b-a6e0-43f8-a617-3f5c735f5ebd/d1129892-58f8-405f-98ad-a953775dcfe7/skills/pptx";
const { applyTheme } = require(SKILL + "/scripts/apply_theme.js");

// ---------- palette ----------
const INK = "16212E", AZURE = "2E86DE", BODY = "3A4A5A", MUTE = "7A8795",
  CARD = "EDF4FB", CARDLN = "BFD9F2", NAVY = "171F2B", ORANGE = "E86A2B",
  WHITE = "FFFFFF", ZEBRA = "F4F8FC";

const THEME = {
  name: "Stonebridge case study",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: { dk1: INK, lt1: WHITE, dk2: BODY, lt2: CARD, accent1: AZURE,
    accent2: ORANGE, accent3: NAVY, accent4: MUTE, accent5: CARDLN,
    accent6: ZEBRA, hlink: AZURE, folHlink: MUTE },
};

async function iconPng(Icon, color) {
  const svg = renderToStaticMarkup(React.createElement(Icon, { color: "#" + color, size: 256, strokeWidth: 2 }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer()).toString("base64");
}

(async () => {
  const I = {};
  for (const [k, Ic] of Object.entries({
    login: Fi.FiKey, home: Fi.FiGrid, ask: Fi.FiMessageCircle, chart: Fi.FiBarChart2,
    shield: Fi.FiShield, gauge: Fi.FiActivity, map: Fi.FiMap, clock: Fi.FiClock,
    layers: Fi.FiLayers, zap: Fi.FiZap, monitor: Fi.FiMonitor, play: Fi.FiPlayCircle,
    compass: Fi.FiCompass, check: Fi.FiCheckCircle,
  })) I[k] = await iconPng(Ic, WHITE);

  // The mark: gradient tile holding a compass ring and needle.
  const LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">'
    + '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
    + '<stop offset="0" stop-color="#6366F1"/><stop offset="1" stop-color="#4338CA"/>'
    + '</linearGradient></defs>'
    + '<rect width="256" height="256" rx="58" fill="url(#g)"/>'
    + '<text x="100" y="180" font-family="Georgia, serif" font-size="152" font-weight="bold" fill="#FFFFFF" text-anchor="middle">S</text>'
    + '<rect x="164" y="132" width="20" height="52" rx="8" fill="#FFFFFF" opacity="0.55"/>'
    + '<rect x="196" y="100" width="20" height="84" rx="8" fill="#FFFFFF"/>'
    + '</svg>';
  fs.writeFileSync("logo-tile.png", await sharp(Buffer.from(LOGO_SVG)).resize(512, 512).png().toBuffer());

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
  pres.theme = { headFontFace: "Cambria", bodyFontFace: "Calibri" };
  pres.author = "Portfolio";
  pres.title = "Stonebridge Analytics, every claim accounted for";

  pres.defineSlideMaster({ title: "TITLE", background: { color: WHITE }, objects: [] });
  pres.defineSlideMaster({
    title: "CONTENT",
    background: { color: WHITE },
    objects: [
      { text: { text: "Stonebridge case study", options: { x: 0.65, y: 7.05, w: 4, h: 0.3, fontSize: 11, color: MUTE, margin: 0, isTextBox: true } } },
    ],
  });

  // ---------- grammar helpers ----------
  function T(s, t, o) { s.addText(t, Object.assign({ isTextBox: true, margin: 0, fontFace: "Calibri" }, o)); }
  function logo(s, x, y, big = false) {
    const t = big ? 0.78 : 0.5;
    s.addImage({ path: "logo-tile.png", x, y, w: t, h: t });
    T(s, "Stonebridge", { x: x + t + 0.15, y: y + (big ? 0.0 : 0.05), w: big ? 3.6 : 1.55, h: big ? 0.5 : 0.36, fontSize: big ? 26 : 16, bold: true, color: INK, fontFace: "Cambria" });
    if (big) T(s, "ANALYTICS  ·  EVERY CLAIM, ACCOUNTED FOR", { x: x + t + 0.16, y: y + 0.5, w: 4.2, h: 0.24, fontSize: 8, color: MUTE, charSpacing: 2.5 });
  }
  function title(s, text) {
    T(s, text, { x: 0.65, y: 0.5, w: 10.1, h: 0.75, fontSize: 32, bold: true, color: INK, fontFace: "Cambria" });
    logo(s, 10.95, 0.52);
  }
  function card(s, x, y, w, h, fill = CARD) {
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { color: CARDLN, width: 1 } });
  }
  function iconCircle(s, x, y, icon, d = 0.72) {
    s.addShape("ellipse", { x, y, w: d, h: d, fill: { color: AZURE }, line: { type: "none" } });
    const pad = d * 0.26;
    s.addImage({ data: icon, x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad });
  }
  /** screenshot in a thin rounded frame; height follows the file's aspect */
  function shot(s, path, x, y, w, aspect) {
    const h = w / aspect;
    s.addShape("roundRect", { x: x - 0.06, y: y - 0.06, w: w + 0.12, h: h + 0.12, rectRadius: 0.1, fill: { color: WHITE }, line: { color: CARDLN, width: 1.25 }, shadow: { type: "outer", color: INK, opacity: 0.18, blur: 9, offset: 3, angle: 90 } });
    s.addImage({ path, x, y, w, h });
    return h;
  }
  const WIDE = 1440 / 860, REPORT = 1440 / 860, GUARD = 1440 / 860;

  // =======================================================================
  // 1 - TITLE
  {
    const s = pres.addSlide({ masterName: "TITLE" });
    logo(s, 0.65, 0.55, true);
    T(s, "Stonebridge Analytics", { x: 0.62, y: 1.85, w: 6.2, h: 1.75, fontSize: 44, bold: true, color: INK, fontFace: "Cambria" });
    T(s, "Governed Claims Reporting  \u00b7  A Solved Use Case", { x: 0.65, y: 3.65, w: 6.3, h: 0.45, fontSize: 18, color: AZURE });
    T(s, "A corporate claims program\u2019s reporting, rebuilt on one governed semantic layer with a conversational layer on top. An analyst signs in, reads the program at a glance, asks a report a question in plain English and watches it become a saved, governed chart.", { x: 0.65, y: 4.25, w: 5.9, h: 1.3, fontSize: 14, color: BODY });
    T(s, "A solved use case, presented under a fictional brand with fictional data.", { x: 0.65, y: 6.0, w: 5.9, h: 0.3, fontSize: 11, color: MUTE });
    T(s, "SQL Server warehouse  \u00b7  Cube semantic layer  \u00b7  Python FastAPI  \u00b7  LLM orchestration  \u00b7  Web client", { x: 0.65, y: 6.85, w: 8, h: 0.3, fontSize: 12, color: AZURE });
    const h = shot(s, "shots/shot-login.jpg", 7.0, 1.9, 5.7, WIDE);
    T(s, "The front door: company SSO into the workspace", { x: 7.0, y: 1.95 + h + 0.08, w: 5.7, h: 0.3, align: "center", fontSize: 11, color: MUTE });
  }

  // 2 - THE IDEA
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "The use case");
    T(s, "A corporate claims program ran its reporting on aging BI tooling: dozens of reports, numbers that disagreed between systems, and weeks of work for every new view. The fix was structural: one governed semantic layer over the warehouse, every report rebuilt on it, and a conversational layer so analysts ask instead of waiting on a queue.", { x: 0.65, y: 1.45, w: 12.0, h: 0.95, fontSize: 15, color: BODY });
    const stats = [
      ["46", "reports, one model", "finance, operations and partner reporting rebuilt on a governed semantic layer"],
      ["6.2s", "question to chart", "median time from plain English to a governed chart saved on the report"],
      ["4", "ways a question ends", "answered, compared, rewritten, or refused by the access check"],
    ];
    stats.forEach(([n, l, d], i) => {
      const x = 0.65 + i * 4.18;
      card(s, x, 2.65, 3.9, 2.9);
      T(s, n, { x: x + 0.35, y: 2.95, w: 3.2, h: 0.85, fontSize: 48, bold: true, color: AZURE, fontFace: "Cambria" });
      T(s, l, { x: x + 0.35, y: 3.95, w: 3.2, h: 0.4, fontSize: 17, bold: true, color: INK });
      T(s, d, { x: x + 0.35, y: 4.42, w: 3.2, h: 0.85, fontSize: 12, color: BODY });
    });
    T(s, "This showcase plays the whole journey on scripted data, so the use case can be walked end to end in any browser.", { x: 0.65, y: 5.95, w: 12, h: 0.35, fontSize: 13, color: MUTE });
  }

  // 3 - THE JOURNEY (process row)
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "How it is solved");
    const steps = [
      ["1. Warehouse", "every figure lives in one SQL warehouse", I.layers],
      ["2. Semantic layer", "Cube models measures, dimensions and tenancy", I.map],
      ["3. Python API", "FastAPI applies roles, scope and guardrails", I.shield],
      ["4. Ask in English", "the LLM builds a query from the governed catalog", I.ask],
      ["5. Saved answers", "charts pin back onto the report for the team", I.check],
    ];
    const cy = 2.75, d = 0.95;
    s.addShape("line", { x: 1.6, y: cy + d / 2, w: 10.1, h: 0, line: { color: AZURE, width: 2 } });
    steps.forEach(([t, dsc, ic], i) => {
      const cx = 1.15 + i * 2.53;
      iconCircle(s, cx, cy, ic, d);
      T(s, t, { x: cx - 0.8, y: cy + 1.25, w: d + 1.6, h: 0.35, align: "center", fontSize: 15, bold: true, color: INK });
      T(s, dsc, { x: cx - 0.85, y: cy + 1.65, w: d + 1.7, h: 0.9, align: "center", fontSize: 11.5, color: MUTE });
    });
    T(s, "Reports and the question dock read the same definitions, so a number matches everywhere it appears. The showcase plays stages 4 and 5 live on every report screen.", { x: 1.6, y: 5.9, w: 10.1, h: 0.7, align: "center", fontSize: 14, color: BODY });
  }

  // 4 - THE WORKSPACE
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "The workspace");
    const h = shot(s, "shots/shot-home.jpg", 0.65, 1.7, 7.6, WIDE);
    T(s, "The overview: program tiles, the newest files and pinned reports.", { x: 0.65, y: 1.75 + h + 0.1, w: 7.6, h: 0.3, align: "center", fontSize: 11, color: MUTE });
    const pts = [
      ["One governed model", "the tiles, the file table and every report trace to warehouse SQL through the semantic layer, refreshed nightly."],
      ["Trend at a glance", "program tiles carry their own history, so a number arrives with its direction, not just its size."],
      ["A quiet start", "a welcome dialog offers a short guided tour once per session; the tour rings live regions of the page."],
    ];
    pts.forEach(([t, d], i) => {
      const y = 1.7 + i * 1.55;
      card(s, 8.55, y, 4.15, 1.4);
      T(s, t, { x: 8.8, y: y + 0.18, w: 3.7, h: 0.35, fontSize: 14, bold: true, color: INK });
      T(s, d, { x: 8.8, y: y + 0.55, w: 3.7, h: 0.8, fontSize: 11, color: BODY });
    });
  }

  // 5 - THE REPORT AND THE DOCK
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "The report and the dock");
    const pts = [
      ["Built in views", "summary tiles, curated charts and a line by line table, all scoped by the same slicers."],
      ["The pipeline, visible", "the dock shows each production stage as it runs: context, matching, the access check, the query, the chart."],
      ["First class answers", "a saved answer becomes a report chart like any other: same slicers, same refresh, visible to the whole team."],
    ];
    pts.forEach(([t, d], i) => {
      const y = 1.7 + i * 1.55;
      card(s, 0.65, y, 4.15, 1.4);
      T(s, t, { x: 0.9, y: y + 0.18, w: 3.7, h: 0.35, fontSize: 14, bold: true, color: INK });
      T(s, d, { x: 0.9, y: y + 0.55, w: 3.7, h: 0.8, fontSize: 11, color: BODY });
    });
    const h = shot(s, "shots/shot-report.jpg", 5.1, 1.7, 7.6, REPORT);
    T(s, "Program Spend after a run: the question, the checked steps and the saved chart.", { x: 5.1, y: 1.75 + h + 0.1, w: 7.6, h: 0.3, align: "center", fontSize: 11, color: MUTE });
  }

  // 6 - THE GUARDRAIL
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "The guardrail");
    const h = shot(s, "shots/shot-guarded.jpg", 0.65, 1.8, 7.3, GUARD);
    T(s, "A question about medical data stops at the access check, with the reason and a better ask.", { x: 0.65, y: 1.85 + h + 0.1, w: 7.3, h: 0.3, align: "center", fontSize: 11, color: MUTE });
    const pts = [
      ["Guarded in the model", "medical and personal fields are marked private in the semantic layer itself, not in UI code."],
      ["Refused before the query", "the access check stops the run before anything reaches the warehouse, and says why."],
      ["Refused on the record", "the activity log keeps the refusal and the reason, never the blocked data."],
    ];
    pts.forEach(([t, d], i) => {
      const y = 1.7 + i * 1.55;
      card(s, 8.55, y, 4.15, 1.4);
      T(s, t, { x: 8.8, y: y + 0.18, w: 3.7, h: 0.35, fontSize: 14, bold: true, color: INK });
      T(s, d, { x: 8.8, y: y + 0.55, w: 3.7, h: 0.8, fontSize: 11, color: BODY });
    });
  }

  // 7 - FOUR QUESTIONS TABLE
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "Four questions, four endings");
    const hdr = { bold: true, color: WHITE, fill: { color: AZURE }, fontFace: "Calibri" };
    const rows = [
      ["Question", "What happens", "Ends as", "Why it matters"].map((t) => ({ text: t, options: hdr })),
      ["Paid by claim category this fiscal year", "a clean first pass build", "A saved donut", "the happy path reads effortless"],
      ["Monthly paid against last year", "two windows, one query", "A two line trend", "prior year comparisons are one sentence"],
      ["Which regions cost the most", "48 members would not read; rewritten to the top 8", "Ranked bars", "the assistant narrows vague asks and says so"],
      ["Average medical cost by diagnosis", "the access check stops the run", "A refusal with a better ask", "protected fields stay protected, visibly"],
    ];
    s.addTable(rows.map((r, ri) => r.map((c, ci) => typeof c === "string" ? { text: c, options: { color: ci === 2 && ri > 0 ? INK : BODY, bold: ci === 0 || ci === 2 ? ri > 0 : false, fill: { color: ri % 2 ? WHITE : ZEBRA } } } : c)), {
      x: 0.65, y: 1.7, w: 12.05, colW: [3.3, 3.6, 2.2, 2.95], fontSize: 12.5, fontFace: "Calibri",
      border: { type: "solid", color: CARDLN, pt: 0.75 }, rowH: 0.55, valign: "middle", margin: 7,
    });
    T(s, "Each question is one typed script: the text, the pipeline steps with durations, and the chart or refusal it ends in. The header pills switch them and every screen accepts the question in its URL.", { x: 0.65, y: 4.75, w: 12.05, h: 0.6, fontSize: 13.5, color: BODY });
    T(s, "Example: /reports/program-spend?s=guarded opens the report straight into the refusal run.", { x: 0.65, y: 5.5, w: 12.05, h: 0.4, fontSize: 13, color: MUTE });
  }

  // 8 - UNDER THE HOOD
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "How it is built");
    const cards = [
      ["Semantic layer", I.layers, "Cube models every measure, dimension and join over the warehouse. Reports and the question dock read the same definitions, so one number means one thing everywhere."],
      ["First class answers", I.check, "A saved answer becomes a governed report chart like any built in one: same slicers, same nightly refresh, same model, visible to everyone with access."],
      ["AI with guardrails", I.shield, "The language model may only assemble queries from the governed catalog. Scope is enforced before execution, refusals are logged, and nothing invents a number."],
    ];
    cards.forEach(([t, ic, d], i) => {
      const x = 0.65 + i * 4.18;
      card(s, x, 1.7, 3.9, 4.4);
      iconCircle(s, x + 0.35, 2.05, ic);
      T(s, t, { x: x + 0.35, y: 3.05, w: 3.2, h: 0.45, fontSize: 18, bold: true, color: INK, fontFace: "Cambria" });
      T(s, d, { x: x + 0.35, y: 3.6, w: 3.2, h: 2.3, fontSize: 12.5, color: BODY });
    });
    T(s, "The same pipeline the showcase plays on every run: context, matching, access check, query, chart.", { x: 0.65, y: 6.35, w: 12, h: 0.35, fontSize: 12.5, color: MUTE });
  }

  // 9 - BUILT WITH
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "Built with");
    const cards = [
      ["The product stack", I.layers, "A SQL Server warehouse under a Cube semantic layer, a Python FastAPI service for identity, scope and report specs, LLM orchestration for the question pipeline, and a web client."],
      ["This showcase", I.zap, "A static Next.js build of the product on scripted data: the full journey, four question outcomes and every screen, clickable in any browser with no infrastructure or sign up."],
    ];
    cards.forEach(([t, ic, d], i) => {
      const x = 0.65 + i * 6.25;
      card(s, x, 1.7, 5.8, 4.4);
      iconCircle(s, x + 0.4, 2.05, ic);
      T(s, t, { x: x + 0.4, y: 3.05, w: 5.0, h: 0.75, fontSize: 18, bold: true, color: INK, fontFace: "Cambria" });
      T(s, d, { x: x + 0.4, y: 3.85, w: 5.0, h: 2.1, fontSize: 13, color: BODY });
    });
    T(s, "The showcase exists so the solved use case can be demonstrated, not just described.", { x: 0.65, y: 6.35, w: 12, h: 0.35, fontSize: 12.5, color: MUTE });
  }

  // 10 - CLOSE
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "See it in action");
    card(s, 0.65, 1.7, 5.6, 4.4);
    iconCircle(s, 1.0, 2.05, I.play);
    T(s, "Live build", { x: 1.0, y: 3.0, w: 4.8, h: 0.45, fontSize: 20, bold: true, color: INK, fontFace: "Cambria" });
    T(s, "stonebridge-six.vercel.app", { x: 1.0, y: 3.55, w: 4.8, h: 0.4, fontSize: 16, color: AZURE, bold: true });
    T(s, [
      { text: "Open any screen directly; the pills in the header replay the same report with a different question.", options: { breakLine: true, paraSpaceAfter: 8 } },
      { text: "Example: /reports/program-spend?s=refined shows a vague ask being rewritten before it runs.", options: {} },
    ], { x: 1.0, y: 4.1, w: 4.8, h: 1.3, fontSize: 13, color: BODY });
    T(s, "The journey is the product\u2019s own; the data is scripted for the showcase.", { x: 1.0, y: 5.55, w: 4.8, h: 0.5, fontSize: 12, color: MUTE });
    const h = shot(s, "shots/shot-usage.jpg", 6.75, 1.85, 6.0, WIDE);
    T(s, "The usage view: questions, saves and the reports people actually open.", { x: 6.75, y: 1.9 + h + 0.08, w: 6.0, h: 0.3, align: "center", fontSize: 11, color: MUTE });
    T(s, "SQL Server  \u00b7  Cube  \u00b7  Python FastAPI  \u00b7  LLM orchestration  \u00b7  Next.js showcase", { x: 6.75, y: 6.5, w: 6.0, h: 0.3, align: "center", fontSize: 12, color: AZURE });
  }

  await pres.writeFile({ fileName: "Stonebridge-Case-Study.pptx" });
  await applyTheme("Stonebridge-Case-Study.pptx", THEME);
  console.log("DECK WRITTEN");
})().catch(e => { console.error(e); process.exit(1); });
