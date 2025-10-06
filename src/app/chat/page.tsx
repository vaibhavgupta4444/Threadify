"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ChatList } from '../components/chat/ChatList'
import { ChatRoom } from '../components/chat/ChatRoom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  MessageCircle, 
  Plus, 
  Search, 
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface ChatUser {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  image?: string
}

interface Chat {
  _id: string
  participants: ChatUser[]
  isGroupChat: boolean
  chatName?: string
  chatImage?: string
  lastMessage?: {
    _id: string
    content: string
    messageType: string
    createdAt: string
  }
  lastMessageTime?: string
  unreadCount?: number
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [searchUsers, setSearchUsers] = useState('')
  const [searchResults, setSearchResults] = useState<ChatUser[]>([])
  const [selectedUsers, setSelectedUsers] = useState<ChatUser[]>([])
  const [isCreatingChat, setIsCreatingChat] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Load user's chats
  useEffect(() => {
    const loadChats = async () => {
      if (!session?.user?.id) return

      try {
        setLoading(true)
        const response = await fetch(`/api/chats?userId=${session.user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          setChats(data.chats || [])
        } else {
          toast.error('Failed to load chats')
        }
      } catch (error) {
        console.error('Error loading chats:', error)
        toast.error('Failed to load chats')
      } finally {
        setLoading(false)
      }
    }

    loadChats()
  }, [session?.user?.id])

  // Search users for new chat
  useEffect(() => {
    const searchUsersDebounced = async () => {
      if (!searchUsers.trim() || searchUsers.length < 2) {
        setSearchResults([])
        return
      }

      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchUsers)}`)
        if (response.ok) {
          const data = await response.json()
          // Filter out current user and already selected users
          const filtered = (data.users || []).filter((user: ChatUser) => 
            user._id !== session?.user?.id && 
            !selectedUsers.some(selected => selected._id === user._id)
          )
          setSearchResults(filtered)
        }
      } catch (error) {
        console.error('Error searching users:', error)
      }
    }

    const timeoutId = setTimeout(searchUsersDebounced, 300)
    return () => clearTimeout(timeoutId)
  }, [searchUsers, selectedUsers, session?.user?.id])

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId)
    const chat = chats.find(c => c._id === chatId)
    setSelectedChat(chat || null)
  }

  const handleNewChat = () => {
    setShowNewChatDialog(true)
    setSearchUsers('')
    setSearchResults([])
    setSelectedUsers([])
  }

  const handleUserSelect = (user: ChatUser) => {
    setSelectedUsers(prev => [...prev, user])
    setSearchResults(prev => prev.filter(u => u._id !== user._id))
    setSearchUsers('')
  }

  const handleUserRemove = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId))
  }

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0 || !session?.user?.id) return

    try {
      setIsCreatingChat(true)
      
      const participants = [session.user.id, ...selectedUsers.map(u => u._id)]
      const isGroupChat = selectedUsers.length > 1

      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participants,
          isGroupChat,
          chatName: isGroupChat ? `Group with ${selectedUsers.map(u => u.username).join(', ')}` : undefined,
          createdBy: session.user.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        const newChat = data.chat

        // Add to chats list if it's a new chat
        setChats(prev => {
          const exists = prev.find(c => c._id === newChat._id)
          if (exists) return prev
          return [newChat, ...prev]
        })

        // Select the new chat
        handleChatSelect(newChat._id)
        setShowNewChatDialog(false)
        toast.success('Chat created successfully')
      } else {
        toast.error('Failed to create chat')
      }
    } catch (error) {
      console.error('Error creating chat:', error)
      toast.error('Failed to create chat')
    } finally {
      setIsCreatingChat(false)
    }
  }

  const getDisplayName = (user: ChatUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.username
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Chat List Sidebar */}
        <div className={`w-full md:w-96 border-r border-border ${activeChat ? 'hidden md:block' : 'block'}`}>
          <ChatList
            chats={chats}
            activeChat={activeChat || undefined}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            isLoading={loading}
          />
        </div>

        {/* Chat Room or Welcome Screen */}
        <div className={`flex-1 ${!activeChat ? 'hidden md:block' : 'block'}`}>
          {selectedChat ? (
            <ChatRoom
              chat={selectedChat}
              onBack={() => setActiveChat(null)}
              className="h-full border-none"
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-muted/20">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Welcome to Chat</h2>
                <p className="text-muted-foreground mb-6">
                  Select a conversation from the sidebar to start messaging, or create a new chat to connect with others.
                </p>
                <Button onClick={handleNewChat} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start New Chat</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search Users */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users by username or name..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Selected:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <div key={user._id} className="flex items-center bg-primary/10 rounded-full px-3 py-1">
                      <Avatar className="w-6 h-6 mr-2">
                        <AvatarImage src={user.image ? `https://ik.imagekit.io/threadify/${user.image}` : undefined} />
                        <AvatarFallback className="text-xs">
                          {user.firstName?.charAt(0) || user.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{getDisplayName(user)}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-4 h-4 ml-2"
                        onClick={() => handleUserRemove(user._id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="max-h-40 overflow-y-auto">
                <p className="text-sm font-medium mb-2">Users:</p>
                {searchResults.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center p-2 hover:bg-muted rounded-lg cursor-pointer"
                    onClick={() => handleUserSelect(user)}
                  >
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarImage src={user.image ? `https://ik.imagekit.io/threadify/${user.image}` : undefined} />
                      <AvatarFallback>
                        {user.firstName?.charAt(0) || user.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getDisplayName(user)}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Create Chat Button */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateChat}
                disabled={selectedUsers.length === 0 || isCreatingChat}
              >
                {isCreatingChat ? 'Creating...' : 'Create Chat'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}