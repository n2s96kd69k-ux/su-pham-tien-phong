ALTER TABLE exams ADD COLUMN sealed boolean NOT NULL DEFAULT true;
ALTER TABLE exams ALTER COLUMN sealed SET DEFAULT false;
CREATE FUNCTION guard_exam() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.sealed THEN RAISE EXCEPTION 'Published exams are immutable'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 IF NEW.sealed AND NOT EXISTS(SELECT 1 FROM exam_items WHERE exam_id=NEW.id) THEN RAISE EXCEPTION 'An exam needs at least one question'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_exam BEFORE UPDATE OR DELETE ON exams FOR EACH ROW EXECUTE FUNCTION guard_exam();

CREATE FUNCTION guard_exam_item() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE locked boolean;
BEGIN
 IF TG_OP IN ('UPDATE','DELETE') THEN
   SELECT sealed INTO locked FROM exams WHERE id=OLD.exam_id FOR SHARE;
   IF locked THEN RAISE EXCEPTION 'Published exam items are immutable'; END IF;
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 SELECT sealed INTO locked FROM exams WHERE id=NEW.exam_id FOR SHARE;
 IF locked THEN RAISE EXCEPTION 'Published exam items are immutable'; END IF;
 IF NOT EXISTS (SELECT 1 FROM content_versions WHERE id=NEW.question_id AND state='published' AND kind='question') THEN RAISE EXCEPTION 'An exam item needs an approved question version'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_item BEFORE INSERT OR UPDATE OR DELETE ON exam_items FOR EACH ROW EXECUTE FUNCTION guard_exam_item();
