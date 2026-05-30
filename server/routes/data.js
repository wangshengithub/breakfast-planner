const express = require('express');
const router = express.Router();
const {
  breakfastStorage,
  userStorage,
  historyStorage,
  templateStorage,
  exportAllData,
  importAllData
} = require('../utils/fileStorage');

/**
 * 获取统计汇总数据
 * GET /api/stats/summary
 * 返回：库存概览、消耗趋势、品类分布、过期预警
 */
router.get('/summary', (req, res) => {
  try {
    const breakfasts = breakfastStorage.getAll();
    const history = historyStorage.getRecent(30); // 取近30天数据用于统计
    const { expired, expiringSoon } = breakfastStorage.getExpiryAlerts(3);

    // ---- 库存概览 ----
    const totalItems = breakfasts.length;
    const lowStockItems = breakfasts.filter(b => b.isAlert);
    const totalInventory = breakfasts.reduce((sum, b) => sum + b.remaining, 0);

    // ---- 消耗趋势（近7天逐日） ----
    const today = new Date();
    const consumptionTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // 在历史记录中查找当天数据
      const dayRecord = history.find(r => r.date === dateStr);
      const dayItems = dayRecord ? dayRecord.breakfasts : [];
      const totalConsumed = dayItems.reduce((sum, b) => sum + b.consumed, 0);

      consumptionTrend.push({
        date: dateStr,
        totalConsumed: Math.round(totalConsumed * 100) / 100,
        items: dayItems
      });
    }

    // ---- 品类消耗分布（近30天合计） ----
    const categoryMap = {};
    history.forEach(record => {
      record.breakfasts.forEach(b => {
        if (!categoryMap[b.name]) {
          categoryMap[b.name] = { name: b.name, totalConsumed: 0, unit: b.unit };
        }
        categoryMap[b.name].totalConsumed += b.consumed;
      });
    });
    const categoryBreakdown = Object.values(categoryMap).map(c => ({
      ...c,
      totalConsumed: Math.round(c.totalConsumed * 100) / 100
    }));

    // ---- 库存状态（每项的剩余百分比） ----
    const inventoryStatus = breakfasts.map(b => {
      // 以alertLine的3倍作为"满"的基准，至少为10
      const maxRef = Math.max(b.alertLine * 3, 10);
      const percentage = Math.min(Math.round((b.remaining / maxRef) * 100), 100);
      let status = 'normal';
      if (b.remaining <= 0) status = 'empty';
      else if (b.isAlert) status = 'low';

      return {
        name: b.name,
        remaining: b.remaining,
        unit: b.unit,
        alertLine: b.alertLine,
        percentage,
        status
      };
    });

    res.json({
      success: true,
      data: {
        totalItems,
        totalInventory: Math.round(totalInventory * 100) / 100,
        lowStockCount: lowStockItems.length,
        expiredCount: expired.length,
        expiringSoonCount: expiringSoon.length,
        consumptionTrend,
        categoryBreakdown,
        inventoryStatus
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ success: false, message: '获取统计数据失败' });
  }
});

/**
 * 导出所有数据
 * GET /api/data/export
 * 返回完整的JSON数据文件供下载
 */
router.get('/export', (req, res) => {
  try {
    const data = exportAllData();
    const filename = `breakfast-backup-${new Date().toISOString().split('T')[0]}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.json(data);
  } catch (error) {
    console.error('导出数据失败:', error);
    res.status(500).json({ success: false, message: '导出数据失败' });
  }
});

/**
 * 导入所有数据
 * POST /api/data/import
 * 接收JSON数据并覆盖当前数据
 */
router.post('/import', (req, res) => {
  try {
    const importData = req.body;

    if (!importData || typeof importData !== 'object') {
      return res.status(400).json({ success: false, message: '导入数据格式无效' });
    }

    // 至少要有一种数据
    const hasBreakfasts = importData.breakfasts;
    const hasUser = importData.user;
    const hasHistory = importData.history;
    const hasTemplates = importData.templates;

    if (!hasBreakfasts && !hasUser && !hasHistory && !hasTemplates) {
      return res.status(400).json({ success: false, message: '导入数据中没有可识别的内容' });
    }

    const result = importAllData(importData);

    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('导入数据失败:', error);
    res.status(500).json({ success: false, message: '导入数据时发生错误' });
  }
});

module.exports = router;
