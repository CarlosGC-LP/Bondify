document.getElementById('form-bono').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id_usuario = localStorage.getItem('idUsuario');
  if (!id_usuario) {
    alert("Debes iniciar sesión primero.");
    return;
  }

  const bono = {
    id_usuario,
    id_moneda: document.getElementById('moneda').value,
    id_tipos_tasa: 1, // Suponiendo 1 = Nominal
    id_frecuencias: 1, // Suponiendo 1 = Mensual
    id_periodos_gracia: document.getElementById('periodo_gracia').value,
    id_tipos_amortizacion: 1, // Suponiendo 1 = Alemán (puedes cambiarlo)
    valor_nominal: parseFloat(document.getElementById('valor_nominal').value),
    valor_comercial: parseFloat(document.getElementById('valor_comercial').value),
    anios: parseInt(document.getElementById('anios').value),
    fecuencia_cupon: document.getElementById('frecuencia_pago').value,
    periodos_anio: 12,
    dias_anio: 360,
    tipo_tasa: "Nominal",
    tasa_nominal: parseFloat(document.getElementById('tasa_nominal').value),
    tasa_efectiva: 0,
    fecuencia_capitalizacion: document.getElementById('capitalizacion').value,
    impuesto_renta: 0.05,
    fecha_emision: new Date().toISOString(),
    periodo_gracia: false,
    inflacion_anual: 0.03,
    inflacion_semestral: 0.015,
    facha_bono: new Date().toISOString()
  };

  try {
    const res = await fetch('http://localhost:3000/api/bonos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bono)
    });

    const data = await res.json();
    
    if (res.ok) {
      document.getElementById('mensaje').textContent = '✅ Bono guardado con éxito. Redirigiendo...';
      setTimeout(() => {
        window.location.href = 'flujo-caja.html';
      }, 1000); // espera 1 segundo antes de redirigir
    } else {
      document.getElementById('mensaje').textContent = `❌ Error: ${data.error}`;
    }
  } catch (err) {
    document.getElementById('mensaje').textContent = '❌ Error de conexión con el servidor';
    console.error(err);
  }
});
