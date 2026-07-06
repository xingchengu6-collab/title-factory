import { mkdir, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const outDir = "private-delivery/title-factory-paid-template-pack-v1";

const industries = [
  ["AI 工具", "AI 工具创作者", "工具功能说不清，用户不知道什么时候用"],
  ["电商", "淘宝/拼多多/抖店商家", "商品标题普通，搜索和点击都偏低"],
  ["本地生活", "门店老板", "活动发了没人问，客户不知道为什么现在来"],
  ["教育培训", "课程顾问和老师", "课程卖点太像广告，家长看完没信任"],
  ["健身健康", "私教和健康管理师", "专业内容太硬，普通用户看不懂"],
  ["家居装修", "装修公司和设计师", "客户担心踩坑，却不知道怎么建立信任"],
  ["自由职业", "设计师、剪辑师、咨询顾问", "会做服务但不会包装价值"],
  ["B2B 服务", "企业服务销售和运营", "产品复杂，内容写出来没人继续看"],
  ["餐饮", "餐饮店主和探店账号", "菜品不错，但线上内容缺少记忆点"],
  ["美业", "美甲美睫皮肤管理门店", "服务差异说不清，容易只拼低价"],
  ["宠物", "宠物店和宠物用品商家", "用户有需求，但不理解产品适合什么场景"],
  ["摄影", "摄影师和写真工作室", "作品好看，但客户不知道套餐价值"],
  ["房产", "房产顾问和本地置业号", "信息太硬，用户不愿意主动咨询"],
  ["留学", "留学顾问和语言培训", "内容焦虑感强，但缺少清晰路径"],
  ["法律", "律师和法律服务号", "专业内容有距离感，用户不敢问"],
  ["财商", "财商教育和记账工具", "用户想改善财务，但不知道从哪里开始"],
  ["旅游", "旅行规划师和本地攻略号", "攻略太泛，缺少具体人群和场景"],
  ["咖啡", "咖啡店和咖啡教学账号", "内容容易好看但不带来消费动作"],
  ["手作", "手作品牌和课程", "作品有温度，但卖点表达不稳定"],
  ["游戏", "游戏工具和陪玩/教学", "内容热闹但转化弱，用户只看不买"],
  ["职场", "职业咨询和简历服务", "用户有焦虑，但不知道服务能带来什么改变"],
  ["亲子", "亲子教育和母婴产品", "家长怕踩坑，需要更温和可信的表达"],
  ["服饰", "服装店和穿搭账号", "款式多，但没有讲清适合谁和怎么搭"],
  ["SaaS", "SaaS 创业者和市场运营", "功能很多，但用户只关心解决什么问题"],
  ["知识产品", "课程和模板产品创作者", "内容有价值，但缺少可购买的包装"],
];

const modes = [
  {
    key: "小红书标题",
    patterns: [
      "{industry}新手别再只写功能了，先讲清这个场景",
      "适合{audience}收藏的 {industry} 内容选题清单",
      "{industry}内容没人点？先改这 3 个标题",
      "我用一个模板解决了{painShort}",
      "{industry}账号低粉也能成交的内容结构",
      "{audience}最容易忽略的 5 个表达细节",
      "{industry}怎么写才不像广告？",
      "把{industry}讲清楚的一条小红书笔记结构",
    ],
  },
  {
    key: "短视频开头",
    patterns: [
      "如果你还在为{painShort}发愁，先看这 30 秒",
      "很多{audience}都把第一步做反了",
      "别急着投流，先确认你的内容有没有讲清这个点",
      "今天不用讲概念，直接演示一个能带来咨询的表达结构",
      "你以为是流量问题，其实是表达问题",
      "如果你是{audience}，这个场景一定要提前讲清楚",
      "一个例子讲清楚：{industry}怎么写才有人问",
      "这句话放在开头，用户更愿意继续看",
    ],
  },
  {
    key: "商品页标题",
    patterns: [
      "{industry}专用模板包，适合{audience}，解决{painShort}",
      "{audience}可直接套用的 {industry} 内容素材库",
      "{industry}内容生成模板：标题、文案、提示词一次配齐",
      "{industry}获客文案包，打开即可复制改写",
      "{audience}不用从零想选题的内容工具包",
      "{industry}销售页标题库：人群、场景、卖点、结果",
      "{industry}内容日历包，适合连续发布和批量生产",
      "给{audience}的 {industry} 表达模板，降低沟通成本",
    ],
  },
  {
    key: "朋友圈文案",
    patterns: [
      "很多人以为{painShort}只是小问题，真正影响结果的是长期没有稳定表达结构。",
      "今天整理{industry}内容时发现，客户缺的不是信息，而是能让他马上代入的场景。",
      "如果你也是{audience}，先别急着发产品，先把用户正在经历的具体问题写出来。",
      "{industry}内容能不能带来咨询，常常不取决于发多少，而取决于有没有说中一个真实场景。",
      "一个好文案的标准，不是让客户觉得你很厉害，而是让他觉得你理解他。",
      "我更建议把{industry}内容做成模板，因为模板能重复使用，灵感不能。",
      "不要把朋友圈写成产品说明书。先写客户处境，再写你能怎么帮他。",
      "{audience}想让内容更自然，可以先从客户最常问的问题写起。",
    ],
  },
  {
    key: "AI 提示词",
    patterns: [
      "你是{industry}内容策划。目标用户是{audience}，痛点是{pain}。请生成 20 个小红书标题，要求具体、自然、不夸张。",
      "你是短视频编导。请围绕{industry}为{audience}生成 10 个前三秒开头，每个开头都要指出具体场景。",
      "你是商品标题优化师。请把{industry}产品改写成 10 个标题，包含人群、场景、卖点和结果。",
      "你是私域文案顾问。请根据{pain}写 7 条朋友圈文案，语气专业但不硬广。",
      "你是 SEO 编辑。请为“{industry}标题生成器”生成页面标题、描述、H1、FAQ 和 20 个长尾关键词。",
      "你是增长顾问。请为{audience}设计 30 天内容计划，每天包含标题、正文方向和结尾引导。",
      "你是产品经理。请把{industry}产品拆成免费版、模板包和 Pro 版三个层级，并写出每层价值。",
      "你是文案改写助手。请把普通介绍改成可信、具体、有场景的版本，保留真实信息，减少夸张承诺。",
    ],
  },
];

const calendarThemes = ["痛点解释", "场景案例", "误区纠正", "清单整理", "对比说明", "工具方法"];

function painShort(value) {
  return value.replace(/[。！？!?]/g, "，").split("，")[0].slice(0, 22);
}

function fill(template, data) {
  return template.replace(/\{(\w+)\}/g, (_, key) => data[key] || "");
}

function csvEscape(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

const rows = [];
for (const [industry, audience, pain] of industries) {
  const data = { industry, audience, pain, painShort: painShort(pain) };
  for (const mode of modes) {
    for (const pattern of mode.patterns) {
      rows.push({
        type: mode.key,
        industry,
        audience,
        template: fill(pattern, data),
      });
    }
  }
}

const calendarRows = [];
for (const [industry, audience, pain] of industries) {
  for (let index = 0; index < 30; index += 1) {
    const day = index + 1;
    calendarRows.push({
      type: "30 天内容日历",
      industry,
      audience,
      template: `第 ${day} 天｜${calendarThemes[index % calendarThemes.length]}：围绕${industry}，给${audience}写一条内容，解决“${painShort(pain)}”。`,
    });
  }
}

const csvRows = [["type", "industry", "audience", "template"]]
  .concat([...rows, ...calendarRows].map((row) => [row.type, row.industry, row.audience, row.template]))
  .map((row) => row.map(csvEscape).join(","))
  .join("\n");

const grouped = rows.reduce((map, row) => {
  const key = `${row.industry}｜${row.type}`;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(row.template);
  return map;
}, new Map());

const markdown = [
  "# 标题工厂付费模板包 v1",
  "",
  "适合：内容创作者、小红书运营、短视频运营、电商商家、本地服务商家、AI 工具开发者、独立创业者。",
  "",
  "## 你会得到什么",
  "",
  `- ${rows.length} 条标题、开头、商品页、朋友圈和 AI 提示词模板`,
  `- ${calendarRows.length} 条 30 天内容日历方向`,
  "- CSV 表格版本，方便筛选行业和场景",
  "- Markdown 版本，方便复制到笔记软件或 AI 工具",
  "",
  "## 使用方法",
  "",
  "1. 先选择行业。",
  "2. 再选择场景：小红书、短视频、商品页、朋友圈或 AI 提示词。",
  "3. 把模板里的行业、人群、产品和痛点改成你的真实信息。",
  "4. 复制到标题工厂或任意 AI 工具里继续扩写。",
  "",
  "## 模板库",
  "",
  ...[...grouped.entries()].flatMap(([key, templates]) => [
    `### ${key}`,
    "",
    ...templates.map((template, index) => `${index + 1}. ${template}`),
    "",
  ]),
  "## 30 天内容日历",
  "",
  ...industries.flatMap(([industry]) => {
    const items = calendarRows.filter((row) => row.industry === industry);
    return [`### ${industry}`, "", ...items.map((item) => `- ${item.template}`), ""];
  }),
].join("\n");

const listingCopy = `# 上架文案

## 商品标题
标题工厂付费模板包：1000 条标题/文案/提示词素材库

## 售价
99 元

## 商品简介
一套面向小红书、短视频、商品页、朋友圈和 AI 提示词的内容获客素材库。适合内容创作者、商家、AI 工具运营者和自由职业者直接复制、改写、发布。

## 交付文件
- title-factory-paid-template-pack-v1.md
- title-factory-paid-template-pack-v1.csv
- 使用说明 README.md

## 购买后说明
下载压缩包后，先阅读 README，再根据行业和内容场景筛选模板。建议配合标题工厂网站使用：https://xingchengu6-collab.github.io/

## 标签
小红书标题、短视频文案、AI 提示词、内容运营、模板包、数字产品
`;

const readme = `# 使用说明

感谢购买标题工厂付费模板包。

推荐用法：

1. 打开 CSV 文件，按行业和场景筛选模板。
2. 打开 Markdown 文件，直接复制需要的模板。
3. 把模板中的行业、人群、产品、痛点替换成你的真实信息。
4. 配合标题工厂网站继续生成更多版本：https://xingchengu6-collab.github.io/

注意：

- 模板适合作为内容第一稿，不建议不改就发布。
- 具体行业承诺、医疗、法律、金融内容请自行核对合规性。
- 本模板包为数字产品，适合个人和团队内部使用，请勿二次转卖。
`;

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await writeFile(`${outDir}/title-factory-paid-template-pack-v1.md`, markdown, "utf8");
await writeFile(`${outDir}/title-factory-paid-template-pack-v1.csv`, csvRows, "utf8");
await writeFile(`${outDir}/README.md`, readme, "utf8");
await writeFile(`${outDir}/listing-copy.md`, listingCopy, "utf8");

await execFileAsync("zip", ["-qr", "../title-factory-paid-template-pack-v1.zip", "."], { cwd: outDir });

console.log(`Generated ${rows.length} templates and ${calendarRows.length} calendar items.`);
console.log("private-delivery/title-factory-paid-template-pack-v1.zip");
