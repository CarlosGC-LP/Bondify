document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();

  const correo = document.getElementById('correo').value;
  const contrasena = document.getElementById('contrasena').value;

  try {
    const respuesta = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });

    const data = await respuesta.json();

    if (respuesta.ok) {
      // Guardar nombre del usuario en localStorage
      localStorage.setItem('nombreUsuario', data.nombre);
      localStorage.setItem('idUsuario', data.id); 

      // Redirigir a la página de bienvenida
      window.location.href = 'bienvenido.html';
    } else {
      document.getElementById('respuesta').textContent = data.error;
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
    document.getElementById('respuesta').textContent = 'Error de conexión';
  }
});
