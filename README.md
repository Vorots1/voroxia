# Voroxia — Auditoría de chatbots IA

SaaS de auditoría de chatbots de IA. 82 preguntas, 6 dimensiones, score legal + dossier EU AI Act.

**URL:** https://voroxia.com  
**Repo:** Vorots1/voroxia  
**Deploy:** Vercel (push a `main` = deploy automático)  
**DB:** Supabase EU  

---

## Stack técnico

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind v4 + Shadcn
- **Auth + DB:** Supabase SSR
- **Pagos:** Stripe
- **IA:** Anthropic SDK (Claude)
- **PDF:** @react-pdf/renderer v4

---

## Estado del build

| PASO | Estado | Commit |
|------|--------|--------|
| 1 — Init + motor | ✅ | `e17fa66` |
| 2 — Auth | ✅ | `77bc1f9` |
| 3 — Engine API | ✅ | `67b8a49` |
| 4 — Dashboard + wizard | ✅ | `84b8d06` |
| 5 — Landing page | ✅ | `3a46052` |
| 6 — Stripe (suscripciones + extras) | ✅ | `bf67154` |
| 7 — PDF export | ✅ | `cfd99cc` |
| 8 — Re-auditoría automática (cron) | ✅ | `9d70eb8` |
| 9 — API pública v1 Enterprise | ✅ | `84408dc` |
| 10 — Certificado EU AI Act | ✅ | `b9d0aa9` |
| 11 — Alertas de regresión (Resend) | ✅ | `6ddb1f8` |
| 12 — Onboarding tour | ✅ | `1103815` |
| 13 — Blog SEO EU AI Act | ✅ | `dea801f` |
| 🔒 Seguridad (headers, proxy, RLS, Zod) | ✅ | `219340d` |

---

## Estructura de carpetas

```
app/
  page.tsx                        # Landing page (estática)
  layout.tsx                      # Root layout + SEO metadata
  (auth)/login, register          # Auth Supabase SSR
  (dashboard)/
    layout.tsx                    # Sidebar + auth guard
    dashboard/                    # Panel KPIs + auditorías recientes
    audits/page, new, [id]        # Lista, wizard, resultado
    pricing/                      # Upgrade de plan
    settings/                     # Cuenta + billing + API key (PASO 9)
    contact/                      # Solicitar reparación
  api/
    audit/create, plan, execute, evaluate   # Pipeline motor
    audit/pdf                               # Export PDF
    stripe/checkout, portal, extra          # Pagos
    webhooks/stripe                         # Webhook Stripe
    cron/reaudit                            # Re-auditoría automática
    v1/audit                                # API pública Enterprise (PASO 9)
    v1/audit/[id]                           # Resultado via API (PASO 9)
    v1/audit/[id]/pdf                       # PDF via API (PASO 9)

components/
  ui/                             # Shadcn
  dashboard/Sidebar, AuditRow, CountdownBanner, BillingPortalButton,
           BuyExtrasButton, ApiKeyManager, OnboardingModal
  audit/ScoreGauge, Step1-4, DownloadPDFButton, DownloadCertificateButton
  landing/LandingCountdown

lib/
  anthropic.ts                    # Cliente Anthropic
  audit-engine.ts                 # generateAuditPlan, executeAuditWithSystemPrompt, evaluateAudit
  prompts.ts                      # Prompts del motor
  scoring.ts                      # Clasificación, PHASE_NAMES, PHASE_WEIGHTS
  rate-limiter.ts                 # checkAuditLimit por plan
  stripe.ts                       # Cliente Stripe, getPriceId, getExtraPriceId
  api-key.ts                      # Generar/hashear/verificar API keys
  email.ts                        # sendRegressionAlert, sendReauditSummary (Resend)
  blog.ts                         # Artículos estáticos EU AI Act
  validation.ts                   # Schemas Zod para inputs críticos
  supabase.ts / supabase-server.ts

types/
  index.ts    # Plan, PLAN_LIMITS, PLAN_PRICES, EXTRA_AUDIT_PRICES, Audit, User...
  database.ts # Tipos Supabase

proxy.ts      # Auth guard edge + rate limiting + CORS (Next.js 16)
vercel.json   # Cron: 0 3 * * * → /api/cron/reaudit
```

---

## Variables de entorno (todas en Vercel)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe — 8 variables
STRIPE_SECRET_KEY=              # sk_live_... (Developers → API keys)
STRIPE_WEBHOOK_SECRET=          # whsec_...  (Developers → Webhooks → Signing secret)
STRIPE_PRICE_STARTER=           # price_...  (€79/mes, recurring)
STRIPE_PRICE_PROFESSIONAL=      # price_...  (€199/mes, recurring)
STRIPE_PRICE_ENTERPRISE=        # price_...  (€499/mes, recurring)
STRIPE_PRICE_EXTRA_STARTER=     # price_...  (€9,90, one-time)
STRIPE_PRICE_EXTRA_PROFESSIONAL=# price_...  (€7,90, one-time)
STRIPE_PRICE_EXTRA_ENTERPRISE=  # price_...  (€5,90, one-time)

# Cron
CRON_SECRET=                    # string aleatorio largo

# Email (alertas de regresión)
RESEND_API_KEY=                 # resend.com → API Keys

# App
NEXT_PUBLIC_APP_URL=https://voroxia.com
```

---

## Planes y precios

| Plan | Precio | Auditorías/mes | Preguntas | Fases | Extras incluidos |
|------|--------|----------------|-----------|-------|-----------------|
| Free | €0 | 1 | 20 | 3 | — |
| Starter | €79/mes | 10 | 82 | 6 | €9,90/ud |
| Professional | €199/mes | 30 | 82 | 6 + re-audit semanal | €7,90/ud |
| Enterprise | €499/mes | 100 | 82 | 6 + re-audit diaria + API | €5,90/ud |

---

## Cron de re-auditoría

- Ejecuta cada día a 03:00 UTC
- **Professional:** re-audita si última auditoría completada > 7 días
- **Enterprise:** re-audita si última auditoría completada > 24 horas
- Solo auditorías con `system_prompt` (no manuales)
- Anti-duplicado: salta usuarios con auditoría creada ese día
- Detecta regresión si score nuevo < score anterior - 10 puntos

## API pública v1 (Enterprise)

- Autenticación por `Authorization: Bearer vx_live_<key>`
- `POST /api/v1/audit` — lanzar auditoría
- `GET  /api/v1/audit/:id` — consultar resultado
- `GET  /api/v1/audit/:id/pdf` — descargar PDF
- API keys gestionadas desde `/settings`
