const express = require('express');
const router = express.Router();
const { userStorage, breakfastStorage, historyStorage } = require('../utils/fileStorage');

// 获取历史记录
router.get('/history', (req, res) => {
  try {
    const records = historyStorage.getRecent(3);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取历史记录失败' });
  }
});

// 获取AI早餐建议
router.post('/suggest', async (req, res) => {
  try {
    // 获取用户配置
    const user = userStorage.get() || {};

    // 检查是否配置了API密钥
    if (!user.aiApiKey) {
      const language = req.body.language || 'zh';
      const message = language === 'zh' ? '请先在用户设置中配置AI API密钥' : 'Please configure AI API key in user settings first';
      return res.status(400).json({ success: false, message });
    }

    // 获取当前库存
    const breakfasts = breakfastStorage.getAll();

    // 获取最近3天的历史记录
    const recentHistory = historyStorage.getRecent(3);

    // 获取语言参数
    const language = req.body.language || 'zh';

    // 构建库存列表文本
    let inventoryText = '';
    breakfasts.forEach(b => {
      if (language === 'zh') {
        const alertStatus = b.isAlert ? ' [库存不足]' : '';
        inventoryText += `- ${b.name}: 剩余${b.remaining}${b.unit}，每次消耗${b.consumptionPerMeal}${b.unit}，提醒线${b.alertLine}${b.unit}${alertStatus}\n`;
      } else {
        const alertStatus = b.isAlert ? ' [Low stock]' : '';
        inventoryText += `- ${b.name}: ${b.remaining}${b.unit} remaining, ${b.consumptionPerMeal}${b.unit} per meal, alert line ${b.alertLine}${b.unit}${alertStatus}\n`;
      }
    });

    // 构建历史记录文本
    let historyText = '';
    recentHistory.forEach(record => {
      if (language === 'zh') {
        historyText += `${record.date}: `;
        record.breakfasts.forEach(b => {
          historyText += `${b.name}${b.consumed}${b.unit} `;
        });
        historyText += '\n';
      } else {
        historyText += `${record.date}: `;
        record.breakfasts.forEach(b => {
          historyText += `${b.name} ${b.consumed}${b.unit} `;
        });
        historyText += '\n';
      }
    });

    if (historyText === '') {
      historyText = language === 'zh' ? '暂无历史记录' : 'No history records';
    }

    // 构建系统提示词
    let systemPrompt = '';
    if (language === 'zh') {
      systemPrompt = `【重要】你必须全程使用中文回复。所有建议、分析、补充建议的内容必须是中文。

你是一位专业的营养师，根据用户的身体数据和早餐库存，提供合理的早餐建议。

用户信息：
- 身高：${user.height}cm
- 体重：${user.weight}kg
- 年龄：${user.age}岁
- 性别：${user.gender === 'male' ? '男' : '女'}
- 特殊需求：${user.specialNeeds || '无'}

当前库存：
${inventoryText}

最近3天早餐记录：
${historyText}

请提供以下内容（使用JSON格式）：
{
  "suggestion": "今日早餐建议（基于库存和营养需求）",
  "nutrition": "简单的营养分析",
  "restock": "库存补充建议（如果某项低于提醒线）"
}

注意：
1. 建议要基于当前库存，不要建议库存不足的食物
2. 考虑用户的特殊需求
3. 如果库存不足，给出补充建议
4. 确保早餐的多样性，尽量不要重复推荐相同的早餐
5. 回复必须是纯JSON格式，不要包含其他文字
6. 必须使用中文回复`;
    } else {
      systemPrompt = `IMPORTANT: You MUST write your entire response in English. All suggestions, analysis, and advice must be in English. Do NOT use Chinese in your response content.

You are a professional nutritionist. Provide reasonable breakfast suggestions based on the user's body data and breakfast inventory.

User information:
- Height: ${user.height}cm
- Weight: ${user.weight}kg
- Age: ${user.age} years old
- Gender: ${user.gender === 'male' ? 'Male' : 'Female'}
- Special needs: ${user.specialNeeds || 'None'}

Current inventory:
${inventoryText}

Recent 3-day breakfast records:
${historyText}

Please provide the following content (using JSON format):
{
  "suggestion": "Today's breakfast suggestion (based on inventory and nutritional needs)",
  "nutrition": "Simple nutrition analysis",
  "restock": "Inventory replenishment suggestions (if any item is below alert line)"
}

Notes:
1. Suggestions should be based on current inventory, do not suggest foods with insufficient stock
2. Consider the user's special needs
3. If inventory is insufficient, give replenishment suggestions
4. Ensure breakfast diversity, try to avoid recommending the same breakfast repeatedly
5. The response must be in pure JSON format, do not include other text
6. Write ALL response text in English only`;
    }

    // 构建请求体
    const requestBody = {
      model: user.aiModel || 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      temperature: 0.7,
      stream: true
    };

    // 所有数据准备完成后再设置流式响应头
    // 提前设置会导致后续异常时无法切换为 JSON 错误响应
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
      // 调用DeepSeek API（流式）
      const response = await fetch(user.aiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.aiApiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorMsg = '未知错误';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error?.message || errorMsg;
        } catch (_) {
          // API 返回非 JSON 错误体
        }
        res.write(`ERROR: ${errorMsg}`);
        return res.end();
      }

      // 处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                res.write(content);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      res.end();

    } catch (error) {
      console.error('AI建议错误:', error);
      res.write(`ERROR: 获取AI建议失败，请检查网络连接和API配置`);
      res.end();
    }

  } catch (error) {
    console.error('AI建议错误:', error);
    res.status(500).json({
      success: false,
      message: '获取AI建议失败，请检查网络连接和API配置'
    });
  }
});

// 记录今日早餐
router.post('/record', (req, res) => {
  try {
    const { breakfasts } = req.body;

    if (!Array.isArray(breakfasts)) {
      return res.status(400).json({ success: false, message: '参数格式不正确' });
    }

    const success = historyStorage.addToday(breakfasts);
    if (success) {
      res.json({ success: true, message: '记录成功' });
    } else {
      res.status(500).json({ success: false, message: '记录失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '记录今日早餐失败' });
  }
});

module.exports = router;
