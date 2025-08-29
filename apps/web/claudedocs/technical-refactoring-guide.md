# Technical Refactoring Guide

## Immediate Fixes - Quick Wins

### 1. Console Error Handling
**File**: Multiple files contain `console.error` without user feedback

**Current Issues**:
```typescript
// ❌ Poor error handling
} catch (error) {
  console.error('Failed to load data sources:', error)
}
```

**Fix**:
```typescript
// ✅ Proper error handling with user feedback
import { toast } from '@/components/ui/use-toast'

catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error occurred'
  toast({
    title: 'Failed to load data sources',
    description: message,
    variant: 'destructive'
  })
  // Log to error service in production
  console.error('DataSourceService.loadDataSources:', error)
}
```

### 2. Duplicate Code Elimination

**Location**: `data-source-form.tsx:230-246` and `data-source-form.tsx:432-444`

**Current Duplication**:
```typescript
// ❌ Duplicated field configurations
const fieldConfig = {
  host: { label: 'Host', type: 'text', placeholder: 'localhost' },
  // ... 12 more duplicated fields
}
```

**Extract to**: `lib/datasource-config.ts`
```typescript
export const createFieldConfig = (type: DataSourceType) => ({
  host: { label: 'Host', type: 'text', placeholder: 'localhost' },
  port: { 
    label: 'Port', 
    type: 'number', 
    placeholder: getDefaultPort(type) 
  },
  // ... centralized configuration
})

function getDefaultPort(type: DataSourceType): string {
  const ports = {
    mysql: '3306',
    postgresql: '5432',
    mongodb: '27017',
    redis: '6379'
  }
  return ports[type] || ''
}
```

### 3. Component Size Reduction

**Target**: `DataSourceForm.tsx` (575 lines) → 5 components (<100 lines each)

#### Extract `ConfigFieldRenderer`
```typescript
// components/datasource/shared/ConfigFieldRenderer.tsx
import { forwardRef } from 'react'

interface ConfigFieldProps {
  name: string
  label: string
  type: string
  required?: boolean
  placeholder?: string
  value?: any
  onChange?: (value: any) => void
}

export const ConfigFieldRenderer = forwardRef<
  HTMLInputElement, 
  ConfigFieldProps
>(({ name, label, type, required, placeholder, ...props }) => {
  if (type === 'switch') {
    return (
      <div className="space-y-2">
        <Label>{label}{required && <span className="text-destructive">*</span>}</Label>
        <Switch {...props} />
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      <Label>{label}{required && <span className="text-destructive">*</span>}</Label>
      <Input type={type} placeholder={placeholder} {...props} />
    </div>
  )
})
```

#### Extract `ConnectionTester` Component
```typescript
// components/datasource/shared/ConnectionTester.tsx
import { useState } from 'react'
import { dataSourceService } from '@/lib/datasource-service'

interface ConnectionTesterProps {
  type: DataSourceType
  config: DataSourceConnectionConfig
  onTestComplete?: (result: DataSourceTestResult) => void
}

export function ConnectionTester({ type, config, onTestComplete }: ConnectionTesterProps) {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<DataSourceTestResult | null>(null)

  const handleTest = async () => {
    setTesting(true)
    try {
      const testResult = await dataSourceService.testConnection(type, config)
      setResult(testResult)
      onTestComplete?.(testResult)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={handleTest} 
        disabled={testing}
        variant="outline"
      >
        {testing ? 'Testing...' : 'Test Connection'}
      </Button>
      {result && (
        <span className={result.success ? 'text-green-600' : 'text-red-600'}>
          {result.message}
        </span>
      )}
    </div>
  )
}
```

### 4. Performance Optimization

#### Debounced Search Implementation
```typescript
// hooks/useDebouncedSearch.ts
import { useState, useEffect, useMemo } from 'react'

export function useDebouncedSearch<T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean,
  delay = 300
) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, delay)

    return () => clearTimeout(handler)
  }, [query, delay])

  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) return items
    return items.filter(item => searchFn(item, debouncedQuery))
  }, [items, debouncedQuery, searchFn])

  return { query, setQuery, filteredItems }
}
```

#### Usage in DataSourceList
```typescript
// Refactored DataSourceList with performance improvements
const { query, setQuery, filteredItems } = useDebouncedSearch(
  dataSources,
  (source, searchTerm) => {
    return source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           source.description?.toLowerCase().includes(searchTerm.toLowerCase())
  },
  300
)
```

### 5. Type Safety Improvements

