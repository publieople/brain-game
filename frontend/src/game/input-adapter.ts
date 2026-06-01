/**
 * InputAdapter — dual-source input: keyboard (direct) + WebSocket/BCU (threshold-driven)
 * Priority: keyboard > BCU
 */

import type { HUDData } from './types'

const KEY_MAP: Record<string, string> = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  Space: 'fire',
  ShiftLeft: 'shield',
  ShiftRight: 'shield',
}

export class InputAdapter {
  keys: Record<string, boolean> = {
    left: false, right: false, up: false, down: false,
    fire: false, shield: false,
  }

  wsConnected = false
  attention = 0
  meditation = 0
  telemetry: any = { timestamp: 0, eeg: {}, vision: {} }
  private attentionSamples: number[] = []
  private meditationSamples: number[] = []

  constructor() {
    this._bindKeyboard()
  }

  private _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      const key = KEY_MAP[e.code]
      if (!key) return
      if (key === 'fire') e.preventDefault()
      this.keys[key] = true
    })
    window.addEventListener('keyup', (e) => {
      const key = KEY_MAP[e.code]
      if (!key) return
      this.keys[key] = false
    })
  }

  /** Feed EEG data from WebSocket */
  feedEEG(attention: number, meditation: number) {
    this.attention = attention
    this.meditation = meditation
    this.attentionSamples.push(attention)
    this.meditationSamples.push(meditation)
    // Keep last 500 samples
    if (this.attentionSamples.length > 500) this.attentionSamples.shift()
    if (this.meditationSamples.length > 500) this.meditationSamples.shift()
  }

  getAttentionStats() {
    const samples = this.attentionSamples
    const avg = samples.length > 0
      ? samples.reduce((a, b) => a + b, 0) / samples.length
      : 0
    return { avg, last: samples[samples.length - 1] || 0 }
  }

  getMeditationStats() {
    const samples = this.meditationSamples
    const avg = samples.length > 0
      ? samples.reduce((a, b) => a + b, 0) / samples.length
      : 0
    return { avg, last: samples[samples.length - 1] || 0 }
  }

  getHUDData(): HUDData {
    return {
      score: 0,
      hp: 5,
      shield: 0,
      ws: this.wsConnected,
      attention: this.getAttentionStats().avg,
      meditation: this.getMeditationStats().avg,
      mode: this.wsConnected ? '融合控制' : '键盘操作',
    }
  }
}
