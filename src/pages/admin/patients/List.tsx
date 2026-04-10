import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Link } from "react-router-dom"

interface Patient {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    created_at: string;
}

export default function PatientsList() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchPatients()
    }, [])

    const fetchPatients = async () => {
        setLoading(true)
        if (import.meta.env.VITE_SUPABASE_URL !== "") {
            const { data, error } = await supabase.from('pacientes').select('*').order('created_at', { ascending: false })
            if (!error && data) {
                setPatients(data)
            } else {
                console.error("Supabase Error:", error)
            }
        } else {
            // Mock Data Fallback
            setPatients([
                { id: '1', nombre: 'Carlos Perez', email: 'carlos@example.com', telefono: '3101234567', created_at: new Date().toISOString() },
                { id: '2', nombre: 'Maria Gomez', email: 'maria@example.com', telefono: '3209876543', created_at: new Date().toISOString() }
            ])
        }
        setLoading(false)
    }

    const filteredPatients = patients.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Fichas de Pacientes</h2>
                    <p className="text-sm text-slate-500 mt-1">Directorio maestro de red de pacientes (Supabase Live)</p>
                </div>
                <Link to="/admin/patients/new">
                    <Button className="bg-emerald-600 text-white hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/20">
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Paciente
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <Input
                        type="search"
                        placeholder="Buscar por nombre o email..."
                        className="pl-10 h-12 bg-white/5 rounded-xl border-white/10 text-white placeholder:text-slate-500 focus:ring-emerald-500 focus:border-emerald-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Nombre Completo</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Email</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Teléfono</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Fecha Registro</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="font-bold tracking-wide">Sincronizando con Base de Datos...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <Search className="w-8 h-8 opacity-20" />
                                            <p className="font-bold tracking-wide">No se encontraron pacientes en tu red.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-black text-white">{patient.nombre}</p>
                                            <span className="text-[10px] bg-white/10 text-slate-400 px-2 py-0.5 rounded font-mono mt-1 inline-block">ID: {patient.id.substring(0, 8)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-400">
                                            {patient.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-400">
                                            {patient.telefono || 'No registrado'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-400">
                                            {new Date(patient.created_at).toLocaleDateString('es-CO')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/admin/patients/${patient.id}`}>
                                                <Button variant="ghost" size="sm" className="text-emerald-400 hover:bg-white/10 hover:text-emerald-300 font-bold rounded-lg transition-colors">
                                                    Abrir Ficha
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
