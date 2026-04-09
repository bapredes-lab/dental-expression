import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
    Calendar, Video, ShieldCheck, ArrowRight, Star, Quote,
    CheckCircle2, Briefcase, FileText, Activity,
    Sparkles, HeartPulse, ChevronDown, Instagram, Linkedin, Loader2
} from 'lucide-react'

import { supabase } from '@/lib/supabase'

type Resena = {
    id: string
    nombre_paciente: string
    calificacion: number
    comentario: string
    created_at: string
}

const services = [
    { icon: FileText, title: 'Valoración Completa', desc: 'Diagnóstico general y evaluación de estado actual de salud bucal.' },
    { icon: Sparkles, title: 'Diseño de Sonrisa IA', desc: 'Simulación digital de cómo se vería tu sonrisa con diferentes tratamientos estéticos.' },
    { icon: HeartPulse, title: 'Ortodoncia Invisible', desc: 'Evaluación de viabilidad para tratamientos con alineadores transparentes.' },
    { icon: ShieldCheck, title: 'Segunda Opinión', desc: 'Confirmación profesional sobre diagnósticos o tratamientos previos.' },
    { icon: Activity, title: 'Urgencias y Dolor', desc: 'Triaje rápido para determinar la gravedad y los siguientes pasos para el alivio.' },
    { icon: Star, title: 'Blanqueamiento', desc: 'Consulta para evaluar las mejores opciones según el tono de tu esmalte.' }
]

const faqs = [
    { q: '¿Cómo funciona la teleconsulta dental?', a: 'A través de nuestra plataforma cifrada, te conectas por video con la Dra. Nataly. Ella evaluará tu historial, escuchará tus síntomas, revisará tu boca mediante tu cámara y podrá darte un diagnóstico preliminar, plan de tratamiento virtual o receta electrónica.' },
    { q: '¿Qué necesito para la cita?', a: 'Solo un smartphone, tablet o computadora con buena cámara, conexión a internet estable y un lugar con buena iluminación. Si tienes radiografías previas, podrás subirlas a la plataforma.' },
    { q: '¿Es segura la llamada?', a: '100% segura. Utilizamos encriptación de grado médico (WebRTC y SSL) que cumple con las normativas HIPPA de confidencialidad de datos del paciente.' },
    { q: '¿Pueden diagnosticarse todos los problemas por videollamada?', a: 'La mayoría de dolores, dudas estéticas, asesoría ortodóntica y consultas post-operatorias pueden manejarse eficientemente online. Si el diagnóstico requiere examen físico, se te indicará realizar una consulta presencial en la clínica.' },
    { q: '¿Cómo funciona el pago de los 50 USD?', a: 'El pago se realiza mediante tarjeta de crédito a través de Stripe, nuestra pasarela de pagos segura y globalmente validada, justo después de agendar tu espacio en el calendario.' },
]

