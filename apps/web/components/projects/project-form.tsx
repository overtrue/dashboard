'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ProjectFormData } from '@/types/project'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { RiSaveLine, RiCloseLine } from '@remixicon/react'

// 简化的表单验证模式
const projectFormSchema = z.object({
  name: z.string().min(1, '项目名称不能为空').max(100, '项目名称不能超过100个字符'),
  description: z.string().optional(),
  owner: z.string().optional(),
  team: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
})

interface ProjectFormProps {
  project?: Partial<ProjectFormData>
  mode: 'add' | 'edit'
  onSave: (data: ProjectFormData) => void
  onCancel: () => void
  loading?: boolean
}

const environmentOptions = [
  { value: 'development', label: '开发环境' },
  { value: 'staging', label: '测试环境' },
  { value: 'production', label: '生产环境' },
]

export function ProjectForm({ 
  project, 
  mode, 
  onSave, 
  onCancel, 
  loading = false 
}: ProjectFormProps) {
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      owner: project?.owner || '',
      team: project?.team || [],
      tags: project?.tags || [],
      environment: project?.environment || 'development',
    },
  })

  const handleSubmit = (data: ProjectFormData) => {
    onSave(data)
  }

  const parseArrayInput = (value: string): string[] => {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0)
  }

  const arrayToString = (arr: string[] | undefined): string => {
    return arr ? arr.join(', ') : ''
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>项目名称 *</FormLabel>
                <FormControl>
                  <Input placeholder="输入项目名称" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>项目描述</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="描述项目的目标、范围和关键特性"
                    className="min-h-20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>项目负责人</FormLabel>
                  <FormControl>
                    <Input placeholder="输入负责人姓名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="environment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>部署环境</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择部署环境" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {environmentOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="team"
            render={({ field }) => (
              <FormItem>
                <FormLabel>团队成员</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="输入团队成员姓名，用逗号分隔"
                    value={arrayToString(field.value)}
                    onChange={(e) => field.onChange(parseArrayInput(e.target.value))}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  多个成员用逗号分隔，例如：张三, 李四, 王五
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>项目标签</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="输入项目标签，用逗号分隔"
                    value={arrayToString(field.value)}
                    onChange={(e) => field.onChange(parseArrayInput(e.target.value))}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  多个标签用逗号分隔，例如：ai, nlp, 客服
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <RiCloseLine className="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              <RiSaveLine className="mr-2 h-4 w-4" />
              {loading ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}