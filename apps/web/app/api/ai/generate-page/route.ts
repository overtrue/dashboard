import { NextRequest, NextResponse } from 'next/server'
import { aiPageGenerator } from '@/lib/ai-page-generator'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()
    
    // 验证输入
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: '请输入有效的页面需求描述（至少3个字符）' },
        { status: 400 }
      )
    }
    
    if (prompt.length > 1000) {
      return NextResponse.json(
        { error: '需求描述过长，请控制在1000字符以内' },
        { status: 400 }
      )
    }
    
    // 生成页面方案
    const suggestions = await aiPageGenerator.generatePageSuggestions(prompt.trim())
    
    return NextResponse.json({
      success: true,
      prompt: prompt.trim(),
      suggestions,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Error generating page suggestions:', error)
    return NextResponse.json(
      { 
        error: 'AI页面生成服务暂时不可用，请稍后重试',
        details: error.message 
      },
      { status: 500 }
    )
  }
}