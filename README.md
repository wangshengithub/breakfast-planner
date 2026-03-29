# 🍳 早餐管理应用

[English Version](./README_EN.md) | **简体中文**

---

## 📖 项目简介

一个基于 Node.js 的本地早餐管理应用，支持库存管理和 AI 智能建议功能。帮助您科学管理早餐库存，根据个人身体数据获取营养建议。

![Node.js](https://img.shields.io/badge/Node.js-14%2B-green) ![License](https://img.shields.io/badge/License-MIT-blue) ![GitHub Stars](https://img.shields.io/github/stars/wangshengithub/breakfast-manager?style=social)

---

## ✨ 功能特性

### 📦 库存管理

- 添加、删除、编辑早餐项
- 快速消耗/补充库存
- 智能提醒线设置
- 库存不足预警
- 支持多种计量单位

### 🤖 AI 智能建议

- 基于用户身体数据分析（身高、体重、年龄、性别）
- 结合当前库存情况生成个性化建议
- 营养成分分析与建议
- 库存补充提醒
- 流式输出，实时显示生成过程

### ⚙️ 用户设置

- 个人身体数据管理
- AI API 自定义配置（兼容 OpenAI 格式）
- 支持特殊需求标记（如减脂期、无乳糖等）
- 数据重置功能

### 💾 数据管理

- 本地 JSON 文件存储
- 自动保留最近 7 天历史记录
- 同一天早餐自动合并显示
- 支持数据导出备份

### 🎨 用户体验

- 现代化 UI 设计（Tailwind CSS）
- 响应式布局，支持移动端
- 中英双语界面切换
- 流畅的动画效果
- 直观的操作反馈

---

## 🛠️ 技术栈

| 类别           | 技术                                               |
| ------------ | ------------------------------------------------ |
| **后端**       | Node.js + Express                                |
| **前端**       | HTML5 + CSS3 + Vanilla JavaScript + Tailwind CSS |
| **数据存储**     | 本地 JSON 文件                                       |
| **AI 服务**    | DeepSeek API（兼容 OpenAI 格式）                       |
| **HTTP 客户端** | Fetch API                                        |

---

## 📁 项目结构

```
breakfast-manager/
├── server/                       # 后端代码目录
│   ├── server.js                 # Express 主服务文件
│   ├── routes/                   # API 路由目录
│   │   ├── breakfast.js          # 早餐管理 API
│   │   ├── user.js               # 用户配置 API
│   │   └── ai.js                 # AI 建议 API
│   ├── data/                     # 数据存储目录
│   │   ├── breakfast.json        # 早餐库存数据
│   │   ├── user.json             # 用户配置数据
│   │   └── history.json          # 历史记录数据
│   └── utils/                    # 工具函数目录
│       └── fileStorage.js        # 文件操作封装
├── public/                       # 前端静态文件目录
│   ├── index.html                # 主页面
│   ├── css/
│   │   └── style.css             # 自定义样式文件
│   └── js/
│       ├── app.js                # 主应用逻辑
│       ├── breakfast.js          # 早餐管理模块
│       ├── user.js               # 用户配置模块
│       └── ai.js                 # AI 建议模块
├── package.json                  # 项目配置文件
└── README.md                     # 项目说明文档
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: v14 或更高版本
- **npm**: v6 或更高版本
- **操作系统**: Windows / macOS / Linux

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

#### 3️⃣ 配置 AI API（可选）

如需使用 AI 建议功能，需要配置 DeepSeek API：

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/) 注册账号
2. 获取 API 密钥
3. 启动应用后，在「用户设置」页面填写：
   - **API 密钥**: 您的 DeepSeek API Key
   - **API 地址**: `https://api.deepseek.com/v1/chat/completions`
   - **模型名称**: `deepseek-chat` 或 `deepseek-reasoner`

#### 4️⃣ 启动应用

```bash
npm start
```

启动成功后，访问：**http://localhost:3000**

---

## 📖 使用指南

### 1️⃣ 库存管理

#### 添加早餐

1. 点击「添加早餐」按钮
2. 填写早餐信息：
   - 早餐名称（如：牛奶、面包）
   - 剩余量（如：10）
   - 单位（如：盒、袋、个）
   - 每次消耗量（如：1）
   - 提醒线（如：3）
3. 点击「添加」

#### 管理库存

- **消耗**: 点击「消耗」按钮减少库存
- **补充**: 点击「补充」按钮增加库存
- **编辑**: 修改早餐信息
- **删除**: 移除不再需要的早餐项

#### 库存预警

当库存低于提醒线时，系统会：

- 显示红色警告标识
- 弹出提醒对话框
- 建议及时补充

### 2️⃣ AI 早餐建议

#### 获取建议

1. 完成用户身体数据配置（身高、体重、年龄、性别）
2. 确保 AI API 已正确配置
3. 点击「获取建议」按钮
4. AI 将实时生成个性化建议

#### 建议内容

- 今日早餐搭配建议
- 营养成分分析
- 库存补充建议
- 特殊需求考量

### 3️⃣ 用户设置

#### 基本信息配置

- **身高**（cm）
- **体重**（kg）
- **年龄**
- **性别**
- **特殊需求**（如：减脂期、增肌期、无乳糖、低糖等）

#### AI 配置

- **API 密钥**: DeepSeek API Key
- **API 地址**: 支持 OpenAI 兼容格式
- **模型名称**: 可自定义模型

#### 数据管理

- **保存用户信息**: 保存个人基本数据
- **保存 AI 配置**: 保存 API 设置
- **重置所有数据**: 清空所有数据（需确认）

---

## 🔌 API 接口文档

### 早餐管理 API

| 方法     | 路径                            | 描述       |
| ------ | ----------------------------- | -------- |
| GET    | `/api/breakfasts`             | 获取所有早餐列表 |
| POST   | `/api/breakfasts`             | 添加新早餐    |
| PUT    | `/api/breakfasts/:id`         | 更新早餐信息   |
| DELETE | `/api/breakfasts/:id`         | 删除指定早餐   |
| POST   | `/api/breakfasts/:id/consume` | 消耗早餐     |
| POST   | `/api/breakfasts/:id/restock` | 补充早餐     |

### 用户配置 API

| 方法   | 路径                | 描述     |
| ---- | ----------------- | ------ |
| GET  | `/api/user`       | 获取用户配置 |
| PUT  | `/api/user`       | 更新用户配置 |
| POST | `/api/user/reset` | 重置所有数据 |

### AI 建议 API

| 方法   | 路径                | 描述               |
| ---- | ----------------- | ---------------- |
| GET  | `/api/ai/history` | 获取历史记录           |
| POST | `/api/ai/suggest` | 获取 AI 早餐建议（流式输出） |
| POST | `/api/ai/record`  | 记录今日早餐           |

---

## 📊 数据存储

所有数据保存在 `server/data/` 目录下：

| 文件               | 描述             | 示例                                         |
| ---------------- | -------------- | ------------------------------------------ |
| `breakfast.json` | 早餐库存数据         | `{"id": 1, "name": "牛奶", "remaining": 10}` |
| `user.json`      | 用户配置数据         | `{"height": 175, "weight": 70}`            |
| `history.json`   | 历史记录数据（最近 7 天） | `{"2026-03-29": ["牛奶", "面包"]}`             |

---

## ⚠️ 注意事项

### 数据安全

1. **定期备份**: 建议定期备份 `server/data/` 目录
2. **API 密钥保护**: 请妥善保管您的 API 密钥，不要泄露
3. **本地存储**: 所有数据仅存储在本地，注意数据安全

### 使用建议

1. **网络连接**: 使用 AI 建议功能需要网络连接
2. **端口占用**: 默认端口 3000，如需修改请编辑 `server/server.js`
3. **浏览器兼容**: 推荐使用 Chrome、Edge、Firefox 等现代浏览器
4. **历史记录**: 系统自动保留最近 7 天记录

---

## ❓ 常见问题

### Q1: 如何修改端口号？

**A**: 编辑 `server/server.js` 文件，修改 `PORT` 变量：

```javascript
const PORT = 3000; // 改为您想要的端口号
```

### Q2: 数据存储在哪里？

**A**: 所有数据存储在 `server/data/` 目录下的 JSON 文件中：

- `breakfast.json` - 早餐数据
- `user.json` - 用户配置
- `history.json` - 历史记录

### Q3: 如何更换 AI 服务提供商？

**A**: 在「用户设置」页面修改：

- **API 地址**: 改为其他兼容 OpenAI 格式的 API 地址
- **模型名称**: 改为对应的模型名称

支持的 AI 服务：

- DeepSeek: `https://api.deepseek.com/v1/chat/completions`
- OpenAI: `https://api.openai.com/v1/chat/completions`
- 其他任何兼容 OpenAI 格式的服务

### Q4: 历史记录保存多久？

**A**: 系统自动保留最近 7 天的历史记录，超过 7 天的记录会自动删除。

### Q5: 如何导出数据？

**A**: 直接复制 `server/data/` 目录下的 JSON 文件即可备份所有数据。

### Q6: AI 建议无法使用怎么办？

**A**: 请检查：

1. API 密钥是否正确配置
2. 网络连接是否正常
3. API 地址是否可访问
4. 模型名称是否正确

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

**Made with ❤️ by wangshengithub**

[⬆ 返回顶部](#-早餐管理应用)

</div>
