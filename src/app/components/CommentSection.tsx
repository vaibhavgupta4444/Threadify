"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
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
  const [newComment, setNewComment] = useState<string>("")
  const [allComments, setAllComments] = useState<CommentForm[]>(contents)
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loaderRef = useRef(null);
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
  };

  useEffect(() => {
    async function fetchComment() {
      setLoading(true);
      const response = await apiClient.getComments({ postId, page: page + 1 });
      if (response.success) {
        if (response.comments?.length === 0) {
          setHasMore(false);
        } else {
          setAllComments(prev => [...prev, ...response.comments || []]);
        }
        setPage(e => e + 1);
        setLoading(false);
      }
    }
    if (hasMore) fetchComment();
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loading, hasMore]);

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
            Comment
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


        {loading && <p className="text-center">Loading...</p>}
        {/* {!hasMore && <p className="text-center">No more comments...</p>} */}

        {/* invisible div for observer */}
        <div ref={loaderRef} className="h-1" />
      </div>
    </Card>
  )
}
