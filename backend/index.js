const express = require('express');
const cors = require('cors');
const path = require('path');
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

app.post('/api/bonos', async (req, res) => {
  try {
    const {
      id_usuario, id_frecuencias, id_capitalizacion,
      id_moneda, id_tipos_tasa, id_periodos_gracia,
      valor_nominal, valor_comercial, anios,
      dias_anios, tasa_interes, tasa_descuento,
      impuesto_renta, gastos_iniciales, fecha_bono
    } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('id_usuario', sql.Int, id_usuario)
      .input('id_frecuencias', sql.Int, id_frecuencias)
      .input('id_capitalizacion', sql.Int, id_capitalizacion)
      .input('id_moneda', sql.Int, id_moneda)
      .input('id_tipos_tasa', sql.Int, id_tipos_tasa)
      .input('id_periodos_gracia', sql.Int, id_periodos_gracia)
      .input('valor_nominal', sql.Float, valor_nominal)
      .input('valor_comercial', sql.Float, valor_comercial)
      .input('anios', sql.Int, anios)
      .input('dias_anios', sql.Int, dias_anios)
      .input('tasa_interes', sql.Float, tasa_interes)
      .input('tasa_descuento', sql.Float, tasa_descuento)
      .input('impuesto_renta', sql.Float, impuesto_renta)
      .input('gastos_iniciales', sql.Float, gastos_iniciales)
      .input('fecha_bono', sql.DateTime, fecha_bono)
      .query(`
        INSERT INTO bonos (
          id_usuario, id_frecuencias, id_capitalizacion,
          id_moneda, id_tipos_tasa, id_periodos_gracia,
          valor_nominal, valor_comercial, anios,
          dias_anios, tasa_interes, tasa_descuento,
          impuesto_renta, gastos_iniciales, fecha_bono
        )
        VALUES (
          @id_usuario, @id_frecuencias, @id_capitalizacion,
          @id_moneda, @id_tipos_tasa, @id_periodos_gracia,
          @valor_nominal, @valor_comercial, @anios,
          @dias_anios, @tasa_interes, @tasa_descuento,
          @impuesto_renta, @gastos_iniciales, @fecha_bono
        )
      `);

    res.status(201).json({ mensaje: '✅ Bono guardado con éxito' });
  } catch (err) {
    console.error('❌ Error al guardar bono:', err.message);
    res.status(500).json({ error: err.message });
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
      .query('INSERT INTO usuarios (nombre, correo_electronico, contrasenia) VALUES (@nombre, @correo, @contrasenia)');

    res.status(201).json({ mensaje: '✅ Usuario registrado exitosamente' });
  } catch (err) {
    console.error('❌ Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

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

// Ruta para insertar nuevo bono
app.post('/api/bonos', async (req, res) => {
  try {
    const {
      id_usuario, id_moneda, id_tipos_tasa, id_frecuencias,
      id_periodos_gracia, id_tipos_amortizacion, valor_nominal,
      valor_comercial, anios, fecuencia_cupon, periodos_anio, dias_anio,
      tipo_tasa, tasa_nominal, tasa_efectiva, fecuencia_capitalizacion,
      impuesto_renta, fecha_emision, periodo_gracia,
      inflacion_anual, inflacion_semestral, facha_bono
    } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('id_usuario', sql.Int, id_usuario)
      .input('id_moneda', sql.Int, id_moneda)
      .input('id_tipos_tasa', sql.Int, id_tipos_tasa)
      .input('id_frecuencias', sql.Int, id_frecuencias)
      .input('id_periodos_gracia', sql.Int, id_periodos_gracia)
      .input('id_tipos_amortizacion', sql.Int, id_tipos_amortizacion)
      .input('valor_nominal', sql.Float, valor_nominal)
      .input('valor_comercial', sql.Float, valor_comercial)
      .input('anios', sql.Int, anios)
      .input('fecuencia_cupon', sql.VarChar(50), fecuencia_cupon)
      .input('periodos_anio', sql.Int, periodos_anio)
      .input('dias_anio', sql.Int, dias_anio)
      .input('tipo_tasa', sql.VarChar(50), tipo_tasa)
      .input('tasa_nominal', sql.Float, tasa_nominal)
      .input('tasa_efectiva', sql.Float, tasa_efectiva)
      .input('fecuencia_capitalizacion', sql.VarChar(50), fecuencia_capitalizacion)
      .input('impuesto_renta', sql.Float, impuesto_renta)
      .input('fecha_emision', sql.DateTime, fecha_emision)
      .input('periodo_gracia', sql.Bit, periodo_gracia)
      .input('inflacion_anual', sql.Float, inflacion_anual)
      .input('inflacion_semestral', sql.Float, inflacion_semestral)
      .input('facha_bono', sql.DateTime, facha_bono)
      .query(`INSERT INTO BONOS (
        id_usuario, id_moneda, id_tipos_tasa, id_frecuencias, id_periodos_gracia, id_tipos_amortizacion,
        valor_nominal, valor_comercial, anios, fecuencia_cupon, periodos_anio, dias_anio,
        tipo_tasa, tasa_nominal, tasa_efectiva, fecuencia_capitalizacion, impuesto_renta,
        fecha_emision, periodo_gracia, inflacion_anual, inflacion_semestral, facha_bono
      ) VALUES (
        @id_usuario, @id_moneda, @id_tipos_tasa, @id_frecuencias, @id_periodos_gracia, @id_tipos_amortizacion,
        @valor_nominal, @valor_comercial, @anios, @fecuencia_cupon, @periodos_anio, @dias_anio,
        @tipo_tasa, @tasa_nominal, @tasa_efectiva, @fecuencia_capitalizacion, @impuesto_renta,
        @fecha_emision, @periodo_gracia, @inflacion_anual, @inflacion_semestral, @facha_bono
      )`);

    res.status(201).json({ mensaje: 'Bono guardado exitosamente' });
  } catch (err) {
    console.error('❌ Error al guardar bono:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }

});

// Obtener el último bono del usuario
app.get('/api/bono-ultimo/:idUsuario', async (req, res) => {
  console.log('🟡 Ruta /api/bono-ultimo llamada con idUsuario =', req.params.idUsuario);
  try {
    const { idUsuario } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('idUsuario', sql.Int, idUsuario)
      .query(`
        SELECT TOP 1 id, valor_nominal, valor_comercial, anios, tasa_nominal, id_frecuencias
        FROM BONOS
        WHERE id_usuario = @idUsuario
        ORDER BY id DESC
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ error: "No se encontraron bonos" });
    }
  } catch (err) {
    console.error('Error obteniendo el bono:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.post('/api/valoraciones', async (req, res) => {
  try {
    const {
      id_bono,
      precio_actual,
      utilidad_perdida,
      total_intereses,
      total_amortizacion,
      tcea_emisor,
      tcea_bonista,
      duracion,
      duracion_modificada,
      convexidad,
    } = req.body;

    const fecha_valoracion = new Date(); // Fecha actual

    const pool = await poolPromise;
    await pool.request()
      .input('id_bono', sql.Int, id_bono)
      .input('precio_actual', sql.Float, precio_actual)
      .input('utilidad_perdida', sql.Float, utilidad_perdida)
      .input('total_intereses', sql.Float, total_intereses)
      .input('total_amortizacion', sql.Float, total_amortizacion)
      .input('tcea_emisor', sql.Float, tcea_emisor)
      .input('tcea_bonista', sql.Float, tcea_bonista)
      .input('duracion', sql.Float, duracion)
      .input('duracion_modificada', sql.Float, duracion_modificada)
      .input('convexidad', sql.Float, convexidad)
      .input('fecha_valoracion', sql.DateTime, fecha_valoracion)
      .query(`
        INSERT INTO VALORACIONES (
          id_bono, precio_actual, utilidad_perdida,
          total_intereses, total_amortizacion,
          tcea_emisor, tcea_bonista,
          duracion, duracion_modificada, convexidad, fecha_valoracion
        ) VALUES (
          @id_bono, @precio_actual, @utilidad_perdida,
          @total_intereses, @total_amortizacion,
          @tcea_emisor, @tcea_bonista,
          @duracion, @duracion_modificada, @convexidad, @fecha_valoracion
        )
      `);

    res.status(201).json({ mensaje: '✅ Valoración registrada correctamente' });

  } catch (err) {
    console.error('❌ Error al insertar valoración:', err.message);
    res.status(500).json({ error: '❌ No se pudo insertar la valoración' });
  }
});


app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
