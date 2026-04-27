# Inkwell — AI-Powered Blogging Platform

Production-ready blog with **Supabase Auth**, **role-based access** (viewer / author / admin), and **Google Gemini** AI summaries (~200 words) generated automatically on every post.

## Stack
- Next.js 14 (App Router)
- Supabase (Auth + Postgres + RLS)
- Google Gemini (`gemini-2.0-flash`)
- Tailwind CSS + shadcn/ui

## 1. Database setup (one-time)
Open Supabase → SQL editor → paste the contents of [`SUPABASE_SETUP.sql`](./SUPABASE_SETUP.sql) and **Run**. This creates `profiles`, `posts`, `comments`, the auto-profile trigger, and all RLS policies.

After signing up your first account, promote yourself to admin:
```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## 2. Environment variables (`.env`)
```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
GEMINI_API_KEY=<google ai studio key>
```

## 3. Run
```bash
yarn install
yarn dev
```

## Roles
- `viewer` (default) — read posts, post comments
- `author` — create & edit own posts
- `admin` — edit any post, delete comments, manage user roles

## Architecture
```
/app/                  Next.js routes (page.js, layout.js, login, signup, dashboard, create-post, post/[id], edit-post/[id])
/app/api/[[...path]]/  Backend route — /api/generate-summary (Gemini)
/components/           UI + AuthProvider + Navbar (client components)
/lib/                  supabaseClient.js, gemini.js
```

Client-side Supabase SDK enforces all auth/RLS. The only server-side endpoint is `/api/generate-summary` which keeps the Gemini key secret. Summaries are generated **once** at post creation; editing a post does **not** re-call Gemini.

## Deploy
- Push to GitHub → Import in Vercel → Add env vars → Done.
