'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import ImageUploader from '@/components/ImageUploader'

export default function EditPostPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [post, setPost] = useState(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    const load = async () => {
      const { data, error } = await supabase.from('posts').select('*').eq('id', id).maybeSingle()
      if (error || !data) { toast.error('Post not found'); router.push('/'); return }
      const allowed = data.author_id === user.id || profile?.role === 'admin'
      if (!allowed) { toast.error('You cannot edit this post'); router.push(`/post/${id}`); return }
      setPost(data)
      setTitle(data.title)
      setBody(data.body)
      setImageUrl(data.image_url || '')
    }
    load()
  }, [authLoading, user, profile, id, router])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    // summary intentionally NOT regenerated to avoid duplicate AI calls.
    const { error } = await supabase.from('posts').update({
      title: title.trim(),
      body: body.trim(),
      image_url: imageUrl.trim() || null,
    }).eq('id', id)
    setSubmitting(false)
    if (error) { toast.error(error.message); return }
    toast.success('Post updated!')
    router.push(`/post/${id}`)
  }

  if (!post) return <div className="container py-16 text-center text-muted-foreground">Loading…</div>

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit post</CardTitle>
          <CardDescription>Updating won&apos;t regenerate the AI summary (cost optimization).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-2"><Label>Title</Label><Input required value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="space-y-2"><Label>Cover image</Label><ImageUploader value={imageUrl} onChange={setImageUrl} userId={user?.id} /></div>
            <div className="space-y-2"><Label>Body</Label><Textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={16} /></div>
            <Button type="submit" disabled={submitting}>{submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>) : 'Save changes'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
