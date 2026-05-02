import { useState, useMemo } from 'react'
import { useStore } from '../../store.js'
import { Search, Edit2, Trash2, ArrowLeft, Plus, Users } from 'lucide-react'

const PAGE_SIZE = 8

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
            <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-[#303440] rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-[#242730] transition-colors">
              Cancelar
            </button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

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
      if (onSaveSuccess) onSaveSuccess(existing.id)
      else onClose()
    } else {
      const id = addCliente(form)
      if (onSaveSuccess) onSaveSuccess(id)
      else onClose()
    }
  }

  const inputCls = "w-full bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#E37A33] focus:ring-1 focus:ring-[#E37A33] transition-all dark:text-white"

  return (
    <div>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Nombre *</label>
            <input required value={form.nombre} onChange={e => setField('nombre', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Apellido *</label>
            <input required value={form.apellido} onChange={e => setField('apellido', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Teléfono *</label>
            <input required value={form.telefono} onChange={e => setField('telefono', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium block mb-1.5">Dirección</label>
            <input value={form.direccion} onChange={e => setField('direccion', e.target.value)} className={inputCls} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 border border-zinc-200 dark:border-[#303440] rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-[#242730] transition-colors">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2.5 bg-[#E37A33] hover:bg-[#CC6824] text-white rounded-lg text-sm font-medium transition-colors">
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ModuleC() {
  const { clientes, deleteCliente } = useStore()
  const [view, setView] = useState('list')
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return clientes.filter(c =>
      c.nombre?.toLowerCase().includes(q) ||
      c.apellido?.toLowerCase().includes(q) ||
      c.telefono?.toLowerCase().includes(q)
    )
  }, [clientes, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (view === 'form') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm text-zinc-500 dark:text-[#8D96A5] hover:text-zinc-800 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} /> Volver a clientes
        </button>
        <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-6">{editId ? 'Editar cliente' : 'Crear cliente'}</h2>
          <ClienteForm clienteId={editId} onClose={() => setView('list')} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {deleteId != null && (
        <ConfirmModal
          onCancel={() => setDeleteId(null)}
          onConfirm={() => { deleteCliente(deleteId); setDeleteId(null) }}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Clientes</h1>
          <p className="text-sm text-zinc-500 dark:text-[#8D96A5]">Directorio y gestión de contactos</p>
        </div>
        <button onClick={() => { setEditId(null); setView('form') }} className="flex items-center gap-2 px-4 py-2.5 bg-[#E37A33] hover:bg-[#CC6824] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Crear Cliente
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar por nombre, apellido o teléfono..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-lg outline-none focus:border-[#E37A33] focus:ring-1 focus:ring-[#E37A33] transition-all dark:text-white"
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
                  <td className="px-6 py-4 text-zinc-500 dark:text-[#8D96A5] max-w-[200px] truncate">{c.direccion || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditId(c.id); setView('form') }} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730] transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white">
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
