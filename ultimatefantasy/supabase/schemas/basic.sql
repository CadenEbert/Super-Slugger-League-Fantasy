create table leagues (
  id uuid primary key default uuid_generate_v4(),
  name text,
  owner_id uuid references auth.users(id),
  created_at timestamp default now()
);

create table teams (
  id uuid primary key default uuid_generate_v4(),
  league_id uuid references leagues(id),
  user_id uuid references auth.users(id),
  name text
);

create table players (
  id uuid primary key default uuid_generate_v4(),
  name text,
  position text
);

create table rosters (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams(id),
  player_id uuid references players(id)
);