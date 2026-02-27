import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import DailyIframe from '@daily-co/daily-js'

export default function SalaVideollamada() {
    const { consultaId } = useParams()
    const navigate = useNavigate()
    const [consulta, setConsulta] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const videoContainer = useRef<HTMLDivElement>(null)
    const callFrameRef = useRef<any>(null)

    useEffect(() => {
        async function fetchConsulta() {
            if (!consultaId) return navigate('/')

            const { data, error } = await supabase
                .from('consultas')
                .select('*')
                .eq('id', consultaId)
                .single()

            if (error || !data) {
                setError("No se pudo cargar la consulta.")
                setLoading(false)
                return
            }

            // Validar estado (por si acaso intentan entrar sin pagar o si ya se completó)
            if (data.estado !== 'pagada' && data.estado !== 'en_curso') {
                setError("Esta sala no está disponible en este momento.")
                setLoading(false)
                return
            }

            setConsulta(data)

            // Actualizar estado a en_curso si estaba pagada
            if (data.estado === 'pagada') {
                await supabase.from('consultas').update({ estado: 'en_curso' }).eq('id', consultaId)
            }

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
                    backgroundColor: '#1f2937' // slate-800
                },
                showLeaveButton: true,
                showFullscreenButton: true,
            })

            callFrameRef.current = frame

            frame.join({
                url: consulta.daily_room_url,
                token: consulta.daily_token_paciente,
                userName: consulta.paciente_nombre,
            }).catch(e => {
                console.error("Error joining daily call", e)
                setError("Error al conectar con el servidor de video.")
            })

            // Listen for leave event
            frame.on('left-meeting', () => {
                navigate(`/confirmacion/${consultaId}`) // Go back to confirmation
            })
        }

        return () => {
            if (callFrameRef.current) {
                callFrameRef.current.destroy()
                callFrameRef.current = null
            }
        }
    }, [consulta, navigate, consultaId])

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center text-white">
            <div className="bg-slate-800 p-8 rounded-[2rem] max-w-sm w-full">
                <p className="font-bold">{error}</p>
                <button onClick={() => navigate('/')} className="mt-6 px-4 py-2 bg-emerald-500 rounded-xl font-bold w-full">Volver al inicio</button>
            </div>
        </div>
    )

    return (
        <div className="fixed inset-0 bg-slate-900 flex flex-col">
            {/* Header ultra minimalista */}
            <header className="bg-slate-900 border-b border-white/5 py-4 px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <img src="/logo.jpg" alt="Logo" className="h-6 w-auto brightness-200" />
                    <span className="font-bold text-white tracking-tight text-sm">Consultorio Virtual</span>
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    En línea
                </div>
            </header>

            {/* Contenedor del Iframe de Daily.co */}
            <main ref={videoContainer} className="flex-1 w-full relative" />
        </div>
    )
}
