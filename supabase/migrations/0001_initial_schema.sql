create extension if not exists "pgcrypto";

create type project_status as enum ('active', 'archived');
create type album_version_status as enum ('draft', 'shared', 'changes_requested', 'approved');
create type approval_decision as enum ('approved', 'changes_requested');
create type subscription_plan as enum ('free', 'starter', 'pro', 'studio');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');

create table studios (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  name text not null,
  slug text not null unique,
  logo_url text,
  brand_color text,
  created_at timestamptz not null default now()
);

create table studio_members (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (studio_id, user_id)
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios(id) on delete cascade,
  client_id uuid not null references clients(id) on delete restrict,
  title text not null,
  status project_status not null default 'active',
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table album_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  version_number integer not null,
  status album_version_status not null default 'draft',
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  unique (project_id, version_number)
);

create table spreads (
  id uuid primary key default gen_random_uuid(),
  album_version_id uuid not null references album_versions(id) on delete cascade,
  storage_key text not null,
  thumbnail_key text,
  source_key text,
  source_page integer,
  filename text not null,
  mime_type text,
  size_bytes bigint default 0,
  width integer,
  height integer,
  sort_order integer not null,
  created_at timestamptz not null default now()
);

create table share_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  album_version_id uuid not null references album_versions(id) on delete cascade,
  token_hash text not null unique,
  password_hash text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  last_viewed_at timestamptz
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  spread_id uuid not null references spreads(id) on delete cascade,
  album_version_id uuid not null references album_versions(id) on delete cascade,
  author_name text not null,
  author_email text not null,
  body text not null,
  x numeric,
  y numeric,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table approvals (
  id uuid primary key default gen_random_uuid(),
  album_version_id uuid not null references album_versions(id) on delete cascade,
  client_name text not null,
  client_email text not null,
  decision approval_decision not null,
  message text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan subscription_plan not null default 'free',
  status subscription_status not null default 'trialing',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index projects_studio_id_idx on projects(studio_id);
create index album_versions_project_id_idx on album_versions(project_id);
create index spreads_album_version_id_idx on spreads(album_version_id);
create index comments_album_version_id_idx on comments(album_version_id);
create index share_links_token_hash_idx on share_links(token_hash);

alter table studios enable row level security;
alter table studio_members enable row level security;
alter table clients enable row level security;
alter table projects enable row level security;
alter table album_versions enable row level security;
alter table spreads enable row level security;
alter table share_links enable row level security;
alter table comments enable row level security;
alter table approvals enable row level security;
alter table subscriptions enable row level security;

create policy "studio members can read studios"
  on studios for select using (
    exists (
      select 1 from studio_members
      where studio_members.studio_id = studios.id
      and studio_members.user_id = auth.uid()
    )
  );

create policy "studio members can manage clients"
  on clients for all using (
    exists (
      select 1 from studio_members
      where studio_members.studio_id = clients.studio_id
      and studio_members.user_id = auth.uid()
    )
  );

create policy "studio members can manage projects"
  on projects for all using (
    exists (
      select 1 from studio_members
      where studio_members.studio_id = projects.studio_id
      and studio_members.user_id = auth.uid()
    )
  );

create policy "studio members can manage versions"
  on album_versions for all using (
    exists (
      select 1
      from projects
      join studio_members on studio_members.studio_id = projects.studio_id
      where projects.id = album_versions.project_id
      and studio_members.user_id = auth.uid()
    )
  );

create policy "studio members can manage spreads"
  on spreads for all using (
    exists (
      select 1
      from album_versions
      join projects on projects.id = album_versions.project_id
      join studio_members on studio_members.studio_id = projects.studio_id
      where album_versions.id = spreads.album_version_id
      and studio_members.user_id = auth.uid()
    )
  );

create policy "studio members can manage share links"
  on share_links for all using (
    exists (
      select 1
      from projects
      join studio_members on studio_members.studio_id = projects.studio_id
      where projects.id = share_links.project_id
      and studio_members.user_id = auth.uid()
    )
  );

create policy "studio members can manage comments"
  on comments for all using (
    exists (
      select 1
      from album_versions
      join projects on projects.id = album_versions.project_id
      join studio_members on studio_members.studio_id = projects.studio_id
      where album_versions.id = comments.album_version_id
      and studio_members.user_id = auth.uid()
    )
  );

create policy "studio members can manage approvals"
  on approvals for all using (
    exists (
      select 1
      from album_versions
      join projects on projects.id = album_versions.project_id
      join studio_members on studio_members.studio_id = projects.studio_id
      where album_versions.id = approvals.album_version_id
      and studio_members.user_id = auth.uid()
    )
  );

create policy "studio members can read subscriptions"
  on subscriptions for select using (
    exists (
      select 1 from studio_members
      where studio_members.studio_id = subscriptions.studio_id
      and studio_members.user_id = auth.uid()
    )
  );
