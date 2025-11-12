"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"

const COLORS = ["#FFD700", "#00FF41", "#FF4444", "#4488FF"]

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  life: number
}

interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState("")
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const updateCountdown = () => {
      const launchDate = new Date("2025-12-01T12:00:00").getTime()
      const now = new Date().getTime()
      const distance = launchDate - now

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((distance / 1000 / 60) % 60),
          seconds: Math.floor((distance / 1000) % 60),
        })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Set initial particles
    for (let i = 0; i < 60; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 1,
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }

      // Create new particles near mouse
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2
        const distance = Math.random() * 50 + 20
        particlesRef.current.push({
          x: e.clientX + Math.cos(angle) * distance,
          y: e.clientY + Math.sin(angle) * distance,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          life: 1,
        })
      }
    }

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", handleResize)

    const animate = () => {
      ctx.fillStyle = "rgba(10, 10, 20, 0.15)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particlesRef.current = particlesRef.current.filter((p) => p.life > 0)

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Apply friction
        particle.vx *= 0.98
        particle.vy *= 0.98

        // Fade out
        particle.life -= 0.015

        // Converter cor hex para rgb e aplicar opacidade
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
          return result
            ? {
                r: Number.parseInt(result[1], 16),
                g: Number.parseInt(result[2], 16),
                b: Number.parseInt(result[3], 16),
              }
            : { r: 255, g: 255, b: 255 }
        }

        const rgb = hexToRgb(particle.color)

        // Draw with glow effect
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, 8)
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.life})`)
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`)

        ctx.fillStyle = gradient
        ctx.fillRect(particle.x - 6, particle.y - 6, 12, 12)

        // Draw core pixel
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.life * 0.8})`
        ctx.fillRect(particle.x - 3, particle.y - 3, 6, 6)
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handlePreSave = (e: React.FormEvent) => {
    e.preventDefault()
    window.open(`https://too.fm/kxjzjje`, "_blank")
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-80" style={{ mixBlendMode: "screen" }} />

      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-4 md:px-8">
        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center max-w-6xl w-full">
          {/* Left side - Album cover */}
          <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-left duration-1000">
            <div className="text-center">
              <p className="text-xs md:text-sm font-mono text-slate-400 mb-3 uppercase tracking-widest">
                Lançamento em
              </p>
              <div className="flex gap-3 md:gap-4 justify-center">
                <div className="bg-slate-800/60 border border-slate-700 rounded-lg px-3 md:px-4 py-2 md:py-3">
                  <div className="text-xl md:text-2xl font-bold text-green-400">
                    {String(countdown.days).padStart(2, "0")}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">dias</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700 rounded-lg px-3 md:px-4 py-2 md:py-3">
                  <div className="text-xl md:text-2xl font-bold text-yellow-300">
                    {String(countdown.hours).padStart(2, "0")}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">horas</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700 rounded-lg px-3 md:px-4 py-2 md:py-3">
                  <div className="text-xl md:text-2xl font-bold text-blue-400">
                    {String(countdown.minutes).padStart(2, "0")}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">min</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700 rounded-lg px-3 md:px-4 py-2 md:py-3">
                  <div className="text-xl md:text-2xl font-bold text-red-400">
                    {String(countdown.seconds).padStart(2, "0")}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">seg</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-green-400/30 to-blue-400/30 rounded-lg blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Adobe%20Express%20-%20file%20%283%29-sxMn5krQSaqUOX79C5hw0SMK7pnLPM.jpg"
                alt="ÂMAGO EP Cover"
                width={300}
                height={300}
                className="relative rounded-lg shadow-2xl w-64 h-64 md:w-80 md:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Right side - Text and CTA */}
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right duration-1000">
            <div className="space-y-4">
              <p className="text-sm md:text-base font-mono text-yellow-300 tracking-widest uppercase animate-pulse">
                Novo EP
              </p>

              <h1 className="text-5xl md:text-7xl font-black leading-tight text-white drop-shadow-lg">
                ÂMAGO
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400">
                  °
                </span>
              </h1>

              {/* Artist name */}
              <p className="text-xl md:text-2xl font-light text-slate-300">SegD</p>

              {/* Description */}
              <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-sm">
                Descubra o novo EP de SegD. Pre-save agora no Spotify e não perca o lançamento.
              </p>
            </div>

            <form onSubmit={handlePreSave} className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 relative overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, #FFD700 0%, #00FF41 50%, #4488FF 100%)",
                  backgroundSize: "200% 200%",
                }}
              >
                <span className="relative z-10 text-slate-950 group-hover:text-white transition-colors">
                  {submitted ? "✓ Adicionado ao pre-save!" : "PRE-SAVE NO SPOTIFY"}
                </span>
              </button>

              <button
                onClick={() => window.open(`https://open.spotify.com/album/3rW88EdPpJdXxA8ocOdUgD`, "_blank")}
                className="w-full py-3 px-6 rounded-lg font-medium text-sm md:text-base border border-slate-600 text-slate-300 hover:border-green-400 hover:text-green-400 transition-all duration-300"
              >
                Abrir no Spotify
              </button>
            </form>

            {/* Social links */}
            <div className="flex gap-6 pt-4">
              <a
                href="https://www.instagram.com/segdoficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-green-400 transition-colors duration-300 text-sm font-medium"
              >
                Instagram
              </a>
              <a
                href="https://x.com/segdoficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-yellow-300 transition-colors duration-300 text-sm font-medium"
              >
                Twitter
              </a>
              <a
                href="https://www.tiktok.com/@segdoficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-400 transition-colors duration-300 text-sm font-medium"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