export default function Landing() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [reviews, setReviews] = useState<Resena[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            const { data, error } = await supabase
                .from('resenas')
                .select('id, nombre_paciente, calificacion, comentario, created_at')
                .eq('estado', 'publicada')
                .order('created_at', { ascending: false })
                .limit(3);

            if (!error && data) {
                setReviews(data);
            }
            setLoadingReviews(false);
        };
        fetchReviews();
    }, []);

    return (
        <div className="min-h-screen bg-[#052c46] text-white selection:bg-emerald-500/30 font-sans overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[150px]" />
                <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-teal-400/5 rounded-full blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#052c46]/90 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            <img src="/logo.jpg" alt="Logo" className="h-9 w-auto object-contain rounded-lg" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-black tracking-widest text-white leading-none">DENTAL EXPRESSION</span>
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-0.5">Dra. Nataly Vargas</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-10">
                        <div className="hidden lg:flex gap-8 text-base font-semibold text-white">
                            <a href="#servicios" className="hover:text-emerald-400 transition-colors">Servicios</a>
                            <a href="#proceso" className="hover:text-emerald-400 transition-colors">Cómo Funciona</a>
                            <a href="#diagnostico-ia" className="hover:text-emerald-400 transition-colors">Diagnóstico IA</a>
                            <a href="#experta" className="hover:text-emerald-400 transition-colors">La Experta</a>
                            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
                        </div>
                        <Link to="/login" className="px-6 py-3 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-base font-semibold text-white hover:bg-emerald-500/30 transition-all flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-emerald-400" />
                            Acceso Equipo
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section (2 Columns) */}
            <section className="relative pt-32 pb-16 px-6 max-w-7xl mx-auto min-h-screen flex items-center justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full relative z-10">
                    {/* Left content */}
                    <div className="flex flex-col text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-8 backdrop-blur-md w-fit"
                        >
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </div>
                            <span className="text-[10px] font-black text-emerald-300 tracking-[0.2em] uppercase">
                                Telemedicina Odontológica Premium
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] mb-6 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                        >
                            Reinventando tu <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 animate-gradient-x pb-2 inline-block">
                                Salud Dental
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-slate-300 font-medium max-w-xl mb-10 leading-relaxed drop-shadow-md"
                        >
                            Experimenta el futuro de la odontología. Una suite virtual de alta gama diseñada para ofrecerte una valoración precisa, diagnóstico con IA y plan de tratamiento profesional sin salir de la comodidad de tu hogar.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center gap-6"
                        >
                            <Link
                                to="/agendar"
                                className="group w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black rounded-full transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(16,185,129,0.25)]"
                            >
                                Agendar mi valoración
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            {/* Price Card */}
                            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-6 py-3 backdrop-blur-sm w-full sm:w-auto justify-center">
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[9px] font-black text-emerald-400/80 uppercase tracking-widest mb-1">Inversión Profesional</span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl font-black text-white">$50.00</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">USD</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-4 mt-8 opacity-90"
                        >
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-medium tracking-wide">Pago 100% seguro a través de Stripe en plataforma cifrada HIPAA.</span>
                        </motion.div>
                    </div>

                    {/* Right content (Image) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block mx-auto w-full max-w-lg"
                    >
                        {/* Glow Behind */}
                        <div className="absolute inset-[-10%] bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 blur-[60px] rounded-full animate-float" />

                        {/* Image Frame */}
                        <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl aspect-[4/5] bg-[#0A1A2F]">
                            <img
                                src="/doctor-nataly.png"
                                alt="Dra. Nataly Vargas"
                                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                            />
                            {/* Gradient Overlay for blending */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#052c46] via-transparent to-transparent opacity-80" />
                        </div>

                        {/* Floating Badge */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="absolute bottom-10 -left-10 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-float"
                            style={{ animationDelay: '1s' }}
                        >
                            <div className="bg-emerald-500/20 p-3 rounded-2xl">
                                <Sparkles className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Tecnología</div>
                                <div className="text-sm font-black text-white">Odontograma IA</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Trust Bar */}
            <section className="border-y border-white/5 bg-white/[0.02] py-8">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { label: 'Pacientes Satisfechos', value: '5,000+' },
                        { label: 'Años de Experiencia', value: '12+' },
                        { label: 'Países Atendidos', value: '30+' },
                        { label: 'Calificación Promedio', value: '4.9/5' },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center justify-center text-center">
                            <span className="text-3xl md:text-4xl font-black text-white mb-1 drop-shadow-sm">{stat.value}</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80 font-bold">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Services Section */}
            <section id="servicios" className="py-32 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 block">En qué te puedo ayudar</span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Servicios por Teleconsulta</h2>
                    <p className="text-slate-400 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                        Evaluamos tu caso con la última tecnología y te damos las directrices claras para lograr la sonrisa que mereces, sin tener que viajar o salir de casa.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 p-8 rounded-[2rem] transition-all hover:-translate-y-1 group"
                        >
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                                <service.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black mb-3 text-white">{service.title}</h3>
                            <p className="text-slate-400 font-medium text-sm leading-relaxed">{service.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Steps Section */}
            <section id="proceso" className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
                <div className="text-center mb-20">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 block">Fácil y Rápido</span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">¿Cómo funciona?</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Visual Connector for Desktop */}
                    <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0 z-0"></div>

                    {[
                        { icon: Calendar, title: "1. Agenda", desc: "Elige el horario en nuestro calendario y realiza el pago seguro vía Stripe para apartar tu espacio automáticamente." },
                        { icon: Video, title: "2. Conecta", desc: "Recibirás un correo con el link de acceso a tu suite dental virtual encriptada para iniciar tu cita." },
                        { icon: Sparkles, title: "3. Transforma", desc: "Obtén tu diagnóstico digital apoyado con Odontograma IA, plan de tratamiento y próximos pasos." }
                    ].map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="group relative z-10 flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 bg-[#052c46] border-2 border-emerald-500/30 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(16,185,129,0.15)] group-hover:border-emerald-500 transition-colors">
                                <step.icon className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 tracking-tight">{step.title}</h3>
                            <p className="text-slate-400 leading-relaxed font-medium text-sm px-4">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* AI Diagnostics Highlight Section */}
            <section id="diagnostico-ia" className="py-24 bg-gradient-to-br from-emerald-900/20 to-teal-900/10 border-y border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 block">Tecnología de Vanguardia</span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight">
                            Odontograma Inteligente y Simulador de Sonrisa IA
                        </h2>
                        <p className="text-lg text-slate-300 font-medium mb-8 leading-relaxed">
                            Vamos más allá de la telemedicina tradicional. En tu consulta utilizamos nuestro simulador avanzado y el <strong>Odontograma Inteligente</strong> desarrollado exclusivamente para nuestra plataforma, trazando proyecciones de antes/después con inteligencia artificial para que visualices tu objetivo final con claridad antes de empezar cualquier tratamiento presencial.
                        </p>
                        <ul className="space-y-4 mb-10">
                            {['Proyecciones estéticas fotorrealistas', 'Mapeo detallado de tu salud dental actual', 'Identificación interactiva de necesidades', 'Plan visual muy fácil de entender'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <span className="text-slate-200 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-[-5%] bg-blue-500/20 blur-[80px] rounded-full animate-pulse" />
                        <div className="relative bg-white/5 border border-white/10 rounded-3xl p-2 md:p-4 backdrop-blur-md shadow-2xl">
                            {/* Abstract representation of the UI / Odontogram visual placeholder */}
                            <div className="aspect-[16/10] bg-[#0A1A2F] rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                                <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
                                </div>
                                <div className="flex-1 p-6 flex flex-col gap-6 opacity-80">
                                    <div className="w-full h-8 bg-white/5 rounded-lg w-1/3"></div>
                                    <div className="grid grid-cols-8 gap-4 mb-4">
                                        {[...Array(16)].map((_, i) => (
                                            <div key={i} className={`h-16 rounded-xl ${i % 3 === 0 ? 'bg-emerald-500/30' : 'bg-white/5 border border-white/10'} hover:bg-emerald-500/20 transition-colors`}></div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center mt-auto">
                                        <div className="w-40 h-10 bg-white/10 rounded-full"></div>
                                        <div className="w-32 h-10 bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center rounded-full text-xs">Simular IA</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Expert Profile Section */}
            <section id="experta" className="py-32 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative hidden lg:block"
                    >
                        <div className="absolute -inset-4 bg-emerald-500/20 blur-[100px] rounded-full" />
                        <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl luxury-shadow aspect-[4/5] bg-[#0A1A2F]">
                            <img src="/doctor-nataly.png" alt="Dra. Nataly Vargas" className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700" />
                        </div>
                        <div className="absolute bottom-8 -right-8 bg-[#052c46] border border-white/10 px-8 py-6 rounded-3xl shadow-2xl hidden md:block">
                            <Star className="w-8 h-8 text-emerald-400 mb-2 fill-emerald-400" />
                            <div className="text-3xl font-black text-white">12+</div>
                            <div className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest whitespace-nowrap">Años de Excelencia</div>
                        </div>
                    </motion.div>

                    <div className="space-y-10">
                        <div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 block">La Experta Detrás de la Pantalla</span>
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight mb-6">
                                Dra. Nataly Vargas
                            </h2>
                            <p className="text-xl text-slate-300 font-medium leading-relaxed italic border-l-4 border-emerald-500 pl-6 py-2">
                                "Mi misión es democratizar el acceso al mejor diagnóstico dental, combinando tecnología de vanguardia visual con un trato profundamente humano."
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                "Especialista en Rehabilitación Oral",
                                "Experta en Odontología Estética",
                                "Pionera en Odonto-IA",
                                "Certificación Internacional"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    <span className="text-sm font-bold text-slate-200">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section id="reseñas" className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 block">Casos de Éxito Reales</span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Lo que dicen mis pacientes</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {loadingReviews ? (
                            <div className="col-span-full flex justify-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            </div>
                        ) : reviews.length > 0 ? (
                            reviews.map((review, i) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white/[0.04] border border-white/10 hover:border-emerald-500/30 p-10 rounded-[2.5rem] backdrop-blur-xl relative group transition-colors"
                                >
                                    <Quote className="absolute top-10 right-10 w-12 h-12 text-white/5 group-hover:text-emerald-500/10 transition-colors" />
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(5)].map((_, star) => (
                                            <Star key={star} className={`w-4 h-4 ${star < review.calificacion ? 'text-emerald-400 fill-emerald-400' : 'text-white/10'}`} />
                                        ))}
                                    </div>
                                    <p className="text-slate-300 font-medium italic mb-8 leading-relaxed h-[120px] overflow-hidden">
                                        "{review.comentario}"
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-white text-lg shadow-inner uppercase">
                                            {review.nombre_paciente[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white tracking-tight leading-none mb-1 text-sm">{review.nombre_paciente}</h4>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                {new Date(review.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-slate-500">
                                <p className="text-sm font-bold uppercase tracking-widest">No hay reseñas publicadas aún.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-32 px-6 max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 block">Despejando Dudas</span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Preguntas Frecuentes</h2>
                    <p className="text-slate-400 font-medium text-lg">Todo lo que necesitas saber sobre la teleconsulta premium.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 ${openFaq === index ? 'bg-white/5 border-emerald-500/30' : 'bg-transparent hover:border-white/20'}`}
                        >
                            <button
                                className="w-full flex items-center justify-between p-6 text-left"
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            >
                                <span className="font-bold text-slate-200 text-lg pr-8">{faq.q}</span>
                                <ChevronDown className={`w-5 h-5 text-emerald-400 transition-transform duration-300 flex-shrink-0 ${openFaq === index ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {openFaq === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 pt-0 text-slate-400 font-medium leading-relaxed border-t border-white/5 mx-6">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#0a3f63] to-[#041a2a] border border-white/10 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-500/20 blur-[100px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-teal-500/10 blur-[100px] rounded-full" />

                    <div className="relative z-10">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest mb-8">
                            Disponibilidad Limitada Esta Semana
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-white leading-tight">
                            Da el primer paso hacia la <br />
                            <span className="text-emerald-400">sonrisa de tus sueños</span>
                        </h2>
                        <p className="text-xl text-slate-300 font-medium mb-12 max-w-2xl mx-auto">
                            Únete a las miles de personas que ya transformaron su salud bucal empezando con una simple videollamada desde casa.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link
                                to="/agendar"
                                className="w-full sm:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-lg rounded-full transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(16,185,129,0.3)]"
                            >
                                Iniciar Proceso Ahora
                                <ArrowRight className="w-6 h-6" />
                            </Link>
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">Valoración Inicial</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-white">$50.00</span>
                                    <span className="text-sm font-bold text-slate-400 uppercase">USD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white p-1.5 rounded-xl">
                                <img src="/logo.jpg" alt="Logo" className="h-6 w-auto object-contain rounded-md" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black tracking-widest text-white leading-none">DENTAL EXPRESSION</span>
                            </div>
                        </div>
                        <p className="text-slate-400 font-medium max-w-sm mb-8 leading-relaxed">
                            Transformando la experiencia dental a través de diagnósticos por inteligencia artificial y atención verdaderamente premium, adaptada a tu estilo de vida.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-white">Navegación</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-400">
                            <li><a href="#servicios" className="hover:text-emerald-400 transition-colors">Servicios</a></li>
                            <li><a href="#proceso" className="hover:text-emerald-400 transition-colors">Cómo Funciona</a></li>
                            <li><a href="#experta" className="hover:text-emerald-400 transition-colors">La Dra. Nataly Vargas</a></li>
                            <li><a href="#faq" className="hover:text-emerald-400 transition-colors">Preguntas Frecuentes</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-white">Conecta</h4>
                        <div className="flex gap-4 mb-8">
                            <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all text-slate-400 hover:-translate-y-1">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all text-slate-400 hover:-translate-y-1">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-400 transition-colors uppercase tracking-widest">
                            <Briefcase className="w-4 h-4" />
                            Portal Administrativo
                        </Link>
                    </div>
                </div>
                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">© 2026 Dental Expression. Plataforma Segura HIPAA Compliant.</p>
                    <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <a href="#" className="hover:text-emerald-400 transition-colors">Políticas de Privacidad</a>
                        <a href="#" className="hover:text-emerald-400 transition-colors">Términos de Servicio</a>
                    </div>
                </div>
            </footer>

            {/* ── Botón flotante de WhatsApp ── */}
            {/* TODO: reemplazar XXXXXXXXXX con el número de la doctora (ej: 3001234567) */}
            <WhatsAppButton numero="XXXXXXXXXX" mensaje="Hola, me gustaría agendar una teleconsulta con la Dra. Nataly." />
        </div>
    )
}

// ── Componente WhatsApp ───────────────────────────────────────────────────────

function WhatsAppButton({ numero, mensaje }: { numero: string; mensaje: string }) {
    const url = `https://wa.me/57${numero}?text=${encodeURIComponent(mensaje)}`
    const esPlaceholder = numero === 'XXXXXXXXXX'

    return (
        <motion.a
            href={esPlaceholder ? undefined : url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] text-white font-black rounded-full shadow-2xl shadow-green-500/40 transition-all group ${esPlaceholder ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-green-500/60'}`}
            title={esPlaceholder ? 'Número pendiente de configurar' : 'Escríbenos por WhatsApp'}
        >
            {/* Ping animado */}
            {!esPlaceholder && (
                <span className="absolute top-0 right-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
            )}

            {/* Ícono WhatsApp SVG */}
            <div className="w-20 h-20 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 32 32" className="w-10 h-10 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.485 2.027 7.788L0 32l8.418-2.009A15.928 15.928 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.28 13.28 0 01-6.757-1.847l-.484-.287-5.001 1.194 1.216-4.87-.317-.5A13.253 13.253 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.862c-.398-.199-2.354-1.162-2.718-1.295-.365-.133-.631-.199-.897.199-.265.398-1.03 1.295-1.262 1.56-.232.266-.465.299-.863.1-.398-.2-1.681-.62-3.202-1.976-1.183-1.055-1.982-2.358-2.214-2.756-.232-.398-.025-.613.174-.812.179-.178.398-.465.597-.697.2-.232.266-.398.398-.664.133-.265.067-.498-.033-.697-.1-.199-.897-2.162-1.229-2.96-.324-.778-.652-.672-.897-.684l-.764-.013c-.265 0-.697.1-1.063.498-.365.398-1.394 1.362-1.394 3.323 0 1.96 1.427 3.855 1.626 4.12.199.266 2.808 4.287 6.806 6.013.951.41 1.693.655 2.272.838.955.303 1.824.26 2.511.158.766-.114 2.354-.963 2.686-1.893.332-.93.332-1.727.232-1.893-.1-.166-.365-.266-.763-.465z"/>
                </svg>
            </div>

            {/* Texto — aparece al hover */}
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap pr-0 group-hover:pr-5 text-sm">
                Escríbenos
            </span>
        </motion.a>
    )
}

