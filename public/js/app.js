// 页面切换功能
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
  document.getElementById(`page-${pageName}`).classList.add('active');

  // 激活对应的导航按钮
  document.getElementById(`nav-${pageName}`).classList.add('active');
}

// 语言切换功能 - 从localStorage读取保存的语言设置
let currentLang = localStorage.getItem('breakfast-app-lang') || 'zh';

// 语言翻译字典
const translations = {
  zh: {
    title: '🍳 早餐管理应用',
    subtitle: '智能库存管理 · AI营养建议',
    nav: {
      breakfast: '📦 库存管理',
      ai: '🤖 今日建议',
      user: '⚙️ 用户设置'
    },
    breakfast: {
      title: '早餐库存管理',
      add: '+ 添加早餐',
      empty: '还没有添加早餐，点击上方按钮添加吧！',
      name: '早餐名称',
      remaining: '剩余',
      consumption: '每次消耗',
      alertLine: '提醒线',
      unit: '单位',
      consume: '🍽️ 消耗',
      delete: '🗑️ 删除',
      alert: '库存不足，请及时补充',
      insufficient: '库存不足，无法消耗',
      modal: {
        title: '⚠️ 库存不足提醒',
        close: '我知道了'
      }
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
      danger: '⚠️ 危险操作',
      reset: '🗑️ 重置所有数据'
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
      ai: '🤖 Suggestions',
      user: '⚙️ Settings'
    },
    breakfast: {
      title: 'Breakfast Inventory',
      add: '+ Add Breakfast',
      empty: 'No breakfasts added yet, click the button above to add one!',
      name: 'Name',
      remaining: 'Remaining',
      consumption: 'Per Meal',
      alertLine: 'Alert Line',
      unit: 'Unit',
      consume: '🍽️ Consume',
      delete: '🗑️ Delete',
      alert: 'Low stock, please replenish',
      insufficient: 'Insufficient stock',
      modal: {
        title: '⚠️ Low Stock Alert',
        close: 'Got it'
      }
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
      danger: '⚠️ Danger Zone',
      reset: '🗑️ Reset All Data'
    },
    github: {
      star: '⭐ Star on GitHub',
      link: 'https://github.com/wangshengithub/breakfast-manager'
    }
  }
};

// 切换语言
function switchLanguage(lang) {
  currentLang = lang;
  // 保存语言选择到localStorage
  localStorage.setItem('breakfast-app-lang', lang);
  updatePageText();

  // 更新语言按钮样式
  document.getElementById('lang-zh').classList.remove('active');
  document.getElementById('lang-en').classList.remove('active');
  document.getElementById(`lang-${lang}`).classList.add('active');

  // 重新渲染早餐列表，以更新语言
  if (typeof renderBreakfasts === 'function') {
    renderBreakfasts();
  }

  // 重新渲染历史记录，以更新语言
  if (typeof loadHistory === 'function') {
    loadHistory();
  }

  showToast(lang === 'zh' ? '已切换到中文' : 'Switched to English');
}

// 更新页面文本
function updatePageText() {
  const t = translations[currentLang];
  console.log('Updating page text for language:', currentLang);
  console.log('Translation data:', t);

  // 更新网页标题（浏览器标签页）
  document.title = currentLang === 'zh'
    ? '早餐管理应用 | Breakfast Manager'
    : 'Breakfast Manager | 早餐管理应用';

  // 更新页面主标题
  document.querySelector('h1').textContent = t.title;
  document.querySelector('header p').textContent = t.subtitle;

  // 更新导航
  document.getElementById('nav-breakfast').textContent = t.nav.breakfast;
  document.getElementById('nav-ai').textContent = t.nav.ai;
  document.getElementById('nav-user').textContent = t.nav.user;

  // 更新库存管理页面
  document.querySelector('#page-breakfast h2').textContent = t.breakfast.title;
  document.getElementById('btn-add-breakfast').textContent = t.breakfast.add;
  document.querySelector('#empty-breakfast p').textContent = t.breakfast.empty;

  // 更新AI建议页面
  document.querySelector('#page-ai h2').textContent = t.ai.title;
  document.getElementById('btn-get-suggestion').textContent = t.ai.getSuggestion;
  document.querySelector('#empty-suggestion p').textContent = t.ai.empty;
  document.querySelector('#loading-suggestion p').textContent = t.ai.loading;
  document.querySelector('#page-ai h3').textContent = t.ai.history;

  // 更新用户设置页面
  document.querySelector('#page-user h2').textContent = t.user.title;
  
  // 获取用户设置页面中的所有h3元素
  const userPageH3s = document.querySelectorAll('#page-user h3');
  if (userPageH3s.length >= 1) userPageH3s[0].textContent = t.user.basicInfo;
  if (userPageH3s.length >= 2) userPageH3s[1].textContent = t.user.aiConfig;
  if (userPageH3s.length >= 3) userPageH3s[2].textContent = t.user.danger;
  
  document.getElementById('user-height').previousElementSibling.textContent = t.user.height;
  document.getElementById('user-weight').previousElementSibling.textContent = t.user.weight;
  document.getElementById('user-age').previousElementSibling.textContent = t.user.age;
  document.getElementById('user-gender').previousElementSibling.textContent = t.user.gender;
  document.getElementById('user-special-needs').previousElementSibling.textContent = t.user.specialNeeds;
  document.getElementById('user-special-needs').placeholder = t.user.placeholder;
  document.getElementById('user-api-key').previousElementSibling.textContent = t.user.apiKey;
  document.getElementById('user-api-url').previousElementSibling.textContent = t.user.apiUrl;
  document.getElementById('user-api-model').previousElementSibling.textContent = t.user.model;
  document.getElementById('btn-save-user').textContent = t.user.saveUser;
  document.getElementById('btn-save-ai').textContent = t.user.saveAI;
  document.getElementById('btn-reset-data').textContent = t.user.reset;
}

// 绑定导航按钮事件
document.getElementById('nav-breakfast').addEventListener('click', () => switchPage('breakfast'));
document.getElementById('nav-ai').addEventListener('click', () => switchPage('ai'));
document.getElementById('nav-user').addEventListener('click', () => switchPage('user'));

// 绑定语言切换按钮
document.getElementById('lang-zh').addEventListener('click', () => switchLanguage('zh'));
document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));

// 绑定添加早餐按钮
document.getElementById('btn-add-breakfast').addEventListener('click', openAddBreakfastModal);

// 绑定取消添加按钮
document.getElementById('btn-cancel-add').addEventListener('click', closeModal);

// 打开添加早餐模态框
function openAddBreakfastModal() {
  const modal = document.getElementById('modal-add-breakfast');
  modal.classList.remove('hidden');
}

// 关闭添加早餐模态框
function closeModal() {
  const modal = document.getElementById('modal-add-breakfast');
  modal.classList.add('hidden');
  document.getElementById('form-add-breakfast').reset();
}

// API请求函数
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

// 显示提示消息
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  toastMessage.textContent = message;
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('早餐管理应用已加载');
  console.log('Initial language:', currentLang);
  updatePageText();

  // 根据当前语言设置激活状态
  document.getElementById('lang-zh').classList.remove('active');
  document.getElementById('lang-en').classList.remove('active');
  document.getElementById(`lang-${currentLang}`).classList.add('active');
});
