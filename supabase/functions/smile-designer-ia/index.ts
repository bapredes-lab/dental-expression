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
        const { imageBase64 } = await req.json()

        // El prompt clínico para DALL-E 3
        const prompt = `Close-up high-resolution clinical photograph of a human smile. 
    The patient has perfectly aligned teeth, natural white shade (A1/B1 VITA guide), 
    ideal gingival architecture, and symmetrical incisal edges. 
    The smile should look like a successful dental rehabilitation (veneers or orthodontic completion). 
    Professional studio lighting, 8k resolution, photorealistic, medical dental catalog style. 
    No face showing, only lips and teeth.`

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt: prompt,
                n: 1,
                size: '1024x1024',
                quality: 'hd',
            }),
        })

        const data = await response.json()

        if (data.error) throw new Error(data.error.message);

        return new Response(JSON.stringify({ url: data.data[0].url }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
