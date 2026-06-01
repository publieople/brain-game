/** Shared types for the game engine. */

export interface Vec2 {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export type GameState = 'ready' | 'running' | 'paused' | 'gameover' | 'stopped'

export interface EnemyData extends Rect {
  vy: number
  vx: number
  hp: number
  t: number
}

export interface BulletData extends Rect {
  vy: number
}

export interface ParticleData {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  ttl: number
  color: string
}

export interface StarData {
  x: number
  y: number
  s: number
}

export interface HUDData {
  score: number
  hp: number
  shield: number
  ws: boolean
  attention: number
  meditation: number
  mode: string
}
