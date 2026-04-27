import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'Inkwell — A Modern Blogging Platform',
  description: 'Write, share and discover thoughtful posts. AI-powered summaries.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
