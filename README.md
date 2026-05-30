# 🍳 早餐管理应用

[English Version](./README_EN.md) | **简体中文**

---

## 📖 项目简介

一个基于 Node.js 的本地早餐管理应用，支持智能库存管理、AI 营养建议、数据统计分析和保质期提醒。帮助您科学管理早餐库存，根据个人身体数据获取个性化营养建议。

![Node.js](https://img.shields.io/badge/Node.js-14%2B-green) ![License](https://img.shields.io/badge/License-MIT-blue) ![Version](https://img.shields.io/badge/Version-2.0.0-blue)

---

## ✨ 功能特性

### 📦 库存管理

- 添加、删除早餐项，支持快速消耗 / 补充库存
- 智能提醒线设置，库存不足自动预警
- **保质期管理**：设置保质期，自动提醒过期 / 即将过期
- 支持多种计量单位（盒、袋、个、杯等）
- **常用模板**：保存常用早餐为模板，一键快速添加

### 📊 数据统计

- 四项概览指标：总品类、总库存、低库存、即将过期
- 近 7 天消耗趋势图（折线图）
- 品类消耗分布（环形图）
- 库存概览（水平柱状图，按状态着色）
- 最近 30 天早餐消耗记录

> 图表使用 Chart.js 本地加载，不依赖外部 CDN，页面主体优先渲染。

### 🤖 AI 智能建议

- 基于用户身体数据（身高、体重、年龄、性别）分析
- 结合当前库存和消耗历史生成个性化建议
- 营养成分分析与库存补充提醒
- 流式输出，实时显示生成过程

### 🌙 暗色模式

- 一键切换亮色 / 暗色主题
- 自动跟随系统偏好
- 记忆用户选择

### 💾 数据管理

- **数据导出**：一键导出全部数据为 JSON 文件备份
- **数据导入**：从备份文件恢复数据（预览确认后覆盖）
- **常用模板**：快速保存 / 使用 / 删除早餐模板
- 历史记录自动保留最近 30 天

### 🎨 用户体验

- 现代化 UI 设计（Tailwind CSS）
- 响应式布局，支持移动端
- 中英双语界面切换
- 流畅的页面切换动画
- 直观的 Toast 操作反馈

---

## 🛠️ 技术栈

| 类别        | 技术                                               |
| --------- | ------------------------------------------------ |
| **运行时**   | Node.js 14+                                      |
| **后端**    | Express 4.18                                     |
| **前端**    | HTML5 + CSS3 + Vanilla JavaScript + Tailwind CSS |
| **图表**    | Chart.js 4.x（npm 安装，本地提供，懒加载）                    |
| **数据存储**  | 本地 JSON 文件                                       |
| **AI 服务** | DeepSeek API（兼容 OpenAI 格式，默认 deepseek-v4-pro）    |

---

## 📁 项目结构

```
breakfast-manager/
├── server/                       # 后端代码目录
│   ├── server.js                 # Express 主服务（路由注册 + 全局错误处理）
│   ├── routes/                   # API 路由目录
│   │   ├── breakfast.js          # 早餐管理 API（含保质期字段）
│   │   ├── user.js               # 用户配置 API
│   │   ├── ai.js                 # AI 建议 API（流式输出）
│   │   ├── data.js               # 数据导出/导入 + 统计汇总 API
│   │   └── template.js           # 模板管理 API
│   ├── data/                     # 数据存储目录（自动创建）
│   │   ├── breakfast.json        # 早餐库存数据
│   │   ├── user.json             # 用户配置数据
│   │   ├── history.json          # 消耗历史记录（保留 30 天）
│   │   └── templates.json        # 常用模板数据
│   └── utils/
│       └── fileStorage.js        # 文件读写 + CRUD 封装
├── public/                       # 前端静态文件目录
│   ├── index.html                # 主页面
│   ├── css/
│   │   └── style.css             # 自定义样式 + 暗色模式
│   └── js/
│       ├── app.js                # 核心模块（路由、语言、暗色模式、Chart.js 懒加载）
│       ├── breakfast.js          # 早餐管理（含保质期显示、模板保存）
│       ├── stats.js              # 统计仪表盘（懒加载 Chart.js）
│       ├── templates.js          # 模板管理
│       ├── user.js               # 用户设置 + 数据导出/导入
│       └── ai.js                 # AI 建议 + 历史记录渲染
├── package.json
└── README.md
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: v14 或更高版本
- **npm**: v6 或更高版本

### 安装步骤

#### 1️⃣ 克隆项目

```bash
git clone https://github.com/wangshengithub/breakfast-manager.git
cd breakfast-manager
```

#### 2️⃣ 安装依赖

```bash
npm install
```

#### 3️⃣ 配置 AI API

如需使用 AI 建议功能：

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/) 注册账号并获取 API 密钥
2. 启动应用后，在「⚙️ 用户设置」页面填写：
   - **API 密钥**: 您的 API Key
   - **API 地址**: `https://api.deepseek.com/v1/chat/completions`（默认）
   - **模型名称**: `deepseek-v4-pro`（默认）/ `deepseek-v4-flash` / 或其他兼容模型

> 模型名称为文本输入框，可自由填写任意模型名，不限于下拉选项。

#### 4️⃣ 启动应用

```bash
npm start
```

启动成功后访问：**http://localhost:3000**

端口可通过环境变量配置：`PORT=8080 npm start`

---

## 📖 使用指南

### 库存管理

1. 点击「+ 添加早餐」手动添加，或点击「⭐ 从模板添加」快速创建
2. 可选填写「保质期至」日期，系统将自动提醒过期 / 即将过期
3. 点击卡片上的「⭐ 存为模板」保存为常用模板
4. 消耗、补充、删除操作一键完成
5. 库存低于提醒线时自动弹出预警

### 统计仪表盘

切换到「📊 统计」页面即可查看：

- 顶部四项概览指标
- 近 7 天消耗趋势折线图
- 品类消耗分布环形图
- 库存概览水平柱状图
- 最近早餐消耗记录

> 首次进入统计页面时 Chart.js 会在后台自动加载，不影响页面浏览。

### AI 早餐建议

1. 完成用户身体数据配置
2. 配置 AI API 密钥
3. 点击「✨ 获取建议」，AI 将实时流式生成建议

### 数据备份与恢复

在「⚙️ 用户设置」页面底部：

- **📥 导出数据**：下载包含全部数据的 JSON 文件
- **📤 导入数据**：选择备份文件，预览数据后确认导入（覆盖当前数据）

### 暗色模式

点击导航栏右侧的 🌙 / ☀️ 按钮切换，系统会自动记忆偏好并跟随系统主题。

---

## 🔌 API 接口文档

### 早餐管理 API

| 方法     | 路径                            | 描述                        |
| ------ | ----------------------------- | ------------------------- |
| GET    | `/api/breakfasts`             | 获取所有早餐列表                  |
| POST   | `/api/breakfasts`             | 添加新早餐（支持 `expiryDate` 字段） |
| PUT    | `/api/breakfasts/:id`         | 更新早餐信息                    |
| DELETE | `/api/breakfasts/:id`         | 删除指定早餐                    |
| POST   | `/api/breakfasts/:id/consume` | 消耗早餐（同步记录历史）              |
| POST   | `/api/breakfasts/:id/restock` | 补充早餐                      |

### 用户配置 API

| 方法   | 路径                | 描述                          |
| ---- | ----------------- | --------------------------- |
| GET  | `/api/user`       | 获取用户配置（API Key 已脱敏）         |
| PUT  | `/api/user`       | 更新用户配置                      |
| POST | `/api/user/reset` | 重置所有数据（需 `confirm: "true"`） |

### AI 建议 API

| 方法   | 路径                | 描述                    |
| ---- | ----------------- | --------------------- |
| GET  | `/api/ai/history` | 获取最近 3 天历史记录          |
| POST | `/api/ai/suggest` | 获取 AI 早餐建议（流式 SSE 输出） |
| POST | `/api/ai/record`  | 手动记录今日早餐              |

### 数据管理 API

| 方法   | 路径                  | 描述                |
| ---- | ------------------- | ----------------- |
| GET  | `/api/data/export`  | 导出全部数据为 JSON 文件下载 |
| POST | `/api/data/import`  | 导入数据（覆盖当前数据）      |
| GET  | `/api/data/summary` | 获取统计汇总数据          |

### 模板管理 API

| 方法     | 路径                   | 描述         |
| ------ | -------------------- | ---------- |
| GET    | `/api/templates`     | 获取所有模板     |
| POST   | `/api/templates`     | 添加模板（自动去重） |
| DELETE | `/api/templates/:id` | 删除指定模板     |

---

## 📊 数据存储

所有数据保存在 `server/data/` 目录下：

| 文件               | 描述           | 保留时间    |
| ---------------- | ------------ | ------- |
| `breakfast.json` | 早餐库存数据（含保质期） | 永久      |
| `user.json`      | 用户配置 + AI 设置 | 永久      |
| `history.json`   | 消耗历史记录       | 最近 30 天 |
| `templates.json` | 常用早餐模板       | 永久      |

### 📋 示例数据

项目自带示例数据，首次启动即可体验全部功能，无需手动添加：

**库存（8 项）**

| 名称 | 剩余 | 单位 | 保质期 | 状态 |
|---|---|---|---|---|
| 纯牛奶 | 8 | 盒 | 06-15 | 正常 |
| 全麦面包 | 2 | 袋 | 06-03 | ⚠️ 低库存 |
| 鸡蛋 | 15 | 个 | 06-20 | 正常 |
| 酸奶 | 4 | 杯 | 06-01 | ⚠️ 即将过期 |
| 燕麦片 | 1 | 袋 | 08-30 | ⚠️ 低库存 |
| 火腿肠 | 6 | 根 | 07-10 | 正常 |
| 豆浆粉 | 10 | 包 | 12-01 | 正常 |
| 香蕉 | 3 | 根 | 06-02 | ⚠️ 即将过期 |

- **历史记录**：近 7 天每日消耗记录（纯牛奶、全麦面包、鸡蛋、酸奶、燕麦片等）
- **模板**：4 个常用早餐模板（纯牛奶、全麦面包、鸡蛋、酸奶）
- **用户信息**：身高 175cm、体重 70kg、28 岁、男、特殊需求「减脂期，需要高蛋白低碳水」

> 如需清除示例数据，可在「⚙️ 用户设置」页面点击「🗑️ 重置所有数据」，或直接删除 `server/data/` 目录下的文件后重启。

---

## ⚠️ 注意事项

1. **定期备份**：建议使用应用内的「导出数据」功能定期备份
2. **API 密钥**：请妥善保管，不要泄露给他人
3. **端口配置**：默认 3000，可通过 `PORT` 环境变量修改
4. **浏览器**：推荐 Chrome、Edge、Firefox 等现代浏览器
5. **历史记录**：系统自动保留最近 30 天，超过自动清理

---

## ❓ 常见问题

### Q1: 如何修改端口号？

**A**: 通过环境变量：`PORT=8080 npm start`，或编辑 `server/server.js` 中的 `PORT` 默认值。

### Q2: 如何更换 AI 模型？

**A**: 在「⚙️ 用户设置」页面的「模型名称」输入框中直接修改。支持：

- `deepseek-v4-pro`（默认，推荐）
- `deepseek-v4-flash`（更快响应）
- 或任何 OpenAI 兼容格式的模型名

### Q3: 如何更换 AI 服务提供商？

**A**: 修改「API 地址」即可，支持所有 OpenAI 兼容格式的 API：

- DeepSeek: `https://api.deepseek.com/v1/chat/completions`
- OpenAI: `https://api.openai.com/v1/chat/completions`
- 其他兼容服务

### Q4: 图表加载失败？

**A**: 请确认已运行 `npm install` 安装了 `chart.js` 依赖。图表从本地服务加载，无需联网。

### Q5: AI 建议无法使用？

**A**: 请检查：

1. API 密钥是否正确
2. 网络连接是否正常
3. API 地址是否可访问
4. 模型名称是否正确

### Q6: 如何迁移数据？

**A**: 使用「📥 导出数据」下载备份 → 在新环境部署 → 使用「📤 导入数据」恢复。

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 👨‍💻 作者

**wangshengithub**

- GitHub: [wangshengithub](https://github.com/wangshengithub)
- 项目地址: [breakfast-manager](https://github.com/wangshengithub/breakfast-manager)

---

<div align="center">

### ⭐ 如果这个项目对你有帮助，欢迎 Star 支持！

[![Star History Chart](https://api.star-history.com/svg?repos=wangshengithub/breakfast-manager&type=Date)](https://star-history.com/#wangshengithub/breakfast-manager&Date)

**Made with ❤️ by wangshengithub**

[⬆ 返回顶部](#-早餐管理应用)

</div>
