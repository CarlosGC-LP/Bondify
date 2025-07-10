// Función para obtener datos del último bono registrado
async function obtenerDatosBono() {
  const idUsuario = localStorage.getItem('idUsuario');
  if (!idUsuario) return null;

  const res = await fetch(`http://localhost:3000/api/bono-ultimo/${idUsuario}`);
  if (!res.ok) throw new Error('No se pudo obtener el bono');
  return await res.json();
}

// Cálculo de TES
function calcularTES(j, m) {
  const jDecimal = j / 100; // Conversión de porcentaje a decimal
  return Math.pow(1 + jDecimal / m, 1) - 1;
}

function sumarMeses(fecha, meses) {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
  return nuevaFecha;
}

function obtenerFrecuencia(id) {
  switch (id) {
    case 1: return 12; // mensual
    case 2: return 4;  // trimestral
    case 3: return 2;  // semestral
    case 4: return 1;  // anual
    default: return 1; // por si acaso
  }
}

function calcularFlujos(datos) {
  const FRECUENCIA_PAGOS_POR_ANIO = {
    1: 12, // Mensual
    2: 4,  // Trimestral
    3: 2,  // Semestral
    4: 1   // Anual
  };

  const FRECUENCIA_MESES = {
    1: 1,  // Mensual
    2: 3,  // Trimestral
    3: 6,  // Semestral
    4: 12  // Anual
  };

  const frecuencia = FRECUENCIA_PAGOS_POR_ANIO[datos.id_frecuencias] || 1;
  const mesesEntrePagos = FRECUENCIA_MESES[datos.id_frecuencias] || 1;

  const VN = datos.valor_nominal;
  const VC = datos.valor_comercial;
  const N = datos.anios * frecuencia;
  const TES = calcularTES(datos.tasa_nominal, frecuencia);
  const amortizacion = VN / N;

  const flujos = [];
  let saldo = VN;
  const fechaInicio = new Date(); // fecha actual

  // Periodo 0: emisión
  flujos.push({
    periodo: 0,
    fecha_pago: fechaInicio.toLocaleDateString(),
    bono_indexa: VN.toFixed(2),
    intereses: "0.00",
    amortizacion: "0.00",
    cuota: "0.00",
    flujo_emisor: (-1 * VC).toFixed(2),
    flujo_bonista: VC.toFixed(2)
  });

  // Periodos 1 hasta N
  for (let t = 1; t <= N; t++) {
    const interes = saldo * TES;
    const cuota = amortizacion + interes;
    const bonoIndexado = saldo;

    flujos.push({
      periodo: t,
      fecha_pago: sumarMeses(fechaInicio, mesesEntrePagos * t).toLocaleDateString(),
      bono_indexa: bonoIndexado.toFixed(2),
      intereses: interes.toFixed(2),
      amortizacion: amortizacion.toFixed(2),
      cuota: cuota.toFixed(2),
      flujo_emisor: (-1 * cuota).toFixed(2),
      flujo_bonista: cuota.toFixed(2)
    });

    saldo -= amortizacion;
  }

  return flujos;
}

function renderizarTabla(flujos) {
  const tbody = document.querySelector("#tablaFlujo tbody");
  tbody.innerHTML = "";

  flujos.forEach(f => {
    const fila = `
      <tr>
        <td>${f.periodo}</td>
        <td>${f.fecha_pago}</td>
        <td>${f.bono_indexa}</td>
        <td>${f.intereses}</td>
        <td>${f.amortizacion}</td>
        <td>${f.cuota}</td>
        <td>${f.flujo_emisor}</td>
        <td>${f.flujo_bonista}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", fila);
  });
}

// Cargar datos al inicio
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const datos = await obtenerDatosBono();
    if (datos) {
      const flujos = calcularFlujos(datos);
      renderizarTabla(flujos);
    } else {
      alert("No se encontró ningún bono");
    }
  } catch (err) {
    console.error("Error cargando datos del bono:", err);
  }
});
