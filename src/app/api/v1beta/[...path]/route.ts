import { NextRequest, NextResponse } from 'next/server';
import { config, getCorsHeaders } from '@/lib/config';
import { VertexAIClient } from '@/lib/vertex-ai-client';

/**
 * 统一错误响应接口
 */
interface ErrorResponse {
  error: {
    code: number;
    message: string;
    status: string;
    details?: unknown;
  };
  timestamp: string;
  duration?: string;
}

/**
 * 创建统一的错误响应
 */
function createErrorResponse(
  error: unknown,
  statusCode: number = 500,
  duration?: number,
  origin?: string
): NextResponse {
  let errorMessage = '代理服务器错误';
  let errorStatus = 'INTERNAL_ERROR';

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      errorMessage = '请求超时';
      statusCode = 504;
      errorStatus = 'TIMEOUT';
    } else if (error.message.includes('fetch')) {
      errorMessage = '无法连接到后端服务';
      statusCode = 502;
      errorStatus = 'CONNECTION_ERROR';
    } else if (error.message.includes('API_KEY_MISSING')) {
      errorMessage = '缺少 API 密钥';
      statusCode = 401;
      errorStatus = 'UNAUTHORIZED';
    } else if (error.message.includes('Vertex AI')) {
      errorMessage = error.message;
      errorStatus = 'VERTEX_AI_ERROR';
    } else {
      errorMessage = error.message;
    }
  }

  const errorResponse: ErrorResponse = {
    error: {
      code: statusCode,
      message: errorMessage,
      status: errorStatus,
      details: error instanceof Error ? error.stack : undefined
    },
    timestamp: new Date().toISOString(),
    duration: duration ? `${duration}ms` : undefined
  };

  return NextResponse.json(errorResponse, {
    status: statusCode,
    headers: getCorsHeaders(origin),
  });
}

/**
 * Gemini API 代理服务
 *
 * 这个代理服务的作用：
 * 1. 接收来自客户端的请求
 * 2. 转发到 Google Gemini API
 * 3. 返回原始响应，保持完全兼容性
 *
 * 支持的功能：
 * - 所有 Gemini API 端点
 * - 完整的请求/响应转发
 * - 错误处理
 * - CORS 支持
 * - 配置验证
 * - 请求日志（可选）
 */

/**
 * 获取 API 密钥的优先级策略
 * 1. 客户端请求头中的 x-goog-api-key（完全兼容原始 API）
 * 2. 客户端请求头中的 Authorization: Bearer token
 * 3. URL 查询参数中的 key
 * 4. 服务端环境变量 GEMINI_API_KEY（作为后备）
 */
function getApiKey(request: NextRequest, url: URL): { apiKey: string; source: string } {
  // 1. 检查请求头中的 x-goog-api-key（原始 API 方式）
  const headerApiKey = request.headers.get('x-goog-api-key');
  if (headerApiKey) {
    return { apiKey: headerApiKey, source: 'header:x-goog-api-key' };
  }

  // 2. 检查 Authorization Bearer token
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return { apiKey: token, source: 'header:authorization' };
  }

  // 3. 检查 URL 查询参数中的 key
  const queryApiKey = url.searchParams.get('key');
  if (queryApiKey) {
    return { apiKey: queryApiKey, source: 'query:key' };
  }

  // 4. 使用服务端环境变量作为后备
  if (config.backend.gemini.apiKey) {
    return { apiKey: config.backend.gemini.apiKey, source: 'server:env' };
  }

  throw new Error('API_KEY_MISSING');
}

/**
 * 根据配置创建后端客户端
 */
function createBackendClient() {
  if (config.backend.type === 'vertex-ai' && config.backend.vertexAI) {
    const serviceAccountKey = JSON.parse(config.backend.vertexAI.serviceAccountKey);
    return new VertexAIClient(
      config.backend.vertexAI.projectId,
      config.backend.vertexAI.location,
      serviceAccountKey
    );
  }
  return null; // 使用原始 Gemini API
}

/**
 * 处理 Vertex AI 请求
 */
async function handleVertexAIRequest(
  vertexClient: VertexAIClient,
  path: string,
  request: NextRequest
): Promise<Response> {
  // 准备请求体
  let body: string | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.text();
  }

  // 准备请求头
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const excludeHeaders = ['host', 'origin', 'referer', 'x-forwarded-for', 'x-real-ip', 'authorization', 'x-goog-api-key'];
    if (!excludeHeaders.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // 发送请求到 Vertex AI
  return vertexClient.request(path, {
    method: request.method,
    headers,
    body,
  });
}

