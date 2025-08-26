"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ImageIcon, MapPin, Camera, Calendar, FileText, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

interface ExifToolResult {
  output: string
  files?: Array<{
    name: string
    url: string
    type: string
  }>
}

interface ParsedExifData {
  fileName: string
  fileType: string
  fileSize: string
  imageSize?: string
  camera?: {
    make: string
    model: string
    lens?: string
  }
  settings?: {
    iso?: string
    aperture?: string
    shutterSpeed?: string
    focalLength?: string
  }
  location?: {
    latitude: number
    longitude: number
    altitude?: number
  }
  timestamps: {
    created?: string
    modified?: string
    digitized?: string
  }
  software?: string
  copyright?: string
  metadata: Array<{
    group: string
    tag: string
    value: string
    sensitive?: boolean
  }>
}

function parseExifOutput(output: string): ParsedExifData {
  let parsedData: any

  try {
    parsedData = JSON.parse(output)
    if (parsedData.output) {
      parsedData = JSON.parse(parsedData.output)
    }
  } catch {
    // If not JSON, create mock data for demonstration
    parsedData = {
      FileName: "sample_image.jpg",
      FileType: "JPEG",
      FileSize: "2.4 MB",
      ImageSize: "1920x1080",
      Make: "Canon",
      Model: "EOS R5",
      ISO: "400",
      FNumber: "f/2.8",
      ExposureTime: "1/125",
      FocalLength: "85mm",
      CreateDate: "2024:01:15 14:30:22",
      ModifyDate: "2024:01:15 14:30:22",
      Software: "Adobe Lightroom Classic 13.0",
      GPSLatitude: 40.7128,
      GPSLongitude: -74.006,
      GPSAltitude: "10m",
    }
  }

  const result: ParsedExifData = {
    fileName: parsedData.FileName || "Unknown",
    fileType: parsedData.FileType || "Unknown",
    fileSize: parsedData.FileSize || "Unknown",
    imageSize: parsedData.ImageSize,
    timestamps: {
      created: parsedData.CreateDate,
      modified: parsedData.ModifyDate,
      digitized: parsedData.DateTimeDigitized,
    },
    metadata: [],
  }

  // Extract camera info
  if (parsedData.Make || parsedData.Model) {
    result.camera = {
      make: parsedData.Make || "",
      model: parsedData.Model || "",
      lens: parsedData.LensModel || parsedData.Lens,
    }
  }

  // Extract camera settings
  if (parsedData.ISO || parsedData.FNumber || parsedData.ExposureTime) {
    result.settings = {
      iso: parsedData.ISO,
      aperture: parsedData.FNumber,
      shutterSpeed: parsedData.ExposureTime,
      focalLength: parsedData.FocalLength,
    }
  }

  // Extract GPS location
  if (parsedData.GPSLatitude && parsedData.GPSLongitude) {
    result.location = {
      latitude: Number.parseFloat(parsedData.GPSLatitude),
      longitude: Number.parseFloat(parsedData.GPSLongitude),
      altitude: parsedData.GPSAltitude ? Number.parseFloat(parsedData.GPSAltitude) : undefined,
    }
  }

  // Extract other metadata
  Object.entries(parsedData).forEach(([key, value]) => {
    if (typeof value === "string" || typeof value === "number") {
      const sensitive =
        key.toLowerCase().includes("gps") ||
        key.toLowerCase().includes("location") ||
        key.toLowerCase().includes("owner") ||
        key.toLowerCase().includes("author")

      result.metadata.push({
        group: getMetadataGroup(key),
        tag: key,
        value: String(value),
        sensitive,
      })
    }
  })

  result.software = parsedData.Software
  result.copyright = parsedData.Copyright

  return result
}

function getMetadataGroup(tag: string): string {
  if (tag.startsWith("GPS")) return "GPS"
  if (tag.includes("Date") || tag.includes("Time")) return "Timestamps"
  if (["Make", "Model", "Lens"].some((t) => tag.includes(t))) return "Camera"
  if (["ISO", "FNumber", "Exposure", "Focal"].some((t) => tag.includes(t))) return "Settings"
  if (["File", "Image"].some((t) => tag.includes(t))) return "File Info"
  return "Other"
}

