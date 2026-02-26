import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Activity, Sparkles, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToothProps {
    id: number;
    status?: 'healthy' | 'cavity' | 'missing' | 'filled' | 'implant';
    onSelect: (id: number) => void;
    isSelected: boolean;
}

const Tooth = ({ id, status = 'healthy', onSelect, isSelected }: ToothProps) => {
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
                <path
                    d="M35 30 Q50 20 65 30"
                    className="fill-none stroke-slate-100 stroke-[1px] opacity-50"
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

export default function SmartOdontogram() {
    const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

    // Fake data representing pieces with AI detected issues
    const aiFindings = [
        { id: 16, issue: 'Carie detectada (Prob. 92%)', urgency: 'high' },
        { id: 24, issue: 'Sensibilidad reportada', urgency: 'medium' },
        { id: 46, issue: 'Posible necesidad de endodoncia', urgency: 'high' },
    ];

    const teethUpper = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
    const teethLower = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Dental Chart Elite */}
            <div className="xl:col-span-3 space-y-12 bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/40 luxury-shadow relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-[#0F4C75] flex items-center justify-center text-white shadow-lg">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Odontograma Inteligente</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <BrainCircuit className="w-3 h-3 text-emerald-500" /> Analizado por IA Nataly Vargas
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {['Sano', 'Carie', 'Tratamiento', 'Implante'].map((label, idx) => (
                            <div key={label} className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-white/20 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                <div className={`w-2 h-2 rounded-full ${idx === 1 ? 'bg-red-500' : idx === 2 ? 'bg-blue-400' : idx === 3 ? 'bg-emerald-400' : 'bg-white border'}`} />
                                {label}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-16 py-8">
                    <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
                        {teethUpper.map(id => (
                            <Tooth
                                key={id}
                                id={id}
                                status={id === 16 ? 'cavity' : id === 11 ? 'filled' : 'healthy'}
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
                                status={id === 46 ? 'cavity' : id === 36 ? 'implant' : 'healthy'}
                                isSelected={selectedTooth === id}
                                onSelect={setSelectedTooth}
                            />
                        ))}
                    </div>
                </div>

                {/* AI Decorative Background */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] scale-150 rotate-12">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-primary">
                        <path d="M10,10 L90,90 M90,10 L10,90 M50,0 L50,100 M0,50 L100,50" />
                    </svg>
                </div>
            </div>

            {/* AI Clinical Advisor Panel */}
            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-[#052c46] to-[#0A3D62] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/10"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                        <Zap className="w-32 h-32" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-emerald-500 p-2 rounded-xl shadow-lg ring-4 ring-emerald-500/20">
                                <Activity className="w-5 h-5 text-white animate-pulse" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Asistente AURA IA</p>
                                <h4 className="text-lg font-black tracking-tight">Hallazgos Clínicos</h4>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {aiFindings.map((finding) => (
                                <div key={finding.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-black text-[#059669] bg-emerald-400/10 px-2 py-0.5 rounded-md">PIEZA {finding.id}</span>
                                        {finding.urgency === 'high' && <ShieldAlert className="w-4 h-4 text-red-400" />}
                                    </div>
                                    <p className="text-sm font-bold text-slate-200">{finding.issue}</p>
                                    <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                                        <Zap className="w-3 h-3 text-emerald-400" /> Presupuesto IA Generado
                                    </p>
                                </div>
                            ))}
                        </div>

                        <Button className="w-full mt-8 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl h-12 shadow-xl shadow-emerald-500/20 flex items-center gap-2 group">
                            EJECUTAR PLAN DE IA <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        </Button>
                    </div>
                </motion.div>

                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-xl luxury-shadow">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Recomendación Dra. Nataly Vargas</h5>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                        "Aura ha detectado patrones de desgaste en el cuadrante inferior derecho. Sugiero profilaxis profunda y escaneo 3D para descartar bruxismo."
                    </p>
                </div>
            </div>
        </div>
    );
}
