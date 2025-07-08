# 🚀 Vercel 部署指南

本指南将帮助您将 Gemini API 代理服务部署到 Vercel。

## 📋 部署前准备

### ✅ 已完成的工作
- [x] 项目代码已完成
- [x] Git 仓库已初始化
- [x] 代码已提交到本地 Git
- [x] 客户端携带API密钥功能已测试通过

### 🔑 需要准备的信息
1. **GitHub 账号** - 用于托管代码
2. **Vercel 账号** - 用于部署服务
3. **Gemini API 密钥**（可选）- 如果需要服务端统一管理

## 📤 第一步：推送到 GitHub

### 1.1 创建 GitHub 仓库
1. 访问 [GitHub](https://github.com)
2. 点击右上角的 "+" → "New repository"
3. 填写仓库信息：
   - **Repository name**: `gemini-api-proxy`
   - **Description**: `Gemini API 代理服务 - 为中国大陆用户提供稳定的 Google Gemini API 访问`
   - **Visibility**: Public（推荐）或 Private
4. **不要**勾选 "Add a README file"（我们已经有了）
5. 点击 "Create repository"

### 1.2 推送代码到 GitHub
在您的项目目录中运行以下命令：

```bash
# 添加远程仓库（替换为您的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/gemini-api-proxy.git

# 推送代码
git branch -M main
git push -u origin main
```

## 🌐 第二步：部署到 Vercel

### 2.1 连接 GitHub 到 Vercel
1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择您刚创建的 `gemini-api-proxy` 仓库
5. 点击 "Import"

### 2.2 配置项目设置
在 Vercel 的项目配置页面：

1. **Project Name**: `gemini-api-proxy`（或您喜欢的名称）
2. **Framework Preset**: Next.js（应该自动检测）
3. **Root Directory**: `./`（默认）
4. **Build and Output Settings**: 保持默认

### 2.3 配置环境变量（可选）
如果您想要服务端统一管理 API 密钥：

1. 在 Vercel 项目配置页面，找到 "Environment Variables" 部分
2. 添加以下环境变量：

| Name | Value | Environment |
|------|-------|-------------|
| `GEMINI_API_KEY` | `您的Gemini API密钥` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `ENABLE_REQUEST_LOGGING` | `false` | Production |

**注意**: 如果您选择客户端携带API密钥的方式，可以跳过这一步。

### 2.4 部署
1. 点击 "Deploy" 按钮
2. 等待部署完成（通常需要1-3分钟）
3. 部署成功后，您会看到部署URL

## ✅ 第三步：验证部署

### 3.1 访问服务
部署完成后，访问您的服务：
- **主页**: `https://your-project.vercel.app`
- **健康检查**: `https://your-project.vercel.app/api/health`

### 3.2 测试API代理
使用以下命令测试（替换为您的实际域名和API密钥）：

```bash
# 测试健康检查
curl https://your-project.vercel.app/api/health

# 测试API代理（客户端提供密钥）
curl "https://your-project.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -d '{
    "contents": [{"parts": [{"text": "Hello, Gemini!"}]}]
  }'
```

## 🔧 第四步：自定义域名（可选）

### 4.1 添加自定义域名
1. 在 Vercel 项目页面，点击 "Settings"
2. 选择 "Domains"
3. 添加您的域名
4. 按照提示配置 DNS 记录

### 4.2 推荐的域名格式
- `gemini-api.yourdomain.com`
- `api-proxy.yourdomain.com`
- `gemini.yourdomain.com`

## 📊 第五步：监控和维护

### 5.1 查看部署日志
- 在 Vercel 项目页面，点击 "Functions" 查看API调用日志
- 点击 "Analytics" 查看访问统计

### 5.2 更新代码
当您需要更新代码时：

```bash
# 修改代码后
git add .
git commit -m "更新描述"
git push origin main
```

Vercel 会自动重新部署。

## 🎯 使用您的代理服务

部署完成后，您可以这样使用：

### JavaScript 示例
```javascript
// 替换原始URL
const GEMINI_BASE_URL = 'https://your-project.vercel.app/api/v1beta';

// 使用方式完全相同
const response = await fetch(`${GEMINI_BASE_URL}/models/gemini-2.5-flash:generateContent`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': 'YOUR_API_KEY'  // 客户端提供
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Hello!" }] }]
  })
});
```

### Python 示例
```python
import requests

url = "https://your-project.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent"
headers = {
    "Content-Type": "application/json",
    "x-goog-api-key": "YOUR_API_KEY"
}
data = {
    "contents": [{"parts": [{"text": "Hello!"}]}]
}

response = requests.post(url, headers=headers, json=data)
print(response.json())
```

## 🔒 安全建议

1. **API密钥管理**:
   - 客户端模式：用户自己管理API密钥
   - 服务端模式：在Vercel环境变量中安全存储

2. **访问控制**:
   - 考虑添加访问频率限制
   - 监控异常使用模式

3. **域名安全**:
   - 使用HTTPS（Vercel自动提供）
   - 考虑设置CORS白名单

## 🆘 常见问题

### Q: 部署失败怎么办？
A: 检查 Vercel 的部署日志，常见问题：
- Node.js 版本不兼容
- 环境变量配置错误
- 代码语法错误

### Q: API调用失败？
A: 检查：
- API密钥是否正确
- 网络连接是否正常
- 查看 `/api/health` 端点状态

### Q: 如何查看访问日志？
A: 在 Vercel 项目页面的 "Functions" 标签页可以查看详细日志。

## 🎉 完成！

恭喜！您的 Gemini API 代理服务已经成功部署到 Vercel。

**您的服务地址**: `https://your-project.vercel.app`

现在您可以：
- ✅ 在中国大陆稳定访问 Gemini API
- ✅ 与原始 API 完全兼容
- ✅ 支持多种认证方式
- ✅ 享受 Vercel 的全球 CDN 加速

如有问题，请查看项目的 README.md 和 USAGE_EXAMPLES.md 文档。
