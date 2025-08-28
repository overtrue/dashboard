// AI提供者配置
export const aiConfig = {
  // 默认AI提供者
  defaultProvider: process.env.AI_PROVIDER || 'openai',

  // OpenAI配置
  openai: {
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  },

  // Anthropic配置
  anthropic: {
    model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
    maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '1000'),
    temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7'),
  },
};

// 获取AI模型实例 - 简化版本
export function getAIModel() {
  // 返回一个基本的模型配置对象
  return {
    name: aiConfig.defaultProvider === 'anthropic' ? aiConfig.anthropic.model : aiConfig.openai.model,
    provider: aiConfig.defaultProvider,
  };
}

// 获取模型配置
export function getModelConfig() {
  const provider = aiConfig.defaultProvider;

  switch (provider) {
    case 'anthropic':
      return {
        maxTokens: aiConfig.anthropic.maxTokens,
        temperature: aiConfig.anthropic.temperature,
      };
    case 'openai':
    default:
      return {
        maxTokens: aiConfig.openai.maxTokens,
        temperature: aiConfig.openai.temperature,
      };
  }
}

// 验证环境变量
export function validateAIEnvironment() {
  const requiredVars = [];

  if (aiConfig.defaultProvider === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      requiredVars.push('OPENAI_API_KEY');
    }
  } else if (aiConfig.defaultProvider === 'anthropic') {
    if (!process.env.ANTHROPIC_API_KEY) {
      requiredVars.push('ANTHROPIC_API_KEY');
    }
  }

  if (requiredVars.length > 0) {
    throw new Error(
      `缺少必需的AI环境变量: ${requiredVars.join(', ')}`
    );
  }
}
