import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    Calendar, Video, ShieldCheck, ArrowRight, Star, Quote,
    CheckCircle2, Clock, Globe, Laptop, Smartphone, Briefcase
} from 'lucide-react'

const mockReviews = [
    { id: 1, patient: 'Isabella Rodriguez', date: '24 Feb 2026', rating: 5, comment: 'Excelente atención de la Dra. Vargas. El simulador IA me ayudó a decidir mi tratamiento.' },
    { id: 2, patient: 'Mateo Sánchez', date: '20 Feb 2026', rating: 5, comment: 'Muy profesional todo el equipo. Mis resultados fueron mejores de lo esperado.' },
    { id: 3, patient: 'Valentina López', date: '15 Feb 2026', rating: 5, comment: 'La tecnología que usan es impresionante. Me sentí en el futuro.' },
]

const features = [
    {
        icon: Globe,
        title: "Global Reach",
        desc: "Tu valoración dental premium desde cualquier parte del mundo."
    },
    {
        icon: ShieldCheck,
        title: "Confidencialidad",
        desc: "Cifrado de grado médico en cada videollamada para tu tranquilidad."
    },
    {
        icon: Clock,
        title: "Sin Esperas",
        desc: "Elimina los desplazamientos y espera cómodamente desde casa."
    }
]

const steps = [
    { id: "01", title: "Reserva", desc: "Elige tu horario ideal en el calendario dinámico." },
    { id: "02", title: "Conecta", desc: "Recibe el link de acceso a tu suite dental virtual." },
    { id: "03", title: "Transforma", desc: "Obtén tu diagnóstico IA y plan de tratamiento." }
]

