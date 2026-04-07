import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckCircle2, Search, DollarSign,
    Send, Wallet, Download, Activity, ScanLine, AlertCircle, Link as LinkIcon,
    Users, Receipt, Zap, CreditCard as CardIcon
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const mockPayments = [
    { id: 'tx_1Oabc', patient: 'María González', amount: 1500.00, plan: 'Diseño de Sonrisa 3D', date: '2024-03-20', status: 'succeeded', method: 'Tarjeta' },
    { id: 'tx_2Xxyz', patient: 'Juan Pérez', amount: 250.00, plan: 'Limpieza Profunda Aura', date: '2024-03-18', status: 'succeeded', method: 'Link de Pago' },
    { id: 'tx_3Lmnp', patient: 'Ana Silva', amount: 300.00, plan: 'Ortodoncia Invisible (Cuota 1)', date: '2024-03-15', status: 'pending', method: 'Transferencia' },
    { id: 'tx_4Kkrr', patient: 'Roberto Gómez', amount: 1200.00, plan: 'Implante IA Integrado', date: '2024-03-14', status: 'failed', method: 'Tarjeta' },
]

export default function PaymentsAdmin() {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<'terminal' | 'links'>('terminal')
    const [showBanner, setShowBanner] = useState(false)

    const filteredPayments = mockPayments.filter(tx =>
        tx.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.plan.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalRevenue = mockPayments.filter(p => p.status === 'succeeded').reduce((acc, curr) => acc + curr.amount, 0)

    const handleProcessPayment = () => {
        setShowBanner(true)
        setTimeout(() => setShowBanner(false), 4000)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-24"
        >
            {/* Payment Gateway Header */}
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
                                Sistema Financiero Integrado Stripe
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl p-3 rounded-full border border-white shadow-xl luxury-shadow">
                    <Button
                        onClick={() => setActiveTab('terminal')}
                        className={`rounded - full px - 6 font - bold tracking - wide transition - all ${activeTab === 'terminal' ? 'bg-[#052c46] text-white shadow-lg shadow-blue-900/20' : 'bg-transparent text-slate-500 hover:bg-slate-100'} `}
                    >
                        Terminal POS
                    </Button>
                    <Button
                        onClick={() => setActiveTab('links')}
                        className={`rounded - full px - 6 font - bold tracking - wide transition - all ${activeTab === 'links' ? 'bg-[#052c46] text-white shadow-lg shadow-blue-900/20' : 'bg-transparent text-slate-500 hover:bg-slate-100'} `}
                    >
                        Links de Pago
                    </Button>
                </div>
            </div>

            {/* Banner pasarela en configuración */}
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

            {/* Financial Stats */}
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
                        <h4 className="text-5xl font-black text-white tracking-tighter">${totalRevenue.toFixed(2)}</h4>
                        <p className="text-xs font-bold text-slate-400 mt-4 flex items-center gap-2">
                            <Activity className="w-3 h-3 text-emerald-400" /> +15.2% vs mes anterior
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
                    <h4 className="text-4xl font-black text-[#052c46] tracking-tighter relative z-10">$300.00</h4>
                    <p className="text-xs font-bold text-slate-500 mt-4 relative z-10">1 paciente con saldo pendiente</p>
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
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Links Activos</p>
                    </div>
                    <h4 className="text-4xl font-black text-[#052c46] tracking-tighter relative z-10">14</h4>
                    <p className="text-xs font-bold text-slate-500 mt-4 relative z-10">Tasa de conversión: 86%</p>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="grid gap-8 lg:grid-cols-3">

                {/* POS Terminal / Payment Action */}
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
                                            <CardIcon className="w-6 h-6" /> Targeta
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
                                        {activeTab === 'terminal' ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <LinkIcon className="w-6 h-6 text-emerald-400" />}
                                        {activeTab === 'terminal' ? 'Registrar Cobro' : 'Generar Link'}
                                    </div>
                                </Button>
                                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                                    Pasarela en configuración — próximamente activa
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white/60 backdrop-blur-xl border border-white p-2 rounded-[2.5rem] shadow-xl luxury-shadow h-full flex flex-col">
                        <div className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100/50">
                            <div>
                                <h3 className="text-xl font-black text-[#052c46] tracking-tight">Historial de Transacciones</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Registros de los últimos 30 días</p>
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
                            <table className="w-full text-left border-separate border-spacing-y-2">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="px-4 py-2 font-black pb-4">ID Trans.</th>
                                        <th className="px-4 py-2 font-black pb-4">Paciente</th>
                                        <th className="px-4 py-2 font-black pb-4">Detalle</th>
                                        <th className="px-4 py-2 font-black pb-4 text-right">Monto</th>
                                        <th className="px-4 py-2 font-black pb-4 text-center">Estado</th>
                                        <th className="px-4 py-2 font-black pb-4 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {filteredPayments.map((tx, i) => (
                                            <motion.tr
                                                key={tx.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="bg-white/80 hover:bg-emerald-50/50 transition-colors group rounded-2xl"
                                            >
                                                <td className="px-4 py-4 rounded-l-2xl border-l-4 border-transparent group-hover:border-emerald-500 transition-colors">
                                                    <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded w-max">
                                                        {tx.id}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-black text-[#052c46]">{tx.patient}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{new Date(tx.date).toLocaleDateString('es-CO')}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-bold text-slate-600 truncate max-w-[150px]" title={tx.plan}>{tx.plan}</p>
                                                    <p className="text-[10px] font-bold text-emerald-600">{tx.method}</p>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className="text-base font-black text-[#052c46] tracking-tighter">${tx.amount.toFixed(2)}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex justify-center">
                                                        {tx.status === 'succeeded' && (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                                <CheckCircle2 className="w-3 h-3" /> Exitoso
                                                            </span>
                                                        )}
                                                        {tx.status === 'pending' && (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                                                <AlertCircle className="w-3 h-3" /> Pendiente
                                                            </span>
                                                        )}
                                                        {tx.status === 'failed' && (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-500/10 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
                                                                <AlertCircle className="w-3 h-3" /> Fallido
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 rounded-r-2xl text-center">
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#052c46] hover:bg-slate-100 rounded-xl">
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>

                                    {filteredPayments.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <div className="bg-slate-50 rounded-2xl p-8 inline-block max-w-sm">
                                                    <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                                    <p className="text-sm font-bold text-slate-500">No se encontraron transacciones para "{searchTerm}".</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    )
}
