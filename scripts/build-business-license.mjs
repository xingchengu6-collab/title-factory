import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const outDir = "private-delivery/title-factory-business-license-v1";
const zipPath = "private-delivery/title-factory-business-license-v1.zip";
const paidPackZip = "private-delivery/title-factory-paid-template-pack-v1.zip";

const readme = `# 标题工厂商业授权版 v1

感谢购买标题工厂商业授权版。

这不是代运营、代写、咨询或陪跑服务，而是一套面向团队、工作室、代运营和企业内容运营的数字产品授权包。

## 你会得到什么

- 标题工厂付费模板包 v1
- 商业授权边界说明
- 团队内部复用 SOP
- 客户项目打样流程
- 交付和禁用场景说明

## 推荐使用方式

1. 先阅读 \`commercial-license-terms.md\`，确认授权边界。
2. 把 \`team-sop.md\` 导入飞书、Notion、语雀或团队知识库。
3. 客户项目启动时，按 \`client-project-workflow.md\` 先做内容方向打样。
4. 将付费模板包里的标题、提示词、销售页结构改写成客户行业和真实产品信息。

## 重要边界

- 可以用于团队内部复用。
- 可以用于客户项目中的改写后内容打样。
- 不可以把原始模板、压缩包或授权文件二次转卖。
- 不包含代运营、代写、一对一咨询、账号诊断或效果保证。
`;

const terms = `# 商业授权边界说明

## 授权对象

购买商业授权后，允许一个团队、工作室、公司或个人经营主体在内部使用标题工厂模板体系。

## 允许使用

- 团队成员内部学习、复制、改写和复用模板。
- 在客户项目中使用模板结构产出改写后的标题、文案、提示词、内容日历和销售页初稿。
- 将模板整理进团队内部 SOP、知识库、飞书文档、Notion、语雀或内部表格。
- 基于模板为客户交付改写后的内容方案。

## 不允许使用

- 直接转售原始模板、压缩包、授权文件或未明显改写的模板库。
- 把本授权包改名、换封面后作为另一个模板产品售卖。
- 公开上传到网盘、资料库、社群或知识付费平台供他人下载。
- 声称自己拥有标题工厂品牌、源文件所有权或独家转授权权利。

## 不包含

- 代运营服务
- 代写服务
- 一对一咨询
- 账号诊断
- 投放服务
- 效果保证、涨粉保证、成交保证或排名保证

## 风险内容提醒

医疗、法律、金融、投资、保险、健康等高风险内容，使用者需要自行做专业和合规审核。
`;

const sop = `# 团队内部复用 SOP

## 1. 建立团队模板库

将付费模板包里的 Markdown 和 CSV 导入团队知识库，按以下维度建立筛选：

- 行业
- 内容场景
- 目标用户
- 标题类型
- 是否适合销售页
- 是否适合短视频开头
- 是否适合私域文案

## 2. 每个项目先填 5 个变量

每个客户或内部项目启动前，先填写：

1. 行业
2. 目标用户
3. 产品/服务
4. 真实痛点
5. 不允许夸张承诺的边界

## 3. 先出 30 条标题方向

从模板包里筛选 3 个场景：

- 小红书标题
- 短视频开头
- 私域/朋友圈文案

每个场景先生成 10 条方向，不追求一次定稿。

## 4. 再做销售页结构

对高客单价产品，按以下结构打样：

- 适合谁
- 不适合谁
- 解决什么痛点
- 交付什么
- 购买后怎么用
- 常见疑虑
- 行动入口

## 5. 固化成项目 SOP

每次项目结束后，把有效标题、被客户采用的表达和高点击开头沉淀回团队库。
`;

const workflow = `# 客户项目打样流程

## 第 1 步：判断客户适合哪类模板

- 门店/本地服务：本地生活获客文案、朋友圈文案、短视频开头
- 电商：商品标题、卖点表达、详情页标题
- 课程/知识产品：销售页模板、小红书标题、AI 提示词
- SaaS/B2B：产品标题、解决方案页、客户问题表达
- AI 工具：工具推广文案、教程标题、使用场景脚本

## 第 2 步：先交付方向，不直接承诺结果

建议第一版交付：

- 20 条标题方向
- 10 条短视频开头
- 7 条私域文案
- 1 个销售页结构
- 1 组 AI 提示词

## 第 3 步：让客户选方向

不要一开始做大量完整内容。先让客户从方向里选择：

- 更像客户真实语气的方向
- 更适合平台的方向
- 更符合产品边界的方向

## 第 4 步：进入批量改写

客户确认方向后，再批量扩展成正文、脚本、朋友圈和销售页。

## 第 5 步：交付边界说明

给客户交付时建议写明：

- 内容为初稿或方向稿
- 需要客户确认真实信息
- 医疗、法律、金融等内容需要客户自行合规审核
- 不承诺固定涨粉、成交或排名
`;

const listingCopy = `# 商业授权上架文案

## 商品标题
标题工厂商业授权版：团队内容模板和客户项目打样授权

## 售价
999 元

## 商品简介
面向代运营团队、内容工作室、小团队和企业内容运营的商业授权包。购买后可在团队内部复用标题工厂模板体系，并用于客户项目中的改写后内容打样。

## 适合
- 代运营团队
- 内容工作室
- 企业运营团队
- 咨询顾问
- 课程和模板产品团队

## 不适合
- 只想个人偶尔发内容
- 想要代运营或一对一咨询
- 想直接转卖原始模板
- 期待购买后保证涨粉或成交

## 交付文件
- title-factory-paid-template-pack-v1.zip
- README.md
- commercial-license-terms.md
- team-sop.md
- client-project-workflow.md

## 标签
商业授权、代运营、内容工作室、AI 提示词、销售页模板、团队 SOP、数字产品
`;

await rm(outDir, { recursive: true, force: true });
await rm(zipPath, { force: true });
await mkdir(outDir, { recursive: true });

await writeFile(`${outDir}/README.md`, readme, "utf8");
await writeFile(`${outDir}/commercial-license-terms.md`, terms, "utf8");
await writeFile(`${outDir}/team-sop.md`, sop, "utf8");
await writeFile(`${outDir}/client-project-workflow.md`, workflow, "utf8");
await writeFile(`${outDir}/listing-copy.md`, listingCopy, "utf8");
await cp(paidPackZip, `${outDir}/title-factory-paid-template-pack-v1.zip`);

await execFileAsync("zip", ["-qr", "../title-factory-business-license-v1.zip", "."], { cwd: outDir });

console.log("Generated private-delivery/title-factory-business-license-v1.zip");
