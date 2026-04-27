'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, ChevronLeft, ChevronRight, Sparkles, Clock } from 'lucide-react'

const PAGE_SIZE = 6

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(0)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select('id,title,summary,image_url,created_at,author_id,profiles!posts_author_id_fkey(email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`)
    }
    const { data, error, count: total } = await query
    if (error) console.error(error)
    setPosts(data || [])
    setCount(total || 0)
    setLoading(false)
  }, [page, search])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  const onSearch = (e) => { e.preventDefault(); setPage(0); setSearch(searchInput) }

  return (
    <div className="container py-10">
      {/* Hero */}
      <section className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground mb-4">
          <Sparkles className="h-3 w-3 text-primary" /> AI-powered summaries on every post
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Stories worth your time.</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">A modern blogging platform where every article comes with a smart 200-word summary, so you can decide what to read in seconds.</p>
      </section>

      {/* Search */}
      <form onSubmit={onSearch} className="max-w-xl mx-auto mb-10 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search posts by title or content..." className="pl-9 h-11" />
        </div>
        <Button type="submit" className="h-11">Search</Button>
      </form>

      {/* Posts */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 rounded-lg border bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No posts yet. {search ? 'Try a different search.' : 'Be the first to publish!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <Link key={p.id} href={`/post/${p.id}`} className="group">
              <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                {p.image_url ? (
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img src={p.image_url} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{p.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <Clock className="h-3 w-3" />
                    {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-4">{p.summary || 'Summary generating…'}</p>
                </CardContent>
                <CardFooter>
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" /> AI Summary
                  </Badge>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && posts.length > 0 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
