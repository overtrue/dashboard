'use client'

import * as React from 'react'
import { useState } from 'react'
import type { DataSourceProtocol, DataSourceFormData, DataSourceTestResult } from '@/types/datasource'
import { dataSourceService } from '@/lib/datasource-service'
import { dataSourceTypeLabels, dataSourceValidation } from '@/types/datasource'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  RiTestTubeLine,
  RiCheckLine,
  RiCloseLine,
  RiLoaderLine,
  RiAddLine,
  RiCloseCircleLine
} from '@remixicon/react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Form validation schema
const baseSchema = {
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  type: z.enum(['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'mssql', 'oracle', 'api', 'csv', 'json', 'excel']),
  description: z.string().optional(),
  tags: z.array(z.string()).optional()
}

const configSchema = z.object({
  host: z.string().optional(),
  port: z.number().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  database: z.string().optional(),
  filename: z.string().optional(),
  url: z.string().optional(),
  ssl: z.boolean().optional(),
  timeout: z.number().optional(),
  charset: z.string().optional(),
  timezone: z.string().optional()
})

const formSchema = z.object({
  ...baseSchema,
  config: configSchema
})

type FormData = z.infer<typeof formSchema>

interface DataSourceFormProps {
  dataSource?: DataSourceProtocol
  onSave?: (dataSource: DataSourceProtocol) => void
  onCancel?: () => void
  mode?: 'add' | 'edit'
}

export function DataSourceForm({ dataSource, onSave, onCancel, mode = 'add' }: DataSourceFormProps) {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<DataSourceTestResult | null>(null)
  const [newTag, setNewTag] = useState('')

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: dataSource?.name || '',
      type: dataSource?.type || 'mysql',
      description: dataSource?.description || '',
      tags: dataSource?.tags || [],
      config: dataSource?.config || {
        host: '',
        port: undefined,
        username: '',
        password: '',
        database: '',
        filename: '',
        url: '',
        ssl: false,
        timeout: 5000,
        charset: 'utf8mb4',
        timezone: 'UTC'
      }
    }
  })

  const selectedType = form.watch('type')

  // Reset test result when any configuration changes
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && name.startsWith('config.')) {
        setTestResult(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Dynamic validation based on selected type
  const validateConfig = () => {
    const config = form.getValues('config')
    const validation = dataSourceValidation[selectedType]
    
    if (!validation) return true
    
    const missing = validation.required.filter(key => !config[key as keyof typeof config])
    if (missing.length > 0) {
      form.setError('config', {
        type: 'manual',
        message: `Missing required fields: ${missing.join(', ')}`
      })
      return false
    }
    
    return true
  }

  const handleTestConnection = async () => {
    if (!validateConfig()) return
    
    setTesting(true)
    setTestResult(null)
    
    try {
      const config = form.getValues('config')
      const result = await dataSourceService.testConnection(selectedType, config)
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSubmit = async (data: FormData) => {
    if (!validateConfig()) return

    // For edit mode, require validation when config changes
    if (mode === 'edit' && dataSource) {
      const config = form.getValues('config')
      const originalConfig = dataSource.config
      const hasConfigChanged = JSON.stringify(config) !== JSON.stringify(originalConfig)
      
      if (hasConfigChanged && (!testResult || !testResult.success)) {
        setTestResult({
          success: false,
          message: 'Please test the connection before saving changes',
          error: 'Connection must be validated after configuration changes'
        })
        return
      }
    }

    try {
      const formData: DataSourceFormData = {
        name: data.name,
        type: data.type,
        description: data.description,
        config: data.config,
        tags: data.tags
      }

      let result: DataSourceProtocol
      
      if (mode === 'edit' && dataSource) {
        result = await dataSourceService.updateDataSource(dataSource.id, {
          ...formData,
          isActive: true,
          isValid: testResult?.success ?? true,
          lastTested: new Date()
        })
      } else {
        result = await dataSourceService.createDataSource({
          ...formData,
          isActive: true,
          isValid: true,
          lastTested: new Date()
        })
      }

      onSave?.(result)
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: `Failed to ${mode} data source: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  const handleAddTag = () => {
    if (newTag.trim()) {
      const currentTags = form.getValues('tags') || []
      if (!currentTags.includes(newTag.trim())) {
        form.setValue('tags', [...currentTags, newTag.trim()])
      }
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || []
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove))
  }

  const renderConfigFields = () => {
    const config = dataSourceValidation[selectedType]
    if (!config) return null

    const fields = [
      ...config.required.map(key => ({ key, required: true })),
      ...config.optional.map(key => ({ key, required: false }))
    ]

    return fields.map(({ key, required }) => {
      const fieldConfig: Record<string, { label: string; type: string; placeholder?: string }> = {
        host: { label: 'Host', type: 'text', placeholder: 'localhost' },
        port: { label: 'Port', type: 'number', placeholder: selectedType === 'mysql' ? '3306' : selectedType === 'postgresql' ? '5432' : selectedType === 'mongodb' ? '27017' : selectedType === 'redis' ? '6379' : '' },
        username: { label: 'Username', type: 'text', placeholder: 'user' },
        password: { label: 'Password', type: 'password', placeholder: '••••••' },
        database: { label: 'Database', type: 'text', placeholder: 'database_name' },
        filename: { label: 'File Path', type: 'text', placeholder: '/path/to/file' },
        url: { label: 'URL', type: 'url', placeholder: 'https://api.example.com' },
        ssl: { label: 'SSL', type: 'switch' },
        timeout: { label: 'Timeout (ms)', type: 'number', placeholder: '5000' },
        charset: { label: 'Charset', type: 'text', placeholder: 'utf8mb4' },
        timezone: { label: 'Timezone', type: 'text', placeholder: 'UTC' }
      }

      const configKey = key as keyof typeof fieldConfig
      const field = fieldConfig[configKey]
      if (!field) return null

      const renderField = () => {
        if (field.type === 'switch') {
          return (
            <FormField
              key={key}
              name={`config.${key}` as any}
              control={form.control}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label} {required && <span className="text-destructive">*</span>}</FormLabel>
                  <FormControl>
                    <Switch 
                      checked={Boolean(formField.value)} 
                      onCheckedChange={formField.onChange} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        }

        return (
          <FormField
            key={key}
            name={`config.${key}` as keyof DataSourceFormData}
            control={form.control}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {required && <span className="text-destructive">*</span>}</FormLabel>
                <FormControl>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    {...formField}
                    value={String(formField.value || '')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      }

      return renderField()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardDescription>
              Configure your database connection settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Production Database" {...field} />
                      </FormControl>
                      <FormDescription>A descriptive name for your data source</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="type"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Source Type <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a data source type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(dataSourceTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Choose the type of data source to connect to</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of this data source..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Optional description for documentation purposes</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="tags"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add tag..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddTag()
                              }
                            }}
                          />
                          <Button type="button" variant="outline" onClick={handleAddTag}>
                            <RiAddLine className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-3 w-3 p-0"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              <RiCloseCircleLine className="h-2.5 w-2.5" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <FormDescription>Add tags to categorize your data sources</FormDescription>
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Configuration Tab */}
              <TabsContent value="config" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {(() => {
                    const config = dataSourceValidation[selectedType]
                    if (!config) return null

                    const fields = [
                      ...config.required.map(key => ({ key, required: true })),
                      ...config.optional.map(key => ({ key, required: false }))
                    ]

                    const fieldConfig: Record<string, { label: string; type: string; placeholder?: string }> = {
                      host: { label: 'Host', type: 'text', placeholder: 'localhost' },
                      port: { label: 'Port', type: 'number', placeholder: selectedType === 'mysql' ? '3306' : selectedType === 'postgresql' ? '5432' : selectedType === 'mongodb' ? '27017' : selectedType === 'redis' ? '6379' : '' },
                      username: { label: 'Username', type: 'text', placeholder: 'user' },
                      password: { label: 'Password', type: 'password', placeholder: '••••••' },
                      database: { label: 'Database', type: 'text', placeholder: 'database_name' },
                      filename: { label: 'File Path', type: 'text', placeholder: '/path/to/file' },
                      url: { label: 'URL', type: 'url', placeholder: 'https://api.example.com' },
                      ssl: { label: 'SSL', type: 'switch' },
                      timeout: { label: 'Timeout (ms)', type: 'number', placeholder: '5000' },
                      charset: { label: 'Charset', type: 'text', placeholder: 'utf8mb4' },
                      timezone: { label: 'Timezone', type: 'text', placeholder: 'UTC' }
                    }

                    return fields.map(({ key, required }) => {
                      const configKey = key as keyof typeof fieldConfig
                      const field = fieldConfig[configKey]
                      if (!field) return null

                      if (key === 'ssl') {
                        return (
                          <div key={key} className="space-y-2">
                            <Label>
                              {field.label} {required && <span className="text-destructive">*</span>}
                            </Label>
                            <Switch
                              checked={form.watch(`config.${key}`) || false}
                              onCheckedChange={(checked) => form.setValue(`config.${key}`, checked)}
                            />
                          </div>
                        )
                      }

                      return (
                        <div key={key} className="space-y-2">
                          <Label>
                            {field.label} {required && <span className="text-destructive">*</span>}
                          </Label>
                          <Input
                            type={field.type}
                            placeholder={field.placeholder}
                            {...form.register(`config.${key}` as keyof DataSourceFormData)}
                          />
                        </div>
                      )
                    })
                  })()}
                </div>
              </TabsContent>

            </Tabs>

            {form.formState.errors.root && (
              <Alert variant="destructive">
                <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          {testResult && (
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <RiCheckLine className="h-4 w-4 text-green-500" />
              ) : (
                <RiCloseLine className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {testResult.success ? 'Connected' : 'Failed'}
              </span>
            </div>
          )}
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          {mode === 'add' ? (
            <>
              {!testResult?.success ? (
                <Button 
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="flex items-center gap-2"
                >
                  {testing ? (
                    <>
                      <RiLoaderLine className="h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RiTestTubeLine className="h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  type="submit"
                  className="flex items-center gap-2"
                >
                  <RiCheckLine className="h-4 w-4" />
                  Create Data Source
                </Button>
              )}
            </>
          ) : (
            <>
              {!testResult?.success ? (
                <Button 
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="flex items-center gap-2"
                >
                  {testing ? (
                    <>
                      <RiLoaderLine className="h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RiTestTubeLine className="h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  type="submit"
                  className="flex items-center gap-2"
                >
                  <RiCheckLine className="h-4 w-4" />
                  Save Changes
                </Button>
              )}
            </>
          )}
        </div>
      </form>
    </Form>
  )
}

export default DataSourceForm