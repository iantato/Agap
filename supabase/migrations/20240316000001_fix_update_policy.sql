-- Fix the UPDATE policy to include WITH CHECK clause
DROP POLICY IF EXISTS "Allow anyone to update status" ON distress_signals;

CREATE POLICY "Allow anyone to update status" ON distress_signals
    FOR UPDATE USING (true) WITH CHECK (true);
