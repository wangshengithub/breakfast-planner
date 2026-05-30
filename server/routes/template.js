const express = require('express');
const router = express.Router();
const { templateStorage } = require('../utils/fileStorage');

/**
 * 获取所有模板
 * GET /api/templates
 */
router.get('/', (req, res) => {
  try {
    const templates = templateStorage.getAll();
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取模板列表失败' });
  }
});

/**
 * 添加模板
 * POST /api/templates
 * Body: { name, unit, consumptionPerMeal, alertLine }
 */
router.post('/', (req, res) => {
  try {
    const { name, unit, consumptionPerMeal, alertLine } = req.body;

    // 校验必填字段
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: '模板名称不能为空' });
    }
    if (!unit || typeof unit !== 'string' || !unit.trim()) {
      return res.status(400).json({ success: false, message: '单位不能为空' });
    }
    if (consumptionPerMeal === undefined || typeof consumptionPerMeal !== 'number' || consumptionPerMeal <= 0) {
      return res.status(400).json({ success: false, message: '每次消耗量必须大于0' });
    }
    if (alertLine === undefined || typeof alertLine !== 'number' || alertLine < 0) {
      return res.status(400).json({ success: false, message: '提醒线不能为负数' });
    }

    // 检查是否已存在同名模板（防止重复）
    const existing = templateStorage.getAll();
    const duplicate = existing.find(t => t.name === name.trim());
    if (duplicate) {
      return res.status(400).json({ success: false, message: '同名模板已存在' });
    }

    const template = {
      name: name.trim(),
      unit: unit.trim(),
      consumptionPerMeal: parseFloat(consumptionPerMeal),
      alertLine: parseFloat(alertLine)
    };

    const success = templateStorage.add(template);
    if (success) {
      res.json({ success: true, message: '模板添加成功' });
    } else {
      res.status(500).json({ success: false, message: '模板添加失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '添加模板失败' });
  }
});

/**
 * 删除模板
 * DELETE /api/templates/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = templateStorage.delete(id);
    if (success) {
      res.json({ success: true, message: '模板已删除' });
    } else {
      res.status(404).json({ success: false, message: '模板不存在' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '删除模板失败' });
  }
});

module.exports = router;
