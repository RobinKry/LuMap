import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders, jsonResponse, normalizeNameKey } from '../_shared/utils.ts'

type CsvRow = Record<string, string>

function parseCsv(text: string): CsvRow[] {
  // LinkedIn exports often start with notes before the header row.
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  let headerIndex = lines.findIndex((line) =>
    /first name/i.test(line) && /last name/i.test(line),
  )
  // Invitations.csv: From,To,Direction,inviteeProfileUrl,...
  if (headerIndex < 0) {
    headerIndex = lines.findIndex(
      (line) => /\bFrom\b/i.test(line) && /\bTo\b/i.test(line),
    )
  }
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

function splitFullName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { first: '', last: '' }
  if (parts.length === 1) return { first: parts[0], last: '' }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

/** Connections.csv or Invitations.csv → contact rows */
function rowsToContacts(rows: CsvRow[], selfNameKey: string) {
  const seen = new Set<string>()
  const out: Array<{
    first_name: string | null
    last_name: string | null
    full_name: string
    name_key: string
    position: string | null
    company: string | null
    profile_url: string | null
    email: string | null
    connected_on: string | null
  }> = []

  for (const row of rows) {
    const first = pick(row, ['First Name', 'FirstName'])
    const last = pick(row, ['Last Name', 'LastName'])
    let fullName = `${first} ${last}`.trim()
    let profileUrl = pick(row, ['URL', 'Profile URL', 'ProfileUrl']) || null
    let connectedOn: string | null = null

    // Invitations.csv: other person depends on Direction
    if (!fullName) {
      const from = pick(row, ['From'])
      const to = pick(row, ['To'])
      const direction = pick(row, ['Direction']).toUpperCase()
      if (direction === 'INCOMING') {
        fullName = from
        profileUrl = pick(row, ['inviterProfileUrl', 'Inviter Profile Url']) || null
      } else {
        // OUTGOING or unknown → contact is invitee (To)
        fullName = to
        profileUrl = pick(row, ['inviteeProfileUrl', 'Invitee Profile Url']) || null
      }
      const sent = pick(row, ['Sent At', 'SentAt'])
      if (sent) {
        const d = new Date(sent)
        if (!Number.isNaN(d.getTime())) {
          connectedOn = d.toISOString().slice(0, 10)
        }
      }
    } else {
      const connectedRaw = pick(row, ['Connected On', 'ConnectedOn'])
      if (connectedRaw) {
        const d = new Date(connectedRaw)
        if (!Number.isNaN(d.getTime())) {
          connectedOn = d.toISOString().slice(0, 10)
        }
      }
    }

    const nameKey = normalizeNameKey(fullName)
    if (!nameKey || nameKey === selfNameKey || seen.has(nameKey)) continue
    seen.add(nameKey)

    const names = first || last
      ? { first, last }
      : splitFullName(fullName)

    out.push({
      first_name: names.first || null,
      last_name: names.last || null,
      full_name: fullName,
      name_key: nameKey,
      position: pick(row, ['Position', 'Title']) || null,
      company: pick(row, ['Company']) || null,
      profile_url: profileUrl,
      email: pick(row, ['Email Address', 'Email']) || null,
      connected_on: connectedOn,
    })
  }

  return out
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
    let selfName = ''
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file')
      if (!(file instanceof File)) {
        return jsonResponse({ error: 'file required' }, 400)
      }
      csvText = await file.text()
      const maybeSelf = form.get('selfName')
      if (typeof maybeSelf === 'string') selfName = maybeSelf
    } else {
      const body = await req.json()
      csvText = body.csvText ?? body.csv ?? ''
      selfName = typeof body.selfName === 'string' ? body.selfName : ''
    }

    if (!csvText.trim()) {
      return jsonResponse({ error: 'empty csv' }, 400)
    }

    const rows = parseCsv(csvText)
    const admin = createClient(supabaseUrl, serviceKey)

    // Detect self so Invitations "From" = Robin isn't imported as a contact
    let selfNameKey = normalizeNameKey(selfName)
    if (!selfNameKey) {
      const fromCounts = new Map<string, number>()
      for (const row of rows) {
        const from = normalizeNameKey(pick(row, ['From']))
        if (from) fromCounts.set(from, (fromCounts.get(from) ?? 0) + 1)
      }
      let best = ''
      let bestN = 0
      for (const [k, n] of fromCounts) {
        if (n > bestN) {
          best = k
          bestN = n
        }
      }
      // Only treat as self if clearly dominant (OUTGOING-heavy export)
      if (bestN >= 3) selfNameKey = best
    }

    const contacts = rowsToContacts(rows, selfNameKey)
    const payload = contacts.map((c) => ({ ...c, user_id: user.id }))

    // Replace previous import for this user
    await admin.from('linkedin_contacts').delete().eq('user_id', user.id)

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
