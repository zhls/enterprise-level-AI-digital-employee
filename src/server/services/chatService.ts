import type { ChatRequest, ChatMessage, MessageContentText } from '../../shared/types'
import modelscopeService from './ModelScopeService.ts'
import ragService from './RAGService.ts'
import thinkingService from './ThinkingService.ts'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 会话存储
const sessions = new Map<string, ChatMessage[]>()

export interface ProcessChatOptions extends ChatRequest {
  // 可以包含额外选项
}

export class ChatService {
  private systemPrompt = `你是一位充满耐心、专业的健康咨询专员，名为"健康顾问"，是企业级 AI 数字员工。你的岗位是为用户提供专业、科学、个性化的健康咨询服务，非医疗诊断。

  ## 岗位说明书
  - **岗位名称**：健康咨询专员
  - **岗位职责**：
    1. 提供日常健康知识普及和咨询服务
    2. 提供营养膳食建议、健身计划指导及亚健康调理咨询
    3. 分析用户健康需求，提供个性化健康管理方案
    4. 识别健康风险，提供预防建议
    5. 建立和维护用户健康档案
  - **权限范围**：健康咨询服务，非医疗诊断
  - **服务标准**：专业、科学、耐心、个性化

  ## 服务流程规范
  1. **问候与介绍**：友好问候用户，介绍自己的身份和服务范围
  2. **需求分析**：通过提问了解用户的健康问题、生活习惯、身体状况等
  3. **专业评估**：基于健康知识库和科学依据，评估用户的健康状况
  4. **建议提供**：提供个性化、可操作的健康建议
  5. **总结与确认**：总结核心建议，确认用户理解
  6. **跟进与鼓励**：鼓励用户坚持健康生活方式，提供后续跟进建议

  ## 咨询理念
  1. 倾听为先 - 认真倾听用户的健康问题和需求，理解其背景和关注点
  2. 科学依据 - 所有建议基于可靠的健康知识和科学研究
  3. 个性化指导 - 根据用户的具体情况提供量身定制的健康建议
  4. 鼓励健康生活 - 倡导健康的生活方式，培养良好的健康习惯
  5. 循序渐进 - 根据用户的接受程度调整建议的深度和复杂度
  6. 边界清晰 - 明确区分健康咨询与医疗诊断，不越界提供医疗建议

  ## 回答风格
  - 使用温暖、关怀的语气
  - 多用引导性提问，帮助用户理清健康需求
  - 适时给予肯定和鼓励，增强用户的健康信心
  - 用生活化的例子解释健康概念和建议
  - 当用户困惑时，提供渐进式的解释和建议
  - 语言简洁明了，避免过多专业术语
  - 如需使用专业术语，必须先解释

  ## 健康问题解析能力（当用户上传健康相关图片时）
  1. 仔细观察图片中的健康信息，识别关键数据和问题
  2. 分析健康状况，找出关键问题点
  3. 用清晰的步骤展示分析过程，每一步都要说明理由
  4. 重要健康指标和公式使用 LaTeX 格式展示（如 $BMI = 体重(kg) / 身高(m)^2$）
  5. 最后给出科学合理的健康建议
  6. 如果有多种健康方案，可以展示不同方法供参考

  ## 重要原则
  - 一般情况下提供引导性建议，帮助用户建立健康意识
  - **当用户上传健康相关图片请求解析时，请直接给出详细的分析和建议**
  - 当用户完全无法理解时，可以提供更简单的解释和建议
  - 讲解健康知识时，先讲直观理解，再讲科学原理
  - 多问"您平时是怎么保持健康的？"、"如果调整这个习惯会有什么变化？"等问题
  - 鼓励用户用自己的话总结健康建议，加深理解
  - 每一次回答必须明确说明："本服务为健康咨询，非医疗诊断，如有疾病请及时就医"
  - 识别需要专业医疗干预的情况，建议用户及时就医
  - 严格遵守健康知识边界，不提供超出范围的建议

  ## 企业价值观体现
  - 专业：基于科学依据提供建议
  - 可靠：保证信息的准确性和权威性
  - 贴心：关注用户需求，提供个性化服务
  - 创新：不断优化健康咨询服务
  - 责任：明确告知服务边界，保障用户权益

  请严格按照上述岗位要求和服务流程，为用户提供专业的健康咨询服务。`


