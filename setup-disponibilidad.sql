-- ═══════════════════════════════════════════════════════════════
-- SISTEMA DE DISPONIBILIDAD - Dental Expression
-- Ejecutar en Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Horario semanal de la doctora (una fila por día de semana)
CREATE TABLE IF NOT EXISTS public.horario_semanal (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana   INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Dom, 1=Lun... 6=Sáb
  hora_inicio  TIME NOT NULL DEFAULT '08:00',
  hora_fin     TIME NOT NULL DEFAULT '18:00',
  activo       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dia_semana)
);

-- Bloqueos específicos (vacaciones, festivos, imprevistos)
CREATE TABLE IF NOT EXISTS public.bloqueos_agenda (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_inicio  DATE NOT NULL,
  fecha_fin     DATE NOT NULL,
  motivo        TEXT NOT NULL,
  todo_el_dia   BOOLEAN NOT NULL DEFAULT true,
  hora_inicio   TIME,   -- null si todo_el_dia = true
  hora_fin      TIME,   -- null si todo_el_dia = true
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas por rango de fechas
CREATE INDEX IF NOT EXISTS idx_bloqueos_fechas ON public.bloqueos_agenda(fecha_inicio, fecha_fin);

-- ── Horario por defecto: Lun-Vie 8am-6pm, Sáb 8am-1pm, Dom cerrado ──
INSERT INTO public.horario_semanal (dia_semana, hora_inicio, hora_fin, activo) VALUES
  (1, '08:00', '18:00', true),
  (2, '08:00', '18:00', true),
  (3, '08:00', '18:00', true),
  (4, '08:00', '18:00', true),
  (5, '08:00', '18:00', true),
  (6, '08:00', '13:00', true),
  (0, '08:00', '18:00', false)
ON CONFLICT (dia_semana) DO NOTHING;

-- ── RLS: solo admin puede escribir, lectura pública para el form ──
ALTER TABLE public.horario_semanal   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloqueos_agenda   ENABLE ROW LEVEL SECURITY;

-- Lectura pública (el formulario de pacientes la necesita)
CREATE POLICY "lectura_publica_horario"  ON public.horario_semanal  FOR SELECT USING (true);
CREATE POLICY "lectura_publica_bloqueos" ON public.bloqueos_agenda  FOR SELECT USING (true);

-- Solo usuarios autenticados pueden modificar
CREATE POLICY "admin_horario"  ON public.horario_semanal  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_bloqueos" ON public.bloqueos_agenda  FOR ALL USING (auth.role() = 'authenticated');
