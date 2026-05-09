import { useState } from 'react'
import { useStore } from '../../store.js'
import { Edit2, Trash2, Plus, Key, X } from 'lucide-react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useLoading, skeletonTheme } from '../../hooks/useLoading.js'

function ConfigSkeleton() {
  const { baseColor, highlightColor } = skeletonTheme()
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <div className="space-y-6">
        <div><Skeleton width={140} height={22} borderRadius={8} /><Skeleton width={200} height={14} borderRadius={6} className="mt-1" /></div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton width={160} height={18} borderRadius={6} />
            <Skeleton width={130} height={38} borderRadius={12} />
          </div>
          <div className="border border-zinc-200 dark:border-[#303440] rounded-2xl overflow-hidden">
            <div className="px-6 py-3 bg-zinc-50 dark:bg-[#242730] flex gap-6">
              {[100, 80, 70].map((w, i) => <Skeleton key={i} width={w} height={12} borderRadius={4} />)}
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-[#303440]/50">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex gap-6 items-center">
                  <Skeleton circle width={32} height={32} />
                  <Skeleton width={160} height={14} borderRadius={6} />
                  <Skeleton width={70} height={22} borderRadius={20} />
                  <Skeleton width={60} height={28} borderRadius={8} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  )
}

const ROLES_USUARIO = ['Admin', 'Gerente', 'Vendedor']

const inputCls = "w-full bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#E37A33] focus:ring-1 focus:ring-[#E37A33] transition-all dark:text-white placeholder:text-zinc-400"

const rolBadge = {
  Admin:    'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  Gerente:  'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  Vendedor: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
}

function ConfirmModal({ title, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onKeyDown={e => e.key === 'Escape' && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-config-title"
        className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl p-6 max-w-md w-full shadow-xl"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-500" aria-hidden="true">
            <Trash2 size={24} />
          </div>
          <div>
            <h3 id="confirm-config-title" className="font-semibold text-lg">{title}</h3>
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

function BaseModal({ title, modalId, onClose, children }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onKeyDown={e => e.key === 'Escape' && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalId}
        className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl shadow-xl w-full max-w-lg"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-[#303440]">
          <h2 id={modalId} className="font-semibold text-base">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730] transition-colors text-zinc-400 hover:text-zinc-600"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}

function UsuarioModal({ usuarioId, onClose }) {
  const { usuarios, addUsuario, updateUsuario } = useStore()
  const existing = usuarioId != null ? usuarios.find(u => u.id === usuarioId) : null

  const [form, setForm] = useState({
    email: existing?.email || '',
    password: '',
    rol: existing?.rol || '',
  })
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = (e) => {
    e.preventDefault()
    const payload = { email: form.email, rol: form.rol }
    if (!existing || form.password) payload.password = form.password
    if (existing) updateUsuario(existing.id, payload)
    else addUsuario(payload)
    onClose()
  }

  return (
    <BaseModal title={existing ? 'Editar usuario' : 'Nuevo usuario'} modalId="usuario-modal-title" onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="usr-email" className="text-sm font-medium block mb-1.5">Correo Electrónico <span aria-hidden="true">*</span></label>
            <input id="usr-email" required type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="ejemplo@correo.com" className={inputCls} />
          </div>
          <div>
            <label htmlFor="usr-password" className="text-sm font-medium block mb-1.5">
              Contraseña {existing && <span className="text-zinc-400 font-normal">(Opcional)</span>}
            </label>
            <input
              id="usr-password"
              type="password"
              value={form.password}
              onChange={e => setField('password', e.target.value)}
              placeholder="Nueva contraseña"
              required={!existing}
              autoComplete={existing ? 'new-password' : 'new-password'}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label htmlFor="usr-rol" className="text-sm font-medium block mb-1.5">Rol <span aria-hidden="true">*</span></label>
          <select id="usr-rol" required value={form.rol} onChange={e => setField('rol', e.target.value)} className={inputCls}>
            <option value="">Seleccionar rol</option>
            {ROLES_USUARIO.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-200 dark:border-[#303440]">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-[#8D96A5] hover:text-zinc-900 dark:hover:text-white transition-colors">
            Cancelar
          </button>
          <button type="submit" className="px-5 py-2.5 bg-[#E37A33] hover:bg-[#CC6824] text-white rounded-xl text-sm font-semibold transition-colors">
            Guardar Usuario
          </button>
        </div>
      </form>
    </BaseModal>
  )
}

export default function ModuleConfig() {
  const { usuarios, deleteUsuario } = useStore()
  const [usuarioModal, setUsuarioModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const loading = useLoading()

  if (loading) return <ConfigSkeleton />

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteUsuario(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {deleteTarget && (
        <ConfirmModal
          title="¿Eliminar usuario?"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
      {usuarioModal !== null && (
        <UsuarioModal
          usuarioId={usuarioModal === 'new' ? null : usuarioModal}
          onClose={() => setUsuarioModal(null)}
        />
      )}

      <div>
        <h1 className="text-xl font-bold">Configuración</h1>
        <p className="text-sm text-zinc-500 dark:text-[#8D96A5]">Gestión de usuarios del sistema</p>
      </div>

      {(
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Usuarios del sistema</h2>
            <button onClick={() => setUsuarioModal('new')} className="flex items-center gap-2 px-4 py-2.5 bg-[#E37A33] hover:bg-[#CC6824] text-white rounded-xl text-sm font-medium transition-colors">
              <Plus size={16} aria-hidden="true" /> Nuevo Usuario
            </button>
          </div>
          <div className="border border-zinc-200 dark:border-[#303440] rounded-2xl bg-white dark:bg-[#1A1D24] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-[#242730] border-b border-zinc-200 dark:border-[#303440]">
                <tr>
                  {['Email', 'Rol', 'Acciones'].map(h => (
                    <th key={h} scope="col" className="px-6 py-3 text-xs font-medium text-zinc-500 dark:text-[#8D96A5] uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-[#303440]/50">
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-zinc-500 dark:text-[#8D96A5]">
                      <Key size={32} className="mx-auto opacity-40 mb-2" aria-hidden="true" />
                      <p className="font-medium">No hay usuarios registrados</p>
                    </td>
                  </tr>
                ) : usuarios.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-[#242730]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-[#242730] flex items-center justify-center text-zinc-500 shrink-0" aria-hidden="true">
                          <Key size={14} />
                        </div>
                        <span className="font-medium">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${rolBadge[u.rol] || 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'}`}>{u.rol}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setUsuarioModal(u.id)}
                          aria-label={`Editar usuario ${u.email}`}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730] transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                        >
                          <Edit2 size={15} aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: u.id })}
                          aria-label={`Eliminar usuario ${u.email}`}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-zinc-500 hover:text-red-500"
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
