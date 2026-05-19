# 星拓健康助手

浏览器端健康习惯管理 Web 应用，集成 MediaPipe Pose 本地体态检测与 AI 建议。所有数据存储在浏览器 localStorage，摄像头画面不上传服务器。

## 功能

| 模块 | 说明 |
|------|------|
| AI 体态检测 | 摄像头画面仅在本地浏览器分析，不上传服务器；实时识别头前伸、驼背、高低肩、身体歪斜、坐姿不稳、肩颈紧张 |
| 提肛/凯格尔训练 | 分阶段盆底肌训练（新手/久坐/男性强化/女性基础/产后恢复），动画与语音引导 |
| 护眼训练 | 20-20-20 远眺、缓慢眨眼、眼球转动、远近焦点切换、闭眼恢复 |
| 喝水记录 | 可视化水杯进度，快捷记录（100/200/300/500ml）+ 自定义毫升数，浏览器提醒 |
| 颈椎放松 | 下巴后收、肩胛后缩、耸肩放松、胸椎打开、墙天使，适合久坐间隙 |
| 数据统计 | Recharts 折线图/柱状图/饼图/面积图展示 7/30 天趋势 |
| 本地后台 | 习惯 CRUD、课程 CRUD（含动作编辑与 JSON 剪贴板）、体态检测阈值调节、提醒设置、数据导入导出与恢复默认 |
| AI 建议 | 通过 Next.js API Route 服务端代理 DeepSeek OpenAI Compatible API；无 Key 或请求失败时自动返回本地中文建议 |

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) + TypeScript (strict) |
| 姿态检测 | MediaPipe Pose（`@mediapipe/pose`，纯浏览器动态加载） |
| 摄像头 | `navigator.mediaDevices.getUserMedia` + `@mediapipe/camera_utils` |
| 动画 | Framer Motion + CSS keyframes（呼吸圈、水杯波纹、眼球运动、骨架浮动） |
| 图表 | Recharts（`ResponsiveContainer`, `LineChart`, `BarChart`, `PieChart`, `AreaChart`） |
| 语音 | Web Speech API / `speechSynthesis`（中文，可调速/音量/开关） |
| AI 代理 | OpenAI Node SDK（`OpenAI({ apiKey, baseURL })`，仅在服务端 Route Handler 使用） |
| 持久化 | `localStorage`（5 个 key：`tgang_settings` / `tgang_habits` / `tgang_courses` / `tgang_records` / `tgang_posture_rules` / `tgang_reminders`） |
| 图标 | Lucide React |

## 安装与运行

### 前置条件

- Node.js >= 18
- 现代浏览器（Chrome / Edge / Firefox，需支持 `getUserMedia` 和 `SpeechSynthesis`）
- 摄像头（体态检测功能需要）

### 步骤

```bash
# 1. 克隆/进入项目
cd sei-pose-helper

# 2. 安装依赖
npm install

# 3. 配置环境变量（可选，不配则 AI 建议使用本地 fallback）
cp .env.example .env.local
# 编辑 .env.local 填入 DEEPSEEK_API_KEY

# 4. 开发模式启动
npm run dev

# 5. 浏览器访问
# http://localhost:3000
```

### 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Turbopack 开发服务器 |
| `npm run build` | 生产构建 |
| `npm start` | 启动生产服务器 |
| `npm run typecheck` | TypeScript 类型检查（`tsc --noEmit`） |
| `npm run lint` | ESLint 检查 |

## 环境变量

复制 `.env.example` 为 `.env.local` 并填写：

```env
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

- `DEEPSEEK_API_KEY`：DeepSeek API 密钥。**不填则 AI 建议功能自动降级为本地中文建议**，其余功能不受影响。
- `DEEPSEEK_BASE_URL`：DeepSeek API 兼容地址，默认 `https://api.deepseek.com`。
- `DEEPSEEK_MODEL`：模型名称，默认 `deepseek-chat`。

**安全约束**：
- `DEEPSEEK_API_KEY` 仅在服务端 `process.env` 中读取，不会被 Next.js 打包到客户端 JS。
- 前端仅通过 `fetch('/api/ai/posture-advice', ...)` 调用，请求体中只包含姿态数值（评分、问题摘要、指标），**不包含图像或视频**。

## 项目结构

