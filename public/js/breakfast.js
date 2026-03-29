// 早餐管理模块
let breakfasts = [];

// 加载早餐列表
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

// 渲染早餐列表
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
  listContainer.innerHTML = breakfasts.map(breakfast => `
    <div class="breakfast-card ${breakfast.isAlert ? 'alert' : ''}">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 class="breakfast-name">${breakfast.name}</h3>
          <div class="breakfast-info">
            <span>📦 ${t.breakfast.remaining}: ${breakfast.remaining}${breakfast.unit}</span>
            <span>🍽️ ${t.breakfast.consumption}: ${breakfast.consumptionPerMeal}${breakfast.unit}</span>
            <span>⚠️ ${t.breakfast.alertLine}: ${breakfast.alertLine}${breakfast.unit}</span>
          </div>
          ${breakfast.isAlert ? `
            <div class="alert-badge">
              <span>⚠️</span>
              <span>${t.breakfast.alert}</span>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="breakfast-actions">
        <button class="btn-consume" onclick="consumeBreakfast('${breakfast.id}')">
          ${t.breakfast.consume} ${breakfast.consumptionPerMeal}${breakfast.unit}
        </button>
        <button class="btn-restock" onclick="restockBreakfast('${breakfast.id}')">
          🛒 ${currentLang === 'zh' ? '补充' : 'Restock'}
        </button>
        <button class="btn-delete" onclick="deleteBreakfast('${breakfast.id}')">
          ${t.breakfast.delete}
        </button>
      </div>
    </div>
  `).join('');
}

// 添加早餐
async function addBreakfast(e) {
  e.preventDefault();

  const name = document.getElementById('breakfast-name').value.trim();
  const remaining = parseFloat(document.getElementById('breakfast-remaining').value);
  const unit = document.getElementById('breakfast-unit').value.trim();
  const consumption = parseFloat(document.getElementById('breakfast-consumption').value);
  const alertLine = parseFloat(document.getElementById('breakfast-alert').value);

  try {
    const response = await apiRequest('/api/breakfasts', {
      method: 'POST',
      body: JSON.stringify({
        name,
        remaining,
        unit,
        consumptionPerMeal: consumption,
        alertLine
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

// 消耗早餐
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
      body: JSON.stringify({
        amount: breakfast.consumptionPerMeal
      })
    });

    if (response.success) {
      showToast(currentLang === 'zh' ? '消耗成功' : 'Consumed successfully');
      await loadBreakfasts();
    }
  } catch (error) {
    showToast(error.message || (currentLang === 'zh' ? '消耗失败' : 'Failed to consume'));
  }
}

// 删除早餐
async function deleteBreakfast(id) {
  const t = translations[currentLang];
  
  // 打开删除确认模态框
  const modal = document.getElementById('modal-delete');
  const confirmBtn = document.getElementById('btn-confirm-delete');
  
  // 绑定确认按钮事件
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
  
  // 显示模态框
  modal.classList.remove('hidden');
}

// 关闭删除确认模态框
function closeModalDelete() {
  const modal = document.getElementById('modal-delete');
  modal.classList.add('hidden');
}

// 补充早餐
async function restockBreakfast(id) {
  const breakfast = breakfasts.find(b => b.id === id);
  if (!breakfast) return;

  // 打开补充库存模态框
  const modal = document.getElementById('modal-restock');
  const amountInput = document.getElementById('restock-amount');
  
  // 设置默认值为每次消耗量
  amountInput.value = breakfast.consumptionPerMeal;
  
  // 显示模态框
  modal.classList.remove('hidden');
  
  // 绑定表单提交事件
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
        body: JSON.stringify({
          amount: restockAmount
        })
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

// 关闭补充库存模态框
function closeModalRestock() {
  const modal = document.getElementById('modal-restock');
  const form = document.getElementById('form-restock');
  modal.classList.add('hidden');
  form.reset();
}

// 检查库存不足的早餐并显示提醒
function checkLowStockAlert() {
  const lowStockItems = breakfasts.filter(b => b.isAlert);

  if (lowStockItems.length > 0) {
    const modal = document.getElementById('modal-alert');
    const contentDiv = document.getElementById('alert-content');
    const titleEl = document.getElementById('alert-modal-title');
    const closeBtn = document.getElementById('btn-close-alert');
    const t = translations[currentLang];

    // 更新模态框标题和按钮文本
    titleEl.textContent = t.breakfast.modal.title;
    closeBtn.textContent = t.breakfast.modal.close;

    // 生成库存不足的早餐列表
    const itemsHtml = lowStockItems.map(item => `
      <div class="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3">
        <div>
          <span class="font-semibold text-red-800">${item.name}</span>
          <span class="text-red-600 text-sm ml-2">${t.breakfast.remaining}: ${item.remaining}${item.unit}</span>
        </div>
        <span class="text-red-500 text-xs">${t.breakfast.alert}</span>
      </div>
    `).join('');

    contentDiv.innerHTML = itemsHtml;
    modal.classList.remove('hidden');
  }
}

// 关闭库存不足提醒模态框
function closeModalAlert() {
  const modal = document.getElementById('modal-alert');
  modal.classList.add('hidden');
}

// 页面加载时获取早餐列表
document.addEventListener('DOMContentLoaded', () => {
  loadBreakfasts().then(() => {
    // 加载完成后检查库存不足
    setTimeout(checkLowStockAlert, 500);
  });
  
  // 绑定表单提交事件
  document.getElementById('form-add-breakfast').addEventListener('submit', addBreakfast);
  
  // 绑定取消补充按钮事件
  document.getElementById('btn-cancel-restock').addEventListener('click', closeModalRestock);
  
  // 绑定删除取消按钮事件
  document.getElementById('btn-cancel-delete').addEventListener('click', closeModalDelete);
  
  // 绑定关闭提醒按钮事件
  document.getElementById('btn-close-alert').addEventListener('click', closeModalAlert);
});
