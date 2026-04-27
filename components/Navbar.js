'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PenSquare, LogOut, LayoutDashboard, BookOpen } from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut, loading } = useAuth()
  const router = useRouter()
  const canCreate = profile?.role === 'author' || profile?.role === 'admin'

  const handleLogout = async () => { await signOut(); router.push('/') }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>Inkwell</span>
        </Link>
        <nav className="flex items-center gap-2">
          {loading ? null : user ? (
            <>
              {profile?.role && (
                <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'} className="hidden sm:inline-flex capitalize">{profile.role}</Badge>
              )}
              {canCreate && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/create-post"><PenSquare className="h-4 w-4 mr-1" /> Write</Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard"><LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard</Link>
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link href="/login">Login</Link></Button>
              <Button asChild size="sm"><Link href="/signup">Get Started</Link></Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
