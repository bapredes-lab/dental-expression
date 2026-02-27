-- Create Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create Treatments Table
CREATE TABLE IF NOT EXISTS public.treatments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    procedures TEXT[] NOT NULL,
    total_usd DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'planning',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable Row Level Security (RLS) but allow all for demo purposes
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow ALL for Demo Patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL for Demo Appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL for Demo Treatments" ON public.treatments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL for Demo Reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- Mock Data Insertion

-- 1. Patients (Colombian names)
INSERT INTO public.patients (name, email, phone) VALUES
('Valentina Giraldo', 'valentina.g@example.com', '+57 300 123 4567'),
('Santiago Restrepo', 'santirestrepo@example.com', '+57 320 987 6543'),
('Camila Castaño', 'camicasta@example.com', '+57 311 555 4433');

-- 2. Appointments (Today and Tomorrow)
DO $$
DECLARE
    p1_id UUID;
    p2_id UUID;
    p3_id UUID;
BEGIN
    SELECT id INTO p1_id FROM public.patients WHERE email = 'valentina.g@example.com';
    SELECT id INTO p2_id FROM public.patients WHERE email = 'santirestrepo@example.com';
    SELECT id INTO p3_id FROM public.patients WHERE email = 'camicasta@example.com';

    INSERT INTO public.appointments (patient_id, date, time, type, status) VALUES
    (p1_id, CURRENT_DATE, '09:00:00', 'Valoración Inicial', 'confirmed'),
    (p2_id, CURRENT_DATE, '14:30:00', 'Diseño de Sonrisa', 'pending'),
    (p3_id, CURRENT_DATE + INTERVAL '1 day', '10:00:00', 'Blanqueamiento', 'confirmed');
END $$;

-- 3. Reviews
INSERT INTO public.reviews (patient_name, rating, comment, status) VALUES
('Valentina Giraldo', 5, '¡Excelente servicio! Quedé encantada con los resultados, la Dra. Nataly es una profesional increíble.', 'published'),
('Santiago Restrepo', 4, 'Muy buena atención y tecnología de punta, me sentí súper cómodo en la clínica.', 'published');
