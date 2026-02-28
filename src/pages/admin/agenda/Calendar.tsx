import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

// Festivos colombianos básicos
const colombianHolidays = [
    { title: 'Año Nuevo', date: '2024-01-01', display: 'background', color: '#ffb3b3' },
    { title: 'Día de los Reyes Magos', date: '2024-01-08', display: 'background', color: '#ffb3b3' },
    { title: 'Día del Trabajo', date: '2024-05-01', display: 'background', color: '#ffb3b3' },
    { title: 'Batalla de Boyacá', date: '2024-08-07', display: 'background', color: '#ffb3b3' },
    { title: 'Inmaculada Concepción', date: '2024-12-08', display: 'background', color: '#ffb3b3' },
    { title: 'Navidad', date: '2024-12-25', display: 'background', color: '#ffb3b3' },
]

export default function AgendaView() {
    const [events, setEvents] = useState<any[]>(colombianHolidays)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchConsultas()

        // SUSCRIPCIÓN EN TIEMPO REAL (Usando la tabla consultas)
        const channel = supabase
            .channel('realtime_agenda_consultas')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'consultas'
            }, () => {
                fetchConsultas()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchConsultas = async () => {
        try {
            const { data, error } = await supabase
                .from('consultas')
                .select(`
                    id,
                    fecha_hora,
                    paciente_nombre,
                    estado,
                    motivo
                `)

            if (error) throw error

            if (data) {
                const formattedEvents = data.map((consulta: any) => {
                    const startDateTime = consulta.fecha_hora
                    // Asumimos 1 hora de duración por defecto para visualización
                    const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString()

                    return {
                        id: consulta.id,
                        title: `${consulta.paciente_nombre} - ${consulta.motivo || 'Teleconsulta'}`,
                        start: startDateTime,
                        end: endDateTime,
                        backgroundColor: consulta.estado === 'pagada' ? '#059669' : '#0F4C75',
                        borderColor: 'transparent',
                        extendedProps: { ...consulta }
                    }
                })
                setEvents([...colombianHolidays, ...formattedEvents])
            }
        } catch (error) {
            console.error("Error cargando agenda (consultas):", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDateClick = (arg: any) => {
        alert('Nueva cita seleccionada en: ' + arg.dateStr + '\n(Funcionalidad en desarrollo para agendamiento manual)')
    }

    const handleEventClick = (clickInfo: any) => {
        if (clickInfo.event.display !== 'background') {
            const consulta = clickInfo.event.extendedProps
            alert(`Teleconsulta: ${consulta.paciente_nombre}\nMotivo: ${consulta.motivo}\nEstado: ${consulta.estado}`)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-[#052c46]">Agenda Inteligente</h2>
                    <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                        {loading ? <Loader2 className="w-3 h-3 animate-spin text-emerald-500" /> : <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                        Sincronización en Tiempo Real Activa (Consultas)
                    </p>
                </div>
                <Button className="bg-[#052c46] text-white hover:bg-[#0a4b78] rounded-2xl shadow-xl px-8 h-12 font-black uppercase tracking-widest text-xs transition-all active:scale-95">
                    <Plus className="mr-2 h-4 w-4" /> Nueva Teleconsulta
                </Button>
            </div>

            <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/50 shadow-2xl luxury-shadow h-[75vh] overflow-hidden">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'timeGridWeek,timeGridDay,dayGridMonth'
                    }}
                    initialView="timeGridWeek"
                    slotMinTime="07:00:00"
                    slotMaxTime="20:00:00"
                    allDaySlot={false}
                    weekends={true}
                    locale="es"
                    events={events}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    height="100%"
                    buttonText={{
                        today: 'Hoy',
                        month: 'Mes',
                        week: 'Semana',
                        day: 'Día'
                    }}
                    eventClassNames="rounded-lg shadow-sm font-bold text-xs p-1 cursor-pointer hover:scale-[1.02] transition-transform"
                />
            </div>
        </div>
    )
}
