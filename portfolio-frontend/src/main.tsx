import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App, { preloadRoute } from './App.tsx'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <div id="app-content">
      <App />
    </div>
  </StrictMode>
)

async function mount() {
  if (container.hasChildNodes()) {
    await preloadRoute(window.location.pathname)
    hydrateRoot(container, app)
  } else {
    createRoot(container).render(app)
  }
}

mount()
