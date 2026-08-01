import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders, jsonResponse } from '../_shared/utils.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Missing Authorization' }, 401)
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()
    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const eventId = body.event_id ?? null

    const admin = createClient(supabaseUrl, serviceKey)
    const { data, error } = await admin.rpc('refresh_event_overlaps', {
      p_user_id: user.id,
      p_event_id: eventId,
    })

    if (error) {
      return jsonResponse({ error: error.message }, 500)
    }

    const { data: overlaps } = await admin
      .from('event_overlaps')
      .select('event_id, linkedin_match_count, match_preview, computed_at')
      .eq('user_id', user.id)

    return jsonResponse({
      overlaps_updated: data ?? 0,
      overlaps: overlaps ?? [],
    })
  } catch (error) {
    console.error(error)
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500,
    )
  }
})
