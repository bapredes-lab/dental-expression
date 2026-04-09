import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ShieldCheck, Calendar, Clock, Lock, CreditCard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Tasa de cambio COP/USD para convertir el precio al monto requerido por Wompi
// Wompi requiere el monto en centavos de COP
const TASA_COP_USD = 4200
const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY || 'pub_test_XXXXX'

function cargarScriptWompi(): Promise<void> {
    return new Promise((resolve, reject) => {
        if ((window as any).WidgetCheckout) {
            resolve()
            return
        }
        const script = document.createElement('script')
        script.src = 'https://checkout.wompi.co/widget.js'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('No se pudo cargar el widget de Wompi'))
        document.head.appendChild(script)
    })
}

export default function PagarConsulta() {
    const { consultaId } = useParams()
    const navigate = useNavigate()
    const [consulta, setConsulta] = useState<any>(null)
    const [loadingData, setLoadingData] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [scriptListo, setScriptListo] = useState(false)
    const [errorScript, setErrorScript] = useState(false)

    // Cargar datos de la consulta
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
                console.error('Consulta no encontrada', error)
                navigate('/')
            } else {
                setConsulta(data)
            }
            setLoadingData(false)
        }
        fetchConsulta()
    }, [consultaId, navigate])

    // Cargar script de Wompi al montar el componente
    useEffect(() => {
        cargarScriptWompi()
            .then(() => setScriptListo(true))
            .catch(() => setErrorScript(true))
    }, [])

    const handleWompiPayment = () => {
        if (!scriptListo || !(window as any).WidgetCheckout) {
            alert('El widget de pago aún no está listo. Recarga la página e intenta de nuevo.')
            return
        }

        const precioCOP = consulta?.precio || 0
        const montoEnCentavos = Math.round(precioCOP * TASA_COP_USD * 100)
        const referencia = `DENTAL-${consultaId}-${Date.now()}`

        setIsProcessing(true)

        const checkout = new (window as any).WidgetCheckout({
            currency: 'COP',
            amountInCents: montoEnCentavos,
            reference: referencia,
            publicKey: WOMPI_PUBLIC_KEY,
            redirectUrl: `${window.location.origin}/confirmacion/${consultaId}`,
            customerData: {
                email: consulta?.paciente_email || '',
                fullName: consulta?.paciente_nombre || '',
                phoneNumber: consulta?.paciente_telefono || '',
                phoneNumberPrefix: '+57'
            }
        })

        checkout.open((result: any) => {
            const transaction = result.transaction
            if (transaction.status === 'APPROVED') {
                supabase
                    .from('consultas')
                    .update({
                        estado: 'pagada',
                        stripe_payment_intent_id: transaction.id  // columna reutilizada para ID de Wompi
                    })
                    .eq('id', consultaId)
                    .then(() => navigate(`/confirmacion/${consultaId}`))
            } else {
                alert('El pago no pudo completarse. Estado: ' + transaction.status)
                setIsProcessing(false)
            }
        })
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
            <div className="max-w-4xl mx-auto flex gap-6 flex-col lg:flex-row items-start">

                {/* Detalles de la cita */}
                <div className="w-full lg:w-1/3 space-y-6 text-white">
                    <div className="relative">
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                        <h1 className="text-3xl font-black tracking-tighter mb-2 relative z-10">
                            Checkout <span className="text-emerald-400">Wompi</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                            Portal de Pagos Dental Expression
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl luxury-shadow space-y-6">
                        <div className="pb-6 border-b border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Procedimiento</p>
                            <p className="text-lg font-black text-white leading-tight">Teleconsulta Dra. Nataly Vargas</p>
                            <p className="text-sm font-bold text-emerald-400 mt-2">{consulta?.paciente_nombre}</p>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Fecha
                                </p>
                                <p className="font-bold text-sm capitalize">
                                    {consulta && format(new Date(consulta.fecha_hora), 'd MMM yyyy', { locale: es })}
                                </p>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Hora
                                </p>
                                <p className="font-bold text-sm">
                                    {consulta && format(new Date(consulta.fecha_hora), 'h:mm a')}
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                            <span className="font-black text-slate-400 text-xs uppercase tracking-widest">Total</span>
                            <div className="text-right">
                                <span className="text-3xl font-black text-emerald-400">
                                    ${consulta?.precio.toFixed(2)} <span className="text-xs">USD</span>
                                </span>
                                <p className="text-[10px] text-slate-500 mt-1">
                                    ≈ ${(consulta?.precio * TASA_COP_USD).toLocaleString('es-CO')} COP
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-4">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Pagos Procesados por Wompi Colombia
                    </div>
                </div>

                {/* Área de Pago */}
                <div className="w-full lg:w-2/3 bg-white/95 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black text-[#052c46] tracking-tight flex items-center gap-3">
                            <CreditCard className="w-6 h-6 text-emerald-500" />
                            Método de Pago
                        </h2>
                        {/* Logos de métodos de pago Wompi */}
                        <div className="flex gap-2 opacity-40 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            <span className="px-2 py-1 border border-slate-200 rounded">PSE</span>
                            <span className="px-2 py-1 border border-slate-200 rounded">Visa</span>
                            <span className="px-2 py-1 border border-slate-200 rounded">MC</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <Lock className="w-20 h-20" />
                            </div>
                            <p className="text-sm font-bold text-slate-600 mb-2">Métodos disponibles</p>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                                Tarjeta de crédito, débito, PSE (transferencia bancaria) y Bancolombia. Al hacer clic serás redirigido al widget seguro de Wompi.
                            </p>
                        </div>

                        {errorScript && (
                            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-bold">
                                No se pudo cargar el widget de pago. Verifica tu conexión y recarga la página.
                            </div>
                        )}

                        <Button
                            onClick={handleWompiPayment}
                            disabled={isProcessing || !scriptListo || errorScript}
                            className="w-full h-16 bg-[#052c46] hover:bg-emerald-600 text-white font-black rounded-2xl transition-all shadow-2xl shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-widest disabled:opacity-60"
                        >
                            {isProcessing
                                ? <><Loader2 className="w-5 h-5 animate-spin" /> Conectando con Wompi...</>
                                : !scriptListo
                                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Cargando...</>
                                    : <><Lock className="w-5 h-5" /> Pagar con Wompi</>
                            }
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
