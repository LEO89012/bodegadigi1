import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.91.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create admin client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log('Starting cleanup of registros_admin...')

    // Delete all records from registros_admin (daily cleanup)
    const { error: adminError } = await supabase
      .from('registros_admin')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

    if (adminError) {
      console.error('Error deleting registros_admin:', adminError)
      throw adminError
    }

    console.log(`Deleted registros_admin records`)

    // Also delete all records from registros_horas that are marked as exported
    const { error: horasError } = await supabase
      .from('registros_horas')
      .delete()
      .eq('exportado', true)

    if (horasError) {
      console.error('Error deleting exported registros_horas:', horasError)
    }

    const now = new Date().toISOString()
    console.log(`Cleanup completed at ${now}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily cleanup completed',
        timestamp: now,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: unknown) {
    console.error('Cleanup error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
