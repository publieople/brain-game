import TopHeader from '../components/layout/TopHeader'
import Sidebar from '../components/layout/Sidebar'
import GameCard from '../components/layout/GameCard'
import { GlassPanel, Button, FormInput, Badge } from '../components/ui'
import { useEEG } from '../hooks/useEEG'

export default function Portal() {
  const { eeg, status, setMode } = useEEG(true)

  return (
    <div className="w-full h-full flex flex-col">
      <TopHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with EEG data */}
        <Sidebar>
          <div className="flex flex-col gap-4">
            {/* EEG Data Panel */}
            <GlassPanel variant="subtle" className="p-4">
              <h4 className="text-sm font-semibold text-text-primary m-0 mb-3 flex items-center gap-2">
                脑电数据
                <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-accent-emerald shadow-[0_0_8px_#10b981]' : 'bg-accent-rose shadow-[0_0_8px_#f43f5e]'}`} />
              </h4>
              <div className="text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-secondary">专注度</span>
                  <span className="text-accent-cyan font-bold">{eeg.attention.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">放松度</span>
                  <span className="text-accent-emerald font-bold">{eeg.meditation.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">信号质量</span>
                  <span className="text-text-tertiary">{eeg.signalQuality.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">数据源</span>
                  <span className="text-text-tertiary">{eeg.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">连接</span>
                  <span className={status === 'connected' ? 'text-accent-emerald' : 'text-accent-rose'}>
                    {status === 'connected' ? '在线' : status === 'connecting' ? '连接中' : '离线'}
                  </span>
                </div>
              </div>

              {/* Simulator mode selector */}
              <div className="mt-3 pt-3 border-t border-glass-border">
                <label className="text-[11px] text-text-tertiary block mb-1.5">模拟模式</label>
                <div className="flex flex-wrap gap-1">
                  {[
                    { key: 'steady', label: '平稳' },
                    { key: 'fluctuating', label: '波动' },
                    { key: 'focused', label: '专注' },
                    { key: 'distracted', label: '分心' },
                  ].map(m => (
                    <button
                      key={m.key}
                      onClick={() => setMode(m.key)}
                      className="px-2 py-1 text-[11px] rounded-md cursor-pointer transition-colors border border-glass-border bg-glass-thin text-text-secondary hover:bg-glass-thick hover:text-text-primary"
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </GlassPanel>

            {/* Connection status */}
            <GlassPanel variant="subtle" className="p-4">
              <h4 className="text-sm font-semibold text-text-primary m-0 mb-3">控制状态</h4>
              <div className="text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-secondary">WS连接</span>
                  <span className={status === 'connected' ? 'text-accent-emerald' : 'text-accent-rose'}>
                    {status === 'connected' ? '在线' : '离线'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">后端</span>
                  <span className="text-accent-emerald">运行中</span>
                </div>
              </div>
            </GlassPanel>
          </div>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-6 pb-5">
            {/* User Card */}
            <GlassPanel className="p-6">
              <h2 className="m-0 text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #a5b4fc 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                NEURO FUSION
              </h2>
              <p className="mt-2 mb-4 text-sm text-text-secondary">
                使用脑电波与视觉融合技术，开启下一代游戏体验
              </p>
              <div className="flex gap-3">
                <FormInput placeholder="输入玩家名称" className="flex-1" />
                <Button variant="primary">确认</Button>
              </div>
            </GlassPanel>

            {/* Games Section */}
            <section>
              <h2 className="mb-5 text-xl font-semibold tracking-wider text-text-primary flex items-center gap-2">
                游戏模式{' '}
                <span className="text-accent-cyan" style={{ textShadow: '0 0 10px hsla(189, 100%, 56%, 0.5)' }}>
                  GAMES
                </span>
              </h2>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
                <GameCard
                  title="星际突袭"
                  description="使用脑电波控制飞船，在星辰大海中消灭敌人。专注力越高，火力越猛！"
                  link="/play/star_raid"
                  badgeText="热门"
                  badgeVariant="active"
                />
                <GameCard
                  title="专注射箭"
                  description="通过调节专注度来瞄准靶心，考验你的注意力控制能力。"
                  link="/play/archery"
                  badgeText="推荐"
                  badgeVariant="recommended"
                />
                <GameCard
                  title="阅读训练"
                  description="在专注阅读中训练你的注意力持久度，适合冥想与放松。"
                  link="/play/reading"
                  badgeText="专注"
                  badgeVariant="focus"
                />
                <GameCard
                  title="数据面板"
                  description="查看历史成绩、脑电数据分析和 AI 教练评估报告。"
                  link="/dashboard"
                  badgeText="分析"
                  badgeVariant="default"
                />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
