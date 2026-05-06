const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const pool    = require('./db');
require('dotenv').config();

const app = express();
//app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// ── Auth middleware ──────────────────────────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Sin token' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// ── POST /api/login ──────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Datos incompletos' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND estado = 1 LIMIT 1',
      [email]
    );
    if (!rows.length) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (err) {
     console.error("ERROR LOGIN:", err); // 👈 AGREGA ESTO
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ── Productos ────────────────────────────────────────────────────────────────
app.get('/api/productos', auth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM productos ORDER BY id');
  res.json(rows);
});

app.post('/api/productos', auth, async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria, disponible } = req.body;
  const [result] = await pool.query(
    'INSERT INTO productos (nombre, descripcion, precio, stock, categoria, disponible) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, descripcion, precio, stock ?? 0, categoria, disponible ?? 1]
  );
  const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

app.put('/api/productos/:id', auth, async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria, disponible } = req.body;
  await pool.query(
    'UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, categoria=?, disponible=? WHERE id=?',
    [nombre, descripcion, precio, stock, categoria, disponible, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

app.delete('/api/productos/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// ── Clientes ─────────────────────────────────────────────────────────────────
app.get('/api/clientes', auth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM clientes ORDER BY id');
  res.json(rows);
});

app.post('/api/clientes', auth, async (req, res) => {
  const { nombre, apellido, telefono, direccion, email } = req.body;
  const [result] = await pool.query(
    'INSERT INTO clientes (nombre, apellido, telefono, direccion, email) VALUES (?, ?, ?, ?, ?)',
    [nombre, apellido, telefono, direccion, email]
  );
  const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

app.put('/api/clientes/:id', auth, async (req, res) => {
  const { nombre, apellido, telefono, direccion, email } = req.body;
  await pool.query(
    'UPDATE clientes SET nombre=?, apellido=?, telefono=?, direccion=?, email=? WHERE id=?',
    [nombre, apellido, telefono, direccion, email, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

app.delete('/api/clientes/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// ── Empleados ────────────────────────────────────────────────────────────────
app.get('/api/empleados', auth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM empleados ORDER BY id');
  res.json(rows);
});

app.post('/api/empleados', auth, async (req, res) => {
  const { nombre, apellido, cargo, telefono, salario } = req.body;
  const [result] = await pool.query(
    'INSERT INTO empleados (nombre, apellido, cargo, telefono, salario) VALUES (?, ?, ?, ?, ?)',
    [nombre, apellido, cargo, telefono, salario]
  );
  const [rows] = await pool.query('SELECT * FROM empleados WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

app.put('/api/empleados/:id', auth, async (req, res) => {
  const { nombre, apellido, cargo, telefono, salario } = req.body;
  await pool.query(
    'UPDATE empleados SET nombre=?, apellido=?, cargo=?, telefono=?, salario=? WHERE id=?',
    [nombre, apellido, cargo, telefono, salario, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM empleados WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

app.delete('/api/empleados/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM empleados WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// ── Pedidos ──────────────────────────────────────────────────────────────────
app.get('/api/pedidos', auth, async (req, res) => {
  const [rows] = await pool.query(`
    SELECT p.*, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
           c.telefono AS cliente_telefono
    FROM pedidos p
    LEFT JOIN clientes c ON c.id = p.cliente_id
    ORDER BY p.id
  `);
  // Attach detalle_pedido items
  const ids = rows.map(r => r.id);
  if (ids.length) {
    const [detalles] = await pool.query(
      'SELECT * FROM detalle_pedido WHERE pedido_id IN (?)',
      [ids]
    );
    rows.forEach(p => {
      p.items = detalles.filter(d => d.pedido_id === p.id);
    });
  } else {
    rows.forEach(p => { p.items = []; });
  }
  res.json(rows);
});

app.post('/api/pedidos', auth, async (req, res) => {
  const { cliente_id, empleado_id, fecha_entrega, monto_total, anticipo_pagado, estado_pago, items } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO pedidos (cliente_id, empleado_id, fecha_entrega, monto_total, anticipo_pagado, estado_pago) VALUES (?, ?, ?, ?, ?, ?)',
      [cliente_id, empleado_id, fecha_entrega, monto_total, anticipo_pagado ?? 0, estado_pago ?? 'Pendiente']
    );
    const pedidoId = result.insertId;
    if (items && items.length) {
      for (const item of items) {
        await conn.query(
          'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) VALUES (?, ?, ?, ?)',
          [pedidoId, item.producto_id, item.cantidad, item.subtotal ?? item.precio_unitario * item.cantidad]
        );
        await conn.query(
          'UPDATE productos SET stock = GREATEST(0, stock - ?) WHERE id = ?',
          [item.cantidad, item.producto_id]
        );
      }
    }
    await conn.commit();
    const [rows] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.put('/api/pedidos/:id', auth, async (req, res) => {
  const { cliente_id, empleado_id, fecha_entrega, monto_total, anticipo_pagado, estado_pago, estado_pedido } = req.body;
  await pool.query(
    'UPDATE pedidos SET cliente_id=?, empleado_id=?, fecha_entrega=?, monto_total=?, anticipo_pagado=?, estado_pago=? WHERE id=?',
    [cliente_id, empleado_id, fecha_entrega, monto_total, anticipo_pagado, estado_pago, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

app.delete('/api/pedidos/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM detalle_pedido WHERE pedido_id = ?', [req.params.id]);
  await pool.query('DELETE FROM pedidos WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// ── Usuarios ─────────────────────────────────────────────────────────────────
app.get('/api/usuarios', auth, async (req, res) => {
  const [rows] = await pool.query('SELECT id, nombre, email, rol, estado FROM usuarios ORDER BY id');
  res.json(rows);
});

app.post('/api/usuarios', auth, async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, hash, rol]
  );
  res.status(201).json({ id: result.insertId, nombre, email, rol, estado: 1 });
});

app.put('/api/usuarios/:id', auth, async (req, res) => {
  const { nombre, email, rol, estado, password } = req.body;
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE usuarios SET nombre=?, email=?, rol=?, estado=?, password_hash=? WHERE id=?',
      [nombre, email, rol, estado, hash, req.params.id]
    );
  } else {
    await pool.query(
      'UPDATE usuarios SET nombre=?, email=?, rol=?, estado=? WHERE id=?',
      [nombre, email, rol, estado, req.params.id]
    );
  }
  const [rows] = await pool.query('SELECT id, nombre, email, rol, estado FROM usuarios WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

app.delete('/api/usuarios/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));
