


create table players (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  team        text,
  position    text,
  created_at  timestamptz default now()
);


create table fantasy_teams (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users,
  name        text not null,
  created_at  timestamptz default now()
);


create table rosters (
  id               uuid primary key default gen_random_uuid(),
  fantasy_team_id  uuid references fantasy_teams(id) on delete cascade,
  player_id        uuid references players(id) on delete cascade,
  is_active        boolean default true
);


create table games (
  id          uuid primary key default gen_random_uuid(),
  played_at   timestamptz,
  home_team   text,
  away_team   text
);

