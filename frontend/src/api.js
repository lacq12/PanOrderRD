const BASE = '/api';

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
  login: (email, password) => request('POST', '/login', { email, password }),

  // Productos
  getProductos:   ()       => request('GET',    '/productos'),
  createProducto: (data)   => request('POST',   '/productos', data),
  updateProducto: (id, d)  => request('PUT',    `/productos/${id}`, d),
  deleteProducto: (id)     => request('DELETE', `/productos/${id}`),

  // Clientes
  getClientes:   ()       => request('GET',    '/clientes'),
  createCliente: (data)   => request('POST',   '/clientes', data),
  updateCliente: (id, d)  => request('PUT',    `/clientes/${id}`, d),
  deleteCliente: (id)     => request('DELETE', `/clientes/${id}`),

  // Empleados
  getEmpleados:   ()       => request('GET',    '/empleados'),
  createEmpleado: (data)   => request('POST',   '/empleados', data),
  updateEmpleado: (id, d)  => request('PUT',    `/empleados/${id}`, d),
  deleteEmpleado: (id)     => request('DELETE', `/empleados/${id}`),

  // Pedidos
  getPedidos:   ()       => request('GET',    '/pedidos'),
  createPedido: (data)   => request('POST',   '/pedidos', data),
  updatePedido: (id, d)  => request('PUT',    `/pedidos/${id}`, d),
  deletePedido: (id)     => request('DELETE', `/pedidos/${id}`),

  // Usuarios
  getUsuarios:   ()       => request('GET',    '/usuarios'),
  createUsuario: (data)   => request('POST',   '/usuarios', data),
  updateUsuario: (id, d)  => request('PUT',    `/usuarios/${id}`, d),
  deleteUsuario: (id)     => request('DELETE', `/usuarios/${id}`),
};
