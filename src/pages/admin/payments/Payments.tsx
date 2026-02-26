import { useState } from 'react'
import { CheckCircle2, Search, ArrowUpRight, DollarSign } from 'lucide-react'
import { Input } from '@/components/ui/input'
const mockPayments = [
    { id: 'tx_1Oabc', patient: 'María González', amount: 150.00, plan: 'Diseño de Sonrisa', date: '2024-03-20', status: 'succeeded' },
    { id: 'tx_2Xxyz', patient: 'Juan Pérez', amount: 50.00, plan: 'Limpieza Profunda', date: '2024-03-18', status: 'succeeded' },
    { id: 'tx_3Lmnp', patient: 'Ana Silva', amount: 300.00, plan: 'Ortodoncia Invisible (Cuota 1)', date: '2024-03-15', status: 'pending' },
]

export default function PaymentsAdmin() {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredPayments = mockPayments.filter(tx =>
        tx.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.plan.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalRevenue = mockPayments.filter(p => p.status === 'succeeded').reduce((acc, curr) => acc + curr.amount, 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Pagos en USD (Stripe)</h2>
                    <p className="text-sm text-muted-foreground mt-1">Monitorea los cobros generados a partir de los planes de tratamiento.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-1 bg-primary text-white p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start">
                        <p className="text-primary-foreground/90 text-sm font-medium">Ingresos Totales (Mes)</p>
                        <DollarSign className="h-5 w-5 text-secondary" />
                    </div>
                    <h4 className="text-3xl font-bold mt-2">${totalRevenue.toFixed(2)}</h4>
                    <p className="text-xs text-primary-foreground/70 mt-4 border-t border-primary-foreground/20 pt-2">Actualizado vía API de Stripe</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar transacción por paciente o tratamiento..."
                        className="pl-8 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">ID Transacción</th>
                                <th className="px-6 py-4 font-semibold">Paciente</th>
                                <th className="px-6 py-4 font-semibold">Plan / Concepto</th>
                                <th className="px-6 py-4 font-semibold">Fecha</th>
                                <th className="px-6 py-4 font-semibold">Monto (USD)</th>
                                <th className="px-6 py-4 font-semibold text-right">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map((tx) => (
                                <tr key={tx.id} className="border-b hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            {tx.id} <ArrowUpRight className="h-3 w-3" />
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{tx.patient}</td>
                                    <td className="px-6 py-4 text-gray-600">{tx.plan}</td>
                                    <td className="px-6 py-4 text-gray-600">{new Date(tx.date).toLocaleDateString('es-CO')}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">${tx.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        {tx.status === 'succeeded' ? (
                                            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Pagado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                Pendiente
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredPayments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No se encontraron transacciones.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
