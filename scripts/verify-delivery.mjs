import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const paidZip = "private-delivery/title-factory-paid-template-pack-v1.zip";
const businessZip = "private-delivery/title-factory-business-license-v1.zip";

const paidFiles = [
  "README.md",
  "listing-copy.md",
  "cover-title-factory-paid-pack.png",
  "title-factory-paid-template-pack-v1.csv",
  "title-factory-paid-template-pack-v1.md",
];

const businessFiles = [
  "README.md",
  "commercial-license-terms.md",
  "team-sop.md",
  "client-project-workflow.md",
  "listing-copy.md",
  "title-factory-paid-template-pack-v1.zip",
];

const checks = [];

function pass(name, detail = "") {
  checks.push({ ok: true, name, detail });
}

function fail(name, detail = "") {
  checks.push({ ok: false, name, detail });
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function zipList(path) {
  const { stdout } = await execFileAsync("unzip", ["-Z1", path], { maxBuffer: 1024 * 1024 });
  return stdout.trim().split(/\r?\n/).filter(Boolean);
}

async function unzipText(path, entry) {
  const { stdout } = await execFileAsync("unzip", ["-p", path, entry], {
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
  return stdout;
}

async function unzipBuffer(path, entry) {
  const { stdout } = await execFileAsync("unzip", ["-p", path, entry], {
    encoding: "buffer",
    maxBuffer: 8 * 1024 * 1024,
  });
  return stdout;
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

for (const file of [paidZip, businessZip]) {
  if (await exists(file)) pass(`delivery zip exists: ${file}`);
  else fail(`delivery zip exists: ${file}`, "missing");
}

if (checks.some((check) => !check.ok)) {
  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
  }
  process.exit(1);
}

const paidList = await zipList(paidZip);
for (const file of paidFiles) {
  if (paidList.includes(file)) pass(`paid pack contains ${file}`);
  else fail(`paid pack contains ${file}`, "missing");
}

const businessList = await zipList(businessZip);
for (const file of businessFiles) {
  if (businessList.includes(file)) pass(`business license contains ${file}`);
  else fail(`business license contains ${file}`, "missing");
}

const paidCsv = await unzipText(paidZip, "title-factory-paid-template-pack-v1.csv");
const csvLines = paidCsv.trim().split(/\r?\n/);
if (csvLines[0] === '"type","industry","audience","template"') pass("paid CSV header is correct");
else fail("paid CSV header is correct", csvLines[0] || "empty");

const dataRows = csvLines.length - 1;
if (dataRows === 1750) pass("paid CSV has 1750 usable rows");
else fail("paid CSV has 1750 usable rows", `${dataRows} rows`);

const paidMarkdown = await unzipText(paidZip, "title-factory-paid-template-pack-v1.md");
for (const needle of ["# 标题工厂付费模板包 v1", "## 模板库", "## 30 天内容日历", "### AI 工具", "### 知识产品"]) {
  if (paidMarkdown.includes(needle)) pass(`paid Markdown contains ${needle}`);
  else fail(`paid Markdown contains ${needle}`, "missing");
}

const paidReadme = await unzipText(paidZip, "README.md");
for (const needle of ["推荐用法", "配合标题工厂网站继续生成更多版本", "请勿二次转卖"]) {
  if (paidReadme.includes(needle)) pass(`paid README contains ${needle}`);
  else fail(`paid README contains ${needle}`, "missing");
}

const businessTerms = await unzipText(businessZip, "commercial-license-terms.md");
for (const needle of ["允许使用", "不允许使用", "不包含", "客户项目"]) {
  if (businessTerms.includes(needle)) pass(`business terms contain ${needle}`);
  else fail(`business terms contain ${needle}`, "missing");
}

const paidZipHash = sha256(await readFile(paidZip));
const nestedPaidZipHash = sha256(await unzipBuffer(businessZip, "title-factory-paid-template-pack-v1.zip"));
if (paidZipHash === nestedPaidZipHash) pass("business license embeds the current paid pack zip");
else fail("business license embeds the current paid pack zip", "hash mismatch");

for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
}

const failed = checks.filter((check) => !check.ok);
if (failed.length) {
  console.error(`\n${failed.length} delivery checks failed.`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} delivery checks passed.`);
