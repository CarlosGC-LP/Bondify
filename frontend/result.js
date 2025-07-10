// Función para quitar tildes y poner en mayúsculas
function normalizarTexto(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

// Función para obtener el valor seleccionado de un grupo de botones
function getSelected(grupo) {
  const seleccionado = document.querySelector(`.button-group[data-group="${grupo}"] .selected`);
  return seleccionado ? seleccionado.textContent.trim() : null;
}

// Función para enviar el bono al servidor
async function guardarBono() {
  const idUsuario = localStorage.getItem('idUsuario');
  if (!idUsuario) {
    alert("⚠️ No hay usuario autenticado.");
    return;
  }

  // Obtener valores de inputs
  const valorNominal = parseFloat(document.querySelector('input[placeholder*="valor nominal"]').value);
  const valorComercial = parseFloat(document.querySelector('input[placeholder*="valor comercial"]').value);
  const anios = parseInt(document.querySelector('input[placeholder*="años"]').value);
  const tasaDescuento = parseFloat(document.querySelector('input[placeholder*="TAD"]').value);
  const impuestoRenta = parseFloat(document.querySelector('input[placeholder*="IR"]').value);
  const gastosIniciales = parseFloat(document.querySelector('input[placeholder*="GI"]').value);
  const fechaEmision = document.querySelector('input[type="date"]').value;
  const tasaInteres = parseFloat(document.querySelector('input[placeholder*="interés"]').value);
  const tasaEfectiva = parseFloat(document.querySelector('input[placeholder*="TAD"]').value);

  // Obtener valores seleccionados
  const frecuencia = getSelected('frecuencia');
  const diasAnioTexto = getSelected('dias');
  const capitalizacion = getSelected('capitalizacion');
  const tipoTasa = getSelected('tipo-tasa');
  const moneda = getSelected('moneda');
  const periodoGraciaTexto = getSelected('gracia');

  if (!frecuencia || !diasAnioTexto || !capitalizacion || !tipoTasa || !moneda || !periodoGraciaTexto) {
    alert("⚠️ Todos los campos deben estar seleccionados.");
    return;
  }

  // Mapas de texto a ID
  const mapaFrecuencias = {
    MENSUAL: 1,
    BIMESTRAL: 2,
    TRIMESTRAL: 3,
    SEMESTRAL: 4,
    ANUAL: 5
  };

  const mapaMonedas = {
    DÓLARES: 2,
    DOLARES: 2,
    SOLES: 1
  };

  const mapaGracia = {
    NINGUNO: 1,
    PARCIAL: 2,
    TOTAL: 3
  };

  const mapaTasa = {
    EFECTIVA: 1,
    NOMINAL: 2
  };

  const capitalizacionMap = {
    DIARIA: 1,
    QUINCENAL: 2,
    MENSUAL: 3,
    BIMESTRAL: 4,
    TRIMESTRAL: 5,
    CUATRIMESTRAL: 6,
    SEMESTRAL: 7
  };

    const datos = {
        id_usuario: parseInt(idUsuario),
        id_moneda: mapaMonedas[normalizarTexto(moneda)],
        id_tipos_tasa: mapaTasa[normalizarTexto(tipoTasa)],
        id_frecuencias: mapaFrecuencias[normalizarTexto(frecuencia)],
        id_periodos_gracia: mapaGracia[normalizarTexto(periodoGraciaTexto)],
        id_tipos_amortizacion: 1,
        id_capitalizacion: capitalizacionMap[normalizarTexto(capitalizacion)],

        valor_nominal: valorNominal,
        valor_comercial: valorComercial,
        anios: anios,
        dias_anios: parseInt(diasAnioTexto.split(" ")[0]),
        tasa_interes: tasaInteres,
        tasa_efectiva: tasaEfectiva,
        tasa_descuento: tasaEfectiva, 
        impuesto_renta: impuestoRenta,
        gastos_iniciales: gastosIniciales,
        fecha_bono: fechaEmision
    };



  try {
    const respuesta = await fetch('http://localhost:3000/api/bonos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const resultado = await respuesta.json();
    if (respuesta.ok) {
      alert('✅ Bono guardado correctamente.');
      window.location.href = 'bienvenido.html';
    } else {
      alert(`❌ Error al guardar bono: ${resultado.error}`);
    }
  } catch (err) {
    console.error('❌ Error en la solicitud:', err);
    alert('❌ No se pudo conectar con el servidor.');
  }
}

// Asociar botón con acción
document.querySelector('.submit-btn').addEventListener('click', guardarBono);
