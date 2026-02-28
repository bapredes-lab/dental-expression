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
        fetchAppointments()

        // SUSCRIPCIÓN EN TIEMPO REAL
        const channel = supabase
            .channel('realtime_agenda')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'appointments'
            }, () => {
                fetchAppointments()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchAppointments = async () => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    id,
                    date,
                    time,
                    type,
                    status,
                    patients ( name )
                `)

            if (error) throw error

            if (data) {
                const formattedEvents = data.map((appt: any) => {
                    const startDateTime = `${appt.date}T${appt.time}`
                    const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString().split('.')[0]
                    const patientName = appt.patients?.name || 'Paciente'
                    return {
                        id: appt.id,
                        title: `${patientName} - ${appt.type}`,
                        start: startDateTime,
                        end: endDateTime,
                        backgroundColor: appt.status === 'confirmed' ? '#059669' : '#0F4C75',
                        borderColor: 'transparent',
                        extendedProps: { ...appt }
                    }
                })
                setEvents([...colombianHolidays, ...formattedEvents])
            }
        } catch (error) {
            console.error("Error cargando agenda:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDateClick = (arg: any) => {
        alert('Nueva cita en: ' + arg.dateStr)
    }

    const handleEventClick = (clickInfo: any) => {
        if (clickInfo.event.display !== 'background') {
            const appt = clickInfo.event.extendedProps
            alert(`Cita: ${clickInfo.event.title}\nEstado: ${appt.status}\nPaciente: ${appt.patients?.name}`)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-[#052c46]">Agenda Inteligente</h2>
                    <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                        {loading ? <Loader2 className="w-3 h-3 animate-spin text-emerald-500" /> : <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                        Sincronización en Tiempo Real Activa
                    </p>
                </div>
                <Button className="bg-[#052c46] text-white hover:bg-[#0a4b78] rounded-2xl shadow-xl px-8 h-12 font-black uppercase tracking-widest text-xs transition-all active:scale-95">
                    <Plus className="mr-2 h-4 w-4" /> Nueva Cita
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
                    eventClassNames="rounded-lg shadow-sm font-bold text-xs p-1 cursor-pointer"
                />
            </div>
        </div>
    )
}
