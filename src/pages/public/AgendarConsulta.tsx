import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, ChevronLeft, CreditCard, Stethoscope, Mail, Phone, User } from 'lucide-react'
import { format, addDays, isWeekend, setHours, setMinutes, startOfToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'

const PRECIO_CONSULTA = 50.00;

export default function AgendarConsulta() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [step, setStep] = useState(1)

    // Form data
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        motivo: '',
    })

    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    // Generar próximos 14 días (omitiendo fines de semana para el ejemplo)
    const availableDates = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i + 1)).filter(d => !isWeekend(d)).slice(0, 5)

    // Horarios disponibles: 9:00 a 17:00 en intervalos de 30 mins
    const availableSlots = Array.from({ length: 17 }).map((_, i) => {
        const hour = Math.floor(i / 2) + 9
        const minute = i % 2 === 0 ? '00' : '30'
        return `${hour.toString().padStart(2, '0')}:${minute}`
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedDate || !selectedTime) {
            setError("Por favor selecciona una fecha y hora.")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const [hours, minutes] = selectedTime.split(':').map(Number)
            const fechaHora = setMinutes(setHours(selectedDate, hours), minutes)

            // Invocar la Edge Function para crear room, tokens y payment intent
            const { data, error: fnError } = await supabase.functions.invoke('crear-consulta', {
                body: {
                    paciente_nombre: formData.nombre,
                    paciente_email: formData.email,
                    paciente_telefono: formData.telefono,
                    motivo: formData.motivo,
                    fecha_hora: fechaHora.toISOString(),
                    precio: PRECIO_CONSULTA
                }
            })

            if (fnError || data?.error) throw new Error(fnError?.message || data?.error || 'Error al procesar')

            if (data.consulta_id) {
                // Navegar a la página de pago de Wompi pasando el id
                navigate(`/pagar/${data.consulta_id}`)
            } else {
                throw new Error("Respuesta inválida del servidor (Falta consulta_id)")
            }

        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Ocurrió un error al agendar la cita. Por favor intenta de nuevo.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col">
            {/* Header Mini */}
            <header className="bg-white border-b border-slate-100 py-4 px-6 flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => step === 2 ? setStep(1) : navigate('/')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <img src="/logo.jpg" alt="Logo" className="h-6 w-auto" />
                    <span className="font-black text-slate-800 tracking-tight text-sm">DENTAL EXPRESSION</span>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full p-6 md:p-8 flex flex-col gap-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Agendar Teleconsulta</h1>
                    <p className="text-slate-500 font-medium">Completa tus datos para reservar tu espacio con la Dra. Nataly.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {/* Progress Bar */}
                    <div className="flex bg-slate-50 border-b border-slate-100">
                        <div className={`flex-1 py-4 text-center text-xs font-black uppercase tracking-widest ${step === 1 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}>
                            1. Información
                        </div>
                        <div className={`flex-1 py-4 text-center text-xs font-black uppercase tracking-widest border-l border-slate-100 ${step === 2 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}>
                            2. Fecha y Hora
                        </div>
                    </div>

                    <div className="p-6 md:p-10">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><User className="w-3 h-3" /> Nombre Completo</label>
                                            <Input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej. Juan Pérez" className="h-14 rounded-2xl bg-slate-50 border-slate-200" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Mail className="w-3 h-3" /> Correo Electrónico</label>
                                            <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" className="h-14 rounded-2xl bg-slate-50 border-slate-200" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Phone className="w-3 h-3" /> Teléfono</label>
                                            <Input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+57 300..." className="h-14 rounded-2xl bg-slate-50 border-slate-200" required />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Stethoscope className="w-3 h-3" /> Motivo de la Consulta</label>
                                            <textarea name="motivo" value={formData.motivo} onChange={handleChange} placeholder="Cuéntanos brevemente qué necesitas..." className="w-full min-h-[120px] p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-y" required />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (formData.nombre && formData.email && formData.motivo) setStep(2)
                                            else setError("Por favor completa los campos principales.")
                                        }}
                                        className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 mt-8"
                                    >
                                        Elegir Horario <ChevronRight className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    {/* Dates */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><CalendarIcon className="w-3 h-3" /> Días Disponibles</label>
                                        <div className="flex flex-wrap gap-3">
                                            {availableDates.map((date, i) => {
                                                const isSelected = selectedDate?.toDateString() === date.toDateString();
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedDate(date)}
                                                        className={`flex flex-col items-center justify-center px-5 py-3 rounded-2xl border-2 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white hover:border-slate-300 text-slate-600'}`}
                                                    >
                                                        <span className="text-xs font-bold uppercase">{format(date, 'eee', { locale: es })}</span>
                                                        <span className="text-xl font-black">{format(date, 'dd')}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Times */}
                                    <div className={`space-y-4 transition-opacity duration-300 ${!selectedDate ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Clock className="w-3 h-3" /> Horarios</label>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                            {availableSlots.map(time => {
                                                const isSelected = selectedTime === time;
                                                return (
                                                    <button
                                                        key={time}
                                                        onClick={() => setSelectedTime(time)}
                                                        className={`py-2 rounded-xl text-sm font-bold transition-all border-2 ${isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                                                    >
                                                        {time}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Summary & Submit */}
                                    <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <div className="text-center sm:text-left">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                                            <p className="text-3xl font-black text-slate-800">${PRECIO_CONSULTA.toFixed(2)} USD</p>
                                        </div>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading || !selectedDate || !selectedTime}
                                            className="w-full sm:w-auto px-8 h-14 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            {loading ? 'Procesando...' : 'Continuar al Pago'} <CreditCard className="w-5 h-5" />
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

function ChevronRight({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
}
