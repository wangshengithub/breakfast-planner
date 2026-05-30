/**
 * 早餐管理应用 - 核心模块
 * 负责页面路由、语言切换、暗色模式、API封装、Toast提示
 */

// ==================== 页面切换 ====================

/**
 * 切换显示页面
 * @param {string} pageName 页面标识 (breakfast | stats | ai | user)
 */
function switchPage(pageName) {
  // 隐藏所有页面
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // 移除所有导航按钮的激活状态
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // 显示目标页面
  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // 激活对应的导航按钮
  const targetNav = document.getElementById(`nav-${pageName}`);
  if (targetNav) {
    targetNav.classList.add('active');
  }

  // 切换到统计页面时触发数据加载
  if (pageName === 'stats' && typeof loadStats === 'function') {
    loadStats();
  }
}

// ==================== 语言系统 ====================

/** 当前语言，从 localStorage 恢复 */
let currentLang = localStorage.getItem('breakfast-app-lang') || 'zh';

/** 完整的双语翻译字典 */
const translations = {
  zh: {
    title: '🍳 早餐管理应用',
    subtitle: '智能库存管理 · AI营养建议',
    nav: {
      breakfast: '📦 库存管理',
      stats: '📊 统计',
      ai: '🤖 今日建议',
      user: '⚙️ 用户设置'
    },
    breakfast: {
      title: '早餐库存管理',
      add: '+ 添加早餐',
      addFromTemplate: '⭐ 从模板添加',
      empty: '还没有添加早餐，点击上方按钮添加吧！',
      name: '早餐名称',
      remaining: '剩余',
      consumption: '每次消耗',
      alertLine: '提醒线',
      unit: '单位',
      expiryDate: '保质期至',
      expiryDateOptional: '保质期至 (可选)',
      consume: '🍽️ 消耗',
      delete: '🗑️ 删除',
      restock: '🛒 补充',
      saveAsTemplate: '⭐ 存为模板',
      alert: '库存不足，请及时补充',
      insufficient: '库存不足，无法消耗',
      expired: '已过期',
      expiringSoon: '即将过期',
      daysLeft: '天后过期',
      noExpiry: '',
      modal: {
        title: '⚠️ 库存不足提醒',
        close: '我知道了'
      }
    },
    stats: {
      totalItems: '总品类',
      totalInventory: '总库存',
      lowStock: '低库存',
      expiringSoon: '即将过期',
      consumptionTrend: '📈 近7天消耗趋势',
      categoryBreakdown: '🥧 品类消耗分布',
      inventoryOverview: '📦 库存概览',
      noData: '暂无统计数据，添加早餐并使用一段时间后即可查看统计',
      loading: '图表加载中...',
      quantity: '数量',
      consumed: '消耗量',
      percentage: '百分比',
      remaining: '剩余',
      noChartData: '暂无数据',
      history: '📅 最近早餐记录'
    },
    ai: {
      title: 'AI早餐建议',
      getSuggestion: '✨ 获取建议',
      suggestion: '今日早餐建议',
      nutrition: '营养分析',
      restock: '库存补充建议',
      empty: '点击"获取建议"按钮，AI将为您推荐今日早餐',
      loading: 'AI正在思考中...',
      history: '📅 最近早餐记录',
      noHistory: '暂无历史记录',
      items: '项早餐'
    },
    user: {
      title: '用户设置',
      basicInfo: '基本信息',
      height: '身高',
      weight: '体重',
      age: '年龄',
      gender: '性别',
      male: '男',
      female: '女',
      specialNeeds: '特殊需求',
      placeholder: '例如：减脂期、需要高蛋白、无乳糖等',
      aiConfig: 'AI配置',
      apiKey: 'API密钥',
      apiUrl: 'API地址',
      model: '模型名称',
      saveUser: '💾 保存用户信息',
      saveAI: '🤖 保存AI配置',
      dataManagement: '💾 数据管理',
      dataManagementDesc: '导出所有数据到JSON文件以备份，或从备份文件恢复数据。',
      export: '📥 导出数据',
      import: '📤 导入数据',
      exportSuccess: '数据导出成功',
      importSuccess: '数据导入成功',
      importFailed: '导入失败',
      importConfirm: '导入将覆盖当前所有数据，此操作不可恢复！',
      importFile: '导入文件',
      confirmImport: '确认导入',
      danger: '⚠️ 危险操作',
      reset: '🗑️ 重置所有数据'
    },
    template: {
      title: '⭐ 选择模板',
      empty: '暂无模板，请先添加早餐并保存为模板',
      select: '使用此模板',
      delete: '🗑️ 删除',
      quickAdd: '从模板添加',
      saveSuccess: '已保存为模板',
      deleteSuccess: '模板已删除',
      duplicateName: '同名模板已存在'
    },
    darkMode: {
      light: '☀️',
      dark: '🌙',
      tooltip: '切换暗色模式'
    },
    github: {
      star: '⭐ Star on GitHub',
      link: 'https://github.com/wangshengithub/breakfast-manager'
    }
  },
  en: {
    title: '🍳 Breakfast Manager',
    subtitle: 'Smart Inventory · AI Nutrition Advice',
    nav: {
      breakfast: '📦 Inventory',
      stats: '📊 Stats',
      ai: '🤖 Suggestions',
      user: '⚙️ Settings'
    },
    breakfast: {
      title: 'Breakfast Inventory',
      add: '+ Add Breakfast',
      addFromTemplate: '⭐ From Template',
      empty: 'No breakfasts added yet, click the button above to add one!',
      name: 'Name',
      remaining: 'Remaining',
      consumption: 'Per Meal',
      alertLine: 'Alert Line',
      unit: 'Unit',
      expiryDate: 'Expiry Date',
      expiryDateOptional: 'Expiry Date (optional)',
      consume: '🍽️ Consume',
      delete: '🗑️ Delete',
      restock: '🛒 Restock',
      saveAsTemplate: '⭐ Save Template',
      alert: 'Low stock, please replenish',
      insufficient: 'Insufficient stock',
      expired: 'Expired',
      expiringSoon: 'Expiring Soon',
      daysLeft: 'days left',
      noExpiry: '',
      modal: {
        title: '⚠️ Low Stock Alert',
        close: 'Got it'
      }
    },
    stats: {
      totalItems: 'Total Items',
      totalInventory: 'Total Stock',
      lowStock: 'Low Stock',
      expiringSoon: 'Expiring Soon',
      consumptionTrend: '📈 7-Day Consumption Trend',
      categoryBreakdown: '🥧 Category Breakdown',
      inventoryOverview: '📦 Inventory Overview',
      noData: 'No stats data yet. Add breakfasts and use the app for a while to see statistics.',
      loading: 'Loading charts...',
      quantity: 'Quantity',
      consumed: 'Consumed',
      percentage: 'Percentage',
      remaining: 'Remaining',
      noChartData: 'No data',
      history: '📅 Recent History'
    },
    ai: {
      title: 'AI Breakfast Suggestions',
      getSuggestion: '✨ Get Suggestion',
      suggestion: 'Today\'s Suggestion',
      nutrition: 'Nutrition Analysis',
      restock: 'Restock Advice',
      empty: 'Click "Get Suggestion" button, AI will recommend breakfast for you',
      loading: 'AI is thinking...',
      history: '📅 Recent History',
      noHistory: 'No history records',
      items: 'items'
    },
    user: {
      title: 'User Settings',
      basicInfo: 'Basic Info',
      height: 'Height',
      weight: 'Weight',
      age: 'Age',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      specialNeeds: 'Special Needs',
      placeholder: 'e.g., weight loss, high protein, lactose-free',
      aiConfig: 'AI Configuration',
      apiKey: 'API Key',
      apiUrl: 'API URL',
      model: 'Model Name',
      saveUser: '💾 Save User Info',
      saveAI: '🤖 Save AI Config',
      dataManagement: '💾 Data Management',
      dataManagementDesc: 'Export all data to a JSON file for backup, or restore from a backup file.',
      export: '📥 Export Data',
      import: '📤 Import Data',
      exportSuccess: 'Data exported successfully',
      importSuccess: 'Data imported successfully',
      importFailed: 'Import failed',
      importConfirm: 'Importing will overwrite all current data. This cannot be undone!',
      importFile: 'Import File',
      confirmImport: 'Confirm Import',
      danger: '⚠️ Danger Zone',
      reset: '🗑️ Reset All Data'
    },
    template: {
      title: '⭐ Select Template',
      empty: 'No templates yet. Add a breakfast and save it as a template.',
      select: 'Use Template',
      delete: '🗑️ Delete',
      quickAdd: 'From Template',
      saveSuccess: 'Saved as template',
      deleteSuccess: 'Template deleted',
      duplicateName: 'Template with this name already exists'
    },
    darkMode: {
      light: '☀️',
      dark: '🌙',
      tooltip: 'Toggle Dark Mode'
    },
    github: {
      star: '⭐ Star on GitHub',
      link: 'https://github.com/wangshengithub/breakfast-manager'
    }
  }
};