```
sei-pose-helper/
├── app/
│   ├── layout.tsx              # 根布局（元数据、AppShell）
│   ├── globals.css             # 全局样式（CSS 变量、布局、动画）
│   ├── page.tsx                # 首页
│   ├── dashboard/page.tsx      # 健康仪表盘
│   ├── posture/page.tsx        # AI 体态检测
│   ├── kegel/page.tsx          # 提肛/凯格尔训练
│   ├── eye-care/page.tsx       # 护眼训练
│   ├── water/page.tsx          # 喝水记录
│   ├── neck/page.tsx           # 颈椎放松
│   ├── records/page.tsx        # 训练记录
│   ├── stats/page.tsx          # 数据统计
│   ├── settings/page.tsx       # 设置
│   ├── admin/page.tsx          # 本地后台管理
│   └── api/ai/posture-advice/
│       └── route.ts            # AI 建议 API Route
├── components/
│   ├── AppShell.tsx            # 根布局容器
│   ├── Navbar.tsx              # 顶部导航 + 移动端底部导航
│   ├── Sidebar.tsx             # 桌面侧边导航
│   ├── StatCard.tsx            # 统计卡片
│   ├── HabitCard.tsx           # 习惯卡片
│   ├── ChartCard.tsx           # 图表卡片
│   ├── Disclaimer.tsx          # 健康免责声明
│   ├── RecordList.tsx          # 记录列表
│   ├── TrainingTimer.tsx       # 通用训练引擎（开始/暂停/继续/停止/阶段/进度/语音）
│   ├── BreathingCircle.tsx     # 呼吸动画圈
│   ├── PostureSkeleton.tsx     # 骨架姿态浮动动画
│   ├── CameraPostureDetector.tsx # 摄像头 + MediaPipe + 分析 + AI 建议集成
│   ├── WaterCup.tsx            # 水杯可视化
│   ├── EyeExerciseAnimation.tsx # 眼球动画
│   ├── NeckExerciseAnimation.tsx # 颈椎动画
│   └── KegelGuideAnimation.tsx  # 凯格尔呼吸圈动画
├── lib/
│   ├── types.ts                # 全部 TypeScript 类型定义
│   ├── defaults.ts             # 默认数据（习惯、课程、设置、规则、提醒）
│   ├── storage.ts              # localStorage 读写（含导入导出、恢复默认）
│   ├── stats.ts                # 统计计算（趋势、连续打卡、分布、汇总）
│   ├── utils.ts                # 工具函数（日期、格式化、ID、下载）
│   ├── speech.ts               # Web Speech API 封装
│   ├── posture-detector.ts     # MediaPipe Pose 封装 + 启发式姿态分析
│   └── ai.ts                   # 前端 AI 请求封装
├── .env.example
├── tsconfig.json
├── next.config.js
├── package.json
└── README.md
```

## 功能验收清单

### 页面与路由
- [ ] `/` 首页正常渲染，功能卡片可点击跳转
- [ ] `/dashboard` 仪表盘显示今日汇总和趋势
- [ ] `/posture` 体态检测页，摄像头授权后显示画面和骨架
- [ ] `/kegel` 提肛训练，课程选择、动画、计时器可用
- [ ] `/eye-care` 护眼训练，眼球动画与倒计时同步
- [ ] `/water` 喝水记录，水杯进度、快捷记录、提醒设置可用
- [ ] `/neck` 颈椎训练，动画与计时器可用
- [ ] `/records` 记录列表，类型/日期筛选、删除功能可用
- [ ] `/stats` 统计页图表正常渲染（折线图、柱状图、饼图、面积图）
- [ ] `/settings` 设置页保存后刷新不丢失
- [ ] `/admin` 后台 CRUD（习惯、课程、规则、提醒、数据导入导出）

### API 与数据
- [ ] `POST /api/ai/posture-advice` 无 Key 时返回 fallback 中文建议
- [ ] 无效 JSON 返回 `INVALID_JSON` 错误
- [ ] 字段缺失返回 `INVALID_POSTURE_PAYLOAD` 错误
- [ ] localStorage 刷新后数据不丢失
- [ ] 导出 JSON → 清空 → 导入 JSON 后数据恢复一致

### 异常边界
- [ ] 无摄像头设备时页面显示错误提示，不崩溃
- [ ] 浏览器不支持 `speechSynthesis` 时训练正常，仅语音静默
- [ ] MediaPipe 加载失败时显示错误提示
- [ ] 后端 AI 调用超时/失败时自动返回本地建议

### 隐私与安全
- [ ] 摄像头画面仅在本地 `<video>` + `<canvas>` 处理
- [ ] 浏览器 Network 面板中无图像/视频上传请求
- [ ] `DEEPSEEK_API_KEY` 不出现在客户端 JS bundle 中
- [ ] 所有页面显示健康免责声明

## 部署

### Vercel（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 在 Vercel Dashboard > Settings > Environment Variables 中添加：
# DEEPSEEK_API_KEY=your_key
# DEEPSEEK_BASE_URL=https://api.deepseek.com
# DEEPSEEK_MODEL=deepseek-chat
```

### 自托管

```bash
npm run build
npm start
# 应用默认监听 http://localhost:3000
```

可通过 `PORT` 环境变量指定端口：
```bash
PORT=8080 npm start
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 隐私

- 摄像头画面仅在本地浏览器中处理，不会上传到服务器。
- 发送给 AI 的只有姿态数据（评分、问题摘要、指标数值），不包含图像或视频。
- 所有用户数据存储在浏览器 `localStorage` 中，不依赖服务端数据库。
- 清除浏览器缓存或卸载浏览器可能导致数据丢失，请定期通过设置页导出备份。

## 免责声明

本应用仅用于健康习惯辅助和姿态提醒，不能替代医生诊断或治疗。姿态检测基于 2D 关键点的启发式估算，存在误差。如有疼痛、麻木、眩晕、术后恢复或产后恢复等情况，请先咨询医生。训练过程中如出现不适，请立即停止。

## 许可

仅限个人学习与使用。
