const ICONOS = {
  patrones: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 12h16M12 4v16"/>',
  fallo: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
  altavoz: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  silencio: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  luna: '<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
  ayuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/>',
  jugar: '<path d="M7 5l12 7-12 7z"/>',
  verificar: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
  volver: '<path d="M15 5l-7 7 7 7"/>',
  bola: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/>',
  estrella: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  rayo: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  pantalla: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  celular: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  contraste: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'
};
const ico = (nombre, etiqueta) => `<svg class="ico" viewBox="0 0 24 24" role="img" aria-label="${etiqueta || nombre}">${ICONOS[nombre]}</svg>`;
const $ = id => document.getElementById(id);

const ACENTOS = ['#4f46e5', '#008608', '#be123c', '#b45309', '#0369a1'];
function luminancia(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16) / 255)
    .map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function aplicarTema() {
  const elegido = leer('tema', null);
  const oscuro = elegido ? elegido === 'oscuro' : matchMedia('(prefers-color-scheme:dark)').matches;
  const acento = leer('acento', ACENTOS[0]);
  const raiz = document.documentElement;
  raiz.dataset.tema = oscuro ? 'oscuro' : 'claro';
  raiz.style.setProperty('--acento', acento);
  raiz.style.setProperty('--sobre-acento', luminancia(acento) > 0.4 ? '#111111' : '#ffffff');
  const boton = $('btnTema');
  if (boton) boton.innerHTML = ico(oscuro ? 'sol' : 'luna', oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
}
aplicarTema();
matchMedia('(prefers-color-scheme:dark)').addEventListener('change', () => { if (leer('tema', null) === null) aplicarTema(); });

const AYUDA_JUGADOR = {
  titulo: 'Cómo jugar',
  pestana: 'Soy jugador',
  historia: 'Como jugador, quiero entrar a la sala de mi anfitrión con un código, elegir mi tabla y marcar los números que van saliendo, para poder gritar «¡Bingo!» cuando complete mi tabla y ganar.',
  pasos: [
    '<b>Pide la llave:</b> tu anfitrión tiene un código de 4 letras o números, como una llave secreta. Pídeselo y escríbelo para entrar a su sala.',
    '<b>Escoge tu tabla:</b> verás muchos números (001, 002…). Toca uno para ver cómo es tu tabla. Si te gusta, pulsa «Jugar con esta tabla». ¡Acuérdate de su número, es su nombre secreto!',
    '<b>Escucha y mira:</b> el anfitrión dice un número en voz alta, como «B7». Búscalo en tu tabla.',
    '<b>Márcalo:</b> si lo tienes, tócalo y se pinta de color. Si te equivocas, tócalo otra vez. La estrella del centro ya viene marcada.',
    '<b>Completa un premio:</b> puedes ganar con una línea, dos líneas, las cuatro esquinas, una X o la tabla llena (bingo). Cuando lo logres, se enciende el botón «¡Cantar!» que está debajo de esa tabla.',
    '<b>¡Cántalo!:</b> pulsa «¡Cantar!», grita fuerte y enséñale tu pantalla al anfitrión.',
    '<b>Espera la revisión:</b> el anfitrión mira tu tabla solo hasta el momento en que cantaste. Si todo está bien, ¡ganaste! Si no, sigue jugando.',
    '<b>¿Quieres otra sala?</b> Pulsa «Cambiar de código» debajo de tu tabla y escribe el código nuevo. Ojo: se borran tus marcas.',
    'Tus marcas se guardan en el celular, así que puedes cerrar la página y volver sin perderlas.'
  ]
};
const AYUDA_ANFITRION = {
  titulo: 'Cómo administrar la sala',
  pestana: 'Soy anfitrión',
  historia: 'Como anfitrión, quiero abrir una sala, sacar los números uno por uno y revisar quién gana, para que todos jueguen limpio y se diviertan.',
  pasos: [
    '<b>Abre la sala:</b> sale un código de 4 letras, como una llave mágica. Díselo a tus amigos para que entren con su celular.',
    '<b>Empieza:</b> pulsa «Empezar partida» (o la tecla Enter). ¡Ya están jugando todos!',
    '<b>Saca un número:</b> pulsa «Sortear» o la barra espaciadora. La bolita gira y se detiene. Dile el número en voz alta a todos.',
    '<b>Espera:</b> no puedes sortear otra vez hasta que la bolita se detenga. Así no te saltas ninguno.',
    '<b>¿Alguien gritó «Bingo»?</b> Pulsa «Verificar victoria». El juego se queda quieto, como en una foto.',
    '<b>Mira su tabla:</b> escribe el número de su tabla (por ejemplo 001), elige qué dice que ganó y pulsa «Verificar». Verás VÁLIDO o INVÁLIDO.',
    '<b>Sigue jugando:</b> pulsa «Volver al bingo» y el juego continúa justo donde lo dejaste.'
  ]
};

function montarBarra(titulo, ayuda = [AYUDA_JUGADOR, AYUDA_ANFITRION]) {
  const guias = Array.isArray(ayuda) ? ayuda : [ayuda];
  const tituloAyuda = guias.length > 1 ? 'Cómo jugar' : guias[0].titulo;
  document.querySelector('header').innerHTML = `
    <a class="marca" href="index.html">${ico('bola', 'Bingo')}<span>${titulo}</span></a>
    <div class="acciones">
      <div class="muestras" role="group" aria-label="Color de acento">
        ${ACENTOS.map(c => `<button class="muestra" style="background:${c}" data-color="${c}" aria-label="Acento ${c}"></button>`).join('')}
        <input type="color" id="selectorAcento" aria-label="Elegir otro color de acento" value="${leer('acento', ACENTOS[0])}">
      </div>
      <button class="btn icono" data-ayuda aria-label="${tituloAyuda}">${ico('ayuda', tituloAyuda)}</button>
      <button class="btn icono" id="btnPatrones" aria-label="Patrones de premio">${ico('patrones', 'Patrones de premio')}</button>
      <button class="btn icono" id="btnTema" aria-label="Alternar tema claro y oscuro"></button>
    </div>`;
  const cambiarAcento = color => { guardar('acento', color); aplicarTema(); };
  document.querySelectorAll('.muestra').forEach(b => b.onclick = () => cambiarAcento(b.dataset.color));
  $('selectorAcento').oninput = e => cambiarAcento(e.target.value);
  $('btnPatrones').onclick = abrirPatrones;
  $('btnTema').onclick = () => { guardar('tema', document.documentElement.dataset.tema === 'oscuro' ? 'claro' : 'oscuro'); aplicarTema(); };
  aplicarTema();

  const dialogo = document.createElement('dialog');
  dialogo.innerHTML = (guias.length > 1 ? `<div class="pestanas" role="tablist">${guias.map((guia, i) => `<button class="btn${i ? '' : ' primario'}" role="tab" aria-selected="${!i}" data-pestana="${i}">${guia.pestana}</button>`).join('')}</div>` : '') +
    guias.map((guia, i) => `<section class="guia" data-guia="${i}"${i ? ' hidden' : ''}><h2>${guia.titulo}</h2>${guia.historia ? `<p class="historia">${guia.historia}</p>` : ''}<ol>${guia.pasos.map(paso => `<li>${paso}</li>`).join('')}</ol></section>`).join('') +
    `<button class="btn primario" id="cerrarAyuda">Entendido</button>`;
  document.body.append(dialogo);
  $('cerrarAyuda').onclick = () => dialogo.close();
  dialogo.querySelectorAll('[data-pestana]').forEach(boton => boton.onclick = () => {
    dialogo.querySelectorAll('[data-pestana]').forEach(b => { const activa = b === boton; b.classList.toggle('primario', activa); b.setAttribute('aria-selected', activa); });
    dialogo.querySelectorAll('.guia').forEach(guia => guia.hidden = guia.dataset.guia !== boton.dataset.pestana);
  });
  document.querySelectorAll('[data-ayuda]').forEach(b => b.onclick = () => dialogo.showModal());
  document.querySelectorAll('[data-ico]').forEach(e => e.insertAdjacentHTML('afterbegin', ico(e.dataset.ico, e.textContent.trim())));
}

function dibujarTabla(contenedor, tabla, marcadas, alPulsar, resaltadas = new Set(), claseResaltada = 'falta') {
  contenedor.className = 'tabla';
  contenedor.innerHTML = LETRAS.map(letra => `<b>${letra}</b>`).join('') + tabla.casillas.map((c, i) =>
    `<button type="button" class="casilla${marcadas[i] ? ' marcada' : ''}${resaltadas.has(i) ? ' ' + claseResaltada : ''}" data-i="${i}" aria-pressed="${!!marcadas[i]}"${alPulsar ? '' : ' disabled'}>${c.libre ? ico('estrella', 'Casilla libre') : c.numero}</button>`).join('');
  if (alPulsar) contenedor.querySelectorAll('.casilla').forEach(b => b.onclick = () => alPulsar(+b.dataset.i));
}

// Celular: solo vibra. PC: solo mantiene la pantalla encendida (requiere HTTPS o localhost)
const esCelular = matchMedia('(pointer:coarse)').matches;
const vibrarAlMarcar = () => { if (esCelular) navigator.vibrate?.(15); };
let bloqueoPantalla = null;
async function mantenerPantallaEncendida() {
  if (esCelular || bloqueoPantalla || !('wakeLock' in navigator)) return;
  try {
    bloqueoPantalla = await navigator.wakeLock.request('screen');
    bloqueoPantalla.addEventListener('release', () => { bloqueoPantalla = null; });
  } catch { bloqueoPantalla = null; }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && document.body.dataset.pantallaEncendida) mantenerPantallaEncendida(); });

