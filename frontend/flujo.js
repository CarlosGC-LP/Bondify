function tasaPeriodica(tea, frecuenciaTexto) {
  const frecuencias = {
    MENSUAL: 12,
    BIMESTRAL: 6,
    TRIMESTRAL: 4,
    SEMESTRAL: 2,
    ANUAL: 1
  };

  const clave = frecuenciaTexto.toUpperCase();
  if (!(clave in frecuencias)) throw new Error("Frecuencia no válida");

  const m = frecuencias[clave];
  return Math.pow(1 + tea, 1 / m) - 1;
}

document.addEventListener("DOMContentLoaded", async () => {
  const idUsuario = localStorage.getItem("idUsuario");
  if (!idUsuario) return alert("⚠️ No hay sesión activa.");

  const tabla = document.querySelector("#tablaFlujo tbody");

  try {
    const res = await fetch(`http://localhost:3000/api/bono-ultimo/${idUsuario}`);
    const bono = await res.json();
    console.log("🟡 Bono cargado:", bono);

    const frecuenciaTexto = {
      1: "MENSUAL",
      2: "BIMESTRAL",
      3: "TRIMESTRAL",
      4: "SEMESTRAL",
      5: "ANUAL"
    }[bono.id_frecuencias];

    if (!frecuenciaTexto) throw new Error("Frecuencia no reconocida");

    const diasPorPeriodo = {
      MENSUAL: 30,
      BIMESTRAL: 60,
      TRIMESTRAL: 90,
      SEMESTRAL: 180,
      ANUAL: 360
    }[frecuenciaTexto];

    const VN = bono.valor_nominal;
    const VC = bono.valor_comercial;
    const nAnios = bono.anios;
    const TEA = parseFloat(bono.tasa_interes);

    if (isNaN(TEA)) throw new Error("La tasa de interés no es válida");

    const tasaEfectiva = tasaPeriodica(TEA / 100, frecuenciaTexto);
    const nPeriodos = nAnios * (360 / diasPorPeriodo);
    const amortizacion = VN / nPeriodos;

    let saldoInicial = VN;
    let fecha = new Date(bono.fecha_bono);

    tabla.innerHTML = "";
    let vpFlujosTotales = 0;
    let total_intereses = 0;
    let total_amortizacion = 0;

    const flujos = [];

    for (let i = 1; i <= nPeriodos; i++) {
      const interes = saldoInicial * tasaEfectiva;
      const cuota = interes + amortizacion;
      const saldoFinal = saldoInicial - amortizacion;
      const flujoEmisor = -cuota;
      const flujoBonista = cuota;
      const vpFlujo = flujoBonista / Math.pow(1 + tasaEfectiva, i);

      total_intereses += interes;
      total_amortizacion += amortizacion;
      vpFlujosTotales += vpFlujo;

      flujos.push({ flujo: flujoBonista, periodo: i });

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${i}</td>
        <td>${fecha.toLocaleDateString("es-PE")}</td>
        <td>SIN GRACIA</td>
        <td>${saldoInicial.toFixed(2)}</td>
        <td>${cuota.toFixed(2)}</td>
        <td>${interes.toFixed(2)}</td>
        <td>${amortizacion.toFixed(2)}</td>
        <td>${saldoFinal.toFixed(2)}</td>
        <td>${flujoEmisor.toFixed(2)}</td>
        <td>${flujoBonista.toFixed(2)}</td>
        <td>${vpFlujo.toFixed(2)}</td>
      `;
      tabla.appendChild(fila);

      saldoInicial = saldoFinal;
      fecha.setDate(fecha.getDate() + diasPorPeriodo);
    }

    // Cálculos adicionales
    const VAN = vpFlujosTotales - VC;
    const utilidadPerdida = vpFlujosTotales - VC;
    const TCEA = (vpFlujosTotales / VC - 1) * 100;
    const TREA = TCEA;
    const TIR = ((vpFlujosTotales / VN) ** (1 / nPeriodos) - 1) * 100;

    let duracion = 0;
    let duracionMod = 0;
    let convexidad = 0;

    const denominador = vpFlujosTotales;
    flujos.forEach(({ flujo, periodo }) => {
      const vp = flujo / Math.pow(1 + tasaEfectiva, periodo);
      duracion += periodo * vp;
      convexidad += periodo * (periodo + 1) * vp;
    });

    duracion = duracion / denominador;
    duracionMod = duracion / (1 + tasaEfectiva);
    convexidad = convexidad / (denominador * Math.pow(1 + tasaEfectiva, 2));

    // Mostrar resultados
    const contenedorResultados = document.createElement("div");
    contenedorResultados.innerHTML = `
      <h3>Resultados Obtenidos</h3>
      <p>TCEA (Emisor): ${TCEA.toFixed(4)}%</p>
      <p>TREA (Inversionista): ${TREA.toFixed(4)}%</p>
      <p>TIR: ${TIR.toFixed(4)}%</p>
      <p>VAN: ${VAN.toFixed(2)}</p>
      <p>Duración: ${duracion.toFixed(4)}</p>
      <p>Duración Modificada: ${duracionMod.toFixed(4)}</p>
      <p>Convexidad: ${convexidad.toFixed(4)}</p>
      <p>Precio Máximo: ${(VC + utilidadPerdida).toFixed(2)}</p>
    `;
    document.querySelector(".container").appendChild(contenedorResultados);

    // Guardar en BD
    await guardarValoracion({
      id_bono: bono.id,
      precio_actual: VC,
      utilidad_perdida: utilidadPerdida,
      total_intereses,
      total_amortizacion,
      tcea_emisor: TCEA,
      tcea_bonista: TREA,
      duracion,
      duracion_modificada: duracionMod,
      convexidad
    });

  } catch (err) {
    console.error("❌ Error al cargar flujo:", err);
    alert("❌ Error al generar el flujo de caja.");
  }
});

// Función para guardar valoración
async function guardarValoracion({
  id_bono,
  precio_actual,
  utilidad_perdida,
  total_intereses,
  total_amortizacion,
  tcea_emisor,
  tcea_bonista,
  duracion,
  duracion_modificada,
  convexidad
}) {
  try {
    const respuesta = await fetch("http://localhost:3000/api/valoraciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_bono,
        precio_actual,
        utilidad_perdida,
        total_intereses,
        total_amortizacion,
        tcea_emisor,
        tcea_bonista,
        duracion,
        duracion_modificada,
        convexidad
      })
    });

    const data = await respuesta.json();
    if (!respuesta.ok) {
      console.error("❌ Error al guardar valoración:", data.error);
      alert("❌ No se pudo guardar la valoración.");
    } else {
      console.log("✅ Valoración guardada correctamente.");
    }
  } catch (err) {
    console.error("❌ Error al enviar valoración:", err);
  }
}
