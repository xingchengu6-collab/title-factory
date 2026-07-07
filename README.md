# 标题工厂

一个免费标题与文案生成器工具站，包含免费生成器、行业模板包、版本选择页、付费模板包和团队商业授权页面。

## 当前包含

- 首页工具：`index.html`
- AI 工具垂直工作台：`ai-tools-workbench.html`
- 版本选择页：`purchase-guide.html`
- 商业授权页：`business-license.html`
- 商业授权对比页：`business-license-vs-template-pack.html`
- 行业数据：`data/seo-pages.mjs`
- 页面生成脚本：`scripts/generate-seo-pages.mjs`
- 本地服务和生成接口：`server.mjs`
- 免费下载样品包：`downloads/title-factory-starter-pack.md`
- 可售卖 AI 工具模板包草案：`downloads/ai-tools-paid-template-pack.md`
- 通知名单本地存储：`data/waitlist.csv`
- 轻量事件记录：`data/events.csv`
- 行业工具页：`tools/*.html`，当前生成 125 个页面
- 行业模板包页：`packs/*.html`，当前生成 25 个页面
- 模板方案页：`solutions/*.html`，当前生成 12 个页面
- 商业授权页：`licenses/*.html`，当前生成 6 个页面
- 搜索引擎文件：`sitemap.xml`、`robots.txt`
- 部署说明：`DEPLOY.md`
- 运营计划：`OPERATING_PLAN.md`
- 收钱配置清单：`MONEY_SETUP.md`
- 购买意向表单设置：`LEAD_FORM_SETUP.md`
- 发布说明：`RELEASE_NOTES.md`

## 本地运行

```bash
npm start
```

打开：

```text
http://localhost:4173
```

没有配置 AI 密钥时，接口会自动返回本地模板结果，页面仍然能正常演示。

AI 工具工作台：

```text
http://localhost:4173/ai-tools-workbench.html
```

健康检查：

```text
http://localhost:4173/healthz
```

## 产品入口

首页已经包含两个轻量入口：

- 免费模板包下载：`downloads/title-factory-starter-pack.md`
- 商业授权：`business-license.html`
- Pro 通知：提交后保存到 `data/waitlist.csv`
- 价格区：免费版、模板包、Pro 版

支付链接可以通过环境变量配置：

```bash
TEMPLATE_PACK_URL=https://你的模板包购买链接
PRO_CHECKOUT_URL=https://你的 Pro 购买链接
BUSINESS_LICENSE_URL=https://你的商业授权购买链接
PURCHASE_INTENT_URL=https://你的购买意向表单链接
```

如果只部署在 GitHub Pages 这种静态站，也可以直接填写根目录的 `checkout-config.json`。页面会读取 `checkout-config.json` 和 `/api/config`；部署平台环境变量有值时优先生效。`purchaseIntentUrl` 可以填写飞书表单、金数据、腾讯问卷或 Tally 链接，用来被动收集购买意向。

通知名单只是早期验证用，真正上线后可以迁到邮件服务、数据库或支付平台。

## 轻量数据记录

页面会把这些事件记录到 `data/events.csv`：

- 页面访问
- 生成内容
- 复制结果
- 导出 Markdown / CSV
- 点击行业入口
- 点击模板包下载/查看
- 提交 Pro 通知名单

事件记录只保存事件名、页面路径、生成模式、行业和来源，不保存 IP、浏览器指纹或邮箱。

## 接入真实 AI

服务端读取这些环境变量：

```bash
AI_API_KEY=你的密钥
AI_MODEL=你的模型
AI_API_URL=https://api.openai.com/v1/chat/completions
npm start
```

也兼容 `OPENAI_API_KEY`。密钥只在服务端读取，不会写进前端页面。

## 重新生成页面

```bash
npm run generate
```

也可以在生成时指定正式域名：

```bash
SITE_URL=https://你的域名.com npm run generate
```

## 上线前检查

```bash
npm run preflight
```

## 下一步

1. 按 `DEPLOY.md` 上线到支持 Node 服务的平台。
2. 把通知名单接到邮件工具，并为模板包接入真实支付或下载门槛。
3. 用搜索数据筛选表现好的行业，再继续扩展第二批长尾页面。
