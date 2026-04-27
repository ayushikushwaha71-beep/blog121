-- ============================================================
-- INKWELL BLOG — Supabase schema, trigger and RLS policies
-- Run this entire script in the Supabase SQL editor (one shot)
-- ============================================================

-- 1) Tables --------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'viewer' check (role in ('viewer', 'author', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text,
  author_id uuid references public.profiles(id) on delete cascade,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  comment_text text not null,
  created_at timestamptz not null default now()
);

-- 2) Auto-create profile on signup ---------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3) Row Level Security --------------------------------------
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- profiles: anyone can read; user can update own; admin can update any
drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (
    auth.uid() = id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- posts: anyone reads; author/admin insert; author or admin update; admin delete
drop policy if exists "posts_read" on public.posts;
create policy "posts_read" on public.posts for select using (true);

drop policy if exists "posts_insert" on public.posts;
create policy "posts_insert" on public.posts
  for insert with check (
    author_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('author','admin'))
  );

drop policy if exists "posts_update" on public.posts;
create policy "posts_update" on public.posts
  for update using (
    author_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "posts_delete" on public.posts;
create policy "posts_delete" on public.posts
  for delete using (
    author_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- comments: anyone reads; signed-in users insert their own; own/admin delete
drop policy if exists "comments_read" on public.comments;
create policy "comments_read" on public.comments for select using (true);

drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert" on public.comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "comments_delete" on public.comments;
create policy "comments_delete" on public.comments
  for delete using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 4) Helpful indexes -----------------------------------------
create index if not exists idx_posts_created_at on public.posts (created_at desc);
create index if not exists idx_posts_author on public.posts (author_id);
create index if not exists idx_comments_post on public.comments (post_id);

-- 5) Promote yourself to admin (run after creating an account)
-- update public.profiles set role = 'admin' where email = 'YOUR_EMAIL_HERE';
