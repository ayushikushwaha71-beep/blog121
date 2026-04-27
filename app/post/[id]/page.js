'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Sparkles, Edit, MessageSquare, Trash2, Clock, ArrowLeft } from 'lucide-react'
import PostActions from '@/components/PostActions'

export default function PostPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)

  const loadPost = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('posts').select('*, profiles!posts_author_id_fkey(email)').eq('id', id).maybeSingle()
    setPost(data)
    setLoading(false)
  }, [id])

  const loadComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles!comments_user_id_fkey(email)')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }, [id])

  useEffect(() => { loadPost(); loadComments() }, [loadPost, loadComments])

  const submitComment = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please sign in to comment'); router.push('/login'); return }
    if (!commentText.trim()) return
    setPosting(true)
    const { error } = await supabase.from('comments').insert({ post_id: id, user_id: user.id, comment_text: commentText.trim() })
    setPosting(false)
    if (error) { toast.error(error.message); return }
    setCommentText('')
    loadComments()
  }

  const deleteComment = async (cid) => {
    const { error } = await supabase.from('comments').delete().eq('id', cid)
    if (error) { toast.error(error.message); return }
    setComments((c) => c.filter((x) => x.id !== cid))
  }

  if (loading) return <div className="container py-16 text-center text-muted-foreground">Loading…</div>
  if (!post) return <div className="container py-16 text-center"><p className="text-muted-foreground">Post not found.</p><Button asChild className="mt-4"><Link href="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back home</Link></Button></div>

  const canEdit = user && (post.author_id === user.id || profile?.role === 'admin')

  return (
    <div className="container max-w-3xl py-10">
      <Button asChild variant="ghost" size="sm" className="mb-6"><Link href="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link></Button>

      <article>
        {post.image_url && (
          <div className="aspect-video overflow-hidden rounded-xl mb-6 bg-muted">
            <img src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{post.profiles?.email || 'Anonymous'}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <PostActions postId={post.id} />
            {canEdit && (
              <Button asChild variant="outline" size="sm"><Link href={`/edit-post/${post.id}`}><Edit className="h-3 w-3 mr-1" /> Edit</Link></Button>
            )}
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">{post.title}</h1>

        {post.summary && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <Badge className="w-fit"><Sparkles className="h-3 w-3 mr-1" /> AI Summary</Badge>
            </CardHeader>
            <CardContent><p className="text-sm leading-relaxed text-foreground/80">{post.summary}</p></CardContent>
          </Card>
        )}

        <div className="prose prose-neutral max-w-none whitespace-pre-wrap text-base leading-relaxed">{post.body}</div>
      </article>

      {/* Comments */}
      <section className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Comments ({comments.length})</h2>

        {user ? (
          <form onSubmit={submitComment} className="mb-8">
            <Textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Share your thoughts…" rows={3} className="mb-2" />
            <Button type="submit" disabled={posting || !commentText.trim()}>{posting ? 'Posting…' : 'Post comment'}</Button>
          </form>
        ) : (
          <Card className="mb-8">
            <CardContent className="py-6 text-center text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">Sign in</Link> to leave a comment.
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No comments yet — be the first!</p>
          ) : comments.map((c) => {
            const canDelete = user && (c.user_id === user.id || profile?.role === 'admin')
            return (
              <Card key={c.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{c.profiles?.email || 'User'}</p>
                      <p className="text-xs text-muted-foreground mb-2">{new Date(c.created_at).toLocaleString()}</p>
                      <p className="text-sm whitespace-pre-wrap">{c.comment_text}</p>
                    </div>
                    {canDelete && (
                      <Button onClick={() => deleteComment(c.id)} variant="ghost" size="sm"><Trash2 className="h-3 w-3" /></Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
