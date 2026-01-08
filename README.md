# 健康咨询助手：智能健康顾问系统

基于魔珐星云3D数字人技术的健康咨询助手系统，能够实时解答用户健康咨询问题，提供专业的健康建议和指导。

## 功能特性

### 核心功能
- 💬 **智能健康对话**：AI助手根据用户问题提供专业健康建议
- � **语音播报**：数字人自动播报健康建议，支持语音交互
- � **3D数字人**：魔珐星云3D数字人提供拟人化健康咨询服务
- 🎤 **语音输入**：支持语音提问，解放双手
- � **快捷问题**：提供常见健康问题快速访问
- 🌡️ **健康监测**：基于用户描述的健康状况提供分析
- ⚠️ **健康预警**：智能检测潜在健康风险并提供预警

### UI特性
- 🎭 **数字人展示**：屏幕中央20%区域，圆形渐变背景
- 📺 **大屏适配**：1920x1080设计，自动缩放
- 💬 **对话界面**：直观的聊天界面，支持语音和文字输入
- 🎨 **响应式设计**：适配不同屏幕尺寸
- 🔄 **视图切换**：健康咨询、数字人展示等多种视图模式

## 技术栈

### 前端
- **框架**：React 18 + TypeScript
- **构建**：Vite 5.x
- **状态管理**：Zustand
- **样式**：TailwindCSS
- **HTTP**：Axios
- **语音识别**：Web Speech API

### 后端
- **运行时**：Node.js 18.x
- **框架**：Express + TypeScript
- **AI模型**：魔搭社区 DeepSeek-V3
- **对话服务**：流式对话生成

### 数字人
- **SDK**：魔珐星云具身驱动SDK v0.1.0-alpha.45
- **功能**：语音合成、动作控制、状态监控

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5177

### 构建生产版本

```bash
npm run build
npm start
```

## 密钥配置

首次访问时需要配置以下密钥（存储在浏览器 localStorage）：

| 密钥 | 获取方式 | 用途 |
|------|----------|------|
| 魔搭社区 API 密钥 | [魔搭社区](https://modelscope.cn) 创建新令牌 | AI数据生成和对话 |
| 魔珐星云 App ID | [星云控制台](https://xingyun3d.com) 创建应用 | 数字人连接 |
| 魔珐星云 App Secret | 星云控制台获取 | 数字人认证 |

## 项目结构

```
health-consultant/
├── src/
│   ├── client/                      # 前端代码
│   │   ├── components/
│   │   │   ├── Avatar/             # 数字人组件
│   │   │   │   ├── AvatarController.ts      # SDK控制器
│   │   │   │   └── AvatarContainer.tsx      # 数字人容器
│   │   │   ├── Chat/               # 对话组件
│   │   │   │   └── ChatBox.tsx              # AI对话框
│   │   │   ├── Config/             # 配置组件
│   │   │   │   └── ApiKeyConfig.tsx         # 密钥配置页
│   │   │   └── Dashboard/          # 布局组件
│   │   │       └── DashboardLayout.tsx      # 主布局
│   │   ├── store/                      # 状态管理
│   │   │   ├── keyStore.ts              # 密钥状态
│   │   │   └── avatarStore.ts           # 数字人状态
│   │   ├── services/                   # 服务层
│   │   │   ├── keyService.ts            # 密钥管理
│   │   │   └── dataService.ts           # 数据服务
│   │   └── App.tsx                     # 主应用
│   ├── server/                      # 后端代码
│   │   ├── routes/                    # API路由
│   │   │   └── chat.routes.ts          # 对话接口
│   │   └── services/                  # 业务服务
│   │       └── chatService.ts         # 对话服务
│   └── shared/                      # 共享代码
├── data/                            # 数据文件
│   └── mock/                        # 模拟健康数据
└── public/                          # 静态资源
```

## API接口

### POST /api/chat/stream

流式健康对话

**请求体：**
```json
{
  "message": "如何保持健康饮食？",
  "conversationHistory": [],
  "currentData": { ... }
}
```

**响应流：**
```
data: {"type":"content","data":"保持健康饮食的关键"}
data: {"type":"content","data":"是均衡营养"}
data: {"type":"end"}
```

## 环境变量

### .env.server
```bash
# 服务器配置
PORT=5177
NODE_ENV=development

# AI模型配置（模型名称，不需要密钥）
MODELSCOPE_MODEL=deepseek-ai/DeepSeek-V3
EMBEDDING_MODEL=Qwen/Qwen3-Embedding-8B

# 数据配置
MOCK_DATA_ENABLED=true
AUTO_UPDATE_INTERVAL=30000
# 注意：API密钥由前端通过请求传递，不在此配置
```

## 注意事项

1. **密钥安全**：所有密钥存储在浏览器本地，不上传到服务器
2. **AI响应**：健康咨询回复超时时间为60秒
3. **数字人连接**：需要有效的网络连接到魔珐星云服务
4. **浏览器兼容性**：语音识别功能推荐使用Chrome浏览器
5. **健康建议**：系统提供的健康建议仅供参考，不能替代专业医疗 advice

## 开发说明

### 健康咨询流程
1. 用户输入健康问题（文字或语音）
2. 前端调用 `/api/chat/stream` 接口
3. 后端构建包含健康知识库的系统提示词
4. 使用DeepSeek-V3流式生成专业健康建议
5. 数字人自动播报健康建议

### 语音交互流程
1. 用户点击麦克风按钮开始语音输入
2. 系统使用Web Speech API进行语音识别
3. 将识别结果作为问题发送给AI
4. AI生成回复后，数字人进行语音播报

### 数字人播报
1. 健康咨询回复生成完成后自动播报
2. 支持语音合成和动作同步
3. 播报内容：健康建议摘要

## 许可证

MIT License

---

**魔珐星云黑客松作品**
