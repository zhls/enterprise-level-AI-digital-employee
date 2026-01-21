import { useEffect, useRef, useState } from 'react'
import { useChatStore, useAvatarStore, useApiKeyStore } from './store'
import { chatService } from './services'
import { AvatarContainer } from './components/Avatar'
import { ChatBox, InputArea } from './components/Chat'
import { ApiKeyModal } from './components/UI'
import { AdminPanel } from './components/Admin'

function App() {
  const controllerRef = useRef<any>(null)

  // Admin Panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  // Quick Actions state
  const quickActionsButtonRef = useRef<HTMLButtonElement>(null)
  const [showQuickActions, setShowQuickActions] = useState(false)

  // Chat Store
  const {
    messages,
    addMessage,
    setProcessing,
    currentResponse,
    setCurrentResponse,
    appendCurrentResponse,
    clearMessages,
    getConversationHistory,
    sessionId,
    setSessionId
  } = useChatStore()

  // Avatar Store
  const { setState: setAvatarState } = useAvatarStore()

  // API Key Management
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const { hasKeys } = useApiKeyStore()

  // 检查是否需要显示密钥输入对话框
  useEffect(() => {
    if (!hasKeys) {
      setShowApiKeyModal(true)
    }
  }, [hasKeys])

  // 初始化会话
  useEffect(() => {
    if (!sessionId) {
      setSessionId(`session_${Date.now()}`)
    }
  }, [])

  // 同步数字人控制器引用 - 使用轮询确保获取到控制器
  useEffect(() => {
    const checkController = () => {
      const controller = (window as any).avatarController
      if (controller && controller !== controllerRef.current) {
        controllerRef.current = controller
        console.log('[App] Avatar controller synced:', controller)
      }
    }

    // 立即检查一次
    checkController()

    // 轮询检查控制器是否可用（每秒检查一次，最多检查10秒）
    const intervals: NodeJS.Timeout[] = []
    for (let i = 0; i < 10; i++) {
      const timeout = setTimeout(checkController, i * 1000)
      intervals.push(timeout)
    }

    return () => {
      intervals.forEach(clearTimeout)
    }
  }, [])

  // 处理消息发送
  const handleSendMessage = async (text: string) => {
    // 确保控制器是最新的
    const controller = (window as any).avatarController
    if (controller && controller !== controllerRef.current) {
      controllerRef.current = controller
      console.log('[App] Avatar controller updated before send:', controller)
    }
    // 获取对话历史（在添加当前消息之前获取）
    const history = getConversationHistory()

    // 添加用户消息到本地状态
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    })

    setProcessing(true)
    setCurrentResponse('')

    // 数字人进入倾听状态
    setAvatarState('listen')
    controllerRef.current?.setListen()

    // 数字人进入思考状态
    setAvatarState('think')
    controllerRef.current?.setThink()

    // 创建文本流收集器，用于传递给数字人
    let fullResponse = ''
    let isFirstChunk = true

    // 流式对话
    await chatService.sendMessageStream(
      {
        message: text,
        sessionId,
        conversationHistory: history
      },
      // onChunk - 实时更新文本并传递给数字人
      (chunk) => {
        if (isFirstChunk) {
          isFirstChunk = false
          // 第一个chunk到达，数字人开始说话
          setAvatarState('speak')
        }
        fullResponse += chunk
        appendCurrentResponse(chunk)
      },
      // onComplete
      (finalResponse) => {
        // 添加助手消息
        addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: finalResponse,
          timestamp: Date.now()
        })

        setCurrentResponse('')
        setProcessing(false)

        // 直接调用数字人说话方法，一次性说完整回复
        if (controllerRef.current && finalResponse) {
          setAvatarState('speak')
          controllerRef.current.speak({
            text: finalResponse,
            isStart: true,
            isEnd: true
          })
        }

        // 等待数字人说话完成（模拟）
        setTimeout(() => {
          setAvatarState('interactive_idle')
        }, finalResponse.length * 100) // 估算说话时间
      },
      // onError
      () => {
        addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '系统暂时无法响应，请稍后再试',
          timestamp: Date.now()
        })
        setCurrentResponse('')
        setProcessing(false)
        setAvatarState('idle')
      }
    )
  }

  // 重置对话
  const handleClearChat = () => {
    clearMessages()
    chatService.clearSession(sessionId)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-teal-50 overflow-hidden">
      {/* API Key Modal */}
      {showApiKeyModal && (
        <ApiKeyModal onClose={() => setShowApiKeyModal(false)} />
      )}

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {/* 顶部导航 - 健康咨询主题风格 */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-xl flex-shrink-0">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：标题 */}
            <div className="flex items-center space-x-3">
              <span className="text-2xl">👨‍⚕️</span>
              <div>
                <h1 className="text-xl font-bold">健康咨询助手</h1>
                <p className="text-sm text-blue-200 hidden sm:block">专业的健康知识普及与咨询服务</p>
              </div>
            </div>
            
            {/* 中间：统计数据 */}
            <div className="hidden md:flex items-center space-x-6 overflow-x-auto">
              {/* 咨询次数 */}
              <div className="flex items-center space-x-2">
                <span className="text-lg">💬</span>
                <span className="text-sm font-medium text-blue-100">咨询次数：</span>
                <span className="text-lg font-bold">{messages.length}</span>
              </div>
              
              {/* 健康建议 */}
              <div className="flex items-center space-x-2">
                <span className="text-lg">📊</span>
                <span className="text-sm font-medium text-blue-100">健康建议：</span>
                <span className="text-lg font-bold">{messages.filter(m => m.role === 'assistant').length}</span>
              </div>
              
              {/* 满意度 */}
              <div className="flex items-center space-x-2">
                <span className="text-lg">✅</span>
                <span className="text-sm font-medium text-blue-100">满意度：</span>
                <span className="text-lg font-bold">98%</span>
              </div>
            </div>
            
            {/* 右侧：操作按钮 */}
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowAdminPanel(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium rounded-full transition-all flex items-center space-x-2"
              >
                <span>📚</span>
                <span className="hidden sm:inline">知识库管理</span>
              </button>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium rounded-full transition-all flex items-center space-x-2"
              >
                <span>⚙️</span>
                <span className="hidden sm:inline">系统设置</span>
              </button>
              <button
                onClick={handleClearChat}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium rounded-full transition-all flex items-center space-x-2"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">重置对话</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 - 健康咨询主题布局 */}
      <main className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* 左侧：数字人区域 - 占1列，突出显示 */}
          <div className="lg:col-span-1 h-full">
            <div className="h-full bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              {/* 数字人岗位信息 */}
              <div className="bg-gradient-to-r from-blue-100 to-teal-100 px-6 py-4 border-b border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">健康咨询专员</h2>
                    <p className="text-sm text-gray-600">专业健康顾问，非医疗诊断</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">
                      在线
                    </span>
                  </div>
                </div>
              </div>
              {/* 数字人容器 */}
              <div className="h-[calc(100%-80px)]">
                <AvatarContainer
                  onSpeakingStart={() => setAvatarState('speak')}
                  onSpeakingEnd={() => setAvatarState('interactive_idle')}
                  onWidgetEvent={(widget) => console.log('Widget:', widget)}
                />
              </div>
              {/* 数字人职责边界 */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-xs text-gray-600">
                <p>⚠️ 本服务为健康咨询，非医疗诊断</p>
              </div>
            </div>
          </div>

          {/* 右侧：咨询区域 - 占2列 */}
          <div className="lg:col-span-2 flex flex-col gap-6 h-full min-h-0 overflow-hidden">

            {/* 咨询记录 */}
            <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-100 to-teal-100 px-6 py-4 border-b border-blue-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">咨询中心</h2>
                <div className="flex items-center space-x-3">
                  <button
                    ref={quickActionsButtonRef}
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    className="flex items-center space-x-2 px-4 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-full shadow-sm hover:shadow-md transition-all transform hover:scale-105 active:scale-95"
                    title="快捷咨询"
                  >
                    <span>⚡</span>
                    <span>快捷咨询</span>
                  </button>
                </div>
              </div>
              <div className="p-6 h-[calc(100%-80px)] overflow-auto">
                <ChatBox
                  messages={messages}
                  currentResponse={currentResponse}
                  isProcessing={useChatStore.getState().isProcessing}
                  onQuickQuestion={handleSendMessage}
                  quickActionsButtonRef={quickActionsButtonRef}
                  showQuickActions={showQuickActions}
                  setShowQuickActions={setShowQuickActions}
                />
              </div>
            </div>

            {/* 输入框 */}
            <div className="flex-shrink-0 bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">您的健康问题</h3>
              <InputArea onSend={handleSendMessage} />
            </div>
          </div>
        </div>
      </main>

      {/* 底部信息栏 */}
      <footer className="bg-gradient-to-r from-blue-900 to-teal-900 text-white shadow-inner flex-shrink-0">
        <div className="max-w-full mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span>健康咨询助手 © 2026</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">专业、科学、个性化的健康指导</span>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                <span className="text-sm">24/7 服务中</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App