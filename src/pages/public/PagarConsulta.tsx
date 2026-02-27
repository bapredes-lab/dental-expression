import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { supabase } from '@/lib/supabase'
import { ShieldCheck, Calendar, Clock, Lock, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Inicializar Stripe
const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
console.log("=== STRIPE PUBLISHABLE KEY IN FRONTEND ===", PUBLISHABLE_KEY);
const stripePromise = loadStripe(PUBLISHABLE_KEY)

function CheckoutForm({ consultaId }: { consultaId: string }) {
    const stripe = useStripe()
    const elements = useElements()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) return

        setLoading(true)
        setError(null)

        const { error: submitError } = await elements.submit()
        if (submitError) {
            setError(submitError.message || 'Error en validación.')
            setLoading(false)
            return
        }

        const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required", // Prevent redirect to handle custom logic
        })

        if (confirmError) {
            setError(confirmError.message || "Error al procesar el pago.")
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Actualizar el estado en Supabase
            const { error: updateError } = await supabase
                .from('consultas')
                .update({ estado: 'pagada' })
                .eq('id', consultaId)

            if (updateError) {
                console.error("Error actualizando DB:", updateError)
                // Aún así redirigimos porque el pago sí pasó
            }

            navigate(`/confirmacion/${consultaId}`, { replace: true })
        } else {
            setError("Estado de pago inesperado.")
        }

        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement className="mb-6" />

            {error && (
                <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl border border-red-100 text-center">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
                {loading ? 'Procesando Pago...' : 'Confirmar y Pagar'} <Lock className="w-4 h-4" />
            </button>
        </form>
    )
}

export default function PagarConsulta() {
    const { consultaId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const [consulta, setConsulta] = useState<any>(null)
    const [loadingData, setLoadingData] = useState(true)

    const clientSecret = location.state?.clientSecret

    useEffect(() => {
        if (!consultaId) {
            navigate('/')
            return
        }

        async function fetchConsulta() {
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

    if (!clientSecret) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-sm w-full">
                    <p className="text-slate-500 font-bold">Sesión de pago inválida o expirada.</p>
                </div>
            </div>
        )
    }

    if (loadingData) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
            </div>
        )
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#10b981', // emerald-500
                colorBackground: '#ffffff',
                colorText: '#334155',
                colorDanger: '#ef4444',
                fontFamily: 'system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '16px',
            }
        }
    }

    // DEBUG ALERT (Borrar después)
    useEffect(() => {
        if (clientSecret) {
            console.log("CLIENT SECRET:", clientSecret);
            console.log("PUB KEY:", import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
            if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
                alert("¡ERROR! VITE_STRIPE_PUBLISHABLE_KEY IS EMPTY IN FRONTEND");
            }
        }
    }, [clientSecret]);

    return (
        <div className="min-h-screen bg-[#052c46] py-12 px-6">
            <div className="max-w-4xl mx-auto flex gap-6 flex-col lg:flex-row items-start">

                {/* Detalles de la cita (Izquierda) */}
                <div className="w-full lg:w-1/3 space-y-6 text-white">
                    <div>
                        <img src="/logo.jpg" alt="Logo" className="h-10 w-auto rounded-xl shadow-lg mb-6 invisible" /* Placeholder si gustas, o quitar */ />
                        <h1 className="text-3xl font-black tracking-tighter mb-2">Finalizar Reserva</h1>
                        <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Teleconsulta Dra. Nataly Vargas</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md space-y-4">
                        <div className="flex justify-between items-start pb-4 border-b border-white/10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Paciente</p>
                                <p className="font-bold">{consulta?.paciente_nombre}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 pb-4 border-b border-white/10">
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Fecha</p>
                                <p className="font-bold text-sm capitalize">{consulta && format(new Date(consulta.fecha_hora), 'EEEE, d MMM yyyy', { locale: es })}</p>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Hora</p>
                                <p className="font-bold text-sm">{consulta && format(new Date(consulta.fecha_hora), 'h:mm a')}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-black text-slate-300">Total a pagar:</span>
                            <span className="text-2xl font-black text-emerald-400">${consulta?.precio.toFixed(2)} USD</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Pago seguro y encriptado.
                    </div>
                </div>

                {/* Área de Pago (Derecha) */}
                <div className="w-full lg:w-2/3 bg-white p-6 md:p-10 rounded-[2rem] shadow-2xl">
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-slate-400" />
                        Detalles de Pago
                    </h2>

                    <Elements stripe={stripePromise} options={options}>
                        <CheckoutForm consultaId={consultaId!} />
                    </Elements>
                </div>

            </div>
        </div>
    )
}
