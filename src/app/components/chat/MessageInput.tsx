"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  Send, 
  Paperclip, 
  Image, 
  Smile, 
  X,
  Mic,
  MicOff
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'

interface ReplyToMessage {
  _id: string
  content: string
  sender: {
    _id: string
    username: string
    firstName?: string
    lastName?: string
  }
}

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'video' | 'file', mediaUrl?: string) => void
  onTyping?: (isTyping: boolean) => void
  replyTo?: ReplyToMessage
  onCancelReply?: () => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSendMessage,
  onTyping,
  replyTo,
  onCancelReply,
  disabled = false,
  placeholder = "Type a message..."
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [replyTo])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessage(value)

    // Handle typing indicator
    if (onTyping) {
      onTyping(true)
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false)
      }, 1000)
    }
  }

  const handleSendMessage = () => {
    if (!message.trim() || disabled) return

    onSendMessage(message.trim())
    setMessage('')
    
    // Stop typing indicator
    if (onTyping) {
      onTyping(false)
    }
    
    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Focus back on input
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = async (file: File, type: 'image' | 'video' | 'file') => {
    if (!file) return

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsUploading(true)

    try {
      // TODO: Implement file upload to your storage service (ImageKit/Cloudinary)
      // For now, we'll simulate the upload
      const formData = new FormData()
      formData.append('file', file)
      
      // Replace with your actual upload endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      const mediaUrl = data.filePath || data.url

      // Send message with media
      onSendMessage(file.name, type, mediaUrl)
      
      toast.success('File uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file, 'image')
    }
    e.target.value = '' // Reset input
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const isVideo = file.type.startsWith('video/')
      handleFileUpload(file, isVideo ? 'video' : 'file')
    }
    e.target.value = '' // Reset input
  }

  const handleVoiceRecord = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false)
      // TODO: Implement voice recording functionality
      toast.info('Voice recording feature coming soon!')
    } else {
      // Start recording
      setIsRecording(true)
      // TODO: Implement voice recording functionality
      toast.info('Voice recording feature coming soon!')
    }
  }

  const getReplyDisplayName = (sender: ReplyToMessage['sender']) => {
    if (sender.firstName && sender.lastName) {
      return `${sender.firstName} ${sender.lastName}`
    }
    return sender.username
  }

  return (
    <div className="border-t border-border p-4">
      {/* Reply indicator */}
      {replyTo && (
        <div className="mb-3 p-3 bg-muted rounded-lg border-l-2 border-primary">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1">
                Replying to {getReplyDisplayName(replyTo.sender)}
              </div>
              <div className="text-sm truncate">{replyTo.content}</div>
            </div>
            {onCancelReply && (
              <Button size="icon" variant="ghost" className="h-6 w-6 ml-2" onClick={onCancelReply}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end space-x-2">
        {/* Attachment menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" disabled={disabled || isUploading}>
              <Paperclip className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
              <Image className="h-4 w-4 mr-2" />
              Photo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="h-4 w-4 mr-2" />
              Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Message input */}
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? 'Cannot send messages' : placeholder}
            disabled={disabled || isUploading}
            className="pr-12"
          />
          
          {/* Emoji button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            disabled={disabled}
            onClick={() => toast.info('Emoji picker coming soon!')}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        {/* Send button or voice record */}
        {message.trim() ? (
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={disabled || isUploading}
            className="h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            variant={isRecording ? "destructive" : "ghost"}
            onClick={handleVoiceRecord}
            disabled={disabled || isUploading}
            className="h-10 w-10"
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Upload status */}
      {isUploading && (
        <div className="mt-2 text-sm text-muted-foreground">
          Uploading file...
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}