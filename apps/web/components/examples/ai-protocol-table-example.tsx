"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UnifiedTable } from "@/components/ui/unified-table";
import {
    RiMore2Line,
    RiPlayLine,
    RiRobot2Line,
    RiSettingsLine,
    RiStopCircleLine
} from "@remixicon/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

// Example AI Protocol interface
interface AIProtocol {
  id: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  status: "active" | "inactive" | "error" | "training";
  lastUsed: Date;
  usage: {
    tokens: number;
    cost: number;
  };
  tags: string[];
  accuracy: number;
}

interface AIProtocolTableProps {
  protocols: AIProtocol[];
  onRun?: (protocol: AIProtocol) => void;
  onConfigure?: (protocol: AIProtocol) => void;
  onPause?: (protocol: AIProtocol) => void;
}

export function AIProtocolTable({ protocols, onRun, onConfigure, onPause }: AIProtocolTableProps) {
  const columns = useMemo<ColumnDef<AIProtocol>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
        </div>
      ),
      size: 40,
      enableSorting: false,
    },
    {
      header: "Protocol",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
            <RiRobot2Line className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground">{row.original.description}</div>
          </div>
        </div>
      ),
      size: 280,
    },
    {
      header: "Provider",
      accessorKey: "provider",
      cell: ({ row }) => (
        <div className="text-sm font-medium">{row.original.provider}</div>
      ),
      size: 120,
    },
    {
      header: "Model",
      accessorKey: "model",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{row.original.model}</div>
      ),
      size: 120,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variants = {
          active: "bg-green-500",
          inactive: "bg-gray-500",
          error: "bg-red-500",
          training: "bg-yellow-500",
        };

        return (
          <Badge className={variants[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
      size: 100,
    },
    {
      header: "Accuracy",
      accessorKey: "accuracy",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${row.original.accuracy}%` }}
            />
          </div>
          <span className="text-sm">{row.original.accuracy}%</span>
        </div>
      ),
      size: 100,
    },
    {
      header: "Usage",
      accessorKey: "usage",
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.usage.tokens.toLocaleString()} tokens</div>
          <div className="text-muted-foreground">${row.original.usage.cost.toFixed(2)}</div>
        </div>
      ),
      size: 120,
    },
    {
      header: "Tags",
      accessorKey: "tags",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {row.original.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{row.original.tags.length - 2}
            </Badge>
          )}
        </div>
      ),
      size: 120,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <RiMore2Line className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRun?.(row.original)}>
              <RiPlayLine className="mr-2 h-4 w-4" />
              Run Protocol
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onConfigure?.(row.original)}>
              <RiSettingsLine className="mr-2 h-4 w-4" />
              Configure
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPause?.(row.original)}>
              <RiStopCircleLine className="mr-2 h-4 w-4" />
              Pause
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 60,
      enableHiding: false,
    },
  ], [onRun, onConfigure, onPause]);

  const filters = useMemo(() => [
    {
      key: "provider",
      label: "Provider",
      type: "multi-select" as const,
    },
    {
      key: "status",
      label: "Status",
      type: "multi-select" as const,
    },
    {
      key: "model",
      label: "Model",
      type: "multi-select" as const,
    },
  ], []);

  return (
    <UnifiedTable
      data={protocols}
      columns={columns}
      searchable={true}
      filterable={true}
      sortable={true}
      pagination={{ pageSize: 20 }}
      emptyState={{
        title: "No AI protocols found",
        description: "Create your first AI protocol to get started"
      }}
    />
  );
}

// Example usage:
/*
const mockProtocols: AIProtocol[] = [
  {
    id: "1",
    name: "Customer Support Bot",
    description: "AI-powered customer service automation",
    provider: "OpenAI",
    model: "gpt-4",
    status: "active",
    lastUsed: new Date("2024-01-15"),
    usage: { tokens: 150000, cost: 4.5 },
    tags: ["customer-service", "automation"],
    accuracy: 94,
  },
  {
    id: "2",
    name: "Code Review Assistant",
    description: "Automated code review and suggestions",
    provider: "Anthropic",
    model: "claude-3",
    status: "training",
    lastUsed: new Date("2024-01-14"),
    usage: { tokens: 75000, cost: 2.25 },
    tags: ["development", "code-review"],
    accuracy: 87,
  },
];

<AIProtocolTable protocols={mockProtocols} />
*/

export default AIProtocolTable;
