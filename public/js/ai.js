// AI建议模块
let currentSuggestion = null;

// 加载历史记录
async function loadHistory() {
  try {
    const response = await apiRequest('/api/ai/history');
    if (response.success) {
      renderHistory(response.data);
    }
  } catch (error) {
    console.error('加载历史记录失败:', error);
  }
}

// 渲染完整建议内容
function renderFullSuggestion() {
  const contentState = document.getElementById('suggestion-content');
  const t = translations[currentLang];
  
  contentState.innerHTML = `
    <!-- 今日建议 -->
    <div class="suggestion-card">
      <h4>🍳 ${t.ai.suggestion}</h4>
      <p class="whitespace-pre-wrap">${currentSuggestion.suggestion || '暂无建议'}</p>
    </div>

    <!-- 营养分析 -->
    ${currentSuggestion.nutrition ? `
      <div class="suggestion-card">
        <h4>📊 ${t.ai.nutrition}</h4>
        <p class="whitespace-pre-wrap">${currentSuggestion.nutrition}</p>
      </div>
    ` : ''}

    <!-- 库存补充建议 -->
    ${currentSuggestion.restock ? `
      <div class="suggestion-card">
        <h4>🛒 ${t.ai.restock}</h4>
        <p class="whitespace-pre-wrap">${currentSuggestion.restock}</p>
      </div>
    ` : ''}
  `;
}

// 渲染历史记录
function renderHistory(records) {
  const historyContainer = document.getElementById('history-list');
  const t = translations[currentLang];
  
  if (!records || records.length === 0) {
    historyContainer.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <div class="text-4xl mb-2">📅</div>
        <p>${t.ai.noHistory}</p>
      </div>
    `;
    return;
  }

  // 按日期分组记录
  const groupedRecords = {};
  records.forEach(record => {
    if (!groupedRecords[record.date]) {
      groupedRecords[record.date] = [];
    }
    groupedRecords[record.date].push(...record.breakfasts);
  });

  historyContainer.innerHTML = Object.entries(groupedRecords).map(([date, breakfasts]) => {
    // 将同一天的早餐合并显示
    const breakfastText = breakfasts.map(b => 
      `${b.name}${b.consumed}${b.unit}`
    ).join('、');
    
    return `
      <div class="bg-white rounded-xl shadow-md p-6 mb-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-800">${date}</h3>
          <span class="text-sm text-gray-500">${breakfasts.length} ${t.ai.items}</span>
        </div>
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div class="font-medium text-gray-800">${breakfastText}</div>
        </div>
      </div>
    `;
  }).join('');
}

// 获取AI建议（流式输出）
async function getSuggestion() {
  const emptyState = document.getElementById('empty-suggestion');
  const loadingState = document.getElementById('loading-suggestion');
  const contentState = document.getElementById('suggestion-content');

  // 显示加载状态
  emptyState.classList.add('hidden');
  contentState.classList.add('hidden');
  loadingState.classList.remove('hidden');

  // 初始化建议内容
  currentSuggestion = {
    suggestion: '',
    nutrition: '',
    restock: ''
  };

  try {
    const response = await fetch('/api/ai/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ language: currentLang })
    });

    if (!response.ok) {
      throw new Error('请求失败');
    }

    // 切换到内容显示状态
    loadingState.classList.add('hidden');
    contentState.classList.remove('hidden');

    // 初始化内容区域
    contentState.innerHTML = `
      <div class="suggestion-card">
        <h4>🍳 今日早餐建议</h4>
        <p id="stream-suggestion" class="whitespace-pre-wrap"></p>
      </div>
    `;

    const suggestionElement = document.getElementById('stream-suggestion');

    // 读取流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // 检查是否是错误信息
      if (buffer.startsWith('ERROR:')) {
        showToast(buffer.slice(6));
        loadingState.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
      }

      // 实时更新显示
      suggestionElement.textContent = buffer;
    }

    // 流式输出完成后，尝试解析JSON
    try {
      // 尝试提取JSON部分
      const jsonMatch = buffer.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        currentSuggestion = {
          suggestion: parsed.suggestion || buffer,
          nutrition: parsed.nutrition || '',
          restock: parsed.restock || ''
        };
      } else {
        currentSuggestion = {
          suggestion: buffer,
          nutrition: '',
          restock: ''
        };
      }
      
      // 重新渲染完整内容
      renderFullSuggestion();
    } catch (error) {
      // 解析失败，保持纯文本
      currentSuggestion = {
        suggestion: buffer,
        nutrition: '',
        restock: ''
      };
      renderFullSuggestion();
    }

  } catch (error) {
    console.error('获取建议错误:', error);
    showToast(error.message || '获取建议失败');
    loadingState.classList.add('hidden');
    emptyState.classList.remove('hidden');
  }
}

// 渲染建议内容
function renderSuggestion() {
  const emptyState = document.getElementById('empty-suggestion');
  const loadingState = document.getElementById('loading-suggestion');
  const contentState = document.getElementById('suggestion-content');

  loadingState.classList.add('hidden');
  emptyState.classList.add('hidden');
  contentState.classList.remove('hidden');

  contentState.innerHTML = `
    <!-- 今日建议 -->
    <div class="suggestion-card">
      <h4>🍳 今日早餐建议</h4>
      <p>${currentSuggestion.suggestion || '暂无建议'}</p>
    </div>

    <!-- 营养分析 -->
    ${currentSuggestion.nutrition ? `
      <div class="suggestion-card">
        <h4>📊 营养分析</h4>
        <p>${currentSuggestion.nutrition}</p>
      </div>
    ` : ''}

    <!-- 库存补充建议 -->
    ${currentSuggestion.restock ? `
      <div class="suggestion-card">
        <h4>🛒 库存补充建议</h4>
        <p>${currentSuggestion.restock}</p>
      </div>
    ` : ''}
  `;
}

// 绑定获取建议按钮事件
document.getElementById('btn-get-suggestion').addEventListener('click', getSuggestion);

// 页面加载时获取历史记录
document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
});
