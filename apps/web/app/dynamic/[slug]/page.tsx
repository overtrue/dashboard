'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DynamicPageRenderer } from '@/components/dynamic-page-renderer'
import { ComponentDefinition } from '@/types/dynamic-page'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RiArrowLeftLine } from '@remixicon/react'

export default function DynamicPage() {
  const params = useParams()
  const router = useRouter()
  const [pageDefinition, setPageDefinition] = useState<ComponentDefinition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPage()
  }, [params.slug])

  const loadPage = async () => {
    try {
      setLoading(true)
      setError(null)

      // 通过页面路径查找页面ID
      const pagesResponse = await fetch('/api/dynamic-pages')
      if (!pagesResponse.ok) {
        throw new Error('获取页面列表失败')
      }

      const pages = await pagesResponse.json()
      const targetPath = `/dynamic/${params.slug}`
      const page = pages.find((p: any) => p.path === targetPath)

      if (!page) {
        throw new Error('页面不存在')
      }

      // 获取页面渲染定义
      const renderResponse = await fetch(`/api/dynamic-pages/${page.id}/render`)
      if (!renderResponse.ok) {
        throw new Error('页面渲染失败')
      }

      const renderData = await renderResponse.json()
      setPageDefinition(renderData.component)
    } catch (error: any) {
      console.error('Error loading dynamic page:', error)
      setError(error.message || '页面加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEvent = (eventType: string, eventData: any) => {
    console.log('Page event:', eventType, eventData)
    
    // 处理特殊事件
    switch (eventType) {
      case 'refresh':
        loadPage()
        break
      case 'navigate':
        if (eventData.path) {
          router.push(eventData.path)
        }
        break
      default:
        // 其他事件处理
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Alert className="mb-4">
            <div className="font-medium mb-2">页面加载失败</div>
            <div className="text-sm">{error}</div>
          </Alert>
          <div className="space-x-4">
            <Button onClick={loadPage}>重试</Button>
            <Button variant="outline" onClick={() => router.back()}>
              <RiArrowLeftLine className="h-4 w-4 mr-2" />
              返回
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!pageDefinition) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">页面定义为空</div>
          <Button variant="outline" onClick={() => router.back()}>
            <RiArrowLeftLine className="h-4 w-4 mr-2" />
            返回
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DynamicPageRenderer 
        definition={pageDefinition} 
        onEvent={handleEvent}
      />
    </div>
  )
}