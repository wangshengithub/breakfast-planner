/**
 * 早餐管理模块
 * 负责：早餐列表渲染、添加/删除/消耗/补充、保质期显示、模板保存
 */

let breakfasts = [];

// ==================== 加载与渲染 ====================

/** 从后端加载早餐列表 */
async function loadBreakfasts() {
  try {
    const response = await apiRequest('/api/breakfasts');
    if (response.success) {
      breakfasts = response.data;
      renderBreakfasts();
    }
  } catch (error) {
    showToast(currentLang === 'zh' ? '加载早餐列表失败' : 'Failed to load breakfast list');
  }
}

/**
 * 计算保质期状态
 * @param {string} expiryDate 保质期日期字符串 (YYYY-MM-DD)
 * @returns {{ status: 'none'|'expired'|'expiring'|'fresh', text: string }}
 */
function getExpiryStatus(expiryDate) {
  if (!expiryDate) return { status: 'none', text: '' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffMs = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const t = translations[currentLang];

  if (diffDays < 0) {
    return {
      status: 'expired',
      text: `❌ ${t.breakfast.expired} (${Math.abs(diffDays)}${currentLang === 'zh' ? '天前' : ' days ago'})`
    };
  } else if (diffDays <= 3) {
    return {
      status: 'expiring',
      text: `⚠️ ${t.breakfast.expiringSoon} (${diffDays}${t.breakfast.daysLeft})`
    };
  } else {
    return {
      status: 'fresh',
      text: `✅ ${diffDays}${t.breakfast.daysLeft}`
    };
  }
}

/**
 * 渲染早餐列表
 */
function renderBreakfasts() {
  const listContainer = document.getElementById('breakfast-list');
  const emptyState = document.getElementById('empty-breakfast');
  const t = translations[currentLang];

  if (breakfasts.length === 0) {
    listContainer.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  listContainer.innerHTML = breakfasts.map(breakfast => {
    // 保质期状态
    const expiry = getExpiryStatus(breakfast.expiryDate);
    let expiryBadge = '';
    if (expiry.status === 'expired') {
      expiryBadge = `<span class="expiry-badge expired">${expiry.text}</span>`;
    } else if (expiry.status === 'expiring') {
      expiryBadge = `<span class="expiry-badge expiring-soon">${expiry.text}</span>`;
    } else if (expiry.status === 'fresh') {
      expiryBadge = `<span class="expiry-badge fresh">${expiry.text}</span>`;
    }

    // 卡片添加过期状态样式
    const expiredClass = expiry.status === 'expired' ? ' expired' : '';

    return `
      <div class="breakfast-card ${breakfast.isAlert ? 'alert' : ''}${expiredClass}">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="breakfast-name">${breakfast.name}</h3>
            <div class="breakfast-info">
              <span>📦 ${t.breakfast.remaining}: ${breakfast.remaining}${breakfast.unit}</span>
              <span>🍽️ ${t.breakfast.consumption}: ${breakfast.consumptionPerMeal}${breakfast.unit}</span>
              <span>⚠️ ${t.breakfast.alertLine}: ${breakfast.alertLine}${breakfast.unit}</span>
              ${breakfast.expiryDate ? `<span>📅 ${t.breakfast.expiryDate}: ${breakfast.expiryDate}</span>` : ''}
            </div>
            ${breakfast.isAlert ? `
              <div class="alert-badge">
                <span>⚠️</span>
                <span>${t.breakfast.alert}</span>
              </div>
            ` : ''}
            ${expiryBadge}
          </div>
        </div>
        <div class="breakfast-actions">
          <button class="btn-consume" onclick="consumeBreakfast('${breakfast.id}')">
            ${t.breakfast.consume} ${breakfast.consumptionPerMeal}${breakfast.unit}
          </button>
          <button class="btn-restock" onclick="restockBreakfast('${breakfast.id}')">
            ${t.breakfast.restock}
          </button>
          <button class="btn-template" onclick="saveAsTemplate('${breakfast.id}')">
            ${t.breakfast.saveAsTemplate}
          </button>
          <button class="btn-delete" onclick="deleteBreakfast('${breakfast.id}')">
            ${t.breakfast.delete}
          </button>
        </div>
      </div>
    `;
  }).join('');

  // 检查过期预警并显示横幅
  checkExpiryBanner();
}

// ==================== 保质期预警横幅 ====================

/** 检查并显示过期预警横幅 */
function checkExpiryBanner() {
  const banner = document.getElementById('expiry-warning-banner');
  const bannerContent = document.getElementById('expiry-banner-content');
  const bannerTitle = document.getElementById('expiry-banner-title');
  const t = translations[currentLang];

  const expiredItems = breakfasts.filter(b => {
    const status = getExpiryStatus(b.expiryDate);
    return status.status === 'expired';
  });

  const expiringItems = breakfasts.filter(b => {
    const status = getExpiryStatus(b.expiryDate);
    return status.status === 'expiring';
  });

  if (expiredItems.length === 0 && expiringItems.length === 0) {
    banner.classList.add('hidden');
    return;
  }

  let contentParts = [];
  if (expiredItems.length > 0) {
    const names = expiredItems.map(b => `<strong>${b.name}</strong>`).join('、');
    contentParts.push(`❌ ${t.breakfast.expired}: ${names}`);
  }
  if (expiringItems.length > 0) {
    const names = expiringItems.map(b => `<strong>${b.name}</strong>`).join('、');
    contentParts.push(`⚠️ ${t.breakfast.expiringSoon}: ${names}`);
  }

  bannerTitle.textContent = currentLang === 'zh'
    ? `⏰ 保质期提醒 (${expiredItems.length + expiringItems.length}项)`
    : `⏰ Expiry Alert (${expiredItems.length + expiringItems.length} items)`;
  bannerContent.innerHTML = contentParts.join('<br>');
  banner.classList.remove('hidden');
}

// ==================== 添加早餐 ====================

/**
 * 处理添加早餐表单提交
 * @param {Event} e 表单提交事件
 */
async function addBreakfast(e) {
  e.preventDefault();

  const name = document.getElementById('breakfast-name').value.trim();
  const remaining = parseFloat(document.getElementById('breakfast-remaining').value);
  const unit = document.getElementById('breakfast-unit').value.trim();
  const consumption = parseFloat(document.getElementById('breakfast-consumption').value);
  const alertLine = parseFloat(document.getElementById('breakfast-alert').value);
  const expiryDate = document.getElementById('breakfast-expiry').value || '';

  // 前端校验
  if (!name) {
    showToast(currentLang === 'zh' ? '请输入早餐名称' : 'Please enter a name');
    return;
  }
  if (!unit) {
    showToast(currentLang === 'zh' ? '请输入单位' : 'Please enter a unit');
    return;
  }
  if (isNaN(remaining) || remaining < 0) {
    showToast(currentLang === 'zh' ? '请输入有效的剩余量' : 'Please enter a valid remaining amount');
    return;
  }
  if (isNaN(consumption) || consumption <= 0) {
    showToast(currentLang === 'zh' ? '每次消耗量必须大于0' : 'Consumption per meal must be greater than 0');
    return;
  }

  try {
    const response = await apiRequest('/api/breakfasts', {
      method: 'POST',
      body: JSON.stringify({
        name,
        remaining,
        unit,
        consumptionPerMeal: consumption,
        alertLine,
        expiryDate
      })
    });

    if (response.success) {
      showToast(currentLang === 'zh' ? '添加成功' : 'Added successfully');
      closeModal();
      document.getElementById('form-add-breakfast').reset();
      await loadBreakfasts();
    }
  } catch (error) {
    showToast(error.message || (currentLang === 'zh' ? '添加失败' : 'Failed to add'));
  }
}

// ==================== 消耗早餐 ====================

/**
 * 消耗指定早餐
 * @param {string} id 早餐ID
 */
async function consumeBreakfast(id) {
  const breakfast = breakfasts.find(b => b.id === id);
  if (!breakfast) return;
  const t = translations[currentLang];

  if (breakfast.remaining < breakfast.consumptionPerMeal) {
    showToast(t.breakfast.insufficient);
    return;
  }

  try {
    const response = await apiRequest(`/api/breakfasts/${id}/consume`, {
      method: 'POST',
      body: JSON.stringify({ amount: breakfast.consumptionPerMeal })
    });

    if (response.success) {
      showToast(currentLang === 'zh' ? '消耗成功' : 'Consumed successfully');
      await loadBreakfasts();
    }
  } catch (error) {
    showToast(error.message || (currentLang === 'zh' ? '消耗失败' : 'Failed to consume'));
  }
}

// ==================== 删除早餐 ====================

/**
 * 删除指定早餐（弹出确认框）
 * @param {string} id 早餐ID
 */
async function deleteBreakfast(id) {
  const modal = document.getElementById('modal-delete');
  const confirmBtn = document.getElementById('btn-confirm-delete');

  confirmBtn.onclick = async () => {
    try {
      const response = await apiRequest(`/api/breakfasts/${id}`, {
        method: 'DELETE'
      });

      if (response.success) {
        showToast(currentLang === 'zh' ? '删除成功' : 'Deleted successfully');
        closeModalDelete();
        await loadBreakfasts();
      }
    } catch (error) {
      showToast(error.message || (currentLang === 'zh' ? '删除失败' : 'Failed to delete'));
    }
  };

  modal.classList.remove('hidden');
}

/** 关闭删除确认模态框 */
function closeModalDelete() {
  document.getElementById('modal-delete').classList.add('hidden');
}

// ==================== 补充库存 ====================

/**
 * 打开补充库存模态框
 * @param {string} id 早餐ID
 */
async function restockBreakfast(id) {
  const breakfast = breakfasts.find(b => b.id === id);
  if (!breakfast) return;

  const modal = document.getElementById('modal-restock');
  const amountInput = document.getElementById('restock-amount');

  // 默认补充量 = 每次消耗量
  amountInput.value = breakfast.consumptionPerMeal;
  modal.classList.remove('hidden');

  const form = document.getElementById('form-restock');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const restockAmount = parseFloat(amountInput.value);

    if (!restockAmount || restockAmount <= 0) {
      showToast(currentLang === 'zh' ? '请输入有效的数量' : 'Please enter a valid amount');
      return;
    }

    try {
      const response = await apiRequest(`/api/breakfasts/${id}/restock`, {
        method: 'POST',
        body: JSON.stringify({ amount: restockAmount })
      });

      if (response.success) {
        showToast(currentLang === 'zh' ? '补充成功' : 'Restocked successfully');
        closeModalRestock();
        await loadBreakfasts();
      }
    } catch (error) {
      showToast(error.message || (currentLang === 'zh' ? '补充失败' : 'Failed to restock'));
    }
  };
}

/** 关闭补充库存模态框 */
function closeModalRestock() {
  document.getElementById('modal-restock').classList.add('hidden');
  document.getElementById('form-restock').reset();
}

// ==================== 库存不足提醒 ====================

/** 检查并弹出库存不足提醒 */
function checkLowStockAlert() {
  const lowStockItems = breakfasts.filter(b => b.isAlert);

  if (lowStockItems.length > 0) {
    const modal = document.getElementById('modal-alert');
    const contentDiv = document.getElementById('alert-content');
    const titleEl = document.getElementById('alert-modal-title');
    const closeBtn = document.getElementById('btn-close-alert');
    const t = translations[currentLang];

    titleEl.textContent = t.breakfast.modal.title;
    closeBtn.textContent = t.breakfast.modal.close;

    const itemsHtml = lowStockItems.map(item => `
      <div class="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
        <div>
          <span class="font-semibold text-red-800 dark:text-red-400">${item.name}</span>
          <span class="text-red-600 dark:text-red-400 text-sm ml-2">${t.breakfast.remaining}: ${item.remaining}${item.unit}</span>
        </div>
        <span class="text-red-500 text-xs">${t.breakfast.alert}</span>
      </div>
    `).join('');

    contentDiv.innerHTML = itemsHtml;
    modal.classList.remove('hidden');
  }
}

/** 关闭库存不足提醒模态框 */
function closeModalAlert() {
  document.getElementById('modal-alert').classList.add('hidden');
}

// ==================== 保存为模板 ====================

/**
 * 将早餐项保存为常用模板
 * @param {string} id 早餐ID
 */
async function saveAsTemplate(id) {
  const breakfast = breakfasts.find(b => b.id === id);
  if (!breakfast) return;

  const t = translations[currentLang];

  try {
    const response = await apiRequest('/api/templates', {
      method: 'POST',
      body: JSON.stringify({
        name: breakfast.name,
        unit: breakfast.unit,
        consumptionPerMeal: breakfast.consumptionPerMeal,
        alertLine: breakfast.alertLine
      })
    });

    if (response.success) {
      showToast(t.template.saveSuccess);
    }
  } catch (error) {
    // 如果是同名重复，后端会返回具体错误
    showToast(error.message || (currentLang === 'zh' ? '保存模板失败' : 'Failed to save template'));
  }
}

// ==================== 事件绑定 ====================

document.addEventListener('DOMContentLoaded', () => {
  // 加载早餐列表，然后检查库存不足
  loadBreakfasts().then(() => {
    setTimeout(checkLowStockAlert, 500);
  });

  // 添加早餐表单提交
  document.getElementById('form-add-breakfast').addEventListener('submit', addBreakfast);

  // 各模态框关闭按钮
  document.getElementById('btn-cancel-restock').addEventListener('click', closeModalRestock);
  document.getElementById('btn-cancel-delete').addEventListener('click', closeModalDelete);
  document.getElementById('btn-close-alert').addEventListener('click', closeModalAlert);
});
