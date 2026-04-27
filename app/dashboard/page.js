'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { PenSquare, Edit, Users, Bookmark } from 'lucide-react'

export default function DashboardPage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()
  const [myPosts, setMyPosts] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [bookmarks, setBookmarks] = useState([])

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  useEffect(() => {
    if (!user || !profile) return
    const load = async () => {
      // Load posts
      if (profile.role === 'admin') {
        const { data } = await supabase.from('posts').select('id,title,created_at,author_id').order('created_at', { ascending: false })
        setMyPosts(data || [])
      } else if (profile.role === 'author') {
        const { data } = await supabase.from('posts').select('id,title,created_at').eq('author_id', user.id).order('created_at', { ascending: false })
        setMyPosts(data || [])
      }
      // Admin: load all users
      if (profile.role === 'admin') {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
        setAllUsers(data || [])
      }
      // Bookmarks for everyone
      const { data: bmData } = await supabase
        .from('bookmarks')
        .select('created_at, posts:post_id(id,title,summary,image_url,created_at)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setBookmarks((bmData || []).filter((b) => b.posts))
    }
    load()
  }, [user, profile])

  const updateRole = async (userId, role) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
    if (error) { toast.error(error.message); return }
    toast.success('Role updated')
    setAllUsers((u) => u.map((x) => (x.id === userId ? { ...x, role } : x)))
    if (userId === user.id) refreshProfile()
  }

  if (loading || !profile) return <div className="container py-16 text-center text-muted-foreground">Loading…</div>

  const tabs = []
  if (profile.role === 'author' || profile.role === 'admin') tabs.push('posts')
  tabs.push('bookmarks')
  if (profile.role === 'admin') tabs.push('users')

  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome, {profile.email} <Badge variant="secondary" className="ml-2 capitalize">{profile.role}</Badge></p>
      </div>

      <Tabs defaultValue={tabs[0]} className="w-full">
        <TabsList>
          {tabs.includes('posts') && <TabsTrigger value="posts">Posts</TabsTrigger>}
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          {tabs.includes('users') && <TabsTrigger value="users">Users</TabsTrigger>}
        </TabsList>

        {/* Posts tab */}
        {tabs.includes('posts') && (
          <TabsContent value="posts" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{profile.role === 'admin' ? 'All Posts' : 'Your Posts'}</CardTitle>
                  <CardDescription>{profile.role === 'admin' ? 'Manage every post on the platform' : 'Manage your published articles'}</CardDescription>
                </div>
                <Button asChild><Link href="/create-post"><PenSquare className="h-4 w-4 mr-2" /> New post</Link></Button>
              </CardHeader>
              <CardContent>
                {myPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No posts yet. Create your first one!</p>
                ) : (
                  <div className="divide-y">
                    {myPosts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-3">
                        <div>
                          <Link href={`/post/${p.id}`} className="font-medium hover:text-primary">{p.title}</Link>
                          <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                        </div>
                        <Button asChild variant="outline" size="sm"><Link href={`/edit-post/${p.id}`}><Edit className="h-3 w-3 mr-1" /> Edit</Link></Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Bookmarks tab */}
        <TabsContent value="bookmarks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bookmark className="h-5 w-5" /> Your bookmarks</CardTitle>
              <CardDescription>Posts you saved to read later</CardDescription>
            </CardHeader>
            <CardContent>
              {bookmarks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookmarks yet. Tap the bookmark icon on any post.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bookmarks.map((b) => (
                    <Link key={b.posts.id} href={`/post/${b.posts.id}`} className="group">
                      <Card className="h-full hover:shadow-md transition">
                        {b.posts.image_url && (
                          <div className="aspect-video overflow-hidden bg-muted rounded-t-lg">
                            <img src={b.posts.image_url} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary">{b.posts.title}</CardTitle>
                          <CardDescription className="text-xs">Saved {new Date(b.created_at).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        {b.posts.summary && (
                          <CardContent><p className="text-sm text-muted-foreground line-clamp-3">{b.posts.summary}</p></CardContent>
                        )}
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users tab (admin) */}
        {tabs.includes('users') && (
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> User Management</CardTitle>
                <CardDescription>Promote viewers to authors, or appoint new admins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {allUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-3 gap-4">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{u.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">Current: {u.role}</p>
                      </div>
                      <Select value={u.role} onValueChange={(v) => updateRole(u.id, v)}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="author">Author</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
