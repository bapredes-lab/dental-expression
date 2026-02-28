import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    }

    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

    console.log("=> NUEVA PETICION RECIBIDA:", req.method, req.url)

    try {
        const bodyText = await req.text()
        console.log("Body recibido:", bodyText)
        const bodyObj = bodyText ? JSON.parse(bodyText) : {}
        const { paciente_nombre, paciente_email, paciente_telefono, motivo, fecha_hora, precio } = bodyObj
        console.log("Datos extraídos:", { paciente_nombre, paciente_email, fecha_hora, precio })

        // 1. Crear sala privada en Daily.co
        console.log("Iniciando llamada a Daily.co para rooms...")
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
            console.error("Error en Daily.co Room:", dailyRes.status, errorText)
            throw new Error(`Daily.co Room Error (${dailyRes.status}): ${errorText}`)
        }

        const dailyRoom = await dailyRes.json()
        console.log("Sala Daily.co creada:", dailyRoom.name)

        // 2. Crear token de paciente (acceso limitado, sin controles de admin)
        console.log("Iniciando llamada para Token Paciente...")
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
            console.error("Error en Daily.co Patient Token:", tokenRes.status, errorText)
            throw new Error(`Daily.co Patient Token Error (${tokenRes.status}): ${errorText}`)
        }
        const pacienteToken = await tokenRes.json()
        console.log("Token Paciente creado.")

        // 3. Crear token de doctora (is_owner: true, controles completos)
        console.log("Iniciando llamada para Token Doctor...")
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
            console.error("Error en Daily.co Doctor Token:", tokenDoctorRes.status, errorText)
            throw new Error(`Daily.co Doctor Token Error (${tokenDoctorRes.status}): ${errorText}`)
        }
        const doctorToken = await tokenDoctorRes.json()
        console.log("Token Doctor creado.")

        // 4. Crear PaymentIntent en Stripe
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
        console.log(`=> USANDO STRIPE KEY: ${stripeKey.substring(0, 7)}...${stripeKey.substring(stripeKey.length - 4)}`)

        console.log("Iniciando llamada a Stripe...")
        const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${stripeKey}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                amount: String(Math.round(precio * 100)),
                currency: "usd",
                automatic_payment_methods: JSON.stringify({ enabled: true }),
                description: `Teleconsulta: ${paciente_nombre}`,
                "metadata[paciente_email]": paciente_email,
                "metadata[fecha_hora]": fecha_hora
            })
        })

        if (!stripeRes.ok) {
            const errorText = await stripeRes.text()
            console.error("Error en Stripe API:", stripeRes.status, errorText)
            throw new Error(`Stripe API Error (${stripeRes.status}): ${errorText}`)
        }

        const paymentIntent = await stripeRes.json()
        console.log("PaymentIntent creado:", paymentIntent.id)

        // 5. Guardar en Supabase
        console.log("Guardando en Supabase DB...")
        const supabaseUrl = Deno.env.get("SUPABASE_URL")
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
        if (!supabaseUrl || !supabaseKey) {
            console.error("Faltan variables SUPABASE_URL o SERVICE_ROLE_KEY localmente")
            throw new Error("Variables de DB faltantes")
        }
        const supabase = createClient(supabaseUrl, supabaseKey)

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
            stripe_payment_intent_client_secret: paymentIntent.client_secret,
            estado: "pendiente"
        }).select().single()

        if (error) {
            console.error("Error insertando en la BD:", error)
            throw error
        }

        console.log("Inserción exitosa en DB. Devolviendo respuesta 200.")

        return new Response(JSON.stringify({
            consulta_id: data.id,
            client_secret: paymentIntent.client_secret,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 })

    } catch (error: any) {
        console.error("=== EDGE FUNCTION CATCH ERROR ===")
        console.error(error.message || error)
        console.dir(error)

        // Evitar que JSON.stringify falle si error es muy complejo
        const errorMessage = error instanceof Error ? error.message : String(error)

        return new Response(JSON.stringify({ error: errorMessage, stack: error.stack }), {
            status: 200, // Returning 200 so supabase-js reads the JSON body and parses data.error instead of throwing generic "non-2xx" error
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
    }
})
