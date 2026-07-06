import { createServer } from "node:http";
import { appendFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);
const aiApiUrl = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
const aiApiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
const aiModel = process.env.AI_MODEL || "gpt-4o-mini";
const templatePackUrl = process.env.TEMPLATE_PACK_URL || "";
const proCheckoutUrl = process.env.PRO_CHECKOUT_URL || "";
const maxBodyBytes = 64 * 1024;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
};

function csvEscape(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

const fallbackTemplates = {
  xhs: [
    "{audience}别再这样做{offer}了",
    "{industry}新手最容易忽略的 5 个细节",
    "我用 {offer} 解决了{painShort}",
    "{industry}内容没人看？先改这 3 个标题",
    "适合{audience}直接套用的 {industry} 选题",
    "{offer}怎么写才不像广告？",
    "为什么你发了很多内容，还是没人咨询？",
    "{industry}账号低粉也能成交的内容结构",
  ],
  video: [
    "如果你还在为{painShort}发愁，先看完这条",
    "很多{audience}都做错了第一步",
    "别急着买{offer}，先搞懂这 3 件事",
    "30 秒讲清楚：{industry}怎么做内容才有人问",
    "我不建议新手一开始就追爆款，原因很简单",
    "你以为是流量问题，其实是表达问题",
    "把这句话放在开头，客户更愿意继续看",
    "{industry}想被动获客，先做好这个页面",
  ],
  product: [
    "{offer}，适合{audience}，解决{painShort}",
    "{industry}专用 {offer}，高效、省心、可直接套用",
    "{offer}升级版：标题、文案、提示词一次配齐",
    "给{audience}的 {industry} 工具包，打开就能用",
    "{offer}｜降低内容卡壳，提升发布效率",
    "{industry}内容生成模板，适合新手和小团队",
    "不用从零想文案的 {offer}，支持多场景复用",
    "{offer}完整包：标题库、话术库、内容计划",
  ],
  moments: [
    "很多人以为{painShort}只是小问题，但真正影响结果的是长期没有系统方法。",
    "今天整理 {offer} 时发现，{industry}最缺的不是灵感，而是能反复使用的表达结构。",
    "如果你也是{audience}，可以先从一个低门槛动作开始：把客户常问的问题写成内容。",
    "不要把朋友圈写成产品说明书。先写客户正在经历什么，再写你能怎么帮他。",
    "内容能不能带来咨询，常常不取决于你发了多少，而取决于有没有说中具体场景。",
    "我更喜欢把 {offer} 做成工具，而不是课程，因为工具打开就能产生结果。",
    "{industry}想做好内容，先别追热点，先把 20 个高频问题讲清楚。",
    "一个好文案的标准：客户看完不是觉得你厉害，而是觉得你理解他。",
  ],
  prompt: [
    "你是{industry}内容策划。我的目标用户是{audience}，产品是{offer}，痛点是{pain}。请生成 20 个{tone}的小红书标题。",
    "你是短视频编导。请围绕{industry}和{offer}生成 10 个开头钩子，每个开头要指出一个具体痛点。",
    "你是电商标题优化师。请把{offer}改写成 10 个商品标题，要求包含人群、场景、卖点和结果。",
    "你是私域文案顾问。请根据{pain}生成 7 条朋友圈文案，语气要{tone}，不要像硬广。",
    "你是 SEO 编辑。请为“{industry}标题生成器”生成页面标题、描述、H1、FAQ 和 20 个长尾关键词。",
    "你是产品经理。请把{offer}拆成免费版、模板包和 Pro 版三个层级，并写出每层的用户价值。",
    "你是增长顾问。请为{audience}设计 30 天内容计划，每天包含标题、正文方向和结尾引导。",
    "你是文案改写助手。请把用户输入的普通文案改成{tone}的风格，保留真实信息，减少夸张承诺。",
  ],
  calendar: Array.from({ length: 30 }, (_, index) => {
    const day = index + 1;
    const themes = ["痛点解释", "案例拆解", "误区纠正", "清单整理", "场景建议", "工具方法"];
    const theme = themes[index % themes.length];
    return `第 ${day} 天｜${theme}：围绕{industry}和{offer}，给{audience}写一条{tone}的内容，解决“{painShort}”。`;
  }),
};

function painShort(value = "") {
  return (
    value
      .replace(/[。！？!?]/g, "，")
      .split("，")
      .map((part) => part.trim())
      .filter(Boolean)[0]
      ?.slice(0, 22) || "内容没有转化"
  );
}

function fillTemplate(template, data) {
  return template.replace(/\{(\w+)\}/g, (_, key) => data[key] || "");
}

function fallbackGenerate(input) {
  const data = { ...input, painShort: painShort(input.pain) };
  return (fallbackTemplates[input.mode] || fallbackTemplates.xhs).map((template) => fillTemplate(template, data));
}

function modeLabel(mode) {
  return (
    {
      xhs: "小红书标题",
      video: "短视频标题和开头",
      product: "商品标题",
      moments: "朋友圈文案",
      prompt: "AI 提示词",
      calendar: "30 天内容日历",
    }[mode] || "标题和文案"
  );
}

function expectedCount(mode) {
  return mode === "calendar" ? 30 : 8;
}

function extractJsonArray(text, limit = 8) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1]?.trim();
  const raw = fenced || trimmed;
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("AI response is not an array");
  return parsed.map((item) => String(item).trim()).filter(Boolean).slice(0, limit);
}

