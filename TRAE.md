# 健康咨询助手：专业的健康知识普及与咨询服务

## 项目概述

**赛道**: AI 健康咨询
**项目名称**: 健康咨询助手：专业的健康知识普及与咨询服务
**项目描述**: 通过AI数字人进行健康咨询，结合专业健康知识库和精准的健康指导，为用户提供科学、个性化的健康建议。

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18.x + TypeScript |
| 构建工具 | Vite 5.x |
| 样式方案 | TailwindCSS |
| 状态管理 | Zustand |
| 后端框架 | Node.js + Express + TypeScript |
| 数字人SDK | 魔珐星云具身驱动SDK (0.1.0-alpha.45) |
| AI服务 | 魔搭社区 ModelScope |
| AI模型 | deepseek-ai/DeepSeek-V3 |
| 嵌入模型 | Qwen/Qwen3-Embedding-8B |

## 项目结构

```
enterprise-level-AI-digital-employee/
├── src/                            # 源代码目录
│   ├── client/                     # React 前端
│   │   ├── components/             # 组件
│   │   │   ├── Avatar/             # 数字人组件
│   │   │   │   ├── AvatarContainer.tsx # 数字人容器
│   │   │   │   ├── AvatarController.ts # 数字人控制器
│   │   │   │   └── index.ts
│   │   │   ├── Chat/               # 对话组件
│   │   │   │   ├── ChatBox.tsx        # 对话框
│   │   │   │   ├── QuickActionsPopover.tsx # 快捷提问弹出框
│   │   │   │   ├── InputArea.tsx      # 输入区
│   │   │   │   └── index.ts
│   │   │   ├── Admin/              # 管理员面板
│   │   │   │   ├── AdminPanel.tsx     # 管理员面板
│   │   │   │   └── index.ts
│   │   │   └── UI/                 # 通用UI组件
│   │   │       ├── ApiKeyModal.tsx   # API密钥配置
│   │   │       └── index.ts
│   │   ├── store/                  # Zustand 状态管理
│   │   │   ├── useChatStore.ts        # 对话状态
│   │   │   ├── useAvatarStore.ts      # 数字人状态
│   │   │   ├── useApiKeyStore.ts       # API密钥状态
│   │   │   └── index.ts
│   │   ├── services/               # API 服务
│   │   │   ├── chatService.ts        # 对话服务
│   │   │   └── index.ts
│   │   ├── App.tsx                 # 应用入口
│   │   └── main.tsx                # React 挂载
│   ├── server/                     # Express 后端
│   │   ├── routes/                 # API 路由
│   │   │   ├── chatRoutes.ts         # 对话路由
│   │   │   ├── knowledgeRoutes.ts    # 知识库路由
│   │   │   ├── avatarRoutes.ts       # 数字人路由
│   │   │   └── index.ts
│   │   ├── services/               # 业务服务
│   │   │   ├── ChatService.ts        # 对话处理
│   │   │   ├── RAGService.ts         # RAG 检索服务
│   │   │   ├── ModelScopeService.ts  # AI模型服务
│   │   │   ├── KnowledgeService.ts   # 知识库管理
│   │   │   └── index.ts
│   │   └── app.ts                  # Express 应用
│   └── shared/                     # 前后端共享
│       ├── types/                  # 共享类型
│       │   └── index.ts
│       └── constants/              # 常量
│           └── index.ts
├── data/                          # 数据文件
│   └── knowledge/                 # 知识库数据
│       └── health.json            # 健康知识库
├── public/                        # 静态资源
├── index.html                     # HTML入口
├── package.json                   # 依赖配置
├── vite.config.ts                # Vite 配置
├── tsconfig.json                 # TypeScript 配置
├── tsconfig.node.json            # Node TypeScript 配置
├── .env.example                  # 环境变量模板
└── README.md                     # 项目说明
```

## 核心功能

### 1. 健康咨询服务
- 支持多健康领域：营养膳食、运动健身、亚健康调理等
- 专业健康知识普及
- 个性化健康建议
- 基于知识库的准确内容

### 2. AI数字人交互
- 3D数字人实时对话
- 流式响应，即时反馈
- 语音播报（一次性说完，无停顿）
- 数字人状态同步

### 3. 快捷咨询
- 浮动弹出框展示常用健康问题
- 按健康领域分类组织
- 一键发送，快速开始对话

