import TopHeader from '../components/layout/TopHeader'
import Sidebar from '../components/layout/Sidebar'
import GameCard from '../components/layout/GameCard'
import { GlassPanel, Button, FormInput, Badge } from '../components/ui'

export default function Portal() {
  return (
    <div className="w-full h-full flex flex-col">
      <TopHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar>
          <div className="flex flex-col gap-4">
            <GlassPanel variant="subtle" className="p-4">
              <h4 className="text-sm font-semibold text-text-primary m-0 mb-3">脑电数据</h4>
              <div className="text-xs text-text-secondary space-y-1.5 font-mono">
                <div>专注度: <span className="text-accent-cyan">--</span></div>
                <div>放松度: <span className="text-accent-emerald">--</span></div>
                <div>信号质量: <span className="text-text-tertiary">--</span></div>
              </div>
            </GlassPanel>
            <GlassPanel variant="subtle" className="p-4">
              <h4 className="text-sm font-semibold text-text-primary m-0 mb-3">控制状态</h4>
              <div className="text-xs text-text-secondary space-y-1.5 font-mono">
                <div>连接: <span className="text-accent-rose">未连接</span></div>
                <div>发射: <span className="text-text-tertiary">--</span></div>
                <div>护盾: <span className="text-text-tertiary">--</span></div>
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
                  gradientFrom="hsla(228, 89%, 66%, 0.3)"
                  gradientTo="hsla(189, 100%, 56%, 0.15)"
                />
                <GameCard
                  title="专注射箭"
                  description="通过调节专注度来瞄准靶心，考验你的注意力控制能力。"
                  link="/play/archery"
                  badgeText="推荐"
                  badgeVariant="recommended"
                  gradientFrom="hsla(269, 79%, 66%, 0.3)"
                  gradientTo="hsla(228, 89%, 66%, 0.15)"
                />
                <GameCard
                  title="阅读训练"
                  description="在专注阅读中训练你的注意力持久度，适合冥想与放松。"
                  link="/play/reading"
                  badgeText="专注"
                  badgeVariant="focus"
                  gradientFrom="hsla(189, 100%, 56%, 0.25)"
                  gradientTo="hsla(228, 89%, 66%, 0.15)"
                />
                <GameCard
                  title="数据面板"
                  description="查看历史成绩、脑电数据分析和 AI 教练评估报告。"
                  link="/dashboard"
                  badgeText="分析"
                  badgeVariant="default"
                  gradientFrom="hsla(340, 89%, 66%, 0.2)"
                  gradientTo="hsla(269, 79%, 66%, 0.15)"
                />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
