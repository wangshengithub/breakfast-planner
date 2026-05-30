/**
 * 用户配置模块
 * 负责：用户信息管理、AI配置、数据导出/导入、数据重置
 */

let userData = {};

// ==================== 用户配置 ====================

/** 从后端加载用户配置并填充表单 */
async function loadUserConfig() {
  try {
    const response = await apiRequest('/api/user');
    if (response.success) {
      userData = response.data;
      fillUserForm();
    }
  } catch (error) {
    console.error('加载用户配置失败:', error);
  }
}

/** 将用户数据填充到表单 */
function fillUserForm() {
  if (userData.height) document.getElementById('user-height').value = userData.height;
  if (userData.weight) document.getElementById('user-weight').value = userData.weight;
  if (userData.age) document.getElementById('user-age').value = userData.age;
  if (userData.gender) document.getElementById('user-gender').value = userData.gender;
  if (userData.specialNeeds) document.getElementById('user-special-needs').value = userData.specialNeeds;
  if (userData.aiApiUrl) document.getElementById('user-api-url').value = userData.aiApiUrl;
  if (userData.aiModel) document.getElementById('user-api-model').value = userData.aiModel;
  // API密钥不回显，保持为空
}

/** 保存用户基本信息 */
async function saveUserInfo() {
  const height = document.getElementById('user-height').value;
  const weight = document.getElementById('user-weight').value;
  const age = document.getElementById('user-age').value;
  const gender = document.getElementById('user-gender').value;
  const specialNeeds = document.getElementById('user-special-needs').value.trim();

  const updates = {};
  if (height) updates.height = parseFloat(height);
  if (weight) updates.weight = parseFloat(weight);
  if (age) updates.age = parseInt(age);
  if (gender) updates.gender = gender;
  if (specialNeeds !== undefined) updates.specialNeeds = specialNeeds;

  try {
    const response = await apiRequest('/api/user', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    if (response.success) {
      showToast(currentLang === 'zh' ? '用户信息保存成功' : 'User info saved');
      await loadUserConfig();
    }
  } catch (error) {
    showToast(error.message || (currentLang === 'zh' ? '保存失败' : 'Save failed'));
  }
}

/** 保存AI配置 */
async function saveAIConfig() {
  const apiKey = document.getElementById('user-api-key').value.trim();
  const apiUrl = document.getElementById('user-api-url').value.trim();
  const apiModel = document.getElementById('user-api-model').value.trim();

  const updates = {};
  if (apiKey) updates.aiApiKey = apiKey;
  if (apiUrl) updates.aiApiUrl = apiUrl;
  if (apiModel) updates.aiModel = apiModel;

  // 至少要有一个字段被更新
  if (Object.keys(updates).length === 0) {
    showToast(currentLang === 'zh' ? '没有需要保存的更改' : 'No changes to save');
    return;
  }

  try {
    const response = await apiRequest('/api/user', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    if (response.success) {
      showToast(currentLang === 'zh' ? 'AI配置保存成功' : 'AI config saved');
      document.getElementById('user-api-key').value = '';
      await loadUserConfig();
    }
  } catch (error) {
    showToast(error.message || (currentLang === 'zh' ? '保存失败' : 'Save failed'));
  }
}

// ==================== 数据导出 ====================

/** 导出所有数据为JSON文件并下载 */
async function exportData() {
  const t = translations[currentLang];

  try {
    const response = await fetch('/api/data/export');

    if (!response.ok) {
      throw new Error('导出失败');
    }

    // 从 Content-Disposition 获取文件名
    const disposition = response.headers.get('content-disposition');
    let filename = `breakfast-backup-${new Date().toISOString().split('T')[0]}.json`;
    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?(.+)/i);
      if (match) {
        filename = decodeURIComponent(match[1].replace(/"/g, ''));
      }
    }

    const data = await response.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // 创建隐藏的下载链接并触发点击
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(t.user.exportSuccess);
  } catch (error) {
    console.error('导出数据错误:', error);
    showToast(currentLang === 'zh' ? '导出失败' : 'Export failed');
  }
}

// ==================== 数据导入 ====================

/** 待导入的文件数据（在确认导入前暂存） */
let pendingImportData = null;

/** 触发文件选择器 */
function triggerImportFile() {
  document.getElementById('import-file-input').click();
}

/**
 * 处理文件选择
 * @param {Event} event 文件选择事件
 */
function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const t = translations[currentLang];

  // 校验文件类型
  if (!file.name.endsWith('.json')) {
    showToast(currentLang === 'zh' ? '请选择JSON文件' : 'Please select a JSON file');
    return;
  }

  // 校验文件大小（限制5MB）
  if (file.size > 5 * 1024 * 1024) {
    showToast(currentLang === 'zh' ? '文件过大，请选择小于5MB的文件' : 'File too large, max 5MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      pendingImportData = data;

      // 生成文件信息预览
      const info = [];
      if (data.breakfasts) {
        const count = Array.isArray(data.breakfasts) ? data.breakfasts.length
          : (data.breakfasts.breakfasts ? data.breakfasts.breakfasts.length : 0);
        info.push(`📦 ${currentLang === 'zh' ? '早餐数据' : 'Breakfasts'}: ${count} ${currentLang === 'zh' ? '项' : 'items'}`);
      }
      if (data.user) {
        info.push(`👤 ${currentLang === 'zh' ? '用户配置' : 'User config'}: ✓`);
      }
      if (data.history) {
        const count = Array.isArray(data.history) ? data.history.length
          : (data.history.records ? data.history.records.length : 0);
        info.push(`📅 ${currentLang === 'zh' ? '历史记录' : 'History'}: ${count} ${currentLang === 'zh' ? '条' : 'records'}`);
      }
      if (data.templates) {
        const count = Array.isArray(data.templates) ? data.templates.length
          : (data.templates.templates ? data.templates.templates.length : 0);
        info.push(`⭐ ${currentLang === 'zh' ? '模板' : 'Templates'}: ${count} ${currentLang === 'zh' ? '个' : 'items'}`);
      }
      info.push(`📄 ${currentLang === 'zh' ? '文件' : 'File'}: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);

      document.getElementById('import-file-info').innerHTML = info.join('<br>');

      // 显示确认模态框
      document.getElementById('modal-import').classList.remove('hidden');
    } catch (parseError) {
      showToast(currentLang === 'zh' ? '文件解析失败，请确认是有效的JSON文件' : 'Invalid JSON file');
    }
  };
  reader.readAsText(file);

  // 重置文件输入，允许重复选择同一文件
  event.target.value = '';
}

/** 确认导入数据 */
async function confirmImport() {
  if (!pendingImportData) return;
  const t = translations[currentLang];

  try {
    const response = await apiRequest('/api/data/import', {
      method: 'POST',
      body: JSON.stringify(pendingImportData)
    });

    if (response.success) {
      showToast(t.user.importSuccess);
      closeImportModal();

      // 刷新所有数据
      await loadUserConfig();
      if (typeof loadBreakfasts === 'function') await loadBreakfasts();
      if (typeof loadHistory === 'function') await loadHistory();
    }
  } catch (error) {
    showToast(error.message || t.user.importFailed);
  }
}

/** 关闭导入确认模态框 */
function closeImportModal() {
  document.getElementById('modal-import').classList.add('hidden');
  pendingImportData = null;
}

// ==================== 数据重置 ====================

/** 重置所有数据（弹出确认框） */
async function resetAllData() {
  const modal = document.getElementById('modal-reset');
  const confirmBtn = document.getElementById('btn-confirm-reset');

  confirmBtn.onclick = async () => {
    try {
      const response = await apiRequest('/api/user/reset', {
        method: 'POST',
        body: JSON.stringify({ confirm: 'true' })
      });

      if (response.success) {
        showToast(currentLang === 'zh' ? '数据已重置' : 'Data has been reset');
        closeModalReset();
        await loadUserConfig();
        if (typeof loadBreakfasts === 'function') await loadBreakfasts();
        if (typeof loadHistory === 'function') await loadHistory();
      }
    } catch (error) {
      showToast(error.message || (currentLang === 'zh' ? '重置失败' : 'Failed to reset'));
    }
  };

  modal.classList.remove('hidden');
}

/** 关闭重置确认模态框 */
function closeModalReset() {
  document.getElementById('modal-reset').classList.add('hidden');
}

// ==================== 事件绑定 ====================

document.getElementById('btn-save-user').addEventListener('click', saveUserInfo);
document.getElementById('btn-save-ai').addEventListener('click', saveAIConfig);
document.getElementById('btn-reset-data').addEventListener('click', resetAllData);
document.getElementById('btn-cancel-reset').addEventListener('click', closeModalReset);

// 数据导出导入
document.getElementById('btn-export-data').addEventListener('click', exportData);
document.getElementById('btn-import-data').addEventListener('click', triggerImportFile);
document.getElementById('import-file-input').addEventListener('change', handleImportFile);
document.getElementById('btn-cancel-import').addEventListener('click', closeImportModal);
document.getElementById('btn-confirm-import').addEventListener('click', confirmImport);

// 页面加载时获取用户配置
document.addEventListener('DOMContentLoaded', () => {
  loadUserConfig();
});
