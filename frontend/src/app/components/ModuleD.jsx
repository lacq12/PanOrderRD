import { useState, useMemo } from 'react'
import { useStore } from '../../store.js'
import {
  Search, Eye, Edit2, Trash2, ArrowLeft, Plus, ShoppingCart,
  Package, Check, AlertCircle, ChevronRight, Phone, Mail, Briefcase
} from 'lucide-react'
import { ClienteForm } from './ModuleC.jsx'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useLoading, skeletonTheme } from '../../hooks/useLoading.js'

function PedidosSkeleton() {
  const { baseColor, highlightColor } = skeletonTheme()
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div><Skeleton width={100} height={22} borderRadius={8} /><Skeleton width={240} height={14} borderRadius={6} className="mt-1" /></div>
          <Skeleton width={130} height={38} borderRadius={12} />
        </div>
        <Skeleton height={40} borderRadius={12} />
        <div className="border border-zinc-200 dark:border-[#303440] rounded-2xl overflow-hidden">
          <div className="px-6 py-3 bg-zinc-50 dark:bg-[#242730] flex gap-4">
            {[60, 90, 80, 70, 70, 100, 60, 70].map((w, i) => <Skeleton key={i} width={w} height={12} borderRadius={4} />)}
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-[#303440]/50">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex gap-4 items-center">
                <Skeleton width={50} height={14} borderRadius={6} />
                <Skeleton width={110} height={14} borderRadius={6} />
                <Skeleton width={90} height={14} borderRadius={6} />
                <Skeleton width={80} height={14} borderRadius={6} />
                <Skeleton width={80} height={14} borderRadius={6} />
                <Skeleton width={80} height={22} borderRadius={20} />
                <Skeleton width={70} height={14} borderRadius={6} />
                <Skeleton width={60} height={28} borderRadius={8} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonTheme>
  )
}

const PAGE_SIZE = 8

function fmt(n) {
  return `$${Number(n || 0).toFixed(2)}`
}

function initials(c) {
  if (!c) return '?'
  return `${c.nombre?.[0] || ''}${c.apellido?.[0] || ''}`.toUpperCase()
}

const pedidoBadge = {
  Confirmado: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  Pendiente:  'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  Cancelado:  'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  Entregado:  'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
}
const pagoBadge = {
  Completado: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  Parcial:    'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  Pendiente:  'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
}