// Galería de patrones: cuadrículas SVG dibujadas a partir de PATRONES
const DESCRIPCION_PATRON = {
  linea: 'Una fila, columna o diagonal completa',
  dosLineas: 'Dos líneas completas, en cualquier combinación',
  esquinas: 'Las cuatro esquinas de la tabla',
  equis: 'Las dos diagonales completas',
  bingo: 'Toda la tabla'
};
function celdasDeEjemplo(tipo) {
  if (tipo === 'dosLineas') return [...new Set([...PATRONES.linea[0], ...PATRONES.linea[5]])]; // una fila y una columna
  return tipo === 'linea' ? PATRONES.linea[0] : PATRONES[tipo][0];
}
function dibujarPatron(tipo) {
  const ejemplo = celdasDeEjemplo(tipo);
  const celdas = Array.from({ length: 25 }, (_, i) =>
    `<rect x="${(i % 5) * 12 + 2}" y="${Math.floor(i / 5) * 12 + 2}" width="10" height="10" rx="2.5" fill="${ejemplo.includes(i) ? 'var(--acento)' : 'var(--borde)'}"/>`).join('');
  return `<svg viewBox="0 0 62 62" role="img" aria-label="Patrón de ${NOMBRES_PREMIO[tipo]}">${celdas}</svg>`;
}
let dialogoPatrones = null;
function abrirPatrones() {
  if (!dialogoPatrones) { // se construye solo la primera vez
    dialogoPatrones = document.createElement('dialog');
    dialogoPatrones.innerHTML = `<h2>Patrones de premio</h2><div class="patrones">${Object.keys(NOMBRES_PREMIO).map(tipo =>
      `<figure>${dibujarPatron(tipo)}<figcaption><b>${NOMBRES_PREMIO[tipo]}</b><br><span class="suave">${DESCRIPCION_PATRON[tipo]}</span></figcaption></figure>`).join('')}</div><button class="btn primario" id="cerrarPatrones">Entendido</button>`;
    document.body.append(dialogoPatrones);
    dialogoPatrones.querySelector('#cerrarPatrones').onclick = () => dialogoPatrones.close();
  }
  dialogoPatrones.showModal();
}

const escaparHtml = texto => String(texto).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
