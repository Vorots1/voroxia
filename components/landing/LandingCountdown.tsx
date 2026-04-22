'use client'

import { useEffect, useState } from 'react'

const TARGET = new Date('2026-08-02T00:00:00Z')

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function LandingCountdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, TARGET.getTime() - Date.now())
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTime({ days, hours, minutes, seconds })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const units = [
    { label: 'días', value: time.days },
    { label: 'horas', value: time.hours },
    { label: 'min', value: time.minutes },
    { label: 'seg', value: time.seconds },
  ]

  return (
    <div className="flex gap-3 sm:gap-6 justify-center">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 min-w-[64px] text-center backdrop-blur-sm">
            <span className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
              {pad(value)}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1.5 uppercase tracking-widest">{label}</span>
        </div>
      ))}
    </div>
  )
}
