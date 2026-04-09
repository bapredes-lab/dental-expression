import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckCircle2, Search, DollarSign,
    Send, Wallet, Download, Activity, ScanLine, AlertCircle, Link as LinkIcon,
    Users, Receipt, Zap, CreditCard as CardIcon, Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

type Consulta = {
    id: string
    paciente_nombre: string
    precio: number
    motivo: string | null
    fecha_hora: string
    estado: string
    stripe_payment_intent_id: string | null  // contiene el ID de Wompi
}

export default function PaymentsAdmin() {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<'terminal' | 'links'>('terminal')
    const [showBanner, setShowBanner] = useState(false)
    const [consultas, setConsultas] = useState<Consulta[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchConsultas() {
            setLoading(true)
            const { data, error } = await supabase
                .from('consultas')
                .select('id, paciente_nombre, precio, motivo, fecha_hora, estado, stripe_payment_intent_id')
                .in('estado', ['pagada', 'pendiente', 'cancelada'])
                .order('fecha_hora', { ascending: false })
                .limit(50)

            if (!error && data) {
                setConsultas(data)
            }
            setLoading(false)
        }
        fetchConsultas()
    }, [])

    const filteredConsultas = consultas.filter(c =>
        c.paciente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.motivo || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalIngresos = consultas
        .filter(c => c.estado === 'pagada')
        .reduce((acc, c) => acc + c.precio, 0)

    const totalPendiente = consultas
        .filter(c => c.estado === 'pendiente')
        .reduce((acc, c) => acc + c.precio, 0)

    const pendientesCount = consultas.filter(c => c.estado === 'pendiente').length

    const handleProcessPayment = () => {
        setShowBanner(true)
        setTimeout(() => setShowBanner(false), 4000)
    }

    const statusConfig = {
        pagada: {
            label: 'Exitoso',
            className: 'inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20',
            icon: <CheckCircle2 className="w-3 h-3" />
        },
        pendiente: {
            label: 'Pendiente',
            className: 'inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20',
            icon: <AlertCircle className="w-3 h-3" />
        },
        cancelada: {
            label: 'Cancelada',
            className: 'inline-flex items-center gap-1 px-3 py-1 bg-rose-500/10 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-500/20',
            icon: <AlertCircle className="w-3 h-3" />
        },
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-24"
        >
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="relative">
                    <div className="absolute -top-4 -left-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="h-16 w-16 bg-gradient-to-br from-[#052c46] to-[#0a4b78] rounded-[1.5rem] shadow-xl flex items-center justify-center border border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl"></div>
                            <Wallet className="w-8 h-8 text-emerald-400 relative z-10" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-[#052c46] tracking-tighter">
                                Pasarela <span className="text-emerald-500">de Pagos</span>
                            </h2>
                            <p className="text-sm font-bold text-slate-500 tracking-tight mt-1 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-emerald-500" />
                                Integración Wompi Colombia
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl p-3 rounded-full border border-white shadow-xl luxury-shadow">
                    <Button
                        onClick={() => setActiveTab('terminal')}
                        className={`rounded-full px-6 font-bold tracking-wide transition-all ${activeTab === 'terminal' ? 'bg-[#052c46] text-white shadow-lg shadow-blue-900/20' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
                    >
                        Terminal POS
                    </Button>
                    <Button
                        onClick={() => setActiveTab('links')}
                        className={`rounded-full px-6 font-bold tracking-wide transition-all ${activeTab === 'links' ? 'bg-[#052c46] text-white shadow-lg shadow-blue-900/20' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
                    >
                        Links de Pago
                    </Button>
                </div>
            </div>

            {/* Banner */}
            <AnimatePresence>
                {showBanner && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-3 p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-700 font-bold text-sm"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
                        Pasarela de pagos en configuración. Pronto podrás procesar cobros directamente desde aquí.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative rounded-[2rem] bg-gradient-to-br from-[#052c46] to-[#0a4b78] p-8 shadow-2xl overflow-hidden group border border-white/10"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors duration-500" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/20">
                                <DollarSign className="h-6 w-6 text-emerald-400" />
                            </div>
                            <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] opacity-80">Ingresos Totales</p>
                        </div>
                        <h4 className="text-5xl font-black text-white tracking-tighter">${totalIngresos.toFixed(2)}</h4>
                        <p className="text-xs font-bold text-slate-400 mt-4 flex items-center gap-2">
                            <Activity className="w-3 h-3 text-emerald-400" />
                            {consultas.filter(c => c.estado === 'pagada').length} consultas pagadas
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative rounded-[2rem] bg-white/60 backdrop-blur-xl p-8 shadow-xl border border-white luxury-shadow overflow-hidden group"
                >
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/10">
                            <AlertCircle className="h-6 w-6 text-amber-500" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Por Cobrar</p>
                    </div>
                    <h4 className="text-4xl font-black text-[#052c46] tracking-tighter relative z-10">${totalPendiente.toFixed(2)}</h4>
                    <p className="text-xs font-bold text-slate-500 mt-4 relative z-10">
                        {pendientesCount} {pendientesCount === 1 ? 'paciente pendiente' : 'pacientes pendientes'}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative rounded-[2rem] bg-white/60 backdrop-blur-xl p-8 shadow-xl border border-white luxury-shadow overflow-hidden group"
                >
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/10">
                            <Send className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Total Consultas</p>
                    </div>
                    <h4 className="text-4xl font-black text-[#052c46] tracking-tighter relative z-10">{consultas.length}</h4>
                    <p className="text-xs font-bold text-slate-500 mt-4 relative z-10">Registradas en el sistema</p>
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="grid gap-8 lg:grid-cols-3">

                {/* POS / Links panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/70 backdrop-blur-2xl border border-white p-8 rounded-[2.5rem] shadow-xl luxury-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

                        <h3 className="text-xl font-black text-[#052c46] mb-8 flex items-center gap-3 tracking-tight">
                            <ScanLine className="text-emerald-500 w-6 h-6" />
                            {activeTab === 'terminal' ? 'Procesar Cobro' : 'Generar Link de Pago'}
                        </h3>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Paciente</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                                    <Input placeholder="Buscar paciente..." className="pl-12 h-14 bg-white/80 border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm focus:ring-emerald-500 focus:border-emerald-500" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Concepto / Tratamiento</label>
                                <div className="relative">
                                    <Receipt className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                                    <Input placeholder="Ej. Implante Dental..." className="pl-12 h-14 bg-white/80 border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm focus:ring-emerald-500 focus:border-emerald-500" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Monto (USD)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-4 h-5 w-5 text-[#052c46]" />
                                    <Input type="number" placeholder="0.00" className="pl-12 h-16 bg-white border-2 border-emerald-100 rounded-2xl font-black text-3xl text-[#052c46] shadow-inner focus:ring-emerald-500 focus:border-emerald-500" />
                                </div>
                            </div>

                            {activeTab === 'terminal' && (
                                <div className="pt-4">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 mb-3 block">Método de Pago</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 text-emerald-700 font-bold transition-all shadow-sm">
                                            <CardIcon className="w-6 h-6" /> Tarjeta
                                        </button>
                                        <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-500 font-bold hover:border-slate-300 transition-all">
                                            <Wallet className="w-6 h-6" /> Efectivo
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 space-y-3">
                                <Button
                                    onClick={handleProcessPayment}
                                    className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#052c46] to-[#0a4b78] hover:from-[#0a4b78] hover:to-[#052c46] text-white font-black text-lg shadow-xl shadow-blue-900/20 transition-all active:scale-95"
                                >
                                    <div className="flex items-center gap-2">
                                        {activeTab === 'terminal'
                                            ? <><CheckCircle2 className="w-6 h-6 text-emerald-400" /> Registrar Cobro</>
                                            : <><LinkIcon className="w-6 h-6 text-emerald-400" /> Generar Link</>
                                        }
                                    </div>
                                </Button>
                                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                                    Pasarela en configuración — próximamente activa
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de transacciones reales */}
                <div className="lg:col-span-2">
                    <div className="bg-white/60 backdrop-blur-xl border border-white p-2 rounded-[2.5rem] shadow-xl luxury-shadow h-full flex flex-col">
                        <div className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100/50">
                            <div>
                                <h3 className="text-xl font-black text-[#052c46] tracking-tight">Historial de Transacciones</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Datos en tiempo real desde Supabase</p>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="search"
                                    placeholder="Buscar paciente..."
                                    className="pl-10 h-10 bg-white/80 border-white rounded-xl shadow-sm text-sm font-medium focus:ring-emerald-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 p-4 overflow-x-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                </div>
                            ) : (
                                <table className="w-full text-left border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <th className="px-4 py-2 font-black pb-4">ID Wompi</th>
                                            <th className="px-4 py-2 font-black pb-4">Paciente</th>
                                            <th className="px-4 py-2 font-black pb-4">Detalle</th>
                                            <th className="px-4 py-2 font-black pb-4 text-right">Monto</th>
                                            <th className="px-4 py-2 font-black pb-4 text-center">Estado</th>
                                            <th className="px-4 py-2 font-black pb-4 text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {filteredConsultas.map((c, i) => {
                                                const cfg = statusConfig[c.estado as keyof typeof statusConfig] || statusConfig.pendiente
                                                const shortId = c.stripe_payment_intent_id
                                                    ? c.stripe_payment_intent_id.slice(0, 10) + '…'
                                                    : c.id.slice(0, 8) + '…'
                                                return (
                                                    <motion.tr
                                                        key={c.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.04 }}
                                                        className="bg-white/80 hover:bg-emerald-50/50 transition-colors group rounded-2xl"
                                                    >
                                                        <td className="px-4 py-4 rounded-l-2xl border-l-4 border-transparent group-hover:border-emerald-500 transition-colors">
                                                            <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded w-max">
                                                                {shortId}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <p className="text-sm font-black text-[#052c46]">{c.paciente_nombre}</p>
                                                            <p className="text-[10px] font-bold text-slate-400">
                                                                {new Date(c.fecha_hora).toLocaleDateString('es-CO')}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <p className="text-sm font-bold text-slate-600 truncate max-w-[150px]" title={c.motivo || 'Teleconsulta'}>
                                                                {c.motivo || 'Teleconsulta'}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-emerald-600">Wompi</p>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <span className="text-base font-black text-[#052c46] tracking-tighter">
                                                                ${c.precio.toFixed(2)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex justify-center">
                                                                <span className={cfg.className}>
                                                                    {cfg.icon} {cfg.label}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 rounded-r-2xl text-center">
                                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#052c46] hover:bg-slate-100 rounded-xl">
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </motion.tr>
                                                )
                                            })}
                                        </AnimatePresence>

                                        {!loading && filteredConsultas.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center">
                                                    <div className="bg-slate-50 rounded-2xl p-8 inline-block max-w-sm">
                                                        <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                                        <p className="text-sm font-bold text-slate-500">
                                                            {searchTerm
                                                                ? `No se encontraron resultados para "${searchTerm}".`
                                                                : 'Aún no hay transacciones registradas.'
                                                            }
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    )
}
