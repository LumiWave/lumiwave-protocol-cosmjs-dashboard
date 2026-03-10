import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { NetworkProvider } from './config/NetworkContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NetworkProvider>
      <App />
    </NetworkProvider>
  </StrictMode>,
)
