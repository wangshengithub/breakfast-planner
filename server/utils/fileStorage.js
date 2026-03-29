const fs = require('fs');
const path = require('path');

// 数据文件路径
const DATA_DIR = path.join(__dirname, '../data');
const BREAKFAST_FILE = path.join(DATA_DIR, 'breakfast.json');
const USER_FILE = path.join(DATA_DIR, 'user.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 读取JSON文件
function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取文件失败:', error);
    return null;
  }
}

// 写入JSON文件
function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('写入文件失败:', error);
    return false;
  }
}

// 重置所有数据
function resetAllData() {
  try {
    // 重置早餐数据
    writeJSON(BREAKFAST_FILE, { breakfasts: [] });

    // 重置用户数据
    writeJSON(USER_FILE, {
      height: 175,
      weight: 70,
      age: 30,
      gender: 'male',
      specialNeeds: '',
      aiApiKey: '',
      aiApiUrl: 'https://api.deepseek.com/v1/chat/completions',
      aiModel: 'deepseek-chat'
    });

    // 重置历史记录
    writeJSON(HISTORY_FILE, { records: [] });

    return true;
  } catch (error) {
    console.error('重置数据失败:', error);
    return false;
  }
}

// 早餐数据操作
const breakfastStorage = {
  // 获取所有早餐
  getAll() {
    const data = readJSON(BREAKFAST_FILE);
    return data ? data.breakfasts : [];
  },

  // 保存早餐列表
  saveAll(breakfasts) {
    return writeJSON(BREAKFAST_FILE, { breakfasts });
  },

  // 添加早餐
  add(breakfast) {
    const breakfasts = this.getAll();
    breakfast.id = Date.now().toString();
    breakfast.isAlert = false;
    breakfasts.push(breakfast);
    return this.saveAll(breakfasts);
  },

  // 更新早餐
  update(id, updates) {
    const breakfasts = this.getAll();
    const index = breakfasts.findIndex(b => b.id === id);
    if (index !== -1) {
      breakfasts[index] = { ...breakfasts[index], ...updates };
      return this.saveAll(breakfasts);
    }
    return false;
  },

  // 删除早餐
  delete(id) {
    const breakfasts = this.getAll();
    const filtered = breakfasts.filter(b => b.id !== id);
    return this.saveAll(filtered);
  },

  // 消耗早餐
  consume(id, amount = 1) {
    const breakfasts = this.getAll();
    const index = breakfasts.findIndex(b => b.id === id);
    if (index !== -1) {
      breakfasts[index].remaining -= amount;
      // 检查是否低于提醒线
      breakfasts[index].isAlert = breakfasts[index].remaining <= breakfasts[index].alertLine;
      return this.saveAll(breakfasts);
    }
    return false;
  },

  // 补充早餐
  restock(id, amount) {
    const breakfasts = this.getAll();
    const index = breakfasts.findIndex(b => b.id === id);
    if (index !== -1) {
      breakfasts[index].remaining += amount;
      // 检查是否低于提醒线
      breakfasts[index].isAlert = breakfasts[index].remaining <= breakfasts[index].alertLine;
      return this.saveAll(breakfasts);
    }
    return false;
  }
};

// 用户数据操作
const userStorage = {
  // 获取用户配置
  get() {
    return readJSON(USER_FILE);
  },

  // 更新用户配置
  update(data) {
    const current = this.get() || {};
    return writeJSON(USER_FILE, { ...current, ...data });
  }
};

// 历史记录操作
const historyStorage = {
  // 获取所有历史记录
  getAll() {
    const data = readJSON(HISTORY_FILE);
    return data ? data.records : [];
  },

  // 获取最近N天的记录
  getRecent(days = 3) {
    const records = this.getAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 计算N天前的日期
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // 过滤最近N天的记录
    return records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= cutoffDate;
    });
  },

  // 添加今日记录
  addToday(breakfasts) {
    const records = this.getAll();
    const today = new Date().toISOString().split('T')[0];

    // 检查今天是否已有记录
    const existingIndex = records.findIndex(r => r.date === today);
    if (existingIndex !== -1) {
      // 直接更新今天的记录
      records[existingIndex].breakfasts = breakfasts;
    } else {
      // 添加新记录
      records.push({
        date: today,
        breakfasts: breakfasts
      });
    }

    // 只保留最近7天的记录
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    const filtered = records.filter(r => new Date(r.date) >= cutoffDate);

    return writeJSON(HISTORY_FILE, { records: filtered });
  }
};

module.exports = {
  breakfastStorage,
  userStorage,
  historyStorage,
  resetAllData
};
