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
  doubleTapped: boolean,
  isLiked?: boolean,
}

export function LikeButton({ likes, doubleTapped, postId, isLiked = false }: LikeButtonProps) {
  const [liked, setLiked] = useState<boolean>(isLiked)
  const [likesCount, setLikesCount] = useState<number>(likes)
  const { data: userData, status } = useSession();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);



  const debouncedApiCall = useDebounceCallback(async (isLiked: boolean) => {
    if (status !== 'authenticated') return
    setIsProcessing(true);
    try {
      await apiClient.likePost({ 
        postId: postId, 
        userId: userData.user.id 
      })
    } catch (error) {
      console.error('Failed to update like:', error)
    }finally{
      setLiked(isLiked);
      setIsProcessing(false);
      isLiked ? setLikesCount(e => e+1): setLikesCount(e => e - 1);
    }
  }, 1000);

  const handleClick = () => {
    if(isProcessing) return;
    debouncedApiCall(!isLiked);
  }

  useEffect(() => {
    if(doubleTapped){
      handleClick();
    }
  },[doubleTapped]);

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
        liked ? "fill-red-600 text-red-600" : "",
        status !== 'authenticated' ? "opacity-50" : ""
      )} />
      <span className="text-sm">{likesCount}</span>
    </Button>
  )
}