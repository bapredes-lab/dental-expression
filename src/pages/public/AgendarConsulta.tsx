import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar as CalendarIcon, Clock, ChevronLeft, CreditCard,
    Stethoscope, Mail, Phone, User, Loader2, CheckCircle2, Ban
} from 'lucide-react'
import { format, addDays, startOfToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'

const PRECIO_CONSULTA = 50.00
const DURACION_SLOT_MIN = 30

// ── Helpers ──────────────────────────────────────────────────────────────────

function generarSlots(horaInicio: string, horaFin: string): string[] {
    const [sh, sm] = horaInicio.split(':').map(Number)
    const [eh, em] = horaFin.split(':').map(Number)
    const slots: string[] = []
    let mins = sh * 60 + sm
    const fin = eh * 60 + em
    while (mins + DURACION_SLOT_MIN <= fin) {
        const h = Math.floor(mins / 60).toString().padStart(2, '0')
        const m = (mins % 60).toString().padStart(2, '0')
        slots.push(`${h}:${m}`)
        mins += DURACION_SLOT_MIN
    }
    return slots
}

function dateToStr(date: Date) {
    return format(date, 'yyyy-MM-dd')
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

type HorarioDia = { dia_semana: number; hora_inicio: string; hora_fin: string; activo: boolean }
type Bloqueo = { fecha_inicio: string; fecha_fin: string }

// ── Componente principal ──────────────────────────────────────────────────────

export default function AgendarConsulta() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form
    const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', motivo: '' })

    // Disponibilidad
    const [horarios, setHorarios] = useState<HorarioDia[]>([])
    const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(true)

    // Selección
    const [fechasDisponibles, setFechasDisponibles] = useState<Date[]>([])
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [slotsDisponibles, setSlotsDisponibles] = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    // ── Cargar disponibilidad al montar ──────────────────────────────────────

    useEffect(() => {
        async function cargarDisponibilidad() {
            setLoadingDisponibilidad(true)
            const hoy = startOfToday()
            const en30dias = dateToStr(addDays(hoy, 30))

            const [{ data: horarioData }, { data: bloqueoData }] = await Promise.all([
                supabase.from('horario_semanal').select('dia_semana, hora_inicio, hora_fin, activo'),
                supabase.from('bloqueos_agenda').select('fecha_inicio, fecha_fin')
                    .lte('fecha_inicio', en30dias)
                    .gte('fecha_fin', dateToStr(hoy)),
            ])

            const h: HorarioDia[] = horarioData || []
            const b: Bloqueo[] = bloqueoData || []
            setHorarios(h)

            // Calcular los próximos días disponibles (máx 14)
            const disponibles: Date[] = []
            for (let i = 1; i <= 30 && disponibles.length < 14; i++) {
                const fecha = addDays(hoy, i)
                const diaSemana = fecha.getDay()
                const horarioDia = h.find(x => x.dia_semana === diaSemana)
                if (!horarioDia?.activo) continue

                const fechaStr = dateToStr(fecha)
                const bloqueado = b.some(blq => fechaStr >= blq.fecha_inicio && fechaStr <= blq.fecha_fin)
                if (bloqueado) continue

                disponibles.push(fecha)
            }

            setFechasDisponibles(disponibles)
            setLoadingDisponibilidad(false)
        }
        cargarDisponibilidad()
    }, [])

    // ── Cargar slots al seleccionar fecha ────────────────────────────────────

    useEffect(() => {
        if (!selectedDate) return
        setSelectedTime(null)
        setSlotsDisponibles([])

        async function cargarSlots() {
            setLoadingSlots(true)
            const diaSemana = selectedDate!.getDay()
            const horarioDia = horarios.find(h => h.dia_semana === diaSemana)

            if (!horarioDia?.activo) {
                setLoadingSlots(false)
                return
            }

            const fechaStr = dateToStr(selectedDate!)
            const { data: consultasData } = await supabase
                .from('consultas')
                .select('fecha_hora')
                .gte('fecha_hora', `${fechaStr}T00:00:00`)
                .lte('fecha_hora', `${fechaStr}T23:59:59`)
                .neq('estado', 'cancelada')

            const reservados = new Set(
                (consultasData || []).map(c => format(new Date(c.fecha_hora), 'HH:mm'))
            )

            const todos = generarSlots(horarioDia.hora_inicio, horarioDia.hora_fin)
            setSlotsDisponibles(todos.filter(s => !reservados.has(s)))
            setLoadingSlots(false)
        }
        cargarSlots()
    }, [selectedDate, horarios])

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError(null)
    }

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime) {
            setError('Por favor selecciona una fecha y hora.')
            return
        }
        setLoading(true)
        setError(null)
        try {
            const [hours, minutes] = selectedTime.split(':').map(Number)
            const fechaHora = new Date(selectedDate)
            fechaHora.setHours(hours, minutes, 0, 0)

            const { data, error: fnError } = await supabase.functions.invoke('crear-consulta', {
                body: {
                    paciente_nombre: formData.nombre,
                    paciente_email: formData.email,
                    paciente_telefono: formData.telefono,
                    motivo: formData.motivo,
                    fecha_hora: fechaHora.toISOString(),
                    precio: PRECIO_CONSULTA,
                }
            })

            if (fnError || data?.error) throw new Error(fnError?.message || data?.error)
            if (data?.consulta_id) {
                navigate(`/pagar/${data.consulta_id}`)
            } else {
                throw new Error('Respuesta inválida del servidor')
            }
        } catch (err: any) {
            setError(err.message || 'Error al agendar. Intenta de nuevo.')
            setLoading(false)
        }
    }

    // ── UI ────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 py-4 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <button
                    onClick={() => step === 2 ? setStep(1) : navigate('/')}
                    className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <img src="/logo.jpg" alt="Logo" className="h-6 w-auto" />
                    <span className="font-black text-slate-800 tracking-tight text-sm">DENTAL EXPRESSION</span>
                </div>
                <div className="w-10" />
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full p-6 md:p-8 flex flex-col gap-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Agendar Teleconsulta</h1>
                    <p className="text-slate-500 font-medium">Completa tus datos para reservar tu espacio con la Dra. Nataly.</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {/* Progress */}
                    <div className="flex bg-slate-50 border-b border-slate-100">
                        <div className={`flex-1 py-4 text-center text-xs font-black uppercase tracking-widest transition-colors ${step === 1 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}>
                            1. Información
                        </div>
                        <div className={`flex-1 py-4 text-center text-xs font-black uppercase tracking-widest border-l border-slate-100 transition-colors ${step === 2 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}>
                            2. Fecha y Hora
                        </div>
                    </div>

                    <div className="p-6 md:p-10">
                        <AnimatePresence mode="wait">

                            {/* ── Step 1: Datos del paciente ── */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <User className="w-3 h-3" /> Nombre Completo
                                            </label>
                                            <Input
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                                placeholder="Ej. Juan Pérez"
                                                className="h-14 rounded-2xl bg-slate-50 border-slate-200"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Mail className="w-3 h-3" /> Correo Electrónico
                                            </label>
                                            <Input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="correo@ejemplo.com"
                                                className="h-14 rounded-2xl bg-slate-50 border-slate-200"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Phone className="w-3 h-3" /> Teléfono
                                            </label>
                                            <Input
                                                type="tel"
                                                name="telefono"
                                                value={formData.telefono}
                                                onChange={handleChange}
                                                placeholder="+57 300..."
                                                className="h-14 rounded-2xl bg-slate-50 border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Stethoscope className="w-3 h-3" /> Motivo de la Consulta
                                            </label>
                                            <textarea
                                                name="motivo"
                                                value={formData.motivo}
                                                onChange={handleChange}
                                                placeholder="Cuéntanos brevemente qué necesitas..."
                                                className="w-full min-h-[120px] p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-y"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (!formData.nombre || !formData.email || !formData.motivo) {
                                                setError('Por favor completa nombre, correo y motivo.')
                                            } else {
                                                setError(null)
                                                setStep(2)
                                            }
                                        }}
                                        className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 mt-8"
                                    >
                                        Elegir Horario <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── Step 2: Fecha y hora ── */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    {/* Fechas disponibles */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <CalendarIcon className="w-3 h-3" /> Días Disponibles
                                        </label>

                                        {loadingDisponibilidad ? (
                                            <div className="flex items-center gap-3 py-4 text-slate-400">
                                                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                                <span className="text-sm font-bold">Consultando agenda...</span>
                                            </div>
                                        ) : fechasDisponibles.length === 0 ? (
                                            <div className="flex items-center gap-3 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                                                <Ban className="w-5 h-5 text-amber-500 shrink-0" />
                                                <p className="text-sm font-bold text-amber-700">
                                                    No hay fechas disponibles en los próximos 30 días. Contáctanos directamente.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-3">
                                                {fechasDisponibles.map((date, i) => {
                                                    const isSelected = selectedDate?.toDateString() === date.toDateString()
                                                    return (
                                                        <motion.button
                                                            key={i}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: i * 0.03 }}
                                                            onClick={() => setSelectedDate(date)}
                                                            className={`flex flex-col items-center justify-center px-5 py-3 rounded-2xl border-2 transition-all ${
                                                                isSelected
                                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-500/20'
                                                                    : 'border-slate-100 bg-white hover:border-slate-300 text-slate-600'
                                                            }`}
                                                        >
                                                            <span className="text-xs font-bold uppercase">{format(date, 'eee', { locale: es })}</span>
                                                            <span className="text-xl font-black">{format(date, 'dd')}</span>
                                                            <span className="text-[9px] font-bold opacity-60 uppercase">{format(date, 'MMM', { locale: es })}</span>
                                                            {isSelected && <CheckCircle2 className="w-3 h-3 mt-1 text-emerald-500" />}
                                                        </motion.button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Slots de hora */}
                                    <div className={`space-y-4 transition-opacity duration-300 ${!selectedDate ? 'opacity-30 pointer-events-none' : ''}`}>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> Horarios Disponibles
                                        </label>

                                        {loadingSlots ? (
                                            <div className="flex items-center gap-3 py-4 text-slate-400">
                                                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                                <span className="text-sm font-bold">Buscando horarios libres...</span>
                                            </div>
                                        ) : selectedDate && slotsDisponibles.length === 0 ? (
                                            <div className="flex items-center gap-3 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                                                <Ban className="w-5 h-5 text-amber-500 shrink-0" />
                                                <p className="text-sm font-bold text-amber-700">
                                                    No quedan horarios disponibles para este día. Selecciona otra fecha.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                                <AnimatePresence>
                                                    {slotsDisponibles.map((time, i) => {
                                                        const isSelected = selectedTime === time
                                                        return (
                                                            <motion.button
                                                                key={time}
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: i * 0.02 }}
                                                                onClick={() => setSelectedTime(time)}
                                                                className={`py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                                                                    isSelected
                                                                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600'
                                                                }`}
                                                            >
                                                                {time}
                                                            </motion.button>
                                                        )
                                                    })}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>

                                    {/* Resumen y pagar */}
                                    <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <div className="text-center sm:text-left">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                                            <p className="text-3xl font-black text-slate-800">${PRECIO_CONSULTA.toFixed(2)} <span className="text-sm text-slate-400">USD</span></p>
                                            {selectedDate && selectedTime && (
                                                <p className="text-xs text-emerald-600 font-bold mt-1 capitalize">
                                                    {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })} a las {selectedTime}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading || !selectedDate || !selectedTime}
                                            className="w-full sm:w-auto px-8 h-14 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            {loading
                                                ? <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                                                : <><CreditCard className="w-5 h-5" /> Continuar al Pago</>
                                            }
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    )
}

function ChevronRightIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={className}>
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}
