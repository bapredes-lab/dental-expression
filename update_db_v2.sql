-- Actualización para Dental Expression: De Demo a Real

-- 1. Tabla para estados del odontograma
CREATE TABLE IF NOT EXISTS public.patient_odontograms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    tooth_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    ai_analysis TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Tabla para fotos clínicas (Storage)
CREATE TABLE IF NOT EXISTS public.patient_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type TEXT CHECK (type IN ('before', 'after', 'xray', 'clinical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Habilitar RLS para las nuevas tablas
ALTER TABLE public.patient_odontograms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow ALL for Demo Odontograms" ON public.patient_odontograms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL for Demo Media" ON public.patient_media FOR ALL USING (true) WITH CHECK (true);

-- 4. Asegurar que la tabla treatments tenga una columna para el total pagado (para el dashboard)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='treatments' AND COLUMN_NAME='amount_paid') THEN
        ALTER TABLE public.treatments ADD COLUMN amount_paid DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;
