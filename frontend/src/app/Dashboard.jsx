import { useMemo, useState } from 'react'
import { useStore } from '../store.js'
import { TrendingUp, CheckCircle2, Clock, Package } from 'lucide-react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useLoading, skeletonTheme } from '../hooks/useLoading.js'

const estadoBadge = {
  Pendiente:  'bg-red-400/10 text-red-400',
  Parcial:    'bg-yellow-400/10 text-yellow-400',
  Completado: 'bg-emerald-400/10 text-emerald-400',
  Confirmado: 'bg-blue-400/10 text-blue-400',
  Entregado:  'bg-emerald-400/10 text-emerald-400',
  Cancelado:  'bg-zinc-400/10 text-zinc-400',
}

const RANGES = [
  { value: 'today', label: 'Hoy' },
  { value: 'week',  label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'year',  label: 'Este año' },
  { value: 'custom', label: 'Personalizado' },
]

function fmt(n) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(n ?? 0)
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function startOfDay(d) {
  const r = new Date(d); r.setHours(0, 0, 0, 0); return r
}
function endOfDay(d) {
  const r = new Date(d); r.setHours(23, 59, 59, 999); return r
}

function getPedidoDate(p) {
  return p.fecha_registro || p.creado_en || p.created_at || p.fecha_entrega
}

