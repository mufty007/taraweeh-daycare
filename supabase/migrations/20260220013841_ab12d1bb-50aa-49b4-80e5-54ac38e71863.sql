
-- Add unique constraint on external_id for upsert support
ALTER TABLE public.children ADD CONSTRAINT children_external_id_unique UNIQUE (external_id);
