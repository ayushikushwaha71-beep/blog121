'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Sparkles, Loader2 } from 'lucide-react'
import ImageUploader from '@/components/ImageUploader'

export default function CreatePostPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [stage, setStage] = useState('')

  useEffect(() => {
    if (!authLoading) {
      if (!user) { router.push('/login'); return }
      if (profile && profile.role !== 'author' && profile.role !== 'admin') {
        toast.error('Only authors and admins can create posts.')
        router.push('/dashboard')
      }
    }
  }, [authLoading, user, profile, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (body.trim().length < 30) { toast.error('Body must be at least 30 characters.'); return }
    setSubmitting(true)
    try {
      setStage('Generating AI summary…')
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to generate summary')

      setStage('Publishing…')
      const { data, error } = await supabase.from('posts').insert({
        title: title.trim(),
        body: body.trim(),
        image_url: imageUrl.trim() || null,
        author_id: user.id,
        summary: json.summary,
      }).select().single()
      if (error) throw new Error(error.message)

      toast.success('Post published with AI summary!')
      router.push(`/post/${data.id}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
      setStage('')
    }
  }

  if (authLoading || !profile) return <div className="container py-16 text-center text-muted-foreground">Loading…</div>

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Write a new post</CardTitle>
          <CardDescription className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> A 200-word AI summary will be generated automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A captivating title…" maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label>Cover image (optional)</Label>
              <ImageUploader value={imageUrl} onChange={setImageUrl} userId={user?.id} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea id="body" required value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your story here. Markdown is fine — render it later if you want." rows={16} />
              <p className="text-xs text-muted-foreground">{body.length} characters</p>
            </div>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {stage}</>) : (<><Sparkles className="h-4 w-4 mr-2" /> Publish with AI summary</>)}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
