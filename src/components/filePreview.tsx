"use client"

import { X, FileIcon } from "lucide-react"
import { useEffect, useState } from "react"

export function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = file.type.startsWith("image/")
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isImage) {
      const blobUrl = URL.createObjectURL(file)
      setUrl(blobUrl)
      return () => URL.revokeObjectURL(blobUrl)
    }
  }, [file, isImage])

  return (
    <div className="relative flex flex-col items-center justify-center w-48 min-h-[96px] rounded-md border p-3 bg-muted">
      <button className="absolute top-1 right-1 p-1 rounded hover:bg-primary/10" onClick={onRemove} type="button">
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="mb-2">
        {isImage && url ? (
          <img src={url || "/placeholder.svg"} alt={file.name} className="w-12 h-12 object-contain rounded shadow" />
        ) : (
          <FileIcon className="w-12 h-12 text-muted-foreground" />
        )}
      </div>
      <div className="truncate text-xs text-center max-w-[160px]">{file.name}</div>
      <div className="text-muted-foreground text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</div>
    </div>
  )
}
