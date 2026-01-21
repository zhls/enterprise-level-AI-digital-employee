import React, { useState, useRef } from 'react'
import { useChatStore } from '../../store'
import { useAvatarStore } from '../../store'

interface InputAreaProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const isProcessing = useChatStore((state) => state.isProcessing)
  const avatarState = useAvatarStore((state) => state.state)

  // 发送消息
  const handleSend = () => {
    if (input.trim() && !isProcessing) {
      onSend(input)
      setInput('')
    }
  }

  // 键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 语音输入
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音识别')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsRecording(false)
    }

    recognition.onerror = () => {
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopVoiceInput = () => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">

        {/* 语音输入按钮 */}
        <button
          onClick={isRecording ? stopVoiceInput : startVoiceInput}
          className={`p-4 rounded-full transition shrink-0 ${(
            isRecording
              ? 'bg-red-100 text-red-600 animate-pulse'
              : 'bg-gradient-to-r from-blue-100 to-teal-100 text-blue-600 hover:bg-gradient-to-r from-blue-200 to-teal-200'
          )}`}
          disabled={isProcessing}
          title="语音输入"
        >
          {isRecording ? '🛑' : '🎤'}
        </button>

        {/* 输入框 */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            isProcessing
              ? 'AI正在思考...'
              : '请描述您的健康问题'
          }
          className="flex-1 px-5 py-4 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-gradient-to-r from-blue-50 to-teal-50 focus:bg-white transition shadow-md"
          disabled={isProcessing || disabled}
        />

        {/* 发送按钮 */}
        <button
          onClick={handleSend}
          className={`px-8 py-4 rounded-xl font-medium transition shrink-0 ${
            isProcessing || !input.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:from-blue-700 hover:to-teal-600 shadow-lg shadow-blue-200'
          }`}
          disabled={isProcessing || !input.trim()}
        >
          {isProcessing ? '思考中' : '发送'}
        </button>
      </div>

      {/* 提示文字 */}
      <div className="text-center text-xs text-gray-500">
        <span>
          {isRecording
            ? '🎙️ 正在录音...'
            : avatarState === 'listen'
            ? '👂 正在倾听...'
            : '按 Enter 发送'}
        </span>
      </div>
    </div>
  )
}

export default InputArea
