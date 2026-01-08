import axios from 'axios';

/**
 * 聊天消息
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

/**
 * 对话请求
 */
export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  currentData?: any;
  apiKey: string;
}

/**
 * 对话服务
 */
export class ChatService {
  private baseURL = 'https://api-inference.modelscope.cn/v1';
  private model = 'deepseek-ai/DeepSeek-V3.2';

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(currentData?: any): string {
    let prompt = `你是一个专业的健康咨询助手，名为"小健康"。

你的职责：
1. 提供专业、科学的健康咨询和建议
2. 解答用户关于健康、营养、运动等方面的问题
3. 帮助用户了解常见疾病的症状和预防措施
4. 提供健康生活方式的指导和建议
5. 保持专业、友好、关怀的态度

咨询风格：
- 专业但不晦涩，善于用通俗易懂的语言解释健康知识
- 关怀备至，体现对用户健康的关心
- 提供具体、可操作的健康建议
- 回答简洁明了，重点突出
- 如遇专业医疗问题，建议用户咨询专业医生`;

    return prompt;
  }

  /**
   * 流式对话
   */
  async *chatStream(request: ChatRequest): AsyncGenerator<string, void, unknown> {
    const { message, conversationHistory = [], currentData, apiKey } = request;

    // 构建消息列表
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(currentData),
        timestamp: Date.now()
      }
    ];

    // 添加历史消息（最近10条）
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
          max_tokens: 1000,
          stream: true
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream',
          timeout: 30000
        }
      );

      const stream = response.data;

      for await (const chunk of stream) {
        const lines = chunk.toString().split('\n').filter((line: string) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error: any) {
      console.error('[ChatService] Stream error:', error);

      // AI失败时返回降级响应
      const fallbackResponse = this.getFallbackResponse(message, currentData);
      yield fallbackResponse;
    }
  }

  /**
   * 降级响应（AI调用失败时）
   */
  private getFallbackResponse(message: string, currentData?: any): string {
    const lowerMessage = message.toLowerCase();

    // 关于健康饮食
    if (lowerMessage.includes('饮食') || lowerMessage.includes('营养') || lowerMessage.includes('吃')) {
      return '健康饮食建议：均衡摄入各类营养素，多吃蔬菜水果，适量摄入蛋白质，控制盐分和糖分的摄入，保持饮食多样化。';
    }

    // 关于运动
    if (lowerMessage.includes('运动') || lowerMessage.includes('锻炼') || lowerMessage.includes('健身')) {
      return '运动建议：每周至少进行150分钟中等强度有氧运动，如快走、游泳、骑自行车等，同时结合适量的力量训练，保持身体活力。';
    }

    // 关于睡眠
    if (lowerMessage.includes('睡眠') || lowerMessage.includes('睡觉') || lowerMessage.includes('失眠')) {
      return '睡眠建议：保持规律的作息时间，睡前避免使用电子设备，创造安静舒适的睡眠环境，适量运动但避免睡前剧烈运动，如有严重失眠问题建议咨询医生。';
    }

    // 关于压力
    if (lowerMessage.includes('压力') || lowerMessage.includes('焦虑') || lowerMessage.includes('紧张')) {
      return '减压建议：尝试深呼吸、冥想、瑜伽等放松技巧，保持适当的运动，与朋友家人交流，合理安排工作和休息时间，必要时寻求专业心理咨询。';
    }

    // 关于常见疾病
    if (lowerMessage.includes('感冒') || lowerMessage.includes('发烧') || lowerMessage.includes('咳嗽')) {
      return '感冒建议：多休息，多喝水，保持室内通风，如症状严重可服用对症药物，如持续高烧或症状加重，建议及时就医。';
    }

    // 关于健康生活方式
    if (lowerMessage.includes('健康') || lowerMessage.includes('生活') || lowerMessage.includes('习惯')) {
      return '健康生活方式建议：保持均衡饮食，适量运动，充足睡眠，戒烟限酒，定期体检，保持积极乐观的心态，建立良好的社交关系。';
    }

    // 默认响应
    return '抱歉，我暂时无法回答这个问题。请确保已配置有效的魔搭API密钥，或尝试询问其他健康相关问题。';
  }
}

export default new ChatService();
