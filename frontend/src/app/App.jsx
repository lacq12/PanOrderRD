import { useState, useEffect } from 'react'
import {
  Wheat, Sun, Moon, Eye, EyeOff, ArrowLeft,
  LayoutDashboard, Package, Users, ShoppingCart,
  Settings, LogOut, ChevronLeft, ChevronRight, Bell, Menu, X
} from 'lucide-react'
import ModuleA from './ModuleA.jsx'
import ModuleB from './components/ModuleB.jsx'
import ModuleC from './components/ModuleC.jsx'
import ModuleD from './components/ModuleD.jsx'
import ModuleConfig from './components/ModuleConfig.jsx'
import NotificationsPanel from './components/NotificationsPanel.jsx'

const sidebarLinks = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { icon: <Package size={20} />,        label: 'Productos' },
  { icon: <Users size={20} />,          label: 'Clientes' },
  { icon: <ShoppingCart size={20} />,   label: 'Pedidos' },
]

export default function App() {
  const [view, setView] = useState('login')
  const [isDark, setIsDark] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const viewText = {
    login:          { title: 'Iniciar sesión',  sub: 'Ingresa tus datos para acceder a tu cuenta.' },
    'forgot-password': { title: 'Recuperar',    sub: 'Enviaremos un código de verificación a tu correo.' },
    'reset-password':  { title: 'Restablecer',  sub: 'Tu nueva contraseña debe ser diferente.' },
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (view === 'login') setView('dashboard')
    else if (view === 'forgot-password') setView('reset-password')
    else if (view === 'reset-password') setView('login')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':     return <ModuleA />
      case 'Productos':     return <ModuleB />
      case 'Clientes':      return <ModuleC />
      case 'Pedidos':       return <ModuleD />
      case 'Configuración': return <ModuleConfig />
      default:              return <ModuleA />
    }
  }

  if (view === 'dashboard') {
    return (
      <div className="flex h-screen bg-zinc-100 dark:bg-[#13151A] text-zinc-900 dark:text-white overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30
          flex flex-col
          bg-white dark:bg-[#1A1D24]
          border-r border-zinc-200 dark:border-[#303440]
          transition-all duration-300
          ${sidebarCollapsed ? 'w-[80px]' : 'w-[260px]'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Collapse button desktop */}
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className="hidden lg:flex absolute -right-3.5 top-20 w-7 h-7 rounded-full bg-white dark:bg-[#242730] border border-zinc-200 dark:border-[#303440] items-center justify-center shadow-sm z-10 hover:bg-zinc-50 dark:hover:bg-[#303440] transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Logo */}
          <div className={`flex items-center gap-3 px-5 py-5 border-b border-zinc-200 dark:border-[#303440] ${sidebarCollapsed ? 'justify-center px-0' : ''}`}>
            <Wheat size={24} className="text-[#E37A33] shrink-0" />
            {!sidebarCollapsed && (
              <span className="font-bold text-base truncate">Hermanos Paca</span>
            )}
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            {sidebarLinks.map(({ icon, label }) => {
              const active = activeTab === label
              return (
                <button
                  key={label}
                  title={label}
                  onClick={() => { setActiveTab(label); setSidebarOpen(false) }}
                  className={`
                    w-full flex items-center gap-3 rounded-xl transition-colors text-sm font-medium
                    ${sidebarCollapsed ? 'justify-center p-3' : 'px-4 py-2.5'}
                    ${active
                      ? 'bg-orange-50 dark:bg-[#E37A33]/10 text-[#E37A33]'
                      : 'text-zinc-600 dark:text-[#8D96A5] hover:bg-zinc-100 dark:hover:bg-[#242730]'
                    }
                  `}
                >
                  {icon}
                  {!sidebarCollapsed && <span>{label}</span>}
                </button>
              )
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-2 pb-4 border-t border-zinc-200 dark:border-[#303440] pt-4 space-y-1">
            <button
              title="Configuración"
              onClick={() => { setActiveTab('Configuración'); setSidebarOpen(false) }}
              className={`
                w-full flex items-center gap-3 rounded-xl transition-colors text-sm font-medium
                ${sidebarCollapsed ? 'justify-center p-3' : 'px-4 py-2.5'}
                ${activeTab === 'Configuración'
                  ? 'bg-orange-50 dark:bg-[#E37A33]/10 text-[#E37A33]'
                  : 'text-zinc-600 dark:text-[#8D96A5] hover:bg-zinc-100 dark:hover:bg-[#242730]'
                }
              `}
            >
              <Settings size={20} />
              {!sidebarCollapsed && <span>Configuración</span>}
            </button>
            <button
              title="Cerrar sesión"
              onClick={() => setView('login')}
              className={`
                w-full flex items-center gap-3 rounded-xl transition-colors text-sm font-medium
                text-red-500 dark:text-red-400/80 hover:bg-red-50 dark:hover:bg-red-400/10
                ${sidebarCollapsed ? 'justify-center p-3' : 'px-4 py-2.5'}
              `}
            >
              <LogOut size={20} />
              {!sidebarCollapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <header className="h-16 sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-[#1A1D24] border-b border-zinc-200 dark:border-[#303440]">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730]"
                onClick={() => setSidebarOpen(v => !v)}
              >
                <Menu size={20} />
              </button>
              <span className="font-semibold text-base">{activeTab}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDark(v => !v)}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730] transition-colors"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(v => !v)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730] transition-colors relative"
                >
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
              </div>
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-[#E37A33]/15 text-[#E37A33] flex items-center justify-center text-xs font-bold ml-1">
                DA
              </div>
            </div>
          </header>

          {/* Content area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </main>
        </div>
      </div>
    )
  }

  // Login / auth views
  const { title, sub } = viewText[view] || viewText['login']

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-[#13151A] text-zinc-900 dark:text-white">
      {/* Left panel — image */}
      <div className="relative lg:w-1/2 h-[35vh] lg:h-screen shrink-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2070&auto=format&fit=crop"
          alt="Panadería"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-white">
            <Wheat size={48} className="text-[#E37A33]" />
            <span className="font-bold text-2xl hidden lg:block">PanOrderRD</span>
          </div>
        </div>
        {/* Dark toggle mobile */}
        <button
          onClick={() => setIsDark(v => !v)}
          className="absolute top-4 right-4 lg:hidden p-2 rounded-full bg-white/20 backdrop-blur-sm text-white"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-start lg:items-center justify-center bg-white dark:bg-[#13151A] rounded-t-[2rem] -mt-4 lg:mt-0 lg:rounded-none relative z-10 px-6 pt-10 lg:pt-0 pb-8">
        {/* Dark toggle desktop */}
        <button
          onClick={() => setIsDark(v => !v)}
          className="absolute top-6 right-6 hidden lg:flex p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-[#242730] transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-full max-w-sm">
          {/* Back button */}
          <button
            onClick={() => setView('login')}
            className={`flex items-center gap-1.5 text-sm text-zinc-500 dark:text-[#8D96A5] hover:text-zinc-800 dark:hover:text-white mb-6 transition-colors ${view === 'login' ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ArrowLeft size={16} />
            Volver
          </button>

          <h1 className="text-3xl font-bold mb-1">{title}</h1>
          <p className="text-zinc-500 dark:text-[#8D96A5] text-sm mb-8">{sub}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-medium block mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full rounded-full px-6 py-4 text-sm bg-zinc-100 dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] outline-none focus:ring-2 focus:ring-[#E37A33] focus:border-[#E37A33] transition-all dark:text-white"
              />
            </div>

            {/* Password */}
            {(view === 'login' || view === 'reset-password') && (
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  {view === 'reset-password' ? 'Nueva contraseña' : 'Contraseña'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-full px-6 py-4 pr-14 text-sm bg-zinc-100 dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] outline-none focus:ring-2 focus:ring-[#E37A33] focus:border-[#E37A33] transition-all dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm password */}
            {view === 'reset-password' && (
              <div>
                <label className="text-sm font-medium block mb-1.5">Confirmar contraseña</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-full px-6 py-4 pr-14 text-sm bg-zinc-100 dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] outline-none focus:ring-2 focus:ring-[#E37A33] focus:border-[#E37A33] transition-all dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot password link */}
            {view === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setView('forgot-password')}
                  className="text-sm text-[#E37A33] hover:text-[#CC6824] transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-[#E37A33] hover:bg-[#CC6824] text-white py-4 font-semibold transition-colors text-sm mt-2"
            >
              {view === 'login' ? 'Iniciar sesión' : view === 'forgot-password' ? 'Enviar código' : 'Restablecer contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
