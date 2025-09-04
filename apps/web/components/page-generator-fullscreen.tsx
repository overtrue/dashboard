'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { PageSuggestion } from '@/types/dynamic-page'
import { useEffect, useRef, useState } from 'react'

import {
    RiCheckLine,
    RiCloseLine,
    RiEyeLine,
    RiMagicLine,
    RiRefreshLine,
    RiSaveLine,
    RiSparklingLine
} from '@remixicon/react'

interface PageGeneratorFullscreenProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PageGeneratorFullscreen({ open, onOpenChange }: PageGeneratorFullscreenProps) {
  const [prompt, setPrompt] = useState('')
  const [suggestions, setSuggestions] = useState<PageSuggestion[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState<PageSuggestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  // 保存表单数据
  const [saveForm, setSaveForm] = useState({
    title: '',
    description: '',
    icon: 'RiFileLine',
    addToMenu: false,
    menuSection: 'user_custom' as 'user_custom' | 'admin_fixed'
  })

  const iframeRef = useRef<HTMLIFrameElement>(null)

  // 生成预览URL
  useEffect(() => {
    if (selectedSuggestion) {
      const previewData = {
        layout: selectedSuggestion.layout,
        timestamp: Date.now()
      }
      const encodedData = encodeURIComponent(JSON.stringify(previewData))
      setPreviewUrl(`/dynamic/preview?data=${encodedData}`)
    }
  }, [selectedSuggestion])

  const handleGeneratePage = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || '生成失败，请稍后重试')
      }
    } catch (error) {
      console.error('Error generating page:', error)
      setError('网络错误，请检查连接后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSuggestion = (suggestion: PageSuggestion) => {
    setSelectedSuggestion(suggestion)
    setSaveForm(prev => ({
      ...prev,
      title: suggestion.title,
      description: suggestion.description || ''
    }))
  }

  const handleSavePage = async () => {
    if (!selectedSuggestion || !saveForm.title.trim()) return

    try {
      const response = await fetch('/api/dynamic-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: saveForm.title,
          description: saveForm.description,
          icon: saveForm.icon,
          layout: selectedSuggestion.layout,
          addToMenu: saveForm.addToMenu,
          menuSection: saveForm.menuSection
        })
      })

      if (response.ok) {
        const savedPage = await response.json()
        // 可以添加成功提示
        onOpenChange(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || '保存失败，请稍后重试')
      }
    } catch (error) {
      console.error('Error saving page:', error)
      setError('网络错误，请检查连接后重试')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleReset = () => {
    setPrompt('')
    setSuggestions([])
    setSelectedSuggestion(null)
    setError(null)
    setSaveForm({
      title: '',
      description: '',
      icon: 'RiFileLine',
      addToMenu: false,
      menuSection: 'user_custom'
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* 顶部导航栏 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <RiMagicLine className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">AI 页面生成器</h1>
            <Badge variant="secondary" className="ml-2">
              智能生成
            </Badge>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RiRefreshLine className="h-4 w-4 mr-2" />
              重置
            </Button>
            <Button variant="outline" size="sm" onClick={handleClose}>
              <RiCloseLine className="h-4 w-4 mr-2" />
              退出
            </Button>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧面板 - 对话和配置 */}
        <div className="w-[500px] border-r bg-muted/30 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            {/* 输入需求 */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  描述你想要的页面功能
                </label>
                <Textarea
                  placeholder="例如：一个用户管理界面，可以增删改查用户，支持状态筛选和搜索功能..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  详细描述页面需要的功能，AI会为您生成多个设计方案
                </p>
              </div>

              <Button
                onClick={handleGeneratePage}
                disabled={loading || !prompt.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RiRefreshLine className="h-4 w-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <RiMagicLine className="h-4 w-4 mr-2" />
                    生成页面方案
                  </>
                )}
              </Button>
            </div>

            {/* 错误提示 */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 生成建议 */}
            {suggestions.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <RiSparklingLine className="h-5 w-5 text-primary" />
                  生成的方案
                </h3>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <Card
                      key={index}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedSuggestion === suggestion && "ring-2 ring-primary"
                      )}
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          {suggestion.title}
                          {selectedSuggestion === suggestion && (
                            <RiCheckLine className="h-4 w-4 text-primary" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">
                          {suggestion.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 保存表单 */}
            {selectedSuggestion && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <RiSaveLine className="h-5 w-5 text-primary" />
                  保存页面
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      页面标题
                    </label>
                    <input
                      type="text"
                      value={saveForm.title}
                      onChange={(e) => setSaveForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="输入页面标题"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      页面描述
                    </label>
                    <Textarea
                      value={saveForm.description}
                      onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-[80px] resize-none"
                      placeholder="输入页面描述（可选）"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      图标
                    </label>
                    <Select
                      value={saveForm.icon}
                      onValueChange={(value) => setSaveForm(prev => ({ ...prev, icon: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RiFileLine">文件</SelectItem>
                        <SelectItem value="RiUserLine">用户</SelectItem>
                        <SelectItem value="RiSettingsLine">设置</SelectItem>
                        <SelectItem value="RiDashboardLine">仪表板</SelectItem>
                        <SelectItem value="RiTableLine">表格</SelectItem>
                        <SelectItem value="RiChartLine">图表</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="addToMenu"
                      checked={saveForm.addToMenu}
                      onCheckedChange={(checked) =>
                        setSaveForm(prev => ({ ...prev, addToMenu: checked as boolean }))
                      }
                    />
                    <label htmlFor="addToMenu" className="text-sm font-medium">
                      添加到菜单
                    </label>
                  </div>

                  {saveForm.addToMenu && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        菜单分组
                      </label>
                      <Select
                        value={saveForm.menuSection}
                        onValueChange={(value: 'user_custom' | 'admin_fixed') =>
                          setSaveForm(prev => ({ ...prev, menuSection: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user_custom">用户自定义</SelectItem>
                          <SelectItem value="admin_fixed">管理员固定</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button
                    onClick={handleSavePage}
                    disabled={!saveForm.title.trim()}
                    className="w-full"
                  >
                    <RiSaveLine className="h-4 w-4 mr-2" />
                    保存页面
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧面板 - 预览区域 */}
        <div className="flex-1 bg-background">
          {previewUrl ? (
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-full border-0"
              title="页面预览"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <RiEyeLine className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">选择方案后在此处预览页面效果</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
