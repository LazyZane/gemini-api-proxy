# 🚀 Gemini API 代理服务

为中国大陆用户提供稳定、快速的 Google Gemini API 访问服务，支持原始 Gemini API 和 Vertex AI 两种后端。

## 🌐 在线演示

**GitHub 仓库**: https://github.com/Astral719/gemini-api-proxy

**一键部署到 Vercel**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Astral719/gemini-api-proxy)

## ✨ 特性

- 🌍 **全球加速**: 基于 Vercel 全球 CDN，为中国用户优化
- 🔒 **安全可靠**: API 密钥安全存储，HTTPS 加密传输
- 🎯 **完全兼容**: 与原始 Gemini API 100% 兼容
- ⚡ **高性能**: 智能缓存和请求优化
- 🔄 **双后端支持**: 支持原始 Gemini API 和 Google Cloud Vertex AI
- 📊 **监控日志**: 可选的请求日志和错误追踪
- 🔧 **易于部署**: 一键部署到 Vercel

## 🚀 快速开始

### 1. 选择后端类型并获取密钥

#### 选项 A: 使用 Gemini API（推荐新手）
访问 [Google AI Studio](https://aistudio.google.com/apikey) 获取您的 API 密钥。

#### 选项 B: 使用 Vertex AI（推荐企业用户）
1. 在 [Google Cloud Console](https://console.cloud.google.com/) 创建项目
2. 启用 Vertex AI API
3. 创建服务账号并下载 JSON 密钥文件
4. 记录项目 ID 和区域（如 us-central1）

### 2. 部署到 Vercel

```bash
# 克隆项目
git clone https://github.com/Astral719/gemini-api-proxy.git
cd gemini-api-proxy

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件，填入您的 GEMINI_API_KEY

# 本地开发
npm run dev

# 部署到 Vercel
npx vercel --prod
```

### 3. 配置环境变量

在 Vercel 控制台或 `.env.local` 文件中设置：

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## 📖 使用方法

### 替换 API 基础 URL

将您现有代码中的 Gemini API 基础 URL：

```
https://generativelanguage.googleapis.com/v1beta/
```

替换为您的代理服务 URL：

```
https://your-domain.vercel.app/api/v1beta/
```

### 三种使用方式

#### 方式一：客户端提供 API 密钥（推荐，完全兼容原始 API）

```javascript
// 请求头方式（与原始 API 完全一致）
const response = await fetch('https://your-domain.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': 'YOUR_API_KEY'  // 客户端提供
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Hello, Gemini!" }] }]
  })
});

// 查询参数方式
const response2 = await fetch('https://your-domain.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Hello, Gemini!" }] }]
  })
});

// Authorization Bearer 方式
const response3 = await fetch('https://your-domain.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Hello, Gemini!" }] }]
  })
});
```

#### 方式二：服务端统一配置（适合内部使用）

```javascript
// 在服务端设置 GEMINI_API_KEY 环境变量
// 客户端无需提供密钥
const response = await fetch('https://your-domain.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Hello, Gemini!" }] }]
  })
});
```

### cURL 示例

```bash
curl "https://your-domain.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -d '{
    "contents": [{
      "parts": [{"text": "Hello, Gemini!"}]
    }]
  }'
```

## 🔧 配置选项

### 环境变量

#### 通用配置

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `BACKEND_TYPE` | ❌ | `gemini` | 后端类型：`gemini` 或 `vertex-ai` |
| `REQUEST_TIMEOUT` | ❌ | `60000` | 请求超时时间（毫秒） |
| `ENABLE_REQUEST_LOGGING` | ❌ | `false` | 是否启用请求日志 |
| `ALLOWED_ORIGINS` | ❌ | `*` | 允许的来源域名（CORS） |

#### Gemini API 配置（当 BACKEND_TYPE=gemini 时）

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `GEMINI_API_KEY` | ❌ | - | Google Gemini API 密钥（可选，客户端也可提供） |
| `GEMINI_BASE_URL` | ❌ | `https://generativelanguage.googleapis.com/v1beta` | Gemini API 基础 URL |

#### Vertex AI 配置（当 BACKEND_TYPE=vertex-ai 时）

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `VERTEX_AI_PROJECT_ID` | ✅ | - | Google Cloud 项目 ID |
| `VERTEX_AI_LOCATION` | ❌ | `us-central1` | Vertex AI 区域 |
| `VERTEX_AI_SERVICE_ACCOUNT_KEY` | ✅ | - | 服务账号 JSON 密钥（字符串格式） |

## 🔗 支持的端点

### Gemini API 后端
支持所有 Gemini API 端点：
- ✅ `models/*:generateContent` - 内容生成
- ✅ `models/*` - 模型信息
- ✅ `files/*` - 文件管理
- ✅ `cachedContents/*` - 缓存内容
- ✅ `tunedModels/*` - 微调模型
- ✅ 所有其他端点

### Vertex AI 后端
支持 Vertex AI 中的 Gemini 模型端点：
- ✅ `models/gemini-*:generateContent` - 内容生成
- ✅ `models/gemini-*:streamGenerateContent` - 流式内容生成
- ✅ `models/gemini-*:countTokens` - 令牌计数
- ✅ `models/gemini-*` - 模型信息
- ✅ `models/text-embedding-*` - 文本嵌入
- ❌ 文件管理和缓存内容（Vertex AI 不支持）

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env.local

# 编辑 .env.local，填入您的配置

# 使用 Gemini API（选项 A）
BACKEND_TYPE=gemini
GEMINI_API_KEY=your_api_key_here

# 或使用 Vertex AI（选项 B）
# BACKEND_TYPE=vertex-ai
# VERTEX_AI_PROJECT_ID=your-gcp-project-id
# VERTEX_AI_LOCATION=us-central1
# VERTEX_AI_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}

# 启动开发服务器
npm run dev

# 测试服务（可选）
node test-vertex-ai.js

# 访问 http://localhost:3000
```

## 🤔 如何选择后端？

### 使用 Gemini API（推荐新手）
**优点：**
- 设置简单，只需一个 API 密钥
- 支持所有 Gemini API 功能
- 适合个人项目和快速原型

**缺点：**
- 可能受到地区限制
- 配额和计费相对简单

### 使用 Vertex AI（推荐企业）
**优点：**
- 企业级稳定性和 SLA
- 更好的安全性和合规性
- 集成 Google Cloud 生态系统
- 更灵活的计费和配额管理

**缺点：**
- 设置相对复杂
- 需要 Google Cloud 项目
- 不支持某些 Gemini API 功能（如文件管理）

## 📄 许可证

MIT License
