import Link from 'next/link'
import {
  Shield,
  CheckCircle,
  ArrowRight,
  Zap,
  Lock,
  Globe2,
  BarChart3,
  Scale,
  Users,
  MessageSquare,
  AlertTriangle,
  ChevronDown,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LandingCountdown from '@/components/landing/LandingCountdown'

/* ─────────────────────────────── Navbar ─────────────────────────────── */
function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-400" />
          <span className="text-lg font-bold text-white">Voroxia</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a>
          <a href="#fases" className="hover:text-white transition-colors">Qué analiza</a>
          <a href="#precios" className="hover:text-white transition-colors">Precios</a>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
              Probar gratis
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ─────────────────────────────── Hero ─────────────────────────────── */
function Hero() {
  return (
    <section className="relative bg-slate-950 pt-32 pb-24 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <Badge className="mb-6 bg-blue-900/50 text-blue-300 border-blue-700/50 hover:bg-blue-900/50 text-xs tracking-wide">
          EU AI Act · En vigor agosto 2026
        </Badge>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
          Tu chatbot de IA ya es legal<br />
          <span className="text-blue-400">o ya es un riesgo.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Voroxia audita tu asistente de IA en minutos. 82 preguntas automáticas, 6 dimensiones de análisis,
          score de cumplimiento y dossier legal listo para presentar.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8 gap-2 text-base h-12">
              Auditar gratis ahora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-white/20 text-slate-300 hover:bg-white/5 hover:text-white px-8 text-base h-12">
              Ya tengo cuenta
            </Button>
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Sin tarjeta de crédito · 1 auditoría gratuita · Resultados en &lt; 5 minutos
        </p>

        {/* Score preview card */}
        <div className="mt-16 max-w-2xl mx-auto bg-slate-900 border border-white/10 rounded-2xl p-6 text-left shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Ejemplo de informe</p>
              <p className="text-white font-semibold mt-0.5">Asistente de Ventas — Sector Fintech</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-amber-400">62</p>
              <p className="text-xs text-slate-500">/ 100 — Regular</p>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { label: 'Lingüística', score: 78, color: 'text-green-400' },
              { label: 'Funcional', score: 71, color: 'text-green-400' },
              { label: 'Guardrails', score: 55, color: 'text-amber-400' },
              { label: 'Seguridad', score: 48, color: 'text-orange-400' },
              { label: 'Experiencia', score: 65, color: 'text-amber-400' },
              { label: 'Legal', score: 38, color: 'text-red-400' },
            ].map(({ label, score, color }) => (
              <div key={label} className="bg-slate-800 rounded-lg p-2.5 text-center">
                <p className={`text-lg font-bold ${color}`}>{score}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
            2 incumplimientos críticos EU AI Act detectados · Multa potencial: hasta €15M
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── Stats bar ─────────────────────────────── */
function StatsBar() {
  const stats = [
    { value: '82', label: 'preguntas por auditoría' },
    { value: '6', label: 'dimensiones analizadas' },
    { value: '€35M', label: 'multa máxima EU AI Act' },
    { value: '<5 min', label: 'para tener resultados' },
  ]

  return (
    <section className="bg-slate-900 border-y border-white/5">
      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────── Problema ─────────────────────────────── */
function Problem() {
  const pains = [
    {
      icon: <MessageSquare className="h-6 w-6 text-red-400" />,
      title: 'Tu chatbot puede responder cosas que no debería',
      body: 'Sin auditorías periódicas, los fallos pasan desapercibidos: alucinaciones, respuestas fuera de dominio, vulnerabilidades ante ataques de inyección.',
    },
    {
      icon: <Scale className="h-6 w-6 text-orange-400" />,
      title: 'El EU AI Act ya está en vigor',
      body: 'Desde agosto 2024 aplica la prohibición de prácticas de IA no aceptables. El régimen completo entra en vigor en agosto 2026. Multas de hasta €35M o el 7% de tu facturación global.',
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-amber-400" />,
      title: 'Auditar manualmente cuesta semanas y miles de euros',
      body: 'Contratar una consultoría especializada supone entre €5.000 y €25.000 por auditoría. Voroxia lo hace en minutos, con el mismo rigor, desde €79/mes.',
    },
  ]

  return (
    <section className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            ¿Cuándo fue la última vez que auditaste tu chatbot?
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Si no sabes la respuesta, este es tu mayor riesgo legal y reputacional de 2026.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pains.map(({ icon, title, body }) => (
            <div key={title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="mb-4">{icon}</div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── Cómo funciona ─────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Cuéntanos quién es tu chatbot',
      body: 'Introduce el nombre, sector, idioma y país de operación. Puedes pegar el system prompt directamente o conectar vía API.',
    },
    {
      step: '02',
      title: 'Voroxia lo analiza en 82 dimensiones',
      body: 'Nuestro motor lanza preguntas reales en 6 categorías: lingüística, funcionalidad, guardrails, seguridad, experiencia y cumplimiento legal.',
    },
    {
      step: '03',
      title: 'Recibes el informe completo',
      body: 'Score global 0-100, puntuación por fase, dossier de riesgos legales con normativa aplicable, recomendaciones priorizadas y plan de acción.',
    },
  ]

  return (
    <section id="como-funciona" className="bg-slate-50 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Cómo funciona</h2>
          <p className="mt-4 text-gray-500 max-w-lg mx-auto">
            Tres pasos. Menos de cinco minutos. Sin instalar nada.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-blue-100" />

          {steps.map(({ step, title, body }) => (
            <div key={step} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                <span className="text-2xl font-bold text-white">{step}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── 6 Fases ─────────────────────────────── */
function Phases() {
  const phases = [
    {
      icon: <Globe2 className="h-5 w-5" />,
      name: 'Lingüística',
      color: 'bg-violet-100 text-violet-700',
      desc: 'Adaptación a 6 registros de habla: formal, coloquial, jerga GenZ, abreviaciones, multi-idioma y escritura errática.',
    },
    {
      icon: <Zap className="h-5 w-5" />,
      name: 'Funcionalidad',
      color: 'bg-blue-100 text-blue-700',
      desc: 'Coherencia de respuestas, gestión de out-of-scope, precisión factual y consistencia de marca.',
    },
    {
      icon: <Shield className="h-5 w-5" />,
      name: 'Guardrails',
      color: 'bg-cyan-100 text-cyan-700',
      desc: 'Resistencia ante contenido inapropiado, discriminatorio o que viole la política de uso del sistema.',
    },
    {
      icon: <Lock className="h-5 w-5" />,
      name: 'Seguridad',
      color: 'bg-red-100 text-red-700',
      desc: 'Ataques de prompt injection, jailbreaks, extracción de system prompt y manipulación de contexto.',
    },
    {
      icon: <Star className="h-5 w-5" />,
      name: 'Experiencia',
      color: 'bg-amber-100 text-amber-700',
      desc: 'Tono, empatía, resiliencia emocional y consistencia de la personalidad a lo largo de la conversación.',
    },
    {
      icon: <Scale className="h-5 w-5" />,
      name: 'Legal EU AI Act',
      color: 'bg-green-100 text-green-700',
      desc: 'Verificación frente a los artículos aplicables del EU AI Act, GDPR, normativa sectorial y estándares éticos.',
    },
  ]

  return (
    <section id="fases" className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            6 dimensiones de análisis
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            82 preguntas distribuidas en seis fases que cubren todos los ángulos de riesgo de un chatbot de IA profesional.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {phases.map(({ icon, name, color, desc }) => (
            <div key={name} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full mb-3 ${color}`}>
                {icon}
                {name}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── Urgencia EU AI Act ─────────────────────────────── */
function Urgency() {
  return (
    <section className="bg-slate-950 py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Badge className="mb-6 bg-red-900/40 text-red-300 border-red-700/40 hover:bg-red-900/40">
          Cuenta atrás
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          El EU AI Act entra en vigor el 2 de agosto de 2026
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-12">
          Las empresas que no acrediten cumplimiento se exponen a multas de hasta el 7% de su facturación global anual.
          Audita ahora y tendrás tiempo para corregir.
        </p>

        <LandingCountdown />

        <div className="mt-12 grid sm:grid-cols-3 gap-4 text-left">
          {[
            { reg: 'EU AI Act Art. 5', risk: 'Prácticas de IA prohibidas', fine: 'Hasta €35M / 7%' },
            { reg: 'EU AI Act Art. 52', risk: 'Falta de transparencia con usuarios', fine: 'Hasta €15M / 3%' },
            { reg: 'GDPR Art. 22', risk: 'Decisiones automatizadas sin control', fine: 'Hasta €20M / 4%' },
          ].map(({ reg, risk, fine }) => (
            <div key={reg} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">{reg}</p>
              <p className="text-sm text-white font-medium mb-2">{risk}</p>
              <p className="text-sm font-bold text-red-400">{fine}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── Precios ─────────────────────────────── */
function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: 0,
      period: '',
      highlight: false,
      badge: null,
      desc: 'Para explorar Voroxia',
      features: [
        '1 auditoría al mes',
        '20 preguntas por auditoría',
        '3 fases de análisis',
        'Score global',
        'Top 3 hallazgos',
      ],
      cta: 'Empezar gratis',
      ctaHref: '/register',
      ctaVariant: 'outline' as const,
    },
    {
      name: 'Starter',
      price: 79,
      period: '/mes',
      highlight: false,
      badge: null,
      desc: 'Para PYMEs y equipos de producto',
      features: [
        '10 auditorías al mes',
        '82 preguntas por auditoría',
        '6 fases completas',
        'Informe completo en markdown',
        'Dossier legal EU AI Act',
        'Exportar a PDF',
      ],
      cta: 'Empezar con Starter',
      ctaHref: '/register?plan=starter',
      ctaVariant: 'outline' as const,
    },
    {
      name: 'Professional',
      price: 199,
      period: '/mes',
      highlight: true,
      badge: 'Más popular',
      desc: 'Para equipos con varios chatbots',
      features: [
        '30 auditorías al mes',
        '82 preguntas + modo API',
        '6 fases completas',
        'Re-auditoría semanal automática',
        'Alertas de regresión',
        'Dossier legal + PDF',
        'Soporte prioritario',
      ],
      cta: 'Empezar con Professional',
      ctaHref: '/register?plan=professional',
      ctaVariant: 'default' as const,
    },
    {
      name: 'Enterprise',
      price: 499,
      period: '/mes',
      highlight: false,
      badge: null,
      desc: 'Para organizaciones con auditorías continuas',
      features: [
        '100 auditorías al mes',
        '82 preguntas + API completa',
        '6 fases completas',
        'Re-auditoría diaria automática',
        'Acceso API para integraciones',
        'Certificado de cumplimiento',
        'SLA + soporte dedicado',
      ],
      cta: 'Hablar con ventas',
      ctaHref: '/contact',
      ctaVariant: 'outline' as const,
    },
  ]

  return (
    <section id="precios" className="bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Precios transparentes</h2>
          <p className="mt-4 text-gray-500">
            Sin permanencia. Cancela cuando quieras.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 flex flex-col relative ${
                plan.highlight
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 ring-2 ring-blue-600'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full shadow border border-blue-100">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <p className={`text-sm font-semibold mb-1 ${plan.highlight ? 'text-blue-100' : 'text-gray-500'}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  {plan.price === 0 ? (
                    <span className={`text-3xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>Gratis</span>
                  ) : (
                    <>
                      <span className={`text-3xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                        €{plan.price}
                      </span>
                      <span className={`text-sm ${plan.highlight ? 'text-blue-100' : 'text-gray-400'}`}>{plan.period}</span>
                    </>
                  )}
                </div>
                <p className={`text-xs mt-1.5 ${plan.highlight ? 'text-blue-100' : 'text-gray-400'}`}>{plan.desc}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-blue-200' : 'text-green-500'}`} />
                    <span className={plan.highlight ? 'text-blue-50' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.ctaHref}>
                <Button
                  variant={plan.ctaVariant}
                  className={`w-full ${
                    plan.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50 border-0'
                      : ''
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Necesitas más auditorías puntuales? Auditorías adicionales desde €5,90/unidad según plan.
        </p>
      </div>
    </section>
  )
}

/* ─────────────────────────────── Testimonials ─────────────────────────────── */
function SocialProof() {
  const testimonials = [
    {
      name: 'Laura M.',
      role: 'Head of Product, Fintech startup',
      text: 'Descubrimos 3 vulnerabilidades críticas que no habíamos visto en meses de pruebas internas. El dossier legal nos ahorró contratar una consultoría.',
      score: 5,
    },
    {
      name: 'Javier R.',
      role: 'CTO, Plataforma ecommerce',
      text: 'En menos de 10 minutos teníamos el informe completo con el plan de acción. Implementamos los cambios en una semana y subimos el score de 54 a 81.',
      score: 5,
    },
    {
      name: 'Ana C.',
      role: 'Directora de Innovación, Sector Salud',
      text: 'El análisis de cumplimiento EU AI Act es exactamente lo que necesitábamos para presentar a nuestro equipo legal. Muy recomendable.',
      score: 5,
    },
  ]

  return (
    <section className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Lo que dicen nuestros clientes</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, text, score }) => (
            <div key={name} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: score }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">"{text}"</p>
              <div>
                <p className="text-sm font-semibold text-gray-900">{name}</p>
                <p className="text-xs text-gray-500">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── FAQ ─────────────────────────────── */
function FAQ() {
  const items = [
    {
      q: '¿Qué necesito para auditar mi chatbot?',
      a: 'Solo el nombre del asistente, el sector y el idioma principal. Opcionalmente puedes pegar el system prompt o conectar la API del asistente para un análisis más profundo.',
    },
    {
      q: '¿Cómo funciona el plan gratuito?',
      a: '1 auditoría al mes con 20 preguntas y 3 fases de análisis. Obtienes el score global y los 3 hallazgos principales. Sin tarjeta de crédito requerida.',
    },
    {
      q: '¿El informe es válido ante una auditoría regulatoria?',
      a: 'El dossier legal de Voroxia documenta los hallazgos frente a normativa específica (EU AI Act, GDPR). Está diseñado para servir como evidencia de due diligence y facilitar la comunicación con asesores legales.',
    },
    {
      q: '¿Cada cuánto debo auditar mi chatbot?',
      a: 'Recomendamos auditorías mensuales como mínimo, y tras cada actualización significativa del sistema. Los planes Professional y Enterprise incluyen re-auditorías automáticas semanales o diarias.',
    },
    {
      q: '¿Puedo cancelar en cualquier momento?',
      a: 'Sí. No hay permanencia ni penalizaciones. Puedes cancelar desde tu panel de configuración y el acceso se mantiene hasta el final del período pagado.',
    },
    {
      q: '¿Los datos de mi chatbot son seguros?',
      a: 'Los datos se procesan en servidores europeos (EU) y no se utilizan para entrenar modelos. Las credenciales de API se transmiten de forma cifrada y no se almacenan en texto plano.',
    },
  ]

  return (
    <section id="faq" className="bg-slate-50 py-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Preguntas frecuentes</h2>
        </div>

        <div className="space-y-4">
          {items.map(({ q, a }) => (
            <details key={q} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
                <span className="text-sm font-semibold text-gray-900">{q}</span>
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180 flex-shrink-0 ml-4" />
              </summary>
              <div className="px-6 pb-5">
                <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── CTA final ─────────────────────────────── */
function FinalCTA() {
  return (
    <section className="bg-blue-600 py-20">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Tu primera auditoría es gratis.
        </h2>
        <p className="mt-4 text-blue-100 text-lg">
          Descubre el estado real de tu chatbot en menos de 5 minutos.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-10 h-12 text-base font-semibold">
              Auditar ahora — es gratis
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-blue-200">Sin tarjeta de crédito · Datos en servidores EU</p>
      </div>
    </section>
  )
}

/* ─────────────────────────────── Footer ─────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <span className="text-white font-semibold">Voroxia</span>
            <span className="text-slate-600 text-sm ml-2">Auditoría de chatbots IA</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <a href="#como-funciona" className="hover:text-slate-300 transition-colors">Cómo funciona</a>
            <a href="#precios" className="hover:text-slate-300 transition-colors">Precios</a>
            <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contacto</Link>
            <Link href="/login" className="hover:text-slate-300 transition-colors">Entrar</Link>
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} Voroxia. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Términos de uso</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Política de privacidad</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Cookies</a>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-green-500" />
            <span className="text-green-600">Compatible EU AI Act 2024</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────── Page ─────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <Problem />
        <HowItWorks />
        <Phases />
        <Urgency />
        <Pricing />
        <SocialProof />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
