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
    ScanLine
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import SmartOdontogram from '@/components/admin/SmartOdontogram'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminDashboard() {
    const { user } = useAuth()
    const stats = [
        { name: 'Red de Pacientes', value: '1,284', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+12%' },
        { name: 'Agendamiento IA', value: '18', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: 'Hoy' },
        { name: 'Hallazgos Aura', value: '45', icon: BrainCircuit, color: 'text-[#059669]', bg: 'bg-[#059669]/10', trend: 'Nuevos' },
        { name: 'Proyección USD', value: '$12,450', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '+8%' },
    ]

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
                            <span className="text-[10px] font-black text-white bg-[#052c46] px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">DIRECTOR CLÍNICO</span>
                            <p className="text-sm font-bold text-slate-500 tracking-tight">{user?.user_metadata?.full_name || 'Dra. Nataly Vargas'} <span className="text-emerald-500/40 ml-1">|</span> <span className="text-emerald-600">Sistema AURA IA Activo</span></p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl p-2 rounded-3xl border border-white shadow-xl luxury-shadow">
                    <div className="flex -space-x-3 ml-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-10 w-10 rounded-2xl bg-slate-200 border-4 border-white ring-2 ring-emerald-500/20" />
                        ))}
                    </div>
                    <div className="px-4 py-2 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Status Online</p>
                        <p className="text-xs font-bold text-emerald-700">6 Odontólogos Activos</p>
                    </div>
                </div>
            </div>

            {/* AI Neural Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative rounded-[2rem] border-white/50 bg-white/40 backdrop-blur-xl p-8 shadow-xl luxury-shadow border hover:border-emerald-500/30 transition-all duration-500 overflow-hidden"
                    >
                        {/* Decorative Neural Pattern */}
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                            <TrendingUp className="w-24 h-24" />
                        </div>

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
                            <div className="text-4xl font-black text-[#052c46] tracking-tighter group-hover:translate-x-1 transition-transform">{stat.value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* MAIN AI WORKSPACE (Odontograma) */}
            <SmartOdontogram />

            {/* Intelligence Section */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* AI Agenda Feed */}
                <div className="lg:col-span-2 rounded-[2.5rem] bg-white/40 backdrop-blur-xl p-8 shadow-xl border border-white/40 luxury-shadow relative overflow-hidden group">
                    {/* Glass Overlay for depth */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-3xl group-hover:bg-emerald-400/10 transition-colors" />

                    <div className="flex items-center justify-between mb-10 pb-4 border-b border-slate-100/50">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xl">
                                <ScanLine className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Agenda Predictiva</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">Optimizado por AURA IA</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="rounded-xl text-xs font-black uppercase tracking-widest text-[#0F4C75] hover:bg-[#0F4C75]/5 flex items-center gap-2">
                            Ver Full Calendario <ArrowUpRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { patient: 'Pamela Flores', time: '09:00 AM', procedure: 'Ortodoncia Digital', status: 'confirmada', ia: 'Alta Retención' },
                            { patient: 'Ricardo Sosa', time: '10:30 AM', procedure: 'Implante Aura-Z', status: 'confirmada', ia: 'Caso Complejo' },
                            { patient: 'Lucía Méndez', time: '02:00 PM', procedure: 'Scan Intraoral', status: 'pendiente', ia: 'Nueva Diagnóstico' },
                        ].map((appt, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ x: 5 }}
                                className="flex items-center justify-between p-5 bg-white/50 border border-white rounded-[1.5rem] hover:bg-emerald-50/50 hover:border-emerald-500/10 transition-all luxury-shadow group/item"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-slate-100 to-white flex items-center justify-center font-black text-primary border border-slate-200 text-xl shadow-inner group-hover/item:rotate-6 transition-transform">
                                        {appt.patient[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-black text-slate-800 tracking-tight">{appt.patient}</p>
                                            <span className="text-[8px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md font-black uppercase tracking-widest border border-emerald-500/10 shadow-sm">{appt.ia}</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{appt.procedure}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 justify-end mb-1">
                                        <Zap className="w-4 h-4 text-emerald-500" />
                                        <p className="text-lg font-black text-[#0F4C75] tracking-tight">{appt.time}</p>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proceder al Box 01</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* AI Creative Sidebar */}
                <div className="space-y-8">
                    <div className="rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-teal-800 p-8 text-white shadow-2xl relative overflow-hidden luxury-shadow">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                            transition={{ duration: 15, repeat: Infinity }}
                            className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-[80px]"
                        />
                        <div className="relative z-10">
                            <Sparkles className="w-12 h-12 mb-6 text-emerald-300 drop-shadow-[0_0_10px_rgba(110,231,183,0.5)]" />
                            <h4 className="text-2xl font-black mb-2 tracking-tighter">Smile Design IA</h4>
                            <p className="text-sm font-bold text-emerald-100 mb-8 leading-relaxed opacity-80">
                                La creatividad dental ahora es digital. Genera simulaciones hiper-realistas para tus pacientes en segundos.
                            </p>
                            <Button className="w-full h-14 bg-white text-emerald-900 hover:bg-emerald-50 font-black rounded-3xl shadow-xl transition-all active:scale-95 flex items-center gap-2">
                                <Eye className="w-5 h-5" /> INICIAR SIMULADOR
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] bg-[#052c46] p-8 text-white shadow-2xl relative overflow-hidden luxury-shadow border border-white/10">
                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/5">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-xl bg-slate-800 border-2 border-[#052c46]" />)}
                            </div>
                            <p className="text-xs font-bold text-slate-400">Dra. Nataly y su equipo están analizando casos complejos hoy.</p>
                        </div>
                        <Button variant="link" className="text-emerald-400 font-bold p-0 flex items-center gap-2 hover:text-emerald-300 transition-colors uppercase text-[10px] tracking-widest">
                            Ir a la Galería Médica <ArrowUpRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
