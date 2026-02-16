import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.91.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Tiendas a corregir: nombre = contraseña
const fixes = [
  { nombre: 'AKB68', newPassword: 'AKB68' },
  { nombre: 'AK170', newPassword: 'AK170' },
  { nombre: 'AKB30', newPassword: 'AKB30' },
  { nombre: 'KTB94', newPassword: 'KTB94' },
  { nombre: 'KTMOS', newPassword: 'KTMOS' },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const results: { nombre: string; status: string; error?: string }[] = []

    for (const fix of fixes) {
      // Find the tienda to get the user id
      const { data: tienda, error: findError } = await supabase
        .from('tiendas')
        .select('id')
        .eq('nombre', fix.nombre)
        .maybeSingle()

      if (findError || !tienda) {
        results.push({ nombre: fix.nombre, status: 'not_found', error: findError?.message || 'Tienda no encontrada' })
        continue
      }

      // Update the auth user password
      const { error: updateError } = await supabase.auth.admin.updateUserById(tienda.id, {
        password: fix.newPassword,
      })

      if (updateError) {
        results.push({ nombre: fix.nombre, status: 'error', error: updateError.message })
        continue
      }

      results.push({ nombre: fix.nombre, status: 'updated' })
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ success: false, error: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
