import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.91.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Lista de tiendas a crear
const tiendas = [
  { nombre: 'AKEDE', password: 'AKEDE' },
  { nombre: 'AKB68', password: 'AKB69' },
  { nombre: 'AKVEN', password: 'AKVEN' },
  { nombre: 'AK170', password: 'AK171' },
  { nombre: 'AKB30', password: 'AKB31' },
  { nombre: 'AKMOS', password: 'AKMOS' },
  { nombre: 'AKCAL', password: 'AKCAL' },
  { nombre: 'AKCAN', password: 'AKCAN' },
  { nombre: 'AKBAR', password: 'AKBAR' },
  { nombre: 'AKPER', password: 'AKPER' },
  { nombre: 'AKVIL', password: 'AKVIL' },
  { nombre: 'AKYOP', password: 'AKYOP' },
  { nombre: 'AKSIN', password: 'AKSIN' },
  { nombre: 'AKFLO', password: 'AKFLO' },
  { nombre: 'KTSAL', password: 'KTSAL' },
  { nombre: 'KTSOA', password: 'KTSOA' },
  { nombre: 'KTUNO', password: 'KTUNO' },
  { nombre: 'KTTIT', password: 'KTTIT' },
  { nombre: 'KTAME', password: 'KTAME' },
  { nombre: 'KTB94', password: 'KTB95' },
  { nombre: 'KTMAY', password: 'KTMAY' },
  { nombre: 'KTSBA', password: 'KTSBA' },
  { nombre: 'KTCHI', password: 'KTCHI' },
  { nombre: 'KTMOS', password: 'KTMOS' },
  { nombre: 'KTNQS', password: 'KTNQS' },
  { nombre: 'KTVIL', password: 'KTVIL' },
  { nombre: 'KTCAL', password: 'KTCAL' },
  { nombre: 'KTBAR', password: 'KTBAR' },
  { nombre: 'KTPOB', password: 'KTPOB' },
  { nombre: 'KTTES', password: 'KTTES' },
  { nombre: 'KTARK', password: 'KTARK' },
  { nombre: 'KTMAN', password: 'KTMAN' },
  { nombre: 'KTBUC', password: 'KTBUC' },
  { nombre: 'KTFUS', password: 'KTFUS' },
  { nombre: 'KTJUL', password: 'KTJUL' },
  { nombre: 'KTTUN', password: 'KTTUN' },
  { nombre: 'KTGIR', password: 'KTGIR' },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const results: { nombre: string; status: string; error?: string }[] = []

    for (const tienda of tiendas) {
      const email = `${tienda.nombre.toLowerCase()}@bodega.local`
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tienda.password,
        email_confirm: true,
      })

      if (authError) {
        // Check if user already exists
        if (authError.message.includes('already been registered') || authError.message.includes('duplicate')) {
          results.push({ nombre: tienda.nombre, status: 'already_exists' })
          continue
        }
        results.push({ nombre: tienda.nombre, status: 'error', error: authError.message })
        continue
      }

      if (!authData.user) {
        results.push({ nombre: tienda.nombre, status: 'error', error: 'No user created' })
        continue
      }

      // Create tienda record
      const { error: tiendaError } = await supabase
        .from('tiendas')
        .insert({
          id: authData.user.id,
          nombre: tienda.nombre.toUpperCase(),
        })

      if (tiendaError) {
        results.push({ nombre: tienda.nombre, status: 'error', error: tiendaError.message })
        continue
      }

      results.push({ nombre: tienda.nombre, status: 'created' })
    }

    const created = results.filter(r => r.status === 'created').length
    const existing = results.filter(r => r.status === 'already_exists').length
    const errors = results.filter(r => r.status === 'error').length

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: tiendas.length,
          created,
          already_exists: existing,
          errors,
        },
        details: results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
