-- Permitir lectura y gestión pública de buckets en storage.buckets
DROP POLICY IF EXISTS "Lectura pública de buckets" ON storage.buckets;
CREATE POLICY "Lectura pública de buckets"
  ON storage.buckets FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Creación de buckets" ON storage.buckets;
CREATE POLICY "Creación de buckets"
  ON storage.buckets FOR INSERT
  WITH CHECK (true);
