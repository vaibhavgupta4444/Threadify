"use client"

import { useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { MoreHorizontal, Reply, Edit, Trash2, Check, CheckCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MessageUser {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  image?: string
}

interface ReplyToMessage {
  _id: string
  content: string
  sender: MessageUser
}

interface ReadStatus {
  user: string
  readAt: string
}

interface Message {
  _id: string
  content: string
  messageType: 'text' | 'image' | 'video' | 'file'
  mediaUrl?: string
  sender: MessageUser
  replyTo?: ReplyToMessage
  readBy: ReadStatus[]
  isEdited: boolean
  editedAt?: string
  createdAt: string
  updatedAt: string
}

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  isGroupChat?: boolean
  onReply?: (message: Message) => void
  onEdit?: (message: Message) => void
  onDelete?: (messageId: string) => void
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  isGroupChat = false,
  onReply,
  onEdit,
  onDelete
}: MessageBubbleProps) {
  const [showTime, setShowTime] = useState(false)

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return format(date, 'HH:mm')
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE HH:mm')
    } else {
      return format(date, 'MMM dd, HH:mm')
    }
  }

  const getDisplayName = (user: MessageUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.username
  }

  const getReadStatus = () => {
    if (!isOwn || message.readBy.length === 0) return null

    const readCount = message.readBy.length
    if (readCount === 1) {
      if(isGroupChat) return <Check className="h-3 w-3 text-muted-foreground" />
      return <CheckCheck className="h-3 w-3 text-primary" />
    } else {
      return <CheckCheck className="h-3 w-3 text-primary" />
    }
  }

  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'image':
        return (
          <div className="max-w-sm">
            <img
              src={message.mediaUrl ? `https://ik.imagekit.io/threadify/${message.mediaUrl}` : ''}
              alt="Shared image"
              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => {
                // TODO: Open image in modal
                window.open(message.mediaUrl ? `https://ik.imagekit.io/threadify/${message.mediaUrl}` : '', '_blank')
              }}
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        )

      case 'video':
        return (
          <div className="max-w-sm">
            <video
              src={message.mediaUrl ? `https://ik.imagekit.io/threadify/${message.mediaUrl}` : ''}
              controls
              className="rounded-lg max-w-full h-auto"
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        )

      case 'file':
        return (
          <div className="flex items-center space-x-2 p-3 border rounded-lg max-w-sm">
            <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
              📄
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.content}</p>
              <a
                href={message.mediaUrl ? `https://ik.imagekit.io/threadify/${message.mediaUrl}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Download
              </a>
            </div>
          </div>
        )

      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
    }
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <Avatar className="h-8 w-8 mb-1">
            <AvatarImage
              src={message.sender.image ? `https://ik.imagekit.io/threadify/${message.sender.image}` : undefined}
              alt={getDisplayName(message.sender)}
            />
            <AvatarFallback className="text-xs">
              {message.sender.firstName?.charAt(0) || message.sender.username.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Message bubble */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender name for group chats */}
            {isGroupChat && !isOwn && showAvatar && (
              <span className="text-xs text-muted-foreground mb-1 px-2">
                {getDisplayName(message.sender)} 
              </span>
            )}

            {/* Reply indicator */}
            {message.replyTo && (
              <div className={`text-xs p-2 mb-1 rounded border-l-2 ${isOwn
                  ? 'bg-primary/10 border-primary text-primary-foreground/80'
                  : 'bg-muted border-muted-foreground'
                } max-w-full`}>
                <div className="font-medium">{getDisplayName(message.replyTo.sender)}</div>
                <div className="truncate">{message.replyTo.content}</div>
              </div>
            )}

            {/* Message content */}
            <div
              className={`flex px-3 py-2 rounded-2xl ${isOwn
                  ? 'flex-row-reverse bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
                } cursor-pointer transition-all hover:shadow-md`}
              onClick={() => setShowTime(!showTime)}
            >
              {renderMessageContent()}

              {/* Message actions */}
              <div className={`${ isOwn ? 'mr-1' : 'ml-1'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isOwn ? "start" : "end"}>
                    {onReply && (
                      <DropdownMenuItem onClick={() => onReply(message)}>
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </DropdownMenuItem>
                    )}
                    {isOwn && onEdit && message.messageType === 'text' && (
                      <DropdownMenuItem onClick={() => onEdit(message)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {isOwn && onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(message._id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          

          {/* Timestamp and read status */}
          <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            {showTime && (
              <span className="text-xs text-muted-foreground">
                {formatTime(message.createdAt)}
                {message.isEdited && ' (edited)'}
              </span>
            )}
            {isOwn && getReadStatus()}
          </div>
        </div>
      </div>
    </div>
  )
}