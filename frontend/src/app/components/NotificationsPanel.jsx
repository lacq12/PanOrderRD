import { useMemo } from 'react'
import { Bell, X, AlertTriangle, Clock, Package } from 'lucide-react'
import { useStore } from '../../store.js'

function getNotifications(pedidos, productos) {
  const now = new Date()
  const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
  const notifs = []

  pedidos
    .filter(p => p.estado_pedido !== 'Cancelado' && p.estado_pedido !== 'Entregado')
    .forEach(p => {
      if (p.estado_pago === 'Pendiente') {
        notifs.push({
          id: `pago-${p.id}`,
          icon: <AlertTriangle size={15} />,
          color: 'text-red-500 bg-red-500/10',
          text: `Pedido #${String(p.id).padStart(4, '0')} sin pago registrado`,
        })
      }

      if (p.fecha_entrega) {
        const entrega = new Date(p.fecha_entrega)
        if (entrega >= now && entrega <= in2Days) {
          notifs.push({
            id: `entrega-${p.id}`,
            icon: <Clock size={15} />,
            color: 'text-orange-500 bg-orange-500/10',
            text: `Pedido #${String(p.id).padStart(4, '0')} entrega en menos de 2 días`,
          })
        }
      }
    })

  productos
    .filter(p => p.disponible && Number(p.stock_actual) === 0)
    .forEach(p => {
      notifs.push({
        id: `stock-${p.id}`,
        icon: <Package size={15} />,
        color: 'text-zinc-500 bg-zinc-500/10',
        text: `"${p.nombre}" sin stock disponible`,
      })
    })

  return notifs
}

export default function NotificationsPanel({ isOpen, onClose }) {
  const { pedidos, productos } = useStore()
  const notifs = useMemo(() => getNotifications(pedidos, productos), [pedidos, productos])

  if (!isOpen) return null

  return (
    <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl shadow-lg z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-[#303440]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Notificaciones</span>
          {notifs.length > 0 && (
            <span className="text-xs bg-[#E37A33] text-white rounded-full px-1.5 py-0.5 font-medium leading-none">
              {notifs.length}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730]">
          <X size={16} />
        </button>
      </div>

      {notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
          <Bell size={28} className="text-zinc-300 dark:text-[#303440]" />
          <p className="text-sm font-medium text-zinc-500 dark:text-[#8D96A5]">Sin notificaciones</p>
          <p className="text-xs text-zinc-400 dark:text-[#8D96A5]/60">Aquí aparecerán tus alertas cuando estén disponibles.</p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-[#303440]/50 max-h-72 overflow-y-auto">
          {notifs.map(n => (
            <li key={n.id} className="flex items-start gap-3 px-4 py-3">
              <span className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${n.color}`}>{n.icon}</span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-snug">{n.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
