-- CA-07/08: solicitar não encerra; somente confirmação registra returned_at.
ALTER TABLE "loans" ADD COLUMN "return_requested_at" TIMESTAMP(3);
CREATE UNIQUE INDEX "loans_one_open_per_equipment" ON "loans"("equipment_id") WHERE "returned_at" IS NULL;
ALTER TABLE "loans" ADD CONSTRAINT "loans_dates_valid" CHECK (
  "due_date" >= "borrowed_at" AND
  ("return_requested_at" IS NULL OR "return_requested_at" >= "borrowed_at") AND
  ("returned_at" IS NULL OR ("return_requested_at" IS NOT NULL AND "returned_at" >= "return_requested_at"))
);
CREATE FUNCTION check_loan_tenant() RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM equipments WHERE id=NEW.equipment_id AND tenant_id=NEW.tenant_id)
    OR NOT EXISTS (SELECT 1 FROM memberships WHERE user_id=NEW.user_id AND tenant_id=NEW.tenant_id)
  THEN RAISE EXCEPTION 'Equipamento e colaborador devem pertencer ao tenant do empréstimo'; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER loans_tenant_integrity BEFORE INSERT OR UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION check_loan_tenant();