async function requestJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBodyBytes) {
      throw new Error("Request body too large");
    }
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(body || "{}");
}

async function generateWithAi(input) {
  if (!aiApiKey) {
    return { items: fallbackGenerate(input), source: "fallback" };
  }

  const count = expectedCount(input.mode);
  const prompt = `请为下面的场景生成 ${count} 条${modeLabel(input.mode)}。
要求：
- 只返回 JSON 字符串数组，不要 Markdown，不要解释。
- 语言使用简体中文。
- 语气：${input.tone}
- 具体、有点击欲望，但不要夸张承诺。
- 如果是内容日历，每条以“第 X 天｜主题：内容方向”开头。

行业：${input.industry}
目标用户：${input.audience}
产品/服务/主题：${input.offer}
用户痛点：${input.pain}`;

  const response = await fetch(aiApiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${aiApiKey}`,
    },
    body: JSON.stringify({
      model: aiModel,
      messages: [
        {
          role: "system",
          content: "你是一个中文增长文案编辑，擅长为工具站生成具体、自然、可直接使用的标题和文案。",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`AI request failed: ${response.status} ${detail.slice(0, 240)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI response has no content");

  return { items: extractJsonArray(content, count), source: "ai" };
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "x-content-type-options": "nosniff",
  });
  res.end(JSON.stringify(payload));
}

function parseCsv(text) {
  return text
    .trim()
    .split("\n")
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const cells = [];
      let current = "";
      let inQuotes = false;
      for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        const next = line[index + 1];
        if (char === '"' && next === '"' && inQuotes) {
          current += '"';
          index += 1;
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          cells.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      cells.push(current);
      return cells;
    });
}

