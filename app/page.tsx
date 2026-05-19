"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Activity, ArrowRight, Eye, Flower2, ScanLine, ShieldCheck, Star, Users } from 'lucide-react'
import { Disclaimer } from '@/components/Disclaimer'

const features = [
  { href: '/posture', icon: ScanLine, title: 'AI 体态检测', desc: '摄像头本地分析，无需上传图像；实时识别头前伸、驼背、高低肩和身体歪斜。', color: 'var(--primary)' },
  { href: '/kegel', icon: Activity, title: '提肛 / 凯格尔训练', desc: '科学分阶段盆底肌训练，新手、久坐、强化多课程可选。', color: 'var(--warning)' },
  { href: '/eye-care', icon: Eye, title: '护眼训练', desc: '20-20-20 远眺、眨眼、远近焦点切换和眼球放松动画引导。', color: 'var(--secondary)' },
  { href: '/water', icon: Flower2, title: '喝水记录', desc: '可视化水杯进度，快捷记录 + 自定义毫升数，浏览器提醒。', color: '#0ea5e9' }
]

const steps = [
  { label: '允许摄像头', desc: '浏览器本地分析，不上传任何图像。' },
  { label: '站直或坐直', desc: '保持日常姿势，AI 识别体态倾向。' },
  { label: '获取建议', desc: '查看评分与 AI 生成的动作提示。' },
  { label: '开始训练', desc: '跟随动画和语音完成每日健康习惯。' }
]

export default function HomePage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} style={{ display: 'grid', gap: 28 }}>
      <section className="hero-grid">
        <div className="card" style={{ display: 'grid', gap: 24 }}>
          <div className="badge"><Star size={14} />免费 · 隐私优先</div>
          <h1 className="page-title">用 AI 摄像头<br />养成健康身体习惯</h1>
          <p className="muted" style={{ fontSize: 17, maxWidth: 540 }}>
            星拓健康助手在你本地浏览器中运行真人姿态检测，不上传任何图像，同时提供提肛、护眼、喝水、颈椎等全套健康习惯训练。
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link className="btn btn-primary" href="/posture"><ScanLine size={20} />开始体态检测</Link>
            <Link className="btn" href="/dashboard">查看仪表盘 <ArrowRight size={16} /></Link>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div><Users size={16} style={{ marginRight: 6 }} />本地运行</div>
            <div><ShieldCheck size={16} style={{ marginRight: 6 }} />不上传图像</div>
            <div><Star size={16} style={{ marginRight: 6 }} />免费使用</div>
          </div>
        </div>
        <div className="card" style={{ display: 'grid', gap: 18, alignContent: 'center' }}>
          <h2 style={{ margin: 0 }}>三步开始</h2>
          {steps.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <span className="logo-mark" style={{ width: 36, height: 36, borderRadius: 12 }}>{i + 1}</span>
              <div>
                <strong>{step.label}</strong>
                <p className="muted" style={{ margin: 0 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">核心功能</h2>
        <div className="grid-2">
          {features.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="card" style={{ display: 'grid', gap: 14 }}>
                <span className="logo-mark" style={{ background: item.color }}><Icon size={24} /></span>
                <div>
                  <h3 style={{ margin: '0 0 6px' }}>{item.title}</h3>
                  <p className="muted" style={{ margin: 0 }}>{item.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <Disclaimer />
    </motion.div>
  )
}
