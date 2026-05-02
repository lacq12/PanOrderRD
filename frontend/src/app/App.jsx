import { useState, useEffect } from 'react'
import {
  Sun, Moon, Eye, EyeOff, ArrowLeft,
  LayoutDashboard, Package, Users, ShoppingCart,
  Settings, LogOut, ChevronLeft, ChevronRight, Bell, Menu
} from 'lucide-react'
import ModuleA from './ModuleA.jsx'
import ModuleB from './components/ModuleB.jsx'
import ModuleC from './components/ModuleC.jsx'
import ModuleD from './components/ModuleD.jsx'
import ModuleConfig from './components/ModuleConfig.jsx'
import NotificationsPanel from './components/NotificationsPanel.jsx'

const sidebarLinks = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { icon: <Package size={20} />,         label: 'Productos' },
  { icon: <Users size={20} />,           label: 'Clientes' },
  { icon: <ShoppingCart size={20} />,    label: 'Pedidos' },
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
  const [submitting, setSubmitting] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const viewText = {
    login:             { title: 'Iniciar sesión', sub: 'Ingresa tus datos para acceder a tu cuenta.' },
    'forgot-password': { title: 'Recuperar',      sub: 'Enviaremos un código de verificación a tu correo.' },
    'reset-password':  { title: 'Restablecer',    sub: 'Tu nueva contraseña debe ser diferente.' },
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      if (view === 'login') setView('dashboard')
      else if (view === 'forgot-password') setView('reset-password')
      else if (view === 'reset-password') setView('login')
    }, 1000)
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

  // ─── DASHBOARD ────────────────────────────────────────────────────────────
  if (view === 'dashboard') {
    return (
      <div className="relative flex w-full h-screen overflow-hidden bg-white dark:bg-[#1A1D24] text-zinc-900 dark:text-white">
        {/* Overlay mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

          {/* ── Sidebar (es el fondo/base del contenedor) ── */}
          <aside className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:static inset-y-0 left-0 z-30
            flex flex-col shrink-0
            bg-zinc-100 dark:bg-[#1A1D24]
            border-r border-zinc-200/60 dark:border-white/5
            transition-all duration-300
            ${sidebarCollapsed ? 'w-20' : 'w-64'}
          `}>
            {/* Botón colapso — desktop */}
            <button
              onClick={() => setSidebarCollapsed(v => !v)}
              className="hidden lg:flex absolute -right-3.5 top-20 w-7 h-7 rounded-full bg-white dark:bg-[#2D3142] border border-zinc-200 dark:border-white/10 items-center justify-center shadow-sm z-10 hover:bg-zinc-50 dark:hover:bg-[#363c55] transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>

            {/* Logo */}
            <div className={`flex items-center gap-2 px-4 py-4 border-b border-zinc-200/60 dark:border-white/5 ${sidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <img src="/logo-hermanos-paca.png" alt="Hermanos Paca" className="w-14 h-14 object-contain shrink-0" />
              {!sidebarCollapsed && (
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '21.599px', fontWeight: 700, letterSpacing: '-1.566px', lineHeight: 'normal' }} className="text-[#311200] dark:text-white truncate">
                  Hermanos Paca
                </span>
              )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
              {sidebarLinks.map(({ icon, label }) => {
                const active = activeTab === label
                return (
                  <button
                    key={label}
                    title={label}
                    onClick={() => { setActiveTab(label); setSidebarOpen(false) }}
                    className={`
                      w-full flex items-center gap-3 rounded-xl transition-all text-sm font-medium
                      ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                      ${active
                        ? 'bg-[#E37A33] text-white shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-white/5 hover:text-zinc-800 dark:hover:text-white'
                      }
                    `}
                  >
                    {icon}
                    {!sidebarCollapsed && <span>{label}</span>}
                  </button>
                )
              })}
            </nav>

            {/* Bottom */}
            <div className="px-2 pb-4 border-t border-zinc-200/60 dark:border-white/5 pt-3 space-y-0.5">
              <button
                title="Configuración"
                onClick={() => { setActiveTab('Configuración'); setSidebarOpen(false) }}
                className={`
                  w-full flex items-center gap-3 rounded-xl transition-all text-sm font-medium
                  ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                  ${activeTab === 'Configuración'
                    ? 'bg-[#E37A33] text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-white/5 hover:text-zinc-800 dark:hover:text-white'
                  }
                `}
              >
                <Settings size={20} />
                {!sidebarCollapsed && <span>Configuración</span>}
              </button>
              <button
                title="Cerrar sesión"
                onClick={() => setLogoutConfirm(true)}
                className={`
                  w-full flex items-center gap-3 rounded-xl transition-all text-sm font-medium
                  text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10
                  ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                `}
              >
                <LogOut size={20} />
                {!sidebarCollapsed && <span>Cerrar sesión</span>}
              </button>
            </div>
          </aside>

          {logoutConfirm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl p-6 max-w-sm w-full shadow-xl">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-500">
                    <LogOut size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">¿Cerrar sesión?</h3>
                    <p className="text-sm text-zinc-500 dark:text-[#8D96A5] mt-1">Se cerrará tu sesión actual.</p>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setLogoutConfirm(false)}
                      className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-[#303440] rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-[#242730] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => { setLogoutConfirm(false); setView('login') }}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Columna de contenido */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

              {/* Topbar */}
              <header className="h-14 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-zinc-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <button
                    className="lg:hidden p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                    onClick={() => setSidebarOpen(v => !v)}
                  >
                    <Menu size={18} />
                  </button>
                  <span className="font-semibold text-sm">{activeTab}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsDark(v => !v)}
                    className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors text-zinc-500 dark:text-zinc-400"
                  >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setNotifOpen(v => !v)}
                      className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors text-zinc-500 dark:text-zinc-400 relative"
                    >
                      <Bell size={16} />
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#E37A33] rounded-full" />
                    </button>
                    <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#E37A33]/10 text-[#E37A33] flex items-center justify-center text-xs font-bold ml-1">
                    DA
                  </div>
                </div>
              </header>

              {/* Contenido principal */}
              <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                {renderContent()}
              </main>
          </div>
      </div>
    )
  }

  // ─── LOGIN / AUTH ──────────────────────────────────────────────────────────
  const { title, sub } = viewText[view] || viewText['login']

  const inputLogin = "w-full px-6 py-4 rounded-full border border-zinc-200 dark:border-[#303440] bg-white dark:bg-[#1A1D24]/50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#E37A33] focus:border-[#E37A33] transition-all text-base text-zinc-900 dark:text-white"

  return (
    <div className="min-h-dvh w-full flex items-center justify-center p-0 md:p-4 lg:p-5 bg-zinc-200 dark:bg-[#0C0E12] transition-colors duration-500 overflow-hidden text-zinc-900 dark:text-white">

      {/* Contenedor principal */}
      <div className="relative w-full max-w-450 h-dvh md:h-[calc(100vh-2rem)] lg:h-[calc(100vh-2.5rem)] md:min-h-150 bg-transparent md:bg-white md:dark:bg-[#1A1D24] rounded-none md:rounded-3xl lg:rounded-4xl dark:md:border dark:md:border-zinc-800 flex flex-col lg:flex-row p-0 md:p-2 lg:p-3 lg:gap-3 overflow-hidden transition-colors duration-500">

        {/* ── Panel imagen ── */}
        <div className="relative w-full lg:w-[50%] h-[35vh] sm:h-[40vh] md:h-[45vh] lg:h-full rounded-none md:rounded-2xl lg:rounded-3xl overflow-hidden shrink-0 flex flex-col justify-end p-6 lg:p-0">

          {/* Toggle mobile */}
          <button
            onClick={() => setIsDark(v => !v)}
            className="lg:hidden absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 z-50 transition-colors hover:bg-black/60"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Imagen desktop */}
          <div className="absolute inset-0 hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2070&auto=format&fit=crop"
              alt="Panadería"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-8 left-8 z-20">
              <div className="flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl w-20 h-20">
                <img src="/logo-hermanos-paca.png" alt="Hermanos Paca" style={{ width: '100px', height: '100px' }} className="object-contain" />
              </div>
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent z-10" />
          </div>

          {/* Imagen mobile */}
          <div className="absolute inset-0 lg:hidden">
            <img
              src="https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2070&auto=format&fit=crop"
              alt="Panadería"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/60 to-transparent z-10" />
          </div>

          {/* Título overlay mobile */}
          <div className="relative z-20 lg:hidden w-full text-white pb-2">
            <h1 className="text-[2rem] sm:text-[2.5rem] font-semibold tracking-tight leading-none mb-2">{title}</h1>
            <p className="text-zinc-200 text-sm sm:text-base font-medium">{sub}</p>
          </div>
        </div>

        {/* ── Panel formulario ── */}
        <div className="flex-1 w-full bg-white dark:bg-[#1A1D24] lg:bg-transparent rounded-t-4xl md:rounded-2xl lg:rounded-none -mt-4 lg:mt-0 relative z-20 p-6 pt-10 sm:p-8 md:px-16 lg:px-16 xl:px-24 flex flex-col lg:justify-center overflow-y-auto transition-colors duration-500">

          {/* Toggle desktop */}
          <button
            onClick={() => setIsDark(v => !v)}
            className="hidden lg:flex absolute top-6 right-6 p-3 rounded-full hover:bg-zinc-100 dark:hover:bg-[#242730]/50 border border-transparent dark:border-[#303440] transition-colors text-zinc-500 dark:text-[#8D96A5] z-20"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="w-full max-w-130 mx-auto">

            {/* Botón volver */}
            <button
              onClick={() => setView('login')}
              className={`flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-white mb-8 transition-colors w-fit ${view === 'login' ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <ArrowLeft size={15} /> Volver
            </button>

            {/* Título desktop */}
            <div className="hidden lg:flex lg:flex-col gap-1 mb-10">
              <h1 style={{ fontSize: '56px', fontWeight: 700, lineHeight: '56px', letterSpacing: '-3.4px', color: '#18181B', fontFamily: 'Inter, sans-serif' }} className="dark:text-white">{title}</h1>
              <p className="text-base text-zinc-500 dark:text-[#8D96A5]">{sub}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-200 ml-1">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className={inputLogin}
                />
              </div>

              {/* Password */}
              {(view === 'login' || view === 'reset-password') && (
                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-200 ml-1">
                    {view === 'reset-password' ? 'Nueva contraseña' : 'Contraseña'}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Contraseña"
                      className={`${inputLogin} pr-14`}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {view === 'login' && (
                    <div className="flex justify-end pt-1">
                      <button type="button" onClick={() => setView('forgot-password')} className="text-sm font-semibold text-zinc-500 dark:text-[#8D96A5] hover:text-[#E37A33] transition-colors">
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm password */}
              {view === 'reset-password' && (
                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-200 ml-1">Confirmar contraseña</label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirmar contraseña"
                      className={`${inputLogin} pr-14`}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Forgot password (vista forgot) */}
              {view === 'forgot-password' && (
                <div className="space-y-2.5">
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-200 ml-1">Correo electrónico</label>
                  <p className="text-xs text-zinc-400 dark:text-[#8D96A5] ml-1">Ya ingresaste tu correo arriba.</p>
                </div>
              )}

              {/* CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#E37A33] hover:bg-[#CC6824] disabled:opacity-80 text-white py-4 rounded-full font-medium text-base transition-colors flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <svg className="animate-spin w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  )}
                  {submitting
                    ? 'Cargando...'
                    : view === 'login' ? 'Iniciar sesión' : view === 'forgot-password' ? 'Enviar código' : 'Restablecer contraseña'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
