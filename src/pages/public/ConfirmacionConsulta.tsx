import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, Calendar, Clock, Video, Info } from 'lucide-react'
import { format, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'

export default function ConfirmacionConsulta() {
    const { consultaId } = useParams()
    const navigate = useNavigate()
    const [consulta, setConsulta] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchConsulta() {
            if (!consultaId) return navigate('/')

            const { data, error } = await supabase
                .from('consultas')
                .select('*')
                .eq('id', consultaId)
                .single()

            if (error || !data) {
                navigate('/')
            } else {
                setConsulta(data)
            }
            setLoading(false)
        }
        fetchConsulta()
    }, [consultaId, navigate])

    // Calcular estado del botón (Activo si estamos entre 15 min antes y 60 min después)
    const [, setMsRevisar] = useState(0)

    // Refresh the check every minute
    useEffect(() => {
        const interval = setInterval(() => setMsRevisar(Date.now()), 60000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
            </div>
        )
    }

    if (!consulta) return null

    const fechaCita = new Date(consulta.fecha_hora)
    const minutosDiferencia = differenceInMinutes(fechaCita, new Date())

    // Se habilita 15 mins antes, expira 60 mins después de la hora
    const isActive = minutosDiferencia <= 15 && minutosDiferencia >= -60
    const isPast = minutosDiferencia < -60

    return (
        <div className="min-h-screen bg-[#f8fafc] py-12 px-6 flex items-center justify-center">
            <div className="max-w-2xl w-full">

                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20 ring-8 ring-white">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">¡Reserva Confirmada!</h1>
                    <p className="text-slate-500 font-medium text-lg">Tu teleconsulta ha sido agendada con éxito.</p>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 mb-8 space-y-8 relative overflow-hidden">
                    {/* Deco Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-[100%] -z-10" />

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#052c46] rounded-2xl flex items-center justify-center text-white shrink-0">
                            <span className="font-black text-xl">{consulta.paciente_nombre.charAt(0)}</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#059669]">Paciente</p>
                            <p className="font-bold text-lg text-slate-800">{consulta.paciente_nombre}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <Calendar className="w-5 h-5 text-slate-400 mb-2" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha</p>
                            <p className="font-black text-slate-700 capitalize">{format(fechaCita, 'EEEE, d MMM yyyy', { locale: es })}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <Clock className="w-5 h-5 text-slate-400 mb-2" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Hora</p>
                            <p className="font-black text-slate-700">{format(fechaCita, 'h:mm a')}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3 text-orange-800">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-bold mb-1">Guarda esta página</p>
                            <p className="font-medium opacity-80">El botón inferior se habilitará automáticamente 15 minutos antes de tu cita. No necesitas descargar nada, la videollamada es desde el navegador.</p>
                        </div>
                    </div>
                </div>

                {isPast ? (
                    <div className="text-center p-6 bg-slate-100 text-slate-500 rounded-2xl font-bold border border-slate-200">
                        Esta consulta ya ha finalizado.
                    </div>
                ) : (
                    <button
                        onClick={() => isActive && navigate(`/consulta/${consulta.id}`)}
                        disabled={!isActive}
                        className="w-full h-16 bg-[#052c46] hover:bg-[#0A3D62] disabled:bg-slate-200 disabled:text-slate-400 disabled:opacity-100 text-white font-black rounded-2xl transition-all shadow-xl shadow-[#052c46]/20 flex items-center justify-center gap-3 relative overflow-hidden group"
                    >
                        {!isActive ? (
                            <>
                                <Clock className="w-5 h-5" />
                                Disponible en {minutosDiferencia - 15} minutos
                            </>
                        ) : (
                            <>
                                <span className="relative z-10 flex items-center gap-3">
                                    <Video className="w-6 h-6" /> Unirme a la Consulta
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-[#0A3D62] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}
