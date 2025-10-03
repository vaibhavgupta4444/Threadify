"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Settings,
    Grid3X3,
    Bookmark,
    UserPlus,
    UserMinus,
    MessageCircle,
    MoreHorizontal,
    Calendar,
    Film
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import type { UserInterface } from "../../../../models/User"
import type { postInterface } from "../../../../models/Post"

interface ProfileData extends UserInterface {
    postsCount?: number
    followersCount?: number
    followingCount?: number
}

export default function ProfilePage() {
    const params = useParams()
    const { data: session } = useSession()
    const username = params?.username as string

    const [profileData, setProfileData] = useState<ProfileData | null>(null)
    const [userPosts, setUserPosts] = useState<postInterface[]>([])
    const [isFollowing, setIsFollowing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts")

    const isOwnProfile = session?.user?.username === username

    useEffect(() => {
        const fetchProfileData = async () => {
            if (userPosts.length > 0) return;
            try {
                setIsLoading(true)
                // You'll need to create these API endpoints
                const [profileResponse, postsResponse] = await Promise.all([
                    fetch(`/api/users/${username}`),
                    fetch(`/api/posts/user/${username}`)
                ])

                if (profileResponse.ok) {
                    const profile = await profileResponse.json()
                    setProfileData(profile)

                    // Check if current user is following this profile
                    if (session?.user?.id && profile.followers) {
                        setIsFollowing(profile.followers.includes(session.user.id))
                    }
                }

                if (postsResponse.ok) {
                    const posts = await postsResponse.json()
                    setUserPosts(posts)
                }
            } catch (error) {
                console.error("Error fetching profile:", error)
                toast.error("Failed to load profile")
            } finally {
                setIsLoading(false)
            }
        }

        if (username) {
            fetchProfileData()
        }
    }, [username, session?.user?.id])

    const handleFollowToggle = async () => {
        if (!session?.user?.id || !profileData?._id) return

        try {
            // You'll need to create this API endpoint
            const response = await fetch(`/api/users/${profileData._id}/follow`, {
                method: isFollowing ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id })
            })

            if (response.ok) {
                setIsFollowing(!isFollowing)
                setProfileData(prev => prev ? {
                    ...prev,
                    followersCount: isFollowing
                        ? (prev.followersCount || 0) - 1
                        : (prev.followersCount || 0) + 1
                } : null)
                toast.success(isFollowing ? 'Unfollowed' : 'Following')
            }
        } catch (error) {
            toast.error('Failed to update follow status')
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pt-16">
                <div className="mx-auto max-w-4xl px-4 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="flex gap-6">
                            <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                            <div className="flex-1 space-y-3">
                                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-background pt-16">
                <div className="mx-auto max-w-4xl px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">User not found</h1>
                        <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
                        <Button asChild className="mt-4">
                            <Link href="/">Go Home</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pt-16">
            <div className="mx-auto max-w-4xl px-4 py-8">
                {/* Profile Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                        {/* Avatar */}
                        <div className="flex justify-center md:justify-start">
                            <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-2 ring-border">
                                <AvatarImage
                                    src={profileData.image ? `https://ik.imagekit.io/threadify/${profileData.image}` : undefined}
                                    alt={`${profileData.firstName} ${profileData.lastName}`}
                                />
                                <AvatarFallback className="text-2xl md:text-3xl">
                                    {profileData.firstName?.charAt(0) || profileData.username?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 space-y-4">
                            {/* Username and Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl md:text-2xl font-semibold">
                                        {profileData.username}
                                    </h1>
                                    {profileData.verified && (
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            Verified
                                        </Badge>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    {isOwnProfile ? (
                                        <>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href="/update-profile">
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    Edit Profile
                                                </Link>
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={handleFollowToggle}
                                                variant={isFollowing ? "outline" : "default"}
                                                size="sm"
                                            >
                                                {isFollowing ? (
                                                    <>
                                                        <UserMinus className="h-4 w-4 mr-2" />
                                                        Unfollow
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="h-4 w-4 mr-2" />
                                                        Follow
                                                    </>
                                                )}
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                Message
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-6 text-sm">
                                <div className="text-center">
                                    <span className="font-semibold">{profileData.postsCount || userPosts.length}</span>
                                    <span className="text-muted-foreground ml-1">posts</span>
                                </div>
                                <div className="text-center">
                                    <span className="font-semibold">{profileData.followersCount || profileData.followers?.length || 0}</span>
                                    <span className="text-muted-foreground ml-1">followers</span>
                                </div>
                                <div className="text-center">
                                    <span className="font-semibold">{profileData.followingCount || profileData.following?.length || 0}</span>
                                    <span className="text-muted-foreground ml-1">following</span>
                                </div>
                            </div>

                            {/* Name and Bio */}
                            <div className="space-y-2">
                                {(profileData.firstName || profileData.lastName) && (
                                    <h2 className="font-semibold">
                                        {profileData.firstName} {profileData.lastName}
                                    </h2>
                                )}
                                {profileData.bio && (
                                    <p className="text-sm whitespace-pre-wrap">{profileData.bio}</p>
                                )}
                                {profileData.createdAt && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        Joined {new Date(profileData.createdAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-border mb-6">
                    <div className="flex justify-center gap-8">
                        <button
                            onClick={() => setActiveTab("posts")}
                            className={`flex items-center gap-2 py-3 px-1 border-b-2 transition-colors ${activeTab === "posts"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Grid3X3 className="h-4 w-4" />
                            <span className="text-sm font-medium">POSTS</span>
                        </button>
                        {isOwnProfile && (
                            <button
                                onClick={() => setActiveTab("saved")}
                                className={`flex items-center gap-2 py-3 px-1 border-b-2 transition-colors ${activeTab === "saved"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Bookmark className="h-4 w-4" />
                                <span className="text-sm font-medium">SAVED</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Grid */}
                <div className="space-y-6">
                    {activeTab === "posts" && (
                        <div>
                            {userPosts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {userPosts.map((post) => (
                                        <div className="group cursor-pointer hover:opacity-80 transition-opacity">
                                            <div className="relative aspect-square">
                                                {post.mediaType === "image" ?
                                                    <img
                                                        src={`https://ik.imagekit.io/threadify${post.mediaUrl}`}
                                                        className="w-full h-full object-cover" />
                                                    :
                                                    <div className="relative w-full h-full">
                                                        <video
                                                            width={post.transformation?.width}
                                                            height={post.transformation?.height}
                                                            src={`https://ik.imagekit.io/threadify${post.mediaUrl}`}
                                                            className="w-full h-full object-cover"
                                                            playsInline
                                                            loop
                                                            muted={true}
                                                            controls={false}
                                                        />
                                                        {/* Video Badge */}
                                                        <Badge
                                                            variant="secondary"
                                                            className="absolute top-2 right-2 bg-black/70 text-white border-0 text-md px-2 py-1"
                                                        >
                                                           <Film/>
                                                        </Badge>
                                                    </div>
                                                }
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="flex items-center gap-4 text-white">
                                                        <div className="flex items-center gap-1">
                                                            <span>❤️</span>
                                                            <span>{post.likes || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MessageCircle className="h-4 w-4" />
                                                            <span>{post.comments || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="border-2 border-muted-foreground/20 rounded-full p-8 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                        <Grid3X3 className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {isOwnProfile ? "Share your first post!" : `${profileData.username} hasn't posted anything yet.`}
                                    </p>
                                    {isOwnProfile && (
                                        <Button asChild>
                                            <Link href="/">Create Post</Link>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "saved" && isOwnProfile && (
                        <div className="text-center py-12">
                            <div className="border-2 border-muted-foreground/20 rounded-full p-8 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                <Bookmark className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No Saved Posts</h3>
                            <p className="text-muted-foreground">
                                Posts you save will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}