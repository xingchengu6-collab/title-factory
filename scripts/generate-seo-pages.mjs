import { mkdir, rm, writeFile } from "node:fs/promises";
import { commercialLicensePages } from "../data/commercial-license-pages.mjs";
import { industryPacks } from "../data/industry-packs.mjs";
import { seoPages } from "../data/seo-pages.mjs";
import { solutionPages } from "../data/solution-pages.mjs";

const baseUrl = process.env.SITE_URL || "https://xingchengu6-collab.github.io";
const today =
  process.env.BUILD_DATE ||
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toolHref(page) {
  const params = new URLSearchParams({
    mode: page.mode,
    industry: page.industry,
    audience: page.audience,
    offer: page.offer,
    pain: page.pain,
    tone: "自然、有信任感",
  });
  return `../index.html?${params.toString()}#tool`;
}

function relatedPages(page) {
  return seoPages
    .filter((candidate) => candidate.slug !== page.slug && candidate.industry === page.industry)
    .slice(0, 3);
}

function rootHref(path) {
  return path.startsWith("http") ? path : `../${path}`;
}

function formatAudience(value) {
  return /^[A-Za-z0-9]/.test(value) ? ` ${value}` : value;
}

function renderPackJsonLd(pack, description) {
  return JSON.stringify(
    [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: pack.title,
        description,
        brand: { "@type": "Brand", name: "标题工厂" },
        url: `${baseUrl}/packs/${pack.slug}.html`,
        offers: {
          "@type": "Offer",
          price: "99",
          priceCurrency: "CNY",
          availability: "https://schema.org/PreOrder",
          url: `${baseUrl}/paid-template-pack.html`,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `${pack.title}适合谁？`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `适合${formatAudience(pack.audience)}，尤其适合已经有产品或内容方向，但卡在标题、开头、销售页和 AI 提示词表达的人。`,
            },
          },
          {
            "@type": "Question",
            name: "现在可以直接购买吗？",
            acceptedAnswer: {
              "@type": "Answer",
              text: "完整模板包已经准备好，当前等待数字商品平台审核。审核通过后页面会切换为自动购买和下载。",
            },
          },
          {
            "@type": "Question",
            name: "行业包和完整包有什么区别？",
            acceptedAnswer: {
              "@type": "Answer",
              text: "行业包用于承接更具体的搜索需求，完整包包含 25 个行业、1000 条标题/文案/提示词和 750 条内容日历方向。",
            },
          },
        ],
      },
    ],
    null,
    2
  );
}

