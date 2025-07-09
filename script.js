document.getElementById('form-usuario').addEventListener('submit', async function(e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const correo = document.getElementById('correo').value;
  const contrasena = document.getElementById('contrasena').value;

  const res = await fetch('http://localhost:3000/api/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, contrasena })
  });

  const data = await res.json();
  document.getElementById('respuesta').textContent = data.mensaje || data.error;
});
