import { useEffect } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LibraryPage from './pages/LibraryPage'
import ExercisePage from './pages/ExercisePage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <header className="site-header">
        <Link to="/" className="logo">
          🏋️ FitMotion <b>3D</b>
        </Link>
        <span className="header-badge">React Three Fiber 驱动</span>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/exercise/:id" element={<ExercisePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-footer">
        FitMotion 3D · 3D 交互式健身动作库 · 演示动画可替换为 Mixamo 标准动作
      </footer>
    </div>
  )
}
