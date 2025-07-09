# 🚀 Gemini API 代理服务

为中国大陆用户提供稳定、快速的 Google Gemini API 访问服务。

## 🌐 在线演示

**GitHub 仓库**: https://github.com/Astral719/gemini-api-proxy

**一键部署到 Vercel**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Astral719/gemini-api-proxy)

## ✨ 特性

- 🌍 **全球加速**: 基于 Vercel 全球 CDN，为中国用户优化
- 🔒 **安全可靠**: API 密钥安全存储，HTTPS 加密传输
- 🎯 **完全兼容**: 与原始 Gemini API 100% 兼容
- ⚡ **高性能**: 智能缓存和请求优化
- 📊 **监控日志**: 可选的请求日志和错误追踪
- 🔧 **易于部署**: 一键部署到 Vercel

## 🚀 快速开始

### 1. 获取 Gemini API 密钥

访问 [Google AI Studio](https://aistudio.google.com/apikey) 获取您的 API 密钥。

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

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `GEMINI_API_KEY` | ❌ | - | Google Gemini API 密钥（可选，客户端也可提供） |
| `GEMINI_BASE_URL` | ❌ | `https://generativelanguage.googleapis.com/v1beta` | Gemini API 基础 URL |
| `REQUEST_TIMEOUT` | ❌ | `60000` | 请求超时时间（毫秒） |
| `ENABLE_REQUEST_LOGGING` | ❌ | `false` | 是否启用请求日志 |
| `ALLOWED_ORIGINS` | ❌ | `*` | 允许的来源域名（CORS） |

## 🔗 支持的端点

本代理服务支持所有 Gemini API 端点：

- ✅ `models/*:generateContent` - 内容生成
- ✅ `models/*` - 模型信息
- ✅ `files/*` - 文件管理
- ✅ `cachedContents/*` - 缓存内容
- ✅ `tunedModels/*` - 微调模型
- ✅ 所有其他端点

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env.local

# 编辑 .env.local，填入您的配置
# GEMINI_API_KEY=your_api_key_here

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 📄 许可证

MIT License
