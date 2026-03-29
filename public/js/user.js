// 用户配置模块
let userData = {};

// 加载用户配置
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

// 填充表单
function fillUserForm() {
  if (userData.height) {
    document.getElementById('user-height').value = userData.height;
  }
  if (userData.weight) {
    document.getElementById('user-weight').value = userData.weight;
  }
  if (userData.age) {
    document.getElementById('user-age').value = userData.age;
  }
  if (userData.gender) {
    document.getElementById('user-gender').value = userData.gender;
  }
  if (userData.specialNeeds) {
    document.getElementById('user-special-needs').value = userData.specialNeeds;
  }
  if (userData.aiApiUrl) {
    document.getElementById('user-api-url').value = userData.aiApiUrl;
  }
  if (userData.aiModel) {
    document.getElementById('user-api-model').value = userData.aiModel;
  }
  // API密钥不回显，保持为空或显示占位符
}

// 保存用户信息
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
      showToast('用户信息保存成功');
      // 重新加载用户配置
      await loadUserConfig();
    }
  } catch (error) {
    showToast(error.message || '保存失败');
  }
}

// 保存AI配置
async function saveAIConfig() {
  const apiKey = document.getElementById('user-api-key').value.trim();
  const apiUrl = document.getElementById('user-api-url').value.trim();
  const apiModel = document.getElementById('user-api-model').value.trim();

  const updates = {};

  if (apiKey) updates.aiApiKey = apiKey;
  if (apiUrl) updates.aiApiUrl = apiUrl;
  if (apiModel) updates.aiModel = apiModel;

  try {
    const response = await apiRequest('/api/user', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    if (response.success) {
      showToast('AI配置保存成功');
      // 清空API密钥输入框
      document.getElementById('user-api-key').value = '';
      // 重新加载用户配置
      await loadUserConfig();
    }
  } catch (error) {
    showToast(error.message || '保存失败');
  }
}

// 绑定保存按钮事件
document.getElementById('btn-save-user').addEventListener('click', saveUserInfo);
document.getElementById('btn-save-ai').addEventListener('click', saveAIConfig);

// 重置所有数据
async function resetAllData() {
  // 打开重置确认模态框
  const modal = document.getElementById('modal-reset');
  const confirmBtn = document.getElementById('btn-confirm-reset');
  
  // 绑定确认按钮事件
  confirmBtn.onclick = async () => {
    try {
      const response = await apiRequest('/api/user/reset', {
        method: 'POST',
        body: JSON.stringify({ confirm: 'true' })
      });

      if (response.success) {
        showToast(currentLang === 'zh' ? '数据已重置' : 'Data has been reset');
        closeModalReset();
        // 重新加载用户配置
        await loadUserConfig();
        // 刷新早餐列表
        if (typeof loadBreakfasts === 'function') {
          await loadBreakfasts();
        }
        // 刷新历史记录
        if (typeof loadHistory === 'function') {
          await loadHistory();
        }
      }
    } catch (error) {
      showToast(error.message || (currentLang === 'zh' ? '重置失败' : 'Failed to reset'));
    }
  };
  
  // 显示模态框
  modal.classList.remove('hidden');
}

// 关闭重置确认模态框
function closeModalReset() {
  const modal = document.getElementById('modal-reset');
  modal.classList.add('hidden');
}

// 绑定重置按钮事件
document.getElementById('btn-reset-data').addEventListener('click', resetAllData);

// 绑定取消重置按钮事件
document.getElementById('btn-cancel-reset').addEventListener('click', closeModalReset);

// 页面加载时获取用户配置
document.addEventListener('DOMContentLoaded', () => {
  loadUserConfig();
});
