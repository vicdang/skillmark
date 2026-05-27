import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#080e19' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 20,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 30,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease',
      }}
        className="lg-static"
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          background: '#080e19',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Inline responsive: sidebar always visible on lg+ */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-static {
            position: static !important;
            transform: none !important;
          }
        }
        @media (max-width: 1023px) {
          .lg-hidden-topbar { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
