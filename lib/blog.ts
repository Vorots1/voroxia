export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readingTime: number
  category: string
  content: string
}

export const POSTS: BlogPost[] = [
  {
    slug: 'que-es-eu-ai-act-chatbots',
    title: 'Qué es el EU AI Act y cómo afecta a tu chatbot de IA',
    description: 'El Reglamento (UE) 2024/1689 entra en vigor en agosto de 2026. Te explicamos qué obligaciones concretas impone a los chatbots de atención al cliente y asistentes virtuales.',
    date: '2026-04-01',
    readingTime: 7,
    category: 'Regulación',
    content: `## El EU AI Act en 90 segundos

El Reglamento (UE) 2024/1689, conocido como **EU AI Act**, es la primera ley de IA de alcance general en el mundo. Aprobado en junio de 2024 y con aplicación obligatoria desde el **2 de agosto de 2026**, clasifica los sistemas de IA en cuatro niveles de riesgo y establece obligaciones proporcionales para cada uno.

Para los chatbots de atención al cliente —la categoría más extendida en empresas europeas— las implicaciones son directas e inmediatas.

## ¿Qué clasifica exactamente como "sistema de IA"?

El artículo 3 del reglamento define sistema de IA como cualquier sistema basado en modelos de aprendizaje automático que genere resultados (texto, decisiones, predicciones) con cierto grado de autonomía. Un chatbot alimentado por GPT-4, Claude o Llama encaja en esta definición.

## Los cuatro niveles de riesgo

| Nivel | Ejemplos | Obligaciones |
|-------|----------|-------------|
| Inaceptable | Sistemas de puntuación social, manipulación subliminal | **Prohibidos** |
| Alto | Chatbots en reclutamiento, crédito, salud | Registro, transparencia, supervisión humana |
| Limitado | Chatbots de atención al cliente | Obligación de identificarse como IA |
| Mínimo | Filtros de spam, juegos | Sin obligaciones específicas |

La mayoría de chatbots empresariales caen en la categoría de **riesgo limitado**, pero muchos también rozan el **riesgo alto** si intervienen en decisiones con consecuencias jurídicas o económicas para el usuario.

## Las obligaciones clave para chatbots

### 1. Transparencia obligatoria

El artículo 50 exige que cualquier sistema de IA que interactúe con personas de forma automatizada deba **identificarse como IA** de manera clara y en el momento del primer contacto. No vale un aviso en letra pequeña al final de la web.

### 2. Registro de interacciones

Para sistemas de riesgo alto, el reglamento exige mantener **logs de las conversaciones** suficientes para auditoría posterior. Esto implica infraestructura de almacenamiento y políticas de retención claras.

### 3. Supervisión humana

Los chatbots que tomen o influyan en decisiones deben disponer de un mecanismo para que una persona revise y corrija esas decisiones. La automatización total es cuestionable en muchos contextos.

### 4. Evaluaciones de conformidad

Antes del despliegue, los operadores de IA de alto riesgo deben completar evaluaciones de conformidad documentadas. Esto es equivalente a un proceso de auditoría formal.

## ¿Quién es responsable?

El EU AI Act diferencia entre:

- **Proveedores** (providers): quienes desarrollan y ponen en el mercado el sistema de IA (p.ej. OpenAI, Anthropic).
- **Desplegadores** (deployers): quienes usan el sistema de IA en su negocio.

La novedad clave: **las empresas que despliegan chatbots de terceros también tienen obligaciones propias**. No basta con que tu proveedor de LLM sea conforme; tu configuración, tus instrucciones de sistema (system prompt) y el contexto de uso también son objeto de regulación.

## Multas

Las sanciones son proporcionales al tipo de infracción:

- Hasta **35 millones € o el 7% de facturación global** por usar IA de riesgo inaceptable.
- Hasta **15 millones € o el 3%** por incumplir obligaciones de transparencia o registro.
- Hasta **7,5 millones € o el 1,5%** por proporcionar información incorrecta a las autoridades.

## ¿Cómo saber si tu chatbot cumple?

La forma más directa es realizar una **auditoría técnica** que evalúe:

1. Si el chatbot se identifica correctamente como IA.
2. Si las respuestas contienen información falsa o alucinatoria.
3. Si existen guardarraíles que eviten respuestas fuera del dominio.
4. Si responde correctamente ante manipulación o adversarial prompting.
5. Si la experiencia de usuario es consistente en distintos registros lingüísticos.
6. Si hay riesgos legales identificables en las respuestas.

Voroxia automatiza este proceso y genera un informe de cumplimiento accionable en minutos.`,
  },
  {
    slug: 'multas-eu-ai-act-chatbot',
    title: 'Multas del EU AI Act: qué arriesga tu empresa si no cumples',
    description: 'Hasta 35 millones de euros o el 7% de la facturación global. Analizamos el régimen sancionador del EU AI Act y qué incumplimientos son más comunes en chatbots empresariales.',
    date: '2026-04-08',
    readingTime: 6,
    category: 'Cumplimiento',
    content: `## El régimen sancionador del EU AI Act

Cuando el EU AI Act entra plenamente en vigor el 2 de agosto de 2026, las autoridades nacionales de supervisión —coordinadas por la Oficina de IA de la Comisión Europea— tendrán capacidad para imponer multas que, en los casos más graves, superan a las del RGPD.

Entender la escala de sanciones es fundamental para priorizar correctamente la inversión en cumplimiento.

## Las tres franjas de multas

### Franja 1 — Usos prohibidos (Art. 5)
**Hasta 35.000.000 € o el 7% de la facturación mundial anual** (la cifra mayor de las dos).

Esta franja aplica si tu sistema de IA realiza alguna de las prácticas explícitamente prohibidas:
- Técnicas de manipulación subliminal o engañosas.
- Explotación de vulnerabilidades de grupos específicos.
- Sistemas de puntuación social.
- Identificación biométrica en tiempo real en espacios públicos (con excepciones tasadas).

Para chatbots de atención al cliente, el riesgo principal en esta franja es la **manipulación encubierta**: un chatbot programado para presionar a usuarios vulnerables hacia una compra o decisión que no habrían tomado libremente.

### Franja 2 — Incumplimiento de obligaciones (Art. 72)
**Hasta 15.000.000 € o el 3% de la facturación mundial anual**.

Esta es la franja más relevante para la mayoría de chatbots empresariales. Aplica cuando se incumplen obligaciones como:
- No identificarse como IA ante el usuario (art. 50).
- No mantener registros de interacciones requeridos.
- No implementar supervisión humana en sistemas de alto riesgo.
- Desplegar un sistema sin haber completado la evaluación de conformidad.
- No gestionar adecuadamente los riesgos identificados.

### Franja 3 — Información incorrecta (Art. 72)
**Hasta 7.500.000 € o el 1,5% de la facturación mundial anual**.

Aplica cuando se proporciona información falsa, incompleta o engañosa a los organismos notificados o a la autoridad de vigilancia. Esta franja cobra importancia durante auditorías regulatorias.

## Los incumplimientos más comunes en chatbots

Basándonos en las categorías de evaluación que Voroxia analiza, estos son los puntos de fallo más frecuentes:

### 1. Ausencia de identificación como IA
El 60% de los chatbots evaluados no cumplen con el requisito de transparencia del artículo 50. Un "Soy tu asistente virtual" sin mencionar explícitamente que es un sistema de IA no es suficiente.

### 2. Alucinaciones en información crítica
Respuestas inventadas sobre precios, condiciones contractuales, normativas o características de producto generan riesgo legal directo: el usuario puede tomar decisiones basadas en información falsa.

### 3. Guardarraíles insuficientes
Chatbots que responden fuera de su dominio sin redirección adecuada, que no filtran contenido inapropiado, o que ceden ante técnicas de jailbreak básicas.

### 4. Consistencia lingüística
Un chatbot que responde correctamente en lenguaje formal pero falla ante jerga coloquial o consultas informales puede estar discriminando usuarios por su forma de expresarse.

## ¿Cuándo empiezan a aplicarse las sanciones?

El calendario del EU AI Act es escalonado:

| Fecha | Qué entra en vigor |
|-------|-------------------|
| Febrero 2025 | Prohibiciones (franja 1) |
| Agosto 2025 | Reglas para sistemas de propósito general (GPT, Claude...) |
| **Agosto 2026** | **Todas las demás obligaciones, incluyendo chatbots** |
| Agosto 2027 | Obligaciones para sistemas de alto riesgo ya existentes |

Si tu chatbot está en producción desde antes de agosto de 2026, tienes que ser conforme en esa fecha. No hay período de gracia para sistemas ya desplegados.

## Cómo prepararse

1. **Audita tu chatbot ahora**: identifica los gaps antes de que lo haga un regulador.
2. **Documenta tu sistema prompt**: la configuración es parte de la evaluación de conformidad.
3. **Añade identificación explícita**: "Soy un asistente de IA de [empresa]" en el primer mensaje.
4. **Establece mecanismos de escalado humano**: define cuándo y cómo un humano puede tomar el control.
5. **Mantén logs**: según el nivel de riesgo, conserva registros de interacciones durante el tiempo requerido.

Voroxia genera un dossier de riesgos legales accionable que puedes usar directamente como evidencia de diligencia debida ante una inspección regulatoria.`,
  },
  {
    slug: 'como-auditar-chatbot-eu-ai-act',
    title: 'Cómo auditar un chatbot de IA para el EU AI Act: guía paso a paso',
    description: 'Una auditoría de cumplimiento EU AI Act para chatbots evalúa 6 dimensiones técnicas y legales. Te explicamos el proceso, las métricas clave y cómo interpretar los resultados.',
    date: '2026-04-15',
    readingTime: 9,
    category: 'Guías técnicas',
    content: `## Por qué necesitas auditar tu chatbot

El EU AI Act no exige que tu chatbot sea perfecto: exige que puedas **demostrar que has tomado medidas razonables** para identificar y mitigar riesgos. Una auditoría formal es la evidencia más sólida de esa diligencia.

Además, muchas empresas descubren durante la auditoría problemas que no sabían que tenían: alucinaciones en información crítica, falta de guardarraíles ante prompts adversariales, inconsistencias de comportamiento entre registros lingüísticos.

## Las 6 dimensiones de una auditoría completa

### Fase 1: Competencia Lingüística

Un chatbot conforme debe responder de forma coherente y apropiada independientemente del registro lingüístico del usuario. Esto implica evaluar:

- **Lenguaje formal**: respuestas en contextos profesionales o técnicos.
- **Lenguaje coloquial**: consultas informales, con contracciones y expresiones cotidianas.
- **Jerga generacional**: vocabulario de usuarios jóvenes, abreviaturas, emojis.
- **Multiidioma**: comportamiento cuando el usuario mezcla idiomas.
- **Texto errático**: errores ortográficos, autocorrector, mensajes fragmentados.

La métrica clave es la **brecha formal/coloquial**: si el chatbot responde correctamente al 90% de las consultas formales pero solo al 60% de las coloquiales, está discriminando por forma de expresarse.

### Fase 2: Competencia Funcional

Evalúa si el chatbot cumple efectivamente su función declarada:

- ¿Responde correctamente a las consultas principales del dominio?
- ¿Reconoce y gestiona adecuadamente las consultas fuera de dominio?
- ¿Mantiene coherencia entre respuestas sobre el mismo tema?
- ¿La tasa de alucinación está dentro de límites aceptables (<5%)?

La **tasa de alucinación** —respuestas con información inventada o incorrecta— es especialmente crítica. Una respuesta falsa sobre precio, disponibilidad, garantía o condiciones legales puede constituir publicidad engañosa.

### Fase 3: Guardarraíles y Seguridad Lógica

Esta fase evalúa los mecanismos de protección del chatbot:

- **Contención**: ¿responde a temas fuera de su dominio o redirige correctamente?
- **Escalado**: ¿sabe cuándo derivar a un humano?
- **Límites de rol**: ¿mantiene su función sin deslizarse hacia otros usos?
- **Adversarial básico**: ¿resiste intentos simples de manipular su comportamiento?

La **tasa de contención** (consultas fuera de dominio correctamente gestionadas) debería superar el 85% en un chatbot bien configurado.

### Fase 4: Seguridad y Privacidad

Evalúa la resistencia ante técnicas de ataque más sofisticadas:

- **Prompt injection**: intentos de inyectar instrucciones en el prompt del sistema.
- **Jailbreaking**: técnicas para eludir restricciones de seguridad.
- **Extracción de información sensible**: ¿cede información del system prompt o datos internos?
- **Manipulación de comportamiento**: ¿puede el usuario reconfigurar el chatbot?
- **PII handling**: ¿gestiona correctamente datos personales que el usuario comparte?

### Fase 5: Experiencia y Ética

El EU AI Act pone énfasis especial en la protección de grupos vulnerables:

- **Resiliencia emocional**: comportamiento ante usuarios en situaciones de estrés o crisis.
- **Sesgo discriminatorio**: ¿responde diferente según el origen aparente del usuario?
- **Accesibilidad lingüística**: ¿es comprensible para usuarios no técnicos?
- **Honestidad**: ¿admite sus limitaciones o se inventa capacidades?

La **resiliencia emocional** es especialmente relevante para chatbots de banca, salud, seguros o servicios sociales.

### Fase 6: Cumplimiento Legal

La fase más directamente vinculada al EU AI Act:

- **Identificación como IA**: ¿se presenta claramente como sistema automatizado?
- **Transparencia de limitaciones**: ¿informa de qué puede y no puede hacer?
- **Derechos del usuario**: ¿informa sobre el derecho a escalado humano?
- **Protección de datos**: ¿cumple con RGPD en el tratamiento de datos de conversación?
- **Publicidad encañosa**: ¿evita afirmaciones falsas o exageradas?

## Cómo interpretar el score de cumplimiento

Una auditoría completa genera un score de 0 a 100 ponderado entre las 6 fases:

| Score | Clasificación | Situación |
|-------|---------------|-----------|
| 90-100 | Excelente | Listo para certificación |
| 75-89 | Conforme | Cumple los requisitos básicos |
| 50-74 | Parcialmente conforme | Gaps identificados, acción necesaria |
| 25-49 | Deficiente | Riesgo regulatorio significativo |
| 0-24 | Crítico | No apto para producción |

Un score inferior a 75 indica que hay dimensiones con problemas que un regulador podría cuestionar. La prioridad de corrección debe seguir la severidad de los riesgos legales identificados.

## Las métricas derivadas más útiles

Además del score, una buena auditoría reporta:

- **Brecha formal/informal** (target: <15%): diferencia de rendimiento entre registros.
- **Tasa de alucinación** (target: <5%): porcentaje de respuestas con información incorrecta.
- **Tasa de contención** (target: >85%): consultas fuera de dominio correctamente gestionadas.
- **Resiliencia emocional** (target: >70/100): comportamiento ante usuarios vulnerables.
- **Comprensión lingüística** (target: >75/100): capacidad de interpretar consultas complejas o ambiguas.

## Cómo automatizar la auditoría

El proceso manual de una auditoría completa —diseñar preguntas representativas para cada fase, ejecutarlas contra el chatbot, evaluar las respuestas con criterios consistentes— puede llevar días para un equipo técnico.

Voroxia automatiza todo el proceso:

1. **Planificación inteligente**: Claude genera un plan de 82 preguntas adaptado al sector, idioma y tipo de chatbot.
2. **Ejecución automática**: las preguntas se envían al chatbot usando su system prompt y se recogen las respuestas.
3. **Evaluación consistente**: cada respuesta se puntúa según criterios explícitos (PASS/IMPROVABLE/FAIL + score 0-10).
4. **Informe accionable**: recomendaciones concretas por pregunta y dossier de riesgos legales.
5. **Re-auditoría periódica**: los planes Professional y Enterprise incluyen re-auditoría automática semanal o diaria para detectar derivas.

El resultado es un informe que puedes presentar como evidencia de conformidad, exportar en PDF y usar como base para un proceso de certificación formal.`,
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find(p => p.slug === slug)
}

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => b.date.localeCompare(a.date))
}
