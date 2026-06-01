/**
 * Star Raid Game Engine — main game loop, state machine, spawning, collision.
 */

import type { GameState, EnemyData, BulletData, ParticleData, StarData, HUDData, Rect } from './types'
import { InputAdapter } from './input-adapter'
import {
  clamp, rand, hitRect,
  drawStarfield, drawPlayerShip, drawBullet, drawEnemy, drawExplosions, drawOverlay,
} from './renderer'

const API_BASE = '/api'

export class GameEngine {
  // Canvas
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private dpr = 1

  // State
  state: GameState = 'ready'
  sessionId: number | null = null
  playerName: string

  // Game objects
  player: Rect = { x: 0, y: 0, w: 42, h: 48 }
  bullets: BulletData[] = []
  enemies: EnemyData[] = []
  explosions: ParticleData[] = []
  stars: StarData[] = []

  // Timers
  private lastFrame = 0
  private rafId: number | null = null
  private spawnTimer = 0
  private fireCd = 0
  private pauseTimer = 0
  private pauseDuration = 0
  private isPaused = false
  private lastEventUpload = 0
  private sessionEnded = false
  private ending = false

  // Gameplay
  score = 0
  hp = 5
  shield = 0
  shieldHitCost = 35
  shieldChargeRate = 70
  shieldDecayRate = 32
  playerSpeed = 380
  fireCooldown = 0.12
  invincible = false

  // Input
  input: InputAdapter

  // Callbacks
  onHUDUpdate?: (data: HUDData) => void
  onGameOver?: (score: number, avgAttention: number) => void
  onStateChange?: (state: GameState) => void

