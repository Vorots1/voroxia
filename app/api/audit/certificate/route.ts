import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { renderToBuffer, Document, Page, View, Text, StyleSheet, type DocumentProps } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Audit, AuditClassification, AuditLegalRisk } from '@/types'
import React, { type ReactElement, type JSXElementConstructor } from 'react'

export const runtime = 'nodejs'

const PHASE_NAMES: Record<number, string> = {
  1: 'Comprensión Lingüística',
  2: 'Funcionalidad',
  3: 'Guardarraíles',
  4: 'Seguridad',
  5: 'Experiencia y Resiliencia',
  6: 'Legal & Compliance',
}

function certNumber(auditId: string): string {
  return `VX-${auditId.slice(0, 4).toUpperCase()}-${auditId.slice(9, 13).toUpperCase()}-${new Date().getFullYear()}`
}

function complianceStatus(score: number): { label: string; color: string; bg: string } {
  if (score >= 75) return { label: 'CONFORME', color: '#15803d', bg: '#f0fdf4' }
  if (score >= 50) return { label: 'PARCIALMENTE CONFORME', color: '#b45309', bg: '#fffbeb' }
  return { label: 'NO CONFORME', color: '#dc2626', bg: '#fef2f2' }
}

function classLabel(c: AuditClassification | null): string {
  const m: Record<AuditClassification, string> = {
    excellent: 'Excelente', good: 'Bueno', regular: 'Regular',
    deficient: 'Deficiente', critical: 'Crítico',
  }
  return c ? m[c] : '—'
}

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: 0, backgroundColor: '#ffffff' },

  // Border decorativo
  borderTop: { height: 8, backgroundColor: '#1e40af' },
  borderBottom: { height: 4, backgroundColor: '#1e40af', position: 'absolute', bottom: 0, left: 0, right: 0 },
  sideLeft: { width: 4, backgroundColor: '#1e40af', position: 'absolute', top: 0, bottom: 0, left: 0 },
  sideRight: { width: 4, backgroundColor: '#1e40af', position: 'absolute', top: 0, bottom: 0, right: 0 },

  body: { paddingHorizontal: 52, paddingTop: 32, paddingBottom: 32, flex: 1 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  brand: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1e40af', letterSpacing: 2 },
  brandSub: { fontSize: 8, color: '#64748b', marginTop: 3, letterSpacing: 1 },
  certNumBox: { alignItems: 'flex-end' },
  certNumLabel: { fontSize: 7, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' },
  certNum: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1e40af', marginTop: 2 },

  divider: { height: 1, backgroundColor: '#e2e8f0', marginBottom: 24 },
  dividerBlue: { height: 2, backgroundColor: '#1e40af', marginBottom: 24 },

  // Title
  certTitle: { fontSize: 9, color: '#64748b', letterSpacing: 2, textAlign: 'center', marginBottom: 6 },
  certMainTitle: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#0f172a', textAlign: 'center', marginBottom: 4 },
  certSubTitle: { fontSize: 11, color: '#1e40af', textAlign: 'center', marginBottom: 28, fontFamily: 'Helvetica-Bold' },

  // Declaration
  declarationBox: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 16, marginBottom: 24, borderLeftWidth: 3, borderLeftColor: '#1e40af' },
  declarationText: { fontSize: 9.5, color: '#374151', lineHeight: 1.7 },
  declarationBold: { fontFamily: 'Helvetica-Bold', color: '#0f172a' },

  // Score badge
  scoreBadge: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  scoreBox: { alignItems: 'center', borderWidth: 2, borderColor: '#1e40af', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 16 },
  scoreNum: { fontSize: 48, fontFamily: 'Helvetica-Bold', color: '#1e40af' },
  scoreMax: { fontSize: 16, color: '#64748b' },
  scoreLabel: { fontSize: 10, color: '#64748b', marginTop: 4 },

  // Status
  statusRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 20, paddingVertical: 8 },
  statusText: { fontSize: 12, fontFamily: 'Helvetica-Bold', textAlign: 'center' },

  // Phases table
  tableTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#374151', marginBottom: 8, letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tablePhase: { flex: 1, fontSize: 8.5, color: '#374151' },
  tableScore: { width: 60, fontSize: 8.5, textAlign: 'right', fontFamily: 'Helvetica-Bold' },
  tableStatus: { width: 80, fontSize: 8, textAlign: 'right' },

  // Risks summary
  riskTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#374151', marginBottom: 6, marginTop: 16, letterSpacing: 0.5 },
  riskRow: { flexDirection: 'row', marginBottom: 3 },
  riskDot: { width: 12, fontSize: 8, color: '#dc2626' },
  riskText: { flex: 1, fontSize: 8, color: '#374151' },

  // Footer
  footer: { marginTop: 20 },
  footerDivider: { height: 1, backgroundColor: '#e2e8f0', marginBottom: 16 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  footerLeft: { flex: 1 },
  footerRight: { alignItems: 'flex-end' },
  footerLabel: { fontSize: 7, color: '#94a3b8', letterSpacing: 0.5, marginBottom: 2 },
  footerValue: { fontSize: 8.5, color: '#374151', fontFamily: 'Helvetica-Bold' },
  validity: { fontSize: 7, color: '#94a3b8', marginTop: 12 },
  verifyUrl: { fontSize: 7.5, color: '#1e40af', marginTop: 4 },

  sealBox: { borderWidth: 2, borderColor: '#1e40af', borderRadius: 50, width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  sealText: { fontSize: 6, color: '#1e40af', textAlign: 'center', fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
  sealScore: { fontSize: 18, color: '#1e40af', fontFamily: 'Helvetica-Bold' },
})

function scoreToStatus(score: number): string {
  if (score >= 75) return 'CONFORME'
  if (score >= 50) return 'PARCIAL'
  return 'NO CONF.'
}

function scoreToColor(score: number): string {
  if (score >= 75) return '#15803d'
  if (score >= 50) return '#b45309'
  return '#dc2626'
}

function CertificatePDF({ audit, risks, issueDate, validUntil }: {
  audit: Audit
  risks: AuditLegalRisk[]
  issueDate: string
  validUntil: string
}) {
  const score = audit.score_global ?? 0
  const status = complianceStatus(score)
  const certNum = certNumber(audit.id)
  const auditDate = format(new Date(audit.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })
  const phaseScores: Record<number, number> = {
    1: audit.score_linguistic ?? 0,
    2: audit.score_functional ?? 0,
    3: audit.score_guardrails ?? 0,
    4: audit.score_security ?? 0,
    5: audit.score_experience ?? 0,
    6: audit.score_legal ?? 0,
  }

  const criticalRisks = risks.filter(r => r.severity === 'critical')
  const highRisks = risks.filter(r => r.severity === 'high')

  return React.createElement(
    Document,
    { title: `Voroxia — Certificado ${certNum}`, author: 'Voroxia' },
    React.createElement(Page, { size: 'A4', style: s.page },

      // Bordes decorativos
      React.createElement(View, { style: s.borderTop }),
      React.createElement(View, { style: s.sideLeft }),
      React.createElement(View, { style: s.sideRight }),

      React.createElement(View, { style: s.body },

        // Header
        React.createElement(View, { style: s.header },
          React.createElement(View, null,
            React.createElement(Text, { style: s.brand }, 'VOROXIA'),
            React.createElement(Text, { style: s.brandSub }, 'AUDITORÍA DE SISTEMAS DE IA'),
          ),
          React.createElement(View, { style: s.certNumBox },
            React.createElement(Text, { style: s.certNumLabel }, 'Nº de certificado'),
            React.createElement(Text, { style: s.certNum }, certNum),
          ),
        ),

        React.createElement(View, { style: s.dividerBlue }),

        // Title
        React.createElement(Text, { style: s.certTitle }, 'DOCUMENTO OFICIAL · VOROXIA COMPLIANCE SERVICES'),
        React.createElement(Text, { style: s.certMainTitle }, 'CERTIFICADO DE EVALUACIÓN'),
        React.createElement(Text, { style: s.certSubTitle }, 'EU AI Act · Reglamento (UE) 2024/1689'),

        // Declaration
        React.createElement(View, { style: s.declarationBox },
          React.createElement(Text, { style: s.declarationText },
            'Voroxia, plataforma especializada en auditoría de sistemas de inteligencia artificial, ',
            'certifica que el sistema de IA denominado ',
          ),
          React.createElement(Text, { style: { ...s.declarationText, fontFamily: 'Helvetica-Bold' } },
            `"${audit.assistant_name}"`,
          ),
          React.createElement(Text, { style: s.declarationText },
            audit.company_name ? `, operado por ${audit.company_name},` : '',
            ` del sector ${audit.sector},`,
            ` ha sido evaluado el ${auditDate} mediante el protocolo de auditoría Voroxia v2 (82 preguntas, 6 dimensiones),`,
            ' en conformidad con los requisitos aplicables del Reglamento (UE) 2024/1689 del Parlamento Europeo y del Consejo.',
          ),
        ),

        // Score + status
        React.createElement(View, { style: s.scoreBadge },
          React.createElement(View, { style: s.scoreBox },
            React.createElement(View, { style: { flexDirection: 'row', alignItems: 'baseline' } },
              React.createElement(Text, { style: { ...s.scoreNum, color: status.color } }, String(score)),
              React.createElement(Text, { style: s.scoreMax }, '/100'),
            ),
            React.createElement(Text, { style: { ...s.scoreLabel, color: status.color } },
              classLabel(audit.classification as AuditClassification)
            ),
          ),
        ),

        React.createElement(View, { style: s.statusRow },
          React.createElement(View, { style: { ...s.statusBadge, backgroundColor: status.bg } },
            React.createElement(Text, { style: { ...s.statusText, color: status.color } }, status.label),
          ),
        ),

        // Phases table
        React.createElement(Text, { style: s.tableTitle }, 'RESULTADOS POR DIMENSIÓN'),
        React.createElement(View, { style: s.divider }),
        ...[1, 2, 3, 4, 5, 6].map(phase =>
          React.createElement(View, { key: phase, style: s.tableRow },
            React.createElement(Text, { style: s.tablePhase }, `${phase}. ${PHASE_NAMES[phase]}`),
            React.createElement(Text, { style: { ...s.tableScore, color: scoreToColor(phaseScores[phase]) } },
              `${phaseScores[phase]}/100`
            ),
            React.createElement(Text, { style: { ...s.tableStatus, color: scoreToColor(phaseScores[phase]) } },
              scoreToStatus(phaseScores[phase])
            ),
          )
        ),

        // Riesgos críticos resumidos
        ...(criticalRisks.length + highRisks.length > 0 ? [
          React.createElement(Text, { style: s.riskTitle }, `HALLAZGOS PRIORITARIOS (${criticalRisks.length + highRisks.length})`),
          ...criticalRisks.slice(0, 3).map((r, i) =>
            React.createElement(View, { key: i, style: s.riskRow },
              React.createElement(Text, { style: s.riskDot }, '●'),
              React.createElement(Text, { style: s.riskText }, `[CRÍTICO] ${r.finding} — ${r.regulation}`),
            )
          ),
          ...highRisks.slice(0, 2).map((r, i) =>
            React.createElement(View, { key: `h${i}`, style: s.riskRow },
              React.createElement(Text, { style: { ...s.riskDot, color: '#ea580c' } }, '●'),
              React.createElement(Text, { style: s.riskText }, `[ALTO] ${r.finding} — ${r.regulation}`),
            )
          ),
        ] : [
          React.createElement(Text, { key: 'norisk', style: { fontSize: 8.5, color: '#15803d', marginTop: 12 } },
            '✓ No se han detectado riesgos críticos ni de severidad alta.'
          ),
        ]),

        // Footer
        React.createElement(View, { style: s.footer },
          React.createElement(View, { style: s.footerDivider }),
          React.createElement(View, { style: s.footerRow },

            // Left: datos del certificado
            React.createElement(View, { style: s.footerLeft },
              React.createElement(Text, { style: s.footerLabel }, 'FECHA DE EMISIÓN'),
              React.createElement(Text, { style: s.footerValue }, issueDate),
              React.createElement(Text, { style: { ...s.footerLabel, marginTop: 10 } }, 'VÁLIDO HASTA'),
              React.createElement(Text, { style: s.footerValue }, validUntil),
              React.createElement(Text, { style: s.validity },
                'Este certificado acredita la evaluación realizada en la fecha indicada.',
              ),
              React.createElement(Text, { style: s.validity },
                `Referencia de auditoría: ${audit.id}`,
              ),
              React.createElement(Text, { style: s.verifyUrl },
                `Verificar en: ${process.env.NEXT_PUBLIC_APP_URL ?? 'https://voroxia.com'}/verify/${certNum}`,
              ),
            ),

            // Right: sello
            React.createElement(View, { style: s.footerRight },
              React.createElement(View, { style: s.sealBox },
                React.createElement(Text, { style: s.sealText }, 'VOROXIA'),
                React.createElement(Text, { style: s.sealScore }, String(score)),
                React.createElement(Text, { style: s.sealText }, 'EU AI ACT'),
                React.createElement(Text, { style: { ...s.sealText, marginTop: 2 } }, String(new Date().getFullYear())),
              ),
            ),
          ),
        ),
      ),

      React.createElement(View, { style: s.borderBottom }),
    )
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
    .from('users').select('plan').eq('id', user.id).single() as { data: { plan: string } | null }

  if (profile?.plan !== 'enterprise') {
    return NextResponse.json({ error: 'Compliance certificate requires Enterprise plan.' }, { status: 403 })
  }

  const { data: audit } = await service
    .from('audits').select('*').eq('id', auditId).eq('user_id', user.id).single()

  if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
  if (audit.status !== 'completed') return NextResponse.json({ error: 'Audit not completed' }, { status: 400 })

  const { data: risks } = await service
    .from('audit_legal_risks').select('*').eq('audit_id', auditId).order('severity')

  const now = new Date()
  const validUntil = new Date(now)
  validUntil.setFullYear(validUntil.getFullYear() + 1)

  const issueDate = format(now, "d 'de' MMMM 'de' yyyy", { locale: es })
  const validUntilStr = format(validUntil, "d 'de' MMMM 'de' yyyy", { locale: es })

  const doc = CertificatePDF({
    audit: audit as Audit,
    risks: (risks ?? []) as AuditLegalRisk[],
    issueDate,
    validUntil: validUntilStr,
  }) as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>

  const buffer = await renderToBuffer(doc)
  const certNum = certNumber(auditId)
  const filename = `voroxia-certificado-${certNum}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-cache',
    },
  })
}