function topCounts(rows, columnIndex, limit = 8) {
  const counts = new Map();
  for (const row of rows) {
    const key = row[columnIndex] || "未标记";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

async function readCsvRows(fileName) {
  try {
    return parseCsv(await readFile(join(root, "data", fileName), "utf8"));
  } catch {
    return [];
  }
}

async function handleStats(req, res) {
  const events = await readCsvRows("events.csv");
  const waitlist = await readCsvRows("waitlist.csv");
  const eventNames = events.map((row) => row[1]);

  sendJson(res, 200, {
    totals: {
      events: events.length,
      pageViews: eventNames.filter((name) => name === "page-view").length,
      generations: eventNames.filter((name) => name === "generate").length,
      downloads: eventNames.filter((name) => name === "starter-pack-click").length,
      copies: eventNames.filter((name) => name === "copy-results").length,
      waitlist: waitlist.length,
    },
    topIndustries: topCounts(events.filter((row) => row[4]), 4),
    topPages: topCounts(events.filter((row) => row[2]), 2),
    recentEvents: events.slice(-12).reverse().map((row) => ({
      createdAt: row[0],
      name: row[1],
      page: row[2],
      mode: row[3],
      industry: row[4],
      source: row[5],
    })),
  });
}

function handleConfig(req, res) {
  sendJson(res, 200, {
    templatePackUrl,
    proCheckoutUrl,
  });
}

async function handleGenerate(req, res) {
  try {
    const input = await requestJson(req);
    const normalized = {
      mode: String(input.mode || "xhs"),
      industry: String(input.industry || "通用内容"),
      audience: String(input.audience || "内容创作者"),
      offer: String(input.offer || "内容生成器"),
      pain: String(input.pain || "不知道怎么写标题和文案。"),
      tone: String(input.tone || "自然、有信任感"),
    };

    try {
      const result = await generateWithAi(normalized);
      sendJson(res, 200, result);
    } catch {
      console.warn("AI provider unavailable; returned local fallback results.");
      sendJson(res, 200, {
        items: fallbackGenerate(normalized),
        source: "fallback",
        warning: "AI provider unavailable; returned local fallback results.",
      });
    }
  } catch (error) {
    sendJson(res, 400, { error: "Invalid request", detail: error.message });
  }
}

async function handleWaitlist(req, res) {
  try {
    const input = await requestJson(req);
    const email = String(input.email || "").trim().toLowerCase();
    const source = String(input.source || "homepage").trim().slice(0, 80);
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!validEmail) {
      sendJson(res, 400, { error: "请输入有效邮箱" });
      return;
    }

    const waitlistPath = join(root, "data", "waitlist.csv");
    await mkdir(join(root, "data"), { recursive: true });
    try {
      await stat(waitlistPath);
    } catch {
      await writeFile(waitlistPath, "created_at,email,source\n", "utf8");
    }
    await appendFile(
      waitlistPath,
      [new Date().toISOString(), email, source].map(csvEscape).join(",") + "\n",
      "utf8"
    );

    sendJson(res, 200, { ok: true });
  } catch {
    sendJson(res, 500, { error: "提交失败，请稍后再试" });
  }
}

async function appendCsvRow(path, header, values) {
  await mkdir(join(root, "data"), { recursive: true });
  try {
    await stat(path);
  } catch {
    await writeFile(path, header, "utf8");
  }
  await appendFile(path, values.map(csvEscape).join(",") + "\n", "utf8");
}

async function handleEvent(req, res) {
  try {
    const input = await requestJson(req);
    const name = String(input.name || "").trim().slice(0, 80);
    const page = String(input.page || "").trim().slice(0, 240);
    const mode = String(input.mode || "").trim().slice(0, 40);
    const industry = String(input.industry || "").trim().slice(0, 80);
    const source = String(input.source || "").trim().slice(0, 80);

    if (!name) {
      sendJson(res, 400, { error: "Missing event name" });
      return;
    }

    await appendCsvRow(
      join(root, "data", "events.csv"),
      "created_at,name,page,mode,industry,source\n",
      [new Date().toISOString(), name, page, mode, industry, source]
    );

    sendJson(res, 200, { ok: true });
  } catch {
    sendJson(res, 500, { error: "Event not recorded" });
  }
}

async function serveFile(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/healthz") {
    sendJson(res, 200, {
      ok: true,
      aiConfigured: Boolean(aiApiKey),
      generatedAt: new Date().toISOString(),
    });
    return;
  }
  if (url.pathname === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }
  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not a file");
    const body = await readFile(filePath);
    const extension = extname(filePath);
    const cacheControl = extension === ".html" ? "no-cache" : "public, max-age=3600";
    res.writeHead(200, {
      "content-type": mimeTypes[extension] || "application/octet-stream",
      "cache-control": cacheControl,
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/generate") {
    handleGenerate(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/waitlist") {
    handleWaitlist(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/event") {
    handleEvent(req, res);
    return;
  }
  if (req.method === "GET" && req.url === "/api/stats") {
    handleStats(req, res);
    return;
  }
  if (req.method === "GET" && req.url === "/api/config") {
    handleConfig(req, res);
    return;
  }
  if (req.method === "GET" || req.method === "HEAD") {
    serveFile(req, res);
    return;
  }
  res.writeHead(405, { allow: "GET, HEAD, POST" });
  res.end("Method not allowed");
});

server.listen(port, () => {
  console.log(`Title Factory running at http://localhost:${port}`);
  if (!aiApiKey) {
    console.log("AI_API_KEY is not set, using local fallback generation.");
  }
});
