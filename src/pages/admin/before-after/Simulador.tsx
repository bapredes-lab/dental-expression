import { useState } from 'react'
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
import {
    Upload,
    Sparkles,
    Wand2,
    ShieldCheck,
    BrainCircuit,
    Zap,
    Share2,
    Download,
    Eye,
    Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function BeforeAfterTool() {
    const [beforeImage, setBeforeImage] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [afterImage, setAfterImage] = useState<string | null>(null)
    const [aiStatus, setAiStatus] = useState<string>('')

    const aiMessages = [
        "Iniciando Escaneo de Proporciones Áureas...",
        "Analizando Simetría Facial del Paciente...",
        "Ajustando Opacidad Incisal (Estándar Nataly Vargas)...",
        "Generando Malla de Micro-Rehabilitación...",
        "Finalizando Diseño de Sonrisa Hiper-Realista..."
    ]

    const handleSimulate = () => {
        if (!beforeImage) return
        setIsGenerating(true)

        let msgIndex = 0
        const interval = setInterval(() => {
            if (msgIndex < aiMessages.length) {
                setAiStatus(aiMessages[msgIndex])
                msgIndex++
            } else {
                clearInterval(interval)
                // Usamos la imagen generada por AntiGravity como el "Después"
                setAfterImage('/perfect_clinical_smile_ia_1772086743396.png')
                setIsGenerating(false)
            }
        }, 1200)
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setBeforeImage(url)
            setAfterImage(null)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 pb-24 max-w-7xl mx-auto"
        >
            {/* Header Elite Neural */}
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
                            <p className="text-sm font-bold text-slate-500 tracking-tight">IA Generativa <span className="text-emerald-500/40 ml-1">|</span> <span className="text-emerald-600">Patrones Clínica Nataly Vargas</span></p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" className="rounded-2xl h-12 border-slate-200 shadow-sm luxury-shadow font-bold uppercase tracking-widest text-[10px]">
                        <Share2 className="w-4 h-4 mr-2" /> Compartir con Paciente
                    </Button>
                    <Button className="rounded-2xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl luxury-shadow font-black uppercase tracking-widest text-[10px]">
                        <Download className="w-4 h-4 mr-2" /> Guardar Reporte PDF
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8 items-start">
                {/* Main Experience Canvas */}
                <div className="lg:col-span-3">
                    <div className="glass-card bg-white/40 backdrop-blur-xl rounded-[3rem] p-4 md:p-10 border border-white/50 luxury-shadow min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden">

                        {/* Decorative HUD Elements */}
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
                                            Sube la fotografía intraoral frontal del paciente para que AURA IA empiece el análisis creativo.
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
                                    <div className="relative max-w-3xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-white group">
                                        {/* Comparison or Single Image */}
                                        {afterImage ? (
                                            <ReactCompareSlider
                                                itemOne={<ReactCompareSliderImage src={beforeImage} alt="Antes" />}
                                                itemTwo={<ReactCompareSliderImage src={afterImage} alt="Después" />}
                                                className="aspect-[4/3] w-full"
                                            />
                                        ) : (
                                            <div className="relative">
                                                <img src={beforeImage} alt="Analizando" className="w-full aspect-[4/3] object-cover" />
                                                {/* Scan Animation */}
                                                {isGenerating && (
                                                    <motion.div
                                                        initial={{ top: '0%' }}
                                                        animate={{ top: '100%' }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                        className="absolute left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_#10b981] z-20"
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-[#052c46]/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        )}

                                        {/* HUD Label */}
                                        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg border border-white/50 z-30">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Estado</p>
                                            <p className="text-xs font-black text-[#052c46]">{afterImage ? 'SIMULACIÓN COMPLETADA' : isGenerating ? 'PROCESANDO RED NEURAL...' : 'LISTO PARA ESCANEO'}</p>
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
                                                        <Sparkles className="w-5 h-5 text-emerald-600 animate-spin" />
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
                                                    <Wand2 className="mr-3 h-5 w-5" /> Iniciar Diseño Creativo
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {afterImage && (
                                        <div className="flex justify-center gap-6">
                                            <Button variant="outline" onClick={() => { setBeforeImage(null); setAfterImage(null) }} className="rounded-2xl h-14 px-10 font-black text-slate-600 uppercase tracking-widest text-xs border-white bg-white/50 shadow-lg">
                                                Nueva Análisis
                                            </Button>
                                            <Button className="rounded-2xl h-14 px-12 bg-[#052c46] text-white font-black uppercase tracking-widest text-xs shadow-2xl">
                                                Aprobar Plan Estético
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* AI Guidance Sidebar */}
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
                            <h4 className="text-xl font-black mb-2 tracking-tighter">Motor Creativo AURA</h4>
                            <p className="text-xs font-bold text-emerald-200/60 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Nataly Vargas Elite Series</p>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed mb-8">
                                AURA no solo simula; propone una arquitectura dental basada en la simetría de los tercios faciales del paciente, optimizando el eje del canino y la transparencia incisal.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Precisión Estética 99.8%</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <Eye className="w-4 h-4 text-blue-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Ray-Tracing Dental</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl luxury-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Feedback Central</h5>
                        </div>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic border-l-4 border-emerald-500 pl-4">
                            "Añadiendo caracterización natural... reduciendo saturación gingival para armonía con tono de labios detectado."
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
