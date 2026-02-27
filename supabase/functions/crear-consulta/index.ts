import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    }

    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

    try {
        const { paciente_nombre, paciente_email, paciente_telefono, motivo, fecha_hora, precio } = await req.json()

        // 1. Crear sala privada en Daily.co
        const dailyRes = await fetch("https://api.daily.co/v1/rooms", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("DAILY_API_KEY")}`
            },
            body: JSON.stringify({
                privacy: "private",
                properties: {
                    exp: Math.floor(new Date(fecha_hora).getTime() / 1000) + 7200, // +2 horas max
                    enable_chat: true,
                    enable_screenshare: false,
                    start_video_off: false,
                    start_audio_off: false,
                }
            })
        })

        if (!dailyRes.ok) {
            const errorText = await dailyRes.text()
            throw new Error(`Daily.co Room Error (${dailyRes.status}): ${errorText}`)
        }

        const dailyRoom = await dailyRes.json()

        // 2. Crear token de paciente (acceso limitado, sin controles de admin)
        const tokenRes = await fetch(`https://api.daily.co/v1/meeting-tokens`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("DAILY_API_KEY")}`
            },
            body: JSON.stringify({
                properties: {
                    room_name: dailyRoom.name,
                    is_owner: false,
                    enable_screenshare: false,
                    start_video_off: false,
                    start_audio_off: false,
                }
            })
        })
        if (!tokenRes.ok) {
            const errorText = await tokenRes.text()
            throw new Error(`Daily.co Patient Token Error (${tokenRes.status}): ${errorText}`)
        }
        const pacienteToken = await tokenRes.json()

        // 3. Crear token de doctora (is_owner: true, controles completos)
        const tokenDoctorRes = await fetch(`https://api.daily.co/v1/meeting-tokens`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("DAILY_API_KEY")}`
            },
            body: JSON.stringify({
                properties: {
                    room_name: dailyRoom.name,
                    is_owner: true,
                    enable_screenshare: true,
                }
            })
        })
        if (!tokenDoctorRes.ok) {
            const errorText = await tokenDoctorRes.text()
            throw new Error(`Daily.co Doctor Token Error (${tokenDoctorRes.status}): ${errorText}`)
        }
        const doctorToken = await tokenDoctorRes.json()

        // 4. Crear PaymentIntent en Stripe
        const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                amount: String(Math.round(precio * 100)),
                currency: "usd",
                "metadata[paciente_email]": paciente_email,
                "metadata[fecha_hora]": fecha_hora,
            })
        })

        if (!stripeRes.ok) {
            const errorText = await stripeRes.text()
            throw new Error(`Stripe API Error (${stripeRes.status}): ${errorText}`)
        }

        const paymentIntent = await stripeRes.json()

        // 5. Guardar en Supabase
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        )

        const { data, error } = await supabase.from("consultas").insert({
            paciente_nombre,
            paciente_email,
            paciente_telefono,
            motivo,
            fecha_hora,
            precio,
            daily_room_url: dailyRoom.url,
            daily_room_name: dailyRoom.name,
            daily_token_paciente: pacienteToken.token,
            daily_token_doctor: doctorToken.token,
            stripe_payment_intent_id: paymentIntent.id,
            estado: "pendiente"
        }).select().single()

        if (error) throw error

        return new Response(JSON.stringify({
            consulta_id: data.id,
            client_secret: paymentIntent.client_secret,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

    } catch (error: any) {
        console.error("EDGE FUNCTION ERROR:", error.message, error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
    }
})
