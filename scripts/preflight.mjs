import { readdir, readFile, stat } from "node:fs/promises";

const requiredFiles = [
  "index.html",
  "ai-tools-workbench.html",
  "template-library.html",
  "industry-packs.html",
  "paid-template-pack.html",
  "purchase-guide.html",
  "business-license.html",
  "checkout-config.json",
  "admin.html",
  "server.mjs",
  "sitemap.xml",
  "robots.txt",
  "downloads/title-factory-starter-pack.html",
  "downloads/title-factory-starter-pack.csv",
  "downloads/title-factory-starter-pack.md",
  "downloads/ai-tools-paid-template-pack.md",
  "data/industry-packs.mjs",
  "data/solution-pages.mjs",
  "data/events.csv",
  "data/waitlist.csv",
  "DEPLOY.md",
  "LEAD_FORM_SETUP.md",
  "MONEY_SETUP.md",
  "OPERATING_PLAN.md",
  "RELEASE_NOTES.md",
  "render.yaml",
  "netlify.toml",
  "netlify/functions/api.mjs",
  "scripts/build-business-license.mjs",
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

const packs = (await readdir("packs")).filter((file) => file.endsWith(".html"));
if (packs.length === 25) pass("industry pack page count", "25 pages");
else fail("industry pack page count", `${packs.length} pages`);

const solutions = (await readdir("solutions")).filter((file) => file.endsWith(".html"));
if (solutions.length === 12) pass("solution page count", "12 pages");
else fail("solution page count", `${solutions.length} pages`);

const sitemap = await readFile("sitemap.xml", "utf8");
const sitemapEntries = (sitemap.match(/<url>/g) || []).length;
if (sitemapEntries === 170) pass("sitemap entry count", "170 entries");
else fail("sitemap entry count", `${sitemapEntries} entries`);

const index = await readFile("index.html", "utf8");
for (const needle of ["ai-tools-workbench.html", "template-library.html", "industry-packs.html", "packs/ai-tools-template-pack.html", "solutions/ai-prompt-template-pack.html", "paid-template-pack.html", "purchase-guide.html", "business-license.html", "businessLicenseCta", "checkout-config.json", "purchaseIntentUrl", "waitlistCopy", "title-factory-starter-pack.html", "data-mode=\"calendar\"", "exportMarkdown"]) {
  if (index.includes(needle)) pass(`homepage contains ${needle}`);
  else fail(`homepage contains ${needle}`, "missing");
}

const workbench = await readFile("ai-tools-workbench.html", "utf8");
for (const needle of ["titleFactoryAiToolsVoice", "/api/generate", "ai-tools-workbench-export-csv"]) {
  if (workbench.includes(needle)) pass(`workbench contains ${needle}`);
  else fail(`workbench contains ${needle}`, "missing");
}

const paidPack = await readFile("paid-template-pack.html", "utf8");
for (const needle of ["适合和不适合", "交付预览", "购买决策清单", "business-license.html", "purchase-guide.html", "businessLicenseUpsell", "title-factory-paid-pack-preview.png", "/api/config", "checkout-config.json", "templatePackUrl", "常见问题", "application/ld+json", "PreOrder"]) {
  if (paidPack.includes(needle)) pass(`paid pack page contains ${needle}`);
  else fail(`paid pack page contains ${needle}`, "missing");
}

const purchaseGuide = await readFile("purchase-guide.html", "utf8");
for (const needle of ["买哪个版本", "自助购买决策", "¥99 完整模板包", "¥999 商业授权", "purchaseIntentUrl", "checkout-config.json", "WebPage"]) {
  if (purchaseGuide.includes(needle)) pass(`purchase guide contains ${needle}`);
  else fail(`purchase guide contains ${needle}`, "missing");
}

const businessLicense = await readFile("business-license.html", "utf8");
for (const needle of ["标题工厂商业授权版", "¥999", "授权范围", "团队和工作室", "999 元怎么判断值不值", "交付文件清单", "常见问题", "purchase-guide.html", "checkout-config.json", "businessBuyButton", "businessLicenseUrl", "Product", "PreOrder"]) {
  if (businessLicense.includes(needle)) pass(`business license page contains ${needle}`);
  else fail(`business license page contains ${needle}`, "missing");
}

const checkoutConfig = JSON.parse(await readFile("checkout-config.json", "utf8"));
for (const key of ["templatePackUrl", "proCheckoutUrl", "businessLicenseUrl", "purchaseIntentUrl"]) {
  if (Object.hasOwn(checkoutConfig, key)) pass(`checkout config contains ${key}`);
  else fail(`checkout config contains ${key}`, "missing");
}

const businessLicenseBuilder = await readFile("scripts/build-business-license.mjs", "utf8");
for (const needle of ["title-factory-business-license-v1.zip", "commercial-license-terms.md", "team-sop.md", "client-project-workflow.md", "listing-copy.md"]) {
  if (businessLicenseBuilder.includes(needle)) pass(`business license builder contains ${needle}`);
  else fail(`business license builder contains ${needle}`, "missing");
}

const moneySetup = await readFile("MONEY_SETUP.md", "utf8");
for (const needle of ["BUSINESS_LICENSE_URL", "PURCHASE_INTENT_URL", "purchaseIntentUrl", "title-factory-business-license-v1.zip", "标题工厂商业授权版：团队内容模板和客户项目打样授权", "价格：999 元"]) {
  if (moneySetup.includes(needle)) pass(`money setup contains ${needle}`);
  else fail(`money setup contains ${needle}`, "missing");
}

const leadFormSetup = await readFile("LEAD_FORM_SETUP.md", "utf8");
for (const needle of ["购买意向表单", "purchaseIntentUrl", "¥99 标题工厂付费模板包", "¥999 商业授权版"]) {
  if (leadFormSetup.includes(needle)) pass(`lead form setup contains ${needle}`);
  else fail(`lead form setup contains ${needle}`, "missing");
}

const server = await readFile("server.mjs", "utf8");
for (const needle of ["BUSINESS_LICENSE_URL", "businessLicenseUrl", "PURCHASE_INTENT_URL", "purchaseIntentUrl"]) {
  if (server.includes(needle)) pass(`server config contains ${needle}`);
  else fail(`server config contains ${needle}`, "missing");
}

const netlifyApi = await readFile("netlify/functions/api.mjs", "utf8");
for (const needle of ["BUSINESS_LICENSE_URL", "businessLicenseUrl", "PURCHASE_INTENT_URL", "purchaseIntentUrl"]) {
  if (netlifyApi.includes(needle)) pass(`netlify api contains ${needle}`);
  else fail(`netlify api contains ${needle}`, "missing");
}

const envExample = await readFile(".env.example", "utf8");
if (envExample.includes("BUSINESS_LICENSE_URL=")) pass("env example contains BUSINESS_LICENSE_URL");
else fail("env example contains BUSINESS_LICENSE_URL", "missing");
if (envExample.includes("PURCHASE_INTENT_URL=")) pass("env example contains PURCHASE_INTENT_URL");
else fail("env example contains PURCHASE_INTENT_URL", "missing");

const starterPackPage = await readFile("downloads/title-factory-starter-pack.html", "utf8");
for (const needle of ["怎么试用这份样品", "样品包之后做什么", "application/ld+json"]) {
  if (starterPackPage.includes(needle)) pass(`starter pack page contains ${needle}`);
  else fail(`starter pack page contains ${needle}`, "missing");
}

const templateLibrary = await readFile("template-library.html", "utf8");
for (const needle of ["公开模板库", "可复制模板样例", "CollectionPage", "title-factory-paid-pack-preview.png"]) {
  if (templateLibrary.includes(needle)) pass(`template library contains ${needle}`);
  else fail(`template library contains ${needle}`, "missing");
}

const industryPacks = await readFile("industry-packs.html", "utf8");
for (const needle of ["25 个行业模板包入口", "packs/ai-tools-template-pack.html", "AI 工具内容模板包", "知识产品销售页模板包", "CollectionPage"]) {
  if (industryPacks.includes(needle)) pass(`industry packs page contains ${needle}`);
  else fail(`industry packs page contains ${needle}`, "missing");
}

const aiToolsPack = await readFile("packs/ai-tools-template-pack.html", "utf8");
for (const needle of ["AI 工具内容模板包", "Product", "¥99 完整包承接", "paid-template-pack.html"]) {
  if (aiToolsPack.includes(needle)) pass(`AI tools pack page contains ${needle}`);
  else fail(`AI tools pack page contains ${needle}`, "missing");
}

const knowledgePack = await readFile("packs/knowledge-product-sales-page-template-pack.html", "utf8");
for (const needle of ["知识产品销售页模板包", "下载样品", "查看完整包"]) {
  if (knowledgePack.includes(needle)) pass(`knowledge product pack page contains ${needle}`);
  else fail(`knowledge product pack page contains ${needle}`, "missing");
}

const promptSolution = await readFile("solutions/ai-prompt-template-pack.html", "utf8");
for (const needle of ["AI 提示词模板包", "高购买意图入口", "查看完整付费包", "Product"]) {
  if (promptSolution.includes(needle)) pass(`AI prompt solution page contains ${needle}`);
  else fail(`AI prompt solution page contains ${needle}`, "missing");
}

const salesPageSolution = await readFile("solutions/digital-product-sales-page-template.html", "utf8");
for (const needle of ["数字产品销售页模板", "搜索意图更接近付费", "查看付费包页面", "paid-template-pack.html"]) {
  if (salesPageSolution.includes(needle)) pass(`digital product solution page contains ${needle}`);
  else fail(`digital product solution page contains ${needle}`, "missing");
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
