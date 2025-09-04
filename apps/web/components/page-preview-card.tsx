'use client'

import React from 'react'
import { DynamicPageRenderer } from './dynamic-page-renderer'
import { PageSuggestion } from '@/types/dynamic-page'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { RiCheckLine, RiEyeLine } from '@remixicon/react'

interface PagePreviewCardProps {
  suggestion: PageSuggestion
  isSelected?: boolean
  onSelect: (suggestion: PageSuggestion) => void
  className?: string
}

export function PagePreviewCard({ 
  suggestion, 
  isSelected = false, 
  onSelect,
  className 
}: PagePreviewCardProps) {
  // 创建用于预览的组件定义
  const previewDefinition = {
    type: 'container' as const,
    props: {
      maxWidth: 'full',
      padding: 'small',
      className: 'min-h-[300px] bg-background border rounded-lg overflow-hidden'
    },
    children: suggestion.layout.sections.map(section => ({
      ...section.component,
      // 为预览优化：简化数据和样式
      props: {
        ...section.component.props,
        className: cn(section.component.props?.className, 'scale-90 origin-top-left transform'),
      }
    }))
  }

  // 模拟预览数据
  const mockData = {
    users: [
      { email: 'admin@example.com', role: 'admin', createdAt: '2024-01-01' },
      { email: 'user@example.com', role: 'user', createdAt: '2024-01-02' },
    ],
    products: [
      { name: 'Product A', price: 99.99, status: 'active' },
      { name: 'Product B', price: 149.99, status: 'inactive' },
    ]
  }

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg',
        isSelected && 'ring-2 ring-primary shadow-lg',
        className
      )}
      onClick={() => onSelect(suggestion)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{suggestion.title}</CardTitle>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <RiCheckLine className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {suggestion.description}
            </p>
          </div>
          <Badge variant="outline" className="ml-3">
            匹配度 {suggestion.confidence}%
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* 实际页面预览 */}
        <div className="bg-muted/20 rounded-lg p-4 mb-4">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <RiEyeLine className="w-3 h-3" />
            实时预览
          </div>
          <div className="bg-white dark:bg-gray-900 rounded border min-h-[250px] overflow-hidden">
            <div className="scale-75 origin-top-left w-[133%] h-[133%]">
              <DynamicPageRenderer 
                definition={previewDefinition} 
                data={mockData}
                onEvent={() => {}} // 预览模式下禁用事件
              />
            </div>
          </div>
        </div>

        {/* 方案描述 */}
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">布局特点：</span>
            <span className="text-muted-foreground ml-1">{suggestion.preview}</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">AI 分析：</span>
            <span className="ml-1">{suggestion.reasoning}</span>
          </div>
        </div>

        {/* 选择按钮 */}
        <div className="mt-4 pt-3 border-t">
          <Button 
            onClick={(e) => {
              e.stopPropagation()
              onSelect(suggestion)
            }}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="w-full"
          >
            {isSelected ? '已选择此方案' : '选择此方案'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}