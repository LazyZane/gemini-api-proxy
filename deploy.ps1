# Gemini API 代理服务 - 快速部署脚本
# 使用方法: .\deploy.ps1

Write-Host "🚀 Gemini API 代理服务 - 快速部署脚本" -ForegroundColor Green
Write-Host ""

# 检查Git状态
Write-Host "📋 检查Git状态..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  发现未提交的更改，正在提交..." -ForegroundColor Yellow
    git add .
    $commitMessage = Read-Host "请输入提交信息（直接回车使用默认信息）"
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = "update: 更新代码"
    }
    git commit -m $commitMessage
    Write-Host "✅ 代码已提交" -ForegroundColor Green
} else {
    Write-Host "✅ Git状态正常，无需提交" -ForegroundColor Green
}

Write-Host ""

# 检查远程仓库
Write-Host "🔗 检查远程仓库..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 未找到远程仓库，请先设置GitHub仓库" -ForegroundColor Red
    Write-Host ""
    Write-Host "请按照以下步骤操作：" -ForegroundColor Cyan
    Write-Host "1. 在GitHub创建新仓库: https://github.com/new" -ForegroundColor White
    Write-Host "2. 运行命令: git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git" -ForegroundColor White
    Write-Host "3. 重新运行此脚本" -ForegroundColor White
    exit 1
} else {
    Write-Host "✅ 远程仓库: $remoteUrl" -ForegroundColor Green
}

Write-Host ""

# 推送到GitHub
Write-Host "📤 推送代码到GitHub..." -ForegroundColor Yellow
try {
    git push origin main
    Write-Host "✅ 代码已推送到GitHub" -ForegroundColor Green
} catch {
    Write-Host "⚠️  推送失败，尝试设置上游分支..." -ForegroundColor Yellow
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 代码已推送到GitHub" -ForegroundColor Green
    } else {
        Write-Host "❌ 推送失败，请检查网络连接和权限" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# 显示部署信息
Write-Host "🎉 代码已成功推送到GitHub！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 接下来的步骤：" -ForegroundColor Cyan
Write-Host "1. 访问 Vercel: https://vercel.com" -ForegroundColor White
Write-Host "2. 使用GitHub账号登录" -ForegroundColor White
Write-Host "3. 点击 'New Project'" -ForegroundColor White
Write-Host "4. 选择您的仓库并导入" -ForegroundColor White
Write-Host "5. 配置环境变量（可选）：" -ForegroundColor White
Write-Host "   - GEMINI_API_KEY: 您的API密钥（如果需要服务端统一管理）" -ForegroundColor Gray
Write-Host "6. 点击 'Deploy'" -ForegroundColor White
Write-Host ""
Write-Host "📖 详细部署指南请查看: DEPLOY_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 您的GitHub仓库: $remoteUrl" -ForegroundColor Green

# 询问是否打开浏览器
$openBrowser = Read-Host "是否打开Vercel部署页面？(y/N)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "https://vercel.com/new"
    Write-Host "✅ 已打开Vercel部署页面" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 部署完成后，您的API代理地址将是:" -ForegroundColor Yellow
Write-Host "https://your-project-name.vercel.app/api/v1beta/" -ForegroundColor White
Write-Host ""
Write-Host "📝 使用示例:" -ForegroundColor Yellow
Write-Host "fetch('https://your-project-name.vercel.app/api/v1beta/models/gemini-2.5-flash:generateContent', {" -ForegroundColor Gray
Write-Host "  method: 'POST'," -ForegroundColor Gray
Write-Host "  headers: {" -ForegroundColor Gray
Write-Host "    'Content-Type': 'application/json'," -ForegroundColor Gray
Write-Host "    'x-goog-api-key': 'YOUR_API_KEY'" -ForegroundColor Gray
Write-Host "  }," -ForegroundColor Gray
Write-Host "  body: JSON.stringify({" -ForegroundColor Gray
Write-Host "    contents: [{ parts: [{ text: 'Hello!' }] }]" -ForegroundColor Gray
Write-Host "  })" -ForegroundColor Gray
Write-Host "})" -ForegroundColor Gray

Write-Host ""
Write-Host "🎉 祝您使用愉快！" -ForegroundColor Green
