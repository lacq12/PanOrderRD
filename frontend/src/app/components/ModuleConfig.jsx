import { useState } from 'react'
import { useStore } from '../../store.js'
import { Edit2, Trash2, Plus, Key, Users, X } from 'lucide-react'

const ROLES_USUARIO = ['Admin', 'Gerente', 'Vendedor']

const inputCls = "w-full bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#E37A33] focus:ring-1 focus:ring-[#E37A33] transition-all dark:text-white placeholder:text-zinc-400"

const rolBadge = {
  Admin:    'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  Gerente:  'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  Vendedor: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
}

function ConfirmModal({ title, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-500">
            <Trash2 size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
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

// Estructura base para todos los modales
function BaseModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-[#303440]">
          <h2 className="font-semibold text-base">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730] transition-colors text-zinc-400 hover:text-zinc-600">
            <X size={18} />
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
    <BaseModal title={existing ? 'Editar usuario' : 'Nuevo usuario'} onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Correo Electrónico *</label>
            <input required type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="ejemplo@correo.com" className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Contraseña {existing && <span className="text-zinc-400 font-normal">(Opcional)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setField('password', e.target.value)}
              placeholder="Nueva contraseña"
              required={!existing}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Rol *</label>
          <input value={form.rol} onChange={e => setField('rol', e.target.value)} placeholder="Ej: Admin, Gerente, Vendedor" className={inputCls} />
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

function EmpleadoModal({ empleadoId, onClose }) {
  const { empleados, addEmpleado, updateEmpleado } = useStore()
  const existing = empleadoId != null ? empleados.find(e => e.id === empleadoId) : null

  const [form, setForm] = useState({
    nombre: existing?.nombre || '',
    cargo: existing?.cargo || '',
    salario: existing?.salario ?? '',
  })
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = (e) => {
    e.preventDefault()
    const payload = { ...form, salario: parseFloat(form.salario) || 0 }
    if (existing) updateEmpleado(existing.id, payload)
    else addEmpleado(payload)
    onClose()
  }

  return (
    <BaseModal title={existing ? 'Editar empleado' : 'Nuevo empleado'} onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Nombre Completo *</label>
            <input required value={form.nombre} onChange={e => setField('nombre', e.target.value)} placeholder="Ej: Carlos Rodriguez" className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Cargo *</label>
            <input required value={form.cargo} onChange={e => setField('cargo', e.target.value)} placeholder="Ej: Vendedor" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Salario Mensual *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
            <input
              type="number" step="0.01" min="0"
              value={form.salario}
              onChange={e => setField('salario', e.target.value)}
              placeholder="0.00"
              className={`${inputCls} pl-8`}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-200 dark:border-[#303440]">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-[#8D96A5] hover:text-zinc-900 dark:hover:text-white transition-colors">
            Cancelar
          </button>
          <button type="submit" className="px-5 py-2.5 bg-[#E37A33] hover:bg-[#CC6824] text-white rounded-xl text-sm font-semibold transition-colors">
            Guardar Empleado
          </button>
        </div>
      </form>
    </BaseModal>
  )
}

export default function ModuleConfig() {
  const { usuarios, deleteUsuario, empleados, deleteEmpleado } = useStore()
  const [tab, setTab] = useState('usuarios')
  const [usuarioModal, setUsuarioModal] = useState(null)
  const [empleadoModal, setEmpleadoModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'usuario') deleteUsuario(deleteTarget.id)
    else deleteEmpleado(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {deleteTarget && (
        <ConfirmModal
          title={`¿Eliminar ${deleteTarget.type === 'usuario' ? 'usuario' : 'empleado'}?`}
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
      {empleadoModal !== null && (
        <EmpleadoModal
          empleadoId={empleadoModal === 'new' ? null : empleadoModal}
          onClose={() => setEmpleadoModal(null)}
        />
      )}

      <div>
        <h1 className="text-xl font-bold">Configuración</h1>
        <p className="text-sm text-zinc-500 dark:text-[#8D96A5]">Gestión de usuarios y empleados</p>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-zinc-200 dark:border-[#303440] gap-6">
        {[
          { key: 'usuarios', label: 'Usuarios', icon: <Key size={16} /> },
          { key: 'empleados', label: 'Empleados', icon: <Users size={16} /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-[#E37A33] text-[#E37A33]'
                : 'border-transparent text-zinc-500 dark:text-[#8D96A5] hover:text-zinc-800 dark:hover:text-white'
            }`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Usuarios */}
      {tab === 'usuarios' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Usuarios del sistema</h2>
            <button onClick={() => setUsuarioModal('new')} className="flex items-center gap-2 px-4 py-2.5 bg-[#E37A33] hover:bg-[#CC6824] text-white rounded-xl text-sm font-medium transition-colors">
              <Plus size={16} /> Nuevo Usuario
            </button>
          </div>
          <div className="border border-zinc-200 dark:border-[#303440] rounded-2xl bg-white dark:bg-[#1A1D24] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-[#242730] border-b border-zinc-200 dark:border-[#303440]">
                <tr>
                  {['Email', 'Rol', 'Acciones'].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-medium text-zinc-500 dark:text-[#8D96A5] uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-[#303440]/50">
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-zinc-500 dark:text-[#8D96A5]">
                      <Key size={32} className="mx-auto opacity-40 mb-2" />
                      <p className="font-medium">No hay usuarios registrados</p>
                    </td>
                  </tr>
                ) : usuarios.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-[#242730]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-[#242730] flex items-center justify-center text-zinc-500 shrink-0">
                          <Key size={14} />
                        </div>
                        <span className="font-medium">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${rolBadge[u.rol] || 'bg-zinc-100 text-zinc-600'}`}>{u.rol}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setUsuarioModal(u.id)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730] transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white"><Edit2 size={15} /></button>
                        <button onClick={() => setDeleteTarget({ type: 'usuario', id: u.id })} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-zinc-500 hover:text-red-500"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empleados */}
      {tab === 'empleados' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Empleados</h2>
            <button onClick={() => setEmpleadoModal('new')} className="flex items-center gap-2 px-4 py-2.5 bg-[#E37A33] hover:bg-[#CC6824] text-white rounded-xl text-sm font-medium transition-colors">
              <Plus size={16} /> Nuevo Empleado
            </button>
          </div>
          <div className="border border-zinc-200 dark:border-[#303440] rounded-2xl bg-white dark:bg-[#1A1D24] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-[#242730] border-b border-zinc-200 dark:border-[#303440]">
                <tr>
                  {['Nombre', 'Cargo', 'Salario', 'Acciones'].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-medium text-zinc-500 dark:text-[#8D96A5] uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-[#303440]/50">
                {empleados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-zinc-500 dark:text-[#8D96A5]">
                      <Users size={32} className="mx-auto opacity-40 mb-2" />
                      <p className="font-medium">No hay empleados registrados</p>
                    </td>
                  </tr>
                ) : empleados.map(e => (
                  <tr key={e.id} className="hover:bg-zinc-50/50 dark:hover:bg-[#242730]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-[#E37A33]/15 text-[#E37A33] flex items-center justify-center text-xs font-bold shrink-0">
                          {e.nombre?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium">{e.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-[#8D96A5]">{e.cargo}</td>
                    <td className="px-6 py-4">
                      {e.salario != null && e.salario !== ''
                        ? new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(e.salario)
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEmpleadoModal(e.id)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730] transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white"><Edit2 size={15} /></button>
                        <button onClick={() => setDeleteTarget({ type: 'empleado', id: e.id })} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-zinc-500 hover:text-red-500"><Trash2 size={15} /></button>
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
