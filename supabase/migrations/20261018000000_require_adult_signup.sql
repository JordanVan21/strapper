-- Reject missing, invalid, future, or under-18 birth dates even for direct
-- calls to Supabase Auth. This is an age declaration, not identity verification.
create or replace function public.require_adult_signup()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  supplied text;
  birthday date;
begin
  supplied := new.raw_user_meta_data ->> 'birthdate';
  if supplied is null or supplied !~ '^\d{4}-\d{2}-\d{2}$' then
    raise exception 'A valid birth date is required. You must be 18 or older.';
  end if;
  begin
    birthday := supplied::date;
  exception when others then
    raise exception 'A valid birth date is required. You must be 18 or older.';
  end;
  if birthday < date '1900-01-01'
     or birthday > current_date
     or extract(year from age(current_date, birthday)) < 18 then
    raise exception 'You must be 18 or older to create an account.';
  end if;
  return new;
end;
$$;

revoke all on function public.require_adult_signup() from public, anon, authenticated;
drop trigger if exists require_adult_signup on auth.users;
create trigger require_adult_signup
before insert on auth.users
for each row execute function public.require_adult_signup();
