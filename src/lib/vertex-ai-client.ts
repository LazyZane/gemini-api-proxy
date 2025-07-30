import { GoogleAuth } from 'google-auth-library';

/**
 * Vertex AI 客户端
 */
export class VertexAIClient {
  private auth: GoogleAuth;
  private projectId: string;
  private location: string;

  constructor(projectId: string, location: string, serviceAccountKey: Record<string, unknown>) {
    this.projectId = projectId;
    this.location = location;
    
    this.auth = new GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  /**
   * 获取访问令牌
   */
  async getAccessToken(): Promise<string> {
    const client = await this.auth.getClient();
    const tokenResponse = await client.getAccessToken();
    
    if (!tokenResponse.token) {
      throw new Error('无法获取 Vertex AI 访问令牌');
    }
    
    return tokenResponse.token;
  }

  /**
   * 构建 Vertex AI API URL
   */
  buildUrl(path: string): string {
    // 将 Gemini API 路径转换为 Vertex AI 路径
    // 例如: models/gemini-2.5-flash:generateContent -> publishers/google/models/gemini-2.5-flash:generateContent
    const convertedPath = this.convertGeminiPathToVertexAI(path);
    
    return `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/${convertedPath}`;
  }

  /**
   * 转换 Gemini API 路径为 Vertex AI 路径
   */
  private convertGeminiPathToVertexAI(path: string): string {
    // 处理模型相关的端点
    if (path.startsWith('models/')) {
      // models/gemini-xxx:generateContent -> publishers/google/models/gemini-xxx:generateContent
      // models/gemini-xxx:streamGenerateContent -> publishers/google/models/gemini-xxx:streamGenerateContent
      // models/gemini-xxx:countTokens -> publishers/google/models/gemini-xxx:countTokens
      // models/gemini-xxx -> publishers/google/models/gemini-xxx
      if (path.includes('gemini-')) {
        return path.replace('models/', 'publishers/google/models/');
      }

      // 处理其他模型（如 text-embedding 等）
      if (path.includes('text-embedding') || path.includes('textembedding')) {
        return path.replace('models/', 'publishers/google/models/');
      }

      // 处理 models 列表端点
      if (path === 'models') {
        // Vertex AI 中获取模型列表的方式不同，需要特殊处理
        return 'publishers/google/models';
      }
    }

    // 处理文件相关端点 - Vertex AI 可能不支持，但保持路径结构
    if (path.startsWith('files/')) {
      // files/* 端点在 Vertex AI 中可能需要不同的处理
      return path; // 暂时保持原样，可能需要根据实际情况调整
    }

    // 处理缓存内容端点
    if (path.startsWith('cachedContents/')) {
      // cachedContents/* 端点在 Vertex AI 中可能需要不同的处理
      return path; // 暂时保持原样，可能需要根据实际情况调整
    }

    // 处理微调模型端点
    if (path.startsWith('tunedModels/')) {
      // tunedModels/* 端点在 Vertex AI 中可能需要不同的处理
      return path; // 暂时保持原样，可能需要根据实际情况调整
    }

    // 其他路径保持不变
    return path;
  }

  /**
   * 检查端点是否被 Vertex AI 支持
   */
  private isEndpointSupported(path: string): boolean {
    // Vertex AI 支持的端点
    const supportedPatterns = [
      /^models\/gemini-.*:(generateContent|streamGenerateContent|countTokens)$/,
      /^models\/gemini-.*$/,
      /^models\/text-embedding.*$/,
      /^models\/textembedding.*$/,
      /^publishers\/google\/models\/.*$/,
      /^models$/
    ];

    return supportedPatterns.some(pattern => pattern.test(path));
  }

  /**
   * 发送请求到 Vertex AI
   */
  async request(path: string, options: RequestInit): Promise<Response> {
    // 检查端点是否支持
    if (!this.isEndpointSupported(path)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 404,
            message: `端点 '${path}' 在 Vertex AI 中不受支持。请使用支持的 Gemini 模型端点。`,
            status: 'NOT_FOUND'
          }
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      const url = this.buildUrl(path);
      const accessToken = await this.getAccessToken();

      const headers = new Headers(options.headers);
      headers.set('Authorization', `Bearer ${accessToken}`);
      headers.set('Content-Type', 'application/json');

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // 如果响应不成功，尝试提供更好的错误信息
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;

        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            error: {
              code: response.status,
              message: errorText || response.statusText,
              status: 'VERTEX_AI_ERROR'
            }
          };
        }

        return new Response(JSON.stringify(errorData), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return response;
    } catch (error) {
      console.error('Vertex AI 请求失败:', error);

      return new Response(
        JSON.stringify({
          error: {
            code: 500,
            message: error instanceof Error ? error.message : '未知的 Vertex AI 错误',
            status: 'INTERNAL_ERROR'
          }
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
}