"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Settings, Target, Bell, Database, RotateCcw, Save, Upload } from 'lucide-react'
import type { UserSettings } from '@/lib/types'
import { getSettings, saveSettings, exportData, importData, resetDefaultData } from '@/lib/storage'
import { downloadJson } from '@/lib/utils'

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(getSettings())
  const [importText, setImportText] = useState('')
  const [importMsg, setImportMsg] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => { setSettings(getSettings()) }, [])

  const handleSave = () => {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = () => downloadJson('pose-helper-backup.json', exportData())

  const handleImport = () => {
    const result = importData(importText)
    if (result.ok) {
      setImportMsg('导入成功')
      setSettings(getSettings())
    } else {
      setImportMsg(result.error ?? '导入失败')
    }
  }

  const handleReset = () => {
    if (confirm('确定恢复全部默认数据？所有自定义设置和记录将被清除。')) {
      resetDefaultData()
      setSettings(getSettings())
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }} style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 className="page-title">设置</h1>
        <p className="muted">个性化你的健康助手体验。</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ margin: '0 0 16px', display: 'flex', gap: 8, alignItems: 'center' }}><Settings size={18} />个人信息</h3>
          <div style={{ display: 'grid', gap: 14 }}>
            <label className="label">
              昵称
              <input className="input" value={settings.nickname} onChange={(e) => setSettings({ ...settings, nickname: e.target.value })} />
            </label>
            <label className="label">
              性别
              <select className="select" value={settings.gender} onChange={(e) => setSettings({ ...settings, gender: e.target.value as UserSettings['gender'] })}>
                <option value="unknown">不透露</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </label>
            <label className="label">
              年龄段
              <select className="select" value={settings.ageRange} onChange={(e) => setSettings({ ...settings, ageRange: e.target.value })}>
                <option value="18-25">18-25</option>
                <option value="25-35">25-35</option>
                <option value="35-50">35-50</option>
                <option value="50+">50+</option>
              </select>
            </label>
            <label className="label">
              工作模式
              <select className="select" value={settings.workMode} onChange={(e) => setSettings({ ...settings, workMode: e.target.value })}>
                <option value="久坐办公">久坐办公</option>
                <option value="站立为主">站立为主</option>
                <option value="户外活动">户外活动</option>
                <option value="居家/自由">居家/自由</option>
              </select>
            </label>
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 16px', display: 'flex', gap: 8, alignItems: 'center' }}><Target size={18} />健康目标</h3>
          <label className="label">
            每日饮水目标（ml）
            <input className="input" type="number" min={500} max={5000} step={100} value={settings.waterGoal} onChange={(e) => setSettings({ ...settings, waterGoal: Number(e.target.value) })} />
          </label>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 16px', display: 'flex', gap: 8, alignItems: 'center' }}><Bell size={18} />语音与提醒</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <label className="label" style={{ display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" checked={settings.speechEnabled} onChange={(e) => setSettings({ ...settings, speechEnabled: e.target.checked })} /> 训练语音播报
            </label>
            <label className="label">
              语音速率
              <input className="input" type="range" min={0.5} max={2} step={0.1} value={settings.speechRate} onChange={(e) => setSettings({ ...settings, speechRate: Number(e.target.value) })} />
              <span style={{ fontSize: 13 }}>{settings.speechRate}</span>
            </label>
            <label className="label">
              语音音量
              <input className="input" type="range" min={0.1} max={1} step={0.1} value={settings.speechVolume} onChange={(e) => setSettings({ ...settings, speechVolume: Number(e.target.value) })} />
              <span style={{ fontSize: 13 }}>{settings.speechVolume}</span>
            </label>
            <label className="label" style={{ display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" checked={settings.notificationEnabled} onChange={(e) => setSettings({ ...settings, notificationEnabled: e.target.checked })} /> 浏览器通知
            </label>
            <label className="label" style={{ display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" checked={settings.aiAdviceEnabled} onChange={(e) => setSettings({ ...settings, aiAdviceEnabled: e.target.checked })} /> AI 体态建议
            </label>
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 16px', display: 'flex', gap: 8, alignItems: 'center' }}><Database size={18} />数据管理</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <button className="btn" onClick={handleExport}><Download size={16} />导出全部数据</button>
            <div>
              <textarea className="textarea" placeholder="粘贴之前导出的 JSON 数据..." value={importText} onChange={(e) => setImportText(e.target.value)} />
              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn" onClick={handleImport}><Upload size={16} />导入</button>
                {importMsg ? <span className="muted" style={{ fontSize: 13 }}>{importMsg}</span> : null}
              </div>
            </div>
            <hr style={{ border: '0', borderTop: '1px solid var(--line)' }} />
            <button className="btn btn-danger" onClick={handleReset}><RotateCcw size={16} />恢复默认数据</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" onClick={handleSave}><Save size={16} />{saved ? '已保存' : '保存设置'}</button>
      </div>

      <div className="card card-subtle">
        <p className="muted" style={{ margin: 0 }}>
          所有数据仅保存在你的浏览器 localStorage 中。不会上传到任何服务器。清除浏览器缓存或卸载浏览器可能导致数据丢失，请定期导出备份。
        </p>
      </div>
    </motion.div>
  )
}
