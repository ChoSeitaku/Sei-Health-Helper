"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Plus, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import type { Habit, HabitType, PostureRuleSettings, ReminderSettings, TrainingAction, TrainingCourse } from '@/lib/types'
import { defaultCourses, defaultHabits, defaultPostureRules, defaultReminders } from '@/lib/defaults'
import { getHabits, saveHabits, getCourses, saveCourses, getPostureRules, savePostureRules, getReminders, saveReminders, exportData, importData, resetDefaultData } from '@/lib/storage'
import { uid, downloadJson } from '@/lib/utils'

type Tab = 'habits' | 'courses' | 'rules' | 'reminders' | 'data'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('habits')
  const [habits, setHabits] = useState<Habit[]>(getHabits())
  const [courses, setCourses] = useState<TrainingCourse[]>(getCourses())
  const [rules, setRules] = useState<PostureRuleSettings>(getPostureRules())
  const [reminders, setReminders] = useState<ReminderSettings>(getReminders())
  const [importText, setImportText] = useState('')
  const [importMsg, setImportMsg] = useState('')
  const [editAction, setEditAction] = useState<string>('')

  useEffect(() => {
    const update = () => {
      setHabits(getHabits())
      setCourses(getCourses())
      setRules(getPostureRules())
      setReminders(getReminders())
    }
    update()
    window.addEventListener('storage', update)
    return () => window.removeEventListener('storage', update)
  }, [])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }} style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 className="page-title">后台管理</h1>
        <p className="muted">管理习惯、课程、检测规则、提醒和数据。</p>
      </div>

      <div className="tabs">
        {([
          { key: 'habits' as Tab, label: '习惯管理' },
          { key: 'courses' as Tab, label: '课程管理' },
          { key: 'rules' as Tab, label: '体态规则' },
          { key: 'reminders' as Tab, label: '提醒设置' },
          { key: 'data' as Tab, label: '数据管理' }
        ]).map((item) => (
          <button key={item.key} className={`tab ${tab === item.key ? 'active' : ''}`} onClick={() => setTab(item.key)}>{item.label}</button>
        ))}
      </div>

      {tab === 'habits' && (
        <div className="table-list">
          {habits.map((habit) => (
            <div key={habit.id} className="row-card">
              <div style={{ display: 'grid', gap: 8, flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input className="input" value={habit.name} onChange={(e) => setHabits(habits.map((h) => h.id === habit.id ? { ...h, name: e.target.value, updatedAt: new Date().toISOString() } : h))} style={{ fontWeight: 700, maxWidth: 200 }} />
                  <select className="select" value={habit.type} onChange={(e) => setHabits(habits.map((h) => h.id === habit.id ? { ...h, type: e.target.value as HabitType, updatedAt: new Date().toISOString() } : h))} style={{ maxWidth: 120 }}>
                    <option value="posture">posture</option>
                    <option value="kegel">kegel</option>
                    <option value="eye-care">eye-care</option>
                    <option value="water">water</option>
                    <option value="neck">neck</option>
                  </select>
                  <label className="label" style={{ display: 'flex', flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <input type="checkbox" checked={habit.enabled} onChange={(e) => setHabits(habits.map((h) => h.id === habit.id ? { ...h, enabled: e.target.checked, updatedAt: new Date().toISOString() } : h))} /> 启用
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input className="input" value={habit.description} onChange={(e) => setHabits(habits.map((h) => h.id === habit.id ? { ...h, description: e.target.value } : h))} style={{ maxWidth: 320 }} />
                  <label className="label" style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    目标<input className="input" type="number" value={habit.dailyGoal} onChange={(e) => setHabits(habits.map((h) => h.id === habit.id ? { ...h, dailyGoal: Number(e.target.value) } : h))} style={{ width: 72 }} />
                  </label>
                  <input className="input" value={habit.unit} onChange={(e) => setHabits(habits.map((h) => h.id === habit.id ? { ...h, unit: e.target.value } : h))} style={{ width: 72 }} />
                  <input className="input" type="color" value={habit.color} onChange={(e) => setHabits(habits.map((h) => h.id === habit.id ? { ...h, color: e.target.value } : h))} style={{ width: 48 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-danger" onClick={() => setHabits(habits.filter((h) => h.id !== habit.id))}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          <button className="btn btn-ghost" onClick={() => {
            const now = new Date().toISOString()
            setHabits([...habits, { id: uid('habit'), name: '新习惯', type: 'posture', description: '', enabled: true, dailyGoal: 1, unit: '次', color: '#10b981', icon: 'Activity', createdAt: now, updatedAt: now }])
          }}><Plus size={16} />添加习惯</button>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={() => saveHabits(habits)}><Save size={16} />保存习惯</button>
          </div>
        </div>
      )}

      {tab === 'courses' && (
        <div className="table-list">
          {courses.map((course) => (
            <div key={course.id} className="row-card">
              <div style={{ display: 'grid', gap: 8, flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input className="input" value={course.name} onChange={(e) => setCourses(courses.map((c) => c.id === course.id ? { ...c, name: e.target.value } : c))} style={{ fontWeight: 700, maxWidth: 200 }} />
                  <select className="select" value={course.habitType} onChange={(e) => setCourses(courses.map((c) => c.id === course.id ? { ...c, habitType: e.target.value as 'kegel' | 'eye-care' | 'neck' } : c))} style={{ maxWidth: 120 }}>
                    <option value="kegel">kegel</option>
                    <option value="eye-care">eye-care</option>
                    <option value="neck">neck</option>
                  </select>
                  <select className="select" value={course.level} onChange={(e) => setCourses(courses.map((c) => c.id === course.id ? { ...c, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' } : c))} style={{ maxWidth: 120 }}>
                    <option value="beginner">beginner</option>
                    <option value="intermediate">intermediate</option>
                    <option value="advanced">advanced</option>
                  </select>
                  <label className="label" style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <input type="checkbox" checked={course.enabled} onChange={(e) => setCourses(courses.map((c) => c.id === course.id ? { ...c, enabled: e.target.checked } : c))} /> 启用
                  </label>
                </div>
                <input className="input" value={course.description} onChange={(e) => setCourses(courses.map((c) => c.id === course.id ? { ...c, description: e.target.value } : c))} />
                <button className="btn btn-ghost" style={{ justifySelf: 'start' }} onClick={() => {
                  const isEditing = editAction === course.id
                  setEditAction(isEditing ? '' : course.id)
                }}>{editAction === course.id ? '收起动作' : `编辑动作 (${course.actions.length})`}</button>
                {editAction === course.id && (
                  <div style={{ display: 'grid', gap: 12, padding: 12, border: '1px solid var(--line)', borderRadius: 16, background: 'rgba(255,255,255,.5)' }}>
                    {course.actions.map((action, idx) => (
                      <div key={action.id} style={{ display: 'grid', gap: 6 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <input className="input" value={action.name} onChange={(e) => {
                            const updated = course.actions.map((a) => a.id === action.id ? { ...a, name: e.target.value } : a)
                            setCourses(courses.map((c) => c.id === course.id ? { ...c, actions: updated } : c))
                          }} style={{ maxWidth: 140 }} />
                          <input className="input" value={action.type} onChange={(e) => {
                            const updated = course.actions.map((a) => a.id === action.id ? { ...a, type: e.target.value } : a)
                            setCourses(courses.map((c) => c.id === course.id ? { ...c, actions: updated } : c))
                          }} style={{ maxWidth: 120 }} />
                          <input className="input" type="number" value={action.durationSeconds} onChange={(e) => {
                            const updated = course.actions.map((a) => a.id === action.id ? { ...a, durationSeconds: Number(e.target.value) } : a)
                            setCourses(courses.map((c) => c.id === course.id ? { ...c, actions: updated } : c))
                          }} style={{ width: 64 }} placeholder="秒" />
                          <input className="input" type="number" value={action.restSeconds} onChange={(e) => {
                            const updated = course.actions.map((a) => a.id === action.id ? { ...a, restSeconds: Number(e.target.value) } : a)
                            setCourses(courses.map((c) => c.id === course.id ? { ...c, actions: updated } : c))
                          }} style={{ width: 64 }} placeholder="休息秒" />
                          <input className="input" type="number" value={action.repeat} onChange={(e) => {
                            const updated = course.actions.map((a) => a.id === action.id ? { ...a, repeat: Number(e.target.value) } : a)
                            setCourses(courses.map((c) => c.id === course.id ? { ...c, actions: updated } : c))
                          }} style={{ width: 64 }} placeholder="次数" />
                          <button className="btn btn-danger" onClick={() => {
                            const updated = course.actions.filter((a) => a.id !== action.id)
                            setCourses(courses.map((c) => c.id === course.id ? { ...c, actions: updated } : c))
                          }}><Trash2 size={14} /></button>
                          <button className="btn btn-ghost" onClick={() => navigator.clipboard.writeText(JSON.stringify(action, null, 2))}>复制 JSON</button>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input className="input" value={action.instruction} onChange={(e) => {
                            const updated = course.actions.map((a) => a.id === action.id ? { ...a, instruction: e.target.value } : a)
                            setCourses(courses.map((c) => c.id === course.id ? { ...c, actions: updated } : c))
                          }} placeholder="文字指导" />
                          <input className="input" value={action.voiceText} onChange={(e) => {
                            const updated = course.actions.map((a) => a.id === action.id ? { ...a, voiceText: e.target.value } : a)
                            setCourses(courses.map((c) => c.id === course.id ? { ...c, actions: updated } : c))
                          }} placeholder="语音文本" />
                        </div>
                      </div>
                    ))}
                    <button className="btn btn-ghost" style={{ justifySelf: 'start' }} onClick={() => {
                      const newAction: TrainingAction = { id: uid('action'), name: '新动作', type: 'custom', instruction: '', durationSeconds: 5, restSeconds: 3, repeat: 3, voiceText: '' }
                      setCourses(courses.map((c) => c.id === course.id ? { ...c, actions: [...c.actions, newAction] } : c))
                    }}><Plus size={14} />添加动作</button>
                  </div>
                )}
              </div>
              <button className="btn btn-danger" onClick={() => setCourses(courses.filter((c) => c.id !== course.id))}><Trash2 size={14} /></button>
            </div>
          ))}
          <button className="btn btn-ghost" onClick={() => {
            setCourses([...courses, { id: uid('course'), habitType: 'kegel', name: '新课程', level: 'beginner', description: '', durationSeconds: 60, actions: [], enabled: true }])
          }}><Plus size={16} />添加课程</button>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={() => saveCourses(courses)}><Save size={16} />保存课程</button>
          </div>
        </div>
      )}

      {tab === 'rules' && (
        <div className="card">
          <div style={{ display: 'grid', gap: 14, maxWidth: 520 }}>
            {([
              { key: 'headForwardThreshold', label: '头前伸阈值' },
              { key: 'shoulderTiltThreshold', label: '高低肩阈值' },
              { key: 'spineAngleThreshold', label: '脊柱角度阈值（度）' },
              { key: 'bodyLeanThreshold', label: '身体侧倾阈值' },
              { key: 'stabilityThreshold', label: '不稳定阈值' },
              { key: 'issueDurationThreshold', label: '问题持续时间阈值（秒）' }
            ]).map((item) => (
              <label key={item.key} className="label">
                {item.label}
                <input className="input" type="number" step="0.01" value={rules[item.key as keyof PostureRuleSettings] as number} onChange={(e) => setRules({ ...rules, [item.key]: Number(e.target.value) })} />
              </label>
            ))}
            <label className="label" style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" checked={rules.aiAdviceEnabled} onChange={(e) => setRules({ ...rules, aiAdviceEnabled: e.target.checked })} /> AI 建议
            </label>
          </div>
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => savePostureRules(rules)}><Save size={16} />保存体态规则</button>
          </div>
        </div>
      )}

      {tab === 'reminders' && (
        <div className="card">
          <div style={{ display: 'grid', gap: 14, maxWidth: 480 }}>
            {([
              { key: 'waterIntervalMinutes', label: '喝水提醒间隔（分钟）' },
              { key: 'eyeCareIntervalMinutes', label: '护眼提醒间隔（分钟）' },
              { key: 'sedentaryIntervalMinutes', label: '久坐提醒间隔（分钟）' },
              { key: 'dailyTrainingGoal', label: '每日训练目标（次）' }
            ]).map((item) => (
              <label key={item.key} className="label">
                {item.label}
                <input className="input" type="number" value={reminders[item.key as keyof ReminderSettings] as number} onChange={(e) => setReminders({ ...reminders, [item.key]: Number(e.target.value) })} />
              </label>
            ))}
            <label className="label" style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" checked={reminders.notificationEnabled} onChange={(e) => setReminders({ ...reminders, notificationEnabled: e.target.checked })} /> 通知启用
            </label>
            <label className="label" style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" checked={reminders.speechEnabled} onChange={(e) => setReminders({ ...reminders, speechEnabled: e.target.checked })} /> 语音启用
            </label>
          </div>
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => saveReminders(reminders)}><Save size={16} />保存提醒设置</button>
          </div>
        </div>
      )}

      {tab === 'data' && (
        <div className="card" style={{ display: 'grid', gap: 16 }}>
          <div>
            <button className="btn" onClick={() => downloadJson('pose-helper-backup.json', exportData())}><Download size={16} />导出全部数据</button>
          </div>
          <div>
            <textarea className="textarea" placeholder="粘贴 JSON 数据..." value={importText} onChange={(e) => setImportText(e.target.value)} />
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn" onClick={() => {
                const result = importData(importText)
                setImportMsg(result.ok ? '导入成功' : (result.error ?? '导入失败'))
                if (result.ok) {
                  setHabits(getHabits())
                  setCourses(getCourses())
                  setRules(getPostureRules())
                  setReminders(getReminders())
                }
              }}><Upload size={16} />导入</button>
              {importMsg ? <span className="muted" style={{ fontSize: 13 }}>{importMsg}</span> : null}
            </div>
          </div>
          <hr style={{ border: '0', borderTop: '1px solid var(--line)' }} />
          <div>
            <button className="btn btn-danger" onClick={() => {
              if (confirm('确定恢复全部默认数据？')) {
                resetDefaultData()
                setHabits(getHabits())
                setCourses(getCourses())
                setRules(getPostureRules())
                setReminders(getReminders())
              }
            }}><RotateCcw size={16} />恢复默认数据</button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
