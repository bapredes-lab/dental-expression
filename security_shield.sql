-- SEGURIDAD PROFESIONAL DENTAL EXPRESSION
-- Este script elimina las políticas de "Demo" y establece seguridad real basada en roles.

-- 1. Limpiar políticas antiguas (usando los nuevos nombres en español)
DROP POLICY IF EXISTS "Allow ALL for Demo Patients" ON public.pacientes;
DROP POLICY IF EXISTS "Allow ALL for Demo Appointments" ON public.citas;
DROP POLICY IF EXISTS "Allow ALL for Demo Treatments" ON public.tratamientos;
DROP POLICY IF EXISTS "Allow ALL for Demo Reviews" ON public.resenas;
DROP POLICY IF EXISTS "Allow ALL for Demo Odontograms" ON public.odontogramas_pacientes;
DROP POLICY IF EXISTS "Allow ALL for Demo Media" ON public.media_pacientes;

-- 2. Asegurar que RLS esté activo en todas las tablas
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tratamientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odontogramas_pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_pacientes ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para PACIENTES (Solo personal autenticado puede ver/editar)
CREATE POLICY "Solo admin ve pacientes" ON public.pacientes 
FOR ALL USING (auth.role() = 'authenticated');

-- 4. Políticas para CITAS (Público puede crear, Admin gestiona)
CREATE POLICY "Público crea citas" ON public.citas FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin gestiona citas" ON public.citas 
FOR ALL USING (auth.role() = 'authenticated');

-- 5. Políticas para ODONTOGRAMAS (Privacidad total del paciente)
CREATE POLICY "Admin gestiona odontogramas" ON public.odontogramas_pacientes 
FOR ALL USING (auth.role() = 'authenticated');

-- 6. Políticas para MEDIA y TRATAMIENTOS
CREATE POLICY "Admin gestiona media" ON public.media_pacientes 
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin gestiona tratamientos" ON public.tratamientos 
FOR ALL USING (auth.role() = 'authenticated');
