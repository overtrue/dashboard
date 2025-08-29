'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { UserFormData } from '@/types/user'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

// 用户表单验证模式
const userFormSchema = z.object({
  email: z.string()
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址')
    .max(255, '邮箱地址不能超过255个字符'),
  password: z.string()
    .min(6, '密码至少6个字符')
    .max(100, '密码不能超过100个字符'),
  role: z.enum(['admin', 'user'], {
    required_error: '请选择用户角色',
  }),
})

// 编辑时密码可选的验证模式
const userEditSchema = z.object({
  email: z.string()
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址')
    .max(255, '邮箱地址不能超过255个字符'),
  password: z.string()
    .max(100, '密码不能超过100个字符')
    .optional()
    .or(z.literal('')),
  role: z.enum(['admin', 'user'], {
    required_error: '请选择用户角色',
  }),
})

interface UserFormProps {
  user?: Partial<UserFormData & { id: string }>
  mode: 'add' | 'edit'
  onSave: (data: UserFormData) => void
  onCancel: () => void
  loading?: boolean
}

const roleOptions = [
  { value: 'admin', label: '管理员' },
  { value: 'user', label: '用户' },
]

export function UserForm({ 
  user, 
  mode, 
  onSave, 
  onCancel, 
  loading = false 
}: UserFormProps) {
  const isEditMode = mode === 'edit'
  const schema = isEditMode ? userEditSchema : userFormSchema
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user?.email || '',
      password: '',
      role: user?.role || 'user',
    },
  })

  const handleSubmit = (data: UserFormData) => {
    // 编辑模式下如果密码为空，则不更新密码
    if (isEditMode && !data.password) {
      const { password, ...dataWithoutPassword } = data
      onSave(dataWithoutPassword as UserFormData)
    } else {
      onSave(data)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>邮箱地址 *</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="输入邮箱地址"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  密码 {isEditMode ? '(留空则不修改)' : '*'}
                </FormLabel>
                <FormControl>
                  <Input 
                    type="password"
                    placeholder={isEditMode ? '输入新密码（可选）' : '输入密码'}
                    {...field}
                  />
                </FormControl>
                {!isEditMode && (
                  <p className="text-xs text-muted-foreground">
                    密码至少6个字符
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>用户角色 *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择用户角色" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roleOptions.map((option) => (
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
              {loading ? '保存中...' : (isEditMode ? '更新' : '创建')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}