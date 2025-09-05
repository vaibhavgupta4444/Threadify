"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Home, Compass, Heart, User, Plus, Menu, X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { signOut, useSession } from "next-auth/react"

export function Navbar() {
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 transition-opacity hover:opacity-90"
                        aria-label="Threadify home"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                            <span className="text-sm font-bold text-primary-foreground">T</span>
                        </div>
                        <span className="hidden text-xl font-bold text-foreground sm:inline">Threadify</span>
                    </Link>

                    {/* Desktop search */}
                    <div className="hidden lg:block">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input type="text" placeholder="Search reels, creators..." className="w-80 pl-9" aria-label="Search" />
                        </div>
                    </div>

                    {/* Desktop actions */}
                    <div className="hidden items-center gap-2 md:flex">
                        <Button asChild variant="ghost" className="gap-1">
                            <Link href="/">
                                <Home className="h-5 w-5" />
                                <span className="hidden lg:inline">Home</span>
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" className="gap-1">
                            <Link href="/explore">
                                <Compass className="h-5 w-5" />
                                <span className="hidden lg:inline">Explore</span>
                            </Link>
                        </Button>

                        {isAuthenticated ? (
                            <>
                                {/* <Button className="gap-1">
                                    <Plus className="h-5 w-5" />
                                    <span className="hidden sm:inline">Create</span>
                                </Button> */}

                                <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                                    <Bell className="h-5 w-5" />
                                    <span
                                        aria-hidden="true"
                                        className="absolute right-1 top-1 inline-block h-2 w-2 rounded-full bg-accent"
                                    />
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://ik.imagekit.io/threadify${session.user?.image}`} alt="User avatar" />
                                                <AvatarFallback>{(session.user.email || "U").slice(0, 1).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <span className="hidden sm:inline">You</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="gap-2">
                                            <User className="h-4 w-4" />
                                            Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Settings</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive" onClick={() => signOut()}>
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    Log in
                                </Link>
                                <Link href="/register" className="bg-primary text-primary-foreground p-2 transition-opacity hover:opacity-90 rounded-md">Register Now</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile buttons */}
                    <div className="flex items-center gap-2 md:hidden">
                        <Button variant="ghost" size="icon" aria-label="Toggle search" onClick={() => setIsSearchOpen((v) => !v)}>
                            <Search className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Toggle menu" onClick={() => setIsMobileMenuOpen((v) => !v)}>
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile search */}
            {isSearchOpen && (
                <div className="border-t border-border bg-background p-4 md:hidden">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="text" placeholder="Search reels, creators..." className="w-full pl-9" aria-label="Search" />
                    </div>
                </div>
            )}

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="border-t border-border bg-background md:hidden">
                    <div className="p-2">
                        <Button asChild variant="ghost" className="w-full justify-start gap-2">
                            <Link href="/">
                                <Home className="h-5 w-5" />
                                Home
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full justify-start gap-2">
                            <Link href="/explore">
                                <Compass className="h-5 w-5" />
                                Explore
                            </Link>
                        </Button>

                        {isAuthenticated ? (
                            <>
                                {/* <Button className="mt-1 w-full justify-start gap-2">
                                    <Plus className="h-5 w-5" />
                                    Create
                                </Button> */}
                                <Button variant="ghost" className="mt-1 w-full justify-start gap-2">
                                    <Heart className="h-5 w-5" />
                                    Activity
                                </Button>
                                <Button variant="ghost" className="mt-1 w-full justify-start gap-2">
                                    <User className="h-5 w-5" />
                                    Profile
                                </Button>
                                <div className="my-2 h-px bg-border" />
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-destructive"
                                    onClick={() => signOut()}
                                >
                                    Log out
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="my-2 h-px" />
                                <button className="w-full justify-start bg-primary text-primary-foreground rounded-md py-0.5 hover:opacity-90">
                                    <Link href="/login">
                                        Log In
                                    </Link>
                                </button>
                                <button className="mt-2 w-full bg-primary text-primary-foreground rounded-md py-0.5 hover:opacity-90">
                                    <Link href="/register" >Register Now</Link>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
