"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Home, Compass, Heart, User, Plus, Menu, X } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

export function Navbar() {

    const { data: session } = useSession();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.log(error);
        }
    }

    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    // Mock authentication state - replace with actual auth logic
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">T</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900 hidden sm:block">Threadify</span>
                    </Link>

                    {/* Desktop Search Bar */}
                    <div className="hidden lg:flex items-center">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search reels, creators..."
                                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        <Link
                            href="/"
                            className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Home className="w-5 h-5 text-gray-700" />
                            <span className="hidden lg:inline text-gray-700">Home</span>
                        </Link>
                        <Link
                            href="/explore"
                            className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Compass className="w-5 h-5 text-gray-700" />
                            <span className="hidden lg:inline text-gray-700">Explore</span>
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <button className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                                    <Plus className="w-5 h-5 text-gray-700" />
                                    <span className="hidden lg:inline text-gray-700">Create</span>
                                </button>
                                <button className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                                    <Heart className="w-5 h-5 text-gray-700" />
                                    <span className="hidden lg:inline text-gray-700">Activity</span>
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
                                </button>

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-amber-500 transition-all"
                                    >
                                        <img src="/diverse-user-avatars.png" alt="User" className="w-full h-full object-cover" />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <span>Profile</span>
                                            </button>
                                            <button className="w-full px-4 py-2 text-left hover:bg-gray-50">Settings</button>
                                            <hr className="my-2 border-gray-200" />
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">

                                <Link href="/login" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Log in</Link>
                                <Link href="/register" className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">Sign up</Link>

                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Buttons */}
                    <div className="md:hidden flex items-center space-x-2">
                        <button
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        >
                            <Search className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar */}
            {isSearchOpen && (
                <div className="md:hidden p-4 border-t border-gray-200 bg-white">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search reels, creators..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                    </div>
                </div>
            )}

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="p-4 space-y-2">
                        <Link href="/" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <Home className="w-5 h-5 text-gray-700" />
                            <span className="text-gray-700">Home</span>
                        </Link>
                        <Link
                            href="/explore"
                            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <Compass className="w-5 h-5 text-gray-700" />
                            <span className="text-gray-700">Explore</span>
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                    <Plus className="w-5 h-5 text-gray-700" />
                                    <span className="text-gray-700">Create</span>
                                </button>
                                <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                    <Heart className="w-5 h-5 text-gray-700" />
                                    <span className="text-gray-700">Activity</span>
                                </button>
                                <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                    <User className="w-5 h-5 text-gray-700" />
                                    <span className="text-gray-700">Profile</span>
                                </button>
                                <hr className="my-2 border-gray-200" />
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors text-red-600"
                                >
                                    Log out
                                </button>
                            </>
                        ) : (
                            <>
                                <hr className="my-2 border-gray-200" />

                                <Link href="/login" className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors text-gray-700">Log in</Link>
                                <Link href="/register" className="w-full mt-2 p-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">Sign up</Link>

                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
