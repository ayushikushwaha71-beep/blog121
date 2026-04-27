-- ============================================================
-- INKWELL ENHANCEMENTS — Image uploads + Likes + Bookmarks
-- Run this in Supabase SQL editor AFTER SUPABASE_SETUP.sql
-- ============================================================

-- 1) Storage bucket for post images --------------------------
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Storage policies (public read, auth users upload to own folder)
drop policy if exists "post_images_public_read" on storage.objects;
create policy "post_images_public_read" on storage.objects
  for select using (bucket_id = 'post-images');

drop policy if exists "post_images_auth_insert" on storage.objects;
create policy "post_images_auth_insert" on storage.objects
  for insert with check (
    bucket_id = 'post-images'
    and auth.role() = 'authenticated'
  );

drop policy if exists "post_images_owner_update" on storage.objects;
create policy "post_images_owner_update" on storage.objects
  for update using (bucket_id = 'post-images' and auth.uid() = owner);

drop policy if exists "post_images_owner_delete" on storage.objects;
create policy "post_images_owner_delete" on storage.objects
  for delete using (bucket_id = 'post-images' and auth.uid() = owner);

-- 2) Likes table ---------------------------------------------
create table if not exists public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.likes enable row level security;

drop policy if exists "likes_read" on public.likes;
create policy "likes_read" on public.likes for select using (true);

drop policy if exists "likes_insert_own" on public.likes;
create policy "likes_insert_own" on public.likes
  for insert with check (auth.uid() = user_id);

drop policy if exists "likes_delete_own" on public.likes;
create policy "likes_delete_own" on public.likes
  for delete using (auth.uid() = user_id);

create index if not exists idx_likes_post on public.likes (post_id);
create index if not exists idx_likes_user on public.likes (user_id);

-- 3) Bookmarks table -----------------------------------------
create table if not exists public.bookmarks (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.bookmarks enable row level security;

-- Bookmarks are private to the user
drop policy if exists "bookmarks_read_own" on public.bookmarks;
create policy "bookmarks_read_own" on public.bookmarks
  for select using (auth.uid() = user_id);

drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own" on public.bookmarks
  for insert with check (auth.uid() = user_id);

drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_delete_own" on public.bookmarks
  for delete using (auth.uid() = user_id);

create index if not exists idx_bookmarks_user on public.bookmarks (user_id);
