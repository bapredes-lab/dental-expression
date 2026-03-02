import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        if (!ANTHROPIC_API_KEY) {
            throw new Error('AURA_MISSING_API_KEY: Anthropic key is not defined in project secrets.');
        }

        const { toothData, patientName } = await req.json()

        // Formatear los datos del odontograma para Claude
        const findings = Object.entries(toothData)
            .filter(([_, status]) => status !== 'healthy')
            .map(([id, status]) => `Pieza ${id}: ${status}`)
            .join(', ')

        if (findings.length === 0) {
            return new Response(JSON.stringify({
                summary: "No se detectaron hallazgos significativos en el odontograma actual. Todos los tejidos y piezas evaluados presentan condiciones de normalidad clínica.",
                recommendations: ["Continuar con higiene oral regular.", "Control preventivo en 6 meses."],
                urgency: "baja"
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        const prompt = `Actúa como un asistente dental experto llamado AURA IA. 
    Paciente: ${patientName}
    Hallazgos en el odontograma: ${findings}
    
    Por favor genera:
    1. Un resumen clínico profesional de los hallazgos.
    2. Recomendaciones de tratamiento específicas basadas en prioridades (urgencia vs estética).
    3. Un tono empático pero técnico.
    
    Responde en formato JSON estrictamente:
    {
      "summary": "texto del resumen",
      "recommendations": ["rec 1", "rec 2"],
      "urgency": "alta/media/baja"
    }`

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20240620', // Actualizado a 3.5 Sonnet
                max_tokens: 1024,
                messages: [{ role: 'user', content: prompt }],
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Anthropic API Error:', data);
            // Devolvemos un 200 con el error dentro para que el frontend pueda leerlo fácilmente
            return new Response(JSON.stringify({
                error: true,
                message: `ANTHROPIC_ERROR: ${data.error?.message || response.statusText}`,
                type: data.error?.type
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Usamos 200 para evitar que el cliente de Supabase enmascare el error
            })
        }

        const content = data.content[0].text
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: content, recommendations: [], urgency: 'media' }

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('Edge Function Error:', error.message);
        return new Response(JSON.stringify({ error: true, message: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    }
})