#### Create Proper Enums
```typescript
// types/datasource.ts - Replace string literals
export enum DataSourceType {
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb',
  REDIS = 'redis',
  SQLITE = 'sqlite',
  MSSQL = 'mssql',
  ORACLE = 'oracle',
  API = 'api',
  CSV = 'csv',
  JSON = 'json',
  EXCEL = 'excel'
}

export const DataSourceTypeLabels: Record<DataSourceType, string> = {
  [DataSourceType.MYSQL]: 'MySQL',
  [DataSourceType.POSTGRESQL]: 'PostgreSQL',
  // ... etc
}
```

#### Runtime Type Validation
```typescript
// lib/validation/datasource-validation.ts
import { z } from 'zod'

const dataSourceConfigSchema = z.object({
  host: z.string().optional(),
  port: z.number().min(1).max(65535).optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  database: z.string().optional(),
  filename: z.string().optional(),
  url: z.string().url().optional()
})

export const validateDataSourceConfig = (config: unknown) => {
  return dataSourceConfigSchema.safeParse(config)
}
```

### 6. State Management with Context

```typescript
// contexts/DataSourceContext.tsx
import { createContext, useContext, useReducer, useEffect } from 'react'
import { dataSourceService } from '@/lib/datasource-service'

interface DataSourceState {
  dataSources: DataSourceProtocol[]
  loading: boolean
  error: string | null
  filters: DataSourceFilters
}

interface DataSourceContextType extends DataSourceState {
  addDataSource: (data: DataSourceFormData) => Promise<void>
  updateDataSource: (id: string, data: Partial<DataSourceProtocol>) => Promise<void>
  deleteDataSource: (id: string) => Promise<void>
  setFilters: (filters: DataSourceFilters) => void
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined)

export const DataSourceProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(dataSourceReducer, initialState)

  useEffect(() => {
    loadDataSources()
  }, [])

  const loadDataSources = async () => {
    dispatch({ type: 'LOAD_START' })
    try {
      const sources = await dataSourceService.getDataSources()
      dispatch({ type: 'LOAD_SUCCESS', payload: sources })
    } catch (error) {
      dispatch({ 
        type: 'LOAD_ERROR', 
        payload: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  return (
    <DataSourceContext.Provider value={{...state, loadDataSources}}>
      {children}
    </DataSourceContext.Provider>
  )
}

export const useDataSources = () => {
  const context = useContext(DataSourceContext)
  if (!context) {
    throw new Error('useDataSources must be used within DataSourceProvider')
  }
  return context
}
```

### 7. Error Boundary Implementation

```typescript
// components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class DataSourceErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DataSourceErrorBoundary:', error, errorInfo)
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-200 rounded-md bg-red-50">
          <h2 className="text-lg font-semibold text-red-800">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-red-600">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 text-sm text-red-600 underline"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 8. Testing Strategy

```typescript
// __tests__/datasource/ConfigField.test.tsx
import { render, screen } from '@testing-library/react'
import { ConfigFieldRenderer } from '@/components/datasource/shared/ConfigFieldRenderer'

describe('ConfigFieldRenderer', () => {
  it('renders text input correctly', () => {
    render(
      <ConfigFieldRenderer
        name="host"
        label="Host"
        type="text"
        placeholder="localhost"
      />
    )
    
    expect(screen.getByLabelText('Host')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('localhost')).toBeInTheDocument()
  })

  it('renders switch input correctly', () => {
    render(
      <ConfigFieldRenderer
        name="ssl"
        label="SSL"
        type="switch"
      />
    )
    
    expect(screen.getByLabelText('SSL')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('shows required indicator', () => {
    render(
      <ConfigFieldRenderer
        name="host"
        label="Host"
        type="text"
        required
      />
    )
    
    expect(screen.getByText('*')).toHaveClass('text-destructive')
  })
})
```

## Migration Strategy

### Safe Migration Approach
1. **Step 1**: Create new components alongside existing ones
2. **Step 2**: Write comprehensive tests for new components
3. **Step 3**: Gradually replace old components
4. **Step 4**: Remove old code once new components are stable

### Feature Flags
```typescript
// Use feature flags for gradual rollout
const USE_NEW_DATASOURCE_FORM = process.env.NEXT_PUBLIC_USE_NEW_DATASOURCE_FORM === 'true'

// In page component
{USE_NEW_DATASOURCE_FORM ? (
  <NewDataSourceForm {...props} />
) : (
  <OldDataSourceForm {...props} />
)}
```

## Performance Benchmarks

### Before/After Metrics
- **Component Size**: 575 → <100 lines
- **Search Response**: 500ms → <100ms
- **Bundle Size**: TBD → TBD-20%
- **Type Coverage**: 60% → 100%
- **Test Coverage**: 20% → >80%

## Rollback Plan

### Emergency Rollback
1. **Immediate**: Switch feature flags to old implementation
2. **Short-term**: Revert to previous commit
3. **Long-term**: Address issues and retry migration

### Monitoring
- Error rates via error reporting service
- Performance metrics via analytics
- User feedback via support tickets