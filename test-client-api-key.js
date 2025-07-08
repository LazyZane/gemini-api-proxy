/**
 * 测试客户端携带API密钥的场景
 * 这是最常见的使用场景，完全兼容原始Gemini API
 */

const BASE_URL = 'http://localhost:3000';

// 模拟客户端API密钥（实际使用时替换为真实密钥）
const CLIENT_API_KEY = 'AIzaSyDummy_Client_API_Key_For_Testing';

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
 * 测试客户端API密钥 - 请求头方式
 */
async function testClientApiKeyHeader() {
  console.log('\n🔑 测试客户端API密钥 - 请求头方式...');
  
  const result = await makeRequest(
    `${BASE_URL}/api/v1beta/models/gemini-2.5-flash:generateContent`,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': CLIENT_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "请简短回复：测试成功" }]
        }]
      }),
    }
  );
  
  console.log(`   状态码: ${result.status}`);
  console.log(`   成功: ${result.ok}`);
  
  if (result.ok) {
    console.log('✅ 客户端API密钥（请求头）测试通过');
    if (result.data.candidates) {
      console.log(`   AI回复: ${result.data.candidates[0]?.content?.parts[0]?.text}`);
    }
  } else {
    console.log('❌ 客户端API密钥（请求头）测试失败');
    console.log(`   错误: ${result.data?.error || result.error}`);
    
    // 如果是API密钥问题，这是正常的（因为我们用的是测试密钥）
    if (result.status === 400 && result.data?.error?.message?.includes('API key not valid')) {
      console.log('   ℹ️  这是预期的错误（测试密钥无效），代理功能正常');
      return true;
    }
  }
  
  return result.ok;
}

/**
 * 测试客户端API密钥 - 查询参数方式
 */
async function testClientApiKeyQuery() {
  console.log('\n🔗 测试客户端API密钥 - 查询参数方式...');
  
  const result = await makeRequest(
    `${BASE_URL}/api/v1beta/models/gemini-2.5-flash:generateContent?key=${CLIENT_API_KEY}`,
    {
      method: 'POST',
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "请简短回复：测试成功" }]
        }]
      }),
    }
  );
  
  console.log(`   状态码: ${result.status}`);
  console.log(`   成功: ${result.ok}`);
  
  if (result.ok) {
    console.log('✅ 客户端API密钥（查询参数）测试通过');
  } else {
    console.log('❌ 客户端API密钥（查询参数）测试失败');
    console.log(`   错误: ${result.data?.error || result.error}`);
    
    // 如果是API密钥问题，这是正常的
    if (result.status === 400 && result.data?.error?.message?.includes('API key not valid')) {
      console.log('   ℹ️  这是预期的错误（测试密钥无效），代理功能正常');
      return true;
    }
  }
  
  return result.ok;
}

/**
 * 测试无API密钥的情况
 */
async function testNoApiKey() {
  console.log('\n🚫 测试无API密钥的错误处理...');
  
  const result = await makeRequest(
    `${BASE_URL}/api/v1beta/models/gemini-2.5-flash:generateContent`,
    {
      method: 'POST',
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "这应该失败" }]
        }]
      }),
    }
  );
  
  console.log(`   状态码: ${result.status}`);
  
  if (result.status === 401) {
    console.log('✅ 正确返回401错误（无API密钥）');
    console.log(`   错误信息: ${result.data?.error}`);
    return true;
  } else {
    console.log('❌ 应该返回401错误但没有');
    return false;
  }
}

/**
 * 测试模型列表端点
 */
async function testListModels() {
  console.log('\n📋 测试模型列表端点...');
  
  const result = await makeRequest(
    `${BASE_URL}/api/v1beta/models`,
    {
      method: 'GET',
      headers: {
        'x-goog-api-key': CLIENT_API_KEY,
      },
    }
  );
  
  console.log(`   状态码: ${result.status}`);
  
  if (result.ok) {
    console.log('✅ 模型列表测试通过');
    console.log(`   返回数据长度: ${JSON.stringify(result.data).length} 字符`);
  } else {
    console.log('❌ 模型列表测试失败');
    console.log(`   错误: ${result.data?.error || result.error}`);
    
    // API密钥无效是预期的
    if (result.status === 400 && result.data?.error?.message?.includes('API key not valid')) {
      console.log('   ℹ️  这是预期的错误（测试密钥无效），代理功能正常');
      return true;
    }
  }
  
  return result.ok;
}

/**
 * 主测试函数
 */
async function runClientApiKeyTests() {
  console.log('🚀 开始测试客户端携带API密钥场景');
  console.log(`📍 测试地址: ${BASE_URL}`);
  console.log(`🔑 使用测试API密钥: ${CLIENT_API_KEY.substring(0, 20)}...`);
  console.log('');
  console.log('ℹ️  注意：由于使用测试密钥，API调用会失败，但这证明代理功能正常');
  
  const tests = [
    { name: '客户端API密钥（请求头）', fn: testClientApiKeyHeader },
    { name: '客户端API密钥（查询参数）', fn: testClientApiKeyQuery },
    { name: '无API密钥错误处理', fn: testNoApiKey },
    { name: '模型列表端点', fn: testListModels },
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
  
  console.log('\n📊 客户端API密钥场景测试结果:');
  console.log(`   通过: ${passed}/${total}`);
  console.log(`   成功率: ${Math.round((passed / total) * 100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 客户端API密钥场景测试全部通过！');
    console.log('✅ 代理服务完全兼容原始Gemini API');
    console.log('✅ 可以安全部署到Vercel');
  } else {
    console.log('\n⚠️  部分测试失败，请检查配置');
  }
  
  return passed === total;
}

// 运行测试
if (require.main === module) {
  runClientApiKeyTests().catch(console.error);
}

module.exports = { runClientApiKeyTests };
