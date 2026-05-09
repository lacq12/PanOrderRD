const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('./db');
require('dotenv').config();

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND estado = 1 LIMIT 1',
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
    console.error("ERROR LOGIN:", err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ── Productos ────────────────────────────────────────────────────────────────
app.get('/api/productos', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/productos', auth, async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria, disponible } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, categoria, disponible) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nombre, descripcion, precio, stock ?? 0, categoria, disponible ? 1 : 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/productos/:id', auth, async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria, disponible } = req.body;
    const { rows } = await pool.query(
      'UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, stock=$4, categoria=$5, disponible=$6 WHERE id=$7 RETURNING *',
      [nombre, descripcion, precio, stock, categoria, disponible ? 1 : 0, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/productos/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT COUNT(*) FROM detalle_pedido WHERE producto_id = $1',
      [req.params.id]
    );
    if (parseInt(rows[0].count) > 0) {
      return res.status(409).json({ error: 'No se puede eliminar: el producto está asociado a uno o más pedidos.' });
    }
    await pool.query('DELETE FROM productos WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Clientes ─────────────────────────────────────────────────────────────────
app.get('/api/clientes', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clientes ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clientes', auth, async (req, res) => {
  try {
    const { nombre, apellido, telefono, direccion, email } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO clientes (nombre, apellido, telefono, direccion, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, apellido, telefono, direccion, email]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clientes/:id', auth, async (req, res) => {
  try {
    const { nombre, apellido, telefono, direccion, email } = req.body;
    const { rows } = await pool.query(
      'UPDATE clientes SET nombre=$1, apellido=$2, telefono=$3, direccion=$4, email=$5 WHERE id=$6 RETURNING *',
      [nombre, apellido, telefono, direccion, email, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clientes/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM clientes WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Empleados ────────────────────────────────────────────────────────────────
app.get('/api/empleados', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM empleados ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/empleados', auth, async (req, res) => {
  try {
    const { nombre, apellido, cargo, telefono, salario } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO empleados (nombre, apellido, cargo, telefono, salario) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, apellido, cargo, telefono, salario]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/empleados/:id', auth, async (req, res) => {
  try {
    const { nombre, apellido, cargo, telefono, salario } = req.body;
    const { rows } = await pool.query(
      'UPDATE empleados SET nombre=$1, apellido=$2, cargo=$3, telefono=$4, salario=$5 WHERE id=$6 RETURNING *',
      [nombre, apellido, cargo, telefono, salario, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/empleados/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM empleados WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Pedidos ──────────────────────────────────────────────────────────────────
app.get('/api/pedidos', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.cliente_id, p.empleado_id, p.fecha_entrega, p.fecha_registro,
             p.monto_total, p.anticipo_pagado, p.estado_pago, p.estado_pedido,
             c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
             c.telefono AS cliente_telefono
      FROM pedidos p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      ORDER BY p.id
    `);
    const ids = rows.map(r => r.id);
    if (ids.length) {
      const { rows: detalles } = await pool.query(
        'SELECT * FROM detalle_pedido WHERE pedido_id = ANY($1)',
        [ids]
      );
      rows.forEach(p => {
        p.items = detalles.filter(d => d.pedido_id === p.id);
      });
    } else {
      rows.forEach(p => { p.items = []; });
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pedidos', auth, async (req, res) => {
  const { cliente_id, empleado_id, fecha_entrega, monto_total, anticipo_pagado, estado_pago, items } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'INSERT INTO pedidos (cliente_id, empleado_id, fecha_entrega, monto_total, anticipo_pagado, estado_pago) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [cliente_id, empleado_id, fecha_entrega, monto_total, anticipo_pagado ?? 0, estado_pago ?? 'Pendiente']
    );
    const pedido = rows[0];
    if (items && items.length) {
      for (const item of items) {
        await client.query(
          'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) VALUES ($1, $2, $3, $4)',
          [pedido.id, item.producto_id, item.cantidad, item.subtotal ?? item.precio_unitario * item.cantidad]
        );
        await client.query(
          'UPDATE productos SET stock = GREATEST(0, stock - $1) WHERE id = $2',
          [item.cantidad, item.producto_id]
        );
      }
    }
    await client.query('COMMIT');
    res.status(201).json(pedido);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.put('/api/pedidos/:id', auth, async (req, res) => {
  try {
    const { cliente_id, empleado_id, fecha_entrega, monto_total, anticipo_pagado, estado_pago, estado_pedido } = req.body;
    const { rows } = await pool.query(
      'UPDATE pedidos SET cliente_id=$1, empleado_id=$2, fecha_entrega=$3, monto_total=$4, anticipo_pagado=$5, estado_pago=$6 WHERE id=$7 RETURNING *',
      [cliente_id, empleado_id, fecha_entrega, monto_total, anticipo_pagado, estado_pago, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pedidos/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM detalle_pedido WHERE pedido_id = $1', [req.params.id]);
    await pool.query('DELETE FROM pedidos WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Usuarios ─────────────────────────────────────────────────────────────────
app.get('/api/usuarios', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, nombre, email, rol, estado FROM usuarios ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/usuarios', auth, async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4) RETURNING id',
      [nombre, email, hash, rol]
    );
    res.status(201).json({ id: rows[0].id, nombre, email, rol, estado: 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/usuarios/:id', auth, async (req, res) => {
  try {
    const { nombre, email, rol, estado, password } = req.body;
    let rows;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      ({ rows } = await pool.query(
        'UPDATE usuarios SET nombre=$1, email=$2, rol=$3, estado=$4, password_hash=$5 WHERE id=$6 RETURNING id, nombre, email, rol, estado',
        [nombre, email, rol, estado, hash, req.params.id]
      ));
    } else {
      ({ rows } = await pool.query(
        'UPDATE usuarios SET nombre=$1, email=$2, rol=$3, estado=$4 WHERE id=$5 RETURNING id, nombre, email, rol, estado',
        [nombre, email, rol, estado, req.params.id]
      ));
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/usuarios/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Unidades ─────────────────────────────────────────────────────────────────
app.get('/api/unidades', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM unidades ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/unidades', auth, async (req, res) => {
  try {
    const { descripcion, unidad_medida } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO unidades (descripcion, unidad_medida) VALUES ($1, $2) RETURNING *',
      [descripcion, unidad_medida]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/unidades/:id', auth, async (req, res) => {
  try {
    const { descripcion, unidad_medida } = req.body;
    const { rows } = await pool.query(
      'UPDATE unidades SET descripcion=$1, unidad_medida=$2 WHERE id=$3 RETURNING *',
      [descripcion, unidad_medida, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Unidad no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/unidades/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT COUNT(*) FROM ingredientes WHERE unidad_id = $1',
      [req.params.id]
    );
    if (parseInt(rows[0].count) > 0) {
      return res.status(409).json({ error: 'No se puede eliminar: la unidad está en uso por uno o más ingredientes.' });
    }
    await pool.query('DELETE FROM unidades WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));
