'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function LandingAnimations() {
  useEffect(() => {
    // --- Hero entrance (fires immediately, no scroll trigger) ---
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    heroTl
      .from('.gsap-hero-badge', { opacity: 0, y: 20, duration: 0.6 })
      .from('.gsap-hero-title', { opacity: 0, y: 30, duration: 0.7 }, '-=0.3')
      .from('.gsap-hero-desc', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
      .from('.gsap-hero-cta', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
      .from('.gsap-hero-card', { opacity: 0, y: 40, duration: 0.8, scale: 0.97 }, '-=0.3')

    // --- Section titles scroll reveal ---
    gsap.utils.toArray<HTMLElement>('.gsap-section-title').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    })

    // --- Cards stagger scroll reveal ---
    // Group cards by their parent section so each section staggers independently
    const cardParents = new Set<Element>()
    document.querySelectorAll<HTMLElement>('.gsap-card').forEach((el) => {
      if (el.parentElement) cardParents.add(el.parentElement)
    })

    cardParents.forEach((parent) => {
      const cards = parent.querySelectorAll<HTMLElement>('.gsap-card')
      gsap.from(cards, {
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: parent,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })
    })

    // --- Steps sequential reveal ---
    const stepParents = new Set<Element>()
    document.querySelectorAll<HTMLElement>('.gsap-step').forEach((el) => {
      if (el.parentElement) stepParents.add(el.parentElement)
    })

    stepParents.forEach((parent) => {
      const steps = parent.querySelectorAll<HTMLElement>('.gsap-step')
      gsap.from(steps, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: parent,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })
    })

    // --- Stat count-up ---
    document.querySelectorAll<HTMLElement>('.gsap-stat-value[data-target]').forEach((el) => {
      const target = parseFloat((el as HTMLElement).dataset.target || '0')
      if (isNaN(target)) return

      const obj = { val: 0 }
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = Math.round(obj.val).toString()
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return null
}
