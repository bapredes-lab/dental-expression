-- SEGURIDAD PARA ARCHIVOS (STORAGE)
-- Este script permite que tú (admin) puedas ver y subir archivos al bucket.

-- 1. Permitir que usuarios autenticados vean archivos
CREATE POLICY "Admin puede ver archivos" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'expedientes-medicos');

-- 2. Permitir que usuarios autenticados suban archivos
CREATE POLICY "Admin puede subir archivos" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'expedientes-medicos');

-- 3. Permitir que el público vea archivos (Solo si decides hacerlo público luego, 
-- pero por ahora lo dejamos solo para ti si estás logueada).
