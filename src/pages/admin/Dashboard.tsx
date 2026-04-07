import {
    Users,
    Calendar,
    DollarSign,
    TrendingUp,
    BrainCircuit,
    Sparkles,
    Zap,
    ArrowUpRight,
    Eye,
    ScanLine,
    Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import SmartOdontogram from '@/components/admin/SmartOdontogram'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [realStats, setRealStats] = useState([
        { name: 'Red de Pacientes', value: '0', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+0%' },
        { name: 'Agendamiento Hoy', value: '0', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: 'Hoy' },
        { name: 'Hallazgos Aura', value: '0', icon: BrainCircuit, color: 'text-[#059669]', bg: 'bg-[#059669]/10', trend: 'Nuevos' },
        { name: 'Ingresos USD', value: '$0', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '+0%' },
    ])
    const [recentAppointments, setRecentAppointments] = useState<any[]>([])

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true)
            setError(null)
            try {
                // 1. Red de Pacientes (Conteo de la tabla consultas según solicitud del usuario)
                const patientRes = await supabase
                    .from('consultas')
                    .select('paciente_email', { count: 'exact', head: true })

                // 2. Citas de hoy (de la tabla consultas)
                const todayStart = new Date()
                todayStart.setHours(0, 0, 0, 0)
                const todayEnd = new Date()
                todayEnd.setHours(23, 59, 59, 999)

                const apptRes = await supabase
                    .from('consultas')
                    .select('*')
                    .gte('fecha_hora', todayStart.toISOString())
                    .lte('fecha_hora', todayEnd.toISOString())

                // 3. Hallazgos
                const findingsRes = await supabase
                    .from('odontogramas_pacientes')
                    .select('*', { count: 'exact', head: true })

                // 4. Ingresos (Suma de precio en consultas pagadas/completadas)
                const incomeRes = await supabase
                    .from('consultas')
                    .select('precio')
                    .in('estado', ['pagada', 'completada'])

                // Log de errores para diagnóstico
                if (patientRes.error) console.error("Error consultas (count):", patientRes.error)
                if (apptRes.error) console.error("Error agendamiento:", apptRes.error)
                if (findingsRes.error) console.error("Error hallazgos:", findingsRes.error)
                if (incomeRes.error) console.error("Error ingresos:", incomeRes.error)

                const totalIncome = incomeRes.data?.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0) || 0

                setRealStats([
                    { name: 'Red de Pacientes', value: (patientRes.count || 0).toLocaleString(), icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: 'Total' },
                    { name: 'Agendamiento Hoy', value: (apptRes.data?.length || 0).toString(), icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: 'Hoy' },
                    { name: 'Hallazgos Aura', value: (findingsRes.count || 0).toString(), icon: BrainCircuit, color: 'text-[#059669]', bg: 'bg-[#059669]/10', trend: 'IA' },
                    { name: 'Ingresos USD', value: `$${totalIncome.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: 'Cierre' },
                ])

                if (apptRes.data) setRecentAppointments(apptRes.data)

            } catch (err: any) {
                console.error("Error crítico dashboard:", err)
                setError(err.message || "Error de conexión con Supabase")
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-24"
        >
            {/* Elite Neural HUD Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="relative">
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
                    <div className="relative z-10">
                        <h2 className="text-4xl font-black text-[#052c46] tracking-tighter flex items-center gap-3">
                            Clínica <span className="text-emerald-500">Command Center</span>
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-black text-white bg-[#052c46] px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">{user?.user_metadata?.rol || 'ADMINISTRADOR'}</span>
                            <p className="text-sm font-bold text-slate-500 tracking-tight">{user?.user_metadata?.full_name || user?.email} <span className="text-emerald-500/40 ml-1">|</span> <span className="text-emerald-600">Sistema AURA IA Activo</span></p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl p-2 rounded-3xl border border-white shadow-xl luxury-shadow">
                    <div className="px-4 py-2 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Global Status</p>
                        <p className="text-xs font-bold text-emerald-700">{error ? 'System offline' : 'Real-time Data Active'}</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-600 font-bold text-sm text-center">
                    Aviso: {error}. La tabla 'consultas' u 'odontogramas_pacientes' podría no estar accesible.
                </div>
            )}

            {/* AI Neural Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {realStats.map((stat, idx) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative rounded-[2rem] border-white/50 bg-white/40 backdrop-blur-xl p-8 shadow-xl luxury-shadow border hover:border-emerald-500/30 transition-all duration-500 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl shadow-inner`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/10 shadow-sm">
                                <TrendingUp className="w-3 h-3" /> {stat.trend}
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.name}</p>
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                            ) : (
                                <div className="text-4xl font-black text-[#052c46] tracking-tighter group-hover:translate-x-1 transition-transform">{stat.value}</div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* MAIN AI WORKSPACE (Odontograma) */}
            <SmartOdontogram />

            {/* Intelligence Section */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* AI Agenda Feed Real */}
                <div className="lg:col-span-2 rounded-[2.5rem] bg-white/40 backdrop-blur-xl p-8 shadow-xl border border-white/40 luxury-shadow relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-10 pb-4 border-b border-slate-100/50">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xl">
                                <ScanLine className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Citas para Hoy</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    {recentAppointments.length > 0 ? `Sincronizado: ${recentAppointments.length} citas` : 'No hay citas agendadas hoy'}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost"
                            onClick={() => window.location.href = '/admin/agenda'}
                            className="rounded-xl text-xs font-black uppercase tracking-widest text-[#0F4C75] hover:bg-[#0F4C75]/5 flex items-center gap-2"
                        >
                            Ver Full Calendario <ArrowUpRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {recentAppointments.length === 0 && !loading && (
                            <div className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-sm">
                                Tranquilidad en la clínica: Sin citas hoy
                            </div>
                        )}
                        {recentAppointments.map((appt, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ x: 5 }}
                                className="flex items-center justify-between p-5 bg-white/50 border border-white rounded-[1.5rem] hover:bg-emerald-50/50 hover:border-emerald-500/10 transition-all luxury-shadow group/item"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-slate-100 to-white flex items-center justify-center font-black text-primary border border-slate-200 text-xl shadow-inner group-hover/item:rotate-6 transition-transform">
                                        {appt.paciente_nombre ? appt.paciente_nombre[0] : 'P'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-black text-slate-800 tracking-tight">{appt.paciente_nombre || 'Paciente'}</p>
                                            <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest border shadow-sm ${appt.estado === 'pagada' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10' : 'bg-amber-500/10 text-amber-600 border-amber-500/10'
                                                }`}>
                                                {appt.estado}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{appt.motivo || 'Teleconsulta'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 justify-end mb-1">
                                        <Zap className="w-4 h-4 text-emerald-500" />
                                        <p className="text-lg font-black text-[#0F4C75] tracking-tight">{appt.fecha_hora ? new Date(appt.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* AI Creative Sidebar */}
                <div className="space-y-8">
                    <div className="rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-teal-800 p-8 text-white shadow-2xl relative overflow-hidden luxury-shadow">
                        <div className="relative z-10">
                            <Sparkles className="w-12 h-12 mb-6 text-emerald-300 drop-shadow-[0_0_10px_rgba(110,231,183,0.5)]" />
                            <h4 className="text-2xl font-black mb-2 tracking-tighter">Smile Design IA</h4>
                            <p className="text-sm font-bold text-emerald-100 mb-8 leading-relaxed opacity-80">
                                La creatividad dental ahora es digital e hiper-realista con DALL-E 3.
                            </p>
                            <Button
                                onClick={() => window.location.href = '/admin/before-after'}
                                className="w-full h-14 bg-white text-emerald-900 hover:bg-emerald-50 font-black rounded-3xl shadow-xl transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Eye className="w-5 h-5" /> INICIAR SIMULADOR
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] bg-[#052c46] p-8 text-white shadow-2xl relative overflow-hidden luxury-shadow border border-white/10">
                        <p className="text-xs font-bold text-slate-400 mb-4">Módulo de IA conectado a Claude 3.5 Sonnet.</p>
                        <Button variant="link" className="text-emerald-400 font-bold p-0 flex items-center gap-2 hover:text-emerald-300 transition-colors uppercase text-[10px] tracking-widest">
                            Estado del Sistema: Óptimo <ArrowUpRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
