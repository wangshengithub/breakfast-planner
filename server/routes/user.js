const express = require('express');
const router = express.Router();
const { userStorage, resetAllData } = require('../utils/fileStorage');

// 获取用户配置
router.get('/', (req, res) => {
  try {
    const user = userStorage.get();
    // 不返回API密钥的完整内容，只返回是否已配置
    const safeUser = {
      ...user,
      aiApiKey: user.aiApiKey ? '***已配置***' : ''
    };
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取用户配置失败' });
  }
});

// 更新用户配置
router.put('/', (req, res) => {
  try {
    const { height, weight, age, gender, specialNeeds, aiApiKey, aiApiUrl, aiModel } = req.body;

    const updates = {};

    // 验证并更新字段
    if (height !== undefined) {
      if (height < 50 || height > 250) {
        return res.status(400).json({ success: false, message: '身高输入不正确' });
      }
      updates.height = parseFloat(height);
    }

    if (weight !== undefined) {
      if (weight < 20 || weight > 300) {
        return res.status(400).json({ success: false, message: '体重输入不正确' });
      }
      updates.weight = parseFloat(weight);
    }

    if (age !== undefined) {
      if (age < 1 || age > 120) {
        return res.status(400).json({ success: false, message: '年龄输入不正确' });
      }
      updates.age = parseInt(age);
    }

    if (gender !== undefined) {
      if (!['male', 'female'].includes(gender)) {
        return res.status(400).json({ success: false, message: '性别输入不正确' });
      }
      updates.gender = gender;
    }

    if (specialNeeds !== undefined) {
      updates.specialNeeds = specialNeeds;
    }

    if (aiApiKey !== undefined) {
      updates.aiApiKey = aiApiKey;
    }

    if (aiApiUrl !== undefined) {
      updates.aiApiUrl = aiApiUrl;
    }

    if (aiModel !== undefined) {
      updates.aiModel = aiModel;
    }

    const success = userStorage.update(updates);
    if (success) {
      res.json({ success: true, message: '更新成功' });
    } else {
      res.status(500).json({ success: false, message: '更新失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '更新用户配置失败' });
  }
});

// 重置所有数据
router.post('/reset', (req, res) => {
  try {
    if (!req.body.confirm || req.body.confirm !== 'true') {
      return res.status(400).json({ success: false, message: '请确认重置操作' });
    }

    const success = resetAllData();
    if (success) {
      res.json({ success: true, message: '数据已重置' });
    } else {
      res.status(500).json({ success: false, message: '重置失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '重置数据失败' });
  }
});

module.exports = router;
