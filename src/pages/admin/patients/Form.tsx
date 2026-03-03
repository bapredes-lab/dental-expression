import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
    ArrowLeft,
    Save,
    AlertTriangle,
    User,
    Phone,
    MapPin,
    AtSign,
    CalendarDays,
    Stethoscope
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { staggerChildren: 0.1 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
}

export default function PatientForm() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        nombre: '',
        documento_tipo: 'CC',
        documento_numero: '',
        genero: 'M',
        ocupacion: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: '',
        fecha_nacimiento: '',
        // Información Médica Crítica
        alergias: '',
        enfermedades_patologicas: '',
        medicamentos: '',
        antecedentes_familiares: '',
        motivo_consulta: '',
        observaciones: '',
        // Otros
        eps: '',
        contacto_emergencia: '',
        contacto_telefono: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (import.meta.env.VITE_SUPABASE_URL !== "") {
                const { error } = await supabase
                    .from('pacientes')
                    .insert([{
                        nombre: formData.nombre,
                        email: formData.email,
                        telefono: formData.telefono
                    }])

                if (error) throw error
            }
            navigate('/admin/patients')
        } catch (error) {
            console.error('Error saving patient:', error)
            alert("Hubo un error al guardar el paciente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-5xl mx-auto pb-12"
        >
            {/* Header Elite */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-2xl border-slate-200 hover:bg-white hover:text-primary shadow-sm">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Nueva Ficha Clínica</h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <User className="w-3 h-3" /> Registro de Paciente Elite
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-2xl font-bold text-slate-500 uppercase tracking-widest text-xs">
                        Descartar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-2xl bg-gradient-to-r from-[#0F4C75] to-[#052c46] px-8 font-black uppercase tracking-widest text-xs shadow-xl luxury-shadow"
                    >
                        <Save className="mr-2 h-4 w-4" /> {loading ? 'Sincronizando...' : 'Guardar y Abrir Ficha'}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Personal Info */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
                    <div className="glass-card bg-white rounded-[2rem] p-8 luxury-shadow border-slate-200/50">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                            <div className="bg-[#0F4C75]/10 p-2 rounded-xl text-primary">
                                <User className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800">Identificación y Perfil</h3>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="nombre" className="font-bold text-slate-600 ml-1">Nombre Completo del Paciente</Label>
                                <Input id="nombre" name="nombre" required placeholder="Ej. Juan Pérez" value={formData.nombre} onChange={handleChange} className="h-12 border-slate-200 rounded-xl focus:ring-primary/20" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="documento_tipo" className="font-bold text-slate-600 ml-1">Documento</Label>
                                <select id="documento_tipo" name="documento_tipo" className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-primary/20 outline-none" value={formData.documento_tipo} onChange={handleChange}>
                                    <option value="CC">Cédula Ciudadanía</option>
                                    <option value="CE">Cédula Extranjería</option>
                                    <option value="PP">Pasaporte</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="documento_numero" className="font-bold text-slate-600 ml-1">Número ID</Label>
                                <Input id="documento_numero" name="documento_numero" required placeholder="000.000.000" value={formData.documento_numero} onChange={handleChange} className="h-12 border-slate-200 rounded-xl" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="genero" className="font-bold text-slate-600 ml-1">Género</Label>
                                <select id="genero" name="genero" className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" value={formData.genero} onChange={handleChange}>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="O">Otro</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fecha_nacimiento" className="font-bold text-slate-600 ml-1 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Nacimiento</Label>
                                <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} className="h-12 border-slate-200 rounded-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card bg-white rounded-[2rem] p-8 luxury-shadow border-slate-200/50">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-600">
                                <Phone className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800">Contacto y Residencia</h3>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="telefono" className="font-bold text-slate-600 ml-1">Celular</Label>
                                <Input id="telefono" name="telefono" type="tel" placeholder="+57 300..." value={formData.telefono} onChange={handleChange} className="h-12 border-slate-200 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-bold text-slate-600 ml-1 flex items-center gap-2"><AtSign className="w-4 h-4" /> Email</Label>
                                <Input id="email" name="email" type="email" placeholder="paciente@mail.com" value={formData.email} onChange={handleChange} className="h-12 border-slate-200 rounded-xl" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="direccion" className="font-bold text-slate-600 ml-1 flex items-center gap-2"><MapPin className="w-4 h-4" /> Dirección</Label>
                                <Input id="direccion" name="direccion" placeholder="Calle, Barrio, Apto..." value={formData.direccion} onChange={handleChange} className="h-12 border-slate-200 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Column 2: Medical Info (Critical Section) */}
                <motion.div variants={itemVariants} className="space-y-8">
                    <div className="relative group overflow-hidden bg-[#7f1d1d] rounded-[2rem] p-8 luxury-shadow border-red-900 shadow-2xl shadow-red-900/20">
                        <motion.div
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-red-400/10"
                        />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="bg-white/10 p-3 rounded-2xl text-red-200">
                                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                                </div>
                                <span className="text-[10px] bg-red-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg">Alerta Crítica</span>
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 tracking-tight">Clínica & Alergias</h3>
                            <p className="text-red-200/60 text-xs mb-6 font-medium uppercase tracking-widest">Atención Prioritaria Dra. Nataly Vargas</p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="alergias" className="text-white font-bold ml-1 text-sm">Alergias Conocidas</Label>
                                    <Textarea id="alergias" name="alergias" placeholder="Látex, Penicilina, etc." value={formData.alergias} onChange={handleChange} className="bg-white/10 border-white/20 text-white placeholder:text-red-300 min-h-[100px] rounded-2xl focus:ring-white/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="enfermedades_patologicas" className="text-white font-bold ml-1 text-sm">Patologías</Label>
                                    <Textarea id="enfermedades_patologicas" name="enfermedades_patologicas" placeholder="Diabetes, HTA..." value={formData.enfermedades_patologicas} onChange={handleChange} className="bg-white/10 border-white/20 text-white placeholder:text-red-300 min-h-[80px] rounded-2xl" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card bg-white rounded-[2rem] p-8 luxury-shadow border-slate-200/50">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                            <div className="bg-slate-100 p-2 rounded-xl text-slate-600">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800">Otros Antecedentes</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="motivo_consulta" className="font-bold text-slate-600 ml-1">Motivo de Consulta</Label>
                                <Input id="motivo_consulta" name="motivo_consulta" placeholder="¿Por qué viene hoy?" value={formData.motivo_consulta} onChange={handleChange} className="h-12 border-slate-200 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="eps" className="font-bold text-slate-600 ml-1">EPS / Convenio</Label>
                                <Input id="eps" name="eps" placeholder="Nombre de EPS" value={formData.eps} onChange={handleChange} className="h-12 border-slate-200 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </form>
        </motion.div>
    )
}
