import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Plus, Loader2, Calendar, Clock, User, ChevronRight } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { supabase } from '@/lib/supabase'
import { format, parseISO, isAfter, startOfToday } from 'date-fns'
import { es } from 'date-fns/locale'

// Festivos colombianos 2025-2026
const colombianHolidays = [
    { title: 'Año Nuevo', date: '2026-01-01', display: 'background', color: '#ffb3b3' },
    { title: 'Reyes Magos', date: '2026-01-12', display: 'background', color: '#ffb3b3' },
    { title: 'San José', date: '2026-03-23', display: 'background', color: '#ffb3b3' },
    { title: 'Jueves Santo', date: '2026-04-02', display: 'background', color: '#ffb3b3' },
    { title: 'Viernes Santo', date: '2026-04-03', display: 'background', color: '#ffb3b3' },
    { title: 'Día del Trabajo', date: '2026-05-01', display: 'background', color: '#ffb3b3' },
    { title: 'Ascensión', date: '2026-05-14', display: 'background', color: '#ffb3b3' },
    { title: 'Corpus Christi', date: '2026-06-04', display: 'background', color: '#ffb3b3' },
    { title: 'Sagrado Corazón', date: '2026-06-11', display: 'background', color: '#ffb3b3' },
    { title: 'San Pedro y Pablo', date: '2026-06-29', display: 'background', color: '#ffb3b3' },
    { title: 'Independencia', date: '2026-07-20', display: 'background', color: '#ffb3b3' },
    { title: 'Batalla de Boyacá', date: '2026-08-07', display: 'background', color: '#ffb3b3' },
    { title: 'Asunción', date: '2026-08-17', display: 'background', color: '#ffb3b3' },
    { title: 'Día de la Raza', date: '2026-10-12', display: 'background', color: '#ffb3b3' },
    { title: 'Todos los Santos', date: '2026-11-02', display: 'background', color: '#ffb3b3' },
    { title: 'Independencia Cartagena', date: '2026-11-16', display: 'background', color: '#ffb3b3' },
    { title: 'Inmaculada Concepción', date: '2026-12-08', display: 'background', color: '#ffb3b3' },
    { title: 'Navidad', date: '2026-12-25', display: 'background', color: '#ffb3b3' },
]

type Consulta = {
    id: string
    fecha_hora: string
    paciente_nombre: string
    estado: string
    motivo: string | null
}

const ESTADO_CONFIG: Record<string, { color: string; label: string }> = {
    pagada:    { color: '#059669', label: 'Pagada' },
    pendiente: { color: '#0F4C75', label: 'Pendiente' },
    cancelada: { color: '#e11d48', label: 'Cancelada' },
}

