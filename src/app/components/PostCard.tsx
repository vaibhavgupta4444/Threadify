"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

type PostCardProps = {
  author: string
  handle: string
  time: string
  caption?: string
  mediaAlt?: string
  likes?: number
  comments?: number
}

export function PostCard({
  author,
  handle,
  time,
  caption = "Having fun creating today!",
  mediaAlt = "Reel preview",
  likes = 0,
  comments = 0,
}: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)

  return (
    <Card className="overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/creator-avatar.png" alt={`${author} avatar`} />
            <AvatarFallback>{author.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium text-foreground">{author}</p>
              <Badge variant="secondary" className="rounded-full">
                Creator
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {handle} • {time}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="More">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* media */}
      <div className="bg-muted">
        <img src="/reel-thumbnail.png" alt={mediaAlt} className="h-auto w-full" />
      </div>

      {/* body */}
      <div className="px-4 py-3">
        <p className="text-pretty">{caption}</p>
      </div>

      {/* actions */}
      <div className="flex items-center gap-4 px-4 pb-4">
        <Button
          variant={liked ? "default" : "secondary"}
          size="sm"
          className={cn("gap-2")}
          aria-pressed={liked}
          onClick={() => {
            setLiked((v) => !v)
            setLikeCount((c) => (liked ? Math.max(0, c - 1) : c + 1))
          }}
        >
          <Heart className={cn("h-4 w-4", liked ? "fill-primary text-primary-foreground" : "")} />
          {likeCount}
        </Button>
        <Button variant="secondary" size="sm" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          {comments}
        </Button>
        <Button variant="secondary" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
    </Card>
  )
}
 