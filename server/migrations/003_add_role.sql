-- 003_add_role.sql — sino ang admin.
-- Lahat ng bagong user ay 'user'. Isa o dalawa lang dapat ang 'admin'.
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
