const fs = require('fs');
const path = require('path');

// 数据文件路径
const DATA_DIR = path.join(__dirname, '../data');
const BREAKFAST_FILE = path.join(DATA_DIR, 'breakfast.json');
const USER_FILE = path.join(DATA_DIR, 'user.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const TEMPLATE_FILE = path.join(DATA_DIR, 'templates.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * 读取JSON文件
 * @param {string} filePath 文件路径
 * @returns {Object|null} 解析后的JSON对象，失败返回null
 */
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

/**
 * 写入JSON文件
 * @param {string} filePath 文件路径
 * @param {Object} data 要写入的数据
 * @returns {boolean} 是否写入成功
 */
function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('写入文件失败:', error);
    return false;
  }
}

/**
 * 重置所有数据（包括模板）
 * @returns {boolean} 是否重置成功
 */
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
      aiModel: 'deepseek-v4-pro'
    });

    // 重置历史记录
    writeJSON(HISTORY_FILE, { records: [] });

    // 重置模板数据
    writeJSON(TEMPLATE_FILE, { templates: [] });

    return true;
  } catch (error) {
    console.error('重置数据失败:', error);
    return false;
  }
}

/**
 * 导出所有数据
 * @returns {Object} 包含所有数据的对象
 */
function exportAllData() {
  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    breakfasts: readJSON(BREAKFAST_FILE) || { breakfasts: [] },
    user: readJSON(USER_FILE) || {},
    history: readJSON(HISTORY_FILE) || { records: [] },
    templates: readJSON(TEMPLATE_FILE) || { templates: [] }
  };
}

/**
 * 导入所有数据
 * @param {Object} data 要导入的数据对象
 * @returns {{ success: boolean, message: string }}
 */
function importAllData(data) {
  try {
    // 基础结构校验
    if (!data || typeof data !== 'object') {
      return { success: false, message: '数据格式无效' };
    }

    // 导入早餐数据（兼容有无 breakfasts 包装）
    if (data.breakfasts) {
      const breakfastData = data.breakfasts;
      if (Array.isArray(breakfastData)) {
        // 直接是数组
        writeJSON(BREAKFAST_FILE, { breakfasts: breakfastData });
      } else if (breakfastData.breakfasts && Array.isArray(breakfastData.breakfasts)) {
        // 嵌套在 breakfasts 字段中（导出格式）
        writeJSON(BREAKFAST_FILE, breakfastData);
      }
    }

    // 导入用户配置
    if (data.user) {
      const userData = data.user;
      // 校验关键字段类型
      if (userData.height !== undefined && typeof userData.height !== 'number') {
        return { success: false, message: '用户身高数据格式不正确' };
      }
      if (userData.weight !== undefined && typeof userData.weight !== 'number') {
        return { success: false, message: '用户体重数据格式不正确' };
      }
      writeJSON(USER_FILE, userData);
    }

    // 导入历史记录
    if (data.history) {
      const historyData = data.history;
      if (Array.isArray(historyData)) {
        writeJSON(HISTORY_FILE, { records: historyData });
      } else if (historyData.records && Array.isArray(historyData.records)) {
        writeJSON(HISTORY_FILE, historyData);
      }
    }

    // 导入模板数据
    if (data.templates) {
      const templateData = data.templates;
      if (Array.isArray(templateData)) {
        writeJSON(TEMPLATE_FILE, { templates: templateData });
      } else if (templateData.templates && Array.isArray(templateData.templates)) {
        writeJSON(TEMPLATE_FILE, templateData);
      }
    }

    return { success: true, message: '数据导入成功' };
  } catch (error) {
    console.error('导入数据失败:', error);
    return { success: false, message: '导入数据时发生错误' };
  }
}

