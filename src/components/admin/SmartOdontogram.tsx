import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    BrainCircuit,
    Loader2,
    CheckCircle2,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface AIResult {
    summary: string;
    recommendations: string[];
    urgency: string;
}

const Tooth = ({ id, status = 'healthy', onSelect, isSelected }: any) => {
    const getStatusColor = () => {
        switch (status) {
            case 'cavity': return 'fill-red-500/80 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]';
            case 'filled': return 'fill-blue-400/80';
            case 'implant': return 'fill-emerald-400/80';
            case 'missing': return 'fill-slate-800/20 stroke-slate-400/30';
            default: return 'fill-white/90 group-hover:fill-white';
        }
    };

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(id)}
            className="relative cursor-pointer group"
        >
            <svg viewBox="0 0 100 100" className="w-12 h-12 md:w-16 md:h-16 drop-shadow-sm">
                <path
                    d="M50 10 C30 10 20 25 20 45 C20 70 35 90 50 90 C65 90 80 70 80 45 C80 25 70 10 50 10 Z"
                    className={`${getStatusColor()} transition-all duration-300 stroke-slate-200 stroke-[2px]`}
                />
                {isSelected && (
                    <motion.circle
                        layoutId="selection-ring"
                        cx="50" cy="50" r="48"
                        className="fill-none stroke-emerald-500 stroke-[2px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />
                )}
            </svg>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400 group-hover:text-primary transition-colors">
                {id}
            </span>
            {status === 'cavity' && (
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-1 -right-1"
                >
                    <Zap className="w-4 h-4 text-red-500 fill-red-500" />
                </motion.div>
            )}
        </motion.div>
    );
};

