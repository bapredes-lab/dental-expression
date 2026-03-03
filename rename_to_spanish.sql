-- MIGRACIÓN DE IDIOMA: INGLÉS -> ESPAÑOL
-- Este script renombra las tablas y columnas para que la base de datos esté en español.

-- 1. Renombrar Tablas
ALTER TABLE IF EXISTS public.patients RENAME TO pacientes;
ALTER TABLE IF EXISTS public.appointments RENAME TO citas;
ALTER TABLE IF EXISTS public.treatments RENAME TO tratamientos;
ALTER TABLE IF EXISTS public.reviews RENAME TO resenas;
ALTER TABLE IF EXISTS public.patient_odontograms RENAME TO odontogramas_pacientes;
ALTER TABLE IF EXISTS public.patient_media RENAME TO media_pacientes;

-- 2. Renombrar Columnas para 'pacientes'
ALTER TABLE public.pacientes RENAME COLUMN name TO nombre;
ALTER TABLE public.pacientes RENAME COLUMN phone TO telefono;
-- ALTER TABLE public.pacientes RENAME COLUMN created_at TO creado_en; -- Opcional, mantener created_at es estándar

-- 3. Renombrar Columnas para 'citas'
ALTER TABLE public.citas RENAME COLUMN patient_id TO paciente_id;
ALTER TABLE public.citas RENAME COLUMN date TO fecha;
ALTER TABLE public.citas RENAME COLUMN time TO hora;
ALTER TABLE public.citas RENAME COLUMN type TO tipo;
ALTER TABLE public.citas RENAME COLUMN status TO estado;

-- 4. Renombrar Columnas para 'tratamientos'
ALTER TABLE public.tratamientos RENAME COLUMN patient_id TO paciente_id;
ALTER TABLE public.tratamientos RENAME COLUMN procedures TO procedimientos;
-- total_usd se mantiene igual por ser moneda técnica
ALTER TABLE public.tratamientos RENAME COLUMN status TO estado;
ALTER TABLE public.tratamientos RENAME COLUMN amount_paid TO monto_pagado;

-- 5. Renombrar Columnas para 'resenas'
ALTER TABLE public.resenas RENAME COLUMN patient_name TO nombre_paciente;
ALTER TABLE public.resenas RENAME COLUMN rating TO calificacion;
ALTER TABLE public.resenas RENAME COLUMN comment TO comentario;
ALTER TABLE public.resenas RENAME COLUMN status TO estado;

-- 6. Renombrar Columnas para 'odontogramas_pacientes'
ALTER TABLE public.odontogramas_pacientes RENAME COLUMN patient_id TO paciente_id;
ALTER TABLE public.odontogramas_pacientes RENAME COLUMN tooth_data TO datos_dentales;
ALTER TABLE public.odontogramas_pacientes RENAME COLUMN ai_analysis TO analisis_ia;
ALTER TABLE public.odontogramas_pacientes RENAME COLUMN updated_at TO actualizado_en;

-- 7. Renombrar Columnas para 'media_pacientes'
ALTER TABLE public.media_pacientes RENAME COLUMN patient_id TO paciente_id;
ALTER TABLE public.media_pacientes RENAME COLUMN type TO tipo;
-- url y created_at se mantienen

-- NOTA: Asegúrate de ejecutar este script en el SQL Editor de Supabase ANTES de que el código actualizado intente acceder a las tablas.
