import React from 'react'
import ReactDOM from 'react-dom/client'
import { useGLTF } from '@react-three/drei'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

/** Draco 解码器放在本地，离线 / PWA 也能打开压缩后的运动员骨架 */
useGLTF.setDecoderPath('/draco/')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
