-- ==============================================================================
-- dev-kit.tech: Supabase Database Schema (Profiles, Auth Triggers, Stripe & RLS)
-- Run this in your Supabase Project's SQL Editor (for Dev or Prod)
-- ==============================================================================

-- 1. Create Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  free_credits_remaining integer default 5 not null,
  purchased_credits integer default 0 not null,
  is_pro boolean default false not null,
  last_daily_reset_date text default to_char(current_date, 'YYYY-MM-DD') not null,
  user_custom_api_key text,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'none',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Profiles Security Policies
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 4. Automatic User Creation Trigger on Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    free_credits_remaining,
    purchased_credits,
    is_pro,
    last_daily_reset_date
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    5,
    0,
    false,
    to_char(current_date, 'YYYY-MM-DD')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
