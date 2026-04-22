'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

const TARGET = new Date('2026-08-02T00:00:00Z')

function getTimeLeft() {
  const diff = TARGET.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

export default function CountdownBanner() {
  const [t, setT] = useState(getTimeLeft())

  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="bg-red-600 text-white rounded-xl px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span>Art. 50 EU AI Act entra en vigor el 2 de agosto de 2026</span>
      </div>
      <div className="flex items-center gap-3 text-sm font-mono font-bold">
        {[['días', t.days], ['h', t.hours], ['min', t.minutes], ['seg', t.seconds]].map(([label, val]) => (
          <div key={label as string} className="flex flex-col items-center">
            <span className="text-2xl leading-none">{String(val).padStart(2, '0')}</span>
            <span className="text-red-200 text-xs font-normal">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