  /**
   * 将图片路径转换为 base64 格式
   */
  private convertImageToBase64(imagePath: string): string {
    try {
      // 处理相对路径
      const fullPath = imagePath.startsWith('http')
        ? imagePath // 如果已经是完整URL，直接返回（外部URL）
        : path.join(__dirname, '../../../public', imagePath)

      // 读取文件并转换为 base64
      const imageBuffer = fs.readFileSync(fullPath)
      const ext = path.extname(fullPath).toLowerCase()
      const mimeMap: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      }
      const mimeType = mimeMap[ext] || 'image/png'

      return `data:${mimeType};base64,${imageBuffer.toString('base64')}`
    } catch (error) {
      console.error('[Chat] Error converting image to base64:', error)
      throw new Error(`Failed to convert image: ${imagePath}`)
    }
  }

  /**
   * 处理对话请求
   */
  async processChat(request: ChatRequest): Promise<{
    response: string
    thinking?: string
    relatedTheorems?: any[]
    socraticQuestions?: string[]
  }> {
    const { message, images, subject, sessionId, conversationHistory, apiKeys } = request

    // 设置API密钥
    if (apiKeys?.modelScopeApiKey) {
      ragService.setApiKey(apiKeys.modelScopeApiKey)
    }

    // 1. 获取或创建会话历史
    let history = sessions.get(sessionId) || []
    if (conversationHistory) {
      history = conversationHistory
    }

    // 2. 构建用户消息内容（支持多模态）
    let userContent: any = message

    // 如果有图片，构建多模态内容（使用标准 OpenAI 格式）
    if (images && images.length > 0) {
      userContent = [
        { type: 'text', text: message || '请仔细观察这道题目，给出详细的解题步骤和答案' }
      ]
      // 添加图片（尝试使用 base64 格式）
      for (const imageUrl of images) {
        const base64Image = this.convertImageToBase64(imageUrl)
        console.log('[Chat] Using base64 image, length:', base64Image.length)
        userContent.push({
          type: 'image_url',
          image_url: {
            url: base64Image  // 保留完整的 data:image/png;base64, 前缀
          }
        })
      }
    }

    // 3. 检索相关知识（可选，失败不影响对话）
    let ragContext = ''
    let relatedTheorems: any[] = []
    try {
      ragContext = await ragService.buildRAGContext(message, subject)
      // 4. 获取相关定理（用于返回前端）
      relatedTheorems = await ragService.retrieveDocuments(message, 3, subject)
    } catch (error) {
      console.warn('[Chat] RAG context retrieval failed, continuing without RAG:', error)
    }

    // 5. 分析思考引导
    const currentTheorem = relatedTheorems.length > 0 ? relatedTheorems[0] : undefined
    const thinkingResult = thinkingService.analyzeUserQuestion(message, currentTheorem)

    // 6. 构建消息列表
    const messages: ChatMessage[] = [
      { id: 'system', role: 'system', content: this.systemPrompt, timestamp: Date.now() }
    ]

    // 添加RAG上下文
    if (ragContext) {
      messages[0].content += `\n\n${ragContext}`
    }

    // 添加教学指导
    if (thinkingResult.questions.length > 0) {
      messages[0].content += `\n\n针对此问题，你可以引导学生思考以下问题：\n${thinkingResult.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    }

    // 添加历史消息（过滤掉多模态格式，只保留纯文本）
    for (const msg of history) {
      // 如果 content 是数组（多模态格式），跳过或转换为纯文本
      if (Array.isArray(msg.content)) {
        // 尝试提取文本内容
        const textContent = msg.content.find((item): item is MessageContentText => item.type === 'text')
        if (textContent) {
          messages.push({
            id: msg.id,
            role: msg.role,
            content: textContent.text,
            timestamp: msg.timestamp
          })
        }
        // 如果没有文本内容，跳过这条消息
      } else if (typeof msg.content === 'string' && msg.content) {
        // 纯文本消息，直接添加
        messages.push(msg)
      }
    }

    // 添加当前用户消息（支持多模态）
    messages.push({
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: Date.now()
    })

    // 6. 调用AI生成回复（传入API密钥）
    const response = await modelscopeService.chat({
      messages: messages,
      temperature: 0.8,
      maxTokens: 1500,
      enableThinking: false,
      apiKey: apiKeys?.modelScopeApiKey
    })

    // 7. 更新会话历史
    history.push({
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: Date.now()
    })
    history.push({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    })
    sessions.set(sessionId, history.slice(-20)) // 只保留最近20条

    return {
      response,
      relatedTheorems: relatedTheorems.map(t => ({
        id: t.id,
        theorem: t.theorem,
        description: t.description,
        relevanceScore: (t as any).relevanceScore || 0
      })),
      socraticQuestions: thinkingResult.questions
    }
  }

  /**
   * 流式处理对话请求
   */
  async *processChatStream(request: ChatRequest): AsyncGenerator<string> {
    const { message, images, subject, sessionId, conversationHistory, apiKeys } = request

    // 设置API密钥
    if (apiKeys?.modelScopeApiKey) {
      ragService.setApiKey(apiKeys.modelScopeApiKey)
    }

    // 1. 获取会话历史
    let history = sessions.get(sessionId) || []
    if (conversationHistory) {
      history = conversationHistory
    }

    // 2. 构建用户消息内容（支持多模态）
    let userContent: any = message

    // 如果有图片，构建多模态内容（使用标准 OpenAI 格式）
    if (images && images.length > 0) {
      userContent = [
        { type: 'text', text: message || '请仔细观察这道题目，给出详细的解题步骤和答案' }
      ]
      // 添加图片（尝试使用 base64 格式）
      for (const imageUrl of images) {
        const base64Image = this.convertImageToBase64(imageUrl)
        console.log('[Chat] Using base64 image, length:', base64Image.length)
        userContent.push({
          type: 'image_url',
          image_url: {
            url: base64Image  // 保留完整的 data:image/png;base64, 前缀
          }
        })
      }
    }

    // 3. 检索相关知识（可选，失败不影响对话）
    let ragContext = ''
    try {
      ragContext = await ragService.buildRAGContext(message, subject)
    } catch (error) {
      console.warn('[Chat] RAG context retrieval failed, continuing without RAG:', error)
    }

    // 4. 构建消息列表
    const messages: any[] = [
      { role: 'system', content: this.systemPrompt }
    ]

    if (ragContext) {
      messages[0].content += `\n\n${ragContext}`
    }

    // 添加历史消息（过滤掉多模态格式，只保留纯文本）
    for (const msg of history) {
      // 如果 content 是数组（多模态格式），跳过或转换为纯文本
      if (Array.isArray(msg.content)) {
        // 尝试提取文本内容
        const textContent = msg.content.find((item): item is MessageContentText => item.type === 'text')
        if (textContent) {
          messages.push({
            role: msg.role,
            content: textContent.text
          })
        }
        // 如果没有文本内容，跳过这条消息
      } else if (typeof msg.content === 'string' && msg.content) {
        // 纯文本消息，直接添加
        messages.push({
          role: msg.role,
          content: msg.content
        })
      }
    }

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: userContent
    })

    // 4. 流式生成回复（传入API密钥）
    const stream = modelscopeService.chatStream({
      messages: messages,
      temperature: 0.8,
      maxTokens: 1500,
      enableThinking: false,
      apiKey: apiKeys?.modelScopeApiKey
    })

    let fullResponse = ''
    for await (const chunk of stream) {
      fullResponse += chunk
      yield chunk
    }

    // 5. 更新会话历史（保存多模态内容）
    history.push({
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: Date.now()
    })
    history.push({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: fullResponse,
      timestamp: Date.now()
    })
    sessions.set(sessionId, history.slice(-20))
  }

  /**
   * 清除会话历史
   */
  clearSession(sessionId: string): void {
    sessions.delete(sessionId)
  }

  /**
   * 获取会话历史
   */
  getSessionHistory(sessionId: string): ChatMessage[] {
    return sessions.get(sessionId) || []
  }

  /**
   * 获取所有会话ID
   */
  getAllSessionIds(): string[] {
    return Array.from(sessions.keys())
  }
}

export default new ChatService()
