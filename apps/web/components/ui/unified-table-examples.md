# UnifiedTable Component Examples

## Basic Usage

```tsx
import { UnifiedTable } from '@/components/ui/unified-table'
import { ColumnDef } from '@tanstack/react-table'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { label: 'Full Name', sortable: true }
  },
  {
    accessorKey: 'email',
    header: 'Email',
    meta: { label: 'Email Address', sortable: true }
  },
  {
    accessorKey: 'role',
    header: 'Role',
    meta: { 
      label: 'User Role', 
      sortable: true,
      filterVariant: 'select',
      filterOptions: ['admin', 'user', 'editor']
    }
  }
]

<UnifiedTable
  data={users}
  columns={columns}
  searchable={true}
  pagination={{ pageSize: 10, pageSizeOptions: [5, 10, 25] }}
/>
```

## Advanced Features

### Row Selection with Actions
```tsx
const [selectedUsers, setSelectedUsers] = useState<User[]>([])

<UnifiedTable
  data={users}
  columns={columns}
  selectable={true}
  onRowSelectionChange={setSelectedUsers}
  emptyState={{
    icon: RiUserLine,
    title: 'No users found',
    description: 'Start by adding new users to your team.',
    action: {
      label: 'Add User',
      onClick: () => openUserForm()
    }
  }}
/>
```

### Custom Cell Rendering
```tsx
const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: 'avatar',
    header: 'Avatar',
    cell: ({ row }) => (
      <Avatar>
        <AvatarImage src={row.original.avatar} />
        <AvatarFallback>{row.original.name[0]}</AvatarFallback>
      </Avatar>
    ),
    meta: { align: 'center' }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'online' ? 'default' : 'secondary'}>
        {row.original.status}
      </Badge>
    ),
    meta: { 
      filterVariant: 'select',
      filterOptions: ['online', 'offline', 'away']
    }
  }
]
```

### Loading State
```tsx
<UnifiedTable
  data={contacts}
  columns={columns}
  loading={isLoading}
  searchable={true}
  filterable={true}
  sortable={true}
  selectable={true}
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | `[]` | Array of data objects |
| `columns` | `ColumnDef<TData>[]` | `[]` | TanStack Table column definitions |
| `loading` | `boolean` | `false` | Show loading skeleton |
| `searchable` | `boolean` | `true` | Enable global search |
| `filterable` | `boolean` | `true` | Enable column filtering |
| `sortable` | `boolean` | `true` | Enable column sorting |
| `selectable` | `boolean` | `false` | Enable row selection |
| `pagination` | `boolean \| object` | `true` | Enable pagination with optional page size config |
| `columnVisibility` | `boolean` | `true` | Enable column visibility toggle |
| `emptyState` | `object` | `undefined` | Custom empty state configuration |
| `onRowSelectionChange` | `function` | `undefined` | Callback for row selection changes |
| `className` | `string` | `undefined` | Additional CSS classes |

## Styling Patterns

The component follows OriginUI patterns:
- Rounded corners using `--radius` CSS variable
- Consistent spacing with Tailwind spacing scale
- Subtle shadows and borders
- Hover states with `hover:bg-muted/5`
- Loading skeletons with `bg-primary/10 animate-pulse`
- Status badges with contextual colors

## Accessibility Features

- Semantic table structure with proper thead/tbody
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader announcements for state changes
- Focus indicators on interactive elements