import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders, jsonResponse, normalizeNameKey } from '../_shared/utils.ts'

type CsvRow = Record<string, string>

function parseCsv(text: string): CsvRow[] {
  // LinkedIn exports often start with notes before the header row.
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  let headerIndex = lines.findIndex((line) =>
    /first name/i.test(line) && /last name/i.test(line),
  )
  if (headerIndex < 0) {
    headerIndex = lines.findIndex((line) => line.includes(','))
  }
  if (headerIndex < 0) return []

  const headers = splitCsvLine(lines[headerIndex]).map((h) => h.trim())
  const rows: CsvRow[] = []

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    const cols = splitCsvLine(line)
    const row: CsvRow = {}
    headers.forEach((header, idx) => {
      row[header] = (cols[idx] ?? '').trim()
    })
    rows.push(row)
  }
  return rows
}

function splitCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
      continue
    }
    current += ch
  }
  result.push(current)
  return result
}

function pick(row: CsvRow, names: string[]): string {
  const entries = Object.entries(row)
  for (const name of names) {
    const found = entries.find(([k]) => k.toLowerCase() === name.toLowerCase())
    if (found?.[1]) return found[1]
  }
  return ''
}

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

    const contentType = req.headers.get('content-type') ?? ''
    let csvText = ''
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file')
      if (!(file instanceof File)) {
        return jsonResponse({ error: 'file required' }, 400)
      }
      csvText = await file.text()
    } else {
      const body = await req.json()
      csvText = body.csvText ?? body.csv ?? ''
    }

    if (!csvText.trim()) {
      return jsonResponse({ error: 'empty csv' }, 400)
    }

    const rows = parseCsv(csvText)
    const admin = createClient(supabaseUrl, serviceKey)

    // Replace previous import for this user
    await admin.from('linkedin_contacts').delete().eq('user_id', user.id)

    const payload = rows
      .map((row) => {
        const first = pick(row, ['First Name', 'FirstName'])
        const last = pick(row, ['Last Name', 'LastName'])
        const fullName = `${first} ${last}`.trim()
        const nameKey = normalizeNameKey(fullName)
        if (!nameKey) return null
        const connectedRaw = pick(row, ['Connected On', 'ConnectedOn'])
        let connectedOn: string | null = null
        if (connectedRaw) {
          const d = new Date(connectedRaw)
          if (!Number.isNaN(d.getTime())) {
            connectedOn = d.toISOString().slice(0, 10)
          }
        }
        return {
          user_id: user.id,
          first_name: first || null,
          last_name: last || null,
          full_name: fullName,
          name_key: nameKey,
          position: pick(row, ['Position', 'Title']) || null,
          company: pick(row, ['Company']) || null,
          profile_url: pick(row, ['URL', 'Profile URL']) || null,
          email: pick(row, ['Email Address', 'Email']) || null,
          connected_on: connectedOn,
        }
      })
      .filter(Boolean)

    if (payload.length === 0) {
      return jsonResponse({ error: 'No contacts parsed', imported: 0 }, 400)
    }

    const { error: insertError } = await admin
      .from('linkedin_contacts')
      .upsert(payload, { onConflict: 'user_id,name_key' })

    if (insertError) {
      // Fallback without onConflict shape issues
      const { error: plainError } = await admin
        .from('linkedin_contacts')
        .insert(payload)
      if (plainError) {
        return jsonResponse({ error: plainError.message }, 500)
      }
    }

    const { data: matchCount, error: matchError } = await admin.rpc(
      'refresh_event_overlaps',
      { p_user_id: user.id, p_event_id: null },
    )
    if (matchError) {
      console.error('refresh_event_overlaps', matchError)
    }

    return jsonResponse({
      imported: payload.length,
      overlaps_updated: matchCount ?? 0,
    })
  } catch (error) {
    console.error(error)
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500,
    )
  }
})
