import { AlertTriangle } from 'lucide-react'

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <section className="card disclaimer" style={{ padding: compact ? 16 : 22 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <AlertTriangle color="var(--warning)" size={22} />
        <div>
          <strong>健康提示</strong>
          <p className="muted" style={{ margin: '6px 0 0' }}>
            本应用仅用于健康习惯辅助和姿态提醒，不能替代医生诊断或治疗。如有疼痛、麻木、眩晕、术后恢复或产后恢复等情况，请先咨询医生。
          </p>
        </div>
      </div>
    </section>
  )
}
