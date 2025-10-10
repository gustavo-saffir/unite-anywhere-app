-- Create table to track user devotional progress
create table public.user_devotionals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  devotional_id uuid references public.devotionals(id) on delete cascade not null,
  reflection text,
  application text,
  completed_at timestamp with time zone not null default now(),
  unique (user_id, devotional_id)
);

-- Enable RLS
alter table public.user_devotionals enable row level security;

-- RLS Policies
create policy "Users can view their own progress"
  on public.user_devotionals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.user_devotionals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.user_devotionals for update
  using (auth.uid() = user_id);