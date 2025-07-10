document.getElementById('bonoForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const data = {
    id_usuario: localStorage.getItem("id_usuario"), // o como lo guardes
    valor_nominal: parseFloat(form.valorNominal.value),
    valor_comercial: parseFloat(form.valorComercial.value),
    anios: parseInt(form.anios.value),
    dias_anios: parseInt(form.diasAnio.value),
    tasa_interes: parseFloat(form.tasaInteres.value),
    tasa_descuento: parseFloat(form.tasaDescuento.value),
    impuesto_renta: parseFloat(form.impuestoRenta.value),
    gastos_iniciales: parseFloat(form.gastosIniciales.value),
    fecha_bono: form.fechaEmision.value,

    // Se transforman los textos seleccionados a los ID reales:
    frecuencia: form.frecuenciaCupon.value,
    capitalizacion: form.capitalizacion.value,
    moneda: form.moneda.value,
    periodo_gracia: form.periodoGracia.value,
    tipo_tasa: 'EFECTIVA' // puedes extenderlo luego
  };

  try {
    const res = await fetch('http://localhost:3000/api/bonos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('No se pudo registrar el bono');

    const bonoGuardado = await res.json();
    console.log('✅ Bono guardado:', bonoGuardado);

    // Mostrar flujo o continuar lógica...
  } catch (error) {
    console.error('❌ Error al guardar bono:', error);
  }
});
