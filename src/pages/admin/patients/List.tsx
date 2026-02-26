import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Link } from "react-router-dom"

export default function PatientsList() {
    const [patients, setPatients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPatients()
    }, [])

    const fetchPatients = async () => {
        setLoading(true)
        if (import.meta.env.VITE_SUPABASE_URL !== "") {
            const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false })
            if (!error && data) {
                setPatients(data)
            }
        } else {
            // Mock Data
            setPatients([
                { id: '1', nombre: 'Carlos Perez', documento_numero: '10928374', ciudad_nacimiento: 'Bogotá', created_at: new Date().toISOString() },
                { id: '2', nombre: 'Maria Gomez', documento_numero: '83746192', ciudad_nacimiento: 'Medellín', created_at: new Date().toISOString() }
            ])
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Fichas de Pacientes</h2>
                <Link to="/admin/patients/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Paciente
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por nombre o documento..."
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Médico</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Cargando pacientes...
                                    </td>
                                </tr>
                            ) : patients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No se encontraron pacientes.
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr key={patient.id} className="border-b hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {patient.nombre}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {patient.documento_numero}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {patient.ciudad_nacimiento}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(patient.created_at).toLocaleDateString('es-CO')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/admin/patients/${patient.id}`}>
                                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                                    Ver Detalles
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
