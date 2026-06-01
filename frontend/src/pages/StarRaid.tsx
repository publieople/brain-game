import { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import FluidBg from '../components/layout/FluidBg'
import { GlassPanel, Button, Slider, Modal } from '../components/ui'
import { GameEngine } from '../game/engine'
import { InputAdapter } from '../game/input-adapter'
import type { HUDData } from '../game/types'
import * as api from '../lib/api'
import { useEEG } from '../hooks/useEEG'

function resolvePlayerName(): string {
  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('player_name')
  if (fromQuery) {
    localStorage.setItem('bg_player_name', fromQuery)
    return fromQuery
  }
  return localStorage.getItem('bg_player_name') || 'Pilot'
}

const DEFAULT_THRESHOLDS: api.ThresholdConfig = {
  attention_fire_on: 68,
  attention_fire_off: 60,
  meditation_shield_on: 65,
  meditation_shield_off: 57,
}

export default function StarRaid() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const inputRef = useRef<InputAdapter | null>(null)

  const [hud, setHUD] = useState<HUDData | null>(null)
  const [state, setState] = useState<string>('ready')
  const [resultOpen, setResultOpen] = useState(false)
  const [resultScore, setResultScore] = useState(0)
  const [resultAttention, setResultAttention] = useState(0)
  const [thresholds, setThresholds] = useState<api.ThresholdConfig>(DEFAULT_THRESHOLDS)
  const [thresholdMsg, setThresholdMsg] = useState('')

  // Connect to EEG stream
  const { eeg, status } = useEEG(true)

  // Init game engine
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const input = new InputAdapter()
    const engine = new GameEngine(canvas, input, resolvePlayerName())
    engine.invincible = new URLSearchParams(window.location.search).get('invincible') !== '0'

    engine.onHUDUpdate = setHUD
    engine.onStateChange = setState
    engine.onGameOver = (score, avgAttention) => {
      setResultScore(score)
      setResultAttention(avgAttention)
      setResultOpen(true)
    }

    // Wire WS connection status to input adapter
    input.wsConnected = true

    engineRef.current = engine
    inputRef.current = input

    // Start render loop in ready state
    engine['_scheduleLoop']()

    return () => engine.stop()
  }, [])

  // Load thresholds on mount
  useEffect(() => {
    api.getThresholds().then(res => {
      if (res.status === 'success') setThresholds(res.items)
    }).catch(() => {})
  }, [])

  const handleStart = useCallback(() => engineRef.current?.start(), [])
  const handlePause = useCallback(() => engineRef.current?.pause(), [])
  const handleResume = useCallback(() => engineRef.current?.resume(), [])
  const handleRestart = useCallback(() => engineRef.current?.restart(), [])
  const handleLobby = useCallback(() => {
    engineRef.current?.stop()
    navigate('/')
  }, [navigate])

  const handleThresholdChange = useCallback((key: string, value: number) => {
    setThresholds(prev => {
      const next = { ...prev, [key]: value }
      // Enforce hysteresis: on > off
      if (key === 'attention_fire_on' || key === 'attention_fire_off') {
        next.attention_fire_on = Math.max(next.attention_fire_on, next.attention_fire_off)
      }
      if (key === 'meditation_shield_on' || key === 'meditation_shield_off') {
        next.meditation_shield_on = Math.max(next.meditation_shield_on, next.meditation_shield_off)
      }
      return next
    })
  }, [])

  const handleSaveThresholds = useCallback(async () => {
    setThresholdMsg('正在保存...')
    try {
      const res = await api.saveThresholds(thresholds)
      if (res.status === 'success') {
        setThresholds(res.items)
        setThresholdMsg('已保存')
      } else {
        setThresholdMsg('保存失败')
      }
    } catch {
      setThresholdMsg('保存失败')
    }
  }, [thresholds])

  const handleResetThresholds = useCallback(async () => {
    setThresholds(DEFAULT_THRESHOLDS)
    try {
      await api.saveThresholds(DEFAULT_THRESHOLDS)
      setThresholdMsg('已重置为默认值')
    } catch {
      setThresholdMsg('重置失败')
    }
  }, [])

  // Feed EEG data into game engine
  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.feedEEG(eeg.attention, eeg.meditation)
    input.wsConnected = status === 'connected'
  }, [eeg.attention, eeg.meditation, status])

  // Keyboard: Enter to start/resume
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        const engine = engineRef.current
        if (!engine) return
        if (engine.state === 'ready' || engine.state === 'gameover') engine.start()
        else if (engine.state === 'paused') engine.resume()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <FluidBg />
      <canvas
        ref={canvasRef}
        id="gameCanvas"
        className="absolute inset-0 w-full h-full z-10"
      />

      {/* HUD Overlay */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        {(state === 'running' || state === 'paused') && hud && (
          <GlassPanel variant="subtle" className="px-4 py-2 text-xs font-mono">
            <div className="flex gap-4 text-text-on-dark">
              <span>得分: <strong className="text-accent-cyan">{hud.score}</strong></span>
              <span>生命: <strong className={hud.hp <= 1 ? 'text-accent-rose' : 'text-accent-emerald'}>{'♥'.repeat(hud.hp)}</strong></span>
              <span>护盾: <strong className="text-primary-400">{hud.shield.toFixed(0)}%</strong></span>
              <span>专注: <strong className="text-accent-cyan">{hud.attention.toFixed(1)}</strong></span>
              <span>放松: <strong className="text-accent-emerald">{hud.meditation.toFixed(1)}</strong></span>
              <span>{hud.mode}</span>
            </div>
          </GlassPanel>
        )}
      </div>

      {/* Control Buttons */}
      <div className="fixed top-3 left-3 z-20 flex gap-1.5 flex-wrap" style={{ pointerEvents: state === 'ready' ? 'none' : 'auto' }}>
        {state === 'running' && (
          <Button onClick={handlePause} className="!min-w-[88px] !min-h-[38px] !text-xs">
            暂停
          </Button>
        )}
      </div>

      {/* Control Panel (bottom center) */}
      {(state === 'ready' || state === 'paused') && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20" style={{ maxWidth: 600, width: 'calc(100% - 24px)' }}>
          <GlassPanel variant="default" className="p-4">
            {state === 'ready' ? (
              <div className="text-center">
                <h2 className="text-lg font-bold m-0 mb-2 text-text-on-dark"
                  style={{
                    background: 'linear-gradient(135deg, #a5b4fc 0%, #06b6d4 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                  EEG 视觉融合 · 星际突袭
                </h2>
                <p className="text-xs text-text-secondary-dark mb-3">
                  按 Enter 开始，WASD/方向键移动，空格开火，Shift 护盾
                </p>
                <Button variant="primary" onClick={handleStart}>开始游戏</Button>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-lg font-bold m-0 mb-3 text-text-on-dark">已暂停</h3>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button variant="primary" onClick={handleResume}>继续</Button>
                  <Button variant="ghost" onClick={handleRestart}>重新开始</Button>
                  <Button variant="danger" onClick={() => {
                    const engine = engineRef.current
                    if (engine && (engine.state === 'running' || engine.state === 'paused')) {
                      engine.state = 'gameover'
                      engine['_endSession']()
                    }
                  }}>结束游戏</Button>
                  <Button variant="ghost" onClick={handleLobby}>返回大厅</Button>
                </div>
              </div>
            )}
          </GlassPanel>
        </div>
      )}

      {/* Threshold Panel (right side) */}
      <div className="fixed right-3 top-16 z-20 w-[280px]">
        {state !== 'running' && (
          <GlassPanel variant="subtle" className="p-3">
            <h3 className="text-xs font-semibold text-text-primary m-0 mb-2">阈值调参</h3>
            <Slider
              label="开火阈值↑"
              value={thresholds.attention_fire_on}
              onChange={v => handleThresholdChange('attention_fire_on', v)}
            />
            <Slider
              label="停止开火↓"
              value={thresholds.attention_fire_off}
              onChange={v => handleThresholdChange('attention_fire_off', v)}
            />
            <Slider
              label="护盾阈值↑"
              value={thresholds.meditation_shield_on}
              onChange={v => handleThresholdChange('meditation_shield_on', v)}
            />
            <Slider
              label="护盾停止↓"
              value={thresholds.meditation_shield_off}
              onChange={v => handleThresholdChange('meditation_shield_off', v)}
            />
            <div className="flex gap-1.5 mt-2">
              <Button variant="primary" onClick={handleSaveThresholds} className="!py-1.5 !px-3 !text-xs">保存</Button>
              <Button variant="ghost" onClick={handleResetThresholds} className="!py-1.5 !px-3 !text-xs">重置</Button>
            </div>
            {thresholdMsg && (
              <p className="text-[11px] text-text-tertiary mt-1.5 m-0">{thresholdMsg}</p>
            )}
          </GlassPanel>
        )}
      </div>

      {/* Result Modal */}
      <Modal
        isOpen={resultOpen}
        onClose={() => setResultOpen(false)}
        title="游戏结束"
        actions={
          <>
            <Button variant="primary" onClick={handleRestart}>再来一局</Button>
            <Button variant="ghost" onClick={() => setResultOpen(false)}>关闭</Button>
            <Button variant="ghost" onClick={handleLobby}>返回大厅</Button>
          </>
        }
      >
        <div className="font-mono text-sm space-y-1">
          <p>本局得分: <strong className="text-accent-cyan">{resultScore}</strong></p>
          <p>专注度均值: <strong className="text-accent-emerald">{resultAttention.toFixed(1)}</strong></p>
        </div>
      </Modal>
    </>
  )
}