function isInRange(p, rangeType, fromDate, toDate) {
  const raw = getPedidoDate(p)
  if (!raw) return false
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return false
  const now = new Date()

  if (rangeType === 'today') {
    return d >= startOfDay(now) && d <= endOfDay(now)
  }
  if (rangeType === 'week') {
    const start = new Date(now)
    const diff = start.getDay() === 0 ? 6 : start.getDay() - 1
    start.setDate(start.getDate() - diff)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return d >= start && d <= end
  }
  if (rangeType === 'month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }
  if (rangeType === 'year') {
    return d.getFullYear() === now.getFullYear()
  }
  if (rangeType === 'custom') {
    if (!fromDate || !toDate) return false
    const start = startOfDay(fromDate)
    const end   = endOfDay(toDate)
    if (start > end) return false
    return d >= start && d <= end
  }
  return true
}

function getRangeLabel(rangeType, fromDate, toDate) {
  if (rangeType !== 'custom') return RANGES.find(r => r.value === rangeType)?.label
  if (!fromDate || !toDate) return 'Personalizado'
  return `${formatDate(fromDate)} — ${formatDate(toDate)}`
}

function DashboardSkeleton({ isDark }) {
  const base  = isDark ? '#2a2d35' : '#e4e4e7'
  const high  = isDark ? '#383c47' : '#f4f4f5'
  return (
    <SkeletonTheme baseColor={base} highlightColor={high}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <Skeleton width={120} height={14} borderRadius={8} />
              <Skeleton width={36} height={36} borderRadius={12} />
            </div>
            <Skeleton width={100} height={32} borderRadius={8} />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-[#303440]">
          <Skeleton width={160} height={16} borderRadius={6} />
        </div>
        <div className="px-6 py-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton width={50}  height={14} borderRadius={6} />
              <Skeleton width={90}  height={14} borderRadius={6} />
              <Skeleton width={80}  height={14} borderRadius={6} />
              <Skeleton width={80}  height={14} borderRadius={6} />
              <Skeleton width={70}  height={20} borderRadius={20} />
              <Skeleton width={70}  height={20} borderRadius={20} />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-[#303440]">
          <Skeleton width={200} height={16} borderRadius={6} />
        </div>
        <div className="p-6 flex flex-wrap gap-2">
          {[100, 80, 120, 90, 110].map((w, i) => (
            <Skeleton key={i} width={w} height={30} borderRadius={999} />
          ))}
        </div>
      </div>
    </SkeletonTheme>
  )
}

export default function ModuleA() {
  const { pedidos, productos } = useStore()
  const loading = useLoading()
  const { baseColor, highlightColor } = skeletonTheme()

  const [rangeType, setRangeType] = useState('month')
  const [fromDate, setFromDate] = useState('')
  const [toDate,   setToDate]   = useState('')

  const pedidosFiltrados = useMemo(
    () => pedidos.filter(p => isInRange(p, rangeType, fromDate, toDate)),
    [pedidos, rangeType, fromDate, toDate]
  )

  const { esperados, cobrados, pendiente } = useMemo(() => {
    const activos = pedidosFiltrados.filter(p => p.estado_pedido !== 'Cancelado')
    const esperados = activos.reduce((sum, p) => sum + toNumber(p.monto_total), 0)
    const cobrados  = activos.reduce((sum, p) => sum + toNumber(p.anticipo_pagado), 0)
    return { esperados, cobrados, pendiente: esperados - cobrados }
  }, [pedidosFiltrados])

  const ingredientesConsolidados = useMemo(() => {
    const activos = pedidos.filter(p => p.estado_pedido !== 'Cancelado' && p.estado_pedido !== 'Entregado')
    const map = {}
    activos.forEach(pedido => {
      ;(pedido.items || []).forEach(item => {
        const prod = productos.find(p => p.id === item.producto_id)
        if (!prod) return
        ;(prod.ingredientes || []).forEach(ing => {
          const key = ing.nombre
          if (!map[key]) map[key] = { nombre: ing.nombre, cantidad: 0, unidad: ing.unidad }
          map[key].cantidad += (ing.cantidad || 0) * item.cantidad
        })
      })
    })
    return Object.values(map)
  }, [pedidos, productos])

  const pedidosRecientes = useMemo(
    () => pedidosFiltrados
      .slice()
      .sort((a, b) => new Date(getPedidoDate(b)) - new Date(getPedidoDate(a))),
    [pedidosFiltrados]
  )

  const kpis = [
    { label: 'Ingresos Esperados', value: fmt(esperados),           icon: <TrendingUp size={20} />,   color: 'text-[#E37A33] bg-[#E37A33]/10' },
    { label: 'Ingresos Cobrados',  value: fmt(cobrados),            icon: <CheckCircle2 size={20} />, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Saldo Pendiente',    value: fmt(pendiente),           icon: <Clock size={20} />,        color: 'text-red-400 bg-red-400/10' },
    { label: 'Total Pedidos',      value: pedidosFiltrados.length,  icon: <Package size={20} />,      color: 'text-blue-400 bg-blue-400/10' },
  ]

  const customInvalid = rangeType === 'custom' && fromDate && toDate && new Date(fromDate) > new Date(toDate)

  if (loading) return (
    <div className="space-y-6">
      <DashboardSkeleton isDark={document.documentElement.classList.contains('dark')} />
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Range selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-xl p-1 gap-1">
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRangeType(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                rangeType === r.value
                  ? 'bg-[#E37A33] text-white'
                  : 'text-zinc-500 dark:text-[#8D96A5] hover:bg-zinc-100 dark:hover:bg-[#242730]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {rangeType === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#E37A33] dark:text-white"
            />
            <span className="text-xs text-zinc-400">—</span>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={e => setToDate(e.target.value)}
              className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#E37A33] dark:text-white"
            />
            {customInvalid && (
              <span className="text-xs text-red-500">Rango inválido</span>
            )}
          </div>
        )}

        <span className="text-xs text-zinc-400 dark:text-[#8D96A5]">
          Mostrando: <span className="font-medium text-zinc-600 dark:text-zinc-300">{getRangeLabel(rangeType, fromDate, toDate)}</span>
        </span>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <span className="text-sm text-zinc-500 dark:text-[#8D96A5]">{label}</span>
              <span className={`p-2 rounded-xl ${color}`}>{icon}</span>
            </div>
            <span className="text-3xl font-semibold">{value}</span>
          </div>
        ))}
      </div>

      {/* Pedidos del período */}
      <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-[#303440] flex items-center justify-between">
          <h2 className="font-semibold">Pedidos recientes</h2>
          <span className="text-xs text-zinc-400 dark:text-[#8D96A5]">{pedidosRecientes.length} pedido(s)</span>
        </div>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-[#242730] border-b border-zinc-200 dark:border-[#303440] sticky top-0">
              <tr>
                {['#', 'Fecha Registro', 'Fecha de Entrega', 'Total', 'Anticipo', 'Estado Pago', 'Estado Pedido'].map(h => (
                  <th key={h} className="px-6 py-3 text-xs font-medium text-zinc-500 dark:text-[#8D96A5] uppercase tracking-wide text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-[#303440]/50">
              {pedidosRecientes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 dark:text-[#8D96A5]">
                    <Package size={32} className="mx-auto opacity-40 mb-2" />
                    <p className="font-medium">No hay pedidos en este período.</p>
                  </td>
                </tr>
              ) : pedidosRecientes.map(p => (
                <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-[#242730]/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500">#{String(p.id).padStart(4, '0')}</td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-[#8D96A5]">{formatDate(p.fecha_registro)}</td>
                  <td className="px-6 py-4">{formatDate(p.fecha_entrega)}</td>
                  <td className="px-6 py-4 font-medium">{fmt(p.monto_total)}</td>
                  <td className="px-6 py-4">{fmt(p.anticipo_pagado)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${estadoBadge[p.estado_pago] || 'bg-zinc-400/10 text-zinc-400'}`}>
                      {p.estado_pago}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${estadoBadge[p.estado_pedido] || 'bg-zinc-400/10 text-zinc-400'}`}>
                      {p.estado_pedido}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingredientes consolidados */}
      <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-[#303440]">
          <h2 className="font-semibold">Ingredientes necesarios <span className="text-xs font-normal text-zinc-500 dark:text-[#8D96A5]">(pedidos activos)</span></h2>
        </div>
        <div className="overflow-x-auto">
          {ingredientesConsolidados.length === 0 ? (
            <p className="text-center text-zinc-500 dark:text-[#8D96A5] py-6 text-sm">No hay pedidos activos con ingredientes registrados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-[#242730] border-b border-zinc-200 dark:border-[#303440]">
                <tr>
                  {['#', 'Ingrediente', 'Cantidad', 'Unidad'].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-medium text-zinc-500 dark:text-[#8D96A5] uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-[#303440]/50">
                {ingredientesConsolidados.map((ing, i) => (
                  <tr key={ing.nombre} className="hover:bg-zinc-50/50 dark:hover:bg-[#242730]/30 transition-colors">
                    <td className="px-6 py-3 text-xs text-zinc-400">{i + 1}</td>
                    <td className="px-6 py-3 font-medium">{ing.nombre}</td>
                    <td className="px-6 py-3">{ing.cantidad}</td>
                    <td className="px-6 py-3 text-zinc-500 dark:text-[#8D96A5]">{ing.unidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
