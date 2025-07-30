import { NextRequest, NextResponse } from 'next/server';
import { config, validateConfig } from '@/lib/config';
import { VertexAIClient } from '@/lib/vertex-ai-client';

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
    
    // 检查后端服务连接性
    let backendStatus = 'unknown';
    let backendLatency = 0;
    let backendInfo = {};
    const backendStartTime = Date.now();

    try {

      if (config.backend.type === 'vertex-ai' && config.backend.vertexAI) {
        // 检查 Vertex AI 连接
        const serviceAccountKey = JSON.parse(config.backend.vertexAI.serviceAccountKey);
        const vertexClient = new VertexAIClient(
          config.backend.vertexAI.projectId,
          config.backend.vertexAI.location,
          serviceAccountKey
        );

        // 尝试获取访问令牌来验证连接
        await vertexClient.getAccessToken();
        backendLatency = Date.now() - backendStartTime;
        backendStatus = 'healthy';
        backendInfo = {
          type: 'vertex-ai',
          projectId: config.backend.vertexAI.projectId,
          location: config.backend.vertexAI.location
        };
      } else {
        // 检查 Gemini API 连接
        const response = await fetch(`${config.backend.gemini.baseUrl}/models`, {
          method: 'GET',
          headers: {
            'x-goog-api-key': config.backend.gemini.apiKey,
          },
          signal: AbortSignal.timeout(5000), // 5秒超时
        });

        backendLatency = Date.now() - backendStartTime;
        backendStatus = response.ok ? 'healthy' : 'error';
        backendInfo = {
          type: 'gemini',
          baseUrl: config.backend.gemini.baseUrl
        };
      }
    } catch (_error) {
      backendStatus = 'error';
      backendLatency = Date.now() - backendStartTime;
      backendInfo = {
        type: config.backend.type,
        error: _error instanceof Error ? _error.message : '未知错误'
      };
    }
    
    const responseTime = Date.now() - startTime;
    
    // 构建健康状态响应
    const healthData = {
      status: validation.isValid && backendStatus !== 'error' ? 'healthy' : 'unhealthy',
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
        backend: {
          status: backendStatus,
          latency: `${backendLatency}ms`,
          ...backendInfo,
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB',
        },
      },
      features: {
        logging: config.app.enableLogging,
        timeout: config.backend.gemini.timeout,
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
