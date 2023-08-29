create table
  public.profile_climbs (
    id bigint generated by default as identity not null,
    profile_id uuid not null,
    created_at timestamp with time zone null default now(),
    climb_id bigint not null,
    constraint profile_climbs_pkey primary key (id),
    constraint profile_climbs_profile_id_fkey foreign key (profile_id) references profiles (id),
    constraint profile_climbs_climb_id_fkey foreign key (climb_id) references climbs (id)
  ) tablespace pg_default;
