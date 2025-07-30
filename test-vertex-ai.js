#!/usr/bin/env node

/**
 * Vertex AI 集成测试脚本
 * 
 * 这个脚本用于测试 Vertex AI 集成是否正常工作
 * 使用方法：
 * 1. 设置环境变量
 * 2. 运行: node test-vertex-ai.js
 */

const https = require('https');
const http = require('http');

// 配置
const config = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  vertexAI: {
    projectId: process.env.VERTEX_AI_PROJECT_ID,
    location: process.env.VERTEX_AI_LOCATION || 'us-central1',
    serviceAccountKey: process.env.VERTEX_AI_SERVICE_ACCOUNT_KEY
  },
  geminiApiKey: process.env.GEMINI_API_KEY
};

/**
 * 发送 HTTP 请求的辅助函数
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * 测试健康检查端点
 */
async function testHealthCheck() {
  console.log('\n🔍 测试健康检查端点...');
  
  try {
    const response = await makeRequest(`${config.baseUrl}/api/health`);
    
    if (response.status === 200) {
      console.log('✅ 健康检查通过');
      console.log(`   状态: ${response.data.status}`);
      console.log(`   后端类型: ${response.data.checks?.backend?.type || '未知'}`);
      console.log(`   后端状态: ${response.data.checks?.backend?.status || '未知'}`);
      console.log(`   延迟: ${response.data.checks?.backend?.latency || '未知'}`);
      
      if (response.data.checks?.backend?.error) {
        console.log(`   错误: ${response.data.checks.backend.error}`);
      }
      
      return true;
    } else {
      console.log('❌ 健康检查失败');
      console.log(`   状态码: ${response.status}`);
      console.log(`   响应: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ 健康检查请求失败');
    console.log(`   错误: ${error.message}`);
    return false;
  }
}

/**
 * 测试 Gemini API 代理（使用 Vertex AI 后端）
 */
async function testVertexAIProxy() {
  console.log('\n🤖 测试 Vertex AI 代理...');
  
  if (!config.vertexAI.projectId || !config.vertexAI.serviceAccountKey) {
    console.log('⚠️  跳过 Vertex AI 测试 - 缺少必要的环境变量');
    console.log('   需要设置: VERTEX_AI_PROJECT_ID, VERTEX_AI_SERVICE_ACCOUNT_KEY');
    return false;
  }

  const testPayload = {
    contents: [{
      parts: [{
        text: "Hello! Please respond with 'Hello from Vertex AI' to confirm the connection is working."
      }]
    }]
  };

  try {
    const response = await makeRequest(
      `${config.baseUrl}/api/v1beta/models/gemini-1.5-flash:generateContent`,
      {
        method: 'POST',
        body: testPayload
      }
    );

    if (response.status === 200 && response.data.candidates) {
      console.log('✅ Vertex AI 代理测试成功');
      const content = response.data.candidates[0]?.content?.parts[0]?.text;
      console.log(`   响应: ${content?.substring(0, 100)}${content?.length > 100 ? '...' : ''}`);
      return true;
    } else {
      console.log('❌ Vertex AI 代理测试失败');
      console.log(`   状态码: ${response.status}`);
      console.log(`   响应: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Vertex AI 代理请求失败');
    console.log(`   错误: ${error.message}`);
    return false;
  }
}

/**
 * 测试 Gemini API 代理（使用原始 Gemini API）
 */
async function testGeminiProxy() {
  console.log('\n🔑 测试 Gemini API 代理...');
  
  if (!config.geminiApiKey) {
    console.log('⚠️  跳过 Gemini API 测试 - 缺少 API 密钥');
    console.log('   需要设置: GEMINI_API_KEY');
    return false;
  }

  const testPayload = {
    contents: [{
      parts: [{
        text: "Hello! Please respond with 'Hello from Gemini API' to confirm the connection is working."
      }]
    }]
  };

  try {
    const response = await makeRequest(
      `${config.baseUrl}/api/v1beta/models/gemini-1.5-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': config.geminiApiKey
        },
        body: testPayload
      }
    );

    if (response.status === 200 && response.data.candidates) {
      console.log('✅ Gemini API 代理测试成功');
      const content = response.data.candidates[0]?.content?.parts[0]?.text;
      console.log(`   响应: ${content?.substring(0, 100)}${content?.length > 100 ? '...' : ''}`);
      return true;
    } else {
      console.log('❌ Gemini API 代理测试失败');
      console.log(`   状态码: ${response.status}`);
      console.log(`   响应: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Gemini API 代理请求失败');
    console.log(`   错误: ${error.message}`);
    return false;
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始 Vertex AI 集成测试');
  console.log(`📍 测试目标: ${config.baseUrl}`);
  
  const results = {
    healthCheck: false,
    vertexAI: false,
    geminiAPI: false
  };

  // 测试健康检查
  results.healthCheck = await testHealthCheck();

  // 测试 Vertex AI 代理
  results.vertexAI = await testVertexAIProxy();

  // 测试 Gemini API 代理
  results.geminiAPI = await testGeminiProxy();

  // 输出测试结果
  console.log('\n📊 测试结果汇总:');
  console.log(`   健康检查: ${results.healthCheck ? '✅ 通过' : '❌ 失败'}`);
  console.log(`   Vertex AI: ${results.vertexAI ? '✅ 通过' : '❌ 失败'}`);
  console.log(`   Gemini API: ${results.geminiAPI ? '✅ 通过' : '❌ 失败'}`);

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`\n🎯 总体结果: ${passedTests}/${totalTests} 测试通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试都通过了！');
    process.exit(0);
  } else {
    console.log('⚠️  部分测试失败，请检查配置和日志');
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testHealthCheck, testVertexAIProxy, testGeminiProxy };
