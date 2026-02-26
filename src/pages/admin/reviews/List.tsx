import { motion } from 'framer-motion'
import { Star, Quote, User } from 'lucide-react'

const mockReviews = [
    { id: 1, patient: 'Isabella Rodriguez', date: '24 Feb 2026', rating: 5, comment: 'Excelente atención de la Dra. Vargas. El simulador IA me ayudó a decidir mi tratamiento.', approved: true },
    { id: 2, patient: 'Mateo Sánchez', date: '20 Feb 2026', rating: 4, comment: 'Muy profesional todo el equipo. Mis resultados fueron mejores de lo esperado.', approved: true },
    { id: 3, patient: 'Valentina López', date: '15 Feb 2026', rating: 5, comment: 'La tecnología que usan es impresionante. Me sentí en el futuro.', approved: false },
]

export default function ReviewsList() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-[#052c46]">Módulo de Reseñas</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión de Testimonios y Feedback</p>
                </div>
            </div>

            <div className="grid gap-6">
                {mockReviews.map((review, i) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-xl luxury-shadow flex flex-col md:flex-row gap-6 items-start"
                    >
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex-shrink-0 flex items-center justify-center text-white shadow-lg">
                            <Quote className="w-8 h-8 opacity-40 absolute" />
                            <User className="w-6 h-6 relative z-10" />
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-black text-slate-800 tracking-tight">{review.patient}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.date}</p>
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed font-medium italic">"{review.comment}"</p>

                            <div className="mt-4 flex items-center gap-4">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${review.approved ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'}`}>
                                    {review.approved ? 'Publicada' : 'Pendiente de Moderación'}
                                </span>
                                <button className="text-[9px] font-black text-[#0F4C75] uppercase tracking-widest hover:underline px-2">Ver Detalles</button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
