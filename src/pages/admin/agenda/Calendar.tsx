import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Plus } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { supabase } from '@/lib/supabase'

// Festivos fijos (no trasladables) y algunos movibles para 2024-2025
const colombianHolidays = [
    { title: 'Año Nuevo', date: '2024-01-01', display: 'background', color: '#ffb3b3' },
    { title: 'Día de los Reyes Magos', date: '2024-01-08', display: 'background', color: '#ffb3b3' },
    { title: 'San José', date: '2024-03-25', display: 'background', color: '#ffb3b3' },
    { title: 'Jueves Santo', date: '2024-03-28', display: 'background', color: '#ffb3b3' },
    { title: 'Viernes Santo', date: '2024-03-29', display: 'background', color: '#ffb3b3' },
    { title: 'Día del Trabajo', date: '2024-05-01', display: 'background', color: '#ffb3b3' },
    { title: 'Ascensión del Señor', date: '2024-05-13', display: 'background', color: '#ffb3b3' },
    { title: 'Corpus Christi', date: '2024-06-03', display: 'background', color: '#ffb3b3' },
    { title: 'Sagrado Corazón', date: '2024-06-10', display: 'background', color: '#ffb3b3' },
    { title: 'San Pedro y San Pablo', date: '2024-07-01', display: 'background', color: '#ffb3b3' },
    { title: 'Día de la Independencia', date: '2024-07-20', display: 'background', color: '#ffb3b3' },
    { title: 'Batalla de Boyacá', date: '2024-08-07', display: 'background', color: '#ffb3b3' },
    { title: 'Asunción de la Virgen', date: '2024-08-19', display: 'background', color: '#ffb3b3' },
    { title: 'Día de la Raza', date: '2024-10-14', display: 'background', color: '#ffb3b3' },
    { title: 'Todos los Santos', date: '2024-11-04', display: 'background', color: '#ffb3b3' },
    { title: 'Independencia de Cartagena', date: '2024-11-11', display: 'background', color: '#ffb3b3' },
    { title: 'Inmaculada Concepción', date: '2024-12-08', display: 'background', color: '#ffb3b3' },
    { title: 'Navidad', date: '2024-12-25', display: 'background', color: '#ffb3b3' },

    // 2025
    { title: 'Año Nuevo', date: '2025-01-01', display: 'background', color: '#ffb3b3' },
    { title: 'Día de los Reyes Magos', date: '2025-01-06', display: 'background', color: '#ffb3b3' },
]

export default function AgendaView() {
    const [events, setEvents] = useState<any[]>(colombianHolidays)

    useEffect(() => {
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        if (import.meta.env.VITE_SUPABASE_URL !== "") {
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

            if (!error && data) {
                const formattedEvents = data.map((appt: any) => {
                    const startDateTime = `${appt.date}T${appt.time}`
                    // Set a default 1-hour duration for the appointment
                    const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString().split('.')[0]
                    const patientName = appt.patients?.name || 'Paciente'
                    return {
                        id: appt.id,
                        title: `${patientName} - ${appt.type}`,
                        start: startDateTime,
                        end: endDateTime,
                        backgroundColor: appt.status === 'confirmed' ? '#059669' : '#0F4C75'
                    }
                })
                setEvents([...colombianHolidays, ...formattedEvents])
                return
            }
        }

        // Mock Fallback
        const mockAppointments = [
            { title: 'Valoración: Juan P.', start: new Date().toISOString().split('T')[0] + 'T09:00:00', end: new Date().toISOString().split('T')[0] + 'T10:00:00', backgroundColor: '#0F4C75' },
            { title: 'Revaloración: María G.', start: new Date().toISOString().split('T')[0] + 'T14:00:00', end: new Date().toISOString().split('T')[0] + 'T14:30:00', backgroundColor: '#059669' }
        ]
        setEvents([...colombianHolidays, ...mockAppointments])
    }

    const handleDateClick = (arg: any) => {
        alert('Pronto se abrirá el modal para agendar cita en ' + arg.dateStr)
    }

    const handleEventClick = (clickInfo: any) => {
        if (clickInfo.event.display !== 'background') {
            alert("Cita: " + clickInfo.event.title + "\nModulo en construcción: Edición de Citas")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Agenda Digital</h2>
                    <p className="text-sm text-muted-foreground mt-1">Gestiona las citas de la clínica.</p>
                </div>
                <Button onClick={() => alert("Modal Nueva Cita")}>
                    <Plus className="mr-2 h-4 w-4" /> Nueva Cita
                </Button>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm h-[75vh]">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
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
                        day: 'Día',
                        list: 'Lista'
                    }}
                />
            </div>
        </div>
    )
}