### 4. 对话体验
- 支持文本对话
- 支持语音输入
- 自动滚动优化
- 滚动到底部按钮

### 5. 健康知识库管理
- 支持上传健康知识文档
- 健康知识分类管理
- 知识库检索和更新
- 基于RAG的精准知识匹配

## 知识库数据结构

```json
{
  "id": "health_nutrition_001",
  "category": "health",
  "subject": "健康咨询",
  "topic": "日常营养膳食建议",
  "theorem": "均衡饮食原则",
  "difficulty": "基础",

  "description": "均衡饮食是指食物种类齐全、数量充足、比例适当，能够满足人体正常生理需求的饮食方式。",
  "formula": "蛋白质10-15% + 脂肪20-30% + 碳水化合物55-65% = 均衡饮食",
  "formulaLatex": "蛋白质10-15\% + 脂肪20-30\% + 碳水化合物55-65\% = 均衡饮食",

  "proofSteps": [
    {
      "step": 1,
      "title": "蛋白质的重要性",
      "content": "蛋白质是人体细胞的主要组成部分，参与身体各种生理功能"
    }
  ],

  "examples": [
    {
      "problem": "如何实现均衡饮食？",
      "solution": "1. 每天摄入谷薯类250-400g\n2. 蛋白质类120-200g\n3. 蔬菜300-500g\n4. 水果200-350g\n5. 油脂25-30g"
    }
  ],

  "commonMistakes": [
    {
      "mistake": "饮食单一",
      "correction": "每天应摄入至少12种食物，每周至少25种食物"
    }
  ],

  "socraticQuestions": [
    "你平时的饮食结构是怎样的？",
    "你知道自己每天应该摄入多少蛋白质吗？"
  ],

  "keywords": ["均衡饮食", "营养", "健康", "蛋白质", "碳水化合物", "脂肪"]
}
```

## API 设计

### POST /api/chat/stream
流式对话接口（SSE）

```typescript
interface ChatRequest {
  message: string;
  sessionId: string;
  conversationHistory?: ChatMessage[];
  apiKeys?: {
    modelScopeApiKey?: string;
    xmovAppId?: string;
    xmovAppSecret?: string;
  };
}
```

## 环境变量

```bash
# 前端环境变量
VITE_API_BASE_URL=/api

# 后端环境变量
MODELSCOPE_API_KEY=<魔搭API密钥>
MODELSCOPE_MODEL=deepseek-ai/DeepSeek-V3
EMBEDDING_MODEL=Qwen/Qwen3-Embedding-8B
XMOV_APP_ID=<魔珐星云应用ID>
XMOV_APP_SECRET=<魔珐星云应用密钥>
PORT=5177
```

## 开发计划

### Phase 1: 基础架构 ✅
- [x] 项目结构初始化
- [x] 前后端基础框架搭建
- [x] Vite 配置和开发环境
- [x] 数字人 SDK 集成
- [x] 基础 UI 组件

### Phase 2: 对话系统 ✅
- [x] 对话 API 实现
- [x] SSE 流式响应
- [x] 消息状态管理
- [x] 数字人语音同步

### Phase 3: 知识库 ✅
- [x] 健康知识库数据结构设计
- [x] RAG 检索服务
- [x] 语义搜索实现
- [x] 健康知识分类

### Phase 4: 体验优化 ✅
- [x] 快捷提问浮动框
- [x] 自动滚动优化
- [x] 数字人一次性说话
- [x] 网页标签图标
- [x] 管理员面板

## 开发指南

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 注意事项

1. 确保所有环境变量正确配置
2. 数字人 SDK 需要有效的魔珐星云账号
3. AI 调用需要魔搭社区的 API Key
4. 开发时注意跨域配置
5. 生产环境需配置 HTTPS

## 界面说明

### 顶部导航
- **健康咨询助手**：应用标题和描述
- **统计数据**：咨询次数、健康建议、满意度
- **操作按钮**：知识库管理、系统配置、清空对话

### 对话记录区域
- **咨询中心**：显示对话记录
- **快捷咨询**：浮动弹出框，选择常用健康问题
- **滚动到底部**：向上滚动时显示的浮动按钮

### 数字人状态
- offline：离线
- listen：倾听
- think：思考
- speak：说话
- idle：待机
- interactive_idle：互动待机

## License

MIT
