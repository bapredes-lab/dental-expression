import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Clock, CalendarOff, CheckCircle2, Loader2, Plus, Trash2,
    CalendarDays, Zap, ShieldCheck, Save, Ban
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// ── Tipos ────────────────────────────────────────────────────────────────────

type HorarioDia = {
    id?: string
    dia_semana: number
    hora_inicio: string
    hora_fin: string
    activo: boolean
}

type Bloqueo = {
    id: string
    fecha_inicio: string
    fecha_fin: string
    motivo: string
    todo_el_dia: boolean
    hora_inicio?: string | null
    hora_fin?: string | null
}

// ── Configuración de días ────────────────────────────────────────────────────

const DIAS = [
    { num: 1, nombre: 'Lunes',      abrev: 'LUN' },
    { num: 2, nombre: 'Martes',     abrev: 'MAR' },
    { num: 3, nombre: 'Miércoles',  abrev: 'MIÉ' },
    { num: 4, nombre: 'Jueves',     abrev: 'JUE' },
    { num: 5, nombre: 'Viernes',    abrev: 'VIE' },
    { num: 6, nombre: 'Sábado',     abrev: 'SÁB' },
    { num: 0, nombre: 'Domingo',    abrev: 'DOM' },
]

const HORARIO_DEFAULT: HorarioDia[] = DIAS.map(d => ({
    dia_semana: d.num,
    hora_inicio: '08:00',
    hora_fin: d.num === 6 ? '13:00' : '18:00',
    activo: d.num >= 1 && d.num <= 5,
}))

// ── Componente principal ─────────────────────────────────────────────────────

