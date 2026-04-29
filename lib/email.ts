import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}
const FROM = 'Voroxia <alertas@voroxia.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://voroxia.com'

export async function sendRegressionAlert({
  to,
  assistantName,
  previousScore,
  newScore,
  auditId,
}: {
  to: string
  assistantName: string
  previousScore: number
  newScore: number
  auditId: string
}): Promise<void> {
  const drop = previousScore - newScore
  const auditUrl = `${APP_URL}/audits/${auditId}`

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `⚠️ Regresión detectada en "${assistantName}" — score bajó ${drop} puntos`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">

        <!-- Header -->
        <tr><td style="background:#0f172a;padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#60a5fa;font-size:18px;font-weight:700;letter-spacing:2px;">VOROXIA</td>
              <td align="right" style="color:#64748b;font-size:11px;">Alerta automática</td>
            </tr>
          </table>
        </td></tr>

        <!-- Alert banner -->
        <tr><td style="background:#fef2f2;border-bottom:3px solid #dc2626;padding:16px 32px;">
          <p style="margin:0;font-size:13px;font-weight:700;color:#dc2626;">⚠️ REGRESIÓN DETECTADA EN RE-AUDITORÍA</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;">
            La re-auditoría automática de <strong>"${assistantName}"</strong> ha detectado una bajada significativa en el score de cumplimiento:
          </p>

          <!-- Score comparison -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:24px;">
            <tr>
              <td align="center" style="padding:20px;border-right:1px solid #e2e8f0;">
                <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Score anterior</p>
                <p style="margin:0;font-size:36px;font-weight:700;color:#374151;">${previousScore}<span style="font-size:18px;color:#9ca3af;">/100</span></p>
              </td>
              <td align="center" style="padding:20px;">
                <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Score actual</p>
                <p style="margin:0;font-size:36px;font-weight:700;color:#dc2626;">${newScore}<span style="font-size:18px;color:#9ca3af;">/100</span></p>
                <p style="margin:4px 0 0;font-size:12px;color:#dc2626;font-weight:600;">▼ ${drop} puntos</p>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
            Una caída superior a 10 puntos puede indicar cambios en el comportamiento del chatbot, nuevas vulnerabilidades o deriva en las respuestas. Revisa el informe completo para identificar qué dimensiones han empeorado.
          </p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0">
            <tr><td style="background:#2563eb;border-radius:8px;">
              <a href="${auditUrl}" style="display:block;padding:14px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">
                Ver informe completo →
              </a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:11px;color:#94a3b8;">
                Voroxia · voroxia.com<br>
                Este email se ha enviado porque tienes activadas las alertas de re-auditoría.
              </td>
              <td align="right" style="font-size:11px;color:#94a3b8;">
                Compatible EU AI Act 2024
              </td>
            </tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  })
}

export async function sendReauditSummary({
  to,
  assistantName,
  score,
  auditId,
}: {
  to: string
  assistantName: string
  score: number
  auditId: string
}): Promise<void> {
  const auditUrl = `${APP_URL}/audits/${auditId}`
  const statusColor = score >= 75 ? '#15803d' : score >= 50 ? '#b45309' : '#dc2626'
  const statusLabel = score >= 75 ? 'Conforme' : score >= 50 ? 'Parcialmente conforme' : 'No conforme'

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `✅ Re-auditoría completada: "${assistantName}" — score ${score}/100`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="background:#0f172a;padding:24px 32px;">
          <p style="margin:0;color:#60a5fa;font-size:18px;font-weight:700;letter-spacing:2px;">VOROXIA</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;">
            La re-auditoría automática de <strong>"${assistantName}"</strong> se ha completado.
          </p>
          <div style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;padding:24px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Score de cumplimiento</p>
            <p style="margin:0;font-size:48px;font-weight:700;color:${statusColor};">${score}<span style="font-size:22px;color:#9ca3af;">/100</span></p>
            <p style="margin:8px 0 0;font-size:13px;font-weight:600;color:${statusColor};">${statusLabel}</p>
          </div>
          <table cellpadding="0" cellspacing="0">
            <tr><td style="background:#2563eb;border-radius:8px;">
              <a href="${auditUrl}" style="display:block;padding:14px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">
                Ver informe completo →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;">
          <p style="margin:0;font-size:11px;color:#94a3b8;">Voroxia · voroxia.com · Compatible EU AI Act 2024</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  })
}
