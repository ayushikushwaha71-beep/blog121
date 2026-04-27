'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'

export default function ImageUploader({ value, onChange, userId }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please pick an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max image size is 5MB'); return }
    setUploading(true)
    try {
      const ext = file.name.split('.').pop().toLowerCase()
      const path = `${userId}/${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from('post-images').upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path)
      onChange(publicUrl)
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group rounded-lg overflow-hidden border">
          <img src={value} alt="cover" className="w-full aspect-video object-cover" />
          <button type="button" onClick={() => onChange('')} className="absolute top-2 right-2 rounded-full bg-background/90 hover:bg-background border p-1.5 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 hover:bg-muted/40 cursor-pointer aspect-video transition-colors">
          {uploading ? (
            <><Loader2 className="h-8 w-8 text-muted-foreground animate-spin" /><p className="text-sm text-muted-foreground">Uploading…</p></>
          ) : (
            <><ImageIcon className="h-8 w-8 text-muted-foreground" /><p className="text-sm font-medium">Click to upload cover image</p><p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 5MB</p></>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="hidden" />
        </label>
      )}
      {value && (
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="h-3 w-3 mr-1" /> Replace
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="hidden" />
        </Button>
      )}
    </div>
  )
}
