import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Video, Calendar as CalendarIcon, Clock, DollarSign, CheckCircle2, ShieldAlert, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TeleconsultationsList() {
    const navigate = useNavigate()
    const [consultas, setConsultas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('todas') // 'todas', 'pendiente', 'pagada', 'en_curso', 'completada'

    // Real-time listener for updates
    useEffect(() => {
        fetchConsultas()

        const channel = supabase
            .channel('consultas-changes')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'consultas' },
                (payload) => {
                    setConsultas((current) =>
                        current.map((c) => (c.id === payload.new.id ? payload.new : c))
                    )
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchConsultas = async () => {
        const { data, error } = await supabase
            .from('consultas')
            .select('*')
            .order('fecha_hora', { ascending: true })

        if (!error && data) {
            setConsultas(data)
        }
        setLoading(false)
    }

    const filteredConsultas = consultas.filter(c => {
        if (filter === 'todas') return true;
        if (filter === 'pendientes') return c.estado === 'pendiente';
        if (filter === 'pagadas') return c.estado === 'pagada';
        if (filter === 'completadas') return c.estado === 'completada';
        return true;
    })

    const getStatusConfig = (estado: string) => {
        switch (estado) {
            case 'pendiente': return { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pendiente de Pago' }
            case 'pagada': return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2, label: 'Pagada (Lista)' }
            case 'en_curso': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Video, label: 'En Curso' }
            case 'completada': return { bg: 'bg-slate-100', text: 'text-slate-600', icon: CheckCircle2, label: 'Terminada' }
            default: return { bg: 'bg-slate-100', text: 'text-slate-600', icon: AlertCircle, label: estado }
        }
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">

            {/* Header Elite */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-emerald-500/10 p-2 rounded-xl">
                            <Video className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Teleconsultas</h2>
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        Clínica Virtual Dental Expression
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['todas', 'pendientes', 'pagadas', 'completadas'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-800 text-white shadow-md' : 'bg-white border text-slate-500 hover:bg-slate-50'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin" />
                </div>
            ) : filteredConsultas.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 text-center border shadow-sm">
                    <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-slate-700">Sin consultas virtuales</h3>
                    <p className="text-slate-400 font-medium">No hay registros que coincidan con tu filtro actual.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredConsultas.map(consulta => {
                        const status = getStatusConfig(consulta.estado)
                        const isPayedOrActive = consulta.estado === 'pagada' || consulta.estado === 'en_curso'

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={consulta.id}
                                className="bg-white rounded-2xl border p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black shrink-0">
                                        {consulta.paciente_nombre.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-black text-slate-800 text-lg">{consulta.paciente_nombre}</h4>
                                            <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${status.bg} ${status.text}`}>
                                                <status.icon className="w-3 h-3" /> {status.label}
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-slate-500 mb-2 truncate max-w-md">{consulta.motivo}</p>
                                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {format(new Date(consulta.fecha_hora), 'd MMM', { locale: es })}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(consulta.fecha_hora), 'h:mm a')}</span>
                                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${consulta.precio} USD</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex shrink-0 justify-end">
                                    <button
                                        onClick={() => navigate(`/admin/teleconsultas/${consulta.id}`)}
                                        disabled={!isPayedOrActive}
                                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 
                                            ${isPayedOrActive
                                                ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-500/20 active:scale-95'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed hidden md:flex'}`
                                        }
                                    >
                                        <Video className="w-4 h-4" />
                                        {isPayedOrActive ? 'Iniciar Videollamada' : 'No Disponible'}
                                    </button>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