export default function SmartOdontogram({ patientId, patientName }: { patientId?: string, patientName?: string }) {
    const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
    const [toothStates, setToothStates] = useState<Record<number, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<AIResult | null>(null);

    useEffect(() => {
        if (patientId) {
            fetchOdontogram();
        } else {
            // Si estamos en el Dashboard sin un paciente, por defecto no mostramos spinner infinito
            setLoading(false);
        }
    }, [patientId]);

    const fetchOdontogram = async () => {
        if (!patientId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('patient_odontograms')
                .select('tooth_data, ai_analysis')
                .eq('patient_id', patientId)
                .single();

            // Si hay un error que no sea que no existe el registro, lo logeamos
            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching odontogram:", error);
            }

            if (data) {
                if (data.tooth_data) setToothStates(data.tooth_data);
                if (data.ai_analysis) {
                    try {
                        setAiResult(JSON.parse(data.ai_analysis));
                    } catch (e) {
                        setAiResult({ summary: data.ai_analysis, recommendations: [], urgency: 'media' });
                    }
                }
            }
        } catch (error) {
            console.log("No record found or connection error.");
        } finally {
            setLoading(false);
        }
    };

    const updateToothStatus = async (status: string) => {
        if (!selectedTooth || !patientId) return;
        const newStates = { ...toothStates, [selectedTooth]: status };
        setToothStates(newStates);
        setIsSaving(true);
        try {
            await supabase
                .from('patient_odontograms')
                .upsert({
                    patient_id: patientId,
                    tooth_data: newStates,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'patient_id' });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const runAuraIA = async () => {
        setIsAnalyzing(true);
        try {
            const { data, error } = await supabase.functions.invoke('aura-ia', {
                body: {
                    toothData: toothStates,
                    patientName: patientName || 'Paciente'
                }
            });

            if (error) throw error;

            // Si la función responde 200 pero con un objeto que contiene 'error: true'
            if (data?.error) {
                alert(`Error de AURA IA (Claude):\n\n${data.message}\n\nTipo: ${data.type || 'Inespecífico'}`);
                return;
            }

            setAiResult(data);

            // Guardar el análisis en la DB para no perderlo
            await supabase
                .from('patient_odontograms')
                .update({ ai_analysis: JSON.stringify(data) })
                .eq('patient_id', patientId);

        } catch (error: any) {
            console.error("AI Error:", error);
            const errorMessage = error.message || (typeof error === 'string' ? error : "Error desconocido al contactar a AURA IA.");
            alert(`Error técnico en AURA IA: ${errorMessage}\n\nPor favor, verifica los secretos ANTHROPIC_API_KEY en Supabase.`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const teethUpper = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
    const teethLower = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin text-[#0F4C75] w-8 h-8" />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cargando Odontograma...</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3 space-y-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-[#0F4C75] flex items-center justify-center text-white shadow-lg">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Odontograma Real</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <BrainCircuit className="w-3 h-3 text-emerald-500" /> Sincronizado con Claude 3.5 Sonnet
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={runAuraIA}
                        disabled={isAnalyzing || Object.keys(toothStates).length === 0}
                        className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black uppercase tracking-widest text-[10px] px-8 py-6 shadow-xl luxury-shadow hover:scale-105 transition-transform"
                    >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
                        {isAnalyzing ? 'Leyendo Hallazgos...' : 'Ejecutar Análisis AURA'}
                    </Button>
                </div>

                <div className="space-y-16 py-8">
                    <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
                        {teethUpper.map(id => (
                            <Tooth
                                key={id}
                                id={id}
                                status={toothStates[id] || 'healthy'}
                                isSelected={selectedTooth === id}
                                onSelect={setSelectedTooth}
                            />
                        ))}
                    </div>
                    <div className="flex justify-center gap-2 md:gap-4 flex-wrap mt-8">
                        {teethLower.map(id => (
                            <Tooth
                                key={id}
                                id={id}
                                status={toothStates[id] || 'healthy'}
                                isSelected={selectedTooth === id}
                                onSelect={setSelectedTooth}
                            />
                        ))}
                    </div>
                </div>

                {/* AI Findings Output */}
                <AnimatePresence>
                    {aiResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#052c46] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/10"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <BrainCircuit className="w-48 h-48" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row gap-10">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`h-3 w-3 rounded-full animate-pulse ${aiResult.urgency === 'alta' ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-emerald-500'}`} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Hallazgos Aura IA • Urgencia {aiResult.urgency}</p>
                                    </div>
                                    <h4 className="text-2xl font-black mb-6 tracking-tight">Resumen Estético-Clínico</h4>
                                    <p className="text-slate-200 leading-relaxed font-medium mb-8 bg-white/5 p-6 rounded-2xl border border-white/5 italic">
                                        "{aiResult.summary}"
                                    </p>
                                    <h5 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Plan Recomendado
                                    </h5>
                                    <ul className="space-y-3">
                                        {aiResult.recommendations.map((rec, i) => (
                                            <li key={i} className="text-sm text-slate-400 flex items-start gap-4">
                                                <span className="text-emerald-500 font-bold">0{i + 1}.</span>
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="md:w-64 space-y-4">
                                    <div className="bg-emerald-500 p-6 rounded-[2rem] text-emerald-950 shadow-xl shadow-emerald-500/10">
                                        <Zap className="w-8 h-8 mb-4" />
                                        <p className="font-black text-xs uppercase tracking-tight mb-1">Presupuesto IA</p>
                                        <p className="text-2xl font-black">$1,450 USD*</p>
                                        <p className="text-[8px] font-bold opacity-60 mt-4 leading-none uppercase">Estimado basado en procedimientos detectados por Aura.</p>
                                    </div>
                                    <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest">
                                        <FileText className="w-4 h-4 mr-2" /> PDF Compartible
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl luxury-shadow relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <h4 className="text-lg font-black tracking-tight mb-6 text-slate-800">Estado Clínica: Pieza {selectedTooth || '?'}</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'healthy', label: 'Sano', color: 'bg-white' },
                                { id: 'cavity', label: 'Carie', color: 'bg-red-500' },
                                { id: 'filled', label: 'Tratamiento', color: 'bg-blue-400' },
                                { id: 'implant', label: 'Implante', color: 'bg-emerald-400' },
                                { id: 'missing', label: 'Ausente', color: 'bg-slate-700' },
                            ].map((btn) => (
                                <Button
                                    key={btn.id}
                                    disabled={!selectedTooth || isSaving}
                                    onClick={() => updateToothStatus(btn.id)}
                                    className={`h-14 rounded-2xl border-slate-100 ${toothStates[selectedTooth!] === btn.id ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white text-slate-600'} hover:bg-slate-50 flex justify-start gap-4 px-6 font-black text-xs uppercase tracking-widest transition-all`}
                                >
                                    <div className={`w-3 h-3 rounded-full ${btn.color} shadow-sm`} />
                                    {btn.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </motion.div>
                {isSaving && <p className="text-[10px] text-emerald-600 font-bold text-center uppercase tracking-widest animate-pulse">Guardando en Supabase...</p>}
            </div>
        </div>
    );
}
