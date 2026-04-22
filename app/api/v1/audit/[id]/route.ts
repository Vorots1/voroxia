import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { hashApiKey } from '@/lib/api-key'

async function resolveApiKey(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer vx_live_')) return null
  const hash = hashApiKey(auth.slice('Bearer '.length))
  const service = createServiceClient()
  const { data } = await service
    .from('users')
    .select('id, plan')
    .eq('api_key_hash', hash)
    .single() as { data: { id: string; plan: string } | null }
  if (!data || data.plan !== 'enterprise') return null
  return data
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await resolveApiKey(req)
  if (!user) {
    return NextResponse.json({ error: 'Invalid or missing API key. Enterprise plan required.' }, { status: 401 })
  }

  const { id } = await params
  const service = createServiceClient()

  const { data: audit } = await service
    .from('audits')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 })

  const { data: risks } = await service
    .from('audit_legal_risks')
    .select('finding, regulation, regulation_article, max_fine, severity')
    .eq('audit_id', id)

  return NextResponse.json({
    audit_id: audit.id,
    status: audit.status,
    assistant_name: audit.assistant_name,
    company_name: audit.company_name,
    sector: audit.sector,
    created_at: audit.created_at,
    completed_at: audit.completed_at,
    score_global: audit.score_global,
    classification: audit.classification,
    scores: audit.status === 'completed' ? {
      linguistic: audit.score_linguistic,
      functional: audit.score_functional,
      guardrails: audit.score_guardrails,
      security: audit.score_security,
      experience: audit.score_experience,
      legal: audit.score_legal,
    } : null,
    metrics: audit.status === 'completed' ? {
      gap_formal_informal: audit.gap_formal_informal,
      hallucination_rate: audit.hallucination_rate,
      containment_rate: audit.containment_rate,
      emotional_resilience: audit.emotional_resilience,
    } : null,
    legal_risks: risks ?? [],
    pdf_url: audit.status === 'completed' ? `/api/v1/audit/${id}/pdf` : null,
    dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/audits/${id}`,
  })
}