// ==================== 语言切换 ====================

/**
 * 切换界面语言
 * @param {string} lang 语言代码 ('zh' | 'en')
 */
function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('breakfast-app-lang', lang);
  updatePageText();

  // 更新语言按钮样式
  document.getElementById('lang-zh').classList.remove('active');
  document.getElementById('lang-en').classList.remove('active');
  document.getElementById(`lang-${lang}`).classList.add('active');

  // 重新渲染动态内容
  if (typeof renderBreakfasts === 'function') {
    renderBreakfasts();
  }
  if (typeof loadHistory === 'function') {
    loadHistory();
  }

  showToast(lang === 'zh' ? '已切换到中文' : 'Switched to English');
}

/**
 * 更新页面所有静态文本
 */
function updatePageText() {
  const t = translations[currentLang];

  // 浏览器标签页标题
  document.title = currentLang === 'zh'
    ? '早餐管理应用 | Breakfast Manager'
    : 'Breakfast Manager | 早餐管理应用';

  // 页面主标题
  document.querySelector('h1').textContent = t.title;
  document.querySelector('header p').textContent = t.subtitle;

  // 导航按钮
  document.getElementById('nav-breakfast').textContent = t.nav.breakfast;
  document.getElementById('nav-stats').textContent = t.nav.stats;
  document.getElementById('nav-ai').textContent = t.nav.ai;
  document.getElementById('nav-user').textContent = t.nav.user;

  // ---- 库存管理页面 ----
  document.querySelector('#page-breakfast h2').textContent = t.breakfast.title;
  document.getElementById('btn-add-breakfast').textContent = t.breakfast.add;
  document.getElementById('btn-add-from-template').textContent = t.breakfast.addFromTemplate;
  document.querySelector('#empty-breakfast p').textContent = t.breakfast.empty;

  // ---- 统计页面 ----
  document.querySelectorAll('#page-stats [data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const parts = key.split('.');
    let value = t;
    for (const part of parts) {
      value = value?.[part];
    }
    if (value) el.textContent = value;
  });

  // ---- AI建议页面 ----
  document.querySelector('#page-ai h2').textContent = t.ai.title;
  document.getElementById('btn-get-suggestion').textContent = t.ai.getSuggestion;
  document.querySelector('#empty-suggestion p').textContent = t.ai.empty;
  document.querySelector('#loading-suggestion p').textContent = t.ai.loading;

  // ---- 用户设置页面 ----
  document.querySelector('#page-user h2').textContent = t.user.title;

  const userPageH3s = document.querySelectorAll('#page-user h3');
  if (userPageH3s.length >= 1) userPageH3s[0].textContent = t.user.basicInfo;
  if (userPageH3s.length >= 2) userPageH3s[1].textContent = t.user.aiConfig;
  if (userPageH3s.length >= 3) userPageH3s[2].textContent = t.user.dataManagement;
  if (userPageH3s.length >= 4) userPageH3s[3].textContent = t.user.danger;

  // 用户表单标签
  document.getElementById('user-height').previousElementSibling.textContent = t.user.height + ' (cm)';
  document.getElementById('user-weight').previousElementSibling.textContent = t.user.weight + ' (kg)';
  document.getElementById('user-age').previousElementSibling.textContent = t.user.age;
  document.getElementById('user-gender').previousElementSibling.textContent = t.user.gender;
  document.getElementById('user-special-needs').previousElementSibling.textContent = t.user.specialNeeds;
  document.getElementById('user-special-needs').placeholder = t.user.placeholder;
  document.getElementById('user-api-key').previousElementSibling.textContent = t.user.apiKey;
  document.getElementById('user-api-url').previousElementSibling.textContent = t.user.apiUrl;
  document.getElementById('user-api-model').previousElementSibling.textContent = t.user.model;

  document.getElementById('btn-save-user').textContent = t.user.saveUser;
  document.getElementById('btn-save-ai').textContent = t.user.saveAI;
  document.getElementById('btn-export-data').textContent = t.user.export;
  document.getElementById('btn-import-data').textContent = t.user.import;
  document.getElementById('btn-reset-data').textContent = t.user.reset;

  // 数据管理描述
  const dataDesc = document.querySelector('#page-user .text-sm.text-gray-500');
  if (dataDesc) dataDesc.textContent = t.user.dataManagementDesc;

  // ---- 添加早餐模态框 ----
  document.querySelector('#modal-add-breakfast h3').textContent =
    currentLang === 'zh' ? '添加早餐' : 'Add Breakfast';
  document.querySelector('label[for="breakfast-name"], #breakfast-name').previousElementSibling.textContent = t.breakfast.name;

  // 暗色模式按钮提示
  const darkBtn = document.getElementById('btn-dark-mode');
  if (darkBtn) darkBtn.title = t.darkMode.tooltip;
}