// --- Confirm Modal ---
function ConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-500">
            <Trash2 size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">¿Eliminar pedido?</h3>
            <p className="text-sm text-zinc-500 dark:text-[#8D96A5] mt-1">Esta acción no se puede deshacer.</p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-[#303440] rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-[#242730] transition-colors">Cancelar</button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Stepper ---
const STEPS = ['Cliente', 'Carrito', 'Fecha', 'Pago', 'Confirmar']

function Stepper({ step }) {
  return (
    <div className="relative flex items-center justify-between px-4 py-6">
      <div className="absolute left-8 right-8 top-[2.35rem] h-0.5 bg-zinc-200 dark:bg-[#303440]">
        <div
          className="h-full bg-[#E37A33] transition-all duration-500"
          style={{ width: `${((step - 1) / 4) * 100}%` }}
        />
      </div>
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < step
        const active = n === step
        return (
          <div key={label} className="relative flex flex-col items-center gap-2 z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              active ? 'bg-[#E37A33] text-white shadow-md' :
              done   ? 'bg-[#E37A33] text-white' :
              'border-2 border-zinc-300 dark:border-[#303440] bg-white dark:bg-[#1A1D24] text-zinc-400'
            }`}>
              {done ? <Check size={16} strokeWidth={2.5} /> : n}
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wide hidden sm:block ${
              active ? 'text-[#E37A33]' : 'text-zinc-400 dark:text-[#8D96A5]'
            }`}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

// --- Detail View ---
function PedidoDetalle({ pedido, onClose }) {
  const { clientes, productos } = useStore()
  const cliente = clientes.find(c => c.id === pedido.cliente_id)
  const total = pedido.monto_total || 0
  const anticipo = pedido.anticipo_pagado || 0
  const pendiente = total - anticipo
  const pagoPct = total > 0 ? Math.min(100, Math.round((anticipo / total) * 100)) : 0

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <button onClick={onClose} className="flex items-center gap-2 text-sm text-zinc-500 dark:text-[#8D96A5] hover:text-zinc-800 dark:hover:text-white transition-colors">
        <ArrowLeft size={16} /> Volver a pedidos
      </button>
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">Detalle Pedido #{String(pedido.id).padStart(4, '0')}</h1>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pedidoBadge[pedido.estado_pedido] || ''}`}>
          Ped. {pedido.estado_pedido}
        </span>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pagoBadge[pedido.estado_pago] || ''}`}>
          Pago {pedido.estado_pago}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-[#303440] flex items-center justify-between">
              <h2 className="font-semibold">Artículos del pedido</h2>
              <span className="text-sm text-zinc-500 dark:text-[#8D96A5]">Entrega: {pedido.fecha_entrega || '—'}</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-[#242730] border-b border-zinc-200 dark:border-[#303440]">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-zinc-500 dark:text-[#8D96A5] uppercase tracking-wide text-left">Producto</th>
                  <th className="px-6 py-3 text-xs font-medium text-zinc-500 dark:text-[#8D96A5] uppercase tracking-wide text-center">Cantidad</th>
                  <th className="px-6 py-3 text-xs font-medium text-zinc-500 dark:text-[#8D96A5] uppercase tracking-wide text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-[#303440]/50">
                {(pedido.items || []).map((item, i) => {
                  const prod = productos.find(p => p.id === item.producto_id)
                  return (
                    <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-[#242730]/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-zinc-400 shrink-0" />
                          <span className="font-medium">{prod?.nombre || 'Producto eliminado'}</span>
                        </div>
                        <div className="text-xs text-zinc-400 ml-5">{fmt(item.precio_unitario)} c/u</div>
                      </td>
                      <td className="px-6 py-4 text-center">{item.cantidad}</td>
                      <td className="px-6 py-4 text-right font-medium">{fmt(item.precio_unitario * item.cantidad)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-[#303440] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-[#8D96A5] uppercase mb-1">Notas</p>
                <p className="text-sm">{pedido.notas || 'Sin notas.'}</p>
              </div>
              <div className="text-right space-y-1">
                <div className="flex justify-between text-sm"><span className="text-zinc-500 dark:text-[#8D96A5]">Subtotal</span><span>{fmt(total)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-zinc-500 dark:text-[#8D96A5]">Descuentos</span><span>$0.00</span></div>
                <div className="flex justify-between text-sm text-emerald-500 font-medium"><span>Anticipo Abonado</span><span>−{fmt(anticipo)}</span></div>
                <div className="flex justify-between text-lg font-bold text-[#E37A33]"><span>Total Pendiente</span><span>{fmt(pendiente)}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold">Cliente</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-[#E37A33]/15 text-[#E37A33] flex items-center justify-center font-bold text-sm shrink-0">
                {initials(cliente)}
              </div>
              <div>
                <p className="font-medium">{cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente no encontrado'}</p>
                <p className="text-xs text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Cliente Activo
                </p>
              </div>
            </div>
            {cliente && (
              <>
                <div className="text-sm space-y-1">
                  <p className="text-zinc-500 dark:text-[#8D96A5]">{cliente.telefono}</p>
                  {cliente.email && <p className="text-zinc-500 dark:text-[#8D96A5]">{cliente.email}</p>}
                </div>
                {cliente.direccion && (
                  <div className="bg-zinc-50 dark:bg-[#242730]/50 rounded-lg p-3 text-sm text-zinc-600 dark:text-[#8D96A5]">
                    {cliente.direccion}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Pago</h3>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pagoBadge[pedido.estado_pago] || ''}`}>{pedido.estado_pago}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-500 dark:text-[#8D96A5]">
                <span>Progreso</span><span>{pagoPct}%</span>
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-[#242730] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${pedido.estado_pago === 'Completado' ? 'bg-emerald-500' : 'bg-amber-400'}`}
                  style={{ width: `${pagoPct}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 text-center">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Abonado</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">{fmt(anticipo)}</p>
              </div>
              <div className="bg-orange-50 dark:bg-[#E37A33]/10 rounded-xl p-3 text-center">
                <p className="text-xs text-[#E37A33] font-medium mb-1">Restante</p>
                <p className="font-bold text-[#E37A33]">{fmt(pendiente)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Multi-step form ---
function PedidoForm({ pedidoId, onClose }) {
  const { clientes, productos, empleados, addPedido, updatePedido, pedidos } = useStore()
  const existing = pedidoId != null ? pedidos.find(p => p.id === pedidoId) : null

  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [clienteId, setClienteId] = useState(existing?.cliente_id || null)
  const [empleadoId, setEmpleadoId] = useState(existing?.empleado_id || '')
  const [carrito, setCarrito] = useState(
    existing?.items?.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad, precio_unitario: i.precio_unitario })) || []
  )
  const [fechaEntrega, setFechaEntrega] = useState(existing?.fecha_entrega || '')
  const [notas, setNotas] = useState(existing?.notas || '')
  const [anticipo, setAnticipo] = useState(existing?.anticipo_pagado ?? 0)
  const [clienteSearch, setClienteSearch] = useState('')
  const [prodSearch, setProdSearch] = useState('')
  const [showNewCliente, setShowNewCliente] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const montoTotal = carrito.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0)
  const estadoPago = anticipo <= 0 ? 'Pendiente' : anticipo >= montoTotal ? 'Completado' : 'Parcial'

  const clienteFiltrado = useMemo(() => {
    const q = clienteSearch.toLowerCase()
    return clientes.filter(c =>
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(q) ||
      c.telefono?.toLowerCase().includes(q)
    )
  }, [clientes, clienteSearch])

  const prodFiltrado = useMemo(() => {
    const q = prodSearch.toLowerCase()
    return productos.filter(p => p.nombre?.toLowerCase().includes(q) || p.categoria?.toLowerCase().includes(q))
  }, [productos, prodSearch])

  const addToCart = (prod) => {
    setCarrito(prev => {
      const exists = prev.find(i => i.producto_id === prod.id)
      if (exists) return prev.map(i => i.producto_id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { producto_id: prod.id, cantidad: 1, precio_unitario: prod.precio }]
    })
  }

  const changeQty = (prodId, delta) => {
    setCarrito(prev =>
      prev.map(i => i.producto_id === prodId ? { ...i, cantidad: i.cantidad + delta } : i)
         .filter(i => i.cantidad > 0)
    )
  }

  const cartQty = (prodId) => carrito.find(i => i.producto_id === prodId)?.cantidad || 0

  const goNext = () => {
    setError('')
    if (step === 1) {
      if (!clienteId) return setError('Debes seleccionar o crear un cliente para continuar.')
      if (!empleadoId) return setError('Debes seleccionar un empleado para continuar.')
    }
    if (step === 2 && carrito.length === 0) return setError('Debes agregar al menos un producto al carrito.')
    if (step === 3) {
      if (!fechaEntrega) return setError('La fecha de entrega es requerida.')
      if (fechaEntrega <= today) return setError('La fecha de entrega debe ser posterior a la fecha actual.')
    }
    if (step === 4) {
      if (anticipo < 0) return setError('El anticipo no puede ser negativo.')
      if (anticipo > montoTotal) return setError('El anticipo no puede ser mayor al monto total.')
    }
    setStep(s => s + 1)
  }

  const goBack = () => { setError(''); setStep(s => s - 1) }

  const handleSave = () => {
    const payload = {
      cliente_id: clienteId,
      empleado_id: parseInt(empleadoId),
      fecha_registro: today,
      fecha_entrega: fechaEntrega,
      notas,
      items: carrito,
      monto_total: montoTotal,
      anticipo_pagado: parseFloat(anticipo) || 0,
      estado_pago: estadoPago,
      estado_pedido: existing?.estado_pedido || 'Pendiente',
    }
    if (existing) updatePedido(existing.id, payload)
    else addPedido(payload)
    onClose()
  }

  const inputCls = "w-full bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-[#E37A33] focus:ring-1 focus:ring-[#E37A33] transition-all dark:text-white"
  const clienteSel = clientes.find(c => c.id === clienteId)

  const stepMeta = [
    { title: 'Datos Generales',    sub: 'Busca el cliente, registra uno nuevo, y asigna empleado' },
    { title: 'Carrito de Compras', sub: 'Agrega los productos al pedido' },
    { title: 'Fecha de Entrega',   sub: 'Define cuándo se entregará el pedido' },
    { title: 'Registro de Cobro',  sub: 'Configura el anticipo y método de pago' },
    { title: 'Confirmación',       sub: 'Revisa y guarda el pedido' },
  ]

  return (
    <div className="animate-in fade-in duration-300 flex flex-col h-full -m-4 sm:-m-6">

      {/* Page header */}
      <div className="px-6 pt-6 pb-0 shrink-0">
        <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors mb-1">
          <ArrowLeft size={15} />
        </button>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {existing ? `Editar Pedido #${String(existing.id).padStart(4, '0')}` : 'Nuevo Pedido'}
        </h1>
        <p className="text-sm text-zinc-400 dark:text-[#8D96A5]">Configuración paso a paso</p>
      </div>

      {/* Stepper — outside card */}
      <div className="px-4 shrink-0">
        <Stepper step={step} />
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col min-h-0 mx-4 mb-4 bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl overflow-hidden">

        {/* Step header row */}
        <div className="flex items-start justify-between px-6 py-5 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E37A33] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {step}
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 dark:text-white">{stepMeta[step - 1].title}</h2>
              <p className="text-sm text-zinc-400 dark:text-[#8D96A5] mt-0.5">{stepMeta[step - 1].sub}</p>
            </div>
          </div>
          {step === 1 && !showNewCliente && (
            <button
              onClick={() => setShowNewCliente(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#E37A33] hover:bg-[#CC6824] text-white text-sm font-medium rounded-xl transition-colors shrink-0"
            >
              <Plus size={15} /> Nuevo Cliente
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-2 flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm shrink-0">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}

        {/* Scrollable step content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">

          {/* Step 1 — Cliente + Empleado */}
          {step === 1 && (
            <div className="space-y-5">
              {showNewCliente ? (
                <div className="border border-zinc-200 dark:border-[#303440] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-sm">Crear nuevo cliente</p>
                    <button onClick={() => setShowNewCliente(false)} className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors">Cancelar</button>
                  </div>
                  <ClienteForm
                    clienteId={null}
                    onClose={() => setShowNewCliente(false)}
                    onSaveSuccess={(id) => { setClienteId(id); setShowNewCliente(false) }}
                  />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={clienteSearch}
                      onChange={e => setClienteSearch(e.target.value)}
                      placeholder="Buscar cliente por nombre, teléfono..."
                      className="w-full pl-11 pr-4 py-3 text-sm bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl outline-none focus:border-[#E37A33] focus:ring-1 focus:ring-[#E37A33] transition-all dark:text-white placeholder:text-zinc-400"
                    />
                  </div>
                  <div className="space-y-2">
                    {clienteFiltrado.length === 0 ? (
                      <p className="text-sm text-zinc-400 py-6 text-center">No hay clientes que coincidan.</p>
                    ) : clienteFiltrado.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setClienteId(c.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                          c.id === clienteId
                            ? 'border-[#E37A33] bg-orange-50 dark:bg-[#E37A33]/10'
                            : 'border-zinc-200 dark:border-[#303440] hover:bg-zinc-50 dark:hover:bg-[#242730]'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-[#242730] text-zinc-600 dark:text-zinc-300 flex items-center justify-center text-sm font-bold shrink-0">
                          {initials(c)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 dark:text-white truncate">{c.nombre} {c.apellido}</p>
                          <div className="flex items-center gap-4 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-zinc-400"><Phone size={11} />{c.telefono}</span>
                            {c.email && <span className="flex items-center gap-1 text-xs text-zinc-400"><Mail size={11} />{c.email}</span>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase size={14} className="text-[#E37A33]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8D96A5]">Empleado Asignado</span>
                </div>
                <select
                  value={empleadoId}
                  onChange={e => setEmpleadoId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Sin empleados registrados</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2 — Carrito */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-right">
                <span className="text-sm text-zinc-500 dark:text-[#8D96A5]">Total: </span>
                <span className="font-bold text-[#E37A33]">{fmt(montoTotal)}</span>
              </div>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 space-y-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      value={prodSearch}
                      onChange={e => setProdSearch(e.target.value)}
                      placeholder="Buscar producto..."
                      className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl outline-none focus:border-[#E37A33] focus:ring-1 focus:ring-[#E37A33] transition-all dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                    {prodFiltrado.length === 0 ? (
                      <p className="text-sm text-zinc-400 py-6 col-span-3 text-center">No hay productos.</p>
                    ) : prodFiltrado.map(p => {
                      const qty = cartQty(p.id)
                      return (
                        <button
                          key={p.id}
                          onClick={() => addToCart(p)}
                          className="relative border border-zinc-200 dark:border-[#303440] rounded-xl p-3 text-left hover:border-[#E37A33]/50 hover:bg-orange-50/30 dark:hover:bg-[#E37A33]/5 transition-all"
                        >
                          {qty > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#E37A33] text-white text-xs flex items-center justify-center font-bold">{qty}</span>
                          )}
                          <p className="text-sm font-medium truncate">{p.nombre}</p>
                          <p className="text-xs text-zinc-400 mb-2">{p.categoria}</p>
                          <p className="text-sm font-bold text-[#E37A33]">{fmt(p.precio)}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="lg:w-72 border border-zinc-200 dark:border-[#303440] rounded-2xl flex flex-col">
                  <div className="px-4 py-3 border-b border-zinc-200 dark:border-[#303440] flex items-center gap-2">
                    <ShoppingCart size={16} className="text-[#E37A33]" />
                    <span className="font-semibold text-sm">Carrito ({carrito.length})</span>
                  </div>
                  <div className="flex-1 divide-y divide-zinc-100 dark:divide-[#303440]/50 overflow-y-auto max-h-60">
                    {carrito.length === 0 ? (
                      <p className="text-sm text-zinc-400 text-center py-8">Sin productos</p>
                    ) : carrito.map(item => {
                      const prod = productos.find(p => p.id === item.producto_id)
                      return (
                        <div key={item.producto_id} className="px-4 py-3 flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{prod?.nombre}</p>
                            <p className="text-xs text-zinc-400">{fmt(item.precio_unitario)} × {item.cantidad} = {fmt(item.precio_unitario * item.cantidad)}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => changeQty(item.producto_id, -1)} className="w-6 h-6 rounded-full border border-zinc-200 dark:border-[#303440] flex items-center justify-center text-xs hover:bg-zinc-100 dark:hover:bg-[#242730]">−</button>
                            <span className="w-5 text-center text-sm">{item.cantidad}</span>
                            <button onClick={() => changeQty(item.producto_id, 1)} className="w-6 h-6 rounded-full bg-[#E37A33] text-white flex items-center justify-center text-xs hover:bg-[#CC6824]">+</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="px-4 py-3 border-t border-zinc-200 dark:border-[#303440] bg-linear-to-r from-[#E37A33]/10 to-[#F59E52]/10 rounded-b-2xl flex justify-between items-center">
                    <span className="text-sm font-medium">Total</span>
                    <span className="font-bold text-[#E37A33]">{fmt(montoTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Fecha */}
          {step === 3 && (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="text-sm font-medium block mb-1.5">Fecha de entrega *</label>
                <input
                  type="date"
                  min={today}
                  value={fechaEntrega}
                  onChange={e => setFechaEntrega(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Notas adicionales</label>
                <textarea
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  rows={3}
                  placeholder="Instrucciones especiales..."
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div className="bg-orange-50 dark:bg-[#E37A33]/10 border border-orange-200 dark:border-[#E37A33]/20 rounded-xl p-4 text-sm text-[#E37A33]">
                La fecha de entrega debe ser posterior al día de hoy para asegurar el tiempo de preparación.
              </div>
            </div>
          )}

          {/* Step 4 — Pago */}
          {step === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-xs text-zinc-500 dark:text-[#8D96A5] mb-1">Monto Total</p>
                  <p className="text-4xl font-bold text-[#E37A33]">{fmt(montoTotal)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Anticipo</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                    <input
                      type="number" min="0" step="0.01"
                      value={anticipo}
                      onChange={e => setAnticipo(parseFloat(e.target.value) || 0)}
                      className={`${inputCls} pl-8`}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAnticipo(0)} className="flex-1 py-2 text-sm border border-zinc-200 dark:border-[#303440] rounded-xl hover:bg-zinc-50 dark:hover:bg-[#242730] transition-colors">No Pago</button>
                  <button onClick={() => setAnticipo(montoTotal / 2)} className="flex-1 py-2 text-sm border border-zinc-200 dark:border-[#303440] rounded-xl hover:bg-zinc-50 dark:hover:bg-[#242730] transition-colors">50%</button>
                  <button onClick={() => setAnticipo(montoTotal)} className="flex-1 py-2 text-sm bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl hover:bg-emerald-100 transition-colors">Total</button>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-zinc-200 dark:border-[#303440]">
                  <span className="text-zinc-500 dark:text-[#8D96A5]">Saldo Pendiente</span>
                  <span className="font-semibold">{fmt(Math.max(0, montoTotal - anticipo))}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Detalles del Pedido</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Cliente', value: clienteSel ? `${clienteSel.nombre} ${clienteSel.apellido}` : '—' },
                    { label: 'Fecha programada', value: fechaEntrega || '—' },
                    { label: 'Unidades totales', value: carrito.reduce((s, i) => s + i.cantidad, 0) },
                    { label: 'Productos distintos', value: carrito.length },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2 border-b border-zinc-100 dark:border-[#303440]/50">
                      <span className="text-zinc-500 dark:text-[#8D96A5]">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2">
                    <span className="text-zinc-500 dark:text-[#8D96A5]">Estado Previsto</span>
                    <div className="flex gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pedidoBadge['Pendiente']}`}>Ped. Pendiente</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pagoBadge[estadoPago]}`}>Pago {estadoPago}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5 — Confirmación */}
          {step === 5 && (
            <div className="flex flex-col items-center text-center gap-6 py-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" />
                <div className="relative w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check size={36} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold">¡Todo listo para guardar!</h3>
                <p className="text-sm text-zinc-500 dark:text-[#8D96A5] mt-1">Revisa el resumen antes de confirmar</p>
              </div>
              <div className="flex divide-x divide-zinc-200 dark:divide-[#303440] border border-zinc-200 dark:border-[#303440] rounded-2xl overflow-hidden w-full max-w-sm">
                {[
                  { label: 'Total', value: fmt(montoTotal) },
                  { label: 'Anticipo', value: fmt(anticipo) },
                  { label: 'Saldo', value: fmt(Math.max(0, montoTotal - anticipo)) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex-1 py-4 px-3 text-center">
                    <p className="text-xs text-zinc-500 dark:text-[#8D96A5] mb-1">{label}</p>
                    <p className="font-bold text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>{/* end scrollable */}

        {/* Footer nav */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-zinc-200 dark:border-[#303440] shrink-0">
          <button
            onClick={step === 1 ? onClose : goBack}
            className="flex items-center gap-2 px-5 py-2.5 border border-zinc-200 dark:border-[#303440] rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-[#242730] transition-colors"
          >
            <ArrowLeft size={15} />
            {step === 1 ? 'Cancelar' : 'Atrás'}
          </button>
          {step < 5 ? (
            <button onClick={goNext} className="flex items-center gap-2 px-6 py-2.5 bg-[#E37A33] hover:bg-[#CC6824] text-white rounded-xl text-sm font-medium transition-colors">
              Siguiente <ChevronRight size={15} />
            </button>
          ) : (
            <button onClick={handleSave} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors">
              Guardar y Finalizar
            </button>
          )}
        </div>

      </div>{/* end card */}
    </div>
  )
}

// --- Main Module ---
export default function ModuleD() {
  const { pedidos, clientes, empleados, deletePedido } = useStore()
  const [view, setView] = useState('list')
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [detailId, setDetailId] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const loading = useLoading()

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return pedidos.filter(p => {
      const c = clientes.find(cl => cl.id === p.cliente_id)
      const nombre = c ? `${c.nombre} ${c.apellido}`.toLowerCase() : ''
      return String(p.id).padStart(4, '0').includes(q) || nombre.includes(q) || p.estado_pedido?.toLowerCase().includes(q)
    })
  }, [pedidos, clientes, search])

  if (loading && view === 'list') return <PedidosSkeleton />

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (view === 'form') return <PedidoForm pedidoId={editId} onClose={() => { setView('list'); setEditId(null) }} />
  if (view === 'detail') {
    const pedido = pedidos.find(p => p.id === detailId)
    if (!pedido) { setView('list'); return null }
    return <PedidoDetalle pedido={pedido} onClose={() => setView('list')} />
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {deleteId != null && (
        <ConfirmModal
          onCancel={() => setDeleteId(null)}
          onConfirm={() => { deletePedido(deleteId); setDeleteId(null) }}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Pedidos</h1>
          <p className="text-sm text-zinc-500 dark:text-[#8D96A5]">Registro y seguimiento de órdenes</p>
        </div>
        <button
          onClick={() => { setEditId(null); setView('form') }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E37A33] hover:bg-[#CC6824] text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nuevo Pedido
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar por ID, cliente o estado..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-xl outline-none focus:border-[#E37A33] focus:ring-1 focus:ring-[#E37A33] transition-all dark:text-white"
        />
      </div>

      <div className="border border-zinc-200 dark:border-[#303440] rounded-2xl bg-white dark:bg-[#1A1D24] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-[#242730] border-b border-zinc-200 dark:border-[#303440]">
              <tr>
                {['ID', 'Cliente', 'Empleado', 'Registro', 'Entrega', 'Estado', 'Monto', 'Acciones'].map(h => (
                  <th key={h} className="px-6 py-3 text-xs font-medium text-zinc-500 dark:text-[#8D96A5] uppercase tracking-wide text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-[#303440]/50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 dark:text-[#8D96A5]">
                    <ShoppingCart size={32} className="mx-auto opacity-40 mb-2" />
                    <p className="font-medium">No hay pedidos encontrados.</p>
                  </td>
                </tr>
              ) : paged.map(p => {
                const cliente = clientes.find(c => c.id === p.cliente_id)
                const empleado = empleados.find(e => e.id === p.empleado_id)
                return (
                  <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-[#242730]/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">#{String(p.id).padStart(4, '0')}</td>
                    <td className="px-6 py-4 font-medium">{cliente ? `${cliente.nombre} ${cliente.apellido}` : '—'}</td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-[#8D96A5]">{empleado?.nombre || '—'}</td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-[#8D96A5]">{p.fecha_registro || '—'}</td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-[#8D96A5]">{p.fecha_entrega || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pedidoBadge[p.estado_pedido] || ''}`}>Ped. {p.estado_pedido}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pagoBadge[p.estado_pago] || ''}`}>Pago {p.estado_pago}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{fmt(p.monto_total)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setDetailId(p.id); setView('detail') }}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730] transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => { setEditId(p.id); setView('form') }}
                          disabled={p.estado_pedido === 'Entregado' || p.estado_pedido === 'Cancelado'}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730] transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-zinc-500 hover:text-red-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-[#303440]">
            <span className="text-xs text-zinc-500 dark:text-[#8D96A5]">
              Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-[#303440] disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-[#242730] transition-colors">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${n === page ? 'bg-[#E37A33] text-white border-[#E37A33]' : 'border-zinc-200 dark:border-[#303440] hover:bg-zinc-50 dark:hover:bg-[#242730]'}`}>{n}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-[#303440] disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-[#242730] transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
