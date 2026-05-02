import { useState, useMemo } from 'react'
import { useStore } from '../../store.js'
import { Search, Edit2, Trash2, Plus, X, Package } from 'lucide-react'

const CATEGORIAS = ['Panes', 'Bollería', 'Pasteles', 'Bebidas', 'Embutidos', 'Otros']
const UNIDADES = ['kg', 'g', 'L', 'ml', 'unidad']
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
            <h3 className="font-semibold text-lg">¿Eliminar producto?</h3>
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

function ProductoModal({ productoId, onClose }) {
  const { productos, addProducto, updateProducto } = useStore()
  const existing = productoId != null ? productos.find(p => p.id === productoId) : null

  const [form, setForm] = useState({
    nombre: existing?.nombre || '',
    descripcion: existing?.descripcion || '',
    precio: existing?.precio ?? '',
    stock: existing?.stock ?? '',
    categoria: existing?.categoria || 'Panes',
    disponible: existing?.disponible ?? true,
    ingredientes: existing?.ingredientes || [],
  })

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const addIngrediente = () => setField('ingredientes', [...form.ingredientes, { nombre: '', cantidad: '', unidad: 'kg' }])
  const removeIngrediente = (i) => setField('ingredientes', form.ingredientes.filter((_, idx) => idx !== i))
  const updateIngrediente = (i, k, v) => setField('ingredientes', form.ingredientes.map((ing, idx) => idx === i ? { ...ing, [k]: v } : ing))

  const handleSave = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      precio: parseFloat(form.precio) || 0,
      stock: parseInt(form.stock) || 0,
      ingredientes: form.ingredientes.map(ing => ({ ...ing, cantidad: parseFloat(ing.cantidad) || 0 })),
    }
    if (existing) updateProducto(existing.id, payload)
    else addProducto(payload)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-[#303440] shrink-0">
          <h2 className="font-semibold text-base">{existing ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730] transition-colors text-zinc-400 hover:text-zinc-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

            {/* Row 1: Nombre / Precio / Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="text-sm font-medium block mb-1.5">Nombre del producto</label>
                <input required value={form.nombre} onChange={e => setField('nombre', e.target.value)} placeholder="Ej. Pan Dulce" className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Precio de venta ($)</label>
                <input required type="number" step="0.01" min="0" value={form.precio} onChange={e => setField('precio', e.target.value)} placeholder="Ej. 15.50" className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Stock actual</label>
                <input required type="number" min="0" value={form.stock} onChange={e => setField('stock', e.target.value)} placeholder="0" className={inputCls} />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="text-sm font-medium block mb-1.5">Categoría</label>
              <select value={form.categoria} onChange={e => setField('categoria', e.target.value)} className={inputCls}>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="text-sm font-medium block mb-1.5">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={e => setField('descripcion', e.target.value)}
                placeholder="Breve descripción del producto..."
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Disponible */}
            <div className="flex items-center gap-2.5">
              <input
                id="disponible"
                type="checkbox"
                checked={form.disponible}
                onChange={e => setField('disponible', e.target.checked)}
                className="w-4 h-4 accent-[#E37A33]"
              />
              <label htmlFor="disponible" className="text-sm font-medium">Disponible para venta</label>
            </div>

            {/* Ingredientes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Lista de Ingredientes (Receta)</label>
                <button
                  type="button"
                  onClick={addIngrediente}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#E37A33] hover:bg-[#CC6824] text-white text-xs font-medium rounded-lg transition-colors shrink-0"
                >
                  <Plus size={13} /> <span>Añadir</span>
                </button>
              </div>

              {form.ingredientes.length === 0 ? (
                <div className="border-2 border-dashed border-zinc-200 dark:border-[#303440] rounded-xl py-6 text-center text-zinc-400 dark:text-[#8D96A5] text-sm italic">
                  Sin ingredientes. Añade uno para comenzar.
                </div>
              ) : (
                <div className="space-y-2">
                  {form.ingredientes.map((ing, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        placeholder="Nombre del ingrediente"
                        value={ing.nombre}
                        onChange={e => updateIngrediente(i, 'nombre', e.target.value)}
                        className={`${inputCls} flex-1`}
                      />
                      <input
                        type="number" step="0.01" min="0"
                        placeholder="Cant."
                        value={ing.cantidad}
                        onChange={e => updateIngrediente(i, 'cantidad', e.target.value)}
                        className={`${inputCls} w-24`}
                      />
                      <select
                        value={ing.unidad}
                        onChange={e => updateIngrediente(i, 'unidad', e.target.value)}
                        className={`${inputCls} w-24`}
                      >
                        {UNIDADES.map(u => <option key={u}>{u}</option>)}
                      </select>
                      <button type="button" onClick={() => removeIngrediente(i)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-[#303440] shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-[#8D96A5] hover:text-zinc-900 dark:hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2.5 bg-[#E37A33] hover:bg-[#CC6824] text-white rounded-xl text-sm font-semibold transition-colors">
              Guardar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ModuleB() {
  const { productos, deleteProducto } = useStore()
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return productos.filter(p =>
      p.nombre?.toLowerCase().includes(q) ||
      p.categoria?.toLowerCase().includes(q) ||
      p.descripcion?.toLowerCase().includes(q)
    )
  }, [productos, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {deleteId != null && (
        <ConfirmModal
          onCancel={() => setDeleteId(null)}
          onConfirm={() => { deleteProducto(deleteId); setDeleteId(null) }}
        />
      )}
      {modal !== null && (
        <ProductoModal
          productoId={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Productos</h1>
          <p className="text-sm text-zinc-500 dark:text-[#8D96A5]">Gestión de catálogo e ingredientes</p>
        </div>
        <button onClick={() => setModal('new')} className="flex items-center gap-2 px-4 py-2.5 bg-[#E37A33] hover:bg-[#CC6824] text-white rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Crear Producto
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar por nombre, categoría o descripción..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-[#1A1D24] border border-zinc-200 dark:border-[#303440] rounded-xl outline-none focus:border-[#E37A33] focus:ring-1 focus:ring-[#E37A33] transition-all dark:text-white"
        />
      </div>

      <div className="border border-zinc-200 dark:border-[#303440] rounded-2xl bg-white dark:bg-[#1A1D24] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-[#242730] border-b border-zinc-200 dark:border-[#303440]">
              <tr>
                {['#', 'Nombre', 'Descripción', 'Precio', 'Stock', 'Categoría', 'Disponible', 'Acciones'].map(h => (
                  <th key={h} className="px-6 py-3 text-xs font-medium text-zinc-500 dark:text-[#8D96A5] uppercase tracking-wide text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-[#303440]/50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 dark:text-[#8D96A5]">
                    <Package size={32} className="mx-auto opacity-40 mb-2" />
                    <p className="font-medium">No hay productos registrados</p>
                  </td>
                </tr>
              ) : paged.map(p => (
                <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-[#242730]/30 transition-colors">
                  <td className="px-6 py-4 text-xs text-zinc-400">{p.id}</td>
                  <td className="px-6 py-4 font-medium">{p.nombre}</td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-[#8D96A5] max-w-50 truncate">{p.descripcion || '—'}</td>
                  <td className="px-6 py-4">${Number(p.precio).toFixed(2)}</td>
                  <td className="px-6 py-4">{p.stock}</td>
                  <td className="px-6 py-4">{p.categoria}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.disponible
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                    }`}>
                      {p.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setModal(p.id)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#242730] transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-zinc-500 hover:text-red-500">
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
