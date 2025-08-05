"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Terminal,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { ToolUsage } from "@/utils/storage-helpers/execution-helpers"
import { ExecutionOutputViewer } from "./execution-output"
import { toast } from "sonner" // For copy notifications

// Define a type for the meta property in ColumnDef
interface ColumnMeta {
  onViewOutput: (usage: ToolUsage) => void
}

export const columns: ColumnDef<ToolUsage>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "tool_name",
    header: "Tool",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Terminal className="h-4 w-4" />
        <span className="font-medium">{row.getValue("tool_name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "command_ran",
    header: "Command",
    cell: ({ row }) => <div className="font-mono text-sm bg-accent/50 p-2 rounded">{row.getValue("command_ran")}</div>,
  },
  {
    accessorKey: "started_at",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <Clock className="mr-2 h-4 w-4" />
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("started_at"))
      return (
        <div className="text-sm">
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </div>
      )
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => <div className="text-sm">{row.getValue("duration")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = {
        completed: "success",
        running: "secondary",
        failed: "destructive",
        stopped: "outline",
      }[status] as "secondary" | "destructive" | "outline" | "success"

      const icon = {
        completed: <CheckCircle2 className="h-4 w-4 mr-2" />,
        running: <Loader2 className="h-4 w-4 mr-2 animate-spin" />,
        failed: <AlertCircle className="h-4 w-4 mr-2" />,
        stopped: <Clock className="h-4 w-4 mr-2" />,
      }[status]

      return (
        <Badge variant={variant} className="capitalize">
          {icon}
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    // Corrected: 'column' is a direct argument to the cell function
    cell: ({ row, column }) => {
      const usage = row.original

      const handleCopyCommand = () => {
        navigator.clipboard.writeText(usage.command_ran)
        toast.success("Command copied to clipboard!")
      }

      const handleViewOutput = () => {
        // Access meta from the 'column' argument
        const meta = column.columnDef.meta as ColumnMeta | undefined
        if (meta?.onViewOutput) {
          meta.onViewOutput(usage)
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleCopyCommand}>Copy command</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleViewOutput}>View full output</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function HistoryTab() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [historyData, setHistoryData] = React.useState<ToolUsage[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Pagination state
  const [pageIndex, setPageIndex] = React.useState(0)
  const pageSize = 5 // 5 tools per page
  const [totalCount, setTotalCount] = React.useState(0) // To store total count for pagination

  // State for viewing full output
  const [showOutputViewer, setShowOutputViewer] = React.useState(false)
  const [selectedExecution, setSelectedExecution] = React.useState<ToolUsage | null>(null)

  const fetchHistory = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/execution/get-history?limit=${pageSize}&offset=${pageIndex * pageSize}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setHistoryData(result.data || [])
      setTotalCount(result.totalCount || 0)
    } catch (err: any) {
      console.error("Failed to fetch execution history:", err)
      setError(err.message || "Failed to load scan history.")
    } finally {
      setIsLoading(false)
    }
  }, [pageIndex, pageSize])

  React.useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleViewOutput = React.useCallback((execution: ToolUsage) => {
    setSelectedExecution(execution)
    setShowOutputViewer(true)
  }, [])

  const handleBackToHistory = React.useCallback(() => {
    setShowOutputViewer(false)
    setSelectedExecution(null)
  }, [])

  const table = useReactTable({
    data: historyData,
    columns: columns.map((col) => ({
      ...col,
      meta: {
        ...col.meta,
        onViewOutput: handleViewOutput, // Pass the handler to column meta
      } as ColumnMeta, // Assert the type of meta
    })),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  })

  if (showOutputViewer && selectedExecution) {
    return (
      <ExecutionOutputViewer
        output={selectedExecution.output}
        command={selectedExecution.command_ran}
        toolName={selectedExecution.tool_name}
        onBack={handleBackToHistory}
      />
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter tools..."
          value={(table.getColumn("tool_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("tool_name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-transparent">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading scan history...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-red-500">
                  Error: {error}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No scan history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} scan(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((old) => Math.max(0, old - 1))}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((old) => old + 1)}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
