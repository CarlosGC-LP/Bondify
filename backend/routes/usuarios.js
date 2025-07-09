const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

router.post('/', async (req, res) => {
  const { nombre, correo_electronico, contrasena } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('nombre', nombre)
      .input('correo', correo_electronico)
      .input('contrasenia', contrasena)
      .query('INSERT INTO USUARIOS (nombre, correo_electronico, contrasenia) VALUES (@nombre, @correo, @contrasenia)');

    res.status(201).json({ message: '✅ Usuario registrado' });
  } catch (err) {
    console.error('Error al insertar usuario:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

module.exports = router;
