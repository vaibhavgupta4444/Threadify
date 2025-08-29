"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UploadCloud, Video, X } from "lucide-react"

type Privacy = "public" | "private"

export default function UploadReel() {
  const [file, setFile] = useState<File | null>(null)
  const [previewURL, setPreviewURL] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [caption, setCaption] = useState("")
  const [privacy, setPrivacy] = useState<Privacy>("public")
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Revoke object URL when file changes/unmounts
  useEffect(() => {
    return () => {
      if (previewURL) URL.revokeObjectURL(previewURL)
    }
  }, [previewURL])

  const canSubmit = useMemo(() => file && title.trim().length > 0 && !isUploading, [file, title, isUploading])

  // Accept common short-form video types
  const ACCEPT_TYPES = "video/mp4,video/webm,video/quicktime"
  const MAX_SIZE_MB = 100

  function onPickFile(f: File) {
    setError(null)
    if (!ACCEPT_TYPES.split(",").includes(f.type)) {
      setError("Unsupported file type. Please upload MP4, WEBM, or MOV.")
      return
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Max size is ${MAX_SIZE_MB}MB.`)
      return
    }
    setFile(f)
    if (previewURL) URL.revokeObjectURL(previewURL)
    setPreviewURL(URL.createObjectURL(f))
    setProgress(0)
  }

  async function authenticator() {
    const res = await fetch("/api/upload-auth")
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Auth failed: ${res.status} ${text}`)
    }
    const { signature, expire, token, publicKey } = await res.json()
    return { signature, expire, token, publicKey }
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)

    if (!file) {
      setError("Please select a file to upload.")
      return
    }

    setIsUploading(true)
    setProgress(0)

    try {
      const { signature, expire, token, publicKey } = await authenticator()

      // Create new controller per upload
      const controller = new AbortController()
      abortRef.current = controller

      await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: file.name,
        // Optional: add metadata (uncomment if you handle it server-side/ImageKit)
        // tags: [privacy],
        // useUniqueFileName: true,
        onProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded / evt.total) * 100))
          }
        },
        abortSignal: controller.signal,
      })

      // Reset or keep as needed
      setIsUploading(false)
      setProgress(100)
      // You can add success toast or callback here
      // e.g., onUploaded?.()
    } catch (err: unknown) {
      setIsUploading(false)
      if (err instanceof ImageKitAbortError) {
        setError("Upload canceled.")
      } else if (err instanceof ImageKitInvalidRequestError) {
        setError(`Invalid request: ${err.message}`)
      } else if (err instanceof ImageKitUploadNetworkError) {
        setError(`Network error: ${err.message}`)
      } else if (err instanceof ImageKitServerError) {
        setError(`Server error: ${err.message}`)
      } else if (err instanceof Error) {
        setError(err.message || "Upload failed.")
      } else {
        setError("Upload failed.")
      }
    }
  }

  function cancelUpload() {
    abortRef.current?.abort()
    abortRef.current = null
    setIsUploading(false)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) onPickFile(e.dataTransfer.files[0])
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 rounded-full bg-primary text-primary-foreground hover:opacity-90">
          <UploadCloud className="h-4 w-4" />
          Upload
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="text-pretty">Upload your reel</DialogTitle>
            <DialogDescription className="text-pretty">
              Share short videos with your audience. MP4, WEBM, or MOV. Up to {MAX_SIZE_MB}MB.
            </DialogDescription>
          </DialogHeader>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={[
              "rounded-lg border border-dashed p-4 transition-colors",
              isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
            ].join(" ")}
          >
            {!file ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Video className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Drag and drop your video here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-1">
                  Choose file
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_TYPES}
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) onPickFile(f)
                  }}
                />
              </div>
            ) : (
              <div className="flex items-start gap-3">
                {/* Simple preview container */}
                <div className="relative aspect-[9/16] w-28 overflow-hidden rounded-md bg-black/5">
                  {previewURL ? (
                    <video src={previewURL} className="h-full w-full object-cover" muted controls preload="metadata" />
                  ) : null}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="font-medium leading-5">{file.name}</p>
                      <p className="text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB • {file.type}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setFile(null)
                        if (previewURL) URL.revokeObjectURL(previewURL)
                        setPreviewURL(null)
                        setProgress(0)
                      }}
                      aria-label="Remove selected file"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-[width]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{isUploading ? "Uploading…" : progress === 0 ? "Ready" : "Processing…"}</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Give your reel a short catchy title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="caption">Caption</Label>
              <textarea
                id="caption"
                placeholder="Say something about your reel…"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm outline-none ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                maxLength={2200}
              />
              <div className="flex justify-end text-xs text-muted-foreground">{caption.length}/2200</div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="privacy">Visibility</Label>
              <select
                id="privacy"
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as Privacy)}
                className="h-9 rounded-md border bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isUploading}>
                Close
              </Button>
            </DialogClose>

            {isUploading ? (
              <Button type="button" variant="secondary" onClick={cancelUpload}>
                Cancel upload
              </Button>
            ) : null}

            <Button type="submit" disabled={!canSubmit} className="gap-2">
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              {isUploading ? "Uploading…" : file ? "Upload reel" : "Select a file"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
