-- Optional local-only sample data. Never use real personal data in this file.

insert into public.rooms (room_id, room_number, room_name, invited_emails)
values ('DEMO01', 'DEMO01', 'Demo Room', array['mayor@example.com', 'citizen@example.com'])
on conflict (room_id) do nothing;

insert into public.users (email, name, username, role, room_id, points)
values
  ('mayor@example.com', 'Demo Mayor', 'Demo Mayor', 'Mayor', 'DEMO01', 200),
  ('citizen@example.com', 'Demo Citizen', 'Demo Citizen', 'Citizen', 'DEMO01', 100)
on conflict (email) do nothing;

update public.rooms
set current_turn_email = 'citizen@example.com'
where room_id = 'DEMO01';
