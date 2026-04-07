-- Crear tabla resenas si no existe (con nombres en español)
-- Ejecutar en Supabase > SQL Editor

CREATE TABLE IF NOT EXISTS public.resenas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_paciente TEXT NOT NULL,
    calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5) DEFAULT 5,
    comentario TEXT NOT NULL,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('publicada', 'pendiente')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.resenas ENABLE ROW LEVEL SECURITY;

-- Política: solo usuarios autenticados gestionan reseñas
DROP POLICY IF EXISTS "Admin gestiona resenas" ON public.resenas;
CREATE POLICY "Admin gestiona resenas" ON public.resenas
    FOR ALL USING (auth.role() = 'authenticated');

-- Política: público puede leer solo las publicadas (para la landing)
DROP POLICY IF EXISTS "Público lee resenas publicadas" ON public.resenas;
CREATE POLICY "Público lee resenas publicadas" ON public.resenas
    FOR SELECT USING (estado = 'publicada');

-- Datos de ejemplo
INSERT INTO public.resenas (nombre_paciente, calificacion, comentario, estado) VALUES
('Isabella Rodriguez', 5, 'Excelente atención. El simulador IA me ayudó a decidir mi tratamiento de diseño de sonrisa.', 'publicada'),
('Mateo Sánchez', 4, 'Muy profesional todo el equipo. Mis resultados fueron mejores de lo esperado.', 'publicada'),
('Valentina López', 5, 'La tecnología que usan es impresionante. Me sentí en el futuro.', 'pendiente')
ON CONFLICT DO NOTHING;
