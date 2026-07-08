# Voroxia — Soluciones de Inteligencia Artificial para empresas

Landing de consultoría IA para PYMEs (clínicas, hostelería, alojamientos, servicios): chatbots, voicebots y automatización de atención al cliente.

**URL:** https://voroxia.com
**Repo:** Vorots1/voroxia
**Deploy:** Vercel (push a `main` = deploy automático)
**Contacto:** info@voroxia.com · WhatsApp +34 641 19 07 99

---

## Stack técnico

- **Framework:** Next.js 16 (App Router) — usado únicamente como servidor estático
- **Página:** `public/landing.html`, HTML/CSS/JS autocontenido (sin build step, imágenes embebidas en base64), servido byte a byte por `app/route.ts` en `GET /`
- Sin base de datos, sin auth, sin backend — el formulario de contacto es local (no envía datos a ningún servidor); las CTA reales son WhatsApp/email

## Desarrollo

```bash
npm install
npm run dev
```

## Editar contenido

Editar directamente `public/landing.html`. No hay JSX ni componentes — es HTML plano con `<style>` y `<script>` inline.

---

**Nota histórica:** Este repo alojó previamente un SaaS de auditoría de chatbots IA (EU AI Act). Se retiró por completo (dashboard, auth, Stripe, Supabase, API) el 2026-07-09 en favor de esta landing de consultoría — ver `git log` anterior a este commit para el código del producto anterior.