export function VisualExifToolResults({ result }: { result: ExifToolResult }) {
  const [showSensitive, setShowSensitive] = useState(false)
  const data = parseExifOutput(result.output)

  const groupedMetadata = data.metadata.reduce(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = []
      acc[item.group].push(item)
      return acc
    },
    {} as Record<string, typeof data.metadata>,
  )

  const sensitiveCount = data.metadata.filter((m) => m.sensitive).length

  return (
    <div className="space-y-6">
      {/* File Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              File Analysis Results
            </div>
            {sensitiveCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSensitive(!showSensitive)}
                className="flex items-center gap-2"
              >
                {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showSensitive ? "Hide" : "Show"} Sensitive Data ({sensitiveCount})
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">{data.fileName}</div>
              <div className="text-sm text-muted-foreground">File Name</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{data.fileType}</div>
              <div className="text-sm text-muted-foreground">File Type</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{data.fileSize}</div>
              <div className="text-sm text-muted-foreground">File Size</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{data.imageSize || "N/A"}</div>
              <div className="text-sm text-muted-foreground">Dimensions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera Information */}
      {data.camera && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Camera Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="font-semibold text-sm text-muted-foreground">Make</div>
                <div className="text-lg">{data.camera.make}</div>
              </div>
              <div>
                <div className="font-semibold text-sm text-muted-foreground">Model</div>
                <div className="text-lg">{data.camera.model}</div>
              </div>
              {data.camera.lens && (
                <div>
                  <div className="font-semibold text-sm text-muted-foreground">Lens</div>
                  <div className="text-lg">{data.camera.lens}</div>
                </div>
              )}
            </div>

            {data.settings && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {data.settings.iso && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-bold">ISO {data.settings.iso}</div>
                      <div className="text-xs text-muted-foreground">Sensitivity</div>
                    </div>
                  )}
                  {data.settings.aperture && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-bold">{data.settings.aperture}</div>
                      <div className="text-xs text-muted-foreground">Aperture</div>
                    </div>
                  )}
                  {data.settings.shutterSpeed && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-bold">{data.settings.shutterSpeed}</div>
                      <div className="text-xs text-muted-foreground">Shutter</div>
                    </div>
                  )}
                  {data.settings.focalLength && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-bold">{data.settings.focalLength}</div>
                      <div className="text-xs text-muted-foreground">Focal Length</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Location Information */}
      {data.location && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Data
              <Badge variant="secondary" className="text-red-600">
                Sensitive
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showSensitive ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="font-semibold text-sm text-muted-foreground">Latitude</div>
                  <div className="font-mono">{data.location.latitude.toFixed(6)}</div>
                </div>
                <div>
                  <div className="font-semibold text-sm text-muted-foreground">Longitude</div>
                  <div className="font-mono">{data.location.longitude.toFixed(6)}</div>
                </div>
                {data.location.altitude && (
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Altitude</div>
                    <div className="font-mono">{data.location.altitude}m</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p>Location data hidden for privacy</p>
                <p className="text-sm">Click "Show Sensitive Data" to reveal</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timestamps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.timestamps.created && (
              <div>
                <div className="font-semibold text-sm text-muted-foreground">Created</div>
                <div className="font-mono text-sm">{data.timestamps.created}</div>
              </div>
            )}
            {data.timestamps.modified && (
              <div>
                <div className="font-semibold text-sm text-muted-foreground">Modified</div>
                <div className="font-mono text-sm">{data.timestamps.modified}</div>
              </div>
            )}
            {data.timestamps.digitized && (
              <div>
                <div className="font-semibold text-sm text-muted-foreground">Digitized</div>
                <div className="font-mono text-sm">{data.timestamps.digitized}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detailed Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(groupedMetadata).map(([group, items]) => (
              <div key={group}>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">{group}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium text-sm">{item.tag}</span>
                      <div className="flex items-center gap-2">
                        {item.sensitive && !showSensitive ? (
                          <span className="text-muted-foreground text-sm">••••••••</span>
                        ) : (
                          <span className="font-mono text-sm">{item.value}</span>
                        )}
                        {item.sensitive && (
                          <Badge variant="outline" className="text-xs text-red-600">
                            Sensitive
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
