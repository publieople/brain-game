import { useState, useEffect, useRef, useCallback } from 'react'

export type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface UseWebSocketOptions {
  url: string
  autoReconnect?: boolean
  maxRetries?: number
  onMessage?: (data: any) => void
}

interface UseWebSocketReturn {
  status: WSStatus
  send: (data: string | object) => void
  reconnect: () => void
}

export function useWebSocket({
  url,
  autoReconnect = true,
  maxRetries = 10,
  onMessage,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [status, setStatus] = useState<WSStatus>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const retryCountRef = useRef(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mountedRef = useRef(true)

  const connect = useCallback(() => {
    if (!mountedRef.current) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setStatus('connecting')
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) { ws.close(); return }
      setStatus('connected')
      retryCountRef.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage?.(data)
      } catch {
        onMessage?.(event.data)
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setStatus('disconnected')
      wsRef.current = null

      if (autoReconnect && retryCountRef.current < maxRetries) {
        const delay = Math.min(1000 * 2 ** retryCountRef.current, 10000)
        retryCountRef.current++
        retryTimerRef.current = setTimeout(connect, delay)
      }
    }

    ws.onerror = () => {
      setStatus('error')
    }
  }, [url, autoReconnect, maxRetries, onMessage])

  useEffect(() => {
    mountedRef.current = true
    connect()
    return () => {
      mountedRef.current = false
      clearTimeout(retryTimerRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const send = useCallback((data: string | object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data))
    }
  }, [])

  const reconnect = useCallback(() => {
    retryCountRef.current = 0
    clearTimeout(retryTimerRef.current)
    wsRef.current?.close()
    connect()
  }, [connect])

  return { status, send, reconnect }
}
