import { NextRequest, NextResponse } from 'next/server';
import { config, validateConfig } from '@/lib/config';

/**
 * 健康检查端点
 * 
 * 用于监控服务状态和配置验证
 * 路径: /api/health 或 /health
 */

export async function GET(_request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // 验证配置
    const validation = validateConfig();
    
    // 检查 Gemini API 连接性（可选）
    let geminiStatus = 'unknown';
    let geminiLatency = 0;
    
    try {
      const geminiStartTime = Date.now();
      const response = await fetch(`${config.gemini.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'x-goog-api-key': config.gemini.apiKey,
        },
        signal: AbortSignal.timeout(5000), // 5秒超时
      });
      
      geminiLatency = Date.now() - geminiStartTime;
      geminiStatus = response.ok ? 'healthy' : 'error';
    } catch (_error) {
      geminiStatus = 'error';
      geminiLatency = Date.now() - startTime;
    }
    
    const responseTime = Date.now() - startTime;
    
    // 构建健康状态响应
    const healthData = {
      status: validation.isValid && geminiStatus !== 'error' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.app.env,
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      checks: {
        config: {
          status: validation.isValid ? 'pass' : 'fail',
          errors: validation.errors,
        },
        geminiApi: {
          status: geminiStatus,
          latency: `${geminiLatency}ms`,
          baseUrl: config.gemini.baseUrl,
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB',
        },
      },
      features: {
        logging: config.app.enableLogging,
        timeout: config.gemini.timeout,
        corsOrigins: config.cors.allowedOrigins.length,
      },
    };
    
    // 根据健康状态设置 HTTP 状态码
    const statusCode = healthData.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthData, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('健康检查失败:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: '健康检查失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// 支持 HEAD 请求（用于简单的存活检查）
export async function HEAD(_request: NextRequest) {
  try {
    const validation = validateConfig();
    const statusCode = validation.isValid ? 200 : 503;
    
    return new NextResponse(null, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (_error) {
    return new NextResponse(null, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