export default function Landing() {
    return (
        <div className="min-h-screen bg-[#052c46] text-white selection:bg-emerald-500/30 font-sans overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[150px]" />
                <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-teal-400/5 rounded-full blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#052c46]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-1.5 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            <img src="/logo.jpg" alt="Logo" className="h-7 w-auto object-contain rounded-lg" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black tracking-widest text-white leading-none">DENTAL EXPRESSION</span>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">Dra. Nataly Vargas</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <a href="#proceso" className="hover:text-emerald-400 transition-colors">El Proceso</a>
                            <a href="#reseñas" className="hover:text-emerald-400 transition-colors">Reseñas</a>
                            <a href="#experta" className="hover:text-emerald-400 transition-colors">La Experta</a>
                        </div>
                        <Link to="/login" className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                            <Briefcase className="w-3 h-3 text-emerald-400" />
                            Acceso Médico
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 z-0 pointer-events-none opacity-20 blur-sm"
                >
                    <img src="/hero-bg.png" alt="Visual effect" className="w-full h-full object-cover transform rotate-1 scale-110" />
                    {/* Dark Overlay to improve contrast */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#052c46] via-[#052c46]/60 to-[#052c46] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
                </motion.div>

                <div className="relative z-10 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-full mb-8 backdrop-blur-md"
                    >
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="text-[10px] font-black text-emerald-300 tracking-[0.2em] uppercase">
                            Nueva Teleconsulta Premium
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                    >
                        Reinventando tu <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 animate-gradient-x">
                            Salud Dental
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg md:text-xl text-slate-100 font-semibold max-w-2xl mx-auto mb-12 leading-relaxed drop-shadow-md"
                    >
                        Experimenta el futuro de la odontología. Una suite virtual de alta gama diseñada para ofrecerte una valoración precisa, profesional y segura sin salir de tu hogar.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-8"
                    >
                        <Link
                            to="/agendar"
                            className="group w-full sm:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black rounded-full transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(16,185,129,0.3)] relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Agendar mi consulta
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                        <div className="flex flex-col text-left border-l-2 border-emerald-500/50 pl-8">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Inversión Ética</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white drop-shadow-lg">$50.00</span>
                                <span className="text-sm font-bold text-emerald-400 uppercase">USD</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Steps Section */}
            <section id="proceso" className="py-32 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="group relative"
                        >
                            <div className="absolute -top-6 -left-4 text-8xl font-black text-white/5 select-none">{step.id}</div>
                            <div className="relative z-10 bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-sm group-hover:bg-white/10 transition-all duration-500 hover:translate-y-[-8px]">
                                <h3 className="text-2xl font-black mb-4 tracking-tight">{step.title}</h3>
                                <p className="text-slate-400 leading-relaxed font-medium">{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div key={i} className="flex flex-col items-center text-center p-8 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                                <feature.icon className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h4 className="text-lg font-black mb-2">{feature.title}</h4>
                            <p className="text-sm text-slate-400 font-medium">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Expert Profile Section */}
            <section id="experta" className="py-32 px-6 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 bg-emerald-500/20 blur-[100px] rounded-full" />
                        <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl luxury-shadow aspect-[4/5]">
                            <img src="/doctor-nataly.png" alt="Dra. Nataly Vargas" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute bottom-8 -right-8 bg-emerald-500 px-8 py-6 rounded-3xl shadow-xl hidden md:block">
                            <Star className="w-8 h-8 text-white mb-2" />
                            <div className="text-2xl font-black text-slate-900">12+</div>
                            <div className="text-[10px] font-black text-slate-900/60 uppercase tracking-widest whitespace-nowrap">Años de Experticia</div>
                        </div>
                    </motion.div>

                    <div className="space-y-10">
                        <div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 block">La Diferencia es el Conocimiento</span>
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-6">
                                Dra. Nataly Vargas
                            </h2>
                            <p className="text-xl text-slate-400 font-medium leading-relaxed italic">
                                "Mi misión es democratizar el acceso a la excelencia dental, combinando tecnología de vanguardia con un trato profundamente humano."
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                "Especialista en Rehabilitación Oral",
                                "Experta en Inteligencia Dental IA",
                                "Certificación Internacional",
                                "Speaker & Conferencista"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    <span className="text-sm font-bold text-slate-200">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6">
                            <div className="flex gap-12">
                                <div>
                                    <div className="text-3xl font-black text-white">5k+</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pacientes Felices</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-white">99%</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Satisfacción</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section id="reseñas" className="py-32 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20 text-balance">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 block">Testimonios Reales</span>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">Lo que dicen mis pacientes</h2>
                    <p className="text-slate-400 font-medium max-w-xl mx-auto text-lg">La confianza es la base de cada sonrisa exitosa que construimos juntos.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {mockReviews.map((review, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/[0.05] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl relative group"
                        >
                            <Quote className="absolute top-10 right-10 w-12 h-12 text-white/5" />
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, star) => (
                                    <Star key={star} className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                                ))}
                            </div>
                            <p className="text-slate-200 font-medium italic mb-8 leading-relaxed h-[100px] overflow-hidden">
                                "{review.comment.length > 120 ? review.comment.substring(0, 120) + '...' : review.comment}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-white text-lg">
                                    {review.patient[0]}
                                </div>
                                <div>
                                    <h4 className="font-black text-white tracking-tight leading-none mb-1">{review.patient}</h4>
                                    <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">{review.date}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Technology Integration */}
            <section className="py-20 border-y border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="flex items-center gap-3">
                        <Smartphone className="w-6 h-6" />
                        <span className="text-sm font-black uppercase tracking-widest">Web Responsive</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6" />
                        <span className="text-sm font-black uppercase tracking-widest">SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Laptop className="w-6 h-6" />
                        <span className="text-sm font-black uppercase tracking-widest">Stripe Ready</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Video className="w-6 h-6" />
                        <span className="text-sm font-black uppercase tracking-widest">WebRTC 4K</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-t border-white/5 pt-20">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white p-1 rounded-lg">
                                <img src="/logo.jpg" alt="Logo" className="h-6 w-auto object-contain" />
                            </div>
                            <span className="text-sm font-black tracking-widest text-white">DENTAL EXPRESSION</span>
                        </div>
                        <p className="text-slate-400 font-medium max-w-sm mb-8">
                            Transformando la experiencia dental a través de la tecnología y la pasión por la excelencia.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-white">Navegación</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-400">
                            <li><a href="#" className="hover:text-white transition-colors">Inicio</a></li>
                            <li><a href="#proceso" className="hover:text-white transition-colors">El Proceso</a></li>
                            <li><a href="#reseñas" className="hover:text-white transition-colors">Reseñas</a></li>
                            <li><a href="#experta" className="hover:text-white transition-colors">La Experta</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-white">Social</h4>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all cursor-pointer">
                                Ins
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all cursor-pointer">
                                Ln
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:row justify-between items-center gap-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">© 2026 Dental Expression. Todos los derechos reservados.</p>
                    <div className="flex gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span>Privacidad</span>
                        <span>Términos</span>
                    </div>
                </div>
            </footer>

            {/* Floating Action Button mobile */}
            <div className="fixed bottom-8 right-8 z-[60] md:hidden">
                <Link to="/agendar" className="bg-emerald-500 text-slate-900 p-4 rounded-full shadow-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                </Link>
            </div>
        </div>
    )
}

