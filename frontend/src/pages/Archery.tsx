import { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import FluidBg from '../components/layout/FluidBg'
import TopHeader from '../components/layout/TopHeader'
import { GlassPanel, Button } from '../components/ui'

function resolvePlayerName(): string {
  const p = new URLSearchParams(window.location.search).get('player_name')
  if (p) { localStorage.setItem('bg_player_name', p); return p }
  return localStorage.getItem('bg_player_name') || 'Pilot'
}

function rand(min: number, max: number) { return Math.random() * (max - min) + min }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

export default function Archery() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<'ready' | 'playing' | 'over'>('ready')
  const [score, setScore] = useState(0)
  const [remaining, setRemaining] = useState(120)
  const rafRef = useRef<number | null>(null)
  const lastFrameRef = useRef(0)
  const gameRef = useRef({
    aimAngle: -Math.PI / 2, charge: 0, chargeDrift: 0,
    targetX: 400, targetY: 200, targetVx: 0, targetVy: 0, targetR: 34,
    arrows: [] as { x: number; y: number; t: number }[],
    trail: [] as { x: number; y: number; a: number }[],
  })

  const initGame = useCallback(() => {
    const w = window.innerWidth, h = window.innerHeight
    const g = gameRef.current
    g.aimAngle = -Math.PI / 2
    g.charge = 0
    g.targetX = rand(140, w - 360)
    g.targetY = rand(120, h * 0.62)
    g.targetVx = rand(-70, 70)
    g.targetVy = rand(-45, 45)
    g.targetR = rand(26, 40)
    g.arrows = []
    g.trail = []
  }, [])

  const start = useCallback(() => {
    initGame()
    setState('playing')
    setScore(0)
    setRemaining(120)
    lastFrameRef.current = performance.now()
    const loop = (ts: number) => {
      const dt = clamp((ts - lastFrameRef.current) / 1000, 0, 0.05)
      lastFrameRef.current = ts
      update(dt)
      render()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [initGame])

  const update = useCallback((dt: number) => {
    const g = gameRef.current
    const w = window.innerWidth
    // Charging
    if (g.charge < 1) g.charge += dt * 0.7
    g.chargeDrift += rand(-0.008, 0.008)
    g.aimAngle += g.chargeDrift * dt
    g.chargeDrift *= 0.97
    // Target movement
    g.targetX += g.targetVx * dt
    g.targetY += g.targetVy * dt
    if (g.targetX < 140 || g.targetX > w - 360) g.targetVx *= -1
    if (g.targetY < 120 || g.targetY > window.innerHeight * 0.62) g.targetVy *= -1
    // Auto fire
    if (g.charge >= 1) fire()
  }, [])

  const fire = useCallback(() => {
    const g = gameRef.current
    const cx = window.innerWidth / 2
    const cy = window.innerHeight - 80
    const speed = 400 + g.charge * 300
    const dx = Math.cos(g.aimAngle) * speed
    const dy = Math.sin(g.aimAngle) * speed
    const steps = 60
    let hit = false
    for (let i = 1; i <= steps; i++) {
      const t = i / 60
      const ax = cx + dx * t
      const ay = cy + dy * t + 0.5 * 300 * t * t
      const dist = Math.hypot(ax - g.targetX, ay - g.targetY)
      if (dist < g.targetR) { hit = true; break }
    }
    if (hit) {
      setScore(s => s + Math.round(g.charge * 100))
      g.targetR = rand(26, 40)
      g.targetX = rand(140, window.innerWidth - 360)
      g.targetY = rand(120, window.innerHeight * 0.62)
    }
    g.charge = 0
    g.chargeDrift = 0
    setRemaining(r => {
      if (r <= 1) { setState('over'); return 0 }
      return r - 1
    })
  }, [])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = window.innerWidth, h = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#0f172a')
    grad.addColorStop(1, '#1e293b')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    const g = gameRef.current

    // Target (concentric circles)
    ctx.save()
    ctx.translate(g.targetX, g.targetY)
    ctx.strokeStyle = '#dc2626'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, g.targetR, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = '#f59e0b'
    ctx.beginPath()
    ctx.arc(0, 0, g.targetR * 0.7, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = '#22c55e'
    ctx.beginPath()
    ctx.arc(0, 0, g.targetR * 0.35, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Bow
    const cx = w / 2, cy = h - 80
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 2
    const bowLen = 50
    const bowEndX = cx + Math.cos(g.aimAngle) * bowLen
    const bowEndY = cy + Math.sin(g.aimAngle) * bowLen
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(bowEndX, bowEndY)
    ctx.stroke()

    // Charge bar
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.fillRect(20, h - 40, 200, 16)
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(20, h - 40, 200 * g.charge, 16)
    ctx.fillStyle = '#94a3b8'
    ctx.font = "12px monospace"
    ctx.fillText(`蓄力: ${Math.round(g.charge * 100)}%`, 230, h - 28)

    // HUD
    ctx.fillStyle = '#94a3b8'
    ctx.font = "14px monospace"
    ctx.textAlign = 'left'
    ctx.fillText(`得分: ${score}  剩余: ${remaining}`, 20, 30)
  }, [score, remaining])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        if (state === 'ready') start()
        else if (state === 'over') { setState('ready'); initGame() }
      }
    }
    window.addEventListener('keydown', handler)
    return () => { window.removeEventListener('keydown', handler); if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [state, start, initGame])

  return (
    <>
      <FluidBg />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
        {(state === 'ready') && (
          <GlassPanel variant="default" className="p-4 text-center">
            <h3 className="text-lg font-bold m-0 mb-2 text-text-on-dark">专注射箭训练</h3>
            <p className="text-xs text-text-secondary-dark mb-3">专注蓄力 → 自动放箭，调整角度瞄准靶心</p>
            <Button variant="primary" onClick={start}>开始</Button>
          </GlassPanel>
        )}
        {state === 'over' && (
          <GlassPanel variant="default" className="p-4 text-center">
            <h3 className="text-lg font-bold m-0 mb-2 text-accent-cyan">训练结束</h3>
            <p className="text-sm font-mono text-text-on-dark mb-3">得分: {score}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="primary" onClick={() => { setState('ready'); initGame() }}>再来一次</Button>
              <Button variant="ghost" onClick={() => navigate('/')}>返回大厅</Button>
            </div>
          </GlassPanel>
        )}
      </div>
    </>
  )
}
