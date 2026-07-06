const aiApiUrl = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
const aiApiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
const aiModel = process.env.AI_MODEL || "gpt-4o-mini";
const templatePackUrl = process.env.TEMPLATE_PACK_URL || "";
const proCheckoutUrl = process.env.PRO_CHECKOUT_URL || "";
const businessLicenseUrl = process.env.BUSINESS_LICENSE_URL || "";
const purchaseIntentUrl = process.env.PURCHASE_INTENT_URL || "";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff",
};

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

function json(statusCode, payload) {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  };
}

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
  const fenced = text.trim().match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1]?.trim();
  const parsed = JSON.parse(fenced || text.trim());
  if (!Array.isArray(parsed)) throw new Error("AI response is not an array");
  return parsed.map((item) => String(item).trim()).filter(Boolean).slice(0, limit);
}

async function generateWithAi(input) {
  if (!aiApiKey) return { items: fallbackGenerate(input), source: "fallback" };

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

  if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI response has no content");
  return { items: extractJsonArray(content, count), source: "ai" };
}

function normalizeInput(raw = {}) {
  return {
    mode: String(raw.mode || "xhs"),
    industry: String(raw.industry || "通用内容"),
    audience: String(raw.audience || "内容创作者"),
    offer: String(raw.offer || "内容生成器"),
    pain: String(raw.pain || "不知道怎么写标题和文案。"),
    tone: String(raw.tone || "自然、有信任感"),
  };
}

function pathName(event) {
  return "/" + String(event.path || "").split("/").filter(Boolean).pop();
}

export async function handler(event) {
  const route = pathName(event);

  if (event.httpMethod === "GET" && route === "/healthz") {
    return json(200, { ok: true, aiConfigured: Boolean(aiApiKey), generatedAt: new Date().toISOString() });
  }

  if (event.httpMethod === "GET" && route === "/config") {
    return json(200, { templatePackUrl, proCheckoutUrl, businessLicenseUrl, purchaseIntentUrl });
  }

  if (event.httpMethod === "GET" && route === "/stats") {
    return json(200, {
      totals: { events: 0, pageViews: 0, generations: 0, downloads: 0, copies: 0, waitlist: 0 },
      topIndustries: [],
      topPages: [],
      recentEvents: [],
    });
  }

  if (event.httpMethod === "POST" && route === "/generate") {
    try {
      const input = normalizeInput(JSON.parse(event.body || "{}"));
      try {
        return json(200, await generateWithAi(input));
      } catch {
        return json(200, {
          items: fallbackGenerate(input),
          source: "fallback",
          warning: "AI provider unavailable; returned local fallback results.",
        });
      }
    } catch (error) {
      return json(400, { error: "Invalid request", detail: error.message });
    }
  }

  if (event.httpMethod === "POST" && route === "/waitlist") {
    return json(200, { ok: true, storage: "disabled-on-netlify-free" });
  }

  if (event.httpMethod === "POST" && route === "/event") {
    return json(200, { ok: true, storage: "disabled-on-netlify-free" });
  }

  return json(404, { error: "Not found" });
}
