// Datos de demostración: negocios, precios y universidades ficticios (ver brief.md).

const CAMPUS = [
  { id: 'centro', nombre: 'Campus Centro' },
  { id: 'norte', nombre: 'Campus Norte' },
  { id: 'sur', nombre: 'Campus Sur' }
];

// inicio/fin: hora de recojo en formato 24 h (17.5 = 5:30 p. m.), sirve para filtrar.
const PACKS = [
  {
    id: 'panadero', pack: 'Pack Panadero', tipo: 'Panadero',
    negocio: 'Panadería El Trigal', corto: 'El Trigal', rubro: 'Panadería', zona: 'Centro',
    direccion: 'Av. Ejemplo 123', contenido: 'Pan del día, empanadas o bizcochos',
    recojo: '8:00 – 9:00 p. m.', inicio: 20, fin: 21, valor: 14, precio: 6, unidades: 3,
    categorias: ['salado', 'dulce'], distancia: { centro: 350, norte: 1400, sur: 1100 }, color: '#C99A63'
  },
  {
    id: 'dulce', pack: 'Pack Dulce', tipo: 'Dulce',
    negocio: 'Pastelería Dulce Norte', corto: 'Dulce Norte', rubro: 'Pastelería', zona: 'Norte',
    direccion: 'Jr. Demostración 456', contenido: 'Porciones de torta y galletas',
    recojo: '7:00 – 8:00 p. m.', inicio: 19, fin: 20, valor: 16, precio: 7, unidades: 5,
    categorias: ['dulce'], distancia: { centro: 1200, norte: 300, sur: 2100 }, color: '#D49A86'
  },
  {
    id: 'merienda', pack: 'Pack Merienda', tipo: 'Merienda',
    negocio: 'Cafetería Tostado', corto: 'Tostado', rubro: 'Cafetería', zona: 'Centro',
    direccion: 'Calle Prueba 789', contenido: 'Sándwich, pastel y bebida envasada',
    recojo: '5:30 – 6:30 p. m.', inicio: 17.5, fin: 18.5, valor: 18, precio: 8, unidades: 4,
    categorias: ['salado', 'dulce'], distancia: { centro: 450, norte: 1100, sur: 1500 }, color: '#A9805E'
  },
  {
    id: 'fruta', pack: 'Pack Fruta', tipo: 'Fruta',
    negocio: 'Juguería Fresca', corto: 'Fresca', rubro: 'Juguería', zona: 'Sur',
    direccion: 'Av. Muestra 321', contenido: 'Ensalada de frutas y jugo del día',
    recojo: '6:00 – 7:00 p. m.', inicio: 18, fin: 19, valor: 15, precio: 7, unidades: 2,
    categorias: ['dulce'], distancia: { centro: 500, norte: 1800, sur: 250 }, color: '#C9A15A'
  },
  {
    id: 'menu', pack: 'Pack Menú', tipo: 'Menú',
    negocio: 'Restaurante Sazón Norteño', corto: 'Sazón Norteño', rubro: 'Restaurante', zona: 'Norte',
    direccion: 'Jr. Ficticio 654', contenido: 'Segundo del día con arroz y refresco',
    recojo: '3:30 – 4:30 p. m.', inicio: 15.5, fin: 16.5, valor: 12, precio: 6, unidades: 6,
    categorias: ['menu', 'salado'], distancia: { centro: 900, norte: 200, sur: 1700 }, color: '#B98552'
  },
  {
    id: 'brasa', pack: 'Pack Brasa', tipo: 'Brasa',
    negocio: 'Pollería El Brasero', corto: 'El Brasero', rubro: 'Pollería', zona: 'Sur',
    direccion: 'Av. Ejemplo 987', contenido: '1/8 de pollo a la brasa con papas',
    recojo: '10:00 – 10:45 p. m.', inicio: 22, fin: 22.75, valor: 16, precio: 8, unidades: 2,
    categorias: ['salado'], distancia: { centro: 1300, norte: 2200, sur: 400 }, color: '#B5734A'
  },
  {
    id: 'sanguche', pack: 'Pack Sánguche', tipo: 'Sánguche',
    negocio: 'Sanguchería Pan con Todo', corto: 'Pan con Todo', rubro: 'Sanguchería', zona: 'Centro',
    direccion: 'Calle Demo 147', contenido: 'Dos sánguches del día y bebida',
    recojo: '9:00 – 10:00 p. m.', inicio: 21, fin: 22, valor: 18, precio: 8, unidades: 4,
    categorias: ['salado'], distancia: { centro: 600, norte: 1000, sur: 1300 }, color: '#C08F5C'
  },
  {
    id: 'pizza', pack: 'Pack Pizza', tipo: 'Pizza',
    negocio: 'Pizzería La Masa', corto: 'La Masa', rubro: 'Pizzería', zona: 'Norte',
    direccion: 'Jr. Prueba 258', contenido: 'Porciones de pizza del día',
    recojo: '10:00 – 11:00 p. m.', inicio: 22, fin: 23, valor: 20, precio: 9, unidades: 0,
    categorias: ['salado'], distancia: { centro: 800, norte: 350, sur: 1900 }, color: '#C7804F'
  },
  {
    id: 'snack', pack: 'Pack Snack', tipo: 'Snack',
    negocio: 'Minimarket La Esquina', corto: 'La Esquina', rubro: 'Minimarket', zona: 'Sur',
    direccion: 'Av. Muestra 369', contenido: 'Snacks y bebidas envasadas vigentes',
    recojo: '9:00 – 10:00 p. m.', inicio: 21, fin: 22, valor: 15, precio: 6, unidades: 5,
    categorias: ['salado', 'dulce'], distancia: { centro: 700, norte: 1500, sur: 150 }, color: '#B79066'
  }
];

const UNIVERSIDADES = [
  { nombre: 'Universidad A', puntos: 538 },
  { nombre: 'Universidad B', puntos: 412 },
  { nombre: 'Universidad C', puntos: 365 },
  { nombre: 'Universidad D', puntos: 298 },
  { nombre: 'Universidad E', puntos: 241 },
  { nombre: 'Universidad F', puntos: 187 }
];

const FACULTADES = [
  { nombre: 'Administración', puntos: 476 },
  { nombre: 'Ingeniería', puntos: 431 },
  { nombre: 'Medicina', puntos: 352 },
  { nombre: 'Derecho', puntos: 287 },
  { nombre: 'Arquitectura', puntos: 233 },
  { nombre: 'Educación', puntos: 176 },
  { nombre: 'Comunicaciones', puntos: 154 }
];

const RESCATISTA_DEL_MES = { nombre: 'Diego', facultad: 'Administración', packs: 27, insignia: 'Leyenda' };

// Impacto acumulado de la comunidad (demostración). Se suma lo que rescata el usuario.
const IMPACTO_BASE = { packs: 1248, kilos: 620, soles: 9800 };
const KILOS_POR_PACK = 0.5;
const PUNTOS_POR_PACK = 10;

const INSIGNIAS = [
  { id: 'novato', nombre: 'Novato', meta: 1, texto: 'Rescataste tu primer pack' },
  { id: 'heroe', nombre: 'Héroe', meta: 5, texto: 'Rescataste 5 packs' },
  { id: 'leyenda', nombre: 'Leyenda', meta: 15, texto: 'Rescataste 15 packs' }
];
