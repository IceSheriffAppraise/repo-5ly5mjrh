-- Storage bucket for dish images: public read, server-side (service role) writes.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dish-images',
  'dish-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg','image/jpg','image/png','image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read access to objects in the dish-images bucket.
drop policy if exists "dish_images_public_read" on storage.objects;
create policy "dish_images_public_read" on storage.objects
  for select using (bucket_id = 'dish-images');
