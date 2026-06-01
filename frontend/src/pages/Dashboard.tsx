import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { init, type EChartsType } from 'echarts'
import FluidBg from '../components/layout/FluidBg'
import { GlassPanel, Button, Slider } from '../components/ui'

const DEFAULT_THRESHOLDS = {
  attention_fire_on: 68, attention_fire_off: 60,
  meditation_shield_on: 65, meditation_shield_off: 57,
}

export default function Dashboard() {
  const navigate = useNavigate()
  const realtimeChartRef = useRef<HTMLDivElement>(null)
  const sessionChartRef = useRef<HTMLDivElement>(null)
  const realtimeChartInst = useRef<EChartsType | null>(null)
  const sessionChartInst = useRef<EChartsType | null>(null)

  const [summary, setSummary] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [sessionDetail, setSessionDetail] = useState<any>(null)
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS)
  const [thresholdMsg, setThresholdMsg] = useState('')

  const pageSize = 20

  // Init charts
  useEffect(() => {
    if (realtimeChartRef.current) {
      const chart = init(realtimeChartRef.current)
      chart.setOption({
        color: ['#3b82f6', '#10b981', '#f59e0b'],
        tooltip: { trigger: 'axis' },
        legend: { data: ['专注平滑', '放松平滑', '信号得分'], textStyle: { color: '#94a3b8' } },
        grid: { left: 50, right: 16, top: 40, bottom: 28 },
        xAxis: { type: 'time', splitLine: { lineStyle: { color: '#334155' } } },
        yAxis: { type: 'value', min: 0, max: 100, splitLine: { lineStyle: { color: '#334155' } } },
        series: [
          { name: '专注平滑', type: 'line', smooth: true, data: [], symbol: 'none' },
          { name: '放松平滑', type: 'line', smooth: true, data: [], symbol: 'none' },
          { name: '信号得分', type: 'line', smooth: true, data: [], symbol: 'none' },
        ],
      })
      realtimeChartInst.current = chart
    }
    if (sessionChartRef.current) {
      const chart = init(sessionChartRef.current)
      chart.setOption({
        color: ['#6366f1', '#06b6d4'],
        tooltip: { trigger: 'axis' },
        legend: { data: ['得分', '专注度'], textStyle: { color: '#94a3b8' } },
        grid: { left: 50, right: 16, top: 40, bottom: 48 },
        xAxis: { type: 'category', axisLabel: { rotate: 30, color: '#94a3b8' }, splitLine: { show: false } },
        yAxis: [
          { type: 'value', name: '得分', splitLine: { lineStyle: { color: '#334155' } } },
          { type: 'value', name: '专注度', min: 0, max: 100, splitLine: { show: false } },
        ],
        series: [
          { name: '得分', type: 'bar', data: [], yAxisIndex: 0 },
          { name: '专注度', type: 'line', smooth: true, data: [], yAxisIndex: 1, symbol: 'circle' },
        ],
      })
      sessionChartInst.current = chart
    }
    return () => {
      realtimeChartInst.current?.dispose()
      sessionChartInst.current?.dispose()
    }
  }, [])

  // Load summary
  useEffect(() => {
    fetch('/api/analytics/summary').then(r => r.json()).then(d => {
      if (d.status === 'success') setSummary(d.item)
    }).catch(() => {})
  }, [])

  // Load sessions
  const loadSessions = useCallback(async (p: number) => {
    try {
      const res = await fetch(`/api/analytics/sessions?page=${p}&page_size=${pageSize}`)
      const d = await res.json()
      if (d.status === 'success') {
        setSessions(d.items)
        setTotalPages(d.pagination.total_pages)
        setPage(p)
        // Update session chart
        const chart = sessionChartInst.current
        if (chart && d.items.length > 0) {
          chart.setOption({
            xAxis: { data: d.items.map((s: any) => s.player_name.slice(0, 6)) },
            series: [
              { data: d.items.map((s: any) => s.score) },
              { data: d.items.map((s: any) => s.avg_attention) },
            ],
          })
        }
      }
    } catch {}
  }, [])

  useEffect(() => { loadSessions(1) }, [loadSessions])

  // Load thresholds
  useEffect(() => {
    fetch('/api/thresholds').then(r => r.json()).then(d => {
      if (d.status === 'success') setThresholds(d.items)
    }).catch(() => {})
  }, [])

  // Load session detail
  const loadSessionDetail = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/analytics/session/${id}?limit=300`)
      const d = await res.json()
      if (d.status === 'success') {
        setSessionDetail(d)
        setSelectedSession(d.session)
        // Update realtime chart
        const chart = realtimeChartInst.current
        if (chart && d.processed.length > 0) {
          chart.setOption({
            xAxis: { data: d.processed.map((e: any) => e.timestamp) },
            series: [
              { data: d.processed.map((e: any) => e.attention_smooth) },
              { data: d.processed.map((e: any) => e.meditation_smooth) },
              { data: d.processed.map((e: any) => e.signal_score) },
            ],
          })
        }
      }
    } catch {}
  }, [])

  const handleSaveThresholds = useCallback(async () => {
    setThresholdMsg('正在保存...')
    try {
      const res = await fetch('/api/thresholds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(thresholds),
      })
      const d = await res.json()
      if (d.status === 'success') { setThresholds(d.items); setThresholdMsg('已保存') }
      else setThresholdMsg('保存失败')
    } catch { setThresholdMsg('保存失败') }
  }, [thresholds])

  return (
    <>
      <FluidBg />
      <div className="w-full h-full flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-glass-border bg-glass-medium backdrop-blur-xl">
          <div>
            <h1 className="m-0 text-xl font-bold tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #a5b4fc 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >数据面板</h1>
            <p className="m-0 text-xs text-text-secondary">BRAIN-GAME ANALYTICS</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')} className="!py-1.5 !px-3 !text-xs">返回大厅</Button>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-4 pb-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: '总场次', value: summary?.session_count ?? '--' },
                { label: '平均得分', value: summary?.avg_score?.toFixed(1) ?? '--' },
                { label: '平均专注度', value: summary?.avg_attention?.toFixed(1) ?? '--' },
                { label: '最高得分', value: summary?.max_score ?? '--' },
              ].map(kpi => (
                <GlassPanel key={kpi.label} variant="subtle" className="p-4 text-center">
                  <div className="text-2xl font-bold font-mono text-accent-cyan">{kpi.value}</div>
                  <div className="text-xs text-text-secondary mt-1">{kpi.label}</div>
                </GlassPanel>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GlassPanel variant="subtle" className="p-4">
                <h3 className="text-sm font-semibold text-text-primary m-0 mb-2">实时数据曲线</h3>
                <div ref={realtimeChartRef} className="w-full h-[260px]" />
                {!sessionDetail && (
                  <p className="text-xs text-text-tertiary text-center mt-2">点击下方会话查看详情</p>
                )}
              </GlassPanel>
              <GlassPanel variant="subtle" className="p-4">
                <h3 className="text-sm font-semibold text-text-primary m-0 mb-2">历史成绩</h3>
                <div ref={sessionChartRef} className="w-full h-[260px]" />
              </GlassPanel>
            </div>

            {/* Threshold panel */}
            <GlassPanel variant="subtle" className="p-4">
              <h3 className="text-sm font-semibold text-text-primary m-0 mb-3">阈值配置</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Slider label="开火阈值 ↑" value={thresholds.attention_fire_on} onChange={v => setThresholds(p => ({ ...p, attention_fire_on: v }))} />
                <Slider label="停止开火 ↓" value={thresholds.attention_fire_off} onChange={v => setThresholds(p => ({ ...p, attention_fire_off: v }))} />
                <Slider label="护盾阈值 ↑" value={thresholds.meditation_shield_on} onChange={v => setThresholds(p => ({ ...p, meditation_shield_on: v }))} />
                <Slider label="护盾停止 ↓" value={thresholds.meditation_shield_off} onChange={v => setThresholds(p => ({ ...p, meditation_shield_off: v }))} />
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="primary" onClick={handleSaveThresholds} className="!py-1.5 !px-4 !text-xs">保存</Button>
                <Button variant="ghost" onClick={() => setThresholds(DEFAULT_THRESHOLDS)} className="!py-1.5 !px-4 !text-xs">重置</Button>
                {thresholdMsg && <span className="text-xs text-text-tertiary self-center ml-2">{thresholdMsg}</span>}
              </div>
            </GlassPanel>

            {/* Session list */}
            <GlassPanel variant="subtle" className="p-4">
              <h3 className="text-sm font-semibold text-text-primary m-0 mb-3">历史会话</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="text-text-secondary border-b border-glass-border">
                      <th className="text-left py-2 pr-2">ID</th>
                      <th className="text-left py-2 pr-2">玩家</th>
                      <th className="text-left py-2 pr-2">游戏</th>
                      <th className="text-right py-2 pr-2">得分</th>
                      <th className="text-right py-2 pr-2">专注度</th>
                      <th className="text-right py-2 pr-2">时长</th>
                      <th className="text-right py-2 pr-2">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(s => (
                      <tr
                        key={s.session_id}
                        className="border-b border-glass-border/50 cursor-pointer hover:bg-glass-thin transition-colors"
                        onClick={() => loadSessionDetail(s.session_id)}
                      >
                        <td className="py-2 pr-2 text-accent-cyan">{s.session_id}</td>
                        <td className="py-2 pr-2 text-text-primary">{s.player_name}</td>
                        <td className="py-2 pr-2 text-text-secondary">{s.game_name}</td>
                        <td className="py-2 pr-2 text-right">{s.score}</td>
                        <td className="py-2 pr-2 text-right">{s.avg_attention.toFixed(1)}</td>
                        <td className="py-2 pr-2 text-right">{(s.duration_seconds || 0).toFixed(0)}s</td>
                        <td className="py-2 pr-2 text-right">
                          <span className={s.status === 'ended' ? 'text-accent-emerald' : 'text-accent-cyan'}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-text-tertiary">第 {page} / {totalPages} 页</span>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => loadSessions(page - 1)} disabled={page <= 1} className="!py-1 !px-3 !text-xs">上一页</Button>
                  <Button variant="ghost" onClick={() => loadSessions(page + 1)} disabled={page >= totalPages} className="!py-1 !px-3 !text-xs">下一页</Button>
                </div>
              </div>
            </GlassPanel>

            {/* Session Detail */}
            {selectedSession && sessionDetail && (
              <GlassPanel variant="default" className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-semibold m-0 text-text-primary">
                    会话 #{selectedSession.session_id} — {selectedSession.player_name}
                  </h3>
                  <Button variant="ghost" onClick={() => { setSelectedSession(null); setSessionDetail(null) }} className="!py-1 !px-3 !text-xs">
                    关闭
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="text-xs"><span className="text-text-secondary">得分:</span> <span className="text-accent-cyan font-mono">{selectedSession.score}</span></div>
                  <div className="text-xs"><span className="text-text-secondary">专注度:</span> <span className="text-accent-emerald font-mono">{selectedSession.avg_attention?.toFixed(1)}</span></div>
                  <div className="text-xs"><span className="text-text-secondary">时长:</span> <span className="font-mono text-text-primary">{(selectedSession.duration_seconds || 0).toFixed(0)}s</span></div>
                  <div className="text-xs"><span className="text-text-secondary">状态:</span> <span className={selectedSession.status === 'ended' ? 'text-accent-emerald' : 'text-accent-cyan'}>{selectedSession.status}</span></div>
                </div>
                {sessionDetail.events?.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="text-text-secondary border-b border-glass-border">
                          <th className="text-left py-1 pr-2">时间</th>
                          <th className="text-left py-1 pr-2">类型</th>
                          <th className="text-right py-1 pr-2">专注度</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionDetail.events.slice(-20).map((e: any, i: number) => (
                          <tr key={i} className="border-b border-glass-border/30">
                            <td className="py-1 pr-2 text-text-tertiary">{new Date(e.timestamp).toLocaleTimeString('zh-CN', { hour12: false })}</td>
                            <td className="py-1 pr-2">{e.event_type}</td>
                            <td className="py-1 pr-2 text-right">{e.attention_value?.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassPanel>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
