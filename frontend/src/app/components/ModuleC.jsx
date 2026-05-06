import { useState, useMemo } from 'react'
import { useStore } from '../../store.js'
import { Search, Edit2, Trash2, Plus, Users, X } from 'lucide-react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useLoading, skeletonTheme } from '../../hooks/useLoading.js'

function TableSkeleton({ cols }) {
  const { baseColor, highlightColor } = skeletonTheme()
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div><Skeleton width={100} height={22} borderRadius={8} /><Skeleton width={220} height={14} borderRadius={6} className="mt-1" /></div>
          <Skeleton width={120} height={38} borderRadius={12} />
        </div>
        <Skeleton height={40} borderRadius={12} />
        <div className="border border-zinc-200 dark:border-[#303440] rounded-2xl overflow-hidden">
          <div className="px-6 py-3 bg-zinc-50 dark:bg-[#242730] flex gap-6">
            {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} width={80} height={12} borderRadius={4} />)}
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-[#303440]/50">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex gap-6">
                {Array.from({ length: cols }).map((_, j) => <Skeleton key={j} width={j === 0 ? 30 : 100} height={14} borderRadius={6} />)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonTheme>
  )
}

const PAGE_SIZE = 8

const inputCls = "w-full bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#E37A33] focus:ring-1 focus:ring-[#E37A33] transition-all dark:text-white placeholder:text-zinc-400"

function ConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-500">
            <Trash2 size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">¿Eliminar cliente?</h3>
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

// Exportado para uso embebido en el flujo de Pedidos (Step 1)
export function ClienteForm({ clienteId, onClose, onSaveSuccess }) {
  const { clientes, addCliente, updateCliente } = useStore()
  const existing = clienteId != null ? clientes.find(c => c.id === clienteId) : null

  const [form, setForm] = useState({
    nombre: existing?.nombre || '',
    apellido: existing?.apellido || '',
    telefono: existing?.telefono || '',
    email: existing?.email || '',
    direccion: existing?.direccion || '',
  })
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = (e) => {
    e.preventDefault()
    if (existing) {
      updateCliente(existing.id, form)
      onSaveSuccess ? onSaveSuccess(existing.id) : onClose()
    } else {
      const id = addCliente(form)
      onSaveSuccess ? onSaveSuccess(id) : onClose()
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">Nombre *</label>
          <input required value={form.nombre} onChange={e => setField('nombre', e.target.value)} placeholder="Ej: Juan" className={inputCls} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Apellido</label>
          <input value={form.apellido} onChange={e => setField('apellido', e.target.value)} placeholder="Ej: Pérez" className={inputCls} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Teléfono *</label>
          <input required value={form.telefono} onChange={e => setField('telefono', e.target.value)} placeholder="Ej: 555-1234" className={inputCls} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="Ej: juan@ejemplo.com" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium block mb-1.5">Dirección</label>
          <textarea
            value={form.direccion}
            onChange={e => setField('direccion', e.target.value)}
            placeholder="Ej: Calle Principal 123"
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-zinc-200 dark:border-[#303440]">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-[#8D96A5] hover:text-zinc-900 dark:hover:text-white transition-colors">
          Cancelar
        </button>
        <button type="submit" className="px-5 py-2.5 bg-[#E37A33] hover:bg-[#CC6824] text-white rounded-xl text-sm font-semibold transition-colors">
          Guardar Cliente
        </button>
      </div>
    </form>
  )
}

function ClienteModal({ clienteId, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-[#303440]">
          <h2 className="font-semibold text-base">{clienteId ? 'Editar cliente' : 'Nuevo cliente'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730] transition-colors text-zinc-400 hover:text-zinc-600">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">
          <ClienteForm clienteId={clienteId} onClose={onClose} />
        </div>
      </div>
    </div>
  )
}

export default function ModuleC() {
  const { clientes, deleteCliente } = useStore()
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const loading = useLoading()

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return clientes.filter(c =>
      c.nombre?.toLowerCase().includes(q) ||
      c.apellido?.toLowerCase().includes(q) ||
      c.telefono?.toLowerCase().includes(q)
    )
  }, [clientes, search])

  if (loading) return <TableSkeleton cols={6} />

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {deleteId != null && (
        <ConfirmModal
          onCancel={() => setDeleteId(null)}
          onConfirm={() => { deleteCliente(deleteId); setDeleteId(null) }}
        />
      )}
      {modal !== null && (
        <ClienteModal
          clienteId={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Clientes</h1>
          <p className="text-sm text-zinc-500 dark:text-[#8D96A5]">Directorio y gestión de contactos</p>
        </div>
        <button onClick={() => setModal('new')} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E37A33] hover:bg-[#CC6824] text-white rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Crear Cliente
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar por nombre, apellido o teléfono..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-xl outline-none focus:border-[#E37A33] focus:ring-1 focus:ring-[#E37A33] transition-all dark:text-white"
        />
      </div>

      <div className="border border-zinc-200 dark:border-[#303440] rounded-2xl bg-white dark:bg-[#1A1D24] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-[#242730] border-b border-zinc-200 dark:border-[#303440]">
              <tr>
                {['#', 'Nombre', 'Teléfono', 'Email', 'Dirección', 'Acciones'].map(h => (
                  <th key={h} className="px-6 py-3 text-xs font-medium text-zinc-500 dark:text-[#8D96A5] uppercase tracking-wide text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-[#303440]/50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 dark:text-[#8D96A5]">
                    <Users size={32} className="mx-auto opacity-40 mb-2" />
                    <p className="font-medium">No hay clientes registrados</p>
                  </td>
                </tr>
              ) : paged.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-[#242730]/30 transition-colors">
                  <td className="px-6 py-4 text-xs text-zinc-400">{c.id}</td>
                  <td className="px-6 py-4 font-medium">{c.nombre} {c.apellido}</td>
                  <td className="px-6 py-4">{c.telefono}</td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-[#8D96A5]">{c.email || '—'}</td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-[#8D96A5] max-w-50 truncate">{c.direccion || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setModal(c.id)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730] transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-zinc-500 hover:text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-[#303440]">
            <span className="text-xs text-zinc-500 dark:text-[#8D96A5]">
              Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} a {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} resultados
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
