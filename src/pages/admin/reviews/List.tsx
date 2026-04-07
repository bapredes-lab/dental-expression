import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Plus, Trash2, CheckCircle2, XCircle, Loader2, MessageSquarePlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type Resena = {
    id: string
    nombre_paciente: string
    calificacion: number
    comentario: string
    estado: string
    created_at: string
}

const ESTADO_PUBLICADA = 'publicada'
const ESTADO_PENDIENTE = 'pendiente'

export default function ReviewsList() {
    const [resenas, setResenas] = useState<Resena[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [actionId, setActionId] = useState<string | null>(null)

    const [form, setForm] = useState({
        nombre_paciente: '',
        calificacion: 5,
        comentario: '',
    })

    async function fetchResenas() {
        setLoading(true)
        setError(null)
        const { data, error } = await supabase
            .from('resenas')
            .select('*')
            .order('created_at', { ascending: false })
        if (error) {
            setError('No se pudieron cargar las reseñas.')
            console.error(error)
        } else {
            setResenas(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchResenas()
    }, [])

    async function handleGuardar() {
        if (!form.nombre_paciente.trim() || !form.comentario.trim()) return
        setSaving(true)
        const { error } = await supabase.from('resenas').insert({
            nombre_paciente: form.nombre_paciente.trim(),
            calificacion: form.calificacion,
            comentario: form.comentario.trim(),
            estado: ESTADO_PENDIENTE,
        })
        setSaving(false)
        if (error) {
            alert('Error al guardar la reseña.')
            console.error(error)
            return
        }
        setForm({ nombre_paciente: '', calificacion: 5, comentario: '' })
        setShowForm(false)
        fetchResenas()
    }

    async function handleCambiarEstado(id: string, nuevoEstado: string) {
        setActionId(id)
        const { error } = await supabase
            .from('resenas')
            .update({ estado: nuevoEstado })
            .eq('id', id)
        if (error) console.error(error)
        await fetchResenas()
        setActionId(null)
    }

    async function handleEliminar(id: string) {
        if (!confirm('¿Eliminar esta reseña? Esta acción no se puede deshacer.')) return
        setActionId(id)
        const { error } = await supabase.from('resenas').delete().eq('id', id)
        if (error) console.error(error)
        await fetchResenas()
        setActionId(null)
    }

    const publicadas = resenas.filter(r => r.estado === ESTADO_PUBLICADA)
    const pendientes = resenas.filter(r => r.estado === ESTADO_PENDIENTE)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-[#052c46]">Módulo de Reseñas</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {loading ? 'Cargando...' : `${publicadas.length} publicadas · ${pendientes.length} pendientes`}
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="rounded-2xl bg-[#052c46] hover:bg-[#0a4b78] text-white font-black uppercase tracking-widest text-xs px-6 h-12 shadow-lg flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Nueva Reseña
                </Button>
            </div>

            {/* Formulario nueva reseña */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-xl space-y-5"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                <MessageSquarePlus className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-black text-[#052c46]">Agregar Reseña de Paciente</h3>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nombre del Paciente</Label>
                                <Input
                                    placeholder="Ej. María González"
                                    value={form.nombre_paciente}
                                    onChange={e => setForm(f => ({ ...f, nombre_paciente: e.target.value }))}
                                    className="h-12 rounded-xl border-slate-200 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Calificación</Label>
                                <div className="flex items-center gap-1 h-12">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button key={n} onClick={() => setForm(f => ({ ...f, calificacion: n }))}>
                                            <Star className={`w-7 h-7 transition-colors ${n <= form.calificacion ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Comentario</Label>
                            <Textarea
                                placeholder="Escribe el testimonio del paciente..."
                                value={form.comentario}
                                onChange={e => setForm(f => ({ ...f, comentario: e.target.value }))}
                                className="rounded-xl border-slate-200 font-medium resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setShowForm(false)}
                                className="rounded-xl font-bold text-slate-500"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleGuardar}
                                disabled={saving || !form.nombre_paciente.trim() || !form.comentario.trim()}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Reseña'}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Estado de carga y error */}
            {loading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            )}
            {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 font-bold text-sm text-center">
                    {error}
                </div>
            )}

            {/* Sin reseñas */}
            {!loading && !error && resenas.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-sm">Aún no hay reseñas</p>
                    <p className="text-xs mt-1">Agrega la primera reseña de un paciente</p>
                </div>
            )}

            {/* Lista de reseñas */}
            {!loading && resenas.length > 0 && (
                <div className="space-y-4">
                    {resenas.map((review, i) => {
                        const isPublicada = review.estado === ESTADO_PUBLICADA
                        const isActing = actionId === review.id
                        return (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-xl flex flex-col md:flex-row gap-6 items-start"
                            >
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex-shrink-0 flex items-center justify-center text-white shadow-lg text-xl font-black">
                                    {review.nombre_paciente[0].toUpperCase()}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                        <div>
                                            <h4 className="font-black text-slate-800 tracking-tight">{review.nombre_paciente}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(review.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < review.calificacion ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed font-medium italic">"{review.comentario}"</p>

                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isPublicada ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'}`}>
                                            {isPublicada ? 'Publicada' : 'Pendiente de Moderación'}
                                        </span>

                                        {isActing ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                        ) : (
                                            <>
                                                {!isPublicada && (
                                                    <button
                                                        onClick={() => handleCambiarEstado(review.id, ESTADO_PUBLICADA)}
                                                        className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                                                    >
                                                        <CheckCircle2 className="w-3 h-3" /> Aprobar
                                                    </button>
                                                )}
                                                {isPublicada && (
                                                    <button
                                                        onClick={() => handleCambiarEstado(review.id, ESTADO_PENDIENTE)}
                                                        className="flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase tracking-widest hover:underline"
                                                    >
                                                        <XCircle className="w-3 h-3" /> Ocultar
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEliminar(review.id)}
                                                    className="flex items-center gap-1 text-[9px] font-black text-red-400 uppercase tracking-widest hover:underline ml-auto"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Eliminar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
