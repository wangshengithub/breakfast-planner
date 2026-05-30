/**
 * AI建议模块
 * 负责：获取AI建议（流式输出）、渲染建议卡片
 * 历史记录的加载/渲染函数保留供 stats.js 调用
 */

let currentSuggestion = null;

// ==================== 历史记录 ====================

/** 从后端加载历史记录 */
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

/**
 * 渲染历史记录列表
 * @param {Array} records 历史记录数组
 */
function renderHistory(records) {
  const historyContainer = document.getElementById('history-list');
  if (!historyContainer) return;
  const t = translations[currentLang];

  if (!records || records.length === 0) {
    historyContainer.innerHTML = `
      <div class="text-center py-8 text-gray-400 dark:text-gray-500">
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
    const breakfastText = breakfasts.map(b =>
      `${b.name}${b.consumed}${b.unit}`
    ).join('、');

    return `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4 transition-colors duration-300">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">${date}</h3>
          <span class="text-sm text-gray-500 dark:text-gray-400">${breakfasts.length} ${t.ai.items}</span>
        </div>
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div class="font-medium text-gray-800 dark:text-gray-200">${breakfastText}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== AI建议 ====================

/** 渲染完整建议内容（流式结束后或已有建议时使用） */
function renderFullSuggestion() {
  const contentState = document.getElementById('suggestion-content');
  const t = translations[currentLang];
  const noSuggestion = currentLang === 'zh' ? '暂无建议' : 'No suggestion';

  contentState.innerHTML = `
    <div class="suggestion-card">
      <h4>🍳 ${t.ai.suggestion}</h4>
      <p class="whitespace-pre-wrap">${currentSuggestion.suggestion || noSuggestion}</p>
    </div>

    ${currentSuggestion.nutrition ? `
      <div class="suggestion-card">
        <h4>📊 ${t.ai.nutrition}</h4>
        <p class="whitespace-pre-wrap">${currentSuggestion.nutrition}</p>
      </div>
    ` : ''}

    ${currentSuggestion.restock ? `
      <div class="suggestion-card">
        <h4>🛒 ${t.ai.restock}</h4>
        <p class="whitespace-pre-wrap">${currentSuggestion.restock}</p>
      </div>
    ` : ''}
  `;
}

/**
 * 获取AI建议（流式输出）
 */
async function getSuggestion() {
  const emptyState = document.getElementById('empty-suggestion');
  const loadingState = document.getElementById('loading-suggestion');
  const contentState = document.getElementById('suggestion-content');
  const t = translations[currentLang];

  // 显示加载状态
  emptyState.classList.add('hidden');
  contentState.classList.add('hidden');
  loadingState.classList.remove('hidden');

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
      throw new Error(currentLang === 'zh' ? '请求失败' : 'Request failed');
    }

    // 切换到内容显示状态
    loadingState.classList.add('hidden');
    contentState.classList.remove('hidden');

    // 流式输出占位
    contentState.innerHTML = `
      <div class="suggestion-card">
        <h4>🍳 ${t.ai.suggestion}</h4>
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
      const jsonMatch = buffer.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        currentSuggestion = {
          suggestion: parsed.suggestion || buffer,
          nutrition: parsed.nutrition || '',
          restock: parsed.restock || ''
        };
      } else {
        currentSuggestion = { suggestion: buffer, nutrition: '', restock: '' };
      }
      renderFullSuggestion();
    } catch (error) {
      currentSuggestion = { suggestion: buffer, nutrition: '', restock: '' };
      renderFullSuggestion();
    }

  } catch (error) {
    console.error('获取建议错误:', error);
    showToast(error.message || (currentLang === 'zh' ? '获取建议失败' : 'Failed to get suggestion'));
    loadingState.classList.add('hidden');
    emptyState.classList.remove('hidden');
  }
}

// ==================== 事件绑定 ====================

document.getElementById('btn-get-suggestion').addEventListener('click', getSuggestion);
