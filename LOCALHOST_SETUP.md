# Inkwell — Local Setup Guide (Hindi/English)

## Prerequisites
- **Node.js 18+** ([download](https://nodejs.org))
- **Yarn** (`npm install -g yarn`)
- **Supabase account** (free) — https://supabase.com
- **Google Gemini API key** (already provided)

---

## Step 1 — Extract zip
```bash
unzip inkwell-blog.zip
cd inkwell-blog
```

## Step 2 — Install dependencies
```bash
yarn install
```

## Step 3 — Set environment variables
Project ke root me ek file banao `.env.local` (ya already maujood `.env` use karo):

```env
NEXT_PUBLIC_SUPABASE_URL=https://hmcqdutslnhfloagqult.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtY3FkdXRzbG5oZmxvYWdxdWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNTMwODMsImV4cCI6MjA5MjcyOTA4M30.m9WucjykWyeoHciosptavDv2x_pH2UQhPmJah7XOL6g
```

> **Note**: `.env` file pre-included hai zip me — bas check karlo values theek hain.

## Step 4 — Supabase database setup (one-time)

Supabase Dashboard → **SQL Editor** → New Query → paste & run:

1. Pehle `SUPABASE_SETUP.sql` ka pura content paste karke **Run** karo
2. Phir `SUPABASE_ENHANCEMENTS.sql` ka content paste karke **Run** karo

Yeh banayega: `profiles`, `posts`, `comments`, `likes`, `bookmarks` tables, auto-profile trigger, RLS policies, aur `post-images` storage bucket.

## Step 5 — Start the app
```bash
yarn dev
```

Open: **http://localhost:3000** 🎉

---

## First-time usage

1. **Sign up** — `/signup` se naya account banao (default role = `viewer`)
2. **Khud ko admin banao** — Supabase SQL editor me run karo:
   ```sql
   update public.profiles set role = 'admin' where email = 'YOUR_EMAIL@example.com';
   ```
3. App refresh karo → Navbar me **Write** button dikhega
4. **Write** → title + cover image upload + body → **Publish with AI summary** ✨
5. Posts pe ❤️ Like aur 🔖 Bookmark icons milenge

---

## Folder structure
```
inkwell-blog/
├── app/
│   ├── api/[[...path]]/route.js   # /api/generate-summary (Gemini)
│   ├── page.js                    # Home (post list, search, pagination)
│   ├── login/page.js
│   ├── signup/page.js
│   ├── dashboard/page.js          # Tabs: Posts | Bookmarks | Users
│   ├── create-post/page.js
│   ├── edit-post/[id]/page.js
│   ├── post/[id]/page.js          # Post + comments + like/bookmark
│   └── layout.js
├── components/
│   ├── AuthProvider.js
│   ├── Navbar.js
│   ├── ImageUploader.js           # Supabase Storage uploader
│   ├── PostActions.js             # Like/Bookmark buttons
│   └── ui/                        # shadcn components
├── lib/
│   ├── supabaseClient.js
│   └── gemini.js                  # gemini-2.5-flash
├── SUPABASE_SETUP.sql             # Run first
├── SUPABASE_ENHANCEMENTS.sql      # Run second
├── package.json
└── .env
```

---

## Troubleshooting

**Port 3000 already in use:**
```bash
PORT=3001 yarn dev
```

**Supabase errors (RLS):** Make sure dono SQL files chal chuki hain.

**Gemini 429 error:** Naya key le lo from https://aistudio.google.com/apikey aur `.env` me update karo.

**Image upload fails:** `SUPABASE_ENHANCEMENTS.sql` chala dia? `post-images` bucket banna chahiye.

---

## Production deploy (Vercel)
1. Code GitHub pe push karo
2. Vercel pe import karo
3. Same 3 env vars add karo
4. Deploy → live!
