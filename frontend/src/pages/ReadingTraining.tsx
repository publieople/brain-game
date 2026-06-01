import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import FluidBg from '../components/layout/FluidBg'
import { GlassPanel, Button } from '../components/ui'

const READING_TEXT = `在人类文明的长河中，阅读始终是获取知识、传承文化的重要方式。当我们翻开一本书，不仅仅是翻开一叠纸页，更是打开了一扇通往未知世界的大门。

专注力是阅读的灵魂。没有专注的阅读，文字只是表面的符号；唯有全神贯注，我们才能真正理解作者的意图，感受文字背后的思想与情感。

科学研究表明，人类的专注力持续时间有限。通过有意识的训练，我们可以逐步延长专注时间，提高阅读效率。脑电反馈训练就是一种有效的方法——通过实时监测大脑状态，帮助我们了解自己的注意力波动，从而有针对性地进行调整。`

export default function ReadingTraining() {
  const navigate = useNavigate()
  const [active, setActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const [focus, setFocus] = useState(50)
  const [completed, setCompleted] = useState(false)
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    setActive(true)
    setProgress(0)
    setFocus(50)
    setCompleted(false)
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(id); setCompleted(true); setActive(false); return 100 }
        return p + 1
      })
      setFocus(f => Math.max(10, Math.min(95, f + (Math.random() - 0.5) * 8)))
    }, 200)
    setIntervalId(id)
  }, [])

  const stop = useCallback(() => {
    if (intervalId) clearInterval(intervalId)
    setActive(false)
    setCompleted(true)
  }, [intervalId])

  const reset = useCallback(() => {
    if (intervalId) clearInterval(intervalId)
    setActive(false)
    setProgress(0)
    setFocus(50)
    setCompleted(false)
  }, [intervalId])

  const textCursor = Math.floor((progress / 100) * READING_TEXT.length)

  return (
    <>
      <FluidBg />
      <div className="w-full h-full flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-glass-border bg-glass-medium backdrop-blur-xl">
          <h1 className="flex items-center gap-3 text-xl font-bold tracking-wider m-0"
            style={{
              background: 'linear-gradient(135deg, #a5b4fc 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
            拾光阅行 · 阅读训练
          </h1>
          <Button variant="ghost" onClick={() => navigate('/')} className="!py-1.5 !px-3 !text-xs">返回大厅</Button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
          {/* Progress bar */}
          <div className="w-full max-w-2xl">
            <div className="flex justify-between text-xs text-text-secondary font-mono mb-1">
              <span>阅读进度</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-glass-thin overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                }}
              />
            </div>
          </div>

          {/* Reading text */}
          <GlassPanel variant={active ? 'default' : 'subtle'} className="w-full max-w-2xl p-6">
            <div className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap font-serif">
              {active || completed ? (
                <>
                  <span>{READING_TEXT.slice(0, textCursor)}</span>
                  <span className="animate-pulse text-accent-cyan">|</span>
                  <span className="text-text-tertiary">{READING_TEXT.slice(textCursor)}</span>
                </>
              ) : (
                <span className="text-text-tertiary">点击"开始训练"进入专注阅读模式...</span>
              )}
            </div>
          </GlassPanel>

          {/* Focus indicator */}
          <GlassPanel variant="subtle" className="w-full max-w-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-text-secondary">专注指数</div>
              <div className="flex-1 h-3 rounded-full bg-glass-thin overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${focus}%`,
                    background: focus > 60
                      ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                      : focus > 30
                        ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                        : 'linear-gradient(90deg, #ef4444, #dc2626)',
                  }}
                />
              </div>
              <div className="text-lg font-bold font-mono" style={{
                color: focus > 60 ? '#10b981' : focus > 30 ? '#f59e0b' : '#ef4444',
              }}>
                {Math.round(focus)}
              </div>
            </div>
          </GlassPanel>

          {/* Controls */}
          {!active && !completed && (
            <Button variant="primary" onClick={start}>开始训练</Button>
          )}
          {active && (
            <Button variant="danger" onClick={stop}>结束训练</Button>
          )}
          {completed && (
            <div className="text-center">
              <h3 className="text-lg font-bold text-accent-cyan mb-2">训练完成</h3>
              <p className="text-sm text-text-secondary mb-3">平均专注度: {Math.round(focus)}%</p>
              <div className="flex gap-2 justify-center">
                <Button variant="primary" onClick={start}>再来一次</Button>
                <Button variant="ghost" onClick={reset}>重新选择</Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
