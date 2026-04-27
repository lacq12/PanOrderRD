const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

/* ✅ leer formularios */
app.use(express.urlencoded({ extended: true }));

/* ✅ servir frontend */
app.use(express.static(path.join(__dirname, '../frontend')));

/* ✅ conexión MySQL */
const db = mysql.createConnection({
  host: 'localhost',
  user: 'portal_user',
  password: 'portal123',
  database: 'mi_base'
});

/* ✅ LOGIN */
app.post('/login', (req, res) => {
  console.log('LLEGÓ AL BACKEND ✅');
  console.log(req.body);

  const { email, password } = req.body;

  db.query(
    'SELECT * FROM usuarios WHERE email = ?',
    [email],
    async (err, rows) => {
      if (err || rows.length === 0) {
        return res.send('Credenciales inválidas');
      }

      const ok = await bcrypt.compare(password, rows[0].password_hash);
      if (!ok) {
        return res.send('Credenciales inválidas');
      }

      res.send('Login correcto: ' + rows[0].rol);
    }
  );
});

/* ✅ iniciar servidor (SOLO UNA VEZ) */
app.listen(3000, () => {
  console.log('Servidor activo en puerto 3000');
});