# 🍳 Breakfast Manager

[简体中文](./README.md) | **English**

---

## 📖 Project Overview

A local breakfast management application based on Node.js, featuring smart inventory management, AI nutritional suggestions, data statistics, and expiry date tracking. Manage your breakfast inventory scientifically and get personalized nutrition recommendations based on your body data.

![Node.js](https://img.shields.io/badge/Node.js-14%2B-green) ![License](https://img.shields.io/badge/License-MIT-blue) ![Version](https://img.shields.io/badge/Version-2.0.0-blue)

---

## ✨ Features

### 📦 Inventory Management

- Add, delete breakfast items with quick consume/restock
- Smart alert line settings with automatic low-stock warnings
- **Expiry Date Tracking**: Set expiry dates, auto-alert for expired/expiring items
- Support for multiple units (boxes, bags, pieces, cups, etc.)
- **Templates**: Save frequently used breakfasts as templates for one-click quick add

### 📊 Data Statistics

- Four overview metrics: total items, total stock, low stock, expiring soon
- 7-day consumption trend chart (line chart)
- Category consumption breakdown (doughnut chart)
- Inventory overview (horizontal bar chart, color-coded by status)
- Recent 30-day breakfast consumption history

> Charts use Chart.js served locally — no external CDN required. Page content renders first.

### 🤖 AI Smart Suggestions

- Personalized analysis based on body data (height, weight, age, gender)
- Recommendations generated from current inventory and consumption history
- Nutritional analysis and restock reminders
- Streaming output with real-time display

### 🌙 Dark Mode

- One-click toggle between light/dark themes
- Automatically follows system preference
- Remembers user choice across sessions

### 💾 Data Management

- **Data Export**: One-click export all data as a JSON backup file
- **Data Import**: Restore from backup file (preview before overwriting)
- **Templates**: Quickly save, use, and delete breakfast templates
- History records automatically kept for the last 30 days

### 🎨 User Experience

- Modern UI design (Tailwind CSS)
- Responsive layout, mobile-friendly
- Chinese/English bilingual interface
- Smooth page transition animations
- Intuitive Toast notifications

---

## 🛠️ Tech Stack

| Category         | Technology                                                 |
| ---------------- | ---------------------------------------------------------- |
| **Runtime**      | Node.js 14+                                                |
| **Backend**      | Express 4.18                                               |
| **Frontend**     | HTML5 + CSS3 + Vanilla JavaScript + Tailwind CSS           |
| **Charts**       | Chart.js 4.x (npm installed, served locally, lazy-loaded)  |
| **Data Storage** | Local JSON files                                           |
| **AI Service**   | DeepSeek API (OpenAI compatible, default: deepseek-v4-pro) |

---

## 📁 Project Structure

```
breakfast-manager/
├── server/                       # Backend code
│   ├── server.js                 # Express server (routes + error handling)
│   ├── routes/                   # API routes
│   │   ├── breakfast.js          # Breakfast management API (with expiry dates)
│   │   ├── user.js               # User configuration API
│   │   ├── ai.js                 # AI suggestion API (streaming)
│   │   ├── data.js               # Data export/import + stats API
│   │   └── template.js           # Template management API
│   ├── data/                     # Data storage (auto-created)
│   │   ├── breakfast.json        # Breakfast inventory data
│   │   ├── user.json             # User configuration data
│   │   ├── history.json          # Consumption history (kept 30 days)
│   │   └── templates.json        # Breakfast templates
│   └── utils/
│       └── fileStorage.js        # File I/O + CRUD abstractions
├── public/                       # Frontend static files
│   ├── index.html                # Main page
│   ├── css/
│   │   └── style.css             # Custom styles + dark mode
│   └── js/
│       ├── app.js                # Core module (routing, i18n, dark mode, Chart.js lazy-load)
│       ├── breakfast.js          # Breakfast management (expiry display, template save)
│       ├── stats.js              # Stats dashboard (lazy-loads Chart.js)
│       ├── templates.js          # Template management
│       ├── user.js               # User settings + data export/import
│       └── ai.js                 # AI suggestions + history rendering
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Requirements

- **Node.js**: v14 or higher
- **npm**: v6 or higher

### Installation

#### 1️⃣ Clone the Project

```bash
git clone https://github.com/wangshengithub/breakfast-manager.git
cd breakfast-manager
```

#### 2️⃣ Install Dependencies

```bash
npm install
```

#### 3️⃣ Configure AI API

To use AI suggestion features:

1. Visit [DeepSeek Platform](https://platform.deepseek.com/) to register and get your API key
2. After starting the app, fill in the "⚙️ Settings" page:
   - **API Key**: Your API Key
   - **API URL**: `https://api.deepseek.com/v1/chat/completions` (default)
   - **Model Name**: `deepseek-v4-pro` (default) / `deepseek-v4-flash` / or any compatible model

> The model name is a text input field — you can freely type any model name, not limited to a dropdown.

#### 4️⃣ Start the Application

```bash
npm start
```

After successful startup, visit: **http://localhost:3000**

Port can be configured via environment variable: `PORT=8080 npm start`

---

## 📖 User Guide

### Inventory Management

1. Click "+ Add Breakfast" to manually add, or "⭐ From Template" for quick creation
2. Optionally set an "Expiry Date" — the system will auto-alert for expired/expiring items
3. Click "⭐ Save Template" on any card to save as a reusable template
4. Consume, restock, or delete with one click
5. Automatic low-stock alerts when below the alert line

### Statistics Dashboard

Switch to the "📊 Stats" page to view:

- Four overview metrics at the top
- 7-day consumption trend line chart
- Category breakdown doughnut chart
- Inventory overview horizontal bar chart
- Recent breakfast consumption history

> Chart.js loads in the background on first visit to the Stats page — no impact on browsing.

### AI Breakfast Suggestions

1. Complete user body data configuration
2. Configure your AI API key
3. Click "✨ Get Suggestion" — AI generates recommendations in real-time via streaming

### Data Backup & Restore

At the bottom of the "⚙️ Settings" page:

- **📥 Export Data**: Download a JSON file containing all data
- **📤 Import Data**: Select a backup file, preview contents, then confirm import (overwrites current data)

### Dark Mode

Click the 🌙 / ☀️ button in the navigation bar to toggle. The system remembers your preference and follows the system theme.

---

## 🔌 API Documentation

### Breakfast Management API

| Method | Path                          | Description                                     |
| ------ | ----------------------------- | ----------------------------------------------- |
| GET    | `/api/breakfasts`             | Get all breakfasts                              |
| POST   | `/api/breakfasts`             | Add new breakfast (supports `expiryDate` field) |
| PUT    | `/api/breakfasts/:id`         | Update breakfast info                           |
| DELETE | `/api/breakfasts/:id`         | Delete breakfast                                |
| POST   | `/api/breakfasts/:id/consume` | Consume breakfast (also records history)        |
| POST   | `/api/breakfasts/:id/restock` | Restock breakfast                               |

### User Configuration API

| Method | Path              | Description                                 |
| ------ | ----------------- | ------------------------------------------- |
| GET    | `/api/user`       | Get user config (API key masked)            |
| PUT    | `/api/user`       | Update user config                          |
| POST   | `/api/user/reset` | Reset all data (requires `confirm: "true"`) |

### AI Suggestion API

| Method | Path              | Description                                  |
| ------ | ----------------- | -------------------------------------------- |
| GET    | `/api/ai/history` | Get last 3 days of history                   |
| POST   | `/api/ai/suggest` | Get AI breakfast suggestions (streaming SSE) |
| POST   | `/api/ai/record`  | Manually record today's breakfast            |

### Data Management API

| Method | Path                | Description                           |
| ------ | ------------------- | ------------------------------------- |
| GET    | `/api/data/export`  | Export all data as JSON file download |
| POST   | `/api/data/import`  | Import data (overwrites current data) |
| GET    | `/api/data/summary` | Get statistics summary                |

### Template Management API

| Method | Path                 | Description                              |
| ------ | -------------------- | ---------------------------------------- |
| GET    | `/api/templates`     | Get all templates                        |
| POST   | `/api/templates`     | Add template (auto-deduplicates by name) |
| DELETE | `/api/templates/:id` | Delete template                          |

---

## 📊 Data Storage

All data is stored in the `server/data/` directory:

| File             | Description                             | Retention    |
| ---------------- | --------------------------------------- | ------------ |
| `breakfast.json` | Breakfast inventory (with expiry dates) | Permanent    |
| `user.json`      | User config + AI settings               | Permanent    |
| `history.json`   | Consumption history                     | Last 30 days |
| `templates.json` | Breakfast templates                     | Permanent    |

### 📋 Sample Data

The project comes with sample data so you can experience all features immediately without manual setup:

**Inventory (8 items)**

| Name | Remaining | Unit | Expiry Date | Status |
|---|---|---|---|---|
| 纯牛奶 (Milk) | 8 | boxes | 06-15 | Normal |
| 全麦面包 (Bread) | 2 | bags | 06-03 | ⚠️ Low Stock |
| 鸡蛋 (Eggs) | 15 | pieces | 06-20 | Normal |
| 酸奶 (Yogurt) | 4 | cups | 06-01 | ⚠️ Expiring Soon |
| 燕麦片 (Oatmeal) | 1 | bag | 08-30 | ⚠️ Low Stock |
| 火腿肠 (Sausage) | 6 | sticks | 07-10 | Normal |
| 豆浆粉 (Soy Milk Powder) | 10 | packets | 12-01 | Normal |
| 香蕉 (Banana) | 3 | pieces | 06-02 | ⚠️ Expiring Soon |

- **History**: 7 days of daily consumption records (milk, bread, eggs, yogurt, oatmeal, etc.)
- **Templates**: 4 frequently used breakfast templates (milk, bread, eggs, yogurt)
- **User Profile**: Height 175cm, Weight 70kg, Age 28, Male, Special needs: "Fat loss period, high protein & low carb"

> To clear sample data, click "🗑️ Reset All Data" on the "⚙️ Settings" page, or delete files in `server/data/` and restart.

---

## ⚠️ Important Notes

1. **Regular Backups**: Use the in-app "Export Data" feature for regular backups
2. **API Key Safety**: Keep your API key safe and don't share it
3. **Port Config**: Default 3000, change via `PORT` environment variable
4. **Browser**: Recommend modern browsers like Chrome, Edge, or Firefox
5. **History**: System automatically keeps the last 30 days, older records are pruned

---

## ❓ FAQ

### Q1: How to change the port number?

**A**: Use environment variable: `PORT=8080 npm start`, or edit the `PORT` default in `server/server.js`.

### Q2: How to switch AI models?

**A**: Simply modify the "Model Name" text input on the "⚙️ Settings" page. Supported:

- `deepseek-v4-pro` (default, recommended)
- `deepseek-v4-flash` (faster response)
- Or any OpenAI-compatible model name

### Q3: How to switch AI providers?

**A**: Change the "API URL" field. Supports all OpenAI-compatible APIs:

- DeepSeek: `https://api.deepseek.com/v1/chat/completions`
- OpenAI: `https://api.openai.com/v1/chat/completions`
- Other compatible services

### Q4: Charts not loading?

**A**: Make sure you've run `npm install` to install the `chart.js` dependency. Charts are served locally — no internet required.

### Q5: AI suggestions not working?

**A**: Please check:

1. API key is correctly configured
2. Network connection is working
3. API URL is accessible
4. Model name is correct

### Q6: How to migrate data?

**A**: Use "📥 Export Data" to download backup → deploy to new environment → use "📤 Import Data" to restore.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**wangshengithub**

- GitHub: [wangshengithub](https://github.com/wangshengithub)
- Project: [breakfast-manager](https://github.com/wangshengithub/breakfast-manager)

---

## 🙏 Acknowledgments

Thanks to the following open-source projects and services:

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [DeepSeek](https://www.deepseek.com/)

---

<div align="center">

### ⭐ If this project helps you, please consider giving it a Star!

[![Star History Chart](https://api.star-history.com/svg?repos=wangshengithub/breakfast-manager&type=Date)](https://star-history.com/#wangshengithub/breakfast-manager&Date)

**Made with ❤️ by wangshengithub**

[⬆ Back to Top](#-breakfast-manager)

</div>
