"use client"

import * as React from "react"
import { LineChart,Line,BarChart,Bar,PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer } from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Cpu, HardDrive, Network, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Terminal } from "lucide-react"
// Sample data for charts
const usageData = [
  { name: "Jan", scans: 400, vulns: 240, alerts: 240 },
  { name: "Feb", scans: 300, vulns: 139, alerts: 221 },
  { name: "Mar", scans: 200, vulns: 980, alerts: 229 },
  { name: "Apr", scans: 278, vulns: 390, alerts: 200 },
  { name: "May", scans: 189, vulns: 480, alerts: 218 },
  { name: "Jun", scans: 239, vulns: 380, alerts: 250 },
  { name: "Jul", scans: 349, vulns: 430, alerts: 210 },
]

const toolDistribution = [
  { name: "Nmap", value: 35 },
  { name: "Metasploit", value: 20 },
  { name: "Burp Suite", value: 15 },
  { name: "SQLmap", value: 10 },
  { name: "Others", value: 20 },
]

const severityData = [
  { name: "Critical", value: 12 },
  { name: "High", value: 19 },
  { name: "Medium", value: 35 },
  { name: "Low", value: 34 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function UsageTab() {
  return (
    <div className="space-y-4">
      {/* Stats Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,243</div>
            <p className="text-xs text-muted-foreground">
              +12.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilities Found</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              +8.3% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Scan Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4m 23s</div>
            <p className="text-xs text-muted-foreground">
              -1.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Scans</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 completing soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">
            <Calendar className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="tools">
            <HardDrive className="h-4 w-4 mr-2" />
            Tool Distribution
          </TabsTrigger>
          <TabsTrigger value="severity">
            <Shield className="h-4 w-4 mr-2" />
            Severity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan Activity</CardTitle>
            </CardHeader>
            <CardContent className="pl-2 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={usageData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="scans"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="vulns"
                    stroke="#82ca9d"
                  />
                  <Line
                    type="monotone"
                    dataKey="alerts"
                    stroke="#ffc658"
                  />
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
                      data={toolDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {toolDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
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
                  <BarChart
                    data={usageData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="scans" fill="#8884d8" name="Scans" />
                    <Bar dataKey="vulns" fill="#82ca9d" name="Vulnerabilities" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="severity" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vulnerability Severity</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="destructive">Critical: 12</Badge>
                  <Badge variant="destructive">High: 19</Badge>
                  <Badge variant="secondary">Medium: 35</Badge>
                  <Badge variant="default">Low: 34</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={severityData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ff4757" name="Count">
                    {severityData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.name === 'Critical' ? '#ff4757' :
                          entry.name === 'High' ? '#ffa502' :
                          entry.name === 'Medium' ? '#57606f' :
                          '#a4b0be'
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scan Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { tool: "Nmap", target: "192.168.1.0/24", status: "completed", time: "2 minutes ago" },
              { tool: "SQLmap", target: "https://example.com/login", status: "running", time: "15 minutes ago" },
              { tool: "Metasploit", target: "Windows SMB", status: "failed", time: "1 hour ago" },
              { tool: "Burp Suite", target: "API endpoints", status: "completed", time: "2 hours ago" },
            ].map((scan, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-md bg-secondary">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{scan.tool}</p>
                    <p className="text-sm text-muted-foreground">{scan.target}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={
                    scan.status === 'completed' ? 'success' :
                    scan.status === 'running' ? 'secondary' :
                    'destructive'
                  }>
                    {scan.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{scan.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}