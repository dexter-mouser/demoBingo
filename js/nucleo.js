const PREFIJO = 'bingo_', TOTAL_TABLAS = 60, LETRAS = ['B', 'I', 'N', 'G', 'O'];
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const reducirMovimiento = matchMedia('(prefers-reduced-motion:reduce)').matches;

const leer = (clave, porDefecto) => {
  try { const valor = localStorage.getItem(PREFIJO + clave); return valor === null ? porDefecto : JSON.parse(valor); }
  catch { return porDefecto; }
};
const guardar = (clave, valor) => { try { localStorage.setItem(PREFIJO + clave, JSON.stringify(valor)); } catch {} };

// Generador pseudoaleatorio con semilla (mulberry32)
function crearGenerador(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function semillaDeTexto(texto) {
  let h = 2166136261;
  for (const caracter of texto) { h ^= caracter.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function barajar(lista, aleatorio) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
const crearSemilla = () => Math.floor(Math.random() * 2 ** 32);
const generarCodigo = () => Array.from({ length: 4 }, () => ALFABETO[Math.floor(Math.random() * ALFABETO.length)]).join('');
const letraDe = numero => LETRAS[Math.floor((numero - 1) / 15)];
const nombreTabla = n => String(n).padStart(3, '0');
const esTablaValida = id => /^\d{3}$/.test(id) && +id >= 1 && +id <= TOTAL_TABLAS;
const normalizarTabla = texto => { const digitos = texto.replace(/\D/g, ''); return digitos ? digitos.padStart(3, '0') : ''; };

// Tabla 5x5 en orden de filas; el centro es la casilla libre
function generarTabla(codigoSala, idTabla) {
  const aleatorio = crearGenerador(semillaDeTexto(codigoSala + idTabla));
  const columnas = LETRAS.map((_, c) =>
    barajar(Array.from({ length: 15 }, (_, i) => c * 15 + i + 1), aleatorio).slice(0, c === 2 ? 4 : 5));
  const casillas = [];
  for (let fila = 0; fila < 5; fila++) {
    for (let c = 0; c < 5; c++) {
      if (fila === 2 && c === 2) casillas.push({ libre: true, numero: 0 });
      else casillas.push({ numero: columnas[c][c === 2 && fila > 2 ? fila - 1 : fila] });
    }
  }
  return { id: idTabla, casillas };
}

const filasTabla = [0, 1, 2, 3, 4].map(f => [0, 1, 2, 3, 4].map(c => f * 5 + c));
const columnasTabla = [0, 1, 2, 3, 4].map(c => [0, 1, 2, 3, 4].map(f => f * 5 + c));
const LINEAS = [...filasTabla, ...columnasTabla, [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]];
const PATRONES = {
  linea: LINEAS,
  esquinas: [[0, 4, 20, 24]],
  equis: [[0, 4, 6, 8, 12, 16, 18, 20, 24]],
  bingo: [Array.from({ length: 25 }, (_, i) => i)]
};
const NOMBRES_PREMIO = { linea: 'Línea', dosLineas: 'Dos líneas', esquinas: 'Cuatro esquinas', equis: 'X', bingo: 'Bingo' };
const contarLineas = marcadas => LINEAS.filter(linea => linea.every(i => marcadas[i])).length;
const cumplePatron = (marcadas, tipo) => tipo === 'dosLineas'
  ? contarLineas(marcadas) >= 2
  : PATRONES[tipo].some(patron => patron.every(i => marcadas[i]));
const premiosPosibles = marcadas => Object.keys(NOMBRES_PREMIO).filter(tipo => cumplePatron(marcadas, tipo));

// Solo cuentan las primeras "hastaJugada" jugadas del anfitrión
function verificarReclamo(codigoSala, idTabla, tipo, jugadas, hastaJugada) {
  const tabla = generarTabla(codigoSala, idTabla);
  const validos = new Set(jugadas.slice(0, hastaJugada).map(jugada => jugada.numero));
  const marcadas = tabla.casillas.map(casilla => casilla.libre || validos.has(casilla.numero));
  return { tabla, marcadas, valido: cumplePatron(marcadas, tipo) };
}
