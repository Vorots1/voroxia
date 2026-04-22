import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { renderToBuffer, Document, Page, View, Text, StyleSheet, type DocumentProps } from '@react-pdf/renderer'
import type { ReactElement, JSXElementConstructor } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Audit, AuditLegalRisk, AuditClassification } from '@/types'
import React from 'react'

export const runtime = 'nodejs'

const PHASE_NAMES: Record<number, string> = {
  1: 'Comprensión Lingüística',
  2: 'Funcionalidad',
  3: 'Guardarraíles',
  4: 'Seguridad',
  5: 'Experiencia y Resiliencia',
  6: 'Legal & Compliance',
}

const PHASE_WEIGHTS: Record<number, string> = {
  1: '10%', 2: '15%', 3: '15%', 4: '20%', 5: '10%', 6: '30%',
}

function classificationLabel(c: AuditClassification | null): string {
  const labels: Record<AuditClassification, string> = {
    excellent: 'Excelente',
    good: 'Bueno',
    regular: 'Regular',
    deficient: 'Deficiente',
    critical: 'Crítico',
  }
  return c ? labels[c] : '—'
}

function scoreColor(score: number): string {
  if (score >= 75) return '#16a34a'
  if (score >= 50) return '#ca8a04'
  return '#dc2626'
}

function severityLabel(s: string): string {
  return ({ critical: 'CRÍTICA', high: 'ALTA', medium: 'MEDIA', low: 'BAJA' })[s] ?? s.toUpperCase()
}

function severityColor(s: string): string {
  return ({ critical: '#dc2626', high: '#ea580c', medium: '#ca8a04', low: '#2563eb' })[s] ?? '#6b7280'
}

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: 48, color: '#111827', backgroundColor: '#ffffff' },
  coverPage: { fontFamily: 'Helvetica', fontSize: 10, padding: 0, color: '#ffffff', backgroundColor: '#0f172a' },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  brand: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#60a5fa' },
  headerMeta: { fontSize: 8, color: '#94a3b8', textAlign: 'right' },

  // Cover
  coverContent: { padding: 48, flex: 1, justifyContent: 'space-between' },
  coverBadge: { backgroundColor: '#1e3a5f', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 48 },
  coverBadgeText: { fontSize: 9, color: '#93c5fd', fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  coverTitle: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: '#ffffff', marginBottom: 8, lineHeight: 1.2 },
  coverSubtitle: { fontSize: 13, color: '#94a3b8', marginBottom: 32 },
  coverMeta: { fontSize: 10, color: '#64748b', marginBottom: 6 },
  coverScore: { marginTop: 40, flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  coverScoreNum: { fontSize: 72, fontFamily: 'Helvetica-Bold' },
  coverScoreMax: { fontSize: 24, color: '#475569' },
  coverClassification: { fontSize: 16, marginTop: 8 },
  coverFooter: { borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  coverFooterText: { fontSize: 8, color: '#475569' },

  // Sections
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 6, marginBottom: 12 },

  // Phase grid
  phaseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  phaseCard: { width: '30%', backgroundColor: '#f8fafc', borderRadius: 6, padding: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  phaseName: { fontSize: 8, color: '#64748b', marginBottom: 4 },
  phaseScore: { fontSize: 18, fontFamily: 'Helvetica-Bold' },
  phaseWeight: { fontSize: 7, color: '#94a3b8', marginTop: 2 },

  // Metrics
  metricsGrid: { flexDirection: 'row', gap: 8 },
  metricCard: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 6, padding: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  metricValue: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#111827' },
  metricLabel: { fontSize: 7, color: '#64748b', marginTop: 3 },

  // Table
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 8, borderRadius: 4, marginBottom: 4 },
  tableHeaderCell: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#374151' },
  tableRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tableCell: { fontSize: 8, color: '#374151' },
  severityBadge: { borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2 },
  severityText: { fontSize: 7, fontFamily: 'Helvetica-Bold' },

  // Report
  reportText: { fontSize: 8, color: '#374151', lineHeight: 1.6, fontFamily: 'Helvetica' },

  // Footer
  pageFooter: { position: 'absolute', bottom: 24, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7, color: '#9ca3af' },
})

