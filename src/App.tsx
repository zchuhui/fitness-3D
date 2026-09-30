import { useEffect } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LibraryPage from './pages/LibraryPage'
import ExercisePage from './pages/ExercisePage'
import TrainPage from './pages/TrainPage'
import HistoryPage from './pages/HistoryPage'
import PlanPage from './pages/PlanPage'
import PosterStudio from './pages/PosterStudio'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    // 带 #hash 的跳转（如首页的训练计划区块）滚动到对应元素
    if (hash) {
      try {
        const el = document.querySelector(hash)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
      } catch {
        // 非法选择器，退回顶部
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <header className="site-header">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden="true">
            FM
          </span>
          FitMotion <b>3D</b>
        </Link>
        <nav className="main-nav">
          <Link to={{ pathname: '/', hash: '#plans' }}>训练计划</Link>
          <Link to="/history">训练历史</Link>
        </nav>
        <span className="header-badge">React Three Fiber 驱动</span>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/exercise/:id" element={<ExercisePage />} />
          <Route path="/train/:id" element={<TrainPage />} />
          <Route path="/plan/:id" element={<PlanPage />} />
          <Route path="/history" element={<HistoryPage />} />
          {/* dev 专用隐藏路由：批量生成卡片海报 */}
          <Route path="/poster-studio" element={<PosterStudio />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-footer">
        FitMotion 3D · 3D 交互式健身动作库 · 关键帧教学 / 错误对比 / 跟练计时 / 本地日志
      </footer>
    </div>
  )
}
