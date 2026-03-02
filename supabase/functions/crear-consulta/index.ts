import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    }

    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

    try {
        const bodyText = await req.text()
        const bodyObj = bodyText ? JSON.parse(bodyText) : {}
        const { paciente_nombre, paciente_email, paciente_telefono, motivo, fecha_hora, precio } = bodyObj

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
                    exp: Math.floor(new Date(fecha_hora).getTime() / 1000) + 7200,
                    enable_chat: true,
                }
            })
        })

        if (!dailyRes.ok) {
            throw new Error(`Daily.co Room Error: ${await dailyRes.text()}`)
        }

        const dailyRoom = await dailyRes.json()

        // 2. Crear tokens de Daily.co
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
                }
            })
        })
        const pacienteToken = await tokenRes.json()

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
                }
            })
        })
        const doctorToken = await tokenDoctorRes.json()

        // 3. Guardar en Supabase (Eliminamos integración con Stripe de la lógica central para usar Wompi)
        const supabaseUrl = Deno.env.get("SUPABASE_URL")
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
        const supabase = createClient(supabaseUrl!, supabaseKey!)

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
            estado: "pendiente"
        }).select().single()

        if (error) throw error

        return new Response(JSON.stringify({
            consulta_id: data.id,
            success: true
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
    }
})
