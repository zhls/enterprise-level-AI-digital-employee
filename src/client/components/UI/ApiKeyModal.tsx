import React, { useState } from 'react'
import { X, Settings, Lock, CheckCircle2, Eye, EyeOff, Star, Clock, AlertCircle, Info, ArrowRight, HeartPulse } from 'lucide-react'
import { useApiKeyStore } from '../../store'

interface ApiKeyModalProps {
  onClose: () => void
}

// 内置演示密钥
const DEMO_KEYS = {
  modelScopeApiKey: 'ms-7634b763-a22e-4be8-94ca-912ff438add1',
  xmovAppId: '8ad755402aad4c62b7db0fd1d20cdbc1',
  xmovAppSecret: 'e23ecee1c318471fb1db64f5a36d36e6'
}

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid'

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose }) => {
  const [modelScopeApiKey, setModelScopeApiKey] = useState('')
  const [xmovAppId, setXmovAppId] = useState('')
  const [xmovAppSecret, setXmovAppSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle')
  const [validationMessage, setValidationMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'quick' | 'manual'>('quick')

  const setKeys = useApiKeyStore((state) => state.setKeys)

  // 从localStorage恢复已有密钥
  React.useEffect(() => {
    const storedKeys = useApiKeyStore.getState()
    setModelScopeApiKey(storedKeys.modelScopeApiKey)
    setXmovAppId(storedKeys.xmovAppId)
    setXmovAppSecret(storedKeys.xmovAppSecret)
  }, [])

  // 验证 API 密钥
  const handleValidateKey = async () => {
    if (!modelScopeApiKey.trim()) {
      setError('请先输入 API 密钥')
      return
    }

    setValidationStatus('validating')
    setValidationMessage('')
    setError('')

    try {
      const response = await fetch('/api/chat/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey: modelScopeApiKey.trim() })
      })

      const data = await response.json()

      if (data.valid) {
        setValidationStatus('valid')
        setValidationMessage(data.message || 'API 密钥验证成功')
      } else {
        setValidationStatus('invalid')
        setValidationMessage(data.error || 'API 密钥无效')
      }
    } catch (err: any) {
      setValidationStatus('invalid')
      setValidationMessage(err.message || '验证请求失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 验证输入
    if (!modelScopeApiKey.trim() || !xmovAppId.trim() || !xmovAppSecret.trim()) {
      setError('请填写所有必填项')
      return
    }

    setIsLoading(true)

    try {
      // 保存密钥到store和localStorage
      setKeys({
        modelScopeApiKey: modelScopeApiKey.trim(),
        xmovAppId: xmovAppId.trim(),
        xmovAppSecret: xmovAppSecret.trim()
      })

      // 成功后关闭对话框（不需要刷新页面）
      setIsLoading(false)
      onClose()
    } catch (err: any) {
      setError(err.message || '保存密钥失败')
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    // 允许跳过，但不保存
    onClose()
  }

  // 使用演示密钥
  const handleUseDemoKeys = () => {
    setModelScopeApiKey(DEMO_KEYS.modelScopeApiKey)
    setXmovAppId(DEMO_KEYS.xmovAppId)
    setXmovAppSecret(DEMO_KEYS.xmovAppSecret)
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden border border-blue-200">
        {/* 头部 */}
        <div className="bg-gradient-to-b from-blue-700 to-blue-900 px-8 py-6 rounded-t-2xl">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex items-center justify-center space-x-3">
              <HeartPulse className="h-8 w-8 text-teal-300" />
              <h2 className="text-2xl font-bold text-white">健康咨询服务配置</h2>
            </div>
            <p className="text-sm text-blue-100 max-w-md">
              为您的健康咨询助手配置所需服务，让智能陪伴更贴心
            </p>
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-all transform hover:scale-110"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* 主体内容 */}
        <div className="p-8 overflow-y-auto max-h-[calc(85vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 配置方式选择 */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('quick')}
                  className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all transform hover:scale-[1.02] ${
                    activeTab === 'quick'
                      ? 'bg-white text-blue-800 shadow-md border-2 border-blue-400'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>快速体验</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all transform hover:scale-[1.02] ${
                    activeTab === 'manual'
                      ? 'bg-white text-blue-800 shadow-md border-2 border-blue-400'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>手动配置</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-r-lg text-sm transition-all">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* 快速配置 */}
            {activeTab === 'quick' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center">
                  <Star className="h-10 w-10 text-white" />
                </div>
                <div className="text-center space-y-3 max-w-md">
                  <h3 className="text-xl font-semibold text-blue-900">立即开始体验</h3>
                  <p className="text-blue-700">
                    使用我们提供的演示配置，无需复杂设置即可体验完整功能
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
                    <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                      <div className="text-teal-600 font-medium">✅ 智能对话</div>
                      <div className="text-gray-600">AI健康咨询</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                      <div className="text-teal-600 font-medium">✅ 数字人交互</div>
                      <div className="text-gray-600">3D形象陪伴</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                      <div className="text-teal-600 font-medium">✅ 健康知识库</div>
                      <div className="text-gray-600">专业健康建议</div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUseDemoKeys}
                  disabled={isLoading}
                  className="w-full md:w-2/3 px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <Clock className="h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                  <span>{isLoading ? '正在配置...' : '开启健康咨询之旅'}</span>
                </button>
                <p className="text-xs text-gray-500">
                  演示配置仅供体验使用，正式环境请选择手动配置
                </p>
              </div>
            )}

            {/* 手动配置 */}
            {activeTab === 'manual' && (
              <div className="space-y-6">
                {/* 服务配置说明 */}
                <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-5 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Info className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">配置说明</h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    请根据您的实际需求配置以下服务，所有字段均为必填项
                  </p>
                </div>

                {/* 智能对话服务 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                      <Lock className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-blue-900">智能对话服务</h3>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          魔搭 ModelScope API Key
                        </label>
                        <input
                          type="password"
                          value={modelScopeApiKey}
                          onChange={(e) => {
                            setModelScopeApiKey(e.target.value)
                            if (validationStatus !== 'idle') {
                              setValidationStatus('idle')
                              setValidationMessage('')
                            }
                          }}
                          placeholder="请输入您的魔搭API密钥"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition
                            ${validationStatus === 'valid'
                              ? 'border-green-300 bg-green-50'
                              : validationStatus === 'invalid'
                              ? 'border-red-300 bg-red-50'
                              : 'border-blue-200'}`}
                          disabled={isLoading}
                        />
                      </div>

                      {/* 验证按钮和状态 */}
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={handleValidateKey}
                          disabled={isLoading || validationStatus === 'validating' || !modelScopeApiKey.trim()}
                          className={`w-full text-sm font-medium py-2 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed
                            ${validationStatus === 'valid'
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : validationStatus === 'invalid'
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : validationStatus === 'validating'
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'}`}
                        >
                          {validationStatus === 'validating' ? (
                            <div className="flex items-center justify-center space-x-2">
                              <Clock className="h-4 w-4 animate-spin" />
                              <span>验证中...</span>
                            </div>
                          ) : validationStatus === 'valid' ? (
                            <div className="flex items-center justify-center space-x-2">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>验证通过</span>
                            </div>
                          ) : validationStatus === 'invalid' ? (
                            <div className="flex items-center justify-center space-x-2">
                              <AlertCircle className="h-4 w-4" />
                              <span>验证失败</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <Lock className="h-4 w-4" />
                              <span>验证密钥</span>
                            </div>
                          )}
                        </button>

                        {validationMessage && (
                          <div className={`text-xs px-3 py-2 rounded-lg flex items-center space-x-2
                            ${validationStatus === 'valid'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            <span>{validationStatus === 'valid' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}</span>
                            <span>{validationMessage}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 数字人服务 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-teal-100 p-2 rounded-lg text-teal-700">
                      <Settings className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-blue-900">数字人服务</h3>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm">
                    <div className="space-y-4">
                      {/* 应用ID */}
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          魔珐星云 App ID
                        </label>
                        <input
                          type="text"
                          value={xmovAppId}
                          onChange={(e) => setXmovAppId(e.target.value)}
                          placeholder="请输入您的魔珐星云App ID"
                          className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                          disabled={isLoading}
                        />
                      </div>

                      {/* 应用密钥 */}
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          魔珐星云 App Secret
                        </label>
                        <div className="relative">
                          <input
                            type={showSecret ? 'text' : 'password'}
                            value={xmovAppSecret}
                            onChange={(e) => setXmovAppSecret(e.target.value)}
                            placeholder="请输入您的魔珐星云App Secret"
                            className="w-full px-4 py-3 pr-12 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            disabled={isLoading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition-colors"
                            title={showSecret ? "隐藏" : "显示"}
                          >
                            {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 服务保障说明 */}
                <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <Lock className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">服务保障</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-blue-700">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>所有配置信息仅存储在本地浏览器</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-700">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>严格保护您的隐私和数据安全</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-700">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>随时可修改或清除配置</span>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <Clock className="h-5 w-5 animate-spin" />
                        <span>配置中...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        <span>完成配置</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={isLoading}
                    className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    暂不配置
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default ApiKeyModal