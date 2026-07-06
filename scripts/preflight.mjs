import { readdir, readFile, stat } from "node:fs/promises";

const requiredFiles = [
  "index.html",
  "ai-tools-workbench.html",
  "paid-template-pack.html",
  "admin.html",
  "server.mjs",
  "sitemap.xml",
  "robots.txt",
  "downloads/title-factory-starter-pack.html",
  "downloads/title-factory-starter-pack.csv",
  "downloads/title-factory-starter-pack.md",
  "downloads/ai-tools-paid-template-pack.md",
  "data/events.csv",
  "data/waitlist.csv",
  "DEPLOY.md",
  "MONEY_SETUP.md",
  "OPERATING_PLAN.md",
  "RELEASE_NOTES.md",
  "render.yaml",
  "netlify.toml",
  "netlify/functions/api.mjs",
  "scripts/build-paid-pack.mjs",
  "scripts/generate-seo-pages.mjs",
  "scripts/preflight.mjs",
  "Dockerfile",
  ".env.example",
];

const checks = [];

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function pass(name, detail = "") {
  checks.push({ ok: true, name, detail });
}

function fail(name, detail = "") {
  checks.push({ ok: false, name, detail });
}

for (const file of requiredFiles) {
  if (await exists(file)) pass(`required file: ${file}`);
  else fail(`required file: ${file}`, "missing");
}

const tools = (await readdir("tools")).filter((file) => file.endsWith(".html"));
if (tools.length === 125) pass("SEO page count", "125 pages");
else fail("SEO page count", `${tools.length} pages`);

const sitemap = await readFile("sitemap.xml", "utf8");
const sitemapEntries = (sitemap.match(/<url>/g) || []).length;
if (sitemapEntries === 128) pass("sitemap entry count", "128 entries");
else fail("sitemap entry count", `${sitemapEntries} entries`);

const index = await readFile("index.html", "utf8");
for (const needle of ["ai-tools-workbench.html", "paid-template-pack.html", "title-factory-starter-pack.html", "data-mode=\"calendar\"", "exportMarkdown"]) {
  if (index.includes(needle)) pass(`homepage contains ${needle}`);
  else fail(`homepage contains ${needle}`, "missing");
}

const workbench = await readFile("ai-tools-workbench.html", "utf8");
for (const needle of ["titleFactoryAiToolsVoice", "/api/generate", "ai-tools-workbench-export-csv"]) {
  if (workbench.includes(needle)) pass(`workbench contains ${needle}`);
  else fail(`workbench contains ${needle}`, "missing");
}

const paidPack = await readFile("paid-template-pack.html", "utf8");
for (const needle of ["适合和不适合", "常见问题", "application/ld+json", "PreOrder"]) {
  if (paidPack.includes(needle)) pass(`paid pack page contains ${needle}`);
  else fail(`paid pack page contains ${needle}`, "missing");
}

const starterPackPage = await readFile("downloads/title-factory-starter-pack.html", "utf8");
for (const needle of ["怎么试用这份样品", "样品包之后做什么", "application/ld+json"]) {
  if (starterPackPage.includes(needle)) pass(`starter pack page contains ${needle}`);
  else fail(`starter pack page contains ${needle}`, "missing");
}

const events = await readFile("data/events.csv", "utf8");
if (events.trim() === "created_at,name,page,mode,industry,source") pass("events csv is clean");
else fail("events csv is clean", "contains data rows");

const waitlist = await readFile("data/waitlist.csv", "utf8");
if (waitlist.trim() === "created_at,email,source") pass("waitlist csv is clean");
else fail("waitlist csv is clean", "contains data rows");

for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
}

const failed = checks.filter((check) => !check.ok);
if (failed.length) {
  console.error(`\n${failed.length} checks failed.`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} checks passed.`);
