'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Heart, Bookmark, Loader2 } from 'lucide-react'

export default function PostActions({ postId }) {
  const router = useRouter()
  const { user } = useAuth()
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busyLike, setBusyLike] = useState(false)
  const [busyBookmark, setBusyBookmark] = useState(false)

  useEffect(() => {
    const load = async () => {
      // Total like count (RLS allows public read)
      const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', postId)
      setLikeCount(count || 0)

      if (user) {
        const [l, b] = await Promise.all([
          supabase.from('likes').select('post_id').eq('post_id', postId).eq('user_id', user.id).maybeSingle(),
          supabase.from('bookmarks').select('post_id').eq('post_id', postId).eq('user_id', user.id).maybeSingle(),
        ])
        setLiked(!!l.data)
        setBookmarked(!!b.data)
      }
      setLoading(false)
    }
    load()
  }, [postId, user])

  const toggleLike = async () => {
    if (!user) { router.push('/login'); return }
    setBusyLike(true)
    if (liked) {
      const { error } = await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id)
      if (!error) { setLiked(false); setLikeCount((c) => Math.max(0, c - 1)) } else toast.error(error.message)
    } else {
      const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
      if (!error) { setLiked(true); setLikeCount((c) => c + 1) } else toast.error(error.message)
    }
    setBusyLike(false)
  }

  const toggleBookmark = async () => {
    if (!user) { router.push('/login'); return }
    setBusyBookmark(true)
    if (bookmarked) {
      const { error } = await supabase.from('bookmarks').delete().eq('post_id', postId).eq('user_id', user.id)
      if (!error) { setBookmarked(false); toast.success('Removed from bookmarks') } else toast.error(error.message)
    } else {
      const { error } = await supabase.from('bookmarks').insert({ post_id: postId, user_id: user.id })
      if (!error) { setBookmarked(true); toast.success('Bookmarked') } else toast.error(error.message)
    }
    setBusyBookmark(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={toggleLike} disabled={busyLike || loading} variant={liked ? 'default' : 'outline'} size="sm" className="gap-1.5">
        {busyLike ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />}
        <span>{likeCount}</span>
      </Button>
      <Button onClick={toggleBookmark} disabled={busyBookmark || loading} variant={bookmarked ? 'default' : 'outline'} size="sm">
        {busyBookmark ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />}
      </Button>
    </div>
  )
}
