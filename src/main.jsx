import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SoundProvider } from './hooks/useSound'
import { ModeProvider } from './contexts/ModeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SoundProvider>
      <ModeProvider>
        <App />
      </ModeProvider>
    </SoundProvider>
  </StrictMode>,
)
