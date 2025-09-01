"use client"

import { Navbar } from "./components/Navbar"
import { PostCard } from "./components/PostCard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Compass, Users } from "lucide-react"
import UploadReel from "./components/UploadReel"
import { useEffect, useState } from "react"
import { apiClient } from "../../lib/app-client"
import { videoInterface } from "../../models/video"

export default function HomePage() {

  const [post, setPost] = useState<videoInterface[]>([]);

  const getVideos = async ()=>{
    try{
      const response = await apiClient.getVideos();
      if(response.success && response.videos){
        setPost([...response?.videos]);
      }else{
        setPost([]);
      }
    }catch(err){
      console.log(err);
    }
  }

  useEffect(()=>{
    getVideos();
  },[])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
                  <UploadReel />
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
                  <UploadReel />
                </div>
              </Card>

              <div className="mt-6 space-y-6">
                { post &&
                  post.map(d => <PostCard
                  key={d._id.toString()}
                  {...d}
                />)
                }
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
        </div>
      </main>
    </div>
  )
}
