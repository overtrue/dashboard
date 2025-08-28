import { getAIModel, getModelConfig, validateAIEnvironment } from '@/lib/ai-config';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 验证AI环境配置
    validateAIEnvironment();

    const { messages } = await req.json();
    const model = getAIModel();
    const config = getModelConfig();

    // 简化的AI响应 - 在实际应用中，这里会调用真实的AI API
    const lastMessage = messages[messages.length - 1];
    const response = {
      content: `这是来自${model.name}的回复。您说："${lastMessage.content}"。在实际应用中，这里会调用真实的AI服务。`,
      model: model.name,
      provider: model.provider,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('AI聊天API错误:', error);
    return new Response(
      JSON.stringify({ error: 'AI服务暂时不可用，请稍后重试' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
