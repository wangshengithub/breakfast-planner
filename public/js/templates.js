/**
 * 模板管理模块
 * 负责：加载/显示/选择/删除常用早餐模板
 * 模板保存了 name, unit, consumptionPerMeal, alertLine，用户只需填写库存量即可快速添加
 */

/** 当前加载的模板列表 */
let templates = [];

// ==================== 模板列表 ====================

/** 从后端加载模板列表 */
async function loadTemplates() {
  try {
    const response = await apiRequest('/api/templates');
    if (response.success) {
      templates = response.data;
    }
  } catch (error) {
    console.error('加载模板列表失败:', error);
  }
}

/**
 * 渲染模板选择模态框内容
 */
function renderTemplates() {
  const listContainer = document.getElementById('template-list');
  const emptyState = document.getElementById('empty-templates');
  const t = translations[currentLang];

  if (templates.length === 0) {
    listContainer.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  listContainer.innerHTML = templates.map(tpl => `
    <div class="template-card">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="template-name">${tpl.name}</div>
          <div class="template-info">
            <span>📦 ${currentLang === 'zh' ? '单位' : 'Unit'}: ${tpl.unit}</span>
            <span>🍽️ ${currentLang === 'zh' ? '每次消耗' : 'Per meal'}: ${tpl.consumptionPerMeal}${tpl.unit}</span>
            <span>⚠️ ${currentLang === 'zh' ? '提醒线' : 'Alert'}: ${tpl.alertLine}${tpl.unit}</span>
          </div>
        </div>
        <div class="flex gap-2 ml-3">
          <button class="btn-consume" style="font-size:0.8rem; padding:0.35rem 0.75rem;"
                  onclick="useTemplate('${tpl.id}')">
            ${t.template.select}
          </button>
          <button class="btn-delete" style="font-size:0.8rem; padding:0.35rem 0.75rem;"
                  onclick="deleteTemplate('${tpl.id}')">
            ${t.template.delete}
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ==================== 模态框操作 ====================

/** 打开模板选择模态框 */
async function openTemplateModal() {
  await loadTemplates();
  renderTemplates();
  document.getElementById('modal-templates').classList.remove('hidden');
}

/** 关闭模板选择模态框 */
function closeTemplateModal() {
  document.getElementById('modal-templates').classList.add('hidden');
}

// ==================== 使用模板 ====================

/**
 * 使用模板填充添加早餐表单
 * @param {string} templateId 模板ID
 */
function useTemplate(templateId) {
  const tpl = templates.find(t => t.id === templateId);
  if (!tpl) return;

  // 填充表单（保留 remaining 让用户手动输入）
  document.getElementById('breakfast-name').value = tpl.name;
  document.getElementById('breakfast-unit').value = tpl.unit;
  document.getElementById('breakfast-consumption').value = tpl.consumptionPerMeal;
  document.getElementById('breakfast-alert').value = tpl.alertLine;

  // 聚焦到剩余量输入框
  document.getElementById('breakfast-remaining').value = '';
  document.getElementById('breakfast-remaining').focus();

  // 关闭模板选择，打开添加表单
  closeTemplateModal();

  const modal = document.getElementById('modal-add-breakfast');
  modal.classList.remove('hidden');
}

// ==================== 删除模板 ====================

/**
 * 删除指定模板
 * @param {string} templateId 模板ID
 */
async function deleteTemplate(templateId) {
  const t = translations[currentLang];

  try {
    const response = await apiRequest(`/api/templates/${templateId}`, {
      method: 'DELETE'
    });

    if (response.success) {
      showToast(t.template.deleteSuccess);
      await loadTemplates();
      renderTemplates();
    }
  } catch (error) {
    showToast(error.message || (currentLang === 'zh' ? '删除模板失败' : 'Failed to delete template'));
  }
}

// ==================== 事件绑定 ====================

document.addEventListener('DOMContentLoaded', () => {
  // 关闭模板模态框
  document.getElementById('btn-close-templates').addEventListener('click', closeTemplateModal);
});
