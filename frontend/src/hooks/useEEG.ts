/**
 * useEEG — connects to WebSocket EEG stream and provides reactive EEG data.
 */

import { useState, useRef, useCallback } from 'react'
import { useWebSocket, type WSStatus } from './useWebSocket'

export interface EEGData {
  attention: number
  meditation: number
  signalQuality: number
  source: string
}

export interface UseEEGReturn {
  eeg: EEGData
  status: WSStatus
  history: { attention: number; meditation: number; time: number }[]
  setMode: (mode: string) => void
}

const WS_BASE = `ws://${window.location.hostname}:8000`

export function useEEG(enabled: boolean = true): UseEEGReturn {
  const [eeg, setEEG] = useState<EEGData>({
    attention: 0, meditation: 0, signalQuality: 0, source: '--',
  })
  const [history, setHistory] = useState<{ attention: number; meditation: number; time: number }[]>([])
  const modeRef = useRef<string>('steady')

  const onMessage = useCallback((data: any) => {
    if (data?.action === 'telemetry' && data?.value?.eeg) {
      const e = data.value.eeg
      const newData: EEGData = {
        attention: e.attention ?? 0,
        meditation: e.meditation ?? 0,
        signalQuality: e.signal_quality ?? 0,
        source: e.source ?? '--',
      }
      setEEG(newData)
      setHistory(prev => {
        const next = [...prev, { attention: newData.attention, meditation: newData.meditation, time: Date.now() }]
        // Keep last 200 samples (~20 seconds at 10Hz)
        return next.length > 200 ? next.slice(-200) : next
      })
    }
  }, [])

  const { status, send } = useWebSocket({
    url: `${WS_BASE}/ws/eeg`,
    autoReconnect: enabled,
    maxRetries: 20,
    onMessage,
  })

  const setMode = useCallback((mode: string) => {
    modeRef.current = mode
    send(JSON.stringify({ action: 'set_mode', mode }))
  }, [send])

  return { eeg, status, history, setMode }
}
