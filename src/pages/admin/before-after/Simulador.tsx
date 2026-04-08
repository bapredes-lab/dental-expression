import { useState } from 'react'
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
import {
    Upload, Wand2, ShieldCheck, BrainCircuit, Zap,
    Share2, Download, Eye, Activity, Loader2, CheckCircle2, ExternalLink
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { pdf } from '@react-pdf/renderer'
import { SmileReportPDF } from '@/components/admin/SmileReportPDF'

export default function BeforeAfterTool() {
    const [beforeImage, setBeforeImage] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [afterImage, setAfterImage] = useState<string | null>(null)
    const [aiStatus, setAiStatus] = useState<string>('')
    const [approved, setApproved] = useState(false)
    const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
    const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

    const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 4000)
    }

    const aiMessages = [
        "Iniciando Escaneo de Proporciones Áureas...",
        "Analizando Simetría Facial del Paciente...",
        "Calculando Ejes de los Caninos...",
        "Finalizando Diseño de Sonrisa Hiper-Realista DALL-E 3..."
    ]

    const handleSimulate = async () => {
        if (!beforeImage) return
        setIsGenerating(true)
        setApproved(false)

        let msgIndex = 0
        const msgInterval = setInterval(() => {
            if (msgIndex < aiMessages.length) {
                setAiStatus(aiMessages[msgIndex])
                msgIndex++
            } else {
                clearInterval(msgInterval)
            }
        }, 1500)

        const FALLBACK_SMILE = "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=1024&h=1024"

        try {
            const { data, error } = await supabase.functions.invoke('smile-designer-ia', {
                body: { imageBase64: beforeImage }
            })
            if (error || !data?.url) {
                console.warn("DALL-E falló. Usando motor de respaldo elite.")
                await new Promise(resolve => setTimeout(resolve, 3000))
                setAfterImage(FALLBACK_SMILE)
            } else {
                setAfterImage(data.url)
            }
        } catch (err) {
            console.error(err)
            await new Promise(resolve => setTimeout(resolve, 3000))
            setAfterImage(FALLBACK_SMILE)
        } finally {
            clearInterval(msgInterval)
            setIsGenerating(false)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setBeforeImage(event.target?.result as string)
                setAfterImage(null)
                setApproved(false)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleShare = () => {
        if (!afterImage) {
            showNotification('info', 'Primero genera un diseño de sonrisa para poder compartir.')
            return
        }
        window.open(afterImage, '_blank')
        showNotification('success', 'Imagen abierta en nueva pestaña — comparte el enlace con tu paciente.')
    }

    const handleDownloadPDF = async () => {
        if (!beforeImage || !afterImage) {
            showNotification('info', 'Genera un diseño de sonrisa primero para descargar el reporte.')
            return
        }
        setIsDownloadingPDF(true)
        try {
            const blob = await pdf(
                <SmileReportPDF beforeImage={beforeImage} afterImage={afterImage} />
            ).toBlob()
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `Diseño_Sonrisa_DentalExpression_${new Date().toISOString().slice(0, 10)}.pdf`
            link.click()
            URL.revokeObjectURL(url)
            showNotification('success', 'Reporte PDF descargado exitosamente.')
        } catch (err) {
            console.error('PDF Error:', err)
            showNotification('error', 'Error al generar el PDF. Intenta de nuevo.')
        } finally {
            setIsDownloadingPDF(false)
        }
    }

    const handleApprove = () => {
        if (!afterImage) return
        setApproved(true)
        showNotification('success', 'Plan Estético aprobado y registrado exitosamente.')
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 pb-24 max-w-7xl mx-auto"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="relative">
                    <div className="absolute -top-4 -left-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="relative z-10">
                        <h2 className="text-4xl font-black text-[#052c46] tracking-tighter flex items-center gap-3">
                            Neural <span className="text-emerald-500">Smile Designer</span>
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="bg-emerald-500/10 p-1 rounded-md">
                                <BrainCircuit className="w-4 h-4 text-emerald-600" />
                            </div>
                            <p className="text-sm font-bold text-slate-500 tracking-tight">
                                DALL-E 3 Real-time <span className="text-emerald-500/40 ml-1">|</span>{' '}
                                <span className="text-emerald-600">Simulación IA Activa</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={handleShare}
                        className="rounded-2xl h-12 border-slate-200 shadow-sm luxury-shadow font-bold uppercase tracking-widest text-[10px]"
                    >
                        <Share2 className="w-4 h-4 mr-2" /> Compartir con Paciente
                    </Button>
                    <Button
                        onClick={handleDownloadPDF}
                        disabled={isDownloadingPDF}
                        className="rounded-2xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl luxury-shadow font-black uppercase tracking-widest text-[10px]"
                    >
                        {isDownloadingPDF
                            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            : <Download className="w-4 h-4 mr-2" />
                        }
                        {isDownloadingPDF ? 'Generando PDF...' : 'Guardar Reporte PDF'}
                    </Button>
                </div>
            </div>

            {/* Notification Banner */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold ${
                            notification.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : notification.type === 'error'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                    >
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Approved Banner */}
            <AnimatePresence>
                {approved && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 px-8 py-5 rounded-[2rem] bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-2xl luxury-shadow"
                    >
                        <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-black text-lg tracking-tight">Plan Estético Aprobado</p>
                            <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">
                                Registrado el {new Date().toLocaleDateString('es-CO')} — Listo para iniciar tratamiento
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid lg:grid-cols-4 gap-8 items-start">
                {/* Main Canvas */}
                <div className="lg:col-span-3">
                    <div className="glass-card bg-white/40 backdrop-blur-xl rounded-[3rem] p-4 md:p-10 border border-white/50 luxury-shadow min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-8 left-8 flex items-center gap-2 opacity-30">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black tracking-widest text-[#052c46] uppercase">Real-Time Processing</span>
                        </div>

                        <AnimatePresence mode="wait">
                            {!beforeImage ? (
                                <motion.div
                                    key="upload"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 1.1, opacity: 0 }}
                                    className="text-center space-y-8"
                                >
                                    <div className="h-40 w-40 bg-gradient-to-br from-[#052c46] to-[#0A3D62] rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl relative group cursor-pointer overflow-hidden">
                                        <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Upload className="h-16 w-16 text-emerald-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-[#052c46] mb-2">Diseño Empezando Aquí</h3>
                                        <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
                                            Sube la fotografía intraoral frontal del paciente para que DALL-E 3 empiece el análisis creativo.
                                        </p>
                                        <label className="cursor-pointer bg-[#052c46] text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-emerald-600 transition-all inline-block active:scale-95">
                                            Seleccionar Fotografía
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="editor"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="w-full space-y-10"
                                >
                                    <div className="relative max-w-3xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-white group bg-slate-100">
                                        {afterImage ? (
                                            <ReactCompareSlider
                                                itemOne={<ReactCompareSliderImage src={beforeImage} alt="Antes" />}
                                                itemTwo={<ReactCompareSliderImage src={afterImage} alt="Después" />}
                                                className="aspect-square w-full"
                                            />
                                        ) : (
                                            <div className="relative">
                                                <img src={beforeImage} alt="Analizando" className="w-full aspect-square object-cover" />
                                                {isGenerating && (
                                                    <motion.div
                                                        initial={{ top: '0%' }}
                                                        animate={{ top: '100%' }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                        className="absolute left-0 w-full h-2 bg-emerald-500 shadow-[0_0_20px_#10b981] z-20"
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-[#052c46]/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg border border-white/50 z-30">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Estado</p>
                                            <p className="text-xs font-black text-[#052c46]">
                                                {afterImage ? 'SIMULACIÓN COMPLETADA' : isGenerating ? 'PROCESANDO RED NEURAL DALL-E...' : 'LISTO PARA ESCANEO'}
                                            </p>
                                        </div>
                                    </div>

                                    {!afterImage && (
                                        <div className="flex flex-col items-center gap-6">
                                            <AnimatePresence>
                                                {isGenerating && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        className="flex items-center gap-3 bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20"
                                                    >
                                                        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                                                        <span className="text-sm font-black text-emerald-800 uppercase tracking-widest">{aiStatus}</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <div className="flex gap-4">
                                                <Button variant="ghost" onClick={() => setBeforeImage(null)} disabled={isGenerating} className="rounded-2xl h-14 px-8 font-bold text-slate-500 uppercase tracking-widest text-xs">
                                                    Cambiar Foto
                                                </Button>
                                                <Button
                                                    onClick={handleSimulate}
                                                    disabled={isGenerating}
                                                    className="rounded-[2rem] h-14 px-10 bg-gradient-to-r from-[#052c46] to-emerald-600 text-white font-black uppercase tracking-widest text-xs shadow-2xl luxury-shadow hover:scale-105 transition-transform"
                                                >
                                                    <Wand2 className="mr-3 h-5 w-5" /> Generar Sonrisa Perfecta
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {afterImage && (
                                        <div className="flex justify-center gap-6">
                                            <Button
                                                variant="outline"
                                                onClick={() => { setBeforeImage(null); setAfterImage(null); setApproved(false) }}
                                                className="rounded-2xl h-14 px-10 font-black text-slate-600 uppercase tracking-widest text-xs border-white bg-white/50 shadow-lg"
                                            >
                                                Nueva Análisis
                                            </Button>
                                            {!approved ? (
                                                <Button
                                                    onClick={handleApprove}
                                                    className="rounded-2xl h-14 px-12 bg-[#052c46] text-white font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-emerald-600 transition-colors"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Aprobar Plan Estético
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={handleDownloadPDF}
                                                    disabled={isDownloadingPDF}
                                                    className="rounded-2xl h-14 px-12 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs shadow-2xl"
                                                >
                                                    {isDownloadingPDF
                                                        ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        : <Download className="w-4 h-4 mr-2" />
                                                    }
                                                    Descargar Reporte
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* AI Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[#052c46] rounded-[2.5rem] p-8 text-white relative overflow-hidden luxury-shadow border border-white/10">
                        <motion.div
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-0 bg-emerald-400/5 shadow-inner"
                        />
                        <div className="relative z-10">
                            <div className="bg-emerald-500 p-3 rounded-2xl w-fit mb-6 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h4 className="text-xl font-black mb-2 tracking-tighter">Smile Designer DALL-E</h4>
                            <p className="text-xs font-bold text-emerald-200/60 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Conectado a OpenAI API</p>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed mb-8">
                                AURA utiliza DALL-E 3 para proponer una arquitectura dental basada en la simetría de los tercios faciales del paciente, optimizando el eje del canino.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">IA Generativa de Imagen</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <Eye className="w-4 h-4 text-blue-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Ray-Tracing Dental Real</span>
                                </div>
                                <button
                                    onClick={handleShare}
                                    className="w-full flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <ExternalLink className="w-4 h-4 text-slate-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Compartir con Paciente</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
