"use client"

import type React from "react"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Heart, MessageCircle, Share2, MoreHorizontal, Volume2, VolumeX, Pause, Play } from "lucide-react"
import { videoInterface } from "../../../models/video"



function timeAgo(input: string | Date) {
  const date = typeof input === "string" ? new Date(input) : input
  const diff = Math.max(0, Date.now() - date.getTime())
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo`
  const years = Math.floor(days / 365)
  return `${years}y`
}

export function PostCard(props: videoInterface) {
  const { title, description, updatedAt, transformation, videoUrl } = props

  // Like state
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(liked)

  // Video state
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0) // 0 - 100
  const [showOverlayIcon, setShowOverlayIcon] = useState<"play" | "pause" | null>(null)

  // Double-tap like animation
  const [burst, setBurst] = useState(false)
  const lastTapRef = useRef<number | null>(null)

  const src = useMemo(() => {
    // mirrors the original source domain + path
    return `https://ik.imagekit.io/threadify${videoUrl}`
  }, [videoUrl])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onTime = () => {
      if (!v.duration || !isFinite(v.duration)) return
      setProgress((v.currentTime / v.duration) * 100)
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    v.addEventListener("timeupdate", onTime)
    v.addEventListener("play", onPlay)
    v.addEventListener("pause", onPause)
    // Attempt to autoplay on mount muted (IG-like)
    const tryPlay = async () => {
      try {
        await v.play()
        setIsPlaying(true)
      } catch {
        setIsPlaying(false)
      }
    }
    v.muted = isMuted
    tryPlay()

    return () => {
      v.removeEventListener("timeupdate", onTime)
      v.removeEventListener("play", onPlay)
      v.removeEventListener("pause", onPause)
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    const v = videoRef.current
    if (v) v.muted = isMuted
  }, [isMuted])

  const togglePlay = useCallback(async () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      await v.play()
      setShowOverlayIcon("play")
    } else {
      v.pause()
      setShowOverlayIcon("pause")
    }
    // brief overlay feedback
    setTimeout(() => setShowOverlayIcon(null), 450)
  }, [])

  const handleSeek = useCallback((clientX: number, target: HTMLElement) => {
    const v = videoRef.current
    if (!v || !v.duration) return
    const rect = target.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    v.currentTime = v.duration * ratio
    setProgress(ratio * 100)
  }, [])

  const handleDoubleTapLike = useCallback(() => {
    // if (!liked) {
    //   setLiked(true)
    //   setLikeCount(100)
    // }
    // heart burst
    setBurst(true)
    setTimeout(() => setBurst(false), 500)
  }, [liked])

  const onMediaClick = useCallback(
    (e: React.MouseEvent) => {
      // Desktop double click like
      if ((e as any).detail === 2) {
        handleDoubleTapLike()
        return
      }
      togglePlay()
    },
    [handleDoubleTapLike, togglePlay],
  )

  const onTouchStart = useCallback(() => {
    const now = Date.now()
    if (lastTapRef.current && now - lastTapRef.current < 300) {
      handleDoubleTapLike()
      lastTapRef.current = null
    } else {
      lastTapRef.current = now
    }
  }, [handleDoubleTapLike])

  const onProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      handleSeek(e.clientX, e.currentTarget)
    },
    [handleSeek],
  )

  const onProgressTouch = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0]
      if (!touch) return
      handleSeek(touch.clientX, e.currentTarget)
    },
    [handleSeek],
  )

  const toggleLike = useCallback(() => {
    setLiked((prev) => {
      if (prev) {
        // setLikeCount((c) => Math.max(0, c - 1))
      } else {
        // setLikeCount((c) => c + 1)
      }
      return !prev
    })
  }, [])

  return (
    <Card className="overflow-hidden border bg-background">
      {/* Header (IG-like) */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* <Avatar className="h-10 w-10">
            <AvatarImage
              src={author?.avatarUrl || "/placeholder.svg?height=80&width=80&query=user%20avatar"}
              alt={author?.name ? `${author.name} avatar` : "User avatar"}
            />
            <AvatarFallback>{(author?.name || title || "U").slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar> */}
          <div className="min-w-0">
            {/* <div className="flex items-center gap-2">
              <p className="truncate font-medium text-foreground">{author?.name || title}</p>
              {author?.handle ? (
                <Badge variant="secondary" className="rounded-full">
                  {author.handle}
                </Badge>
              ) : null}
            </div> */}
            <p className="text-sm text-muted-foreground">{timeAgo(updatedAt)}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="More options">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Media with custom controls (no native controls) */}
      <div className="relative bg-muted">
        <video
          ref={videoRef}
          width={transformation?.width}
          height={transformation?.height}
          src={src}
          className="w-full max-h-[80vh] object-contain bg-black"
          playsInline
          loop
          muted={isMuted}
          controls={false}
          onClick={onMediaClick}
          onTouchStart={onTouchStart}
        />

        {/* Center overlay feedback for play/pause */}
        {showOverlayIcon && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
            <div className="rounded-full bg-black/50 p-3 text-white">
              {showOverlayIcon === "play" ? <Play className="h-8 w-8" /> : <Pause className="h-8 w-8" />}
            </div>
          </div>
        )}

        {/* Double-tap like burst */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200",
            burst ? "opacity-100" : "opacity-0",
          )}
          aria-hidden
        >
          <Heart className="h-20 w-20 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] fill-white" />
        </div>

        {/* Controls bar (IG-style minimal) */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3">
          {/* Progress bar */}
          <div
            className="relative h-1.5 w-full cursor-pointer rounded-full bg-white/30"
            role="slider"
            aria-label="Seek video"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            onClick={onProgressClick}
            onTouchStart={onProgressTouch}
          >
            <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
          </div>

          {/* Transport + volume */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                aria-label={isPlaying ? "Pause" : "Play"}
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                aria-label={isMuted ? "Unmute" : "Mute"}
                onClick={() => setIsMuted((m) => !m)}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
            {/* Keep right side empty (IG has minimal chrome) */}
            <div />
          </div>
        </div>
      </div>

      {/* Caption */}
      {description ? (
        <div className="px-4 py-3">
          <p className="text-pretty text-sm leading-6">
            {/* <span className="font-medium mr-1">{author?.handle || author?.name || title}</span> */}
            {description}
          </p>
        </div>
      ) : null}

      {/* Actions (IG-like) */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2" aria-pressed={liked} onClick={toggleLike}>
            <Heart className={cn("h-5 w-5 transition-colors", liked ? "fill-primary text-primary" : "")} />
            <span className="text-sm">{likeCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageCircle className="h-5 w-5" />
            {/* <span className="text-sm">{comments}</span> */}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-5 w-5" />
            <span className="text-sm">Share</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
