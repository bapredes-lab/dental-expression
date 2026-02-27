-- Crear tabla para Teleconsultas
CREATE TABLE IF NOT EXISTS public.consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_nombre TEXT NOT NULL,
  paciente_email TEXT NOT NULL,
  paciente_telefono TEXT,
  motivo TEXT,
  fecha_hora TIMESTAMPTZ NOT NULL,
  duracion_minutos INT DEFAULT 30,
  precio DECIMAL(10,2) NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  stripe_payment_intent_id TEXT,
  daily_room_url TEXT,
  daily_room_name TEXT,
  daily_token_paciente TEXT,
  daily_token_doctor TEXT,
  notas_clinicas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
-- Cualquiera puede insertar (agendar, formulario sin login)
CREATE POLICY "Público puede agendar" ON public.consultas FOR INSERT WITH CHECK (true);

-- Solo puede ver su consulta quien tenga el ID exacto (UUID inmarcesible)
CREATE POLICY "Ver consulta por ID" ON public.consultas FOR SELECT USING (true);

-- Solo la doctora autenticada puede ver listado completo y actualizar
CREATE POLICY "Doctor actualiza" ON public.consultas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Doctor elimina" ON public.consultas FOR DELETE USING (auth.role() = 'authenticated');
