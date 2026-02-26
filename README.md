# Dental Expression - MVP

Esta es la versión Minimum Viable Product (MVP) para la gestión clínica odontológica de **Dental Expression**. Está construida con base técnica moderna enfocada a la alta velocidad de respuesta, interactividad profunda y visual premium.

## Tecnologías Principales
- **Framework**: React 18 + Vite
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui (colores personalizados corporativos)
- **Ruteo**: React Router v6
- **Base de Datos / Auth**: Supabase
- **Pagos**: Stripe (Simulación / Test Mode)
- **Componentes Adicionales**: react-hook-form, zod, @hello-pangea/dnd, react-pdf, react-compare-slider, fullcalendar.

## Estructura de Módulos Implementada
1. **Autenticación**: Inicio de sesión (Soporte mock-up local sin DB + Soporte Real Supabase)
2. **Pacientes**: Registro y Ficha Médica
3. **Multimedia**: Subida Drag & Drop guiada por categorías (Fotos, radiografías, historia clínica)
4. **Agenda Digital**: Calendario avanzado con drag/drop guiado y festivos de Colombia incluidos
5. **Planes de Tratamiento**: Generador visual de cotizaciones y exportador de PDFs físicos.
6. **Pagos USD**: Tablero transaccional estilo Stripe.
7. **Simulación Inteligencia Artificial**: Visor Comparativo Antes/Después con pre-integración lista para Fal.Ai.

## Requisitos Previos y Configuración
Para que el proyecto funcione con la persistencia en base de datos real y todas sus características de subida, requieres conectar las variables de entorno.

1. Duplica el archivo `.env` o crea uno nuevo en la raíz si no existe.
2. Agrega y completa las siguientes variables provistas por [Supabase](https://supabase.com/):

```env
VITE_SUPABASE_URL=tu_project_url_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

*Nota: Si dejas las variables en blanco, la app entra en modo "Simulador MVP" para permitirte ver el diseño y navegación sin necesidad de bases de datos.*

## Instalación y Arranque

Carga inicial de dependencias:
```bash
npm install
```

Ejecución del servidor de desarrollo (Local):
```bash
npm run dev
```

Construcción para producción:
```bash
npm run build
```

## Próximos Pasos (V2)
- Integrar Edge Functions para Stripe Webhooks reales.
- Integración en firme de API de FAL.ai al presionar "Simular" en el visor.
- Agregar panel de métricas más avanzadas en Chart.js para el Dashboard admin.
