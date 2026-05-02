import { useMemo } from 'react'
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

function fmt(n) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(n ?? 0)
}

function DashboardSkeleton({ isDark }) {
  const base  = isDark ? '#2a2d35' : '#e4e4e7'
  const high  = isDark ? '#383c47' : '#f4f4f5'
  return (
    <SkeletonTheme baseColor={base} highlightColor={high}>
      {/* KPI skeleton */}
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

      {/* Table skeleton */}
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

      {/* Ingredientes skeleton */}
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
  const { pedidos, productos, clientes } = useStore()
  const loading = useLoading()
  const { baseColor, highlightColor } = skeletonTheme()

  const { esperados, cobrados, pendiente } = useMemo(() => {
    const activos = pedidos.filter(p => p.estado_pedido !== 'Cancelado')
    const esperados = activos.reduce((sum, p) => sum + (p.monto_total || 0), 0)
    const cobrados  = activos.reduce((sum, p) => sum + (p.anticipo_pagado || 0), 0)
    return { esperados, cobrados, pendiente: esperados - cobrados }
  }, [pedidos])

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

  const kpis = [
    { label: 'Ingresos Esperados', value: fmt(esperados), icon: <TrendingUp size={20} />, color: 'text-[#E37A33] bg-[#E37A33]/10' },
    { label: 'Ingresos Cobrados',  value: fmt(cobrados),  icon: <CheckCircle2 size={20} />, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Saldo Pendiente',    value: fmt(pendiente), icon: <Clock size={20} />,        color: 'text-red-400 bg-red-400/10' },
    { label: 'Total Pedidos',      value: pedidos.length, icon: <Package size={20} />,      color: 'text-blue-400 bg-blue-400/10' },
  ]

  if (loading) return (
    <div className="space-y-6">
      <DashboardSkeleton isDark={document.documentElement.classList.contains('dark')} />
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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

      {/* Recent orders table */}
      <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-[#303440]">
          <h2 className="font-semibold">Pedidos recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-[#242730] border-b border-zinc-200 dark:border-[#303440]">
              <tr>
                {['#', 'Entrega', 'Total', 'Anticipo', 'Estado Pago', 'Estado Pedido'].map(h => (
                  <th key={h} className="px-6 py-3 text-xs font-medium text-zinc-500 dark:text-[#8D96A5] uppercase tracking-wide text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-[#303440]/50">
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 dark:text-[#8D96A5]">
                    <Package size={32} className="mx-auto opacity-40 mb-2" />
                    <p className="font-medium">No hay pedidos registrados aún.</p>
                  </td>
                </tr>
              ) : pedidos.slice().reverse().slice(0, 10).map(p => (
                <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-[#242730]/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500">#{String(p.id).padStart(4, '0')}</td>
                  <td className="px-6 py-4">{p.fecha_entrega || '—'}</td>
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
        <div className="p-6">
          {ingredientesConsolidados.length === 0 ? (
            <p className="text-center text-zinc-500 dark:text-[#8D96A5] py-6 text-sm">No hay pedidos activos con ingredientes registrados.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {ingredientesConsolidados.map(ing => (
                <div key={ing.nombre} className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-[#242730] text-sm">
                  <span className="font-medium">{ing.nombre}</span>
                  <span className="text-zinc-500 dark:text-[#8D96A5] ml-1">{ing.cantidad} {ing.unidad}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
