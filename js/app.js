// Quedó Rico · lógica de la app (sin servidores: todo se guarda en el navegador).

/* ---------- Estado guardado en este navegador ---------- */
const CLAVE = 'quedoRico.v1';

function cargarEstado() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; }
}
function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* modo privado: seguimos en memoria */ }
}

const estado = Object.assign(
  { usuario: null, reservas: [], vendidos: {}, siguiente: 427, campus: 'centro' },
  cargarEstado()
);

const filtros = { tipo: 'todos', horario: 'todos', precio: 'todos' };
let pestanaRanking = 'universidades';

/* ---------- Ayudantes ---------- */
const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');

function esc(t) {
  return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function miles(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
const soles = n => 'S/ ' + miles(n);
const buscarPack = id => PACKS.find(p => p.id === id);
const quedan = p => Math.max(0, p.unidades - (estado.vendidos[p.id] || 0));
const campusActual = () => CAMPUS.find(c => c.id === estado.campus) || CAMPUS[0];

function distancia(p) {
  const m = p.distancia[estado.campus];
  return m >= 1000 ? (m / 1000).toFixed(1).replace('.', ',') + ' km' : m + ' m';
}
function horaInicio(p) { return p.recojo.split('–')[0].trim() + (p.inicio >= 12 ? ' p. m.' : ' a. m.'); }

function bolsa(extra = '') {
  return `<svg class="bolsa" aria-hidden="true" ${extra}><use href="#i-bolsa"/></svg>`;
}
function imagenPack(p, clase = '') {
  return `<span class="pack-img ${clase}" style="--c:${p.color}">${bolsa()}<span>${esc(p.tipo)}</span></span>`;
}

function misPacks() { return estado.reservas.length; }
function misPuntos() { return misPacks() * PUNTOS_POR_PACK; }
function miAhorro() {
  return estado.reservas.reduce((s, r) => { const p = buscarPack(r.packId); return s + (p ? p.valor - p.precio : 0); }, 0);
}
function insigniaActual() {
  return [...INSIGNIAS].reverse().find(i => misPacks() >= i.meta);
}

function aviso(texto) {
  const t = $('#toast');
  t.textContent = texto;
  t.classList.add('visible');
  clearTimeout(aviso.t);
  aviso.t = setTimeout(() => t.classList.remove('visible'), 2600);
}

function contarHasta(el, final, formato) {
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducido) { el.textContent = formato(final); return; }
  const inicio = performance.now(), dur = 900;
  const paso = ahora => {
    const k = Math.min(1, (ahora - inicio) / dur);
    el.textContent = formato(final * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

function impacto() {
  return {
    packs: IMPACTO_BASE.packs + misPacks(),
    kilos: IMPACTO_BASE.kilos + misPacks() * KILOS_POR_PACK,
    soles: IMPACTO_BASE.soles + miAhorro()
  };
}

function tarjetasImpacto() {
  const i = impacto();
  return `<div class="impacto-grid">
    <div class="stat"><strong data-contar="${i.packs}" data-formato="num">${miles(i.packs)}</strong><span>packs rescatados</span></div>
    <div class="stat"><strong data-contar="${i.kilos}" data-formato="kg">${miles(i.kilos)} kg</strong><span>comida salvada</span></div>
    <div class="stat"><strong data-contar="${i.soles}" data-formato="soles">${soles(i.soles)}</strong><span>ahorrados</span></div>
  </div>`;
}

const mensajesObligatorios = `
  <ul class="avisos">
    <li><strong>Es sorpresa:</strong> el contenido puede variar, pero siempre se respeta el valor mínimo.</li>
    <li><strong>Recoge a tiempo:</strong> el pack se entrega solo dentro del horario indicado.</li>
    <li><strong>Productos del día:</strong> consúmelos el mismo día.</li>
  </ul>`;

/* ---------- Tarjeta de pack ---------- */
function etiquetaStock(p) {
  const q = quedan(p);
  if (q <= 0) return '<span class="etiqueta gris">Agotado</span>';
  if (q <= 3) return `<span class="etiqueta naranja">¡Queda${q === 1 ? '' : 'n'} ${q}!</span>`;
  return `<span class="etiqueta verde">Quedan ${q}</span>`;
}
function botonReservar(p, chico = false) {
  return quedan(p) > 0
    ? `<a class="btn btn-naranja ${chico ? 'btn-chico' : ''}" href="#reserva/${p.id}">Reservar</a>`
    : `<span class="btn btn-apagado ${chico ? 'btn-chico' : ''}" aria-disabled="true">Agotado</span>`;
}

function tarjetaPack(p) {
  const agotado = quedan(p) <= 0;
  return `<article class="pack ${agotado ? 'agotado' : ''}">
    <a href="#detalle/${p.id}" class="pack-img-link" aria-label="Ver detalle de ${esc(p.pack)}">${imagenPack(p)}</a>
    <div class="pack-info">
      <div class="pack-top">
        <h3><a href="#detalle/${p.id}">${esc(p.pack)}</a></h3>
        ${etiquetaStock(p)}
      </div>
      <p class="pack-negocio">${esc(p.negocio)}</p>
      <p class="pack-contenido">${esc(p.contenido)}</p>
      <p class="pack-meta">Recojo ${esc(horaInicio(p))} · ${distancia(p)}</p>
      <div class="pack-pie">
        <span class="precios"><s aria-label="Valor real ${p.valor} soles">S/ ${p.valor}</s><strong>S/ ${p.precio}</strong></span>
        ${botonReservar(p)}
      </div>
    </div>
  </article>`;
}

function tarjetaMini(p) {
  return `<article class="pack-mini ${quedan(p) <= 0 ? 'agotado' : ''}">
    <a href="#detalle/${p.id}" class="pack-img-link" aria-label="Ver ${esc(p.pack)}">${imagenPack(p, 'chica')}</a>
    <div>
      <h4>${esc(p.pack)}</h4>
      <p>${esc(p.corto)} · ${esc(horaInicio(p))}</p>
      <div class="pack-pie"><strong class="precio">S/ ${p.precio}</strong>${botonReservar(p, true)}</div>
    </div>
  </article>`;
}

/* ---------- Selector de campus ---------- */
function selectorCampus() {
  return `<label class="select-campus">
    <span class="sr">Elige tu campus</span>
    <select data-cambiar="campus">
      ${CAMPUS.map(c => `<option value="${c.id}" ${c.id === estado.campus ? 'selected' : ''}>${c.nombre}</option>`).join('')}
    </select>
  </label>`;
}

/* ---------- Vistas ---------- */
const vistas = {};

vistas.inicio = {
  nav: 'inicio',
  html() {
    const disponibles = PACKS.filter(p => quedan(p) > 0);
    const unidades = disponibles.reduce((s, p) => s + quedan(p), 0);
    const desde = Math.min(...disponibles.map(p => p.precio));
    const u = estado.usuario;
    return `<section class="contenedor hero">
      <div class="hero-texto">
        <p class="antetitulo">${u ? `¡Hola, ${esc(u.nombre.split(' ')[0])}!` : 'Packs sorpresa para universitarios'}</p>
        <h1 class="titulo-hero">Rescata<br><span>lo rico</span></h1>
        <p class="hero-bajada">Comida rica de negocios cerca de tu campus, a menos de la mitad de precio. Reserva, paga con Yape o Plin y recoge tu bolsa.</p>
        <a href="#carta" class="btn btn-naranja btn-grande">Ver la carta de hoy</a>
        <a href="#rico" class="btn-rico-texto">${bolsa('style="--bolsa-cuerpo:#E07B1A;--bolsa-hoja:#E07B1A;--bolsa-cara:#F6EEDF"')}<span>¿No sabes qué pedir? <strong>Pregúntale a Rico</strong></span></a>
      </div>
      <div class="hero-lado">
        <h2 class="subtitulo">Nuestro impacto</h2>
        ${tarjetasImpacto()}
        <a href="#carta" class="tarjeta-campus">
          <div>
            <h2>Hoy en tu campus</h2>
            <p>${PACKS.length} negocios aliados · ${unidades} packs disponibles desde S/ ${desde}</p>
            <span class="campus-actual">${campusActual().nombre}</span>
          </div>
          ${bolsa('style="--bolsa-cuerpo:#C99A63;--bolsa-cara:#E07B1A;--bolsa-hoja:#5BA36B"')}
        </a>
      </div>
    </section>

    <section class="contenedor bloque">
      <h2 class="subtitulo">Descubre más</h2>
      <div class="accesos">
        <a href="#packs" class="acceso"><strong>Nuestros packs</strong><span>Los 9 tipos de bolsa sorpresa</span></a>
        <a href="#negocios" class="acceso"><strong>Negocios aliados</strong><span>Quiénes rescatan contigo</span></a>
        <a href="#como" class="acceso"><strong>Cómo funciona</strong><span>5 pasos y listo</span></a>
        <a href="#impacto" class="acceso"><strong>Nuestro impacto</strong><span>Lo que salvamos juntos</span></a>
      </div>
    </section>

    <section class="contenedor bloque">
      <div class="fila-titulo"><h2 class="subtitulo">Lo más rico de hoy</h2><a href="#carta" class="link">Ver todo</a></div>
      <div class="carrusel">${disponibles.slice(0, 4).map(tarjetaMini).join('')}</div>
    </section>`;
  }
};

vistas.carta = {
  nav: 'carta',
  html() {
    const chip = (grupo, valor, texto) =>
      `<button class="chip ${filtros[grupo] === valor ? 'activo' : ''}" data-filtro="${grupo}" data-valor="${valor}" aria-pressed="${filtros[grupo] === valor}">${texto}</button>`;
    return `<section class="contenedor">
      <div class="fila-titulo carta-titulo">
        <h1 class="titulo">Carta de hoy</h1>
        ${selectorCampus()}
      </div>
      <div class="filtros" role="group" aria-label="Tipo de comida">
        ${chip('tipo', 'todos', 'Todos')}${chip('tipo', 'dulce', 'Dulce')}${chip('tipo', 'salado', 'Salado')}${chip('tipo', 'menu', 'Menú')}
      </div>
      <div class="filtros" role="group" aria-label="Horario y precio">
        ${chip('horario', 'tarde', 'Tarde (hasta 7 p. m.)')}${chip('horario', 'noche', 'Noche')}
        ${chip('precio', '6', 'Hasta S/ 6')}${chip('precio', '8', 'Hasta S/ 8')}
      </div>
      <div id="lista-carta" class="lista-packs">${listaCarta()}</div>
      <p class="nota">Precios de demostración. Las distancias se calculan desde el ${campusActual().nombre}.</p>
    </section>`;
  }
};

function listaCarta() {
  let lista = PACKS.filter(p => {
    if (filtros.tipo !== 'todos' && !p.categorias.includes(filtros.tipo)) return false;
    if (filtros.horario === 'tarde' && p.inicio >= 19) return false;
    if (filtros.horario === 'noche' && p.inicio < 19) return false;
    if (filtros.precio !== 'todos' && p.precio > Number(filtros.precio)) return false;
    return true;
  });
  // Primero los disponibles, ordenados por hora de recojo; los agotados al final.
  lista.sort((a, b) => (quedan(b) > 0) - (quedan(a) > 0) || a.inicio - b.inicio);
  if (!lista.length) {
    return `<div class="vacio">${bolsa()}<p>Uy, con esos filtros no hay packs hoy. Prueba con otro o <a href="#rico" class="link">pregúntale a Rico</a>.</p>
      <button class="btn btn-borde" data-accion="limpiar-filtros">Ver todos</button></div>`;
  }
  return lista.map(tarjetaPack).join('');
}

vistas.detalle = {
  nav: 'carta',
  html(id) {
    const p = buscarPack(id);
    if (!p) return noEncontrado();
    const q = quedan(p);
    return `<section class="contenedor detalle">
      <a href="#carta" class="volver"><svg><use href="#i-volver"/></svg> Volver a la carta</a>
      <div class="detalle-grid">
        ${imagenPack(p, 'grande')}
        <div>
          <div class="pack-top"><h1 class="titulo">${esc(p.pack)}</h1>${etiquetaStock(p)}</div>
          <p class="pack-negocio grande">${esc(p.negocio)}</p>
          <div class="precios grande"><s>S/ ${p.valor}</s><strong>S/ ${p.precio}</strong><span class="ahorro">Ahorras S/ ${p.valor - p.precio}</span></div>
          <dl class="datos">
            <div><dt>Contenido típico</dt><dd>${esc(p.contenido)}</dd></div>
            <div><dt>Recojo hoy</dt><dd>${esc(p.recojo)}</dd></div>
            <div><dt>Dirección</dt><dd>${esc(p.direccion)}, ${esc(p.zona)} · a ${distancia(p)} del ${campusActual().nombre}</dd></div>
            <div><dt>Unidades</dt><dd>${q > 0 ? `Quedan ${q} de ${p.unidades}` : 'Hoy ya se rescataron todas'}</dd></div>
          </dl>
          ${mensajesObligatorios}
          <div class="acciones">
            ${quedan(p) > 0 ? `<a class="btn btn-naranja btn-grande" href="#reserva/${p.id}">Reservar por S/ ${p.precio}</a>` : '<span class="btn btn-apagado btn-grande">Agotado por hoy</span>'}
            <a class="btn btn-borde" href="#rico">Pregúntale a Rico</a>
          </div>
        </div>
      </div>
    </section>`;
  }
};

vistas.packs = {
  nav: 'packs',
  html() {
    return `<section class="contenedor">
      <h1 class="titulo">Nuestros packs</h1>
      <p class="intro">Nueve bolsas sorpresa, una por cada negocio aliado. Nunca sabes exactamente qué trae, pero siempre vale más de lo que pagas.</p>
      <div class="vitrina">
        ${PACKS.map(p => `<a href="#detalle/${p.id}" class="vitrina-item">
          ${imagenPack(p)}
          <h3>${esc(p.pack)}</h3>
          <p>${esc(p.contenido)}</p>
          <p class="vitrina-precio"><s>S/ ${p.valor}</s> <strong>S/ ${p.precio}</strong></p>
        </a>`).join('')}
      </div>
      ${mensajesObligatorios}
    </section>`;
  }
};

vistas.negocios = {
  nav: 'negocios',
  html() {
    return `<section class="contenedor">
      <h1 class="titulo">Negocios aliados</h1>
      <p class="intro">Locales cerca de tu campus que prefieren rescatar su comida antes que botarla.</p>
      <div class="galeria">
        ${PACKS.map(p => {
          const q = quedan(p);
          return `<article class="negocio">
            <div class="negocio-portada" style="--c:${p.color}">${bolsa()}<span class="negocio-rubro">${esc(p.rubro)}</span></div>
            <div class="negocio-info">
              <h3>${esc(p.negocio)}</h3>
              <p class="negocio-zona"><svg><use href="#i-pin"/></svg> Zona ${esc(p.zona)} · ${distancia(p)}</p>
              <p class="negocio-hoy">Hoy: <strong>${esc(p.pack)}</strong> a S/ ${p.precio} · ${q > 0 ? `${q} disponible${q === 1 ? '' : 's'}` : 'agotado'}</p>
              <a href="#detalle/${p.id}" class="link">Ver pack</a>
            </div>
          </article>`;
        }).join('')}
      </div>
      <p class="nota">Negocios ficticios de demostración.</p>
    </section>`;
  }
};

vistas.como = {
  nav: 'como',
  html() {
    const pasos = [
      ['Regístrate', 'Con tu correo institucional. Solo para universitarios.'],
      ['Elige', 'Mira la carta de hoy o pídele una recomendación a Rico.'],
      ['Reserva y paga', 'Toca "Reservar" y paga con Yape o Plin en segundos.'],
      ['Recoge', 'Ve al local en el horario indicado y muestra tu código.'],
      ['Suma puntos', '+10 puntos para tu universidad y desbloquea insignias.']
    ];
    return `<section class="contenedor">
      <h1 class="titulo">Cómo funciona</h1>
      <p class="intro">Menos de dos minutos entre clase y clase. Así de fácil:</p>
      <ol class="pasos">
        ${pasos.map((p, i) => `<li><span class="paso-num">${i + 1}</span><div><h3>${p[0]}</h3><p>${p[1]}</p></div></li>`).join('')}
      </ol>
      <div class="sello">
        <img src="logo/QuedoRico_sticker_sello.png" alt="Sello de la bolsa Quedó Rico con la información del pack, el código de reserva y el impacto" loading="lazy">
        <p>Tu bolsa llega con este sello: ahí ves el negocio, lo que pagaste y tu código.</p>
      </div>
      <h2 class="subtitulo">Lo que tienes que saber</h2>
      ${mensajesObligatorios}
      <ul class="avisos">
        <li><strong>Sin delivery:</strong> tú recoges en el local, por eso sale tan barato.</li>
        <li><strong>Pago de prueba:</strong> en este prototipo el pago es una simulación, no se cobra dinero real.</li>
      </ul>
      <a href="${estado.usuario ? '#carta' : '#registro'}" class="btn btn-naranja btn-grande">${estado.usuario ? 'Ver la carta de hoy' : 'Regístrate gratis'}</a>
    </section>`;
  }
};

vistas.registro = {
  nav: 'cuenta',
  html(packId) {
    if (estado.usuario) return vistas.cuenta.html();
    return `<section class="contenedor angosto">
      <h1 class="titulo">Únete a los rescatistas</h1>
      <p class="intro">${packId ? 'Antes de reservar, crea tu cuenta. Es rapidito.' : 'Crea tu cuenta para reservar, sumar puntos y desbloquear insignias.'}</p>
      ${formularioRegistro(packId)}
    </section>`;
  }
};

function formularioRegistro(packId = '') {
  const opciones = lista => lista.map(x => `<option>${esc(x.nombre)}</option>`).join('');
  return `<form class="formulario" data-form="registro" data-pack="${esc(packId || '')}" novalidate>
    <label>Tu nombre<input name="nombre" autocomplete="given-name" required maxlength="40" placeholder="Ej.: Camila"></label>
    <label>Correo institucional<input name="correo" type="email" autocomplete="email" required placeholder="tunombre@universidad.edu.pe"></label>
    <p class="ayuda">Solo correos de universidad (terminan en <strong>.edu.pe</strong> o <strong>.edu</strong>).</p>
    <label>Universidad<select name="universidad" required><option value="">Elige tu universidad</option>${opciones(UNIVERSIDADES)}</select></label>
    <label>Facultad<select name="facultad" required><option value="">Elige tu facultad</option>${opciones(FACULTADES)}</select></label>
    <p class="error" id="error-registro" role="alert"></p>
    <button class="btn btn-naranja btn-grande" type="submit">${packId ? 'Crear cuenta y seguir' : 'Crear mi cuenta'}</button>
    <p class="ayuda centrado">Es un prototipo: tus datos se guardan solo en este celular.</p>
  </form>`;
}

vistas.reserva = {
  nav: 'carta',
  requiereUsuario: true,
  html(id) {
    const p = buscarPack(id);
    if (!p) return noEncontrado();
    if (quedan(p) <= 0) {
      return `<section class="contenedor angosto"><div class="vacio">${bolsa()}<p>¡Uy! Alguien fue más rápido y el ${esc(p.pack)} se agotó.</p><a class="btn btn-naranja" href="#carta">Ver otros packs</a></div></section>`;
    }
    return `<section class="contenedor angosto">
      <a href="#detalle/${p.id}" class="volver"><svg><use href="#i-volver"/></svg> Volver</a>
      <h1 class="titulo">Revisa tu reserva</h1>
      <div class="resumen">
        <div class="resumen-cabeza">${imagenPack(p, 'chica')}<div><h2>${esc(p.pack)}</h2><p class="pack-negocio">${esc(p.negocio)}</p></div></div>
        <dl class="datos">
          <div><dt>Recojo hoy</dt><dd>${esc(p.recojo)}</dd></div>
          <div><dt>Dirección</dt><dd>${esc(p.direccion)} · a ${distancia(p)} del campus</dd></div>
          <div><dt>Valor real</dt><dd><s>S/ ${p.valor}</s></dd></div>
          <div class="total"><dt>Pagas</dt><dd>S/ ${p.precio}</dd></div>
        </dl>
        <p class="ahorro-linea">Te ahorras S/ ${p.valor - p.precio} y rescatas comida. ¡Bien ahí!</p>
      </div>
      ${mensajesObligatorios}
      <form data-form="pago" data-pack="${p.id}">
        <fieldset class="metodos">
          <legend class="subtitulo">¿Con qué pagas?</legend>
          <label class="metodo"><input type="radio" name="metodo" value="Yape" checked><span><strong>Yape</strong><small>Paga con tu celular</small></span></label>
          <label class="metodo"><input type="radio" name="metodo" value="Plin"><span><strong>Plin</strong><small>Paga con tu celular</small></span></label>
        </fieldset>
        <p class="simulacion">Pago simulado: es un prototipo, <strong>no se cobra dinero real</strong>.</p>
        <button class="btn btn-naranja btn-grande" type="submit">Pagar S/ ${p.precio}</button>
      </form>
    </section>`;
  }
};

vistas.confirmacion = {
  nav: 'cuenta',
  html(codigo) {
    const r = estado.reservas.find(x => x.codigo === codigo);
    const p = r && buscarPack(r.packId);
    if (!p) return noEncontrado();
    const nueva = r.insigniaNueva ? INSIGNIAS.find(i => i.id === r.insigniaNueva) : null;
    return `<section class="confirmacion">
      <span class="punto p1"></span><span class="punto p2"></span><span class="punto p3"></span><span class="punto p4"></span>
      <div class="contenedor angosto centrado">
        <div class="check"><svg><use href="#i-check"/></svg></div>
        <h1>¡Pack reservado!</h1>
        <p class="conf-sub">Te esperamos en ${esc(p.corto)}</p>
        <div class="ticket">
          <p class="ticket-label">Tu código de reserva</p>
          <p class="codigo">${esc(r.codigo)}</p>
          <div class="qr">${qrSvg(r.codigo)}</div>
          <div class="ticket-datos">
            <p><strong>${esc(p.pack)} · S/ ${p.precio}</strong></p>
            <p>Recojo hoy de ${esc(p.recojo)}</p>
            <p>${esc(p.direccion)} · a ${distancia(p)} del campus</p>
            <p class="ayuda">Pagado con ${esc(r.metodo)} (simulación)</p>
          </div>
          <p class="puntos-uni">+${PUNTOS_POR_PACK} puntos para tu universidad</p>
          ${nueva ? `<p class="insignia-nueva">¡Desbloqueaste la insignia <strong>${nueva.nombre}</strong>!</p>` : ''}
        </div>
        <a href="#cuenta" class="btn btn-naranja btn-grande">Ver mi reserva</a>
        <p class="conf-nota">Muestra este código en el local</p>
        <a href="#carta" class="link claro">Seguir rescatando</a>
      </div>
    </section>`;
  }
};

vistas.cuenta = {
  nav: 'cuenta',
  html() {
    const u = estado.usuario;
    if (!u) return vistas.registro.html();
    const activas = estado.reservas.filter(r => r.estado === 'activa');
    const historial = estado.reservas.filter(r => r.estado !== 'activa');
    const n = misPacks();
    const fila = r => {
      const p = buscarPack(r.packId);
      return p ? `<li class="reserva">
        ${imagenPack(p, 'chica')}
        <div class="reserva-info">
          <p class="codigo-chico">${esc(r.codigo)}</p>
          <p><strong>${esc(p.pack)}</strong> · ${esc(p.corto)}</p>
          <p class="pack-meta">${r.estado === 'activa' ? `Recojo ${esc(p.recojo)} · ${esc(p.direccion)}` : `Recogido · ahorraste S/ ${p.valor - p.precio}`}</p>
          ${r.estado === 'activa' ? `<div class="reserva-acciones"><a class="link" href="#confirmacion/${esc(r.codigo)}">Ver código QR</a><button class="link" data-accion="recoger" data-codigo="${esc(r.codigo)}">Ya lo recogí</button></div>` : ''}
        </div>
      </li>` : '';
    };
    return `<section class="contenedor">
      <div class="perfil">
        <span class="avatar">${esc(u.nombre.charAt(0).toUpperCase())}</span>
        <div>
          <h1 class="titulo">${esc(u.nombre)}</h1>
          <p>${esc(u.facultad)} · ${esc(u.universidad)}</p>
          <p class="ayuda">${esc(u.correo)}</p>
        </div>
      </div>
      <div class="impacto-grid">
        <div class="stat"><strong>${misPuntos()}</strong><span>puntos</span></div>
        <div class="stat"><strong>${n}</strong><span>packs rescatados</span></div>
        <div class="stat"><strong>S/ ${miAhorro()}</strong><span>ahorrados</span></div>
      </div>
      <p class="frase">${n ? `Ya rescataste ${n} pack${n === 1 ? '' : 's'}. ¡Tu universidad te lo agradece!` : 'Todavía no rescatas tu primer pack. ¡Hoy es el día!'}</p>

      <h2 class="subtitulo">Tus insignias</h2>
      <div class="insignias">
        ${INSIGNIAS.map(i => {
          const ok = n >= i.meta;
          return `<div class="insignia ${ok ? 'ganada' : ''}">
            <span class="insignia-icono"><svg><use href="#${ok ? 'i-hoja' : 'i-candado'}"/></svg></span>
            <strong>${i.nombre}</strong>
            <small>${ok ? i.texto : `${Math.min(n, i.meta)}/${i.meta} packs`}</small>
            <span class="barra"><span style="width:${Math.min(100, n / i.meta * 100)}%"></span></span>
          </div>`;
        }).join('')}
      </div>

      <h2 class="subtitulo">Reservas activas</h2>
      ${activas.length ? `<ul class="reservas">${activas.map(fila).join('')}</ul>` : '<p class="nota">No tienes reservas activas. <a class="link" href="#carta">Mira la carta de hoy</a>.</p>'}

      <h2 class="subtitulo">Historial</h2>
      ${historial.length ? `<ul class="reservas">${historial.map(fila).join('')}</ul>` : '<p class="nota">Aquí aparecerán los packs que ya recogiste.</p>'}

      <button class="btn btn-borde" data-accion="salir">Cerrar sesión y borrar datos de prueba</button>
    </section>`;
  }
};

vistas.ranking = {
  nav: 'ranking',
  html() {
    const u = estado.usuario;
    const base = pestanaRanking === 'universidades' ? UNIVERSIDADES : FACULTADES;
    const mia = u ? (pestanaRanking === 'universidades' ? u.universidad : u.facultad) : null;
    const lista = base
      .map(x => ({ nombre: x.nombre, puntos: x.puntos + (x.nombre === mia ? misPuntos() : 0), mia: x.nombre === mia }))
      .sort((a, b) => b.puntos - a.puntos);
    const [primero, segundo, tercero] = lista;
    const podio = (x, pos) => `<div class="podio-col pos${pos} ${x.mia ? 'mia' : ''}">
      <span class="podio-num">${pos}</span>
      <div class="podio-bloque"><span>${esc(x.nombre)}</span><strong>${x.puntos} pts</strong></div>
    </div>`;
    const tab = (id, texto) => `<button class="tab ${pestanaRanking === id ? 'activo' : ''}" data-accion="tab-ranking" data-valor="${id}" aria-pressed="${pestanaRanking === id}">${texto}</button>`;
    const r = RESCATISTA_DEL_MES;
    return `<section class="contenedor angosto">
      <h1 class="titulo">Ranking de rescatistas</h1>
      <div class="tabs">${tab('universidades', 'Universidades')}${tab('facultades', 'Facultades')}</div>
      <div class="podio">${podio(segundo, 2)}${podio(primero, 1)}${podio(tercero, 3)}</div>
      <ol class="ranking-lista" start="4">
        ${lista.slice(3).map((x, i) => `<li class="${x.mia ? 'mia' : ''}"><span class="rk-pos">${i + 4}</span><span class="rk-nombre">${esc(x.nombre)}${x.mia ? ' <em>(la tuya)</em>' : ''}</span><strong>${x.puntos} pts</strong></li>`).join('')}
      </ol>
      ${mia ? `<p class="nota">Cada pack que rescatas suma ${PUNTOS_POR_PACK} puntos a ${esc(mia)}.</p>` : '<p class="nota"><a class="link" href="#registro">Regístrate</a> y haz subir a tu universidad.</p>'}
      <div class="rescatista">
        <span class="avatar">${r.nombre.charAt(0)}</span>
        <div>
          <p class="rescatista-label">Rescatista del mes</p>
          <h2>${r.nombre}, ${r.facultad}</h2>
          <p>${r.packs} packs · Insignia ${r.insignia}</p>
        </div>
      </div>
    </section>`;
  }
};

vistas.impacto = {
  nav: 'impacto',
  html() {
    const n = misPacks();
    return `<section class="contenedor">
      <h1 class="titulo">Nuestro impacto</h1>
      <p class="intro">Cada bolsa que rescatas es comida rica que no termina en la basura. Esto llevamos juntos:</p>
      ${tarjetasImpacto()}
      <div class="impacto-explica">
        <div><svg><use href="#i-hoja"/></svg><p>Cada pack salva alrededor de <strong>${String(KILOS_POR_PACK).replace('.', ',')} kg</strong> de comida.</p></div>
        <div><svg><use href="#i-ranking"/></svg><p>Cada pack suma <strong>${PUNTOS_POR_PACK} puntos</strong> a tu universidad.</p></div>
        <div><svg><use href="#i-carta"/></svg><p>Pagas <strong>menos de la mitad</strong> del valor real.</p></div>
      </div>
      ${estado.usuario ? `<div class="tarjeta-verde">
        <h2>Tu impacto</h2>
        <p>${n} pack${n === 1 ? '' : 's'} rescatado${n === 1 ? '' : 's'} · ${String(n * KILOS_POR_PACK).replace('.', ',')} kg salvados · S/ ${miAhorro()} ahorrados</p>
      </div>` : `<div class="tarjeta-verde"><h2>Súmate al rescate</h2><p>Regístrate con tu correo institucional y empieza a contar tu propio impacto.</p><a class="btn btn-naranja" href="#registro">Crear mi cuenta</a></div>`}
      <p class="nota">Cifras de demostración.</p>
    </section>`;
  }
};

vistas.rico = {
  nav: 'rico',
  html() {
    return `<section class="rico-vista">
      <div class="rico-cabeza">
        <span class="rico-avatar">${bolsa('style="--bolsa-cara:#1F5C3F;--bolsa-hoja:#F6EEDF"')}</span>
        <div><h1>Rico</h1><p>Tu asistente de packs · en línea</p></div>
      </div>
      <div class="contenedor angosto rico-cuerpo">
        <div class="chat" id="chat" aria-live="polite"></div>
        <form class="chat-form" data-form="chat">
          <label class="sr" for="chat-texto">Escribe tu antojo</label>
          <input id="chat-texto" name="texto" autocomplete="off" placeholder="Escribe tu antojo…" maxlength="120">
          <button class="chat-enviar" type="submit" aria-label="Enviar"><svg><use href="#i-enviar"/></svg></button>
        </form>
      </div>
    </section>`;
  },
  montar() { pintarChat(); }
};

function noEncontrado() {
  return `<section class="contenedor angosto"><div class="vacio">${bolsa()}<p>Esta página se nos perdió. ¡Pero la comida rica sigue aquí!</p><a class="btn btn-naranja" href="#carta">Ver la carta de hoy</a></div></section>`;
}

/* ---------- Chat de Rico ---------- */
function pintarChat() {
  const chat = $('#chat');
  if (!chat) return;
  const ultimo = Rico.mensajes[Rico.mensajes.length - 1];
  chat.innerHTML = Rico.mensajes.map(m => `
    <div class="burbuja ${m.de}">${esc(m.texto)}</div>
    ${m.packs && m.packs.length ? `<div class="chat-packs">${m.packs.map(id => tarjetaMini(buscarPack(id))).join('')}</div>` : ''}
  `).join('') + (ultimo && ultimo.sugerencias ? `<div class="sugerencias">${ultimo.sugerencias.map(s => `<button class="chip suave" data-accion="sugerencia">${esc(s)}</button>`).join('')}</div>` : '');
  const fin = chat.lastElementChild;
  if (fin && Rico.mensajes.length > 1) fin.scrollIntoView({ block: 'end', behavior: 'smooth' });
}

function preguntarARico(texto) {
  texto = texto.trim();
  if (!texto) return;
  Rico.mensajes.push({ de: 'yo', texto });
  Rico.mensajes.push({ de: 'rico', texto: 'Rico está escribiendo…', escribiendo: true });
  pintarChat();
  setTimeout(() => {
    Rico.mensajes.pop();
    Rico.mensajes.push(Object.assign({ de: 'rico' }, Rico.responder(texto, contextoRico())));
    pintarChat();
  }, 550);
}

function contextoRico() {
  return {
    packs: PACKS.filter(p => quedan(p) > 0),
    campus: estado.campus,
    nombreCampus: campusActual().nombre,
    usuario: estado.usuario,
    packsUsuario: misPacks(),
    puntos: misPuntos(),
    ahorro: miAhorro(),
    insignia: insigniaActual()
  };
}

/* ---------- QR decorativo (dibujo, no es un QR real) ---------- */
function qrSvg(texto) {
  const n = 25;
  let semilla = [...texto].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const azar = () => { semilla = (semilla * 1103515245 + 12345) >>> 0; return (semilla >>> 16) % 100 < 48; };
  const enFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  let celdas = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!enFinder(x, y) && azar()) celdas += `M${x} ${y}h1v1h-1z`;
  const finder = (x, y) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
  return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" role="img" aria-label="Código QR de la reserva ${esc(texto)}">
    <path fill-rule="evenodd" fill="currentColor" d="${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}${celdas}"/></svg>`;
}

/* ---------- Pago simulado ---------- */
function abrirPago(p, metodo) {
  const modal = $('#modal');
  modal.innerHTML = `<div class="modal-caja" role="dialog" aria-modal="true" aria-labelledby="pago-titulo">
    <p class="modal-etiqueta">Simulación de pago</p>
    <h2 id="pago-titulo">Pagar con ${esc(metodo)}</h2>
    <p class="modal-monto">S/ ${p.precio}</p>
    <p>A: <strong>Quedó Rico · ${esc(p.corto)}</strong></p>
    <p class="ayuda">${esc(p.pack)}</p>
    <p class="simulacion">Esto es una demostración: no se abrirá tu app ni se cobrará dinero real.</p>
    <div class="modal-acciones">
      <button class="btn btn-naranja btn-grande" data-accion="confirmar-pago" data-pack="${p.id}" data-metodo="${esc(metodo)}">Aprobar pago</button>
      <button class="btn btn-borde" data-accion="cerrar-modal">Cancelar</button>
    </div>
  </div>`;
  modal.hidden = false;
  $('[data-accion="confirmar-pago"]', modal).focus();
}
function cerrarModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; }

function crearReserva(p, metodo) {
  const antes = insigniaActual();
  const codigo = 'QR-' + String(estado.siguiente).padStart(4, '0');
  estado.siguiente += 1;
  estado.vendidos[p.id] = (estado.vendidos[p.id] || 0) + 1;
  estado.reservas.unshift({ codigo, packId: p.id, metodo, estado: 'activa', fecha: Date.now() });
  const despues = insigniaActual();
  if (despues && despues !== antes) estado.reservas[0].insigniaNueva = despues.id;
  guardar();
  return codigo;
}

/* ---------- Router ---------- */
function ruta() {
  const [nombre, param] = decodeURIComponent(location.hash.slice(1)).split('/');
  const vista = vistas[nombre] || vistas.inicio;
  const clave = vistas[nombre] ? nombre : 'inicio';
  if (vista.requiereUsuario && !estado.usuario) { location.replace('#registro/' + (param || '')); return; }
  if (clave === 'registro' && estado.usuario) { location.replace(param ? '#reserva/' + param : '#cuenta'); return; }
  cerrarModal();
  document.body.dataset.vista = clave;
  app.innerHTML = vista.html(param);
  if (vista.montar) vista.montar(param);
  document.querySelectorAll('[data-nav]').forEach(a => {
    const activo = a.dataset.nav === vista.nav;
    a.classList.toggle('activo', activo);
    if (activo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  app.querySelectorAll('[data-contar]').forEach(el => {
    const f = el.dataset.formato;
    contarHasta(el, Number(el.dataset.contar), v => f === 'kg' ? miles(v) + ' kg' : f === 'soles' ? soles(v) : miles(v));
  });
  window.scrollTo(0, 0);
}

/* ---------- Eventos ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-accion], [data-filtro]');
  if (!el) {
    if (e.target.id === 'modal') cerrarModal();
    return;
  }
  if (el.dataset.filtro) {
    const g = el.dataset.filtro, v = el.dataset.valor;
    filtros[g] = (filtros[g] === v && g !== 'tipo') ? 'todos' : v;
    document.querySelectorAll(`[data-filtro="${g}"]`).forEach(c => {
      const on = filtros[g] === c.dataset.valor;
      c.classList.toggle('activo', on);
      c.setAttribute('aria-pressed', on);
    });
    $('#lista-carta').innerHTML = listaCarta();
    return;
  }
  switch (el.dataset.accion) {
    case 'limpiar-filtros':
      Object.assign(filtros, { tipo: 'todos', horario: 'todos', precio: 'todos' });
      ruta();
      break;
    case 'sugerencia':
      preguntarARico(el.textContent);
      break;
    case 'tab-ranking':
      pestanaRanking = el.dataset.valor;
      ruta();
      break;
    case 'cerrar-modal':
      cerrarModal();
      break;
    case 'confirmar-pago': {
      const p = buscarPack(el.dataset.pack);
      el.disabled = true;
      el.textContent = 'Procesando pago…';
      setTimeout(() => {
        if (quedan(p) <= 0) { cerrarModal(); aviso('¡Uy! Se acaba de agotar.'); ruta(); return; }
        const codigo = crearReserva(p, el.dataset.metodo);
        location.hash = '#confirmacion/' + codigo;
      }, 1200);
      break;
    }
    case 'recoger': {
      const r = estado.reservas.find(x => x.codigo === el.dataset.codigo);
      if (r) { r.estado = 'recogida'; guardar(); aviso('¡Buen provecho! Recuerda consumirlo hoy.'); ruta(); }
      break;
    }
    case 'salir':
      if (confirm('¿Cerrar sesión y borrar tus reservas de prueba de este celular?')) {
        try { localStorage.removeItem(CLAVE); } catch (err) { /* nada */ }
        Object.assign(estado, { usuario: null, reservas: [], vendidos: {}, siguiente: 427 });
        Rico.reiniciar();
        location.hash = '#inicio';
      }
      break;
  }
});

document.addEventListener('change', e => {
  if (e.target.dataset.cambiar === 'campus') {
    estado.campus = e.target.value;
    guardar();
    aviso('Mostrando packs cerca del ' + campusActual().nombre);
    ruta();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#modal').hidden) cerrarModal();
});

document.addEventListener('submit', e => {
  const form = e.target;
  const tipo = form.dataset.form;
  if (!tipo) return;
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(form));

  if (tipo === 'registro') {
    const error = $('#error-registro');
    const nombre = (datos.nombre || '').trim();
    const correo = (datos.correo || '').trim().toLowerCase();
    if (!nombre) { error.textContent = 'Cuéntanos cómo te llamas.'; form.nombre.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.edu(\.pe)?$/.test(correo)) {
      error.textContent = 'Usa tu correo institucional (termina en .edu.pe). Quedó Rico es solo para universitarios.';
      form.correo.focus();
      return;
    }
    if (!datos.universidad || !datos.facultad) { error.textContent = 'Elige tu universidad y tu facultad.'; return; }
    estado.usuario = { nombre, correo, universidad: datos.universidad, facultad: datos.facultad };
    guardar();
    aviso(`¡Listo, ${nombre}! Ya eres rescatista.`);
    location.hash = form.dataset.pack ? '#reserva/' + form.dataset.pack : '#cuenta';
  }

  if (tipo === 'pago') {
    abrirPago(buscarPack(form.dataset.pack), datos.metodo);
  }

  if (tipo === 'chat') {
    preguntarARico(datos.texto || '');
    form.reset();
  }
});

window.addEventListener('hashchange', ruta);
ruta();
