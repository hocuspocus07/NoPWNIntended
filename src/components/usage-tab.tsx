"use client"

import * as React from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Cpu, Network, Shield, Loader2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Terminal } from 'lucide-react'
import type { UsageStats, ToolUsage } from "@/utils/storage-helpers/execution-helpers"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6384", "#36A2EB"]

export default function UsageTab() {
  const [usageStats, setUsageStats] = React.useState<UsageStats | null>(null)
  const [recentActivity, setRecentActivity] = React.useState<ToolUsage[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const statsResponse = await fetch("/api/execution/usage-stats")
        if (!statsResponse.ok) {
          const errorData = await statsResponse.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch usage stats")
        }
        const statsResult = await statsResponse.json()
        setUsageStats(statsResult.data)

        const historyResponse = await fetch("/api/execution/get-history?limit=4")
        if (!historyResponse.ok) {
          const errorData = await historyResponse.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch recent activity")
        }
        const historyResult = await historyResponse.json()
        setRecentActivity(historyResult.data || [])
      } catch (err: any) {
        console.error("Error fetching usage data:", err)
        setError(err.message || "Failed to load usage data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading usage data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
        Error: {error}
      </div>
    )
  }

  if (!usageStats) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No usage data available.</div>
  }

  // Helper to format duration for display
  const formatAvgScanTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(3)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds.toFixed(3)}s`
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.total_scans}</div>
            <p className="text-xs text-muted-foreground">
              Total scans recorded
            </p>
          </CardContent>
        </Card>
        {/* Removed Vulnerabilities Found Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Scan Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAvgScanTime(usageStats.avg_scan_time)}</div>
            <p className="text-xs text-muted-foreground">
              Average duration of completed scans
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Scans</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.active_scans}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="w-full h-auto flex items-center justify-center">
          <TabsTrigger value="activity">
            <Calendar className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Terminal className="h-4 w-4 mr-2" />
            Tool Distribution
          </TabsTrigger>
          {/* Removed Severity Tab */}
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan Activity</CardTitle>
            </CardHeader>
            <CardContent className="pl-2 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageStats.monthly_activity} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="scans" stroke="#8884d8" activeDot={{ r: 8 }} name="Total Scans" />
                  <Line type="monotone" dataKey="vulns" stroke="#82ca9d" name="Vulnerabilities Found" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tool Usage Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={usageStats.tool_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {usageStats.tool_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tool Usage by Month</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageStats.monthly_activity} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="scans" fill="#8884d8" name="Scans" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Removed Severity TabsContent */}
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scan Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-md bg-secondary">
                      <Terminal className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{scan.tool_name}</p>
                      <p className="text-sm text-muted-foreground">{scan.command_ran}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={
                        scan.status === "completed"
                          ? "success"
                          : scan.status === "running"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {scan.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{scan.duration}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">No recent activity found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
