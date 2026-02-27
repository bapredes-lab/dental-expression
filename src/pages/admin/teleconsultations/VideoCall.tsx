import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import DailyIframe from '@daily-co/daily-js'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { VideoOff, Save, ShieldAlert, ArrowLeft } from 'lucide-react'

export default function TeleconsultationRoom() {
    const { consultaId } = useParams()
    const navigate = useNavigate()
    const [consulta, setConsulta] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [savingNotes, setSavingNotes] = useState(false)
    const [notas, setNotas] = useState("")

    const videoContainer = useRef<HTMLDivElement>(null)
    const callFrameRef = useRef<any>(null)

    useEffect(() => {
        async function fetchConsulta() {
            if (!consultaId) return navigate('/admin/teleconsultas')

            const { data, error } = await supabase
                .from('consultas')
                .select('*')
                .eq('id', consultaId)
                .single()

            if (error || !data) {
                navigate('/admin/teleconsultas')
                return
            }

            setConsulta(data)
            setNotas(data.notas_clinicas || "")
            setLoading(false)
        }

        fetchConsulta()
    }, [consultaId, navigate])

    useEffect(() => {
        if (!consulta || !videoContainer.current) return

        if (!callFrameRef.current) {
            const frame = DailyIframe.createFrame(videoContainer.current, {
                iframeStyle: {
                    width: '100%',
                    height: '100%',
                    border: '0',
                    backgroundColor: '#1f2937',
                    borderRadius: '1rem',
                },
                showLeaveButton: true,
            })

            callFrameRef.current = frame

            frame.join({
                url: consulta.daily_room_url,
                token: consulta.daily_token_doctor,
                userName: `Dra. Nataly Vargas (Admin)`,
            }).catch(e => {
                console.error("Error joining daily info:", e)
            })

            frame.on('left-meeting', () => {
                handleEndCall()
            })
        }

        return () => {
            if (callFrameRef.current) {
                callFrameRef.current.destroy()
                callFrameRef.current = null
            }
        }
    }, [consulta])

    const handleSaveNotes = async () => {
        setSavingNotes(true)
        await supabase
            .from('consultas')
            .update({ notas_clinicas: notas })
            .eq('id', consultaId)
        setSavingNotes(false)
    }

    const handleEndCall = async () => {
        // Guardar notas y marcar como completada
        await handleSaveNotes()
        await supabase
            .from('consultas')
            .update({ estado: 'completada' })
            .eq('id', consultaId)

        navigate('/admin/teleconsultas')
    }

    if (loading) return null

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col xl:flex-row gap-6">

            {/* Lado del Video (Izquierda / Principal) */}
            <div className="flex-1 flex flex-col bg-slate-900 rounded-[2rem] overflow-hidden relative shadow-2xl border border-slate-800">

                {/* Overlay Header */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/admin/teleconsultas')}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-all shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col items-end">
                        <span className="text-white font-black drop-shadow-md text-sm truncate max-w-[200px]">{consulta.paciente_nombre}</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse drop-shadow-md" />
                            <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest drop-shadow-md">On Air</span>
                        </div>
                    </div>
                </div>

                {/* Video Frame */}
                <div ref={videoContainer} className="flex-1 w-full bg-slate-900" />

                {/* Doctor Controls Bottom Bar */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                    <button
                        onClick={() => callFrameRef.current?.leave()}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 transition-transform hover:scale-105"
                    >
                        <VideoOff className="w-4 h-4" /> Finalizar Consulta
                    </button>
                </div>
            </div>

            {/* Panel Clínico (Derecha) */}
            <div className="w-full xl:w-96 flex flex-col gap-6 shrink-0">

                {/* Info Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-emerald-500" /> Motivo
                    </h3>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {consulta.motivo}
                    </p>
                </div>

                {/* Notas Switch */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Notas Clínicas</h3>
                        <Button
                            onClick={handleSaveNotes}
                            disabled={savingNotes}
                            size="sm"
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-black rounded-xl"
                        >
                            {savingNotes ? 'Guardando...' : <Save className="w-4 h-4" />}
                        </Button>
                    </div>

                    <Textarea
                        placeholder="Escribe el diagnóstico, prescripciones y notas post-consulta aquí..."
                        className="flex-1 bg-slate-50 border-slate-200 resize-none rounded-2xl p-4 focus:ring-emerald-500/20 text-sm"
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                    />

                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">
                        Estas notas son privadas
                    </p>
                </div>

            </div>
        </div>
    )
}
