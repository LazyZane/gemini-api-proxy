/**
 * Gemini API 代理服务测试脚本
 * 
 * 这个脚本用于测试代理服务的各种功能
 * 运行方式: node test-proxy.js
 */

const BASE_URL = 'http://localhost:3000';

// 测试用的 API 密钥（请替换为您的真实密钥）
const TEST_API_KEY = process.env.GEMINI_API_KEY || 'your_test_api_key_here';

/**
 * 发送 HTTP 请求的辅助函数
 */
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.text();
    let jsonData;
    
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }
    
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: jsonData,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

/**
 * 测试健康检查端点
 */
async function testHealthCheck() {
  console.log('\n🔍 测试健康检查端点...');
  
  const result = await makeRequest(`${BASE_URL}/api/health`);
  
  if (result.ok) {
    console.log('✅ 健康检查通过');
    console.log(`   状态: ${result.data.status}`);
    console.log(`   响应时间: ${result.data.responseTime}`);
    console.log(`   配置状态: ${result.data.checks.config.status}`);
    
    if (result.data.checks.config.errors?.length > 0) {
      console.log('⚠️  配置警告:');
      result.data.checks.config.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
  } else {
    console.log('❌ 健康检查失败');
    console.log(`   状态码: ${result.status}`);
    console.log(`   错误: ${result.error || result.data?.error}`);
  }
  
  return result.ok;
}

/**
 * 测试基本连接
 */
async function testBasicConnection() {
  console.log('\n🔗 测试基本连接...');
  
  const result = await makeRequest(`${BASE_URL}/api/test`);
  
  if (result.ok) {
    console.log('✅ 基本连接测试通过');
    console.log(`   成功: ${result.data.success}`);
    console.log(`   消息: ${result.data.message}`);
    
    if (result.data.test) {
      console.log(`   Gemini API 状态: ${result.data.test.status}`);
      console.log(`   数据预览: ${result.data.test.dataPreview?.substring(0, 100)}...`);
    }
  } else {
    console.log('❌ 基本连接测试失败');
    console.log(`   状态码: ${result.status}`);
    console.log(`   错误: ${result.error || result.data?.error}`);
  }
  
  return result.ok;
}

/**
 * 测试多种 API 密钥提供方式
 */
async function testApiKeyMethods() {
  console.log('\n🔑 测试 API 密钥提供方式...');

  if (!TEST_API_KEY || TEST_API_KEY === 'your_test_api_key_here') {
    console.log('⚠️  跳过 API 密钥测试（需要设置 GEMINI_API_KEY 环境变量）');
    return true;
  }

  const testPayload = {
    contents: [{
      parts: [{ text: "请简短回复：'测试成功'" }]
    }]
  };

  let passedTests = 0;
  const totalTests = 3;

  // 测试方法1：请求头方式
  console.log('   测试方法1: x-goog-api-key 请求头...');
  const result1 = await makeRequest(
    `${BASE_URL}/api/v1beta/models/gemini-2.5-flash:generateContent`,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': TEST_API_KEY,
      },
      body: JSON.stringify(testPayload),
    }
  );

  if (result1.ok) {
    console.log('   ✅ 请求头方式成功');
    passedTests++;
  } else {
    console.log('   ❌ 请求头方式失败:', result1.data?.error);
  }

  // 测试方法2：查询参数方式
  console.log('   测试方法2: 查询参数...');
  const result2 = await makeRequest(
    `${BASE_URL}/api/v1beta/models/gemini-2.5-flash:generateContent?key=${TEST_API_KEY}`,
    {
      method: 'POST',
      body: JSON.stringify(testPayload),
    }
  );

  if (result2.ok) {
    console.log('   ✅ 查询参数方式成功');
    passedTests++;
  } else {
    console.log('   ❌ 查询参数方式失败:', result2.data?.error);
  }

  // 测试方法3：Authorization Bearer
  console.log('   测试方法3: Authorization Bearer...');
  const result3 = await makeRequest(
    `${BASE_URL}/api/v1beta/models/gemini-2.5-flash:generateContent`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify(testPayload),
    }
  );

  if (result3.ok) {
    console.log('   ✅ Authorization Bearer 方式成功');
    passedTests++;
  } else {
    console.log('   ❌ Authorization Bearer 方式失败:', result3.data?.error);
  }

  console.log(`   总结: ${passedTests}/${totalTests} 种方式成功`);
  return passedTests > 0;
}

