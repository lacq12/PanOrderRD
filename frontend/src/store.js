import { create } from 'zustand';
import { api } from './api.js';

export const useStore = create((set, get) => ({
  productos: [],
  clientes:  [],
  pedidos:   [],
  empleados: [],
  usuarios:  [],

  // ── Carga inicial desde la DB ──────────────────────────────────────────────
  loadAll: async () => {
    const [productos, clientes, pedidos, empleados, usuarios] = await Promise.all([
      api.getProductos(),
      api.getClientes(),
      api.getPedidos(),
      api.getEmpleados(),
      api.getUsuarios(),
    ]);
    set({ productos, clientes, pedidos, empleados, usuarios });
  },

  // ── Productos ──────────────────────────────────────────────────────────────
  addProducto: async (p) => {
    const nuevo = await api.createProducto(p);
    set((s) => ({ productos: [...s.productos, nuevo] }));
    return nuevo;
  },
  updateProducto: async (id, p) => {
    const updated = await api.updateProducto(id, p);
    set((s) => ({ productos: s.productos.map(x => x.id === id ? updated : x) }));
  },
  deleteProducto: async (id) => {
    await api.deleteProducto(id);
    set((s) => ({ productos: s.productos.filter(x => x.id !== id) }));
  },

  // ── Clientes ───────────────────────────────────────────────────────────────
  addCliente: async (c) => {
    const nuevo = await api.createCliente(c);
    set((s) => ({ clientes: [...s.clientes, nuevo] }));
    return nuevo.id;
  },
  updateCliente: async (id, c) => {
    const updated = await api.updateCliente(id, c);
    set((s) => ({ clientes: s.clientes.map(x => x.id === id ? updated : x) }));
  },
  deleteCliente: async (id) => {
    await api.deleteCliente(id);
    set((s) => ({ clientes: s.clientes.filter(x => x.id !== id) }));
  },

  // ── Pedidos ────────────────────────────────────────────────────────────────
  addPedido: async (p) => {
    const nuevo = await api.createPedido(p);
    // Recargar productos para reflejar stock actualizado
    const productos = await api.getProductos();
    set((s) => ({ pedidos: [...s.pedidos, nuevo], productos }));
    return nuevo;
  },
  updatePedido: async (id, p) => {
    const updated = await api.updatePedido(id, p);
    set((s) => ({ pedidos: s.pedidos.map(x => x.id === id ? updated : x) }));
  },
  deletePedido: async (id) => {
    await api.deletePedido(id);
    set((s) => ({ pedidos: s.pedidos.filter(x => x.id !== id) }));
  },

  // ── Empleados ──────────────────────────────────────────────────────────────
  addEmpleado: async (e) => {
    const nuevo = await api.createEmpleado(e);
    set((s) => ({ empleados: [...s.empleados, nuevo] }));
    return nuevo;
  },
  updateEmpleado: async (id, e) => {
    const updated = await api.updateEmpleado(id, e);
    set((s) => ({ empleados: s.empleados.map(x => x.id === id ? updated : x) }));
  },
  deleteEmpleado: async (id) => {
    await api.deleteEmpleado(id);
    set((s) => ({ empleados: s.empleados.filter(x => x.id !== id) }));
  },

  // ── Usuarios ───────────────────────────────────────────────────────────────
  addUsuario: async (u) => {
    const nuevo = await api.createUsuario(u);
    set((s) => ({ usuarios: [...s.usuarios, nuevo] }));
    return nuevo;
  },
  updateUsuario: async (id, u) => {
    const updated = await api.updateUsuario(id, u);
    set((s) => ({ usuarios: s.usuarios.map(x => x.id === id ? updated : x) }));
  },
  deleteUsuario: async (id) => {
    await api.deleteUsuario(id);
    set((s) => ({ usuarios: s.usuarios.filter(x => x.id !== id) }));
  },
}));
