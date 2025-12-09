'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '../i18n'

export default function Countdown({ targetDate, themeColor }: { targetDate: string, themeColor: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const target = new Date(targetDate).getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = target - now

      if (distance < 0) {
        clearInterval(interval)
        setIsExpired(true)
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  if (isExpired) {
    return <div className="text-center font-bold p-4 bg-gray-100 rounded-lg">Etkinlik Başladı / Sona Erdi! 🎉</div>
  }

  return (
    
    <div className="flex gap-2 justify-center my-6">
      {[('time_day'), ('time_hour'), ('time_min'), ('time_sec')].map((label, index) => {
        const value = index === 0 ? timeLeft.days : index === 1 ? timeLeft.hours : index === 2 ? timeLeft.minutes : timeLeft.seconds
        return (
          <div key={label} className="flex flex-col items-center">
            <div 
              className="w-16 h-16 flex items-center justify-center text-2xl font-bold text-white rounded-lg shadow-lg mb-1"
              style={{ backgroundColor: themeColor }}
            >
              {value}
            </div>
            <span className="text-xs uppercase text-gray-400 font-semibold">{label}</span>
          </div>
        )
      })}
    </div>
  )
}