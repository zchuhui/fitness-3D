import React from 'react'
import ReactDOM from 'react-dom/client'
import { useGLTF } from '@react-three/drei'
import { BrowserRouter } from 'react-router-dom'
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import App from './App'
import { initSmoothScroll } from './lib/smoothScroll'
import './index.css'

/** Draco 解码器放在本地，离线 / PWA 也能打开压缩后的运动员骨架 */
useGLTF.setDecoderPath(`${import.meta.env.BASE_URL}draco/`)

/** lenis 平滑滚动（reduced-motion 用户自动跳过） */
initSmoothScroll()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* LazyMotion 只打包 domAnimation 特性集；MotionConfig 让 reduced-motion 用户跳过位移动画 */}
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </MotionConfig>
    </LazyMotion>
  </React.StrictMode>,
)
