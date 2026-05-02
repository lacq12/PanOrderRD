import { Package, CheckCircle2, Clock, X } from 'lucide-react'

const NOTIFICACIONES = [
  { id: 1, titulo: 'Nuevo pedido recibido',      desc: 'Un cliente realizó un nuevo pedido',  tiempo: 'Hace 5 min',  icon: 'package', color: 'text-[#E37A33] bg-[#E37A33]/10' },
  { id: 2, titulo: 'Pago recibido',              desc: 'Se registró un anticipo',             tiempo: 'Hace 30 min', icon: 'check',   color: 'text-emerald-500 bg-emerald-500/10' },
  { id: 3, titulo: 'Pedido listo para entregar', desc: 'Un pedido está listo',                tiempo: 'Hace 1 hora', icon: 'clock',   color: 'text-blue-400 bg-blue-400/10' },
]

const iconMap = {
  package: <Package size={16} />,
  check:   <CheckCircle2 size={16} />,
  clock:   <Clock size={16} />,
}

export default function NotificationsPanel({ isOpen, onClose }) {
  if (!isOpen) return null
  return (
    <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl shadow-lg z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-[#303440]">
        <span className="font-semibold text-sm">Notificaciones</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730]">
          <X size={16} />
        </button>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-[#303440]/50">
        {NOTIFICACIONES.map(n => (
          <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-[#242730]/30 transition-colors">
            <span className={`p-2 rounded-xl shrink-0 ${n.color}`}>{iconMap[n.icon]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{n.titulo}</p>
              <p className="text-xs text-zinc-500 dark:text-[#8D96A5]">{n.desc}</p>
              <p className="text-xs text-zinc-400 dark:text-[#8D96A5]/60 mt-0.5">{n.tiempo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
