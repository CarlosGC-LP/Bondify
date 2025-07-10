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
  return Math.pow(1 + j / m, 1) - 1;
}

function sumarMeses(fecha, meses) {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
  return nuevaFecha;
}

function calcularFlujos(datos) {
  const VN = datos.valor_nominal;
  const VC = datos.valor_comercial;
  const N = datos.anios * datos.id_frecuencias;
  const TES = calcularTES(datos.tasa_nominal, datos.id_frecuencias);
  const amortizacion = VN / N;

  const flujos = [];
  let saldo = VN;
  const fechaInicio = new Date(); // actual

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

  for (let t = 1; t <= N; t++) {
    const interes = saldo * TES;
    const cuota = amortizacion + interes;
    const bonoIndexado = saldo;

    flujos.push({
      periodo: t,
      fecha_pago: sumarMeses(fechaInicio, t * (12 / datos.id_frecuencias)).toLocaleDateString(),
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
