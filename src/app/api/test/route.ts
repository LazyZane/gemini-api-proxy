import { NextRequest, NextResponse } from 'next/server';
import { config, validateConfig } from '@/lib/config';

/**
 * 测试端点
 * 
 * 用于测试代理服务的基本功能
 * 路径: /api/test
 */

export async function GET(request: NextRequest) {
  try {
    // 验证配置
    const validation = validateConfig();
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: '配置验证失败',
          details: validation.errors,
        },
        { status: 500 }
      );
    }

    // 测试 Gemini API 连接
    const testUrl = `${config.gemini.baseUrl}/models`;
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'x-goog-api-key': config.gemini.apiKey,
        },
        signal: AbortSignal.timeout(10000),
      });

      const data = await response.text();
      
      return NextResponse.json({
        success: true,
        message: '代理服务工作正常',
        test: {
          url: testUrl,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          hasData: data.length > 0,
          dataPreview: data.substring(0, 200) + (data.length > 200 ? '...' : ''),
        },
        config: {
          baseUrl: config.gemini.baseUrl,
          timeout: config.gemini.timeout,
          logging: config.app.enableLogging,
          environment: config.app.env,
        },
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API 连接失败',
          message: error instanceof Error ? error.message : '未知错误',
          config: {
            baseUrl: config.gemini.baseUrl,
            timeout: config.gemini.timeout,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 502 }
      );
    }
    
  } catch (error) {
    console.error('测试端点错误:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '测试失败',
        message: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证配置
    const validation = validateConfig();
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: '配置验证失败',
          details: validation.errors,
        },
        { status: 500 }
      );
    }

    // 获取请求体
    const body = await request.json();
    
    // 测试内容生成
    const testUrl = `${config.gemini.baseUrl}/models/gemini-2.5-flash:generateContent`;
    const testPayload = body || {
      contents: [{
        parts: [{ text: "Hello! Please respond with 'API proxy is working correctly.'" }]
      }]
    };
    
    try {
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': config.gemini.apiKey,
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(30000),
      });

      const data = await response.json();
      
      return NextResponse.json({
        success: true,
        message: '内容生成测试成功',
        test: {
          url: testUrl,
          status: response.status,
          statusText: response.statusText,
          request: testPayload,
          response: data,
        },
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: '内容生成测试失败',
          message: error instanceof Error ? error.message : '未知错误',
          request: testPayload,
          timestamp: new Date().toISOString(),
        },
        { status: 502 }
      );
    }
    
  } catch (error) {
    console.error('POST 测试端点错误:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '测试失败',
        message: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
