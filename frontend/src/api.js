// api.js

const BASE = '/api'; // ✔ CORREGIDO para usar Vite proxy

function getToken() {
  return localStorage.getItem('token');
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }

  return res.json();
}

export const api = {
  // 🔐 Auth
  login: (email, password) =>
    request('POST', '/login', { email, password }),

  // 📦 Productos
  getProductos: () =>
    request('GET', '/productos'),

  createProducto: (data) =>
    request('POST', '/productos', data),

  updateProducto: (id, data) =>
    request('PUT', `/productos/${id}`, data),

  deleteProducto: (id) =>
    request('DELETE', `/productos/${id}`),

  // 👤 Clientes
  getClientes: () =>
    request('GET', '/clientes'),

  createCliente: (data) =>
    request('POST', '/clientes', data),

  updateCliente: (id, data) =>
    request('PUT', `/clientes/${id}`, data),

  deleteCliente: (id) =>
    request('DELETE', `/clientes/${id}`),

  // 👨‍💼 Empleados
  getEmpleados: () =>
    request('GET', '/empleados'),

  createEmpleado: (data) =>
    request('POST', '/empleados', data),

  updateEmpleado: (id, data) =>
    request('PUT', `/empleados/${id}`, data),

  deleteEmpleado: (id) =>
    request('DELETE', `/empleados/${id}`),

  // 🧾 Pedidos
  getPedidos: () =>
    request('GET', '/pedidos'),

  createPedido: (data) =>
    request('POST', '/pedidos', data),

  updatePedido: (id, data) =>
    request('PUT', `/pedidos/${id}`, data),

  deletePedido: (id) =>
    request('DELETE', `/pedidos/${id}`),

  // 👥 Usuarios
  getUsuarios: () =>
    request('GET', '/usuarios'),

  createUsuario: (data) =>
    request('POST', '/usuarios', data),

  updateUsuario: (id, data) =>
    request('PUT', `/usuarios/${id}`, data),

  deleteUsuario: (id) =>
    request('DELETE', `/usuarios/${id}`),
};