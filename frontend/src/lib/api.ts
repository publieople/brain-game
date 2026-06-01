const API_BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  return res.json()
}

// ── Telemetry ──

export interface TelemetryData {
  timestamp: number
  eeg: Record<string, number>
  vision: Record<string, number>
}

export function getTelemetry() {
  return request<{ status: string; item: TelemetryData }>('/telemetry')
}

export function postTelemetry(data: TelemetryData) {
  return request<{ status: string }>('/telemetry', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ── Thresholds ──

export interface ThresholdConfig {
  attention_fire_on: number
  attention_fire_off: number
  meditation_shield_on: number
  meditation_shield_off: number
}

export function getThresholds() {
  return request<{ status: string; items: ThresholdConfig }>('/thresholds')
}

export function saveThresholds(data: ThresholdConfig) {
  return request<{ status: string; items: ThresholdConfig }>('/thresholds', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// ── Sessions ──

export function startSession(playerName: string, gameName: string = 'unknown') {
  return request<{ status: string; session_id: number }>('/session/start', {
    method: 'POST',
    body: JSON.stringify({ player_name: playerName, game_name: gameName }),
  })
}

export function endSession(sessionId: number, score: number, avgAttention: number) {
  return request<{ status: string; session_status: string }>(`/session/${sessionId}/end`, {
    method: 'POST',
    body: JSON.stringify({ score, avg_attention: avgAttention }),
  })
}

// ── Score ──

export function saveScore(playerName: string, score: number, avgAttention: number) {
  return request<{ status: string; report: string }>('/score/save', {
    method: 'POST',
    body: JSON.stringify({ player_name: playerName, score, avg_attention: avgAttention }),
  })
}

// ── Health ──

export function healthCheck() {
  return request<{ status: string; version: string }>('/health')
}