  constructor(canvas: HTMLCanvasElement, input: InputAdapter, playerName: string) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.input = input
    this.playerName = playerName
    this._initStars()
    this._resize()
    window.addEventListener('resize', () => this._resize())
  }

  // ── Lifecycle ──

  async start() {
    if (this.state === 'running') return
    if (this.state === 'paused') { this.resume(); return }

    if (this.sessionId && !this.sessionEnded) await this._endSession()

    this.state = 'running'
    this.score = 0
    this.hp = 5
    this.shield = 0
    this.spawnTimer = 0
    this.fireCd = 0
    this.bullets = []
    this.enemies = []
    this.explosions = []
    this.isPaused = false
    this.sessionEnded = false
    this.ending = false
    this.lastEventUpload = 0
    this.onStateChange?.('running')
    await this._startSession()
    this.lastFrame = performance.now()
    this._scheduleLoop()
  }

  pause() {
    if (this.state !== 'running') return
    this.state = 'paused'
    this.onStateChange?.('paused')
    this._postSessionState('pause')
  }

  resume() {
    if (this.state !== 'paused') return
    this.state = 'running'
    this.lastFrame = performance.now()
    this.onStateChange?.('running')
    this._postSessionState('resume')
    this._scheduleLoop()
  }

  async restart() {
    if (this.sessionId && !this.sessionEnded) await this._endSession()
    this.state = 'ready'
    this.sessionId = null
    await this.start()
  }

  stop() {
    this.state = 'stopped'
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  // ── Session API ──

  private async _startSession() {
    try {
      const res = await fetch(`${API_BASE}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: this.playerName, game_name: 'star_raid' }),
      })
      const data = await res.json()
      if (data?.status === 'success') this.sessionId = data.session_id
    } catch { /* offline mode */ }
  }

  async _endSession() {
    if (this.sessionEnded || this.ending) return this.sessionEnded
    this.ending = true

    const att = this.input.getAttentionStats()
    let endOk = !this.sessionId

    if (this.sessionId) {
      const payload = { score: this.score, avg_attention: att.avg, timestamp: Date.now() / 1000 }
      for (let i = 0; i < 3; i++) {
        try {
          const res = await fetch(`${API_BASE}/session/${this.sessionId}/end`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          })
          if (res?.ok) { endOk = true; break }
        } catch { /* retry */ }
        await new Promise(r => setTimeout(r, 120 * (i + 1)))
      }
    }

    if (!endOk) { this.ending = false; return false }

    this.sessionEnded = true
    let reportText = '成绩已结算，但报告暂时不可用。'

    try {
      const res = await fetch(`${API_BASE}/score/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: this.playerName, score: this.score, avg_attention: att.avg }),
      })
      const data = await res.json()
      if (data?.report) reportText = data.report
    } catch { /* keep fallback */ }

    if (this.state === 'gameover') {
      this.onGameOver?.(this.score, att.avg)
    }
    this.ending = false
    return true
  }

  private async _postSessionState(action: string) {
    if (!this.sessionId) return
    try {
      await fetch(`${API_BASE}/session/${this.sessionId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: Date.now() / 1000 }),
      })
    } catch { /* keep responsive */ }
  }

  // ── Game Loop ──

  private _scheduleLoop() {
    if (this.rafId !== null) return
    this.rafId = requestAnimationFrame(t => this._loop(t))
  }

  private async _loop(ts: number) {
    this.rafId = null
    if (this.state === 'stopped') return
    const dt = clamp((ts - this.lastFrame) / 1000, 0, 0.05)
    this.lastFrame = ts

    if (this.state === 'running') await this._update(dt)
    this._render()
    if (this.state !== 'stopped') this._scheduleLoop()
  }

  // ── Update ──

  private async _update(dt: number) {
    const w = window.innerWidth
    const h = window.innerHeight

    // Player movement
    const ix = (this.input.keys.right ? 1 : 0) - (this.input.keys.left ? 1 : 0)
    const iy = (this.input.keys.down ? 1 : 0) - (this.input.keys.up ? 1 : 0)
    this.player.x += ix * this.playerSpeed * dt
    this.player.y += iy * this.playerSpeed * dt
    this.player.x = clamp(this.player.x, 0, w - this.player.w)
    this.player.y = clamp(this.player.y, 0, h - this.player.h)

    // Random fire pause
    if (!this.isPaused && this.pauseTimer <= 0) {
      if (Math.random() < 0.02) {
        this.isPaused = true
        this.pauseDuration = 0.5 + Math.random() * 1.0
      }
    }
    if (this.isPaused) {
      this.pauseDuration -= dt
      if (this.pauseDuration <= 0) {
        this.isPaused = false
        this.pauseTimer = 3.0 + Math.random() * 2.0
      }
    } else {
      this.pauseTimer -= dt
    }

    // Firing
    this.fireCd -= dt
    if (!this.isPaused && this.fireCd <= 0) {
      this.fireCd = this.fireCooldown
      this._fire()
    }

    // Shield
    if (this.input.keys.shield) {
      this.shield = clamp(this.shield + this.shieldChargeRate * dt, 0, 100)
    } else {
      this.shield = clamp(this.shield - this.shieldDecayRate * dt, 0, 100)
    }

    // Spawn enemies
    this.spawnTimer -= dt
    if (this.spawnTimer <= 0) {
      this.spawnTimer = Math.max(0.24, 0.85 - this.score * 0.0025)
      this._spawnEnemy()
    }

    // Update bullets
    for (const b of this.bullets) b.y += b.vy * dt
    this.bullets = this.bullets.filter(b => b.y + b.h > -30)

    // Update enemies
    for (const e of this.enemies) {
      e.t += dt
      e.x += e.vx * dt + Math.sin(e.t * 2.3) * 30 * dt
      e.y += e.vy * dt
      e.x = clamp(e.x, 0, w - e.w)
    }

    // Enemies passed bottom
    for (const e of this.enemies) {
      if (e.y > h + 20) {
        this._damagePlayer(1)
        this._explode(e.x + e.w * 0.5, h - 8, '#fcd34d')
        e.hp = 0
      }
    }

    // Bullet-enemy collision
    for (const b of this.bullets) {
      for (const e of this.enemies) {
        if (e.hp > 0 && hitRect(b, e)) {
          b.y = -99
          e.hp -= 1
          if (e.hp <= 0) {
            this.score += 10
            this._explode(e.x + e.w * 0.5, e.y + e.h * 0.5, '#10b981')
          }
        }
      }
    }
    this.enemies = this.enemies.filter(e => e.hp > 0 && e.y < h + 40)

    // Enemy-player collision
    for (const e of this.enemies) {
      if (hitRect(e, this.player)) {
        e.hp = 0
        if (this.shield > 0) {
          this.shield = clamp(this.shield - this.shieldHitCost, 0, 100)
          this._explode(e.x + e.w * 0.5, e.y + e.h * 0.5, '#3b82f6')
        } else {
          this._damagePlayer(1)
          this._explode(e.x + e.w * 0.5, e.y + e.h * 0.5, '#f43f5e')
          this._explode(this.player.x + this.player.w * 0.5, this.player.y + this.player.h * 0.5, '#e11d48')
        }
      }
    }

    // Update explosions
    for (const p of this.explosions) {
      p.life -= dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= 0.985
      p.vy *= 0.985
    }
    this.explosions = this.explosions.filter(p => p.life > 0)

    // Upload telemetry
    const now = performance.now()
    if (this.sessionId && now - this.lastEventUpload > 1000) {
      this.lastEventUpload = now
      const att = this.input.getAttentionStats()
      fetch(`${API_BASE}/session/${this.sessionId}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attention_value: att.last,
          meditation_value: this.input.meditation,
          signal_quality: this.input.telemetry?.eeg?.signal_quality ?? -1,
          score: this.score,
          timestamp: Date.now() / 1000,
        }),
      }).catch(() => {})
    }

    // HUD update
    this.onHUDUpdate?.({
      score: this.score,
      hp: this.hp,
      shield: this.shield,
      ws: this.input.wsConnected,
      attention: this.input.getAttentionStats().avg,
      meditation: this.input.getMeditationStats().avg,
      mode: this.input.wsConnected ? '融合控制' : '键盘操作',
    })

    // Game over check
    if (this.hp <= 0 && !this.sessionEnded) {
      this.state = 'gameover'
      this.onStateChange?.('gameover')
      await this._endSession()
    }
  }

  // ── Game Actions ──

  private _damagePlayer(amount: number) {
    if (this.invincible) return
    this.hp = Math.max(0, this.hp - amount)
  }

  private _spawnEnemy() {
    const w = window.innerWidth
    const size = rand(26, 48)
    this.enemies.push({
      x: rand(20, w - 20 - size), y: -size - 10, w: size, h: size,
      vy: rand(80, 180) + this.score * 0.35, vx: rand(-32, 32),
      hp: size > 40 ? 2 : 1, t: 0,
    })
  }

  private _fire() {
    this.bullets.push({
      x: this.player.x + this.player.w * 0.5 - 2,
      y: this.player.y - 10,
      w: 4, h: 14,
      vy: -620,
    })
  }

  private _explode(x: number, y: number, color: string) {
    for (let i = 0; i < 18; i++) {
      this.explosions.push({
        x, y,
        vx: rand(-140, 140), vy: rand(-160, 160),
        life: rand(0.22, 0.52), ttl: rand(0.22, 0.52),
        color,
      })
    }
  }

  // ── Render ──

  private _render() {
    const c = this.ctx
    const w = window.innerWidth
    const h = window.innerHeight
    const now = performance.now()

    // Starfield
    drawStarfield(c, this.stars, w, h, now)

    // Bullets
    for (const b of this.bullets) drawBullet(c, b)

    // Enemies
    for (const e of this.enemies) drawEnemy(c, e)

    // Player
    drawPlayerShip(c, this.player, this.shield, this.invincible)

    // Explosions
    drawExplosions(c, this.explosions)

    // Overlay
    drawOverlay(c, w, h, this.state)
  }

  // ── Init Helpers ──

  private _initStars() {
    this.stars = []
    for (let i = 0; i < 140; i++) {
      this.stars.push({ x: Math.random(), y: Math.random(), s: rand(0.5, 2.2) })
    }
  }

  private _resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    this.canvas.style.width = `${w}px`
    this.canvas.style.height = `${h}px`
    this.canvas.width = Math.floor(w * this.dpr)
    this.canvas.height = Math.floor(h * this.dpr)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.player.x = w * 0.5 - this.player.w * 0.5
    this.player.y = h * 0.82
  }
}