// ==================== 暗色模式 ====================

/**
 * 初始化暗色模式
 * 从 localStorage 恢复用户偏好
 */
function initDarkMode() {
  const savedMode = localStorage.getItem('breakfast-app-dark-mode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedMode === 'true' || (savedMode === null && prefersDark);

  if (isDark) {
    document.documentElement.classList.add('dark');
  }

  updateDarkModeButton();
}

/**
 * 切换暗色模式
 */
function toggleDarkMode() {
  const html = document.documentElement;
  html.classList.toggle('dark');

  const isDark = html.classList.contains('dark');
  localStorage.setItem('breakfast-app-dark-mode', isDark);

  updateDarkModeButton();

  // 如果统计页面已加载图表，重新渲染以适配暗色模式
  if (typeof updateChartsTheme === 'function') {
    updateChartsTheme();
  }
}

/**
 * 更新暗色模式切换按钮的图标
 */
function updateDarkModeButton() {
  const btn = document.getElementById('btn-dark-mode');
  if (!btn) return;

  const isDark = document.documentElement.classList.contains('dark');
  const t = translations[currentLang];
  btn.textContent = isDark ? t.darkMode.light : t.darkMode.dark;
  btn.title = t.darkMode.tooltip;
}

// ==================== Chart.js 懒加载 ====================

/** Chart.js 加载状态 */
let chartJSPromise = null;

/**
 * 懒加载 Chart.js（从本地 Express 路由提供）
 * 页面主体加载完毕后，在用户切换到统计页面时才加载
 * @returns {Promise<typeof Chart>}
 */
function loadChartJS() {
  if (window.Chart) {
    return Promise.resolve(window.Chart);
  }

  if (chartJSPromise) {
    return chartJSPromise;
  }

  chartJSPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    // 从本地 Express 路由加载，不走外部 CDN
    script.src = '/vendor/chart.js';
    script.onload = () => {
      if (window.Chart) {
        resolve(window.Chart);
      } else {
        reject(new Error('Chart.js loaded but global Chart not found'));
      }
    };
    script.onerror = () => {
      chartJSPromise = null; // 允许重试
      reject(new Error('Failed to load Chart.js'));
    };
    document.head.appendChild(script);
  });

  return chartJSPromise;
}