// 早餐数据操作
const breakfastStorage = {
  /** 获取所有早餐 */
  getAll() {
    const data = readJSON(BREAKFAST_FILE);
    return data ? data.breakfasts : [];
  },

  /** 保存早餐列表 */
  saveAll(breakfasts) {
    return writeJSON(BREAKFAST_FILE, { breakfasts });
  },

  /**
   * 添加早餐
   * @param {Object} breakfast 早餐数据，可选包含 expiryDate 字段
   */
  add(breakfast) {
    const breakfasts = this.getAll();
    breakfast.id = Date.now().toString();
    breakfast.isAlert = false;
    // 保留 expiryDate（如果有的话），否则设为空字符串
    breakfast.expiryDate = breakfast.expiryDate || '';
    breakfasts.push(breakfast);
    return this.saveAll(breakfasts);
  },

  /**
   * 更新早餐
   * @param {string} id 早餐ID
   * @param {Object} updates 要更新的字段
   */
  update(id, updates) {
    const breakfasts = this.getAll();
    const index = breakfasts.findIndex(b => b.id === id);
    if (index !== -1) {
      breakfasts[index] = { ...breakfasts[index], ...updates };
      // 每次更新都重新计算 isAlert 状态
      breakfasts[index].isAlert = breakfasts[index].remaining <= breakfasts[index].alertLine;
      return this.saveAll(breakfasts);
    }
    return false;
  },

  /** 删除早餐 */
  delete(id) {
    const breakfasts = this.getAll();
    const filtered = breakfasts.filter(b => b.id !== id);
    return this.saveAll(filtered);
  },

  /**
   * 消耗早餐
   * @param {string} id 早餐ID
   * @param {number} amount 消耗量
   */
  consume(id, amount = 1) {
    const breakfasts = this.getAll();
    const index = breakfasts.findIndex(b => b.id === id);
    if (index !== -1) {
      // 消耗量不能超过剩余量
      if (breakfasts[index].remaining < amount) return false;
      breakfasts[index].remaining -= amount;
      // 检查是否低于提醒线
      breakfasts[index].isAlert = breakfasts[index].remaining <= breakfasts[index].alertLine;
      return this.saveAll(breakfasts);
    }
    return false;
  },

  /**
   * 补充早餐
   * @param {string} id 早餐ID
   * @param {number} amount 补充量
   */
  restock(id, amount) {
    const breakfasts = this.getAll();
    const index = breakfasts.findIndex(b => b.id === id);
    if (index !== -1) {
      breakfasts[index].remaining += amount;
      // 补充后重新检查提醒状态
      breakfasts[index].isAlert = breakfasts[index].remaining <= breakfasts[index].alertLine;
      return this.saveAll(breakfasts);
    }
    return false;
  },

  /**
   * 获取过期/即将过期的早餐列表
   * @param {number} warnDays 提前几天预警，默认3天
   * @returns {{ expired: Array, expiringSoon: Array }}
   */
  getExpiryAlerts(warnDays = 3) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const warnDate = new Date(today);
    warnDate.setDate(warnDate.getDate() + warnDays);

    const expired = [];
    const expiringSoon = [];

    this.getAll().forEach(item => {
      if (!item.expiryDate) return;
      const expiry = new Date(item.expiryDate);
      expiry.setHours(0, 0, 0, 0);

      if (expiry < today) {
        expired.push(item);
      } else if (expiry <= warnDate) {
        expiringSoon.push(item);
      }
    });

    return { expired, expiringSoon };
  }
};

// 用户数据操作
const userStorage = {
  /** 获取用户配置 */
  get() {
    return readJSON(USER_FILE);
  },

  /** 更新用户配置 */
  update(data) {
    const current = this.get() || {};
    return writeJSON(USER_FILE, { ...current, ...data });
  }
};

// 历史记录操作（保留30天以支持统计）
const historyStorage = {
  /** 获取所有历史记录 */
  getAll() {
    const data = readJSON(HISTORY_FILE);
    return data ? data.records : [];
  },

  /**
   * 获取最近N天的记录
   * @param {number} days 天数
   */
  getRecent(days = 3) {
    const records = this.getAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= cutoffDate;
    });
  },

  /**
   * 添加今日记录
   * @param {Array} breakfasts 今日早餐消耗列表
   */
  addToday(breakfasts) {
    const records = this.getAll();
    const today = new Date().toISOString().split('T')[0];

    // 检查今天是否已有记录
    const existingIndex = records.findIndex(r => r.date === today);
    if (existingIndex !== -1) {
      records[existingIndex].breakfasts = breakfasts;
    } else {
      records.push({
        date: today,
        breakfasts: breakfasts
      });
    }

    // 只保留最近30天的记录（从7天扩展到30天，支持统计功能）
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const filtered = records.filter(r => new Date(r.date) >= cutoffDate);

    return writeJSON(HISTORY_FILE, { records: filtered });
  }
};

// 模板数据操作
const templateStorage = {
  /** 获取所有模板 */
  getAll() {
    const data = readJSON(TEMPLATE_FILE);
    return data ? data.templates : [];
  },

  /** 保存模板列表 */
  saveAll(templates) {
    return writeJSON(TEMPLATE_FILE, { templates });
  },

  /**
   * 添加模板
   * @param {Object} template 模板数据 { name, unit, consumptionPerMeal, alertLine }
   */
  add(template) {
    const templates = this.getAll();
    template.id = Date.now().toString();
    template.createdAt = new Date().toISOString();
    templates.push(template);
    return this.saveAll(templates);
  },

  /**
   * 删除模板
   * @param {string} id 模板ID
   */
  delete(id) {
    const templates = this.getAll();
    const filtered = templates.filter(t => t.id !== id);
    return this.saveAll(filtered);
  }
};

module.exports = {
  breakfastStorage,
  userStorage,
  historyStorage,
  templateStorage,
  resetAllData,
  exportAllData,
  importAllData
};
