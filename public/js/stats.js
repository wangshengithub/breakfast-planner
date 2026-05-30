/**
 * 统计仪表盘模块
 * 负责：加载统计数据、懒加载 Chart.js、渲染三个图表
 * 设计：Chart.js 从本地 Express 路由 /vendor/chart.js 懒加载，不阻塞页面首屏
 */

/** 缓存的 Chart 实例，切换暗色模式时需要销毁重建 */
let trendChart = null;
let categoryChart = null;
let inventoryChart = null;

/** 标记是否已加载过统计（避免每次切页面都重新加载） */
let statsLoaded = false;

// ==================== 主加载函数 ====================

/**
 * 加载统计数据并渲染图表
 * 在用户切换到"统计"页面时调用
 */
async function loadStats() {
  try {
    // 获取统计数据
    const response = await apiRequest('/api/data/summary');
    if (!response.success) return;

    const data = response.data;

    // 更新概览数字
    document.getElementById('stat-total-items').textContent = data.totalItems;
    document.getElementById('stat-total-inventory').textContent = data.totalInventory;
    document.getElementById('stat-low-stock').textContent = data.lowStockCount;
    document.getElementById('stat-expiring').textContent = data.expiredCount + data.expiringSoonCount;

    // 如果没有数据，显示空状态
    const emptyStats = document.getElementById('empty-stats');
    const chartsParent = document.querySelectorAll('#page-stats .chart-container');

    if (data.totalItems === 0 && data.consumptionTrend.every(d => d.totalConsumed === 0)) {
      emptyStats.classList.remove('hidden');
      chartsParent.forEach(c => c.parentElement.classList.add('hidden'));
      return;
    }

    emptyStats.classList.add('hidden');
    chartsParent.forEach(c => c.parentElement.classList.remove('hidden'));

    // 加载历史记录（沿用 ai.js 中的 loadHistory/renderHistory）
    if (typeof loadHistory === 'function') {
      loadHistory();
    }

    // 懒加载 Chart.js，然后渲染图表
    try {
      await loadChartJS();
      renderTrendChart(data.consumptionTrend);
      renderCategoryChart(data.categoryBreakdown);
      renderInventoryChart(data.inventoryStatus);
      statsLoaded = true;
    } catch (chartError) {
      console.error('Chart.js 加载失败:', chartError);
      // 隐藏图表加载动画，显示错误提示
      ['chart-loading-trend', 'chart-loading-category', 'chart-loading-inventory'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<p class="text-red-400 text-sm">图表加载失败，请刷新页面重试</p>';
      });
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
    showToast(currentLang === 'zh' ? '加载统计数据失败' : 'Failed to load stats');
  }
}

// ==================== 图表渲染 ====================

/**
 * 渲染近7天消耗趋势折线图
 * @param {Array} trendData 趋势数据
 */
function renderTrendChart(trendData) {
  const loadingEl = document.getElementById('chart-loading-trend');
  if (loadingEl) loadingEl.classList.add('hidden');

  const ctx = document.getElementById('chart-consumption-trend');
  if (!ctx) return;

  // 销毁旧图表
  if (trendChart) trendChart.destroy();

  const isDark = document.documentElement.classList.contains('dark');
  const t = translations[currentLang];

  // 格式化日期标签（只显示月-日）
  const labels = trendData.map(d => {
    const parts = d.date.split('-');
    return `${parts[1]}-${parts[2]}`;
  });

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: t.stats.consumed,
        data: trendData.map(d => d.totalConsumed),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          titleColor: isDark ? '#e2e8f0' : '#1e293b',
          bodyColor: isDark ? '#cbd5e1' : '#475569',
          borderColor: isDark ? '#475569' : '#e2e8f0',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12
        }
      },
      scales: {
        x: {
          grid: {
            color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'
          },
          ticks: {
            color: isDark ? '#94a3b8' : '#64748b'
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'
          },
          ticks: {
            color: isDark ? '#94a3b8' : '#64748b',
            stepSize: 1
          }
        }
      }
    }
  });
}

/**
 * 渲染品类消耗分布饼图
 * @param {Array} categoryData 品类数据
 */
function renderCategoryChart(categoryData) {
  const loadingEl = document.getElementById('chart-loading-category');
  if (loadingEl) loadingEl.classList.add('hidden');

  const ctx = document.getElementById('chart-category');
  if (!ctx) return;

  if (categoryChart) categoryChart.destroy();

  const isDark = document.documentElement.classList.contains('dark');

  // 无数据时显示空提示
  if (categoryData.length === 0) {
    const parent = ctx.parentElement;
    const emptyText = document.createElement('p');
    emptyText.className = 'chart-empty-text';
    emptyText.textContent = translations[currentLang].stats.noChartData;
    // 不覆盖已有内容
    return;
  }

  // 预定义配色方案
  const colors = [
    '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
    '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#84cc16'
  ];

  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categoryData.map(c => c.name),
      datasets: [{
        data: categoryData.map(c => c.totalConsumed),
        backgroundColor: colors.slice(0, categoryData.length),
        borderColor: isDark ? '#1e293b' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '55%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: isDark ? '#cbd5e1' : '#475569',
            padding: 12,
            font: { size: 12 },
            usePointStyle: true,
            pointStyleWidth: 10
          }
        },
        tooltip: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          titleColor: isDark ? '#e2e8f0' : '#1e293b',
          bodyColor: isDark ? '#cbd5e1' : '#475569',
          borderColor: isDark ? '#475569' : '#e2e8f0',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: function(context) {
              const item = categoryData[context.dataIndex];
              const unit = item ? item.unit : '';
              return ` ${context.label}: ${context.parsed} ${unit}`;
            }
          }
        }
      }
    }
  });
}

/**
 * 渲染库存概览水平柱状图
 * @param {Array} inventoryData 库存数据
 */
function renderInventoryChart(inventoryData) {
  const loadingEl = document.getElementById('chart-loading-inventory');
  if (loadingEl) loadingEl.classList.add('hidden');

  const ctx = document.getElementById('chart-inventory');
  if (!ctx) return;

  if (inventoryChart) inventoryChart.destroy();

  const isDark = document.documentElement.classList.contains('dark');

  if (inventoryData.length === 0) return;

  // 根据状态着色
  const barColors = inventoryData.map(item => {
    if (item.status === 'empty') return '#ef4444';
    if (item.status === 'low') return '#f59e0b';
    return '#10b981';
  });

  const t = translations[currentLang];

  inventoryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: inventoryData.map(d => d.name),
      datasets: [{
        label: t.stats.remaining,
        data: inventoryData.map(d => d.remaining),
        backgroundColor: barColors,
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          titleColor: isDark ? '#e2e8f0' : '#1e293b',
          bodyColor: isDark ? '#cbd5e1' : '#475569',
          borderColor: isDark ? '#475569' : '#e2e8f0',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: function(context) {
              const item = inventoryData[context.dataIndex];
              return ` ${t.stats.remaining}: ${context.parsed.x} ${item.unit}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'
          },
          ticks: {
            color: isDark ? '#94a3b8' : '#64748b'
          }
        },
        y: {
          grid: {
            display: false
          },
          ticks: {
            color: isDark ? '#cbd5e1' : '#475569',
            font: { size: 13, weight: '500' }
          }
        }
      }
    }
  });
}

// ==================== 暗色模式图表刷新 ====================

/**
 * 切换暗色模式时重新渲染所有图表
 * 由 app.js 的 toggleDarkMode() 调用
 */
function updateChartsTheme() {
  if (!statsLoaded) return;

  // 重新加载统计以刷新图表颜色
  loadStats();
}