export default function AgendaView() {
    const [consultas, setConsultas] = useState<Consulta[]>([])
    const [events, setEvents] = useState<any[]>(colombianHolidays)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchConsultas()

        const channel = supabase
            .channel('realtime_agenda_consultas')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'consultas' }, fetchConsultas)
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    const fetchConsultas = async () => {
        try {
            const { data, error } = await supabase
                .from('consultas')
                .select('id, fecha_hora, paciente_nombre, estado, motivo')
                .order('fecha_hora', { ascending: true })

            if (error) throw error

            if (data) {
                setConsultas(data)
                const formatted = data.map((c: Consulta) => ({
                    id: c.id,
                    title: c.paciente_nombre,
                    start: c.fecha_hora,
                    end: new Date(new Date(c.fecha_hora).getTime() + 30 * 60 * 1000).toISOString(),
                    backgroundColor: ESTADO_CONFIG[c.estado]?.color ?? '#0F4C75',
                    borderColor: 'transparent',
                    extendedProps: c,
                }))
                setEvents([...colombianHolidays, ...formatted])
            }
        } catch (err) {
            console.error('Error cargando agenda:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleEventClick = (clickInfo: any) => {
        if (clickInfo.event.display === 'background') return
        const c = clickInfo.event.extendedProps
        const fecha = format(parseISO(c.fecha_hora), "EEEE d 'de' MMMM, h:mm a", { locale: es })
        alert(`👤 ${c.paciente_nombre}\n📅 ${fecha}\n💬 ${c.motivo || 'Sin motivo'}\n📌 Estado: ${c.estado}`)
    }

    // Próximas citas (futuras, máx 6)
    const hoy = startOfToday()
    const proximas = consultas
        .filter(c => c.estado !== 'cancelada' && isAfter(parseISO(c.fecha_hora), hoy))
        .slice(0, 6)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-[#052c46]">Agenda Inteligente</h2>
                    <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                        {loading
                            ? <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                            : <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        }
                        Sincronización en Tiempo Real · {consultas.length} consulta{consultas.length !== 1 ? 's' : ''} registrada{consultas.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button className="bg-[#052c46] text-white hover:bg-[#0a4b78] rounded-2xl shadow-xl px-8 h-12 font-black uppercase tracking-widest text-xs transition-all active:scale-95">
                    <Plus className="mr-2 h-4 w-4" /> Nueva Teleconsulta
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">

                {/* Calendario — ocupa 2/3 */}
                <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/50 shadow-2xl luxury-shadow overflow-hidden">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay',
                        }}
                        initialView="dayGridMonth"
                        slotMinTime="07:00:00"
                        slotMaxTime="20:00:00"
                        allDaySlot={false}
                        weekends={true}
                        locale="es"
                        events={events}
                        eventClick={handleEventClick}
                        height="600px"
                        buttonText={{
                            today: 'Hoy',
                            month: 'Mes',
                            week: 'Semana',
                            day: 'Día',
                        }}
                        eventClassNames="rounded-lg shadow-sm font-bold text-xs cursor-pointer hover:opacity-90 transition-opacity"
                        dayMaxEvents={3}
                        moreLinkText={(n) => `+${n} más`}
                    />
                </div>

                {/* Panel de próximas citas — 1/3 */}
                <div className="space-y-4">
                    <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[2rem] shadow-xl luxury-shadow p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-[#052c46]/10 rounded-xl">
                                <Calendar className="w-4 h-4 text-[#052c46]" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-[#052c46] tracking-tight">Próximas Citas</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {proximas.length === 0 ? 'Sin citas próximas' : `${proximas.length} próxima${proximas.length > 1 ? 's' : ''}`}
                                </p>
                            </div>
                        </div>

                        {proximas.length === 0 ? (
                            <div className="text-center py-10">
                                <Calendar className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                <p className="text-sm font-bold text-slate-400">Sin citas programadas</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {proximas.map(c => {
                                    const fecha = parseISO(c.fecha_hora)
                                    const cfg = ESTADO_CONFIG[c.estado] ?? ESTADO_CONFIG.pendiente
                                    return (
                                        <div
                                            key={c.id}
                                            className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group"
                                        >
                                            {/* Indicador de color */}
                                            <div
                                                className="w-1 self-stretch rounded-full shrink-0"
                                                style={{ backgroundColor: cfg.color }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-[#052c46] text-sm truncate flex items-center gap-1">
                                                    <User className="w-3 h-3 shrink-0" /> {c.paciente_nombre}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1 capitalize">
                                                    <Clock className="w-3 h-3 shrink-0" />
                                                    {format(fecha, "EEE d MMM · h:mm a", { locale: es })}
                                                </p>
                                                {c.motivo && (
                                                    <p className="text-[10px] text-slate-400 mt-1 truncate">{c.motivo}</p>
                                                )}
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0 mt-1" />
                                        </div>
                                    )
                                })}

                                {consultas.filter(c => c.estado !== 'cancelada' && isAfter(parseISO(c.fecha_hora), hoy)).length > 6 && (
                                    <p className="text-center text-xs font-bold text-slate-400 pt-2">
                                        +{consultas.filter(c => c.estado !== 'cancelada' && isAfter(parseISO(c.fecha_hora), hoy)).length - 6} citas más en el calendario
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Leyenda */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[2rem] shadow-xl luxury-shadow p-5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Leyenda</p>
                        <div className="space-y-2">
                            {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.color }} />
                                    <span className="text-xs font-bold text-slate-600">{cfg.label}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-200" />
                                <span className="text-xs font-bold text-slate-600">Festivo</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
