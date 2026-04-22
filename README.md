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
- **PDF:** @react-pdf/renderer

---

## Estado del build (pasos completados)

| PASO | Estado | Descripción |
|------|--------|-------------|
| 1 — Init | ✅ | Estructura base, motor de auditoría, tipos, schema Supabase |
| 2 — Auth | ✅ | Login/Register SSR, layout dashboard, middleware |
| 3 — Engine API | ✅ | API routes: create, plan, execute, evaluate |
| 4 — Dashboard | ✅ | Wizard 4 pasos, KPIs, `/audits/[id]` resultado completo |
| 5 — Landing | ✅ | Landing page completa con countdown EU AI Act, pricing, FAQ |
| 6 — Stripe | 🔄 En curso | Checkout, portal, webhook, página de upgrade |
| 7 — PDF | ⏳ Pendiente | Exportar informe a PDF |
| 8 — Re-auditoría | ⏳ Pendiente | Cron automático para planes Pro/Enterprise |
| 9 — API pública | ⏳ Pendiente | API key autenticada para integraciones Enterprise |

---

## Estructura de carpetas

```
app/
  page.tsx                    # Landing page (estática)
  layout.tsx                  # Root layout + SEO metadata
  (auth)/
    login/                    # Login Supabase
    register/                 # Registro
  (dashboard)/
    layout.tsx                # Sidebar + auth guard
    dashboard/                # Panel KPIs + auditorías recientes
    audits/
      page.tsx                # Lista de auditorías
      new/                    # Wizard nueva auditoría
      [id]/                   # Resultado completo
    pricing/                  # Upgrade de plan (PASO 6)
    settings/                 # Configuración + billing
    contact/                  # Solicitar reparación
  api/
    audit/
      create/                 # POST: crear auditoría
      plan/                   # POST: generar plan de preguntas
      execute/                # POST: ejecutar fase
      evaluate/               # POST: evaluar respuestas
    stripe/
      checkout/               # POST: crear sesión de checkout (PASO 6)
      portal/                 # POST: customer portal (PASO 6)
    webhooks/
      stripe/                 # POST: webhook Stripe (PASO 6)

components/
  ui/                         # Shadcn components
  dashboard/                  # Sidebar, AuditRow, CountdownBanner
  audit/                      # ScoreGauge, Step1-4
  landing/                    # LandingCountdown

lib/
  anthropic.ts                # Cliente Anthropic
  audit-engine.ts             # Motor de auditoría
  prompts.ts                  # Prompts del motor
  scoring.ts                  # Clasificación de scores
  rate-limiter.ts             # Rate limiting por usuario
  stripe.ts                   # Cliente Stripe + price IDs (PASO 6)
  supabase.ts                 # Cliente Supabase (cliente)
  supabase-server.ts          # Cliente Supabase (servidor SSR)

types/
  index.ts                    # Tipos + PLAN_LIMITS + PLAN_PRICES
  database.ts                 # Tipos Supabase generados
```

---

## Variables de entorno

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PROFESSIONAL=
STRIPE_PRICE_ENTERPRISE=

# App
NEXT_PUBLIC_APP_URL=https://voroxia.com
```

---

## Planes y precios

| Plan | Precio | Auditorías/mes | Preguntas | Fases |
|------|--------|----------------|-----------|-------|
| Free | €0 | 1 | 20 | 3 |
| Starter | €79/mes | 10 | 82 | 6 |
| Professional | €199/mes | 30 | 82 | 6 + re-audit semanal |
| Enterprise | €499/mes | 100 | 82 | 6 + re-audit diaria + API + cert |
