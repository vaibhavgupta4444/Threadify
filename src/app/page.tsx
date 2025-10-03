"use client"

import { PostCard } from "./components/PostCard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Compass, Users } from "lucide-react"
import UploadPost from "./components/UploadPost"
import { useEffect, useRef, useState } from "react"
import { apiClient } from "../../lib/app-client"
import { postInterface } from "../../models/Post"
import { toast } from "sonner"


export default function HomePage() {

  const [post, setPost] = useState<postInterface[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loaderRef = useRef(null);

  const getPosts = async () => {

    try {
      const response = await apiClient.getPosts({ page: page + 1 });

      if (response.success && response.posts) {
        setPost([...response?.posts]);
        setPage(page + 1);
      } else {
        setPost([]);
        setHasMore(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong!");
    }
  }

  useEffect(() => {
    if (hasMore) {
      getPosts();
    }
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore]);

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Left sidebar */}
            <aside className="hidden md:col-span-3 md:block">
              <Card className="p-2">
                <nav className="flex flex-col gap-1" aria-label="Sidebar">
                  <Button asChild variant="ghost" className="justify-start gap-2">
                    <Link href="/">
                      <Compass className="h-4 w-4" />
                      Home
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="justify-start gap-2">
                    <Link href="/explore">
                      <Compass className="h-4 w-4" />
                      Explore
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="justify-start gap-2">
                    <Link href="/following">
                      <Users className="h-4 w-4" />
                      Following
                    </Link>
                  </Button>
                  <UploadPost />
                </nav>
              </Card>
            </aside>

            {/* Feed */}
            <section className="md:col-span-6">
              {/* composer */}
              <Card className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Share a new reel or update — let your creativity shine!
                  </p>
                  <UploadPost />
                </div>
              </Card>

              <div className="mt-6 space-y-6">
                {post &&
                  post.map(d => <PostCard
                    key={d._id!.toString()}
                    {...d}
                  />)
                }
              </div>
              <div>
                {!hasMore && <p className="text-center mt-4 font-semibold text-primary opacity-40">No more Posts...</p>}

                {/* invisible div for observer */}
                <div ref={loaderRef} className="h-4" />
              </div>
            </section>

            {/* Right sidebar */}
            <aside className="hidden md:col-span-3 md:block">
              <div className="space-y-6">
                <Card className="p-4">
                  <h2 className="text-sm font-medium mb-3">Trending Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {["#bts", "#cinematic", "#travel", "#dance", "#edit"].map((tag) => (
                      <Button key={tag} variant="secondary" size="sm">
                        {tag}
                      </Button>
                    ))}
                  </div>
                </Card>
                <Card className="p-4">
                  <h2 className="text-sm font-medium mb-3">Suggested Creators</h2>
                  <div className="flex flex-col gap-2">
                    {["@samvids", "@lunaedits", "@mike_travel"].map((user) => (
                      <div key={user} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img className="h-8 w-8 rounded-full" src="/diverse-avatars.png" alt="" />
                          <p className="text-sm">{user}</p>
                        </div>
                        <Button size="sm" variant="secondary">
                          Follow
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </aside>
          </div>
        </div >
      </main >
    </div >
  )
}
