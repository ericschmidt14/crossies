create table words (
  id uuid default gen_random_uuid() primary key,
  word text not null,
  description text not null,
  crossword_index integer,
  created_at timestamp with time zone default now()
);

alter table words enable row level security;

-- Allow full access (personal tool, no auth needed)
create policy "Allow all" on words for all using (true) with check (true);
