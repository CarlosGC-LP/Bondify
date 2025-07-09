const express = require('express');
const cors = require('cors');
const { sql, poolPromise } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.send('✅ Backend conectado a SQL Server');
});

app.get('/api/bonos/:idUsuario', async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('idUsuario', sql.Int, idUsuario)
      .query(`
        SELECT valor_nominal, anios, tasa_nominal
        FROM BONOS
        WHERE id_usuario = @idUsuario
      `);

    res.status(200).json(result.recordset); // devolvemos un arreglo
  } catch (err) {
    console.error('Error al obtener bonos:', err);
    res.status(500).json({ error: 'Error al obtener bonos' });
  }
});



// Ruta para registrar usuario
app.post('/api/usuarios', async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('nombre', sql.VarChar(50), nombre)
      .input('correo', sql.VarChar(50), correo)
      .input('contrasenia', sql.VarChar(50), contrasena)
      .query('INSERT INTO USUARIOS (nombre, correo_electronico, contrasenia) VALUES (@nombre, @correo, @contrasenia)');

    res.status(201).json({ mensaje: '✅ Usuario registrado exitosamente' });
  } catch (err) {
    console.error('❌ Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Ruta para login de usuario
// Ruta para login de usuario
app.post('/api/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('correo', sql.VarChar(50), correo)
      .input('contrasena', sql.VarChar(50), contrasena)
      .query('SELECT id, nombre FROM USUARIOS WHERE correo_electronico = @correo AND contrasenia = @contrasena');

    if (result.recordset.length > 0) {
      const { id, nombre } = result.recordset[0];
      res.status(200).json({ mensaje: 'Login exitoso', nombre, id });
    } else {
      res.status(401).json({ error: 'Credenciales incorrectas' });
    }
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});





app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