export default function Disponibilidad() {
    const [horario, setHorario] = useState<HorarioDia[]>(HORARIO_DEFAULT)
    const [bloqueos, setBloqueos] = useState<Bloqueo[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const [nuevoBloqueo, setNuevoBloqueo] = useState({
        fecha_inicio: '', fecha_fin: '', motivo: '',
        todo_el_dia: true, hora_inicio: '09:00', hora_fin: '11:00'
    })
    const [addingBloqueo, setAddingBloqueo] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // ── Cargar datos ─────────────────────────────────────────────────────────

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const today = new Date().toISOString().split('T')[0]

            const [{ data: horarioData, error: errH }, { data: bloqueosData, error: errB }] = await Promise.all([
                supabase.from('horario_semanal').select('*'),
                supabase.from('bloqueos_agenda').select('*').gte('fecha_fin', today).order('fecha_inicio'),
            ])

            if (errH) console.error('Error cargando horario:', errH)
            if (errB) console.error('Error cargando bloqueos:', errB)

            if (horarioData && horarioData.length > 0) {
                setHorario(DIAS.map(d => {
                    const found = horarioData.find((h: any) => h.dia_semana === d.num)
                    return found || { dia_semana: d.num, hora_inicio: '08:00', hora_fin: '18:00', activo: false }
                }))
            }

            setBloqueos(bloqueosData || [])
        } catch (err) {
            console.error('Error en loadData:', err)
        } finally {
            setLoading(false)
        }
    }

    // ── Guardar horario ──────────────────────────────────────────────────────

    async function saveHorario() {
        setSaving(true)
        const { error } = await supabase
            .from('horario_semanal')
            .upsert(
                horario.map(h => ({
                    dia_semana: h.dia_semana,
                    hora_inicio: h.hora_inicio,
                    hora_fin: h.hora_fin,
                    activo: h.activo,
                    ...(h.id ? { id: h.id } : {})
                })),
                { onConflict: 'dia_semana' }
            )
        setSaving(false)
        if (!error) {
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
            loadData()
        }
    }

    function toggleDia(diaNum: number) {
        setHorario(prev => prev.map(h =>
            h.dia_semana === diaNum ? { ...h, activo: !h.activo } : h
        ))
    }

    function updateHora(diaNum: number, campo: 'hora_inicio' | 'hora_fin', valor: string) {
        setHorario(prev => prev.map(h =>
            h.dia_semana === diaNum ? { ...h, [campo]: valor } : h
        ))
    }

    // ── Bloqueos ─────────────────────────────────────────────────────────────

    async function addBloqueo() {
        if (!nuevoBloqueo.fecha_inicio || !nuevoBloqueo.fecha_fin || !nuevoBloqueo.motivo) return
        if (nuevoBloqueo.fecha_fin < nuevoBloqueo.fecha_inicio) return
        if (!nuevoBloqueo.todo_el_dia && nuevoBloqueo.hora_fin <= nuevoBloqueo.hora_inicio) return

        setAddingBloqueo(true)
        const payload = {
            fecha_inicio: nuevoBloqueo.fecha_inicio,
            fecha_fin: nuevoBloqueo.fecha_fin,
            motivo: nuevoBloqueo.motivo,
            todo_el_dia: nuevoBloqueo.todo_el_dia,
            hora_inicio: nuevoBloqueo.todo_el_dia ? null : nuevoBloqueo.hora_inicio,
            hora_fin: nuevoBloqueo.todo_el_dia ? null : nuevoBloqueo.hora_fin,
        }
        const { data, error } = await supabase
            .from('bloqueos_agenda')
            .insert(payload)
            .select()
            .single()

        if (!error && data) {
            setBloqueos(prev => [...prev, data].sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio)))
            setNuevoBloqueo({ fecha_inicio: '', fecha_fin: '', motivo: '', todo_el_dia: true, hora_inicio: '09:00', hora_fin: '11:00' })
        }
        setAddingBloqueo(false)
    }

    async function deleteBloqueo(id: string) {
        setDeletingId(id)
        await supabase.from('bloqueos_agenda').delete().eq('id', id)
        setBloqueos(prev => prev.filter(b => b.id !== id))
        setDeletingId(null)
    }

    const diasActivos = horario.filter(h => h.activo).length

    // ── UI ───────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cargando disponibilidad...</p>
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-24"
        >
            {/* ── Header ── */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="relative">
                    <div className="absolute -top-4 -left-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="h-16 w-16 bg-gradient-to-br from-[#052c46] to-[#0a4b78] rounded-[1.5rem] shadow-xl flex items-center justify-center border border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl" />
                            <CalendarDays className="w-8 h-8 text-emerald-400 relative z-10" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-[#052c46] tracking-tighter">
                                Disponibilidad <span className="text-emerald-500">& Agenda</span>
                            </h2>
                            <p className="text-sm font-bold text-slate-500 tracking-tight mt-1 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-emerald-500" />
                                {diasActivos} {diasActivos === 1 ? 'día activo' : 'días activos'} esta semana
                            </p>
                        </div>
                    </div>
                </div>

                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={saveHorario}
                    disabled={saving}
                    className="flex items-center gap-3 px-8 h-14 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/30 transition-all disabled:opacity-60 uppercase tracking-widest text-sm"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar Horario'}
                </motion.button>
            </div>

            {/* ── Banner éxito ── */}
            <AnimatePresence>
                {saved && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-3 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 font-bold text-sm"
                    >
                        <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-500" />
                        Horario actualizado. Los pacientes ya ven los nuevos horarios disponibles en tiempo real.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Horario Semanal ── */}
            <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-xl luxury-shadow p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-[#052c46]/10 rounded-xl">
                        <Clock className="w-5 h-5 text-[#052c46]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[#052c46] tracking-tight">Horario de Atención Semanal</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Define tu disponibilidad regular — los pacientes solo ven estos horarios
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    {DIAS.map((dia, i) => {
                        const h = horario.find(x => x.dia_semana === dia.num)!
                        return (
                            <motion.div
                                key={dia.num}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`relative rounded-[1.5rem] border-2 p-5 transition-all duration-300 ${
                                    h.activo
                                        ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-50 to-white shadow-lg shadow-emerald-500/10'
                                        : 'border-slate-100 bg-slate-50/50'
                                }`}
                            >
                                {/* Día abreviado */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`text-xs font-black uppercase tracking-widest ${h.activo ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {dia.abrev}
                                    </span>
                                    {/* Toggle */}
                                    <button
                                        onClick={() => toggleDia(dia.num)}
                                        className={`relative w-11 h-6 rounded-full transition-all duration-300 ${h.activo ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${h.activo ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                <p className={`text-base font-black mb-4 ${h.activo ? 'text-[#052c46]' : 'text-slate-400'}`}>
                                    {dia.nombre}
                                </p>

                                {h.activo ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Desde</label>
                                            <input
                                                type="time"
                                                value={h.hora_inicio}
                                                onChange={e => updateHora(dia.num, 'hora_inicio', e.target.value)}
                                                className="w-full text-sm font-bold text-[#052c46] bg-white border border-emerald-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Hasta</label>
                                            <input
                                                type="time"
                                                value={h.hora_fin}
                                                onChange={e => updateHora(dia.num, 'hora_fin', e.target.value)}
                                                className="w-full text-sm font-bold text-[#052c46] bg-white border border-emerald-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                            />
                                        </div>
                                        <div className="pt-2 border-t border-emerald-100">
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest text-center">
                                                {(() => {
                                                    const [sh, sm] = h.hora_inicio.split(':').map(Number)
                                                    const [eh, em] = h.hora_fin.split(':').map(Number)
                                                    const mins = (eh * 60 + em) - (sh * 60 + sm)
                                                    const slots = Math.floor(mins / 30)
                                                    return `${slots} slots disponibles`
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-4 gap-2">
                                        <Ban className="w-6 h-6 text-slate-300" />
                                        <p className="text-xs font-bold text-slate-400">Cerrado</p>
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* ── Bloqueos y Vacaciones ── */}
            <div className="grid gap-8 lg:grid-cols-5">

                {/* Formulario nuevo bloqueo */}
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-[#052c46] to-[#0a4b78] rounded-[2rem] p-8 shadow-2xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-white/10 rounded-xl">
                                    <CalendarOff className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white tracking-tight">Bloquear Fechas</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vacaciones, festivos, imprevistos</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Toggle todo el día / horas específicas */}
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                    <button
                                        onClick={() => setNuevoBloqueo(prev => ({ ...prev, todo_el_dia: true }))}
                                        className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${nuevoBloqueo.todo_el_dia ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Todo el día
                                    </button>
                                    <button
                                        onClick={() => setNuevoBloqueo(prev => ({ ...prev, todo_el_dia: false }))}
                                        className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${!nuevoBloqueo.todo_el_dia ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Horas específicas
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Fecha inicio</label>
                                        <input
                                            type="date"
                                            value={nuevoBloqueo.fecha_inicio}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={e => setNuevoBloqueo(prev => ({ ...prev, fecha_inicio: e.target.value, fecha_fin: prev.fecha_fin < e.target.value ? e.target.value : prev.fecha_fin }))}
                                            className="w-full bg-white/10 border border-white/20 text-white font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [color-scheme:dark] text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Fecha fin</label>
                                        <input
                                            type="date"
                                            value={nuevoBloqueo.fecha_fin}
                                            min={nuevoBloqueo.fecha_inicio || new Date().toISOString().split('T')[0]}
                                            onChange={e => setNuevoBloqueo(prev => ({ ...prev, fecha_fin: e.target.value }))}
                                            className="w-full bg-white/10 border border-white/20 text-white font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [color-scheme:dark] text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Horas específicas — solo cuando no es todo el día */}
                                <AnimatePresence>
                                    {!nuevoBloqueo.todo_el_dia && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="grid grid-cols-2 gap-3 overflow-hidden"
                                        >
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Desde</label>
                                                <input
                                                    type="time"
                                                    value={nuevoBloqueo.hora_inicio}
                                                    onChange={e => setNuevoBloqueo(prev => ({ ...prev, hora_inicio: e.target.value }))}
                                                    className="w-full bg-white/10 border border-white/20 text-white font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [color-scheme:dark] text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Hasta</label>
                                                <input
                                                    type="time"
                                                    value={nuevoBloqueo.hora_fin}
                                                    onChange={e => setNuevoBloqueo(prev => ({ ...prev, hora_fin: e.target.value }))}
                                                    className="w-full bg-white/10 border border-white/20 text-white font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [color-scheme:dark] text-sm"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Motivo</label>
                                    <input
                                        type="text"
                                        value={nuevoBloqueo.motivo}
                                        onChange={e => setNuevoBloqueo(prev => ({ ...prev, motivo: e.target.value }))}
                                        placeholder="Ej: Reunión, Congreso, Vacaciones..."
                                        className="w-full bg-white/10 border border-white/20 text-white font-bold placeholder:text-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={addBloqueo}
                                    disabled={addingBloqueo || !nuevoBloqueo.fecha_inicio || !nuevoBloqueo.fecha_fin || !nuevoBloqueo.motivo}
                                    className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-slate-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm mt-2"
                                >
                                    {addingBloqueo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                    {addingBloqueo ? 'Bloqueando...' : 'Bloquear'}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de bloqueos */}
                <div className="lg:col-span-3">
                    <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[2rem] shadow-xl luxury-shadow p-8 h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/10">
                                <Ban className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[#052c46] tracking-tight">Períodos Bloqueados</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    {bloqueos.length === 0 ? 'Sin bloqueos próximos' : `${bloqueos.length} bloqueo${bloqueos.length > 1 ? 's' : ''} activo${bloqueos.length > 1 ? 's' : ''}`}
                                </p>
                            </div>
                        </div>

                        {bloqueos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <CalendarDays className="w-7 h-7 text-slate-300" />
                                </div>
                                <p className="font-bold text-slate-500 text-sm">Sin bloqueos próximos</p>
                                <p className="text-xs text-slate-400 mt-1">Tu agenda está completamente disponible</p>
                            </div>
                        ) : (
                            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
                                <AnimatePresence>
                                    {bloqueos.map((b, i) => {
                                        const inicio = parseISO(b.fecha_inicio)
                                        const fin = parseISO(b.fecha_fin)
                                        const mismaFecha = b.fecha_inicio === b.fecha_fin
                                        return (
                                            <motion.div
                                                key={b.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10, height: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className="flex items-center gap-4 p-4 bg-rose-50/60 border border-rose-100 rounded-2xl group hover:bg-rose-50 transition-colors"
                                            >
                                                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                                                    <CalendarOff className="w-4 h-4 text-rose-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-black text-[#052c46] text-sm">{b.motivo}</p>
                                                        {!b.todo_el_dia && (
                                                            <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0">
                                                                {b.hora_inicio?.slice(0,5)} – {b.hora_fin?.slice(0,5)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-500 mt-0.5 capitalize">
                                                        {mismaFecha
                                                            ? format(inicio, "d 'de' MMMM yyyy", { locale: es })
                                                            : `${format(inicio, "d MMM", { locale: es })} → ${format(fin, "d MMM yyyy", { locale: es })}`
                                                        }
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => deleteBloqueo(b.id)}
                                                    disabled={deletingId === b.id}
                                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-100 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    {deletingId === b.id
                                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                                        : <Trash2 className="w-4 h-4" />
                                                    }
                                                </button>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Info footer ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { icon: Clock, title: 'Slots de 30 min', desc: 'Cada cita ocupa 30 minutos. Los slots ya reservados no aparecen al paciente.' },
                    { icon: ShieldCheck, title: 'Actualización inmediata', desc: 'Los cambios se reflejan al instante en el formulario público de agendamiento.' },
                    { icon: Ban, title: 'Anti-solapamiento', desc: 'El sistema impide que dos pacientes reserven el mismo horario automáticamente.' },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-start gap-3 p-5 bg-white/40 backdrop-blur-sm border border-white rounded-2xl"
                    >
                        <div className="p-2 bg-emerald-500/10 rounded-xl shrink-0">
                            <item.icon className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-[#052c46] uppercase tracking-widest">{item.title}</p>
                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
