import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Heart } from 'lucide-react'
import React, { useEffect, useState } from 'react'


export interface LikeButtonProps {
    likes: number;
    doubleTapped: boolean;
}

export function LikeButton({ likes, doubleTapped }: LikeButtonProps) {


    const [liked, setLiked] = useState(false)
    const [likesCount, setLikesCount] = useState<number>(likes!)

    console.log(doubleTapped)
    function toggleLike() {
        setLiked(!liked);
        setLikesCount((c) => liked ? c - 1 : c + 1);
    }

    return (
        <>
            <Button variant="ghost" size="sm" className="gap-2" aria-pressed={liked} onClick={toggleLike}>
                <Heart className={cn("h-5 w-5 transition-colors", liked ? "fill-primary text-primary" : "")} />
                <span className="text-sm">{likesCount}</span>
            </Button>
        </>
    )
}


