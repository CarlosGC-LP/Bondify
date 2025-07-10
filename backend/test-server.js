// backend/test-server.js
const express = require('express');
const cors = require('cors');
const { sql, poolPromise } = require('./db'); // Usa tu archivo db.js
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/bono-ultimo/:idUsuario', async (req, res) => {
  console.log('🔍 Se llamó a /api/bono-ultimo con ID:', req.params.idUsuario);

  try {
    const { idUsuario } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('idUsuario', sql.Int, idUsuario)
      .query(`
        SELECT TOP 1 valor_nominal, valor_comercial, anios, tasa_nominal, id_frecuencias
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
    console.error('❌ Error en la ruta de prueba:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de prueba corriendo en http://localhost:${PORT}`);
});
