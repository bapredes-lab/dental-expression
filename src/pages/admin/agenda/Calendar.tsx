import { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Loader2, Calendar, Clock, User, ChevronRight, Ban, X, Save, CalendarOff } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { supabase } from '@/lib/supabase'
import { format, parseISO, isAfter, startOfToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

// ── Festivos colombianos 2026 ─────────────────────────────────────────────────
const colombianHolidays = [
    { title: 'Año Nuevo', date: '2026-01-01', display: 'background', color: '#fca5a5' },
    { title: 'Reyes Magos', date: '2026-01-12', display: 'background', color: '#fca5a5' },
    { title: 'San José', date: '2026-03-23', display: 'background', color: '#fca5a5' },
    { title: 'Jueves Santo', date: '2026-04-02', display: 'background', color: '#fca5a5' },
    { title: 'Viernes Santo', date: '2026-04-03', display: 'background', color: '#fca5a5' },
    { title: 'Día del Trabajo', date: '2026-05-01', display: 'background', color: '#fca5a5' },
    { title: 'Ascensión', date: '2026-05-14', display: 'background', color: '#fca5a5' },
    { title: 'Corpus Christi', date: '2026-06-04', display: 'background', color: '#fca5a5' },
    { title: 'Sagrado Corazón', date: '2026-06-11', display: 'background', color: '#fca5a5' },
    { title: 'San Pedro y Pablo', date: '2026-06-29', display: 'background', color: '#fca5a5' },
    { title: 'Independencia', date: '2026-07-20', display: 'background', color: '#fca5a5' },
    { title: 'Batalla de Boyacá', date: '2026-08-07', display: 'background', color: '#fca5a5' },
    { title: 'Asunción', date: '2026-08-17', display: 'background', color: '#fca5a5' },
    { title: 'Día de la Raza', date: '2026-10-12', display: 'background', color: '#fca5a5' },
    { title: 'Todos los Santos', date: '2026-11-02', display: 'background', color: '#fca5a5' },
    { title: 'Independencia Cartagena', date: '2026-11-16', display: 'background', color: '#fca5a5' },
    { title: 'Inmaculada Concepción', date: '2026-12-08', display: 'background', color: '#fca5a5' },
    { title: 'Navidad', date: '2026-12-25', display: 'background', color: '#fca5a5' },
]

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Consulta = {
    id: string
    fecha_hora: string
    paciente_nombre: string
    estado: string
    motivo: string | null
}

type Bloqueo = {
    id: string
    fecha_inicio: string
    fecha_fin: string
    motivo: string
    todo_el_dia: boolean
    hora_inicio?: string | null
    hora_fin?: string | null
}

type ModalBloqueo = {
    fecha_inicio: string
    fecha_fin: string
    hora_inicio: string
    hora_fin: string
    todo_el_dia: boolean
    motivo: string
}

const ESTADO_CONFIG: Record<string, { color: string; label: string }> = {
    pagada:    { color: '#059669', label: 'Pagada' },
    pendiente: { color: '#0F4C75', label: 'Pendiente' },
    cancelada: { color: '#e11d48', label: 'Cancelada' },
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function AgendaView() {
    const [consultas, setConsultas] = useState<Consulta[]>([])
    const [bloqueos, setBloqueos] = useState<Bloqueo[]>([])
    const [events, setEvents] = useState<any[]>(colombianHolidays)
    const [loading, setLoading] = useState(true)

    // Modal de nuevo bloqueo
    const [modalOpen, setModalOpen] = useState(false)
    const [modalData, setModalData] = useState<ModalBloqueo>({
        fecha_inicio: '', fecha_fin: '', hora_inicio: '08:00',
        hora_fin: '09:00', todo_el_dia: true, motivo: ''
    })
    const [savingBloqueo, setSavingBloqueo] = useState(false)

    const calendarRef = useRef<any>(null)

    useEffect(() => {
        fetchAll()
        const channel = supabase
            .channel('realtime_agenda')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'consultas' }, fetchAll)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bloqueos_agenda' }, fetchAll)
            .subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [])

    async function fetchAll() {
        try {
            const [{ data: consultasData }, { data: bloqueosData }] = await Promise.all([
                supabase.from('consultas').select('id, fecha_hora, paciente_nombre, estado, motivo').order('fecha_hora'),
                supabase.from('bloqueos_agenda').select('*').order('fecha_inicio'),
            ])

            const c: Consulta[] = consultasData || []
            const b: Bloqueo[] = bloqueosData || []
            setConsultas(c)
            setBloqueos(b)
            buildEvents(c, b)
        } catch (err) {
            console.error('Error cargando agenda:', err)
        } finally {
            setLoading(false)
        }
    }

    function buildEvents(consultas: Consulta[], bloqueos: Bloqueo[]) {
        const consultaEvents = consultas.map(c => ({
            id: `consulta-${c.id}`,
            title: `👤 ${c.paciente_nombre}`,
            start: c.fecha_hora,
            end: new Date(new Date(c.fecha_hora).getTime() + 30 * 60 * 1000).toISOString(),
            backgroundColor: ESTADO_CONFIG[c.estado]?.color ?? '#0F4C75',
            borderColor: 'transparent',
            extendedProps: { tipo: 'consulta', ...c },
        }))

        const bloqueoEvents = bloqueos.map(b => {
            if (b.todo_el_dia) {
                // Bloqueo todo el día — aparece como fondo rojo durante los días bloqueados
                const fin = new Date(b.fecha_fin)
                fin.setDate(fin.getDate() + 1) // FullCalendar excluye el último día
                return {
                    id: `bloqueo-${b.id}`,
                    title: `🔒 ${b.motivo}`,
                    start: b.fecha_inicio,
                    end: format(fin, 'yyyy-MM-dd'),
                    display: 'background',
                    backgroundColor: '#fca5a580',
                    extendedProps: { tipo: 'bloqueo', ...b },
                }
            } else {
                // Bloqueo por horas — aparece como evento rojo en la franja
                return {
                    id: `bloqueo-${b.id}`,
                    title: `🔒 ${b.motivo}`,
                    start: `${b.fecha_inicio}T${b.hora_inicio}`,
                    end: `${b.fecha_fin}T${b.hora_fin}`,
                    backgroundColor: '#e11d4890',
                    borderColor: '#e11d48',
                    textColor: '#fff',
                    extendedProps: { tipo: 'bloqueo', ...b },
                }
            }
        })

        setEvents([...colombianHolidays, ...consultaEvents, ...bloqueoEvents])
    }

    // Click en día vacío → abrir modal con esa fecha
    const handleDateClick = (arg: any) => {
        const fecha = arg.dateStr.slice(0, 10)
        setModalData({
            fecha_inicio: fecha,
            fecha_fin: fecha,
            hora_inicio: arg.dateStr.length > 10 ? arg.dateStr.slice(11, 16) : '08:00',
            hora_fin: '09:00',
            todo_el_dia: arg.dateStr.length === 10, // día completo si click en vista mes
            motivo: '',
        })
        setModalOpen(true)
    }

    // Selección de rango en vista semana/día → pre-rellenar horas
    const handleSelect = (arg: any) => {
        const fechaInicio = arg.startStr.slice(0, 10)
        const fechaFin = arg.endStr.slice(0, 10) === fechaInicio
            ? fechaInicio
            : new Date(new Date(arg.endStr).getTime() - 86400000).toISOString().slice(0, 10)

        setModalData({
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            hora_inicio: arg.startStr.length > 10 ? arg.startStr.slice(11, 16) : '08:00',
            hora_fin: arg.endStr.length > 10 ? arg.endStr.slice(11, 16) : '09:00',
            todo_el_dia: arg.allDay,
            motivo: '',
        })
        setModalOpen(true)
    }

    // Click en evento existente
    const handleEventClick = (clickInfo: any) => {
        if (clickInfo.event.display === 'background') return
        const props = clickInfo.event.extendedProps
        if (props.tipo === 'consulta') {
            const fecha = format(parseISO(props.fecha_hora), "EEEE d 'de' MMMM · h:mm a", { locale: es })
            alert(`👤 ${props.paciente_nombre}\n📅 ${fecha}\n💬 ${props.motivo || 'Sin motivo'}\n📌 ${props.estado}`)
        }
    }

    // Guardar bloqueo desde modal
    async function saveBloqueo() {
        if (!modalData.fecha_inicio || !modalData.fecha_fin || !modalData.motivo) return
        setSavingBloqueo(true)
        const { error } = await supabase.from('bloqueos_agenda').insert({
            fecha_inicio: modalData.fecha_inicio,
            fecha_fin: modalData.fecha_fin,
            motivo: modalData.motivo,
            todo_el_dia: modalData.todo_el_dia,
            hora_inicio: modalData.todo_el_dia ? null : modalData.hora_inicio,
            hora_fin: modalData.todo_el_dia ? null : modalData.hora_fin,
        })
        setSavingBloqueo(false)
        if (!error) {
            setModalOpen(false)
            fetchAll()
        }
    }

    // Eliminar bloqueo
    async function deleteBloqueo(id: string) {
        await supabase.from('bloqueos_agenda').delete().eq('id', id)
        fetchAll()
    }

    // Próximas citas
    const hoy = startOfToday()
    const proximas = consultas
        .filter(c => c.estado !== 'cancelada' && isAfter(parseISO(c.fecha_hora), hoy))
        .slice(0, 5)

    const bloqueosProximos = bloqueos
        .filter(b => b.fecha_fin >= format(hoy, 'yyyy-MM-dd'))
        .slice(0, 4)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-white">Agenda Inteligente</h2>
                    <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                        {loading
                            ? <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                            : <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                        Tiempo Real · {consultas.length} consulta{consultas.length !== 1 ? 's' : ''} · {bloqueos.length} bloqueo{bloqueos.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button
                    onClick={() => {
                        const hoyStr = format(hoy, 'yyyy-MM-dd')
                        setModalData({ fecha_inicio: hoyStr, fecha_fin: hoyStr, hora_inicio: '08:00', hora_fin: '09:00', todo_el_dia: true, motivo: '' })
                        setModalOpen(true)
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white rounded-2xl shadow-xl px-6 h-12 font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                >
                    <Ban className="mr-2 h-4 w-4" /> Bloquear Fecha
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">

                {/* Calendario */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl p-4 rounded-[2.5rem] border border-white/10 overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Teleconsultas
                        <span className="w-2 h-2 rounded-full bg-rose-400 inline-block ml-2" /> Bloqueado (consultorio/viaje)
                        <span className="w-2 h-2 rounded-full bg-red-200 inline-block ml-2" /> Festivo
                    </p>
                    <FullCalendar
                        ref={calendarRef}
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
                        dateClick={handleDateClick}
                        select={handleSelect}
                        selectable={true}
                        selectMirror={true}
                        eventClick={handleEventClick}
                        height="560px"
                        buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}
                        eventClassNames="rounded-lg font-bold text-xs cursor-pointer hover:opacity-90 transition-opacity"
                        dayMaxEvents={3}
                        moreLinkText={(n) => `+${n} más`}
                    />
                    <p className="text-[10px] text-slate-400 text-center mt-3 font-bold">
                        Haz clic en cualquier día o arrastra para seleccionar un rango y bloquear ese tiempo
                    </p>
                </div>

                {/* Panel lateral */}
                <div className="space-y-4">

                    {/* Próximas teleconsultas */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-[#052c46]/10 rounded-lg">
                                <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-sm font-black text-white">Próximas Teleconsultas</h3>
                        </div>

                        {proximas.length === 0 ? (
                            <p className="text-xs text-slate-400 font-bold text-center py-6">Sin citas próximas</p>
                        ) : (
                            <div className="space-y-2">
                                {proximas.map(c => {
                                    const fecha = parseISO(c.fecha_hora)
                                    const cfg = ESTADO_CONFIG[c.estado] ?? ESTADO_CONFIG.pendiente
                                    return (
                                        <div key={c.id} className="flex items-start gap-2 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all group">
                                            <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-white text-xs truncate flex items-center gap-1">
                                                    <User className="w-3 h-3 shrink-0" /> {c.paciente_nombre}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-500 mt-0.5 flex items-center gap-1 capitalize">
                                                    <Clock className="w-3 h-3 shrink-0" />
                                                    {format(fecha, "EEE d MMM · h:mm a", { locale: es })}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0 mt-1" />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Bloqueos próximos */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-rose-500/10 rounded-lg">
                                <CalendarOff className="w-4 h-4 text-rose-500" />
                            </div>
                            <h3 className="text-sm font-black text-white">Fechas Bloqueadas</h3>
                        </div>

                        {bloqueosProximos.length === 0 ? (
                            <p className="text-xs text-slate-400 font-bold text-center py-4">Sin bloqueos</p>
                        ) : (
                            <div className="space-y-2">
                                {bloqueosProximos.map(b => (
                                    <div key={b.id} className="flex items-center gap-2 p-3 bg-rose-50 rounded-xl border border-rose-100 group">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-white text-xs truncate">{b.motivo}</p>
                                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                                                {b.fecha_inicio === b.fecha_fin
                                                    ? format(parseISO(b.fecha_inicio), "d MMM", { locale: es })
                                                    : `${format(parseISO(b.fecha_inicio), "d MMM", { locale: es })} → ${format(parseISO(b.fecha_fin), "d MMM", { locale: es })}`
                                                }
                                                {!b.todo_el_dia && ` · ${b.hora_inicio?.slice(0,5)} - ${b.hora_fin?.slice(0,5)}`}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => deleteBloqueo(b.id)}
                                            className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Leyenda */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Leyenda</p>
                        <div className="space-y-1.5">
                            {Object.entries(ESTADO_CONFIG).map(([, cfg]) => (
                                <div key={cfg.label} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                                    <span className="text-xs font-bold text-slate-600">{cfg.label}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-400 shrink-0" />
                                <span className="text-xs font-bold text-slate-600">Bloqueado</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-200 shrink-0" />
                                <span className="text-xs font-bold text-slate-600">Festivo</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modal de bloqueo ── */}
            <AnimatePresence>
                {modalOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setModalOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="bg-[#0d1f33] border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-rose-100 rounded-2xl">
                                        <Ban className="w-5 h-5 text-rose-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white">Bloquear Tiempo</h3>
                                        <p className="text-xs font-bold text-slate-400">Cita presencial, viaje, reunión...</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Toggle todo el día */}
                                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                        <button
                                            onClick={() => setModalData(p => ({ ...p, todo_el_dia: true }))}
                                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${modalData.todo_el_dia ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            Todo el día
                                        </button>
                                        <button
                                            onClick={() => setModalData(p => ({ ...p, todo_el_dia: false }))}
                                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${!modalData.todo_el_dia ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            Horas específicas
                                        </button>
                                    </div>

                                    {/* Fechas */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Desde</label>
                                            <input type="date" value={modalData.fecha_inicio}
                                                onChange={e => setModalData(p => ({ ...p, fecha_inicio: e.target.value, fecha_fin: p.fecha_fin < e.target.value ? e.target.value : p.fecha_fin }))}
                                                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm font-bold text-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Hasta</label>
                                            <input type="date" value={modalData.fecha_fin}
                                                min={modalData.fecha_inicio}
                                                onChange={e => setModalData(p => ({ ...p, fecha_fin: e.target.value }))}
                                                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm font-bold text-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                                            />
                                        </div>
                                    </div>

                                    {/* Horas (si no es todo el día) */}
                                    <AnimatePresence>
                                        {!modalData.todo_el_dia && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="grid grid-cols-2 gap-3 overflow-hidden"
                                            >
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Hora inicio</label>
                                                    <input type="time" value={modalData.hora_inicio}
                                                        onChange={e => setModalData(p => ({ ...p, hora_inicio: e.target.value }))}
                                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm font-bold text-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Hora fin</label>
                                                    <input type="time" value={modalData.hora_fin}
                                                        onChange={e => setModalData(p => ({ ...p, hora_fin: e.target.value }))}
                                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm font-bold text-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Motivo */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Motivo *</label>
                                        <input
                                            type="text"
                                            value={modalData.motivo}
                                            onChange={e => setModalData(p => ({ ...p, motivo: e.target.value }))}
                                            placeholder="Ej: Cita consultorio, Congreso, Viaje..."
                                            autoFocus
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-slate-500 [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                                        />
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setModalOpen(false)}
                                            className="flex-1 h-12 border-2 border-slate-200 text-slate-500 font-black rounded-xl hover:bg-slate-50 transition-all text-sm"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={saveBloqueo}
                                            disabled={savingBloqueo || !modalData.motivo}
                                            className="flex-1 h-12 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            {savingBloqueo
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : <Save className="w-4 h-4" />
                                            }
                                            {savingBloqueo ? 'Guardando...' : 'Bloquear'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
