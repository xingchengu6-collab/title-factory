# 标题工厂上线清单

## 1. 配置环境变量

复制 `.env.example` 的字段到部署平台：

```text
SITE_URL=https://你的正式域名
AI_API_KEY=你的 AI 密钥
AI_MODEL=你的模型
AI_API_URL=https://api.openai.com/v1/chat/completions
```

没有 `AI_API_KEY` 时也能运行，会自动使用本地模板兜底。

## 2. 生成正式 sitemap

上线前用正式域名生成：

```bash
SITE_URL=https://你的正式域名 npm run generate
```

确认：

- `sitemap.xml` 里是正式域名
- `robots.txt` 指向正式 sitemap
- `tools/` 下有 100 个页面

## 3. 启动

```bash
npm start
```

健康检查：

```text
/healthz
```

运营看板：

```text
/admin.html
```

## 4. Render 部署

项目已经包含 `render.yaml`，适合直接导入 Render。

最少步骤：

1. 打开 Render。
2. 新建 Blueprint 或 Web Service。
3. 连接这个项目仓库。
4. Render 会读取 `render.yaml`。
5. 在环境变量里填：
   - `SITE_URL`
   - `AI_API_KEY`
   - `TEMPLATE_PACK_URL`
   - `PRO_CHECKOUT_URL`

没有支付链接时，可以先留空，按钮会回到等待名单。

## 5. 其他部署平台

如果只想最快上线，选支持 Node 服务的平台，例如 Render、Railway、Fly.io 或 VPS。

如果部署到静态平台，首页和 SEO 页面可以打开，但 `/api/generate`、`/api/waitlist`、`/api/event`、`/api/stats` 需要改成平台函数。

## 6. 上线后动作

1. 提交 `sitemap.xml` 到搜索引擎。
2. 每周查看 `/admin.html`，找出访问和生成最多的行业。
3. 把表现好的行业扩成更多长尾页。
4. 当等待名单有稳定提交后，再接支付或邮件系统。
