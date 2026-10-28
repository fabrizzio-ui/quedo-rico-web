// Asistente "Rico": respuestas preparadas, sin servicios de pago ni inteligencia artificial externa.
// Solo recomienda packs que existen en la carta de hoy y nunca inventa precios ni negocios.

const SUGERENCIAS = [
  'Tengo S/ 7 y salgo a las 6',
  'Algo dulce',
  'Hasta S/ 6',
  'Cerca de mí',
  'Algo para la noche',
  '¿Cómo funciona?',
  'Tengo una alergia',
  'Mi impacto'
];

const SALUDO = {
  de: 'rico',
  texto: '¡Hola, rescatista! Soy Rico. ¿Qué se te antoja hoy? Toca una opción o escríbeme tu antojo.',
  sugerencias: SUGERENCIAS
};

// Palabras que el estudiante puede escribir y la categoría o pack que significan.
const ANTOJOS = [
  { palabras: ['dulce', 'postre', 'torta', 'galleta', 'pastel'], categoria: 'dulce', nombre: 'algo dulce' },
  { palabras: ['salado'], categoria: 'salado', nombre: 'algo salado' },
  { palabras: ['menu', 'almuerzo', 'almorzar', 'segundo', 'arroz'], categoria: 'menu', nombre: 'menú' },
  { palabras: ['pollo', 'brasa'], pack: 'brasa', nombre: 'pollito' },
  { palabras: ['pizza'], pack: 'pizza', nombre: 'pizza' },
  { palabras: ['pan ', 'panader', 'empanada', 'bizcocho'], pack: 'panadero', nombre: 'pancito' },
  { palabras: ['fruta', 'jugo', 'sano', 'saludable'], pack: 'fruta', nombre: 'algo fresco' },
  { palabras: ['sanguche', 'sandwich', 'sanduche'], pack: 'sanguche', nombre: 'sánguche' },
  { palabras: ['snack', 'piqueo', 'golosina', 'chizito'], pack: 'snack', nombre: 'piqueo' },
  { palabras: ['cafe', 'merienda', 'lonche'], pack: 'merienda', nombre: 'lonchecito' }
];

function normalizar(t) {
  return ' ' + t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + ' ';
}

function numeroEnPalabras(s) {
  const nums = { uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12 };
  return s.replace(/\b(uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)\b/g, m => nums[m]);
}

