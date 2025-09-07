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

interface CommentSectionProps {
  _id?: string;
  postId: string;
  contents?: CommentForm[];
}

export function CommentSection({ postId, contents = [] }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [allComments, setAllComments] = useState<CommentForm[]>(contents)
  const { data } = useSession();

  console.log(allComments)

  async function handleAddComment() {
    if (!newComment.trim()) return
    try {
    
      await apiClient.createComment({postId, userId:data?.user.id!, content:newComment });

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong" );
    }finally{
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
        <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
          {allComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
          ) : (
            allComments.map((c) => (
              <div key={c._id?.toString()} className="flex gap-2 items-start">
                <Avatar className="h-8 w-8">
                  {c.userData ? (
                    <AvatarImage src={`https://ik.imagekit.io/threadify/${c.userData.image}`} />
                  ) : (
                    <AvatarFallback>{'U'}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{c.userData?.username || 'U'}</span>
                  <p className="text-sm">{c.content}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.createdAt?.toString()!).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}