// ==================== API 请求 ====================

/**
 * 通用API请求函数
 * @param {string} url 请求地址
 * @param {Object} options fetch 选项
 * @returns {Promise<Object>} 响应数据
 */
async function apiRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, mergedOptions);

    // 处理文件下载响应（如数据导出）
    if (response.headers.get('content-disposition')) {
      return response;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
}

// ==================== Toast 提示 ====================

/**
 * 显示Toast提示消息
 * @param {string} message 提示内容
 * @param {number} duration 显示时长（毫秒），默认3000
 */
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  toastMessage.textContent = message;
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, duration);
}

// ==================== 事件绑定 ====================

// 导航按钮
document.getElementById('nav-breakfast').addEventListener('click', () => switchPage('breakfast'));
document.getElementById('nav-stats').addEventListener('click', () => switchPage('stats'));
document.getElementById('nav-ai').addEventListener('click', () => switchPage('ai'));
document.getElementById('nav-user').addEventListener('click', () => switchPage('user'));

// 语言切换按钮
document.getElementById('lang-zh').addEventListener('click', () => switchLanguage('zh'));
document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));

// 暗色模式切换
document.getElementById('btn-dark-mode').addEventListener('click', toggleDarkMode);

// 添加早餐按钮
document.getElementById('btn-add-breakfast').addEventListener('click', openAddBreakfastModal);

// 取消添加按钮
document.getElementById('btn-cancel-add').addEventListener('click', closeModal);

// 从模板添加按钮
document.getElementById('btn-add-from-template').addEventListener('click', () => {
  if (typeof openTemplateModal === 'function') {
    openTemplateModal();
  }
});

// ==================== 模态框工具函数 ====================

/** 打开添加早餐模态框 */
function openAddBreakfastModal() {
  const modal = document.getElementById('modal-add-breakfast');
  modal.classList.remove('hidden');
}

/** 关闭添加早餐模态框 */
function closeModal() {
  const modal = document.getElementById('modal-add-breakfast');
  modal.classList.add('hidden');
  document.getElementById('form-add-breakfast').reset();
}

// ==================== 页面初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
  console.log('早餐管理应用已加载');

  // 初始化暗色模式（优先执行，避免白闪）
  initDarkMode();

  // 恢复语言设置
  updatePageText();
  document.getElementById('lang-zh').classList.remove('active');
  document.getElementById('lang-en').classList.remove('active');
  document.getElementById(`lang-${currentLang}`).classList.add('active');
});