/**
 * 测试无 API 密钥的错误处理
 */
async function testMissingApiKey() {
  console.log('\n🚫 测试缺失 API 密钥的错误处理...');

  const testPayload = {
    contents: [{
      parts: [{ text: "这应该失败" }]
    }]
  };

  const result = await makeRequest(
    `${BASE_URL}/api/v1beta/models/gemini-2.5-flash:generateContent`,
    {
      method: 'POST',
      body: JSON.stringify(testPayload),
    }
  );

  if (!result.ok && result.status === 401) {
    console.log('✅ 正确返回 401 错误');
    console.log(`   错误信息: ${result.data?.error}`);
    return true;
  } else {
    console.log('❌ 应该返回 401 错误但没有');
    return false;
  }
}

/**
 * 测试 CORS 支持
 */
async function testCORS() {
  console.log('\n🌐 测试 CORS 支持...');
  
  const result = await makeRequest(`${BASE_URL}/api/v1beta/models`, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://example.com',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, x-goog-api-key',
    },
  });
  
  if (result.ok || result.status === 200) {
    console.log('✅ CORS 预检请求通过');
    console.log(`   允许的来源: ${result.headers['access-control-allow-origin']}`);
    console.log(`   允许的方法: ${result.headers['access-control-allow-methods']}`);
    console.log(`   允许的头部: ${result.headers['access-control-allow-headers']}`);
  } else {
    console.log('❌ CORS 预检请求失败');
    console.log(`   状态码: ${result.status}`);
  }
  
  return result.ok || result.status === 200;
}

/**
 * 测试错误处理
 */
async function testErrorHandling() {
  console.log('\n⚠️  测试错误处理...');
  
  // 测试无效的端点
  const result = await makeRequest(`${BASE_URL}/api/v1beta/invalid-endpoint`);
  
  if (!result.ok) {
    console.log('✅ 错误处理测试通过（正确返回错误）');
    console.log(`   状态码: ${result.status}`);
    
    if (result.data?.error) {
      console.log(`   错误信息: ${result.data.error}`);
    }
  } else {
    console.log('❌ 错误处理测试失败（应该返回错误但没有）');
  }
  
  return !result.ok; // 期望失败
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始测试 Gemini API 代理服务');
  console.log(`📍 测试地址: ${BASE_URL}`);
  
  const tests = [
    { name: '健康检查', fn: testHealthCheck },
    { name: '基本连接', fn: testBasicConnection },
    { name: 'API密钥方式', fn: testApiKeyMethods },
    { name: '缺失密钥处理', fn: testMissingApiKey },
    { name: 'CORS 支持', fn: testCORS },
    { name: '错误处理', fn: testErrorHandling },
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} 测试异常: ${error.message}`);
    }
  }
  
  console.log('\n📊 测试结果汇总:');
  console.log(`   通过: ${passed}/${total}`);
  console.log(`   成功率: ${Math.round((passed / total) * 100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 所有测试通过！代理服务工作正常。');
  } else {
    console.log('\n⚠️  部分测试失败，请检查配置和网络连接。');
  }
  
  console.log('\n💡 提示:');
  console.log('   - 确保设置了 GEMINI_API_KEY 环境变量');
  console.log('   - 检查网络连接到 Google Gemini API');
  console.log('   - 查看控制台日志了解详细错误信息');
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