function AuditPDF({ audit, risks, generatedAt }: {
  audit: Audit
  risks: AuditLegalRisk[]
  generatedAt: string
}) {
  const score = audit.score_global ?? 0
  const phaseScores: Record<number, number> = {
    1: audit.score_linguistic ?? 0,
    2: audit.score_functional ?? 0,
    3: audit.score_guardrails ?? 0,
    4: audit.score_security ?? 0,
    5: audit.score_experience ?? 0,
    6: audit.score_legal ?? 0,
  }
  const auditDate = format(new Date(audit.created_at), "d MMMM yyyy", { locale: es })

  return React.createElement(
    Document,
    { title: `Voroxia — Informe ${audit.assistant_name}`, author: 'Voroxia' },

    // ── PORTADA ──
    React.createElement(Page, { size: 'A4', style: s.coverPage },
      React.createElement(View, { style: s.coverContent },
        React.createElement(View, null,
          React.createElement(View, { style: s.coverBadge },
            React.createElement(Text, { style: s.coverBadgeText }, 'VOROXIA · INFORME DE AUDITORÍA DE IA'),
          ),
          React.createElement(Text, { style: s.coverTitle }, audit.assistant_name),
          React.createElement(Text, { style: s.coverSubtitle },
            [audit.company_name, audit.sector].filter(Boolean).join(' · ')
          ),
          React.createElement(Text, { style: s.coverMeta }, `Fecha de auditoría: ${auditDate}`),
          React.createElement(Text, { style: s.coverMeta }, `Referencia: ${audit.id}`),
          React.createElement(Text, { style: s.coverMeta }, `Idioma: ${audit.language?.toUpperCase() ?? 'ES'} · País: ${audit.country ?? '—'}`),
          React.createElement(View, { style: s.coverScore },
            React.createElement(Text, { style: { ...s.coverScoreNum, color: scoreColor(score) } }, String(score)),
            React.createElement(Text, { style: s.coverScoreMax }, '/100'),
          ),
          React.createElement(Text, { style: { ...s.coverClassification, color: scoreColor(score) } },
            classificationLabel(audit.classification as AuditClassification)
          ),
        ),
        React.createElement(View, { style: s.coverFooter },
          React.createElement(Text, { style: s.coverFooterText }, 'Voroxia · voroxia.com'),
          React.createElement(Text, { style: s.coverFooterText }, `Generado: ${generatedAt}`),
          React.createElement(Text, { style: s.coverFooterText }, 'Compatible EU AI Act 2024'),
        ),
      )
    ),

    // ── PÁGINA 2: SCORES + MÉTRICAS ──
    React.createElement(Page, { size: 'A4', style: s.page },
      React.createElement(View, { style: s.header },
        React.createElement(Text, { style: s.brand }, 'VOROXIA'),
        React.createElement(Text, { style: s.headerMeta }, `${audit.assistant_name} · ${auditDate}`),
      ),

      React.createElement(View, { style: s.section },
        React.createElement(Text, { style: s.sectionTitle }, 'Puntuaciones por fase'),
        React.createElement(View, { style: s.phaseGrid },
          ...[1, 2, 3, 4, 5, 6].map(phase =>
            React.createElement(View, { key: phase, style: s.phaseCard },
              React.createElement(Text, { style: s.phaseName }, PHASE_NAMES[phase]),
              React.createElement(Text, { style: { ...s.phaseScore, color: scoreColor(phaseScores[phase]) } },
                `${phaseScores[phase]}/100`
              ),
              React.createElement(Text, { style: s.phaseWeight }, `Peso: ${PHASE_WEIGHTS[phase]}`),
            )
          )
        ),
      ),

      React.createElement(View, { style: s.section },
        React.createElement(Text, { style: s.sectionTitle }, 'Métricas clave'),
        React.createElement(View, { style: s.metricsGrid },
          ...[
            { label: 'Brecha lingüística', value: `${audit.gap_formal_informal ?? 0}%` },
            { label: 'Tasa de alucinación', value: `${audit.hallucination_rate ?? 0}%` },
            { label: 'Tasa de contención', value: `${audit.containment_rate ?? 0}%` },
            { label: 'Resiliencia emocional', value: `${audit.emotional_resilience ?? 0}/100` },
          ].map(m =>
            React.createElement(View, { key: m.label, style: s.metricCard },
              React.createElement(Text, { style: s.metricValue }, m.value),
              React.createElement(Text, { style: s.metricLabel }, m.label),
            )
          )
        ),
      ),

      React.createElement(View, { style: s.pageFooter },
        React.createElement(Text, { style: s.footerText }, 'Voroxia · Informe confidencial'),
        React.createElement(Text, { style: s.footerText }, 'Página 2'),
      ),
    ),

    // ── PÁGINA 3: RIESGOS LEGALES ──
    ...(risks.length > 0 ? [
      React.createElement(Page, { size: 'A4', style: s.page },
        React.createElement(View, { style: s.header },
          React.createElement(Text, { style: s.brand }, 'VOROXIA'),
          React.createElement(Text, { style: s.headerMeta }, `${audit.assistant_name} · ${auditDate}`),
        ),

        React.createElement(View, { style: s.section },
          React.createElement(Text, { style: s.sectionTitle }, `Dossier de riesgos legales (${risks.length} hallazgos)`),
          React.createElement(View, { style: s.tableHeader },
            React.createElement(Text, { style: { ...s.tableHeaderCell, width: '38%' } }, 'Hallazgo'),
            React.createElement(Text, { style: { ...s.tableHeaderCell, width: '25%' } }, 'Normativa'),
            React.createElement(Text, { style: { ...s.tableHeaderCell, width: '22%' } }, 'Multa máx.'),
            React.createElement(Text, { style: { ...s.tableHeaderCell, width: '15%' } }, 'Severidad'),
          ),
          ...risks.map((risk, i) =>
            React.createElement(View, { key: i, style: s.tableRow },
              React.createElement(Text, { style: { ...s.tableCell, width: '38%' } }, risk.finding),
              React.createElement(Text, { style: { ...s.tableCell, width: '25%', color: '#6b7280' } },
                risk.regulation + (risk.regulation_article ? ` · ${risk.regulation_article}` : '')
              ),
              React.createElement(Text, { style: { ...s.tableCell, width: '22%', fontFamily: 'Helvetica-Bold' } }, risk.max_fine),
              React.createElement(View, { style: { width: '15%' } },
                React.createElement(View, { style: { ...s.severityBadge, backgroundColor: `${severityColor(risk.severity)}20` } },
                  React.createElement(Text, { style: { ...s.severityText, color: severityColor(risk.severity) } },
                    severityLabel(risk.severity)
                  ),
                ),
              ),
            )
          ),
        ),

        React.createElement(View, { style: s.pageFooter },
          React.createElement(Text, { style: s.footerText }, 'Voroxia · Informe confidencial'),
          React.createElement(Text, { style: s.footerText }, 'Página 3'),
        ),
      )
    ] : []),

    // ── PÁGINA 4: INFORME EJECUTIVO ──
    ...(audit.report_markdown ? [
      React.createElement(Page, { size: 'A4', style: s.page },
        React.createElement(View, { style: s.header },
          React.createElement(Text, { style: s.brand }, 'VOROXIA'),
          React.createElement(Text, { style: s.headerMeta }, `${audit.assistant_name} · ${auditDate}`),
        ),

        React.createElement(View, { style: s.section },
          React.createElement(Text, { style: s.sectionTitle }, 'Informe ejecutivo'),
          React.createElement(Text, { style: s.reportText },
            audit.report_markdown.slice(0, 4000)
          ),
        ),

        React.createElement(View, { style: s.pageFooter },
          React.createElement(Text, { style: s.footerText }, 'Voroxia · Informe confidencial · voroxia.com'),
          React.createElement(Text, { style: s.footerText }, 'Compatible con EU AI Act 2024'),
        ),
      )
    ] : []),
  )
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const auditId = searchParams.get('id')
  if (!auditId) return NextResponse.json({ error: 'Missing audit id' }, { status: 400 })

  const service = createServiceClient()

  const { data: profile } = await service
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single() as { data: { plan: string } | null }

  if (!profile || profile.plan === 'free') {
    return NextResponse.json({ error: 'PDF export requires a paid plan' }, { status: 403 })
  }

  const { data: audit } = await service
    .from('audits')
    .select('*')
    .eq('id', auditId)
    .eq('user_id', user.id)
    .single()

  if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
  if (audit.status !== 'completed') return NextResponse.json({ error: 'Audit not completed' }, { status: 400 })

  const { data: risks } = await service
    .from('audit_legal_risks')
    .select('*')
    .eq('audit_id', auditId)
    .order('severity', { ascending: true })

  const generatedAt = format(new Date(), "d MMM yyyy HH:mm", { locale: es })

  const doc = AuditPDF({ audit: audit as Audit, risks: risks ?? [], generatedAt }) as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>
  const buffer = await renderToBuffer(doc)

  const filename = `voroxia-auditoria-${audit.assistant_name.toLowerCase().replace(/\s+/g, '-')}-${auditId.slice(0, 8)}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-cache',
    },
  })
}
