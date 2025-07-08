# 🚀 Gemini API 代理使用示例

本文档提供了详细的使用示例，展示如何在不同场景下使用 Gemini API 代理服务。

## 📋 目录

1. [基本使用方式](#基本使用方式)
2. [完全兼容原始 API](#完全兼容原始-api)
3. [不同编程语言示例](#不同编程语言示例)
4. [部署场景对比](#部署场景对比)
5. [最佳实践](#最佳实践)

## 🎯 基本使用方式

### 方式一：客户端提供 API 密钥（推荐）

这种方式与原始 Gemini API **完全兼容**，只需要替换 URL 即可。

#### 1.1 请求头方式（最推荐）

```javascript
// 原始 Gemini API 调用
const originalResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Hello!" }] }]
  })
});

// 使用代理服务（只需替换 URL）
const proxyResponse = await fetch('https://your-domain.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': 'YOUR_API_KEY'  // 完全相同的用法
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Hello!" }] }]
  })
});
```

#### 1.2 查询参数方式

```javascript
const response = await fetch('https://your-domain.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Hello!" }] }]
  })
});
```

#### 1.3 Authorization Bearer 方式

```javascript
const response = await fetch('https://your-domain.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Hello!" }] }]
  })
});
```

### 方式二：服务端统一配置

适合内部使用或需要隐藏 API 密钥的场景。

```javascript
// 在 Vercel 环境变量中设置 GEMINI_API_KEY
// 客户端无需提供密钥
const response = await fetch('https://your-domain.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Hello!" }] }]
  })
});
```

## 🔄 完全兼容原始 API

### 迁移现有代码

如果您已经有使用 Gemini API 的代码，迁移非常简单：

```javascript
// 步骤1：定义基础 URL
const GEMINI_BASE_URL = 'https://your-domain.vercel.app/api/v1beta';
// const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'; // 原始 URL

// 步骤2：其他代码保持不变
class GeminiClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = GEMINI_BASE_URL;
  }

  async generateContent(model, contents) {
    const response = await fetch(`${this.baseUrl}/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey
      },
      body: JSON.stringify({ contents })
    });
    
    return response.json();
  }

  async listModels() {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: { 'x-goog-api-key': this.apiKey }
    });
    
    return response.json();
  }
}

// 使用方式完全相同
const client = new GeminiClient('YOUR_API_KEY');
const result = await client.generateContent('gemini-2.5-flash', [
  { parts: [{ text: "Hello, world!" }] }
]);
```

## 🌍 不同编程语言示例

### Python

```python
import requests
import json

# 方式1：请求头
def call_gemini_proxy(api_key, prompt):
    url = "https://your-domain.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent"
    
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key
    }
    
    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    
    response = requests.post(url, headers=headers, json=data)
    return response.json()

# 方式2：查询参数
def call_gemini_proxy_query(api_key, prompt):
    url = f"https://your-domain.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    headers = {"Content-Type": "application/json"}
    data = {"contents": [{"parts": [{"text": prompt}]}]}
    
    response = requests.post(url, headers=headers, json=data)
    return response.json()

# 使用示例
result = call_gemini_proxy("YOUR_API_KEY", "Hello, Gemini!")
print(result)
```

### cURL

```bash
# 方式1：请求头
curl "https://your-domain.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -d '{
    "contents": [{"parts": [{"text": "Hello, Gemini!"}]}]
  }'

# 方式2：查询参数
curl "https://your-domain.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "Hello, Gemini!"}]}]
  }'
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

type GeminiRequest struct {
    Contents []Content `json:"contents"`
}

type Content struct {
    Parts []Part `json:"parts"`
}

type Part struct {
    Text string `json:"text"`
}

func callGeminiProxy(apiKey, prompt string) error {
    url := "https://your-domain.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent"
    
    request := GeminiRequest{
        Contents: []Content{
            {Parts: []Part{{Text: prompt}}},
        },
    }
    
    jsonData, _ := json.Marshal(request)
    
    req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("x-goog-api-key", apiKey)
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    // 处理响应...
    return nil
}
```

## 🏗️ 部署场景对比

### 场景一：公共代理服务

**适用于：** 为多个用户提供代理服务

```javascript
// 用户需要提供自己的 API 密钥
const response = await fetch('https://gemini-proxy.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent', {
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': 'USER_PROVIDED_API_KEY'
  },
  // ...
});
```

**优点：**
- 用户控制自己的 API 密钥
- 服务提供商无需管理密钥
- 完全兼容原始 API

### 场景二：内部企业服务

**适用于：** 企业内部统一管理 API 密钥

```javascript
// 在 Vercel 设置企业的 GEMINI_API_KEY
// 内部用户无需提供密钥
const response = await fetch('https://internal-gemini.company.com/api/v1beta/models/gemini-2.5-flash:generateContent', {
  headers: { 'Content-Type': 'application/json' },
  // ...
});
```

**优点：**
- 统一管理和计费
- 用户使用更简单
- 可以添加内部访问控制

### 场景三：混合模式

**适用于：** 既支持用户自带密钥，也提供默认密钥

```javascript
// 支持两种方式：
// 1. 用户提供密钥
const userKeyResponse = await fetch(url, {
  headers: { 'x-goog-api-key': 'USER_KEY' }
});

// 2. 使用默认密钥（如果用户没有提供）
const defaultKeyResponse = await fetch(url, {
  headers: { 'Content-Type': 'application/json' }
});
```

## 💡 最佳实践

### 1. 安全考虑

```javascript
// ✅ 好的做法：在服务端隐藏密钥
// 客户端 -> 您的后端 -> Gemini 代理 -> Google Gemini

// ❌ 避免：在前端直接暴露 API 密钥
const apiKey = 'AIza...'; // 不要这样做
```

### 2. 错误处理

```javascript
async function callGeminiWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('https://your-domain.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': 'YOUR_API_KEY'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      if (response.status === 401) {
        throw new Error('API 密钥无效');
      }
      
      if (i === maxRetries - 1) {
        throw new Error(`请求失败: ${response.status}`);
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

### 3. 性能优化

```javascript
// 复用连接
const client = new GeminiProxyClient({
  baseURL: 'https://your-domain.vercel.app/api/v1beta',
  apiKey: 'YOUR_API_KEY',
  timeout: 30000,
  retries: 3
});

// 批量请求
const results = await Promise.all([
  client.generateContent('prompt1'),
  client.generateContent('prompt2'),
  client.generateContent('prompt3')
]);
```

## 🔍 监控和调试

### 健康检查

```javascript
// 检查服务状态
const health = await fetch('https://your-domain.vercel.app/api/health');
const status = await health.json();
console.log('服务状态:', status.status);
```

### 测试连接

```javascript
// 测试基本连接
const test = await fetch('https://your-domain.vercel.app/api/test');
const result = await test.json();
console.log('连接测试:', result.success);
```

---

## 📞 支持

如果您在使用过程中遇到问题，请：

1. 检查 [健康检查端点](https://your-domain.vercel.app/api/health)
2. 查看 [测试端点](https://your-domain.vercel.app/api/test) 的结果
3. 确认 API 密钥格式正确（通常以 `AI` 开头）
4. 检查网络连接到 Google Gemini API
