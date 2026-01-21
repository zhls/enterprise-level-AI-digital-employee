import React, { useState, useEffect, useRef } from 'react'

interface QuickActionsPopoverProps {
  buttonRef: React.RefObject<HTMLButtonElement>
  onSelect: (question: string) => void
}

interface QuickQuestion {
  q: string
  icon: string
  category: string
}

export const QuickActionsPopover: React.FC<QuickActionsPopoverProps> = ({
  buttonRef,
  onSelect
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const popoverRef = useRef<HTMLDivElement>(null)

  // 快捷咨询列表，按分类组织
  const quickQuestions: QuickQuestion[] = [
    { q: '如何通过饮食改善失眠？', icon: '😴', category: '睡眠调理' },
    { q: '推荐一份适合上班族的健康食谱', icon: '🍱', category: '营养膳食' },
    { q: '适合办公室的简单健身动作', icon: '🏢', category: '运动健身' },
    { q: '如何缓解工作压力？', icon: '😌', category: '心理健康' },
    { q: '高血压患者的日常注意事项', icon: '🩺', category: '慢病管理' },
    { q: '如何提高免疫力？', icon: '🛡️', category: '健康提升' },
    { q: '什么是BMI？如何计算？', icon: '⚖️', category: '健康知识' },
    { q: '推荐一份适合老年人的运动计划', icon: '👴', category: '运动健身' },
    { q: '常见维生素缺乏的症状', icon: '💊', category: '营养膳食' },
    { q: '如何正确进行口腔护理？', icon: '🦷', category: '日常保健' },
    { q: '如何预防感冒？', icon: '🤧', category: '疾病预防' },
  ]

  // 计算弹出框位置
  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const containerRect = buttonRef.current.closest('.border')?.getBoundingClientRect()

      // 相对于容器定位，确保弹框右边界与按钮右边界对齐
      if (containerRect) {
        setPosition({
          top: rect.bottom - containerRect.top - 70, // 上边紧挨着按钮下面，只有2px的间距
          left: rect.right - containerRect.left - 345 // 320px = w-80，右边与按钮右边对齐
        })
      }
    }
  }, [buttonRef])

  // 按分类分组
  const groupedQuestions = quickQuestions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = []
    }
    acc[question.category].push(question)
    return acc
  }, {} as Record<string, QuickQuestion[]>)

  // 获取分类列表
  const categories = Object.keys(groupedQuestions)

  return (
    <div
      ref={popoverRef}
      className="quick-actions-popover absolute z-50 w-80 bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: '450px'
      }}
    >
      {/* 标题栏 */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-5 py-4 border-b border-blue-200">
        <h3 className="text-base font-bold text-white flex items-center">
          <span className="mr-2 text-xl">⚡</span>
          快捷咨询
        </h3>
        <p className="text-xs text-blue-100 mt-1">选择一个问题开始健康咨询</p>
      </div>

      {/* 问题列表 */}
      <div className="overflow-y-auto max-h-96">
        {categories.map((category) => (
          <div key={category} className="border-b border-blue-50">
            {/* 分类标题 */}
            <div className="px-5 py-3 bg-blue-50/80">
              <h4 className="text-sm font-semibold text-blue-800 capitalize">{category}</h4>
            </div>
            
            {/* 分类下的问题 */}
            <div className="px-3">
              {groupedQuestions[category].map((item, index) => (
                <button
                  key={`${category}-${index}`}
                  onClick={() => onSelect(item.q)}
                  className="w-full text-left px-4 py-3 my-1.5 rounded-xl hover:bg-gradient-to-r from-blue-50 to-teal-50 transition-all transform hover:scale-[1.01] group"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-xl flex-shrink-0 mt-0.5 text-blue-600">{item.icon}</span>
                    <span className="text-sm text-gray-700 group-hover:text-blue-700 leading-relaxed flex-1">
                      {item.q}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-teal-50 border-t border-blue-100">
        <div className="flex items-center justify-center text-xs text-blue-600 font-medium">
          <span className="mr-2">💡</span>
          点击任意问题开始咨询
        </div>
      </div>
    </div>
  )
}

export default QuickActionsPopover