const Rico = {
  mensajes: [Object.assign({}, SALUDO)],

  reiniciar() { this.mensajes = [Object.assign({}, SALUDO)]; },

  responder(texto, ctx) {
    const s = numeroEnPalabras(normalizar(texto));
    const tiene = (...ps) => ps.some(p => s.includes(p));

    if (tiene('alergi', 'ingrediente', 'gluten', 'lactosa', 'celiac', 'mani', 'vegano', 'vegetarian', 'diabet')) {
      return {
        texto: 'Como cada pack es sorpresa, no puedo prometerte qué ingredientes trae. Si tienes alguna alergia o restricción, consúltalo directamente con el negocio antes de reservar o al recoger. ¡Tu salud primero!',
        sugerencias: ['¿Cómo funciona?', 'Algo dulce', 'Cerca de mí']
      };
    }
    if (tiene('delivery', 'domicilio', 'envio', 'me lo traen', 'llevan')) {
      return {
        texto: 'No hacemos delivery: tú recoges tu bolsa en el local, dentro del horario indicado. ¡Por eso sale tan barato!',
        sugerencias: ['Cerca de mí', '¿Cómo funciona?']
      };
    }
    if (tiene('impacto', 'mis puntos', 'insignia', 'cuantos packs', 'he rescatado')) {
      if (!ctx.usuario) {
        return { texto: 'Todavía no tienes cuenta. Regístrate con tu correo institucional y empiezo a contar tus packs, puntos e insignias.', sugerencias: ['¿Cómo funciona?', 'Algo dulce'] };
      }
      const n = ctx.packsUsuario;
      return {
        texto: n
          ? `Ya rescataste ${n} pack${n === 1 ? '' : 's'}, ahorraste S/ ${ctx.ahorro} y sumaste ${ctx.puntos} puntos para ${ctx.usuario.universidad}. ${ctx.insignia ? `Tienes la insignia ${ctx.insignia.nombre}.` : ''} ¡Tu universidad te lo agradece!`
          : 'Aún no rescatas tu primer pack. Con uno ya eres Novato. ¿Te busco algo rico?',
        sugerencias: ['Hasta S/ 6', 'Cerca de mí', 'Algo dulce']
      };
    }
    if (tiene('pago', 'pagar', 'yape', 'plin', 'tarjeta', 'efectivo')) {
      return {
        texto: 'Pagas en la misma web con Yape o Plin, al toque. Ojo: en este prototipo el pago es una simulación y no se cobra dinero real.',
        sugerencias: ['Hasta S/ 6', '¿Cómo funciona?']
      };
    }
    if (tiene('recoj', 'recog', 'codigo', 'horario de recojo', 'donde recojo')) {
      return {
        texto: 'Después de pagar te doy un código (tipo QR-0427). Vas al local dentro del horario indicado, lo muestras y te entregan tu bolsa. Fuera de horario ya no se puede recoger, ¡ponte alarma!',
        sugerencias: ['Cerca de mí', 'Algo para la noche']
      };
    }
    if (tiene('como funciona', 'que es', 'que es quedo rico', 'como es', 'como reservo', 'ayuda', 'sorpresa', 'que trae')) {
      return {
        texto: 'Así de fácil: 1) te registras con tu correo institucional, 2) eliges un pack de la carta, 3) reservas y pagas con Yape o Plin, 4) lo recoges en el local con tu código, 5) sumas puntos. El contenido es sorpresa, pero siempre vale más de lo que pagas. Consúmelo el mismo día.',
        sugerencias: ['Tengo S/ 7 y salgo a las 6', 'Cerca de mí', 'Algo dulce']
      };
    }

    // Recomendación según antojo, presupuesto, hora y cercanía.
    const filtro = {};
    const precio = s.match(/s\/\.?\s*(\d+)|(\d+)\s*(?:sol|luca|lucas)|tengo\s+(\d+)|con\s+(\d+)/);
    if (precio) filtro.max = Number(precio[1] || precio[2] || precio[3] || precio[4]);
    const hora = s.match(/a\s+las\s+(\d{1,2})(?:[:.](\d{2}))?/);
    if (hora) {
      let h = Number(hora[1]) + (hora[2] ? Number(hora[2]) / 60 : 0);
      if (h < 12) h += 12; // los estudiantes salen en la tarde o noche
      filtro.salida = h;
    }
    if (tiene(' noche', 'cena', 'tarde noche')) filtro.noche = true;
    if (tiene(' tarde ', 'temprano', 'ahorita', 'ya mismo')) filtro.tarde = true;
    if (tiene('cerca', 'cercano', 'al lado', 'camino')) filtro.cerca = true;
    const antojo = ANTOJOS.find(a => a.palabras.some(p => s.includes(p)));
    if (antojo) filtro.antojo = antojo;
    if (tiene('barato', 'economico', 'poca plata', 'misio', 'pobre')) filtro.barato = true;

    if (Object.keys(filtro).length) return recomendar(filtro, ctx);

    if (tiene('hola', 'buenas', 'hey', 'que tal', 'holi')) {
      return { texto: '¡Hola! ¿Qué se te antoja hoy? Dime cuánto tienes, a qué hora sales o qué tipo de comida quieres.', sugerencias: SUGERENCIAS };
    }
    if (tiene('gracias', 'chevere', 'genial', 'bacan', 'listo')) {
      return { texto: '¡De nada, rescatista! Aquí estoy cuando te dé hambre.', sugerencias: ['Algo dulce', 'Hasta S/ 6', 'Mi impacto'] };
    }
    return {
      texto: 'Mmm, eso no lo sé. Yo solo hablo de Quedó Rico: packs, reservas, pagos y tu impacto. Prueba con una de estas opciones:',
      sugerencias: SUGERENCIAS
    };
  }
};

function recomendar(f, ctx) {
  let lista = ctx.packs.slice();
  if (f.antojo) lista = lista.filter(p => f.antojo.pack ? p.id === f.antojo.pack : p.categorias.includes(f.antojo.categoria));
  if (f.max) lista = lista.filter(p => p.precio <= f.max);
  if (f.salida) lista = lista.filter(p => p.fin > f.salida);
  if (f.noche) lista = lista.filter(p => p.inicio >= 19);
  if (f.tarde && !f.noche) lista = lista.filter(p => p.inicio < 19);

  if (f.cerca) lista.sort((a, b) => a.distancia[ctx.campus] - b.distancia[ctx.campus]);
  else if (f.salida) lista.sort((a, b) => a.inicio - b.inicio);
  else lista.sort((a, b) => a.precio - b.precio || a.distancia[ctx.campus] - b.distancia[ctx.campus]);
  lista = lista.slice(0, 3);

  if (!lista.length) {
    const agotado = f.antojo && f.antojo.pack && !ctx.packs.some(p => p.id === f.antojo.pack);
    return {
      texto: agotado
        ? `¡Uy! El pack de ${f.antojo.nombre} ya se agotó hoy. ¿Te muestro otra cosa rica?`
        : 'Uy, con eso no me queda nada hoy. No te voy a inventar packs, pero podemos probar con otra cosa:',
      sugerencias: ['Hasta S/ 8', 'Cerca de mí', 'Algo dulce', 'Algo para la noche']
    };
  }

  const cantidad = ['', 'una opción riquísima', 'dos opciones riquísimas', 'tres opciones riquísimas'][lista.length];
  let intro = `¡Tengo ${cantidad} para ti!`;
  if (f.cerca) intro = `Lo más cerca del ${ctx.nombreCampus}: ¡${lista.length === 1 ? 'una opción' : `${lista.length} opciones`} a pasitos!`;
  if (lista.length === 1) intro += ` ${lista[0].pack} de ${lista[0].corto} a S/ ${lista[0].precio}. ¿Te animas?`;
  else intro += ' ¿Cuál te provoca?';

  return {
    texto: intro,
    packs: lista.map(p => p.id),
    sugerencias: ['Hasta S/ 6', 'Cerca de mí', 'Algo dulce', '¿Cómo funciona?']
  };
}
