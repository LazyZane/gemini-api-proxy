export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* 头部 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              🚀 Gemini API 代理
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              为中国大陆用户提供稳定的 Google Gemini API 访问服务
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              服务正常运行
            </div>
          </div>

          {/* 功能特点 */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">高速稳定</h3>
              <p className="text-gray-600 dark:text-gray-300">
                基于 Vercel 全球 CDN，为中国用户优化的网络路由
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">安全可靠</h3>
              <p className="text-gray-600 dark:text-gray-300">
                API 密钥安全存储，支持 HTTPS 加密传输
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">完全兼容</h3>
              <p className="text-gray-600 dark:text-gray-300">
                与原始 Gemini API 100% 兼容，无需修改现有代码
              </p>
            </div>
          </div>

          {/* 使用说明 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">📖 使用说明</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">1. 替换 API 基础 URL</h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">原始 URL:</p>
                  <code className="text-red-600 dark:text-red-400 text-sm">
                    https://generativelanguage.googleapis.com/v1beta/
                  </code>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 mt-4">代理 URL:</p>
                  <code className="text-green-600 dark:text-green-400 text-sm">
                    {typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.vercel.app'}/api/v1beta/
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">2. 使用方式（三种方法）</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">方法一：请求头方式（推荐，完全兼容原始 API）</h4>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm text-gray-800 dark:text-gray-200">
{`const response = await fetch('${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.vercel.app'}/api/v1beta/models/gemini-2.5-flash:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': 'YOUR_API_KEY'  // 客户端提供密钥
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Hello!" }] }]
  })
});`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">方法二：查询参数方式</h4>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm text-gray-800 dark:text-gray-200">
{`const response = await fetch('${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.vercel.app'}/api/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Hello!" }] }]
  })
});`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">方法三：服务端统一配置（适合内部使用）</h4>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm text-gray-800 dark:text-gray-200">
{`// 在服务端设置 GEMINI_API_KEY 环境变量
// 客户端无需提供密钥
const response = await fetch('${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.vercel.app'}/api/v1beta/models/gemini-2.5-flash:generateContent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Hello!" }] }]
  })
});`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">3. cURL 示例</h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm text-gray-800 dark:text-gray-200">
{`curl "${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.vercel.app'}/api/v1beta/models/gemini-2.5-flash:generateContent" \\
  -H "Content-Type: application/json" \\
  -H "x-goog-api-key: YOUR_API_KEY" \\
  -d '{
    "contents": [{
      "parts": [{"text": "Hello, Gemini!"}]
    }]
  }'`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* 支持的端点 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">🔗 支持的端点</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <code className="text-sm">models/*:generateContent</code>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <code className="text-sm">models/*</code>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <code className="text-sm">files/*</code>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <code className="text-sm">cachedContents/*</code>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <code className="text-sm">tunedModels/*</code>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <code className="text-sm">所有其他端点</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
