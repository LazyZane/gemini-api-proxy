/**
 * 应用配置管理
 * 
 * 这个文件集中管理所有的环境变量和配置项，
 * 提供类型安全的配置访问和默认值处理。
 */

// 配置接口定义
interface AppConfig {
  // 后端配置
  backend: {
    type: BackendType;
    gemini: {
      apiKey: string;
      baseUrl: string;
      timeout: number;
    };
    vertexAI: VertexAIConfig | null;
  };
  
  // 应用相关配置
  app: {
    env: string;
    baseUrl: string;
    enableLogging: boolean;
  };
  
  // CORS 相关配置
  cors: {
    allowedOrigins: string[];
  };
}

/**
 * Vertex AI 配置接口
 */
interface VertexAIConfig {
  projectId: string;
  location: string;
  serviceAccountKey: string; // JSON 格式的服务账号密钥
}

/**
 * 后端类型
 */
type BackendType = 'gemini' | 'vertex-ai';

/**
 * 获取环境变量，如果不存在则返回默认值
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * 获取布尔类型的环境变量
 */
function getBooleanEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * 获取数字类型的环境变量
 */
function getNumberEnvVar(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * 解析逗号分隔的字符串为数组
 */
function parseCommaSeparated(value: string): string[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * 解析 Vertex AI 服务账号密钥
 */
function parseServiceAccountKey(keyString: string): Record<string, unknown> {
  try {
    return JSON.parse(keyString);
  } catch {
    throw new Error('VERTEX_AI_SERVICE_ACCOUNT_KEY 格式不正确，应为有效的 JSON 字符串');
  }
}

/**
 * 应用配置对象
 */
export const config: AppConfig = {
  backend: {
    type: (getEnvVar('BACKEND_TYPE', 'gemini') as BackendType),
    gemini: {
      apiKey: getEnvVar('GEMINI_API_KEY'),
      baseUrl: getEnvVar('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
      timeout: getNumberEnvVar('REQUEST_TIMEOUT', 60000),
    },
    vertexAI: getEnvVar('VERTEX_AI_PROJECT_ID') ? {
      projectId: getEnvVar('VERTEX_AI_PROJECT_ID'),
      location: getEnvVar('VERTEX_AI_LOCATION', 'us-central1'),
      serviceAccountKey: getEnvVar('VERTEX_AI_SERVICE_ACCOUNT_KEY'),
    } : null,
  },
  
  app: {
    env: getEnvVar('NODE_ENV', 'development'),
    baseUrl: getEnvVar('NEXT_PUBLIC_APP_URL', ''),
    enableLogging: getBooleanEnvVar('ENABLE_REQUEST_LOGGING', false),
  },
  
  cors: {
    allowedOrigins: parseCommaSeparated(getEnvVar('ALLOWED_ORIGINS', '*')),
  },
};

/**
 * 更新配置验证
 */
export function validateConfig(): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 验证后端类型
  if (!['gemini', 'vertex-ai'].includes(config.backend.type)) {
    errors.push('BACKEND_TYPE 必须是 "gemini" 或 "vertex-ai"');
  }

  // 根据后端类型验证相应配置
  if (config.backend.type === 'gemini') {
    if (!config.backend.gemini.apiKey) {
      warnings.push('GEMINI_API_KEY 环境变量未设置 - 将依赖客户端提供 API 密钥');
    }
  } else if (config.backend.type === 'vertex-ai') {
    if (!config.backend.vertexAI) {
      errors.push('使用 Vertex AI 后端时，必须设置 VERTEX_AI_PROJECT_ID');
    } else {
      if (!config.backend.vertexAI.projectId) {
        errors.push('VERTEX_AI_PROJECT_ID 不能为空');
      }
      if (!config.backend.vertexAI.serviceAccountKey) {
        errors.push('VERTEX_AI_SERVICE_ACCOUNT_KEY 不能为空');
      } else {
        try {
          parseServiceAccountKey(config.backend.vertexAI.serviceAccountKey);
        } catch (error) {
          errors.push(`服务账号密钥格式错误: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 获取 CORS 配置
 */
export function getCorsHeaders(origin?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-goog-api-key',
    'Access-Control-Max-Age': '86400',
  };
  
  // 如果配置了特定的允许来源
  if (config.cors.allowedOrigins.length > 0 && !config.cors.allowedOrigins.includes('*')) {
    if (origin && config.cors.allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
  } else {
    // 默认允许所有来源
    headers['Access-Control-Allow-Origin'] = '*';
  }
  
  return headers;
}

/**
 * 开发环境下的配置检查
 */
if (config.app.env === 'development') {
  const validation = validateConfig();

  if (!validation.isValid) {
    console.warn('⚠️  配置验证失败:');
    validation.errors.forEach(error => {
      console.warn(`   - ${error}`);
    });
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  配置警告:');
    validation.warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
  }

  if (!validation.isValid) {
    console.warn('');
    console.warn('请检查您的 .env.local 文件配置。');
    console.warn('参考 .env.example 文件了解正确的配置格式。');
  } else if (validation.warnings.length === 0) {
    console.log('✅ 配置验证通过');
  } else {
    console.log('✅ 配置基本正常（有警告）');
  }
}


