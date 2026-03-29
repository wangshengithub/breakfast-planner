# 🍳 Breakfast Manager

[简体中文](./README.md) | **English**

---

## 📖 Project Overview

A local breakfast management application based on Node.js, supporting inventory management and AI intelligent suggestion features. Help you scientifically manage your breakfast inventory and get nutritional recommendations based on your personal body data.

![Node.js](https://img.shields.io/badge/Node.js-14%2B-green) ![License](https://img.shields.io/badge/License-MIT-blue) ![GitHub Stars](https://img.shields.io/github/stars/wangshengithub/breakfast-manager?style=social)

---

## ✨ Features

### 📦 Inventory Management

- Add, delete, and edit breakfast items
- Quick consume/restock inventory
- Smart alert line settings
- Low stock warnings
- Support for multiple units

### 🤖 AI Smart Suggestions

- Personalized analysis based on body data (height, weight, age, gender)
- Generate recommendations based on current inventory
- Nutritional analysis and advice
- Inventory restock reminders
- Streaming output with real-time display

### ⚙️ User Settings

- Personal body data management
- Custom AI API configuration (OpenAI compatible)
- Support for special dietary needs (weight loss, lactose-free, etc.)
- Data reset functionality

### 💾 Data Management

- Local JSON file storage
- Automatically keep last 7 days of history
- Auto-merge breakfasts from the same day
- Support for data export and backup

### 🎨 User Experience

- Modern UI design (Tailwind CSS)
- Responsive layout, mobile-friendly
- Chinese/English bilingual interface
- Smooth animation effects
- Intuitive operation feedback

---

## 🛠️ Tech Stack

| Category         | Technology                                       |
| ---------------- | ------------------------------------------------ |
| **Backend**      | Node.js + Express                                |
| **Frontend**     | HTML5 + CSS3 + Vanilla JavaScript + Tailwind CSS |
| **Data Storage** | Local JSON files                                 |
| **AI Service**   | DeepSeek API (OpenAI compatible)                 |
| **HTTP Client**  | Fetch API                                        |

---

## 📁 Project Structure

```
breakfast-manager/
├── server/                       # Backend code
│   ├── server.js                 # Express main server
│   ├── routes/                   # API routes
│   │   ├── breakfast.js          # Breakfast management API
│   │   ├── user.js               # User configuration API
│   │   └── ai.js                 # AI suggestion API
│   ├── data/                     # Data storage
│   │   ├── breakfast.json        # Breakfast inventory data
│   │   ├── user.json             # User configuration data
│   │   └── history.json          # History records
│   └── utils/                    # Utility functions
│       └── fileStorage.js        # File operations wrapper
├── public/                       # Frontend static files
│   ├── index.html                # Main page
│   ├── css/
│   │   └── style.css             # Custom styles
│   └── js/
│       ├── app.js                # Main app logic
│       ├── breakfast.js          # Breakfast management module
│       ├── user.js               # User configuration module
│       └── ai.js                 # AI suggestion module
├── package.json                  # Project configuration
└── README.md                     # Documentation
```

---

## 🚀 Quick Start

### Requirements

- **Node.js**: v14 or higher
- **npm**: v6 or higher
- **OS**: Windows / macOS / Linux

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

#### 3️⃣ Configure AI API (Optional)

To use AI suggestion features, configure DeepSeek API:

1. Visit [DeepSeek Platform](https://platform.deepseek.com/) to register
2. Get your API key
3. After starting the app, fill in API settings on "User Settings" page:
   - **API Key**: Your DeepSeek API Key
   - **API URL**: `https://api.deepseek.com/v1/chat/completions`
   - **Model Name**: `deepseek-chat`or`deepseek-reasoner`

#### 4️⃣ Start the Application

```bash
npm start
```

After successful startup, visit: **http://localhost:3000**

---

## 📖 User Guide

### 1️⃣ Inventory Management

#### Add Breakfast

1. Click "Add Breakfast" button
2. Fill in breakfast information:
   - Breakfast name (e.g., milk, bread)
   - Remaining quantity (e.g., 10)
   - Unit (e.g., box, bag, piece)
   - Consumption per meal (e.g., 1)
   - Alert line (e.g., 3)
3. Click "Add"

#### Manage Inventory

- **Consume**: Click "Consume" button to reduce inventory
- **Restock**: Click "Restock" button to increase inventory
- **Edit**: Modify breakfast information
- **Delete**: Remove unwanted breakfast items

#### Low Stock Alerts

When inventory is below the alert line, the system will:

- Display red warning indicator
- Show alert dialog
- Suggest timely restocking

### 2️⃣ AI Breakfast Suggestions

#### Get Suggestions

1. Complete user body data configuration (height, weight, age, gender)
2. Ensure AI API is correctly configured
3. Click "Get Suggestion" button
4. AI will generate personalized recommendations in real-time

#### Suggestion Content

- Today's breakfast combination suggestions
- Nutritional analysis
- Inventory restock recommendations
- Special dietary considerations

### 3️⃣ User Settings

#### Basic Information

- **Height** (cm)
- **Weight** (kg)
- **Age**
- **Gender**
- **Special Needs** (e.g., weight loss period, muscle gain, lactose-free, low sugar)

#### AI Configuration

- **API Key**: DeepSeek API Key
- **API URL**: Support OpenAI-compatible format
- **Model Name**: Customizable model

#### Data Management

- **Save User Info**: Save personal basic data
- **Save AI Config**: Save API settings
- **Reset All Data**: Clear all data (confirmation required)

---

## 🔌 API Documentation

### Breakfast Management API

| Method | Path                          | Description        |
| ------ | ----------------------------- | ------------------ |
| GET    | `/api/breakfasts`             | Get all breakfasts |
| POST   | `/api/breakfasts`             | Add new breakfast  |
| PUT    | `/api/breakfasts/:id`         | Update breakfast   |
| DELETE | `/api/breakfasts/:id`         | Delete breakfast   |
| POST   | `/api/breakfasts/:id/consume` | Consume breakfast  |
| POST   | `/api/breakfasts/:id/restock` | Restock breakfast  |

### User Configuration API

| Method | Path              | Description               |
| ------ | ----------------- | ------------------------- |
| GET    | `/api/user`       | Get user configuration    |
| PUT    | `/api/user`       | Update user configuration |
| POST   | `/api/user/reset` | Reset all data            |

### AI Suggestion API

| Method | Path              | Description                              |
| ------ | ----------------- | ---------------------------------------- |
| GET    | `/api/ai/history` | Get history records                      |
| POST   | `/api/ai/suggest` | Get AI breakfast suggestions (streaming) |
| POST   | `/api/ai/record`  | Record today's breakfast                 |

---

## 📊 Data Storage

All data is stored in the `server/data/` directory:

| File             | Description                   | Example                                      |
| ---------------- | ----------------------------- | -------------------------------------------- |
| `breakfast.json` | Breakfast inventory data      | `{"id": 1, "name": "milk", "remaining": 10}` |
| `user.json`      | User configuration data       | `{"height": 175, "weight": 70}`              |
| `history.json`   | History records (last 7 days) | `{"2026-03-29": ["milk", "bread"]}`          |

---

## ⚠️ Important Notes

### Data Security

1. **Regular Backups**: Recommend regularly backing up the `server/data/` directory
2. **API Key Protection**: Keep your API key safe and don't share it
3. **Local Storage**: All data is stored locally, pay attention to data security

### Usage Recommendations

1. **Network Connection**: AI suggestion features require internet connection
2. **Port Occupation**: Default port is 3000, to change edit `server/server.js`
3. **Browser Compatibility**: Recommend using modern browsers like Chrome, Edge, Firefox
4. **History Records**: System automatically keeps last 7 days of records

---

## ❓ FAQ

### Q1: How to change the port number?

**A**: Edit the `server/server.js` file and modify the `PORT` variable:

```javascript
const PORT = 3000; // Change to your desired port
```

### Q2: Where is the data stored?

**A**: All data is stored in JSON files under the `server/data/` directory:

- `breakfast.json` - Breakfast data
- `user.json` - User configuration
- `history.json` - History records

### Q3: How to switch AI service provider?

**A**: Modify on the "User Settings" page:

- **API URL**: Change to other OpenAI-compatible API address
- **Model Name**: Change to corresponding model name

Supported AI services:

- DeepSeek: `https://api.deepseek.com/v1/chat/completions`
- OpenAI: `https://api.openai.com/v1/chat/completions`
- Other OpenAI-compatible services

### Q4: How long are history records kept?

**A**: The system automatically keeps the last 7 days of history records. Records older than 7 days will be automatically deleted.

### Q5: How to export data?

**A**: Simply copy the JSON files in the `server/data/` directory to backup all data.

### Q6: What to do if AI suggestions don't work?

**A**: Please check:

1. API key is correctly configured
2. Network connection is normal
3. API address is accessible
4. Model name is correct

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
- [DeepSeek](https://www.deepseek.com/)

---

<div align="center">

**Made with ❤️ by wangshengithub**

[⬆ Back to Top](#-breakfast-manager)

</div>
