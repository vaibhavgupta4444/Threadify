"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Pause,
  Play,
} from "lucide-react"
import { postInterface } from "../../../models/Post"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LikeButton } from "./LikeButton"
import { CommentSection } from "./CommentSection"
import { CommentForm } from "../../../types/responseType"
import { toast } from "sonner"
import { apiClient } from "../../../lib/app-client"

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

export function PostCard(props: postInterface) {

  const { _id, username, title, description, updatedAt, transformation, mediaUrl, likes, userProfilePic } = props

  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showOverlayIcon, setShowOverlayIcon] = useState<"play" | "pause" | null>(null)
  const [burst, setBurst] = useState(false)
  const [doubleTapped, setDoubleTapped] = useState<boolean>(false);
  const [showComments, setShowComments] = useState(false)
  const [allComments, setAllComments] = useState<CommentForm[]>([]);


  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const lastTapRef = useRef<number | null>(null)

  const src = `https://ik.imagekit.io/threadify${mediaUrl}`

  const getComments = async (postId: string, page = 1, limit = 10) => {
    if (showComments) {
      // If already showing, just hide them
      setShowComments(false);
      return;
    }

    try {
      const response = await apiClient.getComments({ postId, page, limit });
      if (response.success) {
        setAllComments(response.comments ?? []);
        setShowComments(true); // only show after data is loaded
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong!");
    }
  };



  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = isMuted

    const tryPlay = async () => {
      try {
        await v.play()

      } catch {
        console.log("Error occured");
      }
    }
    tryPlay()
  }, [isMuted])

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted
  }, [isMuted])

  // Handlers (no useCallback needed with compiler!)
  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setIsPlaying(true);
      setShowOverlayIcon("play")
    } else {
      v.pause()
      setIsPlaying(false);
      setShowOverlayIcon("pause")
    }
    setTimeout(() => setShowOverlayIcon(null), 450)
  }

  function handleSeek(clientX: number, target: HTMLElement) {
    const v = videoRef.current
    if (!v || !v.duration) return
    const rect = target.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    v.currentTime = v.duration * ratio
    setProgress(ratio * 100)
  }

  function handleDoubleTapLike() {
    // toggleLike();
    setDoubleTapped(!doubleTapped);
    setBurst(true)
    setTimeout(() => setBurst(false), 500)
  }



  function onMediaClick(e: React.MouseEvent) {
    if ((e as any).detail === 2) {
      handleDoubleTapLike()
      return
    }
    togglePlay()
  }

  function onTouchStart() {
    const now = Date.now()
    if (lastTapRef.current && now - lastTapRef.current < 300) {
      handleDoubleTapLike()
      lastTapRef.current = null
    } else {
      lastTapRef.current = now
    }
  }

  function onProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    handleSeek(e.clientX, e.currentTarget)
  }

  function onProgressTouch(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    if (!touch) return
    handleSeek(touch.clientX, e.currentTarget)
  }

  return (
    <Card className="overflow-hidden border bg-background shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://ik.imagekit.io/threadify${userProfilePic}`} />
            <AvatarFallback>{(username || title || "U").slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium text-foreground">{title}</p>
              {username ? (
                <Badge variant="secondary" className="rounded-full">
                  {username}
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">{timeAgo(updatedAt)}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="More options">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Media */}
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

        {/* Overlay play/pause */}
        {showOverlayIcon && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
            <div className="rounded-full bg-black/50 p-3 text-white">
              {showOverlayIcon === "play" ? <Play className="h-8 w-8" /> : <Pause className="h-8 w-8" />}
            </div>
          </div>
        )}

        {/* Like burst */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200",
            burst ? "opacity-100" : "opacity-0",
          )}
          aria-hidden
        >
          <Heart className="h-20 w-20 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] fill-white" />
        </div>

        {/* Controls */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3">
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
            <div />
          </div>
        </div>
      </div>

      {/* Caption */}
      {description ? (
        <div className="px-4 py-3">
          <p className="text-pretty text-sm leading-6">{description}</p>
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-4">
          <LikeButton likes={likes!} postId={_id.toString()} doubleTapped={doubleTapped} />
          <Button onClick={() => getComments(_id.toString())} variant="ghost" size="sm" className="gap-2">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">{allComments.length}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-5 w-5" />
            <span className="text-sm">Share</span>
          </Button>
        </div>
      </div>
      {showComments && (
        <div className="border-none">
          <CommentSection postId={_id.toString()} contents={allComments} />
        </div>
      )}
    </Card>
  )
}
