import { Bell, X } from 'lucide-react'

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
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
        <Bell size={28} className="text-zinc-300 dark:text-[#303440]" />
        <p className="text-sm font-medium text-zinc-500 dark:text-[#8D96A5]">Sin notificaciones</p>
        <p className="text-xs text-zinc-400 dark:text-[#8D96A5]/60">Aquí aparecerán tus alertas cuando estén disponibles.</p>
      </div>
    </div>
  )
}
