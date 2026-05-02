import { create } from 'zustand';

export const useStore = create((set) => ({
  productos: [],
  clientes: [],
  pedidos: [],
  empleados: [],
  usuarios: [],

  // Productos
  addProducto: (p) => set((s) => ({
    productos: [...s.productos, { ...p, id: Math.max(0, ...s.productos.map(x => x.id)) + 1 }]
  })),
  updateProducto: (id, p) => set((s) => ({
    productos: s.productos.map(x => x.id === id ? { ...x, ...p } : x)
  })),
  deleteProducto: (id) => set((s) => ({
    productos: s.productos.filter(x => x.id !== id)
  })),

  // Clientes
  addCliente: (c) => {
    let newId = 1;
    set((s) => {
      newId = Math.max(0, ...s.clientes.map(x => x.id)) + 1;
      return { clientes: [...s.clientes, { ...c, id: newId }] };
    });
    return newId;
  },
  updateCliente: (id, c) => set((s) => ({
    clientes: s.clientes.map(x => x.id === id ? { ...x, ...c } : x)
  })),
  deleteCliente: (id) => set((s) => ({
    clientes: s.clientes.filter(x => x.id !== id)
  })),

  // Pedidos
  addPedido: (p) => set((s) => {
    const newProductos = s.productos.map(prod => {
      const item = p.items.find(i => i.producto_id === prod.id);
      return item ? { ...prod, stock: Math.max(0, prod.stock - item.cantidad) } : prod;
    });
    return {
      productos: newProductos,
      pedidos: [...s.pedidos, { ...p, id: Math.max(0, ...s.pedidos.map(x => x.id)) + 1 }],
    };
  }),
  updatePedido: (id, p) => set((s) => ({
    pedidos: s.pedidos.map(x => x.id === id ? { ...x, ...p } : x)
  })),
  deletePedido: (id) => set((s) => ({
    pedidos: s.pedidos.filter(x => x.id !== id)
  })),

  // Empleados
  addEmpleado: (e) => set((s) => ({
    empleados: [...s.empleados, { ...e, id: Math.max(0, ...s.empleados.map(x => x.id)) + 1 }]
  })),
  updateEmpleado: (id, e) => set((s) => ({
    empleados: s.empleados.map(x => x.id === id ? { ...x, ...e } : x)
  })),
  deleteEmpleado: (id) => set((s) => ({
    empleados: s.empleados.filter(x => x.id !== id)
  })),

  // Usuarios
  addUsuario: (u) => set((s) => ({
    usuarios: [...s.usuarios, { ...u, id: Math.max(0, ...s.usuarios.map(x => x.id)) + 1 }]
  })),
  updateUsuario: (id, u) => set((s) => ({
    usuarios: s.usuarios.map(x => x.id === id ? { ...x, ...u } : x)
  })),
  deleteUsuario: (id) => set((s) => ({
    usuarios: s.usuarios.filter(x => x.id !== id)
  })),
}));
