"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Folder, FolderOpen, File, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TreeNode {
  name: string
  path: string
  type: "file" | "directory"
  status?: number
  size?: number
  contentType?: string
  interesting?: boolean
  children: TreeNode[]
}

interface DirectoryTreeViewProps {
  paths: Array<{
    path: string
    status: number
    size: number
    contentType?: string
    interesting: boolean
  }>
  target: string
}

function buildTree(paths: DirectoryTreeViewProps["paths"]): TreeNode {
  const root: TreeNode = {
    name: "root",
    path: "/",
    type: "directory",
    children: [],
  }

  paths.forEach((pathData) => {
    const segments = pathData.path.split("/").filter(Boolean)
    let currentNode = root

    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1
      const fullPath = "/" + segments.slice(0, index + 1).join("/")

      let existingChild = currentNode.children.find((child) => child.name === segment)

      if (!existingChild) {
        existingChild = {
          name: segment,
          path: fullPath,
          type: isLast ? "file" : "directory",
          children: [],
          ...(isLast && {
            status: pathData.status,
            size: pathData.size,
            contentType: pathData.contentType,
            interesting: pathData.interesting,
          }),
        }
        currentNode.children.push(existingChild)
      }

      currentNode = existingChild
    })
  })

  return root
}

function TreeNodeComponent({
  node,
  target,
  level = 0,
}: {
  node: TreeNode
  target: string
  level?: number
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels
  const hasChildren = node.children.length > 0

  const getStatusColor = (status?: number) => {
    if (!status) return ""
    if (status >= 200 && status < 300) return "text-green-600"
    if (status >= 300 && status < 400) return "text-blue-600"
    if (status >= 400) return "text-red-600"
    return "text-gray-600"
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return ""
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded cursor-pointer group"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {hasChildren ? (
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        ) : (
          <div className="w-4" />
        )}

        {node.type === "directory" ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 text-blue-500" />
          )
        ) : (
          <File className="h-4 w-4 text-gray-500" />
        )}

        <span className="font-mono text-sm flex-1">{node.name}</span>

        {node.status && (
          <div className="flex items-center gap-2">
            {node.interesting && (
              <Badge variant="secondary" className="text-xs text-orange-600">
                !
              </Badge>
            )}
            <span className={`text-xs font-medium ${getStatusColor(node.status)}`}>{node.status}</span>
            {node.size !== undefined && <span className="text-xs text-muted-foreground">{formatSize(node.size)}</span>}
            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100" asChild>
              <a href={`${target}${node.path}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children
            .sort((a, b) => {
              // Directories first, then files
              if (a.type !== b.type) {
                return a.type === "directory" ? -1 : 1
              }
              return a.name.localeCompare(b.name)
            })
            .map((child) => (
              <TreeNodeComponent key={child.path} node={child} target={target} level={level + 1} />
            ))}
        </div>
      )}
    </div>
  )
}

export function DirectoryTreeView({ paths, target }: DirectoryTreeViewProps) {
  const tree = buildTree(paths)

  return (
    <div className="border rounded-lg bg-card">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Directory Structure</h3>
        <p className="text-xs text-muted-foreground mt-1">Interactive tree view of discovered paths</p>
      </div>
      <div className="p-2 max-h-96 overflow-auto">
        {tree.children.length > 0 ? (
          tree.children
            .sort((a, b) => {
              if (a.type !== b.type) {
                return a.type === "directory" ? -1 : 1
              }
              return a.name.localeCompare(b.name)
            })
            .map((child) => <TreeNodeComponent key={child.path} node={child} target={target} level={0} />)
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Folder className="h-8 w-8 mx-auto mb-2" />
            <p>No directory structure to display</p>
          </div>
        )}
      </div>
    </div>
  )
}
