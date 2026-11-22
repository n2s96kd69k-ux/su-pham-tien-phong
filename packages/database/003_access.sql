-- Managed Supabase projects can grant public-schema tables to Data API roles.
DO $$
DECLARE r text;
BEGIN
 FOREACH r IN ARRAY ARRAY['anon','authenticated','service_role','PUBLIC'] LOOP
 IF r='PUBLIC' OR EXISTS(SELECT 1 FROM pg_roles WHERE rolname=r) THEN
 EXECUTE format('REVOKE ALL ON TABLE profiles,courses,content_versions,exams,exam_items,attempts,progress,reports,audit,tutor_usage,migrations FROM %s', CASE WHEN r='PUBLIC' THEN 'PUBLIC' ELSE quote_ident(r) END);
 END IF;
 END LOOP;
END $$;
