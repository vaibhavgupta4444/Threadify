"use client"

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Phone, 
  Video, 
  MoreVertical, 
  ArrowLeft,
  Users,
  Settings,
  Search
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { useSession } from 'next-auth/react'
import { useSocket } from '../../../contexts/SocketContext'
import { toast } from 'sonner'

interface ChatUser {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  image?: string
}

interface Message {
  _id: string
  content: string
  messageType: 'text' | 'image' | 'video' | 'file'
  mediaUrl?: string
  sender: ChatUser
  replyTo?: {
    _id: string
    content: string
    sender: ChatUser
  }
  readBy: { user: string; readAt: string }[]
  isEdited: boolean
  editedAt?: string
  createdAt: string
  updatedAt: string
}

interface Chat {
  _id: string
  participants: ChatUser[]
  isGroupChat: boolean
  chatName?: string
  chatImage?: string
  admins?: string[]
}

interface TypingUser {
  userId: string
  username: string
}

interface ChatRoomProps {
  chat: Chat
  onBack?: () => void
  className?: string
}

export function ChatRoom({ chat, onBack, className }: ChatRoomProps) {
  const { data: session } = useSession()
  const { socket } = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!chat._id || !session?.user?.id) return

      try {
        setLoading(true)
        const response = await fetch(
          `/api/chats/${chat._id}/messages?userId=${session.user.id}&limit=50`
        )
        
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
          setTimeout(scrollToBottom, 100)
        } else {
          toast.error('Failed to load messages')
        }
      } catch (error) {
        console.error('Error loading messages:', error)
        toast.error('Failed to load messages')
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [chat._id, session?.user?.id])

  // Socket event handlers
  useEffect(() => {
    if (!socket || !chat._id || !session?.user?.id) return

    // Join chat room
    socket.emit('joinChat', {
      chatId: chat._id,
      userId: session.user.id
    })

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      console.log("New message received:", message);
      setMessages(prev => [...prev, message])
      setTimeout(scrollToBottom, 100)
      
      // Mark message as read if not from current user
      if (message.sender._id !== session.user.id) {
        socket.emit('markAsRead', {
          messageIds: [message._id],
          userId: session.user.id,
          chatId: chat._id
        })
      }
    }

    // Listen for typing indicators
    const handleUserTyping = ({ userId, isTyping }: { userId: string, isTyping: boolean }) => {
      if (userId === session.user.id) return // Ignore own typing

      const user = chat.participants.find(p => p._id === userId)
      if (!user) return

      setTypingUsers(prev => {
        if (isTyping) {
          const exists = prev.find(u => u.userId === userId)
          if (!exists) {
            return [...prev, { userId, username: user.username }]
          }
          return prev
        } else {
          return prev.filter(u => u.userId !== userId)
        }
      })
    }

    // Listen for read status updates
    const handleMessagesRead = ({ messageIds, userId }: { messageIds: string[], userId: string }) => {
      if (userId === session.user.id) return // Ignore own read status

      setMessages(prev => prev.map(msg => {
        if (messageIds.includes(msg._id)) {
          const readByUser = msg.readBy.find(r => r.user === userId)
          if (!readByUser) {
            return {
              ...msg,
              readBy: [...msg.readBy, { user: userId, readAt: new Date().toISOString() }]
            }
          }
        }
        return msg
      }))
    }

    socket.on('newMessage', handleNewMessage)
    socket.on('userTyping', handleUserTyping)
    socket.on('messageRead', handleMessagesRead)

    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.off('userTyping', handleUserTyping)
      socket.off('messageRead', handleMessagesRead)
      
      // Leave chat room
      socket.emit('leaveChat', {
        chatId: chat._id,
        userId: session.user.id
      })
    }
  }, [socket, chat._id, chat.participants, session?.user?.id])

  // Mark messages as read when entering chat
  useEffect(() => {
    if (!socket || !session?.user?.id || messages.length === 0) return

    const unreadMessages = messages
      .filter(msg => msg.sender._id !== session.user.id)
      .filter(msg => !msg.readBy.some(r => r.user === session.user.id))

    if (unreadMessages.length > 0) {
      socket.emit('markAsRead', {
        messageIds: unreadMessages.map(msg => msg._id),
        userId: session.user.id,
        chatId: chat._id
      })
    }
  }, [messages, socket, session?.user?.id])

  const getChatDisplayName = () => {
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

  const getChatAvatar = () => {
    if (chat.isGroupChat && chat.chatImage) {
      return chat.chatImage
    }
    
    const otherParticipant = chat.participants.find(p => p._id !== session?.user?.id)
    return otherParticipant?.image
  }

  const getChatAvatarFallback = () => {
    if (chat.isGroupChat && chat.chatName) {
      return chat.chatName.charAt(0).toUpperCase()
    }
    
    const otherParticipant = chat.participants.find(p => p._id !== session?.user?.id)
    if (otherParticipant) {
      return otherParticipant.firstName?.charAt(0) || otherParticipant.username.charAt(0) || 'U'
    }
    
    return 'C'
  }

  const handleSendMessage = (content: string, type: 'text' | 'image' | 'video' | 'file' = 'text', mediaUrl?: string) => {
    if (!socket || !session?.user?.id) return

    const messageData = {
      chatId: chat._id,
      content,
      senderId: session.user.id,
      messageType: type,
      mediaUrl,
      replyTo: replyTo?._id
    }

    socket.emit('sendMessage', messageData)
    setReplyTo(null) // Clear reply after sending
  }

  const handleTyping = (isTyping: boolean) => {
    if (!socket || !session?.user?.id) return

    socket.emit('typing', {
      chatId: chat._id,
      userId: session.user.id,
      isTyping
    })
  }

  const handleReply = (message: Message) => {
    setReplyTo(message)
  }

  const handleEdit = (message: Message) => {
    // TODO: Implement message editing
    toast.info('Message editing coming soon!')
  }

  const handleDelete = (messageId: string) => {
    // TODO: Implement message deletion
    toast.info('Message deletion coming soon!')
  }

  const groupMessages = (messages: Message[]) => {
    const grouped: { date: string; messages: Message[] }[] = []
    let currentDate = ''
    let currentGroup: Message[] = []

    messages.forEach(message => {
      const messageDate = new Date(message.createdAt).toDateString()
      
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          grouped.push({ date: currentDate, messages: currentGroup })
        }
        currentDate = messageDate
        currentGroup = [message]
      } else {
        currentGroup.push(message)
      }
    })

    if (currentGroup.length > 0) {
      grouped.push({ date: currentDate, messages: currentGroup })
    }

    return grouped
  }

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  if (loading) {
    return (
      <Card className={`flex flex-col h-full ${className}`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-1/3 mb-2 animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-1/4 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-muted rounded-lg w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  const groupedMessages = groupMessages(messages)

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button size="icon" variant="ghost" onClick={onBack} className="md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={getChatAvatar() ? `https://ik.imagekit.io/threadify/${getChatAvatar()}` : undefined}
                alt={getChatDisplayName()}
              />
              <AvatarFallback>
                {getChatAvatarFallback()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{getChatDisplayName()}</h3>
              <div className="flex items-center space-x-2">
                {chat.isGroupChat && (
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {chat.participants.length}
                  </Badge>
                )}
                {typingUsers.length > 0 && (
                  <span className="text-sm text-muted-foreground animate-pulse">
                    {typingUsers.length === 1 
                      ? `${typingUsers[0].username} is typing...`
                      : `${typingUsers.length} people are typing...`
                    }
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button size="icon" variant="ghost">
              <Search className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost">
              <Phone className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost">
              <Video className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Chat Settings
                </DropdownMenuItem>
                {chat.isGroupChat && chat.admins?.includes(session?.user?.id || '') && (
                  <DropdownMenuItem>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Members
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {groupedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">No messages yet</div>
              <div className="text-sm">Send a message to start the conversation</div>
            </div>
          </div>
        ) : (
          groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Date header */}
              <div className="flex justify-center my-4">
                <Badge variant="outline" className="text-xs">
                  {formatDateHeader(group.date)}
                </Badge>
              </div>
              
              {/* Messages */}
              {group.messages.map((message, index) => {
                const prevMessage = index > 0 ? group.messages[index - 1] : null
                const showAvatar = !prevMessage || prevMessage.sender._id !== message.sender._id
                
                return (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isOwn={message.sender._id === session?.user?.id}
                    showAvatar={showAvatar}
                    isGroupChat={chat.isGroupChat}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        replyTo={replyTo || undefined}
        onCancelReply={() => setReplyTo(null)}
      />
    </Card>
  )
}