function renderIndustryPackPage(pack) {
  const description = `${pack.title}，适合${formatAudience(pack.audience)}，用于复用标题、文案、销售页和 AI 提示词结构。先试免费工具和样品包，再进入完整付费模板包。`;
  const examples = pack.examples
    .map((example, index) => `<li><span>${index + 1}</span>${escapeHtml(example)}</li>`)
    .join("");
  const tags = pack.tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(pack.title)} - 标题工厂</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${baseUrl}/packs/${pack.slug}.html" />
    <meta property="og:title" content="${escapeHtml(pack.title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${baseUrl}/packs/${pack.slug}.html" />
    <script type="application/ld+json">${renderPackJsonLd(pack, description)}</script>
    <style>
      :root {
        --ink: #171717;
        --muted: #626262;
        --line: #dddddd;
        --paper: #ffffff;
        --soft: #f6f8f2;
        --mint: #e8f6ee;
        --teal: #14785f;
        --gold: #a66a12;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
        background: linear-gradient(180deg, #fbfaf7 0%, #fff 54%);
      }
      a { color: inherit; }
      .shell { width: min(1080px, calc(100% - 32px)); margin: 0 auto; }
      header { position: sticky; top: 0; z-index: 8; border-bottom: 1px solid var(--line); background: rgba(255,255,255,.9); backdrop-filter: blur(16px); }
      nav { min-height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
      .brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; font-weight: 850; }
      .mark { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 8px; color: #fff; background: var(--ink); }
      .nav-links { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
      .nav-links a { color: var(--muted); text-decoration: none; font-size: 14px; }
      .hero { display: grid; grid-template-columns: 1fr .82fr; gap: 34px; align-items: center; padding: 56px 0 32px; }
      .kicker { display: inline-flex; width: fit-content; border: 1px solid #b8d8ca; color: #0f624f; background: #effaf5; border-radius: 999px; padding: 7px 11px; font-size: 13px; font-weight: 800; }
      h1 { margin: 18px 0 16px; font-size: clamp(36px, 6vw, 62px); line-height: 1.04; letter-spacing: 0; }
      .lead { max-width: 720px; color: var(--muted); font-size: 18px; line-height: 1.8; }
      .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
      .primary, .secondary { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; padding: 11px 15px; text-decoration: none; font-weight: 850; }
      .primary { color: #fff; background: var(--ink); border: 1px solid var(--ink); }
      .secondary { color: var(--ink); background: #fff; border: 1px solid var(--line); }
      .panel, .card, .bar { border: 1px solid var(--line); border-radius: 8px; background: var(--paper); }
      .panel { box-shadow: 0 18px 48px rgba(0,0,0,.08); padding: 22px; }
      .panel strong { display: block; margin-bottom: 8px; font-size: 30px; line-height: 1.1; }
      .panel p, .card p, .card li, .bar p { color: var(--muted); line-height: 1.75; }
      .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
      .chip { border-radius: 999px; color: #0f624f; background: var(--mint); padding: 7px 10px; font-size: 13px; font-weight: 800; }
      section { padding: 26px 0; }
      .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
      .card { padding: 20px; }
      .card h2 { margin: 0 0 12px; font-size: 23px; letter-spacing: 0; }
      .card p { margin: 0; }
      ol { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
      li { display: grid; grid-template-columns: 30px 1fr; gap: 10px; align-items: start; }
      li span { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; color: #fff; background: var(--teal); font-weight: 850; }
      .band { border-block: 1px solid #e4e8dd; background: var(--soft); }
      .bar { display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: center; padding: 22px; }
      .bar strong { display: block; margin-bottom: 8px; font-size: 22px; }
      .price { color: var(--gold); font-weight: 900; }
      footer { border-top: 1px solid var(--line); color: var(--muted); padding: 28px 0 40px; }
      @media (max-width: 860px) {
        nav, .hero, .grid, .bar { grid-template-columns: 1fr; }
        nav { align-items: flex-start; flex-direction: column; padding: 12px 0; }
      }
    </style>
  </head>
  <body>
    <header>
      <nav class="shell">
        <a class="brand" href="../index.html"><span class="mark">T</span><span>标题工厂</span></a>
        <div class="nav-links">
          <a href="../industry-packs.html">行业包</a>
          <a href="../template-library.html">模板库</a>
          <a href="../downloads/title-factory-starter-pack.html">免费样品包</a>
          <a href="../paid-template-pack.html">付费模板包</a>
        </div>
      </nav>
    </header>
    <main>
      <section class="shell hero">
        <div>
          <span class="kicker">行业模板包 · 被动搜索入口</span>
          <h1>${escapeHtml(pack.title)}</h1>
          <p class="lead">${escapeHtml(description)}</p>
          <div class="actions">
            <a class="primary" href="${escapeHtml(rootHref(pack.primaryHref))}">先用免费工具</a>
            <a class="secondary" href="../paid-template-pack.html">查看完整付费包</a>
          </div>
        </div>
        <aside class="panel">
          <strong>¥99 完整包承接</strong>
          <p>这个行业页负责承接精准搜索，完整模板包负责一次性被动交付。审核通过后会切换为自动购买。</p>
          <div class="chips">${tags}<span class="chip">1000+ 模板</span><span class="chip">750 条日历</span></div>
        </aside>
      </section>
      <section class="shell grid">
        <article class="card">
          <h2>适合谁</h2>
          <p>${escapeHtml(pack.audience)}。</p>
        </article>
        <article class="card">
          <h2>解决什么</h2>
          <p>${escapeHtml(pack.pain)}</p>
        </article>
        <article class="card">
          <h2>得到什么</h2>
          <p>${escapeHtml(pack.outcome)}</p>
        </article>
      </section>
      <section class="shell">
        <article class="card">
          <h2>可复用标题方向</h2>
          <ol>${examples}</ol>
        </article>
      </section>
      <section class="band">
        <div class="shell grid">
          <article class="card">
            <h2>免费工具</h2>
            <p>先用行业工具生成标题、开头、朋友圈文案和内容日历，判断这个方向是否适合你。</p>
          </article>
          <article class="card">
            <h2>免费样品</h2>
            <p>样品包可以下载到本地，先看模板结构，再决定是否需要完整包。</p>
          </article>
          <article class="card">
            <h2>完整包</h2>
            <p><span class="price">¥99</span> 一次买断，包含 25 个行业、1000+ 条模板和 750 条内容日历方向。</p>
          </article>
        </div>
      </section>
      <section class="shell">
        <div class="bar">
          <div>
            <strong>先试免费样品，再决定是否需要完整模板包。</strong>
            <p>这条路径不需要咨询、不需要人工交付，后续支付平台审核通过后即可自动购买下载。</p>
          </div>
          <div class="actions">
            <a class="primary" href="../downloads/title-factory-starter-pack.html">下载样品</a>
            <a class="secondary" href="../paid-template-pack.html">查看完整包</a>
          </div>
        </div>
      </section>
    </main>
    <footer>
      <div class="shell">标题工厂 · ${escapeHtml(pack.title)}</div>
    </footer>
  </body>
</html>
`;
}

function renderSolutionJsonLd(solution, description) {
  return JSON.stringify(
    [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: solution.title,
        description,
        brand: { "@type": "Brand", name: "标题工厂" },
        url: `${baseUrl}/solutions/${solution.slug}.html`,
        offers: {
          "@type": "Offer",
          price: "99",
          priceCurrency: "CNY",
          availability: "https://schema.org/PreOrder",
          url: `${baseUrl}/paid-template-pack.html`,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `${solution.title}适合谁？`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `适合${formatAudience(solution.audience)}，尤其适合已经想找模板、提高内容效率或准备卖数字产品的人。`,
            },
          },
          {
            "@type": "Question",
            name: "这是免费工具还是付费模板？",
            acceptedAnswer: {
              "@type": "Answer",
              text: "页面提供免费工具和样品包入口，完整模板包按数字产品交付设计，审核通过后会接入自动购买下载。",
            },
          },
          {
            "@type": "Question",
            name: "能保证涨粉或成交吗？",
            acceptedAnswer: {
              "@type": "Answer",
              text: "不能保证涨粉或成交。它解决的是标题、文案、销售页和提示词表达效率问题，最终效果还受产品、渠道和执行影响。",
            },
          },
        ],
      },
    ],
    null,
    2
  );
}

function renderSolutionPage(solution) {
  const description = `${solution.title}，适合${formatAudience(solution.audience)}。先用免费工具和样品包验证结构，再进入完整付费模板包。`;
  const examples = solution.examples
    .map((example, index) => `<li><span>${index + 1}</span>${escapeHtml(example)}</li>`)
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(solution.title)} - 标题工厂</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${baseUrl}/solutions/${solution.slug}.html" />
    <meta property="og:title" content="${escapeHtml(solution.title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${baseUrl}/solutions/${solution.slug}.html" />
    <script type="application/ld+json">${renderSolutionJsonLd(solution, description)}</script>
    <style>
      :root {
        --ink: #171717;
        --muted: #626262;
        --line: #dddddd;
        --paper: #ffffff;
        --soft: #f8f5ee;
        --mint: #e9f7ef;
        --teal: #14785f;
        --gold: #a66a12;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
        background: linear-gradient(180deg, #fbfaf7 0%, #fff 54%);
      }
      a { color: inherit; }
      .shell { width: min(1080px, calc(100% - 32px)); margin: 0 auto; }
      header { position: sticky; top: 0; z-index: 8; border-bottom: 1px solid var(--line); background: rgba(255,255,255,.9); backdrop-filter: blur(16px); }
      nav { min-height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
      .brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; font-weight: 850; }
      .mark { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 8px; color: #fff; background: var(--ink); }
      .nav-links { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
      .nav-links a { color: var(--muted); text-decoration: none; font-size: 14px; }
      .hero { display: grid; grid-template-columns: 1fr .84fr; gap: 34px; align-items: center; padding: 56px 0 32px; }
      .kicker { display: inline-flex; width: fit-content; border: 1px solid #b8d8ca; color: #0f624f; background: #effaf5; border-radius: 999px; padding: 7px 11px; font-size: 13px; font-weight: 800; }
      h1 { margin: 18px 0 16px; font-size: clamp(36px, 6vw, 62px); line-height: 1.04; letter-spacing: 0; }
      .lead { max-width: 720px; color: var(--muted); font-size: 18px; line-height: 1.8; }
      .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
      .primary, .secondary { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; padding: 11px 15px; text-decoration: none; font-weight: 850; }
      .primary { color: #fff; background: var(--ink); border: 1px solid var(--ink); }
      .secondary { color: var(--ink); background: #fff; border: 1px solid var(--line); }
      .panel, .card, .bar { border: 1px solid var(--line); border-radius: 8px; background: var(--paper); }
      .panel { box-shadow: 0 18px 48px rgba(0,0,0,.08); padding: 22px; }
      .panel strong { display: block; margin-bottom: 8px; font-size: 30px; line-height: 1.1; }
      .panel p, .card p, .card li, .bar p { color: var(--muted); line-height: 1.75; }
      section { padding: 26px 0; }
      .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
      .card { padding: 20px; }
      .card h2 { margin: 0 0 12px; font-size: 23px; letter-spacing: 0; }
      .card p { margin: 0; }
      ol { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
      li { display: grid; grid-template-columns: 30px 1fr; gap: 10px; align-items: start; }
      li span { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; color: #fff; background: var(--teal); font-weight: 850; }
      .band { border-block: 1px solid #e4e8dd; background: var(--soft); }
      .bar { display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: center; padding: 22px; }
      .bar strong { display: block; margin-bottom: 8px; font-size: 22px; }
      .price { color: var(--gold); font-weight: 900; }
      footer { border-top: 1px solid var(--line); color: var(--muted); padding: 28px 0 40px; }
      @media (max-width: 860px) {
        nav, .hero, .grid, .bar { grid-template-columns: 1fr; }
        nav { align-items: flex-start; flex-direction: column; padding: 12px 0; }
      }
    </style>
  </head>
  <body>
    <header>
      <nav class="shell">
        <a class="brand" href="../index.html"><span class="mark">T</span><span>标题工厂</span></a>
        <div class="nav-links">
          <a href="../industry-packs.html">行业包</a>
          <a href="../template-library.html">模板库</a>
          <a href="../downloads/title-factory-starter-pack.html">免费样品包</a>
          <a href="../paid-template-pack.html">付费模板包</a>
        </div>
      </nav>
    </header>
    <main>
      <section class="shell hero">
        <div>
          <span class="kicker">解决方案 · 高购买意图入口</span>
          <h1>${escapeHtml(solution.title)}</h1>
          <p class="lead">${escapeHtml(description)}</p>
          <div class="actions">
            <a class="primary" href="../${escapeHtml(solution.toolHref)}">${escapeHtml(solution.primaryLabel || "先用免费工具")}</a>
            <a class="secondary" href="../${escapeHtml(solution.packHref)}">查看对应模板包</a>
          </div>
        </div>
        <aside class="panel">
          <strong>搜索意图更接近付费</strong>
          <p>${escapeHtml(solution.intent)}</p>
        </aside>
      </section>
      <section class="shell grid">
        <article class="card">
          <h2>适合谁</h2>
          <p>${escapeHtml(solution.audience)}。</p>
        </article>
        <article class="card">
          <h2>正在卡在哪里</h2>
          <p>${escapeHtml(solution.pain)}</p>
        </article>
        <article class="card">
          <h2>拿到后怎么用</h2>
          <p>${escapeHtml(solution.outcome)}</p>
        </article>
      </section>
      <section class="shell">
        <article class="card">
          <h2>可直接改写的方向</h2>
          <ol>${examples}</ol>
        </article>
      </section>
      <section class="band">
        <div class="shell grid">
          <article class="card">
            <h2>先试工具</h2>
            <p>免费工具适合快速生成第一批标题、文案和提示词，判断表达方向是否对路。</p>
          </article>
          <article class="card">
            <h2>再看样品</h2>
            <p>样品包负责让用户看到真实结构，降低直接购买完整包的犹豫。</p>
          </article>
          <article class="card">
            <h2>最后进入完整包</h2>
            <p><span class="price">¥99</span> 完整包包含 25 个行业、1000+ 条模板和 750 条内容日历方向。</p>
          </article>
        </div>
      </section>
      <section class="shell">
        <div class="bar">
          <div>
            <strong>这类页面负责承接“我想买模板”的搜索。</strong>
            <p>比普通工具页更靠近付费意图，但仍保留免费工具和样品包入口，避免用户马上离开。</p>
          </div>
          <div class="actions">
            <a class="primary" href="../downloads/title-factory-starter-pack.html">下载样品</a>
            <a class="secondary" href="../paid-template-pack.html">查看完整付费包</a>
          </div>
        </div>
      </section>
    </main>
    <footer>
      <div class="shell">标题工厂 · ${escapeHtml(solution.title)}</div>
    </footer>
  </body>
</html>
`;
}

function pageFaq(page) {
  return [
    {
      question: `${page.title}适合谁用？`,
      answer: `适合${page.audience}，尤其适合已经有内容方向，但卡在标题、开头、卖点表达和 AI 提问方式的人。`,
    },
    {
      question: "生成结果可以直接发布吗？",
      answer: "可以作为第一版草稿使用，但建议结合真实产品、真实案例和平台规则再做微调，避免标题夸张或承诺过度。",
    },
    {
      question: "这个工具和普通提示词有什么区别？",
      answer: "普通提示词需要你自己组织场景信息，这个页面会预先填好行业、目标用户和常见痛点，再把用户带到生成器里快速生成。",
    },
  ];
}

function renderJsonLd(page, description) {
  const faq = pageFaq(page);
  return JSON.stringify(
    [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: page.title,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description,
        url: `${baseUrl}/tools/${page.slug}.html`,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "CNY",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
    null,
    2
  );
}

function renderSeoPage(page) {
  const description = `${page.title}，适合${page.audience}生成标题、开头、文案结构和 AI 提示词。无需登录，打开即可使用。`;
  const examples = page.examples
    .map((example, index) => `<li><span>${index + 1}</span>${escapeHtml(example)}</li>`)
    .join("");
  const faqs = pageFaq(page)
    .map(
      (item) => `<details>
            <summary>${escapeHtml(item.question)}</summary>
            <p>${escapeHtml(item.answer)}</p>
          </details>`
    )
    .join("");
  const related = relatedPages(page)
    .map((item) => `<a href="${item.slug}.html">${escapeHtml(item.title)}</a>`)
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(page.title)} - 标题工厂</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${baseUrl}/tools/${page.slug}.html" />
    <script type="application/ld+json">${renderJsonLd(page, description)}</script>
    <style>
      :root {
        --ink: #171717;
        --muted: #626262;
        --line: #dddddd;
        --paper: #ffffff;
        --mint: #dff4ea;
        --teal: #1e9c89;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
        background: linear-gradient(180deg, #fbfaf7 0%, #fff 58%);
      }
      a { color: inherit; }
      .shell { width: min(1080px, calc(100% - 32px)); margin: 0 auto; }
      header { border-bottom: 1px solid var(--line); background: rgba(255, 255, 255, .88); backdrop-filter: blur(16px); }
      .nav { min-height: 66px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
      .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; text-decoration: none; }
      .mark { display: grid; width: 34px; height: 34px; place-items: center; color: #fff; background: var(--ink); border-radius: 8px; }
      .nav a:last-child, .cta { text-decoration: none; border: 1px solid var(--ink); color: #fff; background: var(--ink); padding: 10px 14px; border-radius: 8px; }
      .hero { display: grid; grid-template-columns: 1fr .82fr; gap: 36px; align-items: center; padding: 58px 0 34px; }
      .kicker { display: inline-flex; color: #14574d; background: var(--mint); padding: 7px 10px; border-radius: 999px; font-size: 13px; font-weight: 750; }
      h1 { margin: 18px 0 16px; font-size: clamp(36px, 6vw, 64px); line-height: 1.04; letter-spacing: 0; }
      .lead { color: var(--muted); font-size: 18px; line-height: 1.8; }
      .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 26px; }
      .secondary { text-decoration: none; border: 1px solid var(--line); background: #fff; padding: 10px 14px; border-radius: 8px; }
      .panel { border: 1px solid var(--line); background: #fff; border-radius: 8px; box-shadow: 0 18px 50px rgba(24,24,24,.08); padding: 20px; }
      .panel h2 { margin: 0 0 12px; font-size: 21px; }
      .panel p { margin: 0; color: var(--muted); line-height: 1.7; }
      .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
      .chip { border: 1px solid var(--line); background: #fbfbfb; border-radius: 999px; padding: 8px 10px; font-size: 13px; }
      section { padding: 24px 0; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .card { border: 1px solid var(--line); background: #fff; border-radius: 8px; padding: 20px; }
      .card h2 { margin: 0 0 12px; font-size: 24px; }
      .card p, .card li { color: var(--muted); line-height: 1.75; }
      details { border-top: 1px solid var(--line); padding: 14px 0; }
      details:first-of-type { border-top: 0; }
      summary { cursor: pointer; font-weight: 800; }
      details p { margin: 10px 0 0; }
      .related { display: flex; flex-wrap: wrap; gap: 10px; }
      .related a { border: 1px solid var(--line); background: #fff; border-radius: 8px; padding: 10px 12px; text-decoration: none; }
      ol { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
      li { display: grid; grid-template-columns: 30px 1fr; gap: 10px; align-items: start; }
      li span { display: grid; place-items: center; width: 30px; height: 30px; color: #fff; background: var(--teal); border-radius: 8px; font-weight: 800; }
      .bar { margin: 28px 0 56px; border: 1px solid #d9d3c9; background: #fffdf8; border-radius: 8px; padding: 22px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
      footer { border-top: 1px solid var(--line); color: var(--muted); padding: 28px 0 40px; }
      @media (max-width: 780px) {
        .hero, .grid { grid-template-columns: 1fr; }
        .bar, .nav { align-items: flex-start; flex-direction: column; }
      }
    </style>
  </head>
  <body>
    <header>
      <div class="shell nav">
        <a class="brand" href="../index.html"><span class="mark">T</span><span>标题工厂</span></a>
        <a href="${escapeHtml(toolHref(page))}">打开生成器</a>
      </div>
    </header>
    <main>
      <section class="shell hero">
        <div>
          <span class="kicker">行业长尾页 · 免费工具入口</span>
          <h1>${escapeHtml(page.title)}</h1>
          <p class="lead">${escapeHtml(description)}</p>
          <div class="actions">
            <a class="cta" href="${escapeHtml(toolHref(page))}">立即生成内容</a>
            <a class="secondary" href="../index.html#industries">查看其他行业</a>
          </div>
        </div>
        <aside class="panel">
          <h2>适合谁用</h2>
          <p>${escapeHtml(page.audience)}。尤其适合已经有产品或内容方向，但卡在标题、开头和表达结构的人。</p>
          <div class="chips">
            <span class="chip">${escapeHtml(page.industry)}</span>
            <span class="chip">标题生成</span>
            <span class="chip">文案结构</span>
            <span class="chip">AI 提示词</span>
          </div>
        </aside>
      </section>
      <section class="shell grid">
        <article class="card">
          <h2>常见卡点</h2>
          <p>${escapeHtml(page.pain)}</p>
        </article>
        <article class="card">
          <h2>可以生成什么</h2>
          <p>打开工具后，会自动填好行业、目标用户和痛点。你可以生成小红书标题、短视频开头、商品标题、朋友圈文案、30 天内容日历和可复制的 AI 提示词。</p>
        </article>
      </section>
      <section class="shell">
        <article class="card">
          <h2>标题示例</h2>
          <ol>${examples}</ol>
        </article>
      </section>
      <section class="shell grid">
        <article class="card">
          <h2>常见问题</h2>
          ${faqs}
        </article>
        <article class="card">
          <h2>相关工具</h2>
          <div class="related">${related}</div>
        </article>
      </section>
      <div class="shell">
        <div class="bar">
          <div>
            <strong>把这个页面当成搜索入口，把首页工具当成转化入口。</strong>
            <p style="margin: 8px 0 0; color: var(--muted); line-height: 1.7;">这是程序化 SEO 的基本结构：每个行业页解决一个具体搜索词，再把用户带到同一个工具。</p>
          </div>
          <a class="cta" href="${escapeHtml(toolHref(page))}">开始生成</a>
        </div>
      </div>
    </main>
    <footer>
      <div class="shell">标题工厂 · ${escapeHtml(page.title)}</div>
    </footer>
  </body>
</html>
`;
}

function renderCommercialLicenseJsonLd(page, description) {
  return JSON.stringify(
    [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: page.title,
        description,
        brand: { "@type": "Brand", name: "标题工厂" },
        url: `${baseUrl}/licenses/${page.slug}.html`,
        offers: {
          "@type": "Offer",
          price: "999",
          priceCurrency: "CNY",
          availability: "https://schema.org/PreOrder",
          url: `${baseUrl}/business-license.html`,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `${page.title}适合谁？`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `适合${formatAudience(page.audience)}，尤其适合需要团队内部复用、客户项目打样或建立内容 SOP 的使用场景。`,
            },
          },
          {
            "@type": "Question",
            name: "商业授权和普通模板包有什么区别？",
            acceptedAnswer: {
              "@type": "Answer",
              text: "普通模板包适合个人下载后自己改写，商业授权适合团队内部复用、客户项目打样和工作室交付边界说明。",
            },
          },
          {
            "@type": "Question",
            name: "商业授权包含代运营或咨询吗？",
            acceptedAnswer: {
              "@type": "Answer",
              text: "不包含。商业授权是数字产品授权，不包含代运营、代写、一对一咨询、账号诊断或效果保证。",
            },
          },
        ],
      },
    ],
    null,
    2
  );
}

function renderCommercialLicensePage(page) {
  const description = `${page.title}，适合${formatAudience(page.audience)}。用于团队内部复用、客户项目打样和内容 SOP 沉淀，导向标题工厂 ¥999 商业授权版。`;
  const examples = page.examples
    .map((example, index) => `<li><span>${index + 1}</span>${escapeHtml(example)}</li>`)
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(page.title)} - 标题工厂商业授权</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${baseUrl}/licenses/${page.slug}.html" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${baseUrl}/licenses/${page.slug}.html" />
    <script type="application/ld+json">${renderCommercialLicenseJsonLd(page, description)}</script>
    <style>
      :root {
        --ink: #151515;
        --muted: #62656b;
        --line: #dddddd;
        --paper: #ffffff;
        --soft: #f6f8f3;
        --teal: #14785f;
        --gold: #a66a12;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
        background: linear-gradient(180deg, #fbfaf7 0%, #fff 52%);
      }
      a { color: inherit; }
      .shell { width: min(1080px, calc(100% - 32px)); margin: 0 auto; }
      header { position: sticky; top: 0; z-index: 8; border-bottom: 1px solid var(--line); background: rgba(255,255,255,.9); backdrop-filter: blur(16px); }
      nav { min-height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
      .brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; font-weight: 850; }
      .mark { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 8px; color: #fff; background: var(--ink); }
      .nav-links { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
      .nav-links a { color: var(--muted); text-decoration: none; font-size: 14px; }
      .hero { display: grid; grid-template-columns: 1fr .84fr; gap: 34px; align-items: center; padding: 56px 0 32px; }
      .kicker { display: inline-flex; width: fit-content; border: 1px solid #b8d8ca; color: #0f624f; background: #effaf5; border-radius: 999px; padding: 7px 11px; font-size: 13px; font-weight: 800; }
      h1 { margin: 18px 0 16px; font-size: clamp(36px, 6vw, 62px); line-height: 1.04; letter-spacing: 0; }
      .lead { max-width: 720px; color: var(--muted); font-size: 18px; line-height: 1.8; }
      .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
      .primary, .secondary { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; padding: 11px 15px; text-decoration: none; font-weight: 850; }
      .primary { color: #fff; background: var(--ink); border: 1px solid var(--ink); }
      .secondary { color: var(--ink); background: #fff; border: 1px solid var(--line); }
      .panel, .card, .bar { border: 1px solid var(--line); border-radius: 8px; background: var(--paper); }
      .panel { box-shadow: 0 18px 48px rgba(0,0,0,.08); padding: 22px; }
      .panel strong { display: block; color: var(--gold); margin: 10px 0; font-size: 42px; line-height: 1; }
      .panel p, .card p, .card li, .bar p { color: var(--muted); line-height: 1.75; }
      section { padding: 26px 0; }
      .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
      .card { padding: 20px; }
      .card h2 { margin: 0 0 12px; font-size: 23px; letter-spacing: 0; }
      .card p { margin: 0; }
      .band { border-block: 1px solid #e4e8dd; background: var(--soft); }
      ol { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
      li { display: grid; grid-template-columns: 30px 1fr; gap: 10px; align-items: start; }
      li span { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; color: #fff; background: var(--teal); font-weight: 850; }
      .bar { display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: center; padding: 22px; }
      .bar strong { display: block; margin-bottom: 8px; font-size: 22px; }
      footer { border-top: 1px solid var(--line); color: var(--muted); padding: 28px 0 40px; }
      @media (max-width: 860px) {
        nav, .hero, .grid, .bar { grid-template-columns: 1fr; }
        nav { align-items: flex-start; flex-direction: column; padding: 12px 0; }
      }
    </style>
  </head>
  <body>
    <header>
      <nav class="shell">
        <a class="brand" href="../index.html"><span class="mark">T</span><span>标题工厂</span></a>
        <div class="nav-links">
          <a href="../business-license.html">商业授权</a>
          <a href="../business-license-vs-template-pack.html">授权区别</a>
          <a href="../purchase-guide.html">买哪个版本</a>
          <a href="../paid-template-pack.html">付费模板包</a>
        </div>
      </nav>
    </header>
    <main>
      <section class="shell hero">
        <div>
          <span class="kicker">商业授权入口 · 高客单价搜索</span>
          <h1>${escapeHtml(page.title)}</h1>
          <p class="lead">${escapeHtml(description)}</p>
          <div class="actions">
            <a class="primary" href="../business-license.html">查看 ¥999 商业授权</a>
            <a class="secondary" href="../business-license-vs-template-pack.html">先看授权区别</a>
            <a class="secondary" href="../purchase-guide.html">买哪个版本</a>
          </div>
        </div>
        <aside class="panel">
          <span class="kicker">推荐层级</span>
          <strong>¥999</strong>
          <p>适合团队内部复用、客户项目打样和内容 SOP 沉淀。不包含代运营、代写、一对一咨询或效果保证。</p>
        </aside>
      </section>
      <section class="shell grid">
        <article class="card">
          <h2>适合谁</h2>
          <p>${escapeHtml(page.audience)}。</p>
        </article>
        <article class="card">
          <h2>当前卡点</h2>
          <p>${escapeHtml(page.pain)}</p>
        </article>
        <article class="card">
          <h2>授权后怎么用</h2>
          <p>${escapeHtml(page.outcome)}</p>
        </article>
      </section>
      <section class="shell">
        <article class="card">
          <h2>可承接的搜索意图</h2>
          <p>${escapeHtml(page.intent)}</p>
        </article>
      </section>
      <section class="band">
        <div class="shell grid">
          <article class="card">
            <h2>团队内部复用</h2>
            <p>可以把模板整理进飞书、Notion、语雀或内部表格，让成员按统一结构出标题、脚本和销售页方向。</p>
          </article>
          <article class="card">
            <h2>客户项目打样</h2>
            <p>可以用于客户项目中的改写后内容方向，但不能把原始模板包、授权文件或压缩包二次转售。</p>
          </article>
          <article class="card">
            <h2>边界更清楚</h2>
            <p>商业授权文件会写明允许、禁止和不包含的服务，减少后续人工解释。</p>
          </article>
        </div>
      </section>
      <section class="shell">
        <article class="card">
          <h2>典型使用场景</h2>
          <ol>${examples}</ol>
        </article>
      </section>
      <section class="shell">
        <div class="bar">
          <div>
            <strong>如果只是个人使用，先买普通模板包就够了。</strong>
            <p>如果多人共用、用于客户项目或要沉淀团队 SOP，再考虑商业授权。</p>
          </div>
          <div class="actions">
            <a class="primary" href="../business-license.html">查看商业授权</a>
            <a class="secondary" href="../paid-template-pack.html">查看普通模板包</a>
          </div>
        </div>
      </section>
    </main>
    <footer>
      <div class="shell">标题工厂 · ${escapeHtml(page.title)}</div>
    </footer>
  </body>
</html>
`;
}

function renderSitemap() {
  const corePages = [
    { loc: "", priority: "1.0" },
    { loc: "paid-template-pack.html", priority: "0.9" },
    { loc: "purchase-guide.html", priority: "0.9" },
    { loc: "business-license.html", priority: "0.89" },
    { loc: "business-license-vs-template-pack.html", priority: "0.88" },
    { loc: "downloads/title-factory-starter-pack.html", priority: "0.85" },
    { loc: "template-library.html", priority: "0.88" },
    { loc: "industry-packs.html", priority: "0.87" },
    { loc: "ai-tools-workbench.html", priority: "0.84" },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${corePages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}/${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
${seoPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}/tools/${page.slug}.html</loc>
    <lastmod>${today}</lastmod>
    <priority>0.8</priority>
  </url>`
  )
  .join("\n")}
${industryPacks
  .map(
    (pack) => `  <url>
    <loc>${baseUrl}/packs/${pack.slug}.html</loc>
    <lastmod>${today}</lastmod>
    <priority>0.82</priority>
  </url>`
  )
  .join("\n")}
${solutionPages
  .map(
    (solution) => `  <url>
    <loc>${baseUrl}/solutions/${solution.slug}.html</loc>
    <lastmod>${today}</lastmod>
    <priority>0.83</priority>
  </url>`
  )
  .join("\n")}
${commercialLicensePages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}/licenses/${page.slug}.html</loc>
    <lastmod>${today}</lastmod>
    <priority>0.86</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
}

await rm("tools", { recursive: true, force: true });
await rm("packs", { recursive: true, force: true });
await rm("solutions", { recursive: true, force: true });
await rm("licenses", { recursive: true, force: true });
await mkdir("tools", { recursive: true });
await mkdir("packs", { recursive: true });
await mkdir("solutions", { recursive: true });
await mkdir("licenses", { recursive: true });

for (const page of seoPages) {
  await writeFile(`tools/${page.slug}.html`, renderSeoPage(page), "utf8");
}

for (const pack of industryPacks) {
  await writeFile(`packs/${pack.slug}.html`, renderIndustryPackPage(pack), "utf8");
}

for (const solution of solutionPages) {
  await writeFile(`solutions/${solution.slug}.html`, renderSolutionPage(solution), "utf8");
}

for (const page of commercialLicensePages) {
  await writeFile(`licenses/${page.slug}.html`, renderCommercialLicensePage(page), "utf8");
}

await writeFile("sitemap.xml", renderSitemap(), "utf8");
await writeFile(
  "robots.txt",
  `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`,
  "utf8"
);

console.log(
  `Generated ${seoPages.length} SEO pages, ${industryPacks.length} industry pack pages, ${solutionPages.length} solution pages, ${commercialLicensePages.length} commercial license pages, sitemap.xml, and robots.txt`
);
