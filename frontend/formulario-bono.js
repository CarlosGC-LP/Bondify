document.getElementById('bonoForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const idUsuario = localStorage.getItem('idUsuario');
  if (!idUsuario) return alert('Usuario no autenticado');

  const valorNominal = parseFloat(form.valorNominal.value);
  const valorComercial = parseFloat(form.valorComercial.value);
  const anios = parseInt(form.anios.value);
  const frecuencia = form.frecuenciaCupon.value;
  const diasAnio = parseInt(form.diasAnio.value);
  const capitalizacion = form.capitalizacion.value;
  const tasaInteres = parseFloat(form.tasaInteres.value);
  const tasaDescuento = parseFloat(form.tasaDescuento.value);
  const impuestoRenta = parseFloat(form.impuestoRenta.value);
  const moneda = form.moneda.value;
  const periodoGracia = form.periodoGracia.value;
  const gastosIniciales = parseFloat(form.gastosIniciales.value);
  const fechaEmision = form.fechaEmision.value;

  // Mapear valores string a IDs según tus tablas en la base de datos
  const mapaFrecuencias = {
    MENSUAL: 1, BIMESTRAL: 2, TRIMESTRAL: 3, SEMESTRAL: 4, ANUAL: 5
  };

  const mapaCapitalizaciones = {
    MENSUAL: 3, BIMESTRAL: 4, TRIMESTRAL: 5, CUATRIMESTRAL: 6, SEMESTRAL: 7
  };

  const mapaMonedas = {
    PEN: 1, USD: 2
  };

  const mapaPeriodosGracia = {
    NINGUNO: 1, PARCIAL: 2, TOTAL: 3
  };

  const datos = {
    id_usuario: parseInt(idUsuario),
    id_frecuencias: mapaFrecuencias[frecuencia],
    id_capitalizacion: mapaCapitalizaciones[capitalizacion],
    id_moneda: mapaMonedas[moneda],
    id_tipos_tasa: 2, // puedes dejarlo fijo por ahora (2 = NOMINAL según tus inserts)
    id_periodos_gracia: mapaPeriodosGracia[periodoGracia],
    valor_nominal: valorNominal,
    valor_comercial: valorComercial,
    anios: anios,
    dias_anios: diasAnio,
    tasa_interes: tasaInteres,
    tasa_descuento: tasaDescuento,
    impuesto_renta: impuestoRenta,
    gastos_iniciales: gastosIniciales,
    fecha_bono: fechaEmision
  };

  try {
    const res = await fetch('http://localhost:3000/api/bonos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const resultado = await res.json();
    if (res.ok) {
      alert('✅ Bono guardado correctamente');
      // Aquí puedes activar el cálculo de flujo, mostrar secciones, etc.
      document.getElementById('flujoSection').style.display = 'block';
    } else {
      alert(`❌ Error al guardar bono: ${resultado.error}`);
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
    alert('❌ Error al conectarse con el servidor');
  }
});
