const express = require('express');
const router = express.Router();
const { breakfastStorage, historyStorage } = require('../utils/fileStorage');

// 获取所有早餐
router.get('/', (req, res) => {
  try {
    const breakfasts = breakfastStorage.getAll();
    res.json({ success: true, data: breakfasts });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取早餐列表失败' });
  }
});

// 添加早餐
router.post('/', (req, res) => {
  try {
    const { name, remaining, unit, consumptionPerMeal, alertLine } = req.body;

    // 验证必填字段
    if (!name || remaining === undefined || !unit || consumptionPerMeal === undefined || alertLine === undefined) {
      return res.status(400).json({ success: false, message: '请填写所有必填字段' });
    }

    // 验证数值
    if (remaining < 0 || consumptionPerMeal <= 0 || alertLine < 0) {
      return res.status(400).json({ success: false, message: '数值输入不正确' });
    }

    const breakfast = {
      name,
      remaining: parseFloat(remaining),
      unit,
      consumptionPerMeal: parseFloat(consumptionPerMeal),
      alertLine: parseFloat(alertLine)
    };

    const success = breakfastStorage.add(breakfast);
    if (success) {
      res.json({ success: true, message: '添加成功' });
    } else {
      res.status(500).json({ success: false, message: '添加失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '添加早餐失败' });
  }
});

// 更新早餐
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, remaining, unit, consumptionPerMeal, alertLine } = req.body;

    // 验证数值
    if (remaining !== undefined && remaining < 0) {
      return res.status(400).json({ success: false, message: '剩余量不能为负数' });
    }
    if (consumptionPerMeal !== undefined && consumptionPerMeal <= 0) {
      return res.status(400).json({ success: false, message: '每次消耗量必须大于0' });
    }
    if (alertLine !== undefined && alertLine < 0) {
      return res.status(400).json({ success: false, message: '提醒线不能为负数' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (remaining !== undefined) updates.remaining = parseFloat(remaining);
    if (unit !== undefined) updates.unit = unit;
    if (consumptionPerMeal !== undefined) updates.consumptionPerMeal = parseFloat(consumptionPerMeal);
    if (alertLine !== undefined) updates.alertLine = parseFloat(alertLine);

    // 更新提醒状态
    if (remaining !== undefined && alertLine !== undefined) {
      updates.isAlert = remaining <= alertLine;
    }

    const success = breakfastStorage.update(id, updates);
    if (success) {
      res.json({ success: true, message: '更新成功' });
    } else {
      res.status(404).json({ success: false, message: '早餐不存在' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '更新早餐失败' });
  }
});

// 删除早餐
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = breakfastStorage.delete(id);
    if (success) {
      res.json({ success: true, message: '删除成功' });
    } else {
      res.status(404).json({ success: false, message: '早餐不存在' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '删除早餐失败' });
  }
});

// 消耗早餐
router.post('/:id/consume', (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const consumeAmount = amount ? parseFloat(amount) : 1;

    if (consumeAmount <= 0) {
      return res.status(400).json({ success: false, message: '消耗量必须大于0' });
    }

    // 获取早餐信息用于记录历史
    const breakfasts = breakfastStorage.getAll();
    const breakfast = breakfasts.find(b => b.id === id);
    
    if (!breakfast) {
      return res.status(404).json({ success: false, message: '早餐不存在' });
    }

    const success = breakfastStorage.consume(id, consumeAmount);
    if (success) {
      // 直接更新历史记录中的对应早餐项，而不是重新添加
      const records = historyStorage.getAll();
      const today = new Date().toISOString().split('T')[0];
      
      // 查找今天的记录
      const todayRecord = records.find(r => r.date === today);
      
      if (todayRecord) {
        // 查找今天是否已消耗过这个早餐
        const existingBreakfast = todayRecord.breakfasts.find(b => b.name === breakfast.name);
        
        if (existingBreakfast) {
          // 如果已消耗过，累加消耗量
          existingBreakfast.consumed += consumeAmount;
        } else {
          // 如果没有消耗过，添加新记录
          todayRecord.breakfasts.push({
            name: breakfast.name,
            consumed: consumeAmount,
            unit: breakfast.unit
          });
        }
        
        // 保存更新后的记录
        historyStorage.addToday(todayRecord.breakfasts);
      } else {
        // 如果今天还没有记录，创建新记录
        historyStorage.addToday([{
          name: breakfast.name,
          consumed: consumeAmount,
          unit: breakfast.unit
        }]);
      }
      
      res.json({ success: true, message: '消耗成功' });
    } else {
      res.status(404).json({ success: false, message: '早餐不存在' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '消耗早餐失败' });
  }
});

// 补充早餐
router.post('/:id/restock', (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const restockAmount = amount ? parseFloat(amount) : 0;

    if (restockAmount <= 0) {
      return res.status(400).json({ success: false, message: '补充量必须大于0' });
    }

    const breakfasts = breakfastStorage.getAll();
    const breakfast = breakfasts.find(b => b.id === id);
    
    if (!breakfast) {
      return res.status(404).json({ success: false, message: '早餐不存在' });
    }

    const success = breakfastStorage.restock(id, restockAmount);
    if (success) {
      res.json({ success: true, message: '补充成功' });
    } else {
      res.status(404).json({ success: false, message: '早餐不存在' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '补充早餐失败' });
  }
});

module.exports = router;
