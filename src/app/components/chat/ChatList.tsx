"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { formatDistanceToNow } from 'date-fns'

interface ChatUser {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  image?: string
}

interface LastMessage {
  _id: string
  content: string
  messageType: string
  createdAt: string
}

interface Chat {
  _id: string
  participants: ChatUser[]
  isGroupChat: boolean
  chatName?: string
  chatImage?: string
  lastMessage?: LastMessage
  lastMessageTime?: string
  unreadCount?: number
}

interface ChatListProps {
  chats: Chat[]
  activeChat?: string
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
  isLoading?: boolean
}

export function ChatList({ chats, activeChat, onChatSelect, onNewChat, isLoading }: ChatListProps) {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredChats, setFilteredChats] = useState<Chat[]>(chats)

  useEffect(() => {
    if (!searchTerm) {
      setFilteredChats(chats)
      return
    }

    const filtered = chats.filter(chat => {
      if (chat.isGroupChat && chat.chatName) {
        return chat.chatName.toLowerCase().includes(searchTerm.toLowerCase())
      }
      
      // For one-on-one chats, search by other participant's name
      const otherParticipant = chat.participants.find(p => p._id !== session?.user?.id)
      if (otherParticipant) {
        const fullName = `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim()
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               otherParticipant.username.toLowerCase().includes(searchTerm.toLowerCase())
      }
      
      return false
    })
    
    setFilteredChats(filtered)
  }, [searchTerm, chats, session?.user?.id])

  const getChatDisplayName = (chat: Chat) => {
    if (chat.isGroupChat && chat.chatName) {
      return chat.chatName
    }
    
    const otherParticipant = chat.participants.find(p => p._id !== session?.user?.id)
    if (otherParticipant) {
      return otherParticipant.firstName && otherParticipant.lastName
        ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
        : otherParticipant.username
    }
    
    return 'Unknown Chat'
  }

  const getChatAvatar = (chat: Chat) => {
    if (chat.isGroupChat && chat.chatImage) {
      return chat.chatImage
    }
    
    const otherParticipant = chat.participants.find(p => p._id !== session?.user?.id)
    return otherParticipant?.image
  }

  const getChatAvatarFallback = (chat: Chat) => {
    if (chat.isGroupChat && chat.chatName) {
      return chat.chatName.charAt(0).toUpperCase()
    }
    
    const otherParticipant = chat.participants.find(p => p._id !== session?.user?.id)
    if (otherParticipant) {
      return otherParticipant.firstName?.charAt(0) || otherParticipant.username.charAt(0) || 'U'
    }
    
    return 'C'
  }

  const formatLastMessageTime = (time?: string) => {
    if (!time) return ''
    try {
      return formatDistanceToNow(new Date(time), { addSuffix: true })
    } catch {
      return ''
    }
  }

  const truncateMessage = (content: string, maxLength = 50) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Messages</h2>
            <Button size="icon" variant="ghost">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              disabled
            />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          <Button size="icon" variant="ghost" onClick={onNewChat}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              {searchTerm ? 'No chats found' : 'No conversations yet'}
            </div>
            {!searchTerm && (
              <Button onClick={onNewChat} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Start a conversation
              </Button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredChats.map((chat) => (
              <Card
                key={chat._id}
                className={`mb-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                  activeChat === chat._id ? 'bg-primary/20' : ''
                }`}
                onClick={() => onChatSelect(chat._id)}
              >
                <div className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={getChatAvatar(chat) ? `https://ik.imagekit.io/threadify/${getChatAvatar(chat)}` : undefined}
                          alt={getChatDisplayName(chat)}
                        />
                        <AvatarFallback>
                          {getChatAvatarFallback(chat)}
                        </AvatarFallback>
                      </Avatar>
                      {chat.isGroupChat && (
                        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {chat.participants.length}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">
                          {getChatDisplayName(chat)}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {chat.lastMessageTime && (
                            <span className="text-xs text-muted-foreground">
                              {formatLastMessageTime(chat.lastMessageTime)}
                            </span>
                          )}
                          {chat.unreadCount && chat.unreadCount > 0 && (
                            <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {chat.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {chat.lastMessage.messageType === 'text'
                            ? truncateMessage(chat.lastMessage.content)
                            : `📎 ${chat.lastMessage.messageType}`
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}