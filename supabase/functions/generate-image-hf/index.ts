
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@4.0.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, apiKey } = await req.json()
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const hfAccessToken = apiKey || Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    if (!hfAccessToken) {
        return new Response(JSON.stringify({ error: 'Hugging Face Access Token is not configured.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
    
    const hf = new HfInference(hfAccessToken)

    const imageBlob = await hf.textToImage({
      inputs: prompt,
      model: 'stabilityai/stable-diffusion-2-1',
    })

    const arrayBuffer = await imageBlob.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const image = `data:image/png;base64,${base64}`;

    return new Response(
      JSON.stringify({ image }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    let errorMessage = 'An unexpected error occurred';
    if (error.message && error.message.includes("401")) {
      errorMessage = "Authentication failed. The provided Hugging Face API key is likely invalid or has insufficient permissions."
    } else if (error.message && error.message.includes("RateLimitReached")) {
      errorMessage = "Hugging Face API rate limit reached. Please try again later or use a different key."
    } else if (error.message) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({ error: 'Image generation failed', details: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
