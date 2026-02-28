import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ShieldCheck, Calendar, Clock, Lock, CreditCard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// WOMPI CONFIGURATION (Skeleton)
// Estos valores se llenarán cuando tengas el comercio registrado
const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY || 'pub_test_XXXXX';

export default function PagarConsulta() {
    const { consultaId } = useParams()
    const navigate = useNavigate()
    const [consulta, setConsulta] = useState<any>(null)
    const [loadingData, setLoadingData] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        if (!consultaId) {
            navigate('/')
            return
        }

        async function fetchConsulta() {
            setLoadingData(true)
            const { data, error } = await supabase
                .from('consultas')
                .select('*')
                .eq('id', consultaId)
                .single()

            if (error || !data) {
                console.error("Consulta no encontrada", error)
                navigate('/')
            } else {
                setConsulta(data)
            }
            setLoadingData(false)
        }
        fetchConsulta()
    }, [consultaId, navigate])

    const handleWompiPayment = () => {
        setIsProcessing(true)

        // SKELETON: Integración con el Widget de Wompi
        // Referencia: https://docs.wompi.co/docs/es/widget-pago
        if ((window as any).WidgetCheckout) {
            const checkout = new (window as any).WidgetCheckout({
                currency: 'COP',
                amountInCents: (consulta?.precio || 0) * 100 * 3950, // Ejemplo: Convirtiendo USD (hardcoded rate para demo) a COP
                reference: `DENTAL-${consultaId}-${Date.now()}`,
                publicKey: WOMPI_PUBLIC_KEY,
                redirectUrl: `${window.location.origin}/confirmacion/${consultaId}`,
                customerData: {
                    email: consulta?.paciente_email || 'paciente@ejemplo.com',
                    fullName: consulta?.paciente_nombre || 'Paciente',
                    phoneNumber: consulta?.paciente_telefono || '',
                    phoneNumberPrefix: '+57'
                }
            })

            checkout.open((result: any) => {
                const transaction = result.transaction
                if (transaction.status === 'APPROVED') {
                    // Actualizar estado en Supabase
                    supabase
                        .from('consultas')
                        .update({ estado: 'pagada', metadata: { wompi_id: transaction.id } })
                        .eq('id', consultaId)
                        .then(() => {
                            navigate(`/confirmacion/${consultaId}`)
                        })
                } else {
                    alert("El pago no pudo ser procesado. Estado: " + transaction.status)
                    setIsProcessing(false)
                }
            })
        } else {
            alert("Error cargando el widget de pago. Intenta de nuevo.")
            setIsProcessing(false)
        }
    }

    if (loadingData) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#052c46] py-12 px-6">
            {/* Script de Wompi */}
            <script src="https://checkout.wompi.co/widget.js" async></script>

            <div className="max-w-4xl mx-auto flex gap-6 flex-col lg:flex-row items-start">

                {/* Detalles de la cita (Izquierda) */}
                <div className="w-full lg:w-1/3 space-y-6 text-white">
                    <div className="relative">
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                        <h1 className="text-3xl font-black tracking-tighter mb-2 relative z-10">Checkout <span className="text-emerald-400">Wompi</span></h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Portal de Pagos Dental Expression</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl luxury-shadow space-y-6">
                        <div className="pb-6 border-b border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Procedimiento</p>
                            <p className="text-lg font-black text-white leading-tight">Teleconsulta Dra. Nataly Vargas</p>
                            <p className="text-sm font-bold text-emerald-400 mt-2">{consulta?.paciente_nombre}</p>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Fecha</p>
                                <p className="font-bold text-sm capitalize">{consulta && format(new Date(consulta.fecha_hora), 'd MMM yyyy', { locale: es })}</p>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Hora</p>
                                <p className="font-bold text-sm">{consulta && format(new Date(consulta.fecha_hora), 'h:mm a')}</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                            <span className="font-black text-slate-400 text-xs uppercase tracking-widest">Total</span>
                            <span className="text-3xl font-black text-emerald-400">${consulta?.precio.toFixed(2)} <span className="text-xs">USD</span></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-4">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Pagos Procesados por Wompi Colombia
                    </div>
                </div>

                {/* Área de Pago (Derecha) */}
                <div className="w-full lg:w-2/3 bg-white/95 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black text-[#052c46] tracking-tight flex items-center gap-3">
                            <CreditCard className="w-6 h-6 text-emerald-500" />
                            Método de Pago
                        </h2>
                        <div className="flex gap-2 opacity-50">
                            {/* Placeholder para logos de tarjetas */}
                            <div className="h-6 w-10 bg-slate-200 rounded" />
                            <div className="h-6 w-10 bg-slate-200 rounded" />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <Lock className="w-20 h-20" />
                            </div>
                            <p className="text-sm font-bold text-slate-600 mb-2">Resumen de Transacción</p>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                                Al hacer clic en el botón, serás redirigido al widget seguro de Wompi para completar tu pago con tarjeta de crédito, débito o PSE.
                            </p>
                        </div>

                        <Button
                            onClick={handleWompiPayment}
                            disabled={isProcessing}
                            className="w-full h-16 bg-[#052c46] hover:bg-emerald-600 text-white font-black rounded-2xl transition-all shadow-2xl shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                        >
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                            {isProcessing ? 'Conectando con Wompi...' : 'Pagar con Wompi'}
                        </Button>

                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                Tu información financiera nunca toca nuestros servidores.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
