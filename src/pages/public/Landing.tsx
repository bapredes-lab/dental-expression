import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, Video, ShieldCheck, ArrowRight } from 'lucide-react'

export default function Landing() {
    return (
        <div className="min-h-screen bg-[#052c46] overflow-hidden relative selection:bg-emerald-500/30">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#059669]/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#0F4C75]/40 rounded-full blur-[150px]" />

            {/* Navbar */}
            <nav className="relative z-10 px-6 py-6 max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-2xl shadow-lg ring-4 ring-white/10 shrink-0">
                        <img src="/logo.jpg" alt="Logo" className="h-8 w-auto object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span translate="no" className="text-sm font-black tracking-tighter text-white whitespace-nowrap">DENTAL EXPRESSION</span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest whitespace-nowrap">Dra. Nataly Vargas</span>
                    </div>
                </div>
                <Link to="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
                    Acceso Médico
                </Link>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl space-y-8"
                >
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-4">
                        <Video className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300 tracking-widest uppercase">
                            Nueva Teleconsulta Premium
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
                        Valoración dental desde casa. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                            Sin filas, sin espera.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
                        Conéctate directamente con la Dra. Nataly Vargas a través de nuestra plataforma de videollamada segura. Recibe un diagnóstico experto y un plan de tratamiento sin salir de tu hogar.
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            to="/agendar"
                            className="w-full sm:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black rounded-full transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                        >
                            Agendar mi consulta
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <div className="flex flex-col text-left">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Inversión</span>
                            <span className="text-2xl font-black text-white">$50.00 USD</span>
                        </div>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-24"
                >
                    {[
                        { icon: Calendar, title: "Agenda Flexible", desc: "Elige el horario que mejor se adapte a tu día." },
                        { icon: Video, title: "Alta Definición", desc: "Plataforma integrada sin necesidad de descargar apps." },
                        { icon: ShieldCheck, title: "Pago Seguro", desc: "Procesado por Stripe, máxima seguridad garantizada." }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm text-left hover:bg-white/10 transition-colors">
                            <feature.icon className="w-8 h-8 text-emerald-400 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </main>
        </div>
    )
}
