-- Ejecutar en Supabase SQL Editor después del schema.sql

CREATE OR REPLACE FUNCTION increment_audits_used(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET audits_used_this_month = audits_used_this_month + 1,
      audits_remaining = GREATEST(audits_remaining - 1, 0)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
