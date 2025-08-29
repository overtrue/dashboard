// Data source management types following dynamic protocol pattern

export type DataSourceType = 
  | 'mysql'
  | 'postgresql' 
  | 'mongodb'
  | 'redis'
  | 'sqlite'
  | 'mssql'
  | 'oracle'
  | 'api'
  | 'csv'
  | 'json'
  | 'excel'

export interface DataSourceConnectionConfig {
  host?: string
  port?: number
  username?: string
  password?: string
  database?: string
  filename?: string
  url?: string
  ssl?: boolean
  timeout?: number
  charset?: string
  timezone?: string
}

export interface DataSourceProtocol {
  id: string
  name: string
  type: DataSourceType
  description?: string
  config: DataSourceConnectionConfig
  isActive: boolean
  isValid: boolean
  lastTested?: Date
  createdAt: Date
  updatedAt: Date
  tags?: string[]
  metadata?: Record<string, any>
}

export interface DataSourceTestResult {
  success: boolean
  message: string
  latency?: number
  error?: string
  details?: Record<string, any>
}

export interface DataSourceFilters {
  type?: DataSourceType
  name?: string
  isActive?: boolean
  isValid?: boolean
  tags?: string[]
}

export interface DataSourceFormData {
  name: string
  type: DataSourceType
  description?: string
  config: DataSourceConnectionConfig
  tags?: string[]
}

// Validation schemas for different data source types
export const dataSourceValidation = {
  mysql: {
    required: ['host', 'port', 'username', 'database'],
    optional: ['password', 'ssl', 'charset', 'timezone']
  },
  postgresql: {
    required: ['host', 'port', 'username', 'database'],
    optional: ['password', 'ssl', 'charset', 'timezone']
  },
  mongodb: {
    required: ['host', 'port'],
    optional: ['username', 'password', 'database', 'ssl']
  },
  redis: {
    required: ['host', 'port'],
    optional: ['password', 'database']
  },
  sqlite: {
    required: ['filename'],
    optional: []
  },
  mssql: {
    required: ['host', 'port', 'username', 'database'],
    optional: ['password', 'ssl']
  },
  oracle: {
    required: ['host', 'port', 'username', 'database'],
    optional: ['password']
  },
  api: {
    required: ['url'],
    optional: ['timeout', 'headers']
  },
  csv: {
    required: ['filename'],
    optional: ['encoding', 'delimiter']
  },
  json: {
    required: ['filename'],
    optional: ['encoding']
  },
  excel: {
    required: ['filename'],
    optional: ['sheet', 'encoding']
  }
}

export const dataSourceTypeLabels: Record<DataSourceType, string> = {
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  mongodb: 'MongoDB',
  redis: 'Redis',
  sqlite: 'SQLite',
  mssql: 'SQL Server',
  oracle: 'Oracle',
  api: 'REST API',
  csv: 'CSV File',
  json: 'JSON File',
  excel: 'Excel File'
}

export const dataSourceIcons: Record<DataSourceType, string> = {
  mysql: 'database',
  postgresql: 'database',
  mongodb: 'database',
  redis: 'database',
  sqlite: 'database',
  mssql: 'database',
  oracle: 'database',
  api: 'globe',
  csv: 'file-text',
  json: 'file-json',
  excel: 'file-spreadsheet'
}