# Quedó Rico · Rescata lo rico

Carta digital de packs sorpresa para universitarios de Trujillo. Prototipo web pensado primero para celular.

Es un sitio sencillo: solo HTML, CSS y JavaScript. No necesita servidor ni base de datos. Las cuentas, reservas y puntos se guardan en el navegador de cada persona.

> Negocios y precios de demostración. El pago con Yape o Plin es una simulación: no se cobra dinero real.

## Cómo verlo en tu computadora

Abre `index.html` con doble clic en tu navegador. Listo.

## Cómo subirlo gratis a internet

**GitHub Pages**
1. En GitHub, entra al repositorio y ve a **Settings → Pages**.
2. En "Branch", elige la rama y la carpeta `/ (root)`, y pulsa **Save**.
3. En un par de minutos tendrás un enlace tipo `https://tu-usuario.github.io/quedo-rico-web/`. Con ese enlace puedes generar el QR para la feria.

**Netlify (alternativa)**: entra a app.netlify.com/drop y arrastra la carpeta del proyecto.

## Qué hay en cada archivo

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La página (cabecera, navegación y pie) |
| `css/estilos.css` | Colores, tipografías y diseño (celular y computadora) |
| `js/datos.js` | Negocios, packs, precios, universidades y facultades ficticios. **Edita aquí para cambiar el contenido.** |
| `js/rico.js` | El asistente Rico y sus respuestas preparadas |
| `js/app.js` | Pantallas, filtros, registro, reserva, pago simulado, cuenta y ranking |
| `logo/` | Logo original (no se modifica) |
| `referencias/` | Imágenes de referencia del diseño |

## Secciones

Inicio · Carta del día (con filtros por campus, tipo de comida, horario y precio) · Detalle del pack · Nuestros packs · Negocios aliados · Cómo funciona · Asistente Rico · Registro con correo institucional · Reserva y pago (Yape/Plin simulado) · Confirmación con código QR-0427 · Mi cuenta (insignias Novato, Héroe y Leyenda) · Ranking de rescatistas · Nuestro impacto.

Para reiniciar la demo (por ejemplo, entre visitantes de la feria): **Cuenta → Cerrar sesión y borrar datos de prueba**.
