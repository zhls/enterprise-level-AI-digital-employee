import React, { useState, useEffect } from 'react'

interface UploadedDocument {
  id: string
  filename: string
  uploadTime: number
  category: string
}

interface Category {
  value: string
  label: string
  icon: string
}

const HEALTH_CATEGORIES: Category[] = [
  { value: 'nutrition', label: '日常营养膳食建议', icon: '🥗' },
  { value: 'fitness', label: '健身计划指导', icon: '🏋️‍♂️' },
  { value: 'subhealth', label: '亚健康调理', icon: '💆‍♀️' },
]

interface AdminPanelProps {
  onClose?: () => void
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'documents' | 'guide'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [category, setCategory] = useState('nutrition')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 加载已上传文档列表
  const loadDocuments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/knowledge/documents/list')
      const data = await response.json()
      if (data.success) {
        setDocuments(data.data)
      }
    } catch (error) {
      console.error('Load documents error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // 弹窗打开时加载文档列表，确保资源库数量显示正确
    loadDocuments()
  }, [])

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadResult(null)
    }
  }

  // 上传文档
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadResult({ success: false, message: '请选择文件' })
      return
    }

    setIsUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('document', selectedFile)
      formData.append('category', category)

      const response = await fetch('/api/knowledge/upload-document', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setUploadResult({ success: true, message: result.message || '上传成功！' })
        setSelectedFile(null)
        // 重置文件输入
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        // 上传成功后重新加载文档列表，确保资源库数量正确
        loadDocuments()
      } else {
        setUploadResult({ success: false, message: result.error?.message || '上传失败' })
      }
    } catch (error: any) {
      setUploadResult({ success: false, message: error.message || '网络错误' })
    } finally {
      setIsUploading(false)
    }
  }

  // 删除文档
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个文档吗？')) return

    try {
      const response = await fetch(`/api/knowledge/documents/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setDocuments(documents.filter(doc => doc.id !== id))
      } else {
        alert(result.error?.message || '删除失败')
      }
    } catch (error: any) {
      alert(error.message || '网络错误')
    }
  }

  // 获取健康知识分类标签
  const getCategoryLabel = (categoryValue: string) => {
    const cat = HEALTH_CATEGORIES.find(c => c.value === categoryValue)
    return cat ? `${cat.icon} ${cat.label}` : categoryValue
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-blue-200">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-12 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center space-x-3">
                <span className="text-2xl">📚</span>
                <span>健康咨询知识库管理</span>
              </h2>
              <p className="text-sm text-blue-100 mt-1">高效管理健康资源，助力智能健康咨询系统</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-3 rounded-full hover:bg-white hover:bg-opacity-20 transition-all transform hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 标签页切换 */}
        <div className="bg-blue-50/80 border-b border-blue-200">
          <div className="flex px-12">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-8 py-4 font-semibold transition-all relative ${activeTab === 'upload' ? 'text-blue-800' : 'text-blue-600 hover:text-blue-700'}`}
            >
              <div className="flex items-center space-x-3">
                <span>📥</span>
                <span>资源上传</span>
              </div>
              {activeTab === 'upload' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-teal-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-8 py-4 font-semibold transition-all relative ${activeTab === 'documents' ? 'text-blue-800' : 'text-blue-600 hover:text-blue-700'}`}
            >
              <div className="flex items-center space-x-3">
                <span>📋</span>
                <span>资源库 ({documents.length})</span>
              </div>
              {activeTab === 'documents' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-teal-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-8 py-4 font-semibold transition-all relative ${activeTab === 'guide' ? 'text-blue-800' : 'text-blue-600 hover:text-blue-700'}`}
            >
              <div className="flex items-center space-x-3">
                <span>💡</span>
                <span>操作指南</span>
              </div>
              {activeTab === 'guide' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-teal-600 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
          {activeTab === 'upload' ? (
            <div className="space-y-8">
              {/* 上传卡片 */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm">
                {/* <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-blue-800 mb-2">上传健康资源</h3>
                  <p className="text-sm text-blue-600">选择文件并设置相关信息，构建智能健康知识库</p>
                </div> */}
                
                <div className="space-y-8">
                  {/* 文件选择区域 - 新布局 */}
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 border border-blue-100 shadow-md">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      {/* 左侧上传区域 */}
                      <div className="md:w-1/3 w-full text-center">
                        <div className="bg-blue-100 rounded-2xl p-6 mb-5">
                          <div className="text-6xl mb-4">📄</div>
                          <h3 className="text-lg font-semibold text-blue-800 mb-2">选择健康资料</h3>
                          <p className="text-sm text-blue-600 mb-5">支持 TXT、MD、PDF 格式文件</p>
                          <label
                            htmlFor="file-input"
                            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-medium rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] cursor-pointer"
                          >
                            <span className="flex items-center justify-center space-x-2">
                              <span>📥</span>
                              <span>浏览文件</span>
                            </span>
                          </label>
                          <input
                            id="file-input"
                            type="file"
                            accept=".txt,.md,.pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </div>
                      </div>
                      
                      {/* 右侧文件预览区域 */}
                      <div className="md:w-2/3 w-full">
                        {selectedFile ? (
                          <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-sm">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="text-4xl">📑</div>
                              <div>
                                <h4 className="text-xl font-bold text-blue-900">{selectedFile.name}</h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                  </span>
                                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    {selectedFile.type || '文件'}
                                  </span>
                                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                    已选择
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-blue-600">
                              文件将被上传到健康咨询知识库，用于智能健康咨询系统的内容解析和回答生成。
                            </p>
                          </div>
                        ) : (
                          <div className="bg-blue-50 rounded-2xl p-10 border-2 border-dashed border-blue-300 flex flex-col items-center justify-center">
                            <div className="text-5xl mb-4">📁</div>
                            <h4 className="text-lg font-medium text-blue-700 mb-2">等待选择文件</h4>
                            <p className="text-sm text-blue-500 text-center">
                              选择健康资料文件后，文件信息将显示在此处<br />
                              支持 TXT、MD、PDF 格式
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 健康知识分类 - 新布局 */}
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 border border-blue-100 shadow-md">
                    <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center space-x-3">
                      <span className="bg-blue-100 p-2 rounded-xl text-blue-700">🏷️</span>
                      <span>健康知识分类</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {HEALTH_CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setCategory(cat.value)}
                          className={`p-5 rounded-2xl font-semibold transition-all transform hover:scale-105 hover:shadow-lg ${ 
                            category === cat.value 
                              ? 'bg-gradient-to-br from-blue-600 to-teal-600 text-white border-2 border-blue-400' 
                              : 'bg-white border-2 border-blue-200 text-blue-800 hover:border-blue-400' 
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className="text-3xl mb-3">{cat.icon}</div>
                            <div className="text-base">{cat.label}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 上传结果消息 */}
                  {uploadResult && (
                    <div
                      className={`p-5 rounded-2xl border transition-all transform hover:scale-[1.01] shadow-sm ${ 
                        uploadResult.success 
                          ? 'bg-green-50 text-green-800 border-green-300' 
                          : 'bg-red-50 text-red-800 border-red-300' 
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <span className="text-2xl">{uploadResult.success ? '🎉' : '⚠️'}</span>
                        <span className="font-medium text-lg">{uploadResult.message}</span>
                      </div>
                    </div>
                  )}

                  {/* 上传按钮 */}
                  <div className="pt-3">
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || isUploading}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold text-lg rounded-2xl hover:opacity-95 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>正在上传...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🚀</span>
                          <span>上传到健康知识库</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : activeTab === 'guide' ? (
            <div className="space-y-6">
              {/* 操作指南内容 */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 border border-blue-100 shadow-md">
                {/* <h3 className="text-2xl font-bold text-blue-900 mb-8 text-center">
                  <span className="inline-block p-3 bg-blue-100 text-blue-700 rounded-full mr-3">
                    💡
                  </span>
                  健康咨询知识库操作指南
                </h3> */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-sm hover:shadow-lg transition-all transform hover:scale-[1.02]">
                    <div className="text-4xl mb-5 text-blue-700 text-center">📄</div>
                    <h4 className="text-lg font-semibold text-blue-900 mb-4 text-center">支持格式</h4>
                    <p className="text-sm text-blue-700 text-center">
                      TXT、MD、PDF 格式文件，便于系统解析和展示健康知识
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-sm hover:shadow-lg transition-all transform hover:scale-[1.02]">
                    <div className="text-4xl mb-5 text-blue-700 text-center">📝</div>
                    <h4 className="text-lg font-semibold text-blue-900 mb-4 text-center">内容规范</h4>
                    <p className="text-sm text-blue-700 text-center">
                      第一行为标题，后续为内容，建议按主题分类组织健康知识
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-sm hover:shadow-lg transition-all transform hover:scale-[1.02]">
                    <div className="text-4xl mb-5 text-blue-700 text-center">🎯</div>
                    <h4 className="text-lg font-semibold text-blue-900 mb-4 text-center">最佳实践</h4>
                    <p className="text-sm text-blue-700 text-center">
                      选择合适的健康知识分类，确保内容准确、专业、易于理解
                    </p>
                  </div>
                </div>
                
                {/* 详细指南 */}
                <div className="mt-10 bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-sm">
                  <h4 className="text-xl font-bold text-blue-900 mb-6 text-center">详细上传步骤</h4>
                  <div className="space-y-5">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                      <div>
                        <h5 className="font-semibold text-blue-800 mb-1">选择健康资料文件</h5>
                        <p className="text-sm text-blue-600">点击"浏览文件"按钮，选择您要上传的健康知识文件，支持 TXT、MD、PDF 格式。</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                      <div>
                        <h5 className="font-semibold text-blue-800 mb-1">选择健康知识分类</h5>
                        <p className="text-sm text-blue-600">根据文件内容，选择合适的健康知识分类：日常营养膳食建议、健身计划指导或亚健康调理。</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                      <div>
                        <h5 className="font-semibold text-blue-800 mb-1">上传文件</h5>
                        <p className="text-sm text-blue-600">点击"上传到健康知识库"按钮，系统将自动处理并添加到知识库中。</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                      <div>
                        <h5 className="font-semibold text-blue-800 mb-1">查看和管理</h5>
                        <p className="text-sm text-blue-600">在"资源库"标签页中，您可以查看、管理和删除已上传的健康知识文件。</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 文档列表标题 */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-blue-800 mb-2">知识库资源</h3>
                <p className="text-sm text-blue-600">管理已上传的健康资料，优化知识库结构</p>
              </div>

              {/* 文档列表 */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100">
                {isLoading ? (
                  <div className="py-10 flex justify-center">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="text-blue-700 font-medium mb-2">知识库为空</p>
                    <p className="text-sm text-blue-500">上传健康资源后，它们会显示在这里</p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-medium rounded-lg hover:opacity-90 transition-all"
                    >
                      立即上传
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white p-5 rounded-2xl border-2 border-blue-200 shadow-sm hover:shadow-lg transition-all transform hover:scale-[1.01]"
                      >
                        <div className="flex items-start">
                          <div className="p-3 bg-blue-100 rounded-xl text-blue-700 mr-4">
                            📄
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-blue-900 text-lg">{doc.filename}</h4>
                              <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all transform hover:scale-110"
                                title="删除文档"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="flex items-center bg-blue-50 px-3 py-1 rounded-full text-blue-800 font-medium">
                                <span className="mr-2">🏷️</span>
                                {getCategoryLabel(doc.category)}
                              </span>
                              <span className="flex items-center bg-gray-50 px-3 py-1 rounded-full text-gray-800 font-medium">
                                <span className="mr-2">📅</span>
                                {new Date(doc.uploadTime).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
