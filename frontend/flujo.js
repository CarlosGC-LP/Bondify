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

    const tasaPeriodo = tasaPeriodica(TEA / 100, frecuenciaTexto);
    const nPeriodos = Math.round((360 / diasPorPeriodo) * nAnios);
    const amortizacion = VN / nPeriodos;
    let saldoInicial = VN;
    let fecha = new Date(bono.fecha_bono);
    tabla.innerHTML = "";

    // Acumuladores
    let totalIntereses = 0;
    let totalAmortizacion = 0;
    let vpFlujosTotales = 0;
    let sumaDuracion = 0;
    let sumaDuracionMod = 0;
    let sumaConvexidad = 0;

    for (let i = 1; i <= nPeriodos; i++) {
      const interes = saldoInicial * tasaPeriodo;
      const cuota = interes + amortizacion;
      const saldoFinal = saldoInicial - amortizacion;
      const flujoBonista = cuota;
      const vpFlujo = flujoBonista / Math.pow(1 + tasaPeriodo, i);

      // Indicadores
      totalIntereses += interes;
      totalAmortizacion += amortizacion;
      vpFlujosTotales += vpFlujo;
      sumaDuracion += i * vpFlujo;
      sumaDuracionMod += (i / (1 + tasaPeriodo)) * vpFlujo;
      sumaConvexidad += i * (i + 1) * vpFlujo;

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
        <td>${(-cuota).toFixed(2)}</td>
        <td>${flujoBonista.toFixed(2)}</td>
        <td>${vpFlujo.toFixed(2)}</td>
      `;
      tabla.appendChild(fila);

      saldoInicial = saldoFinal;
      fecha.setDate(fecha.getDate() + diasPorPeriodo);
    }

    const duracion = sumaDuracion / vpFlujosTotales;
    const duracionMod = sumaDuracionMod / vpFlujosTotales;
    const convexidad = sumaConvexidad / (vpFlujosTotales * Math.pow(1 + tasaPeriodo, 2));
    const tceaBonista = Math.pow(VN / VC, 1 / nPeriodos) - 1;

    // Guardar valoración
    const dataValoracion = {
      id_bono: bono.id,
      precio_actual: VC,
      utilidad_perdida: VN - VC,
      total_intereses: totalIntereses,
      total_amortizacion: totalAmortizacion,
      tcea_emisor: 0,
      tcea_bonista: tceaBonista * 100,
      duracion: duracion,
      duracion_modificada: duracionMod,
      convexidad: convexidad
    };

    const respuesta = await fetch("http://localhost:3000/api/valoraciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataValoracion)
    });

    if (respuesta.ok) {
      console.log("✅ Valoración registrada correctamente.");
    } else {
      console.error("❌ Error al registrar valoración");
    }

  } catch (err) {
    console.error("❌ Error al cargar flujo:", err);
    alert("❌ Error al generar el flujo de caja.");
  }
});
