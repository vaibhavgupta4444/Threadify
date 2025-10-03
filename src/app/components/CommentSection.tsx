"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import type { CommentInterface } from "../../../models/Comment"
import { apiClient } from "../../../lib/app-client"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { CommentForm } from "../../../types/responseType"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { timeAgo } from "./PostCard"

interface CommentSectionProps {
  _id?: string;
  postId: string;
  contents?: CommentForm[];
}

export function CommentSection({ postId, contents = [] }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [allComments, setAllComments] = useState<CommentForm[]>(contents)
  const { data } = useSession();

  async function handleAddComment() {
    if (!newComment.trim()) return
    try {

      await apiClient.createComment({ postId, userId: data?.user.id!, content: newComment });

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setNewComment("");
    }
  }

  return (
    <Card className="border-none p-3">
      <div className="space-y-3">
        {/* Input box */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          />
          <Button size="sm" onClick={handleAddComment}>
            Post
          </Button>
        </div>

        {/* Comment list */}
        <div className="space-y-4 max-h-40 overflow-y-auto pr-1 w-full pt-2">
          {allComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
          ) : (
            allComments.map((c) => (
              <div key={c._id?.toString()} className="flex gap-2 items-start w-full px-1">
                <Avatar className="h-8 w-8">
                  {c.userData?.image ? (
                    <AvatarImage src={`https://ik.imagekit.io/threadify/${c.userData.image}`} />
                  ) : (
                    <AvatarFallback>{c.userData?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col w-full">
                  <p className="flex justify-between w-full">
                    <span className="text-sm font-medium">{c.userData?.username || 'U'}</span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(c.createdAt!)}
                    </span>
                  </p>
                  <p className="text-sm">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}
