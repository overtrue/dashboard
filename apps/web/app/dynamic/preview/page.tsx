'use client'

import { DynamicPageRenderer } from '@/components/dynamic-page-renderer'
import { ComponentDefinition, PageLayout } from '@/types/dynamic-page'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

export default function PreviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PreviewContent />
    </Suspense>
  );
}

function PreviewContent() {
  const searchParams = useSearchParams()
  const [layout, setLayout] = useState<PageLayout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const dataParam = searchParams.get('data')
    if (dataParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(dataParam))
        if (decodedData.layout) {
          setLayout(decodedData.layout)
        } else {
          setError('无效的预览数据')
        }
      } catch (err) {
        setError('数据解析失败')
      } finally {
        setLoading(false)
      }
    } else {
      setError('缺少预览数据')
      setLoading(false)
    }
  }, [searchParams])

  // 模拟预览数据
  const mockData = {
    users: [
      { id: 1, email: 'admin@example.com', role: 'admin', status: 'active', createdAt: '2024-01-01' },
      { id: 2, email: 'user@example.com', role: 'user', status: 'active', createdAt: '2024-01-02' },
      { id: 3, email: 'guest@example.com', role: 'guest', status: 'inactive', createdAt: '2024-01-03' },
    ],
    products: [
      { id: 1, name: 'Product A', price: 99.99, status: 'active', category: 'Electronics' },
      { id: 2, name: 'Product B', price: 149.99, status: 'active', category: 'Clothing' },
      { id: 3, name: 'Product C', price: 79.99, status: 'inactive', category: 'Books' },
    ],
    orders: [
      { id: 1, customer: 'John Doe', amount: 299.97, status: 'completed', date: '2024-01-15' },
      { id: 2, customer: 'Jane Smith', amount: 149.99, status: 'pending', date: '2024-01-16' },
    ],
    analytics: {
      totalUsers: 1250,
      totalProducts: 89,
      totalOrders: 456,
      revenue: 125000
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载预览中...</p>
        </div>
      </div>
    )
  }

  if (error || !layout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">预览加载失败</div>
          <p className="text-muted-foreground">{error || '未知错误'}</p>
        </div>
      </div>
    )
  }

  // 将 PageLayout 转换为 ComponentDefinition
  const containerDefinition: ComponentDefinition = {
    type: 'container',
    props: {
      className: 'min-h-screen bg-background',
      maxWidth: layout.config?.maxWidth || 'full',
      padding: layout.config?.padding || 'medium'
    },
    children: layout.sections.map(section => section.component)
  }

  return (
    <div className="min-h-screen bg-background">
      <DynamicPageRenderer
        definition={containerDefinition}
        data={mockData}
        onEvent={(event) => {
          // 预览模式下，只记录事件，不执行实际操作
          console.log('Preview event:', event)
        }}
      />
    </div>
  )
}