/**
 * 处理所有 HTTP 方法的通用函数
 */
async function handleRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const startTime = Date.now();

  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const targetPath = pathSegments.join('/');

    // 记录请求日志
    if (config.app.enableLogging) {
      console.log(`[${new Date().toISOString()}] ${request.method} ${targetPath} (Backend: ${config.backend.type})`);
    }

    // 根据后端类型处理请求
    if (config.backend.type === 'vertex-ai') {
      const vertexClient = createBackendClient();
      if (!vertexClient) {
        throw new Error('Vertex AI 配置不完整');
      }
      
      const response = await handleVertexAIRequest(vertexClient, targetPath, request);
      
      // 记录响应时间
      const duration = Date.now() - startTime;
      if (config.app.enableLogging) {
        console.log(`[${new Date().toISOString()}] Response: ${response.status} (${duration}ms)`);
      }

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          ...getCorsHeaders(request.headers.get('origin') || undefined),
        },
      });
    } else {
      // 原有的 Gemini API 处理逻辑
      const url = new URL(request.url);
      
      // 获取 API 密钥
      let apiKeyInfo;
      try {
        apiKeyInfo = getApiKey(request, url);
      } catch (_error) {
        return NextResponse.json(
          {
            error: 'API 密钥缺失',
            message: '请在请求头中提供 x-goog-api-key，或在查询参数中提供 key，或配置服务端环境变量',
            examples: {
              header: 'x-goog-api-key: YOUR_API_KEY',
              query: '?key=YOUR_API_KEY',
              authorization: 'Authorization: Bearer YOUR_API_KEY'
            },
            timestamp: new Date().toISOString(),
          },
          {
            status: 401,
            headers: getCorsHeaders(request.headers.get('origin') || undefined),
          }
        );
      }

      // 构建完整的目标 URL
      const targetUrl = new URL(`${config.backend.gemini.baseUrl}/${targetPath}`);

      // 复制查询参数（除了 key 参数，因为我们会在请求头中设置）
      url.searchParams.forEach((value, key) => {
        if (key !== 'key') {
          targetUrl.searchParams.set(key, value);
        }
      });

      // 记录请求日志（如果启用）
      if (config.app.enableLogging) {
        console.log(`[${new Date().toISOString()}] ${request.method} ${targetPath} (API Key from: ${apiKeyInfo.source})`);
      }

      // 准备请求头
      const headers = new Headers();
      
      // 复制原始请求头（排除一些不需要的）
      const excludeHeaders = ['host', 'origin', 'referer', 'x-forwarded-for', 'x-real-ip'];
      request.headers.forEach((value, key) => {
        if (!excludeHeaders.includes(key.toLowerCase())) {
          headers.set(key, value);
        }
      });

      // 设置 API 密钥（使用获取到的密钥）
      headers.set('x-goog-api-key', apiKeyInfo.apiKey);

      // 准备请求体
      let body: string | undefined;
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        try {
          body = await request.text();
        } catch (_error) {
          console.error('读取请求体失败:', _error);
        }
      }

      // 发送请求到 Gemini API（带重试机制）
      let response;
      let lastError;
      const maxRetries = 2;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          response = await fetch(targetUrl.toString(), {
            method: request.method,
            headers,
            body,
            signal: AbortSignal.timeout(config.backend.gemini.timeout),
          });
          break; // 成功则跳出循环
        } catch (error) {
          lastError = error;
          if (attempt < maxRetries) {
            // 等待一段时间后重试
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            console.log(`请求失败，正在重试 (${attempt + 1}/${maxRetries}):`, error);
          }
        }
      }

      if (!response) {
        throw lastError || new Error('请求失败');
      }

      // 获取响应数据
      const responseData = await response.text();
      
      // 准备响应头
      const responseHeaders = new Headers();
      
      // 复制响应头
      response.headers.forEach((value, key) => {
        // 排除一些可能导致问题的头部
        if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
          responseHeaders.set(key, value);
        }
      });

      // 添加 CORS 头部
      const corsHeaders = getCorsHeaders(request.headers.get('origin') || undefined);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });

      // 记录响应日志（如果启用）
      if (config.app.enableLogging) {
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${request.method} ${targetPath} - ${response.status} (${duration}ms)`);
      }

      // 返回响应
      return new NextResponse(responseData, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`代理请求失败 (${duration}ms):`, error);

    return createErrorResponse(
      error,
      500,
      duration,
      request.headers.get('origin') || undefined
    );
  }
}

// 处理 OPTIONS 请求（CORS 预检）
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request.headers.get('origin') || undefined),
  });
}

// 导出所有支持的 HTTP 方法
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}
