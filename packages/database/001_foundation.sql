CREATE TABLE profiles (
 id uuid PRIMARY KEY, role text NOT NULL DEFAULT 'learner' CHECK(role IN ('learner','teacher','editor','admin'))
);
CREATE TABLE courses (
 id text PRIMARY KEY, title text NOT NULL, subject text NOT NULL
);
CREATE TABLE content_versions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), series uuid NOT NULL DEFAULT gen_random_uuid(), version integer NOT NULL DEFAULT 1 CHECK(version>0),
 course_id text NOT NULL REFERENCES courses, kind text NOT NULL CHECK(kind IN ('lesson','question')),
 title text NOT NULL, body jsonb NOT NULL, author uuid REFERENCES profiles,
 state text NOT NULL DEFAULT 'draft' CHECK(state IN ('draft','review','published')), UNIQUE(series,version)
);
CREATE TABLE exams (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), lesson_id uuid NOT NULL REFERENCES content_versions, title text NOT NULL,
 minutes integer NOT NULL CHECK(minutes BETWEEN 1 AND 180), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE exam_items (
 exam_id uuid NOT NULL REFERENCES exams, position integer NOT NULL, question_id uuid NOT NULL REFERENCES content_versions,
 PRIMARY KEY(exam_id,position), UNIQUE(exam_id,question_id)
);
CREATE TABLE attempts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner uuid NOT NULL REFERENCES profiles, exam_id uuid NOT NULL REFERENCES exams,
 started_at timestamptz NOT NULL DEFAULT clock_timestamp(), deadline timestamptz NOT NULL, submitted_at timestamptz,
 answers jsonb NOT NULL DEFAULT '{}', revision int NOT NULL DEFAULT 0, score int, total int,
 CHECK ((submitted_at IS NULL AND score IS NULL AND total IS NULL) OR (submitted_at IS NOT NULL AND score BETWEEN 0 AND total AND total>0))
);
CREATE UNIQUE INDEX open_attempt ON attempts(owner,exam_id) WHERE submitted_at IS NULL;
CREATE TABLE progress (owner uuid REFERENCES profiles, lesson_id uuid REFERENCES content_versions, completed_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(owner,lesson_id));
CREATE TABLE reports (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner uuid NOT NULL REFERENCES profiles, lesson_id uuid NOT NULL REFERENCES content_versions, message text NOT NULL, resolved boolean NOT NULL DEFAULT false);
CREATE TABLE audit (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor uuid NOT NULL REFERENCES profiles, action text NOT NULL, resource uuid NOT NULL, occurred_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE tutor_usage (owner uuid REFERENCES profiles, day date NOT NULL, requests int NOT NULL DEFAULT 0, PRIMARY KEY(owner,day));
CREATE FUNCTION freeze_published() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.state='published' THEN RAISE EXCEPTION 'Published versions are immutable'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER freeze_version BEFORE UPDATE OR DELETE ON content_versions FOR EACH ROW EXECUTE FUNCTION freeze_published();
