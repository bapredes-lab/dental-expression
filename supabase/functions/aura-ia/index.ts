import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        if (!OPENAI_API_KEY) {
            throw new Error('AURA_MISSING_API_KEY: OpenAI key is not defined in project secrets.');
        }

        const { toothData, patientName } = await req.json()

        const findings = Object.entries(toothData)
            .filter(([_, status]) => status !== 'healthy')
            .map(([id, status]) => `Pieza ${id}: ${status}`)
            .join(', ')

        if (findings.length === 0) {
            return new Response(JSON.stringify({
                summary: "No se detectaron hallazgos significativos en el odontograma actual. Todo normal.",
                recommendations: ["Control preventivo en 6 meses."],
                urgency: "baja"
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'Eres AURA IA, un experto asistente dental.' },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: "json_object" }
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(`OPENAI_ERROR: ${data.error?.message || response.statusText}`);
        }

        const content = data.choices[0].message.content
        const result = JSON.parse(content)

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: true, message: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    }
})
