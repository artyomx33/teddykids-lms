-- Remove invalid foreign key reference to the staff view from review_schedules
-- and offer guidance on application-level validation instead.

DO $$
DECLARE
  target_constraint CONSTANT text := 'review_schedules_staff_id_fkey';
  constraint_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = 'review_schedules'
      AND tc.constraint_name = target_constraint
  )
  INTO constraint_exists;

  IF constraint_exists THEN
    RAISE NOTICE 'Dropping foreign key % from review_schedules', target_constraint;
    EXECUTE format('ALTER TABLE review_schedules DROP CONSTRAINT %I', target_constraint);
  ELSE
    RAISE NOTICE 'No foreign key % found; nothing to drop', target_constraint;
  END IF;
END;
$$;

COMMENT ON TABLE review_schedules IS
  'Foreign key to staff removed. Validate staff_id against the staff view at application level.';

