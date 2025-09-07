"use client"

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Heart } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useDebounceCallback } from 'usehooks-ts'
import { apiClient } from '../../../lib/app-client'
import { useSession } from 'next-auth/react'

export interface LikeButtonProps {
  postId: string
  likes: number
  doubleTapped: boolean
}

export function LikeButton({ likes, doubleTapped, postId }: LikeButtonProps) {
  const [liked, setLiked] = useState(doubleTapped)
  const [likesCount, setLikesCount] = useState<number>(likes)
  const { data: userData, status } = useSession()

  // Store the original values to revert if the API call fails
  const [originalLiked, setOriginalLiked] = useState(doubleTapped)
  const [originalLikesCount, setOriginalLikesCount] = useState<number>(likes)

  // Update state when doubleTapped prop changes (from parent double-click)
  useEffect(() => {
    if (doubleTapped !== liked && status === 'authenticated') {
      handleLikeUpdate(!liked)
    }
  }, [doubleTapped])

  const debouncedApiCall = useDebounceCallback(async (isLiked: boolean) => {
    if (status !== 'authenticated') return
    
    try {
      await apiClient.likePost({ 
        postId: postId, 
        userId: userData.user.id 
      })
      // Update our original values on success
      setOriginalLiked(isLiked)
      setOriginalLikesCount(isLiked ? originalLikesCount + 1 : originalLikesCount - 1)
    } catch (error) {
      console.error('Failed to update like:', error)
      // Revert to original values on error
      setLiked(originalLiked)
      setLikesCount(originalLikesCount)
    }
  }, 1000)

  function handleLikeUpdate(shouldLike: boolean) {
    if (status !== 'authenticated') {
      console.log('User must be logged in to like posts')
      return
    }

    // Store current state before making changes
    const currentLiked = liked
    const currentLikesCount = likesCount

    // Immediately update UI for responsive experience
    setLiked(shouldLike)
    setLikesCount(shouldLike ? currentLikesCount + 1 : currentLikesCount - 1)

    // Debounce the API call to reduce server load
    debouncedApiCall(shouldLike)
  }

  function handleClick() {
    handleLikeUpdate(!liked)
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="gap-2" 
      aria-pressed={liked} 
      onClick={handleClick}
      disabled={status !== 'authenticated'}
    >
      <Heart className={cn(
        "h-5 w-5 transition-colors", 
        liked ? "fill-primary text-primary" : "",
        status !== 'authenticated' ? "opacity-50" : ""
      )} />
      <span className="text-sm">{likesCount}</span>
    </Button>
  )
}