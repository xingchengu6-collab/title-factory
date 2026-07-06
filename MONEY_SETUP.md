# 收钱配置清单

这份清单只关心一件事：让标题工厂从“可用产品”进入“可收钱产品”。

## 必填配置

`.env` 或部署平台环境变量：

```text
SITE_URL=https://你的正式域名
AI_API_KEY=你的 AI 密钥
AI_MODEL=gpt-4o-mini
TEMPLATE_PACK_URL=https://你的模板包购买链接
PRO_CHECKOUT_URL=https://你的 Pro 订阅链接
```

## 模板包上架

可直接上架的交付文件：

```text
private-delivery/title-factory-paid-template-pack-v1.zip
```

建议商品名：

```text
标题工厂付费模板包：1000 条标题/文案/提示词素材库
```

建议价格：

```text
¥99
```

商品卖点：

- 1000 条标题、开头、商品页、朋友圈和 AI 提示词模板
- 750 条 30 天内容日历方向
- 25 个行业分类
- Markdown 模板库、CSV 表格版和使用说明
- 适合下载后直接复制、筛选、改写和复用

## 当前支付入口状态

- GitHub Pages 公开站已上线。
- 面包多账号已提交创作者申请；当前提示“未审核用户，需要先申请创作者”，因此还不能创建商品。
- `paid-template-pack.html` 暂时展示“自动购买入口接入中”，按钮指向免费样品包，避免空链接。
- 审核通过后，在面包多创建单品，上传 `private-delivery/title-factory-paid-template-pack-v1.zip`，拿到商品链接后填入购买按钮。

面包多上架推荐信息：

```text
标题：标题工厂付费模板包：1000 条标题/文案/提示词素材库
价格：99 元
交付：上传 private-delivery/title-factory-paid-template-pack-v1.zip
封面：private-delivery/title-factory-paid-template-pack-v1/cover-title-factory-paid-pack.png
文案：private-delivery/title-factory-paid-template-pack-v1/listing-copy.md
```

## Pro 订阅页

建议价格：

```text
¥29/月
```

早期 Pro 承诺：

- AI 工具工作台
- 批量生成
- 品牌语气保存
- Markdown / CSV 导出
- 后续新增行业工作台

## 上线后每天看什么

打开：

```text
/admin.html
```

优先看：

- 哪些行业访问最多
- 哪些行业生成最多
- 模板包点击数
- Pro 点击数
- 等待名单提交数

## 第一阶段目标

不要一开始追求“大而全”，先追求这 4 个信号：

1. 有页面被搜索访问
2. 有用户生成内容
3. 有人点击模板包
4. 有人留下邮箱或购买

只要这 4 个信号出现，就继续加码对应行业。
