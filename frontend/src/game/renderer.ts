/**
 * Canvas 2D rendering helpers for the Star Raid game.
 */

import type { Rect, BulletData, EnemyData, ParticleData, StarData } from './types'

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

export function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function hitRect(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export function drawStarfield(ctx: CanvasRenderingContext2D, stars: StarData[], w: number, h: number, now: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h)
  gradient.addColorStop(0, '#0f172a')
  gradient.addColorStop(1, '#1e293b')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)

  for (const s of stars) {
    ctx.globalAlpha = 0.4 + s.s * 0.18
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(
      s.x * w,
      (s.y * h + now * 0.02 * s.s) % h,
      s.s, s.s,
    )
  }
  ctx.globalAlpha = 1
}

export function drawPlayerShip(
  ctx: CanvasRenderingContext2D,
  player: Rect,
  shield: number,
  _invincible: boolean,
) {
  const p = player
  ctx.save()
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2)

  // Ship body
  ctx.beginPath()
  ctx.moveTo(0, -p.h / 2)
  ctx.lineTo(-p.w / 2, p.h / 2)
  ctx.lineTo(0, p.h / 3)
  ctx.lineTo(p.w / 2, p.h / 2)
  ctx.closePath()
  ctx.fillStyle = '#60a5fa'
  ctx.fill()

  // Cockpit
  ctx.fillStyle = '#1e3a8a'
  ctx.fillRect(-4, -10, 8, 10)

  ctx.restore()

  // Shield glow
  if (shield > 0) {
    ctx.save()
    ctx.strokeStyle = `rgba(96, 165, 250, ${0.2 + (shield / 100) * 0.75})`
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(p.x + p.w * 0.5, p.y + p.h * 0.5, p.w * 0.95, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
}

export function drawBullet(ctx: CanvasRenderingContext2D, b: BulletData) {
  ctx.fillStyle = '#8b5cf6'
  ctx.fillRect(b.x, b.y, b.w, b.h)
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: EnemyData) {
  ctx.fillStyle = e.hp > 1 ? '#ea580c' : '#dc2626'
  ctx.beginPath()
  ctx.moveTo(e.x + e.w / 2, e.y)
  ctx.lineTo(e.x + e.w, e.y + e.h)
  ctx.lineTo(e.x, e.y + e.h)
  ctx.closePath()
  ctx.fill()
}

export function drawExplosions(ctx: CanvasRenderingContext2D, explosions: ParticleData[]) {
  for (const p of explosions) {
    const a = clamp(p.life / p.ttl, 0, 1)
    ctx.globalAlpha = a
    ctx.fillStyle = p.color
    ctx.fillRect(p.x, p.y, 3, 3)
  }
  ctx.globalAlpha = 1
}

export function drawOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, state: string) {
  if (state === 'ready') {
    ctx.fillStyle = 'rgba(4,10,20,0.55)'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#94a3b8'
    ctx.font = "700 38px 'Microsoft YaHei', sans-serif"
    ctx.textAlign = 'center'
    ctx.fillText('EEG 视觉融合 · 星际突袭', w / 2, h * 0.36)
    ctx.font = "400 18px 'Microsoft YaHei', sans-serif"
    ctx.fillStyle = '#64748b'
    ctx.fillText('按 Enter 开始，WASD/方向键移动，空格开火', w / 2, h * 0.43)
  }

  if (state === 'paused') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#f8fafc'
    ctx.font = "700 40px 'Microsoft YaHei', sans-serif"
    ctx.textAlign = 'center'
    ctx.fillText('已暂停', w / 2, h * 0.46)
  }
}
