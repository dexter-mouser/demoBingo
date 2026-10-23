const DURACION_ANIMACION_MS = 2500;
montarBarra('Anfitrión', AYUDA_ANFITRION);

const nuevaPartida = (premios = {}) => ({ codigoSala: generarCodigo(), semillaSorteo: crearSemilla(), jugadas: [], estado: 'esperando', reclamoActual: null, premiosEntregados: [], premios });
let estado = leer('anfitrion', null) || nuevaPartida();
if (estado.estado === 'verificando') location.replace('verificar.html');
estado.premios ??= {};
let ordenSorteo = [], sorteando = false;

const prepararOrden = () => { ordenSorteo = barajar(Array.from({ length: 75 }, (_, i) => i + 1), crearGenerador(estado.semillaSorteo)); };
const persistir = () => guardar('anfitrion', estado);

$('numeros').innerHTML = LETRAS.map(letra => `<span class="letra">${letra}</span>`).join('') +
  Array.from({ length: 75 }, (_, i) => { const numero = (i % 5) * 15 + Math.floor(i / 5) + 1; return `<span class="n" id="n${numero}">${numero}</span>`; }).join('');

let iluminados = 0;
function iluminarTablero() {
  const jugadas = estado.jugadas;
  if (jugadas.length < iluminados) { document.querySelectorAll('.n').forEach(n => n.className = 'n'); iluminados = 0; }
  for (; iluminados < jugadas.length; iluminados++) $('n' + jugadas[iluminados].numero).classList.add('sale');
  document.querySelector('.n.ultimo')?.classList.remove('ultimo');
  if (jugadas.length) $('n' + jugadas.at(-1).numero).classList.add('ultimo');
}

function pintar() {
  const enEspera = estado.estado === 'esperando';
  $('previa').hidden = !enEspera;
  $('juego').hidden = enEspera;
  $('codigoGrande').textContent = $('codigoSala').textContent = estado.codigoSala;
  const jugadas = estado.jugadas, ultima = jugadas.at(-1), terminado = jugadas.length >= 75;
  $('contador').textContent = jugadas.length;
  $('restantes').textContent = 75 - jugadas.length;
  $('barra').style.width = (jugadas.length / 75 * 100) + '%';
  iluminarTablero();
  $('numeroActual').textContent = ultima ? ultima.letra + ultima.numero : '—';
  $('historial').innerHTML = jugadas.slice(-8).reverse().map(j => `<li><b>#${j.indice}</b> ${j.letra}${j.numero}</li>`).join('');
  $('btnSortear').disabled = sorteando || terminado || automatico;
  $('btnAuto').setAttribute('aria-pressed', automatico);
  $('btnAuto').querySelector('span').textContent = automatico ? 'Pausar automático' : 'Sorteo automático';
  $('btnAuto').disabled = terminado;
  $('cuenta').hidden = !automatico;
  $('btnVerificar').disabled = sorteando;
  $('mensaje').textContent = terminado ? 'Se cantaron todos los números' : automatico ? 'Automático activo · Espacio para pausar' : (ultima ? '' : 'Presiona Espacio para sortear');
}

function sortear() {
  if (sorteando || estado.estado !== 'en_juego' || estado.jugadas.length >= 75) return;
  sorteando = true;
  pintar();
  const numero = ordenSorteo[estado.jugadas.length];
  const terminar = () => {
    estado.jugadas.push({ indice: estado.jugadas.length + 1, letra: letraDe(numero), numero, hora: Date.now() });
    persistir();
    sorteando = false;
    pintar();
    const titulo = $('numeroActual');
    titulo.classList.remove('entra'); void titulo.offsetWidth; titulo.classList.add('entra');
    hablarNumero(letraDe(numero), numero, programarSiguiente);
  };
  if (reducirMovimiento) return terminar();
  $('escenario').classList.add('girando');
  const cambio = setInterval(() => { const r = 1 + Math.floor(Math.random() * 75); $('numeroActual').textContent = letraDe(r) + r; }, 80);
  setTimeout(() => { clearInterval(cambio); $('escenario').classList.remove('girando'); terminar(); }, DURACION_ANIMACION_MS);
}

function animarEntrada(elemento) {
  elemento.classList.remove('entra'); void elemento.offsetWidth; elemento.classList.add('entra');
}
function empezar() {
  if (estado.estado !== 'esperando') return;
  estado.estado = 'en_juego'; persistir();
  sessionStorage.setItem('bingo_sesion', '1');
  document.body.dataset.pantallaEncendida = '1'; mantenerPantallaEncendida();
  const mostrarJuego = () => { pintar(); animarEntrada($('juego')); };
  if (reducirMovimiento) return mostrarJuego();
  $('previa').classList.add('sale'); // la pantalla previa se desvanece y luego entra el dashboard
  setTimeout(() => { $('previa').classList.remove('sale'); mostrarJuego(); }, 180);
}
function avisarPartidaGuardada() {
  if (['esperando', 'verificando'].includes(estado.estado) || sessionStorage.getItem('bingo_sesion')) return;
  $('textoGuardada').textContent = `Sala ${estado.codigoSala} · jugada ${estado.jugadas.length} de 75. ¿Quieres continuarla o empezar una nueva?`;
  $('dlgGuardada').showModal();
}
$('btnContinuar').onclick = () => { sessionStorage.setItem('bingo_sesion', '1'); $('dlgGuardada').close(); };
$('btnDescartar').onclick = () => {
  sessionStorage.setItem('bingo_sesion', '1'); $('dlgGuardada').close();
  detenerTemporizador(); automatico = false;
  estado = nuevaPartida(estado.premios); persistir(); prepararOrden(); cargarPremios(); pintar(); animarEntrada($('previa'));
};
function verificarVictoria() {
  if (sorteando) return;
  detenerTemporizador(); automatico = false;
  estado.estado = 'verificando';
  estado.reclamoActual = { jugadaCongelada: estado.jugadas.length };
  persistir();
  location.href = 'verificar.html';
}

// Sorteo automático: un único temporizador encadenado
let automatico = false, temporizadorAuto = null;
const intervaloAuto = () => (+leer('intervalo_auto', 8)) * 1000;
function detenerTemporizador() { clearTimeout(temporizadorAuto); temporizadorAuto = null; $('cuentaBarra').classList.remove('corre'); }
function programarSiguiente() {
  detenerTemporizador();
  if (!automatico || estado.estado !== 'en_juego') return;
  if (estado.jugadas.length >= 75) return alternarAutomatico(false);
  const barra = $('cuentaBarra');
  barra.style.setProperty('--duracion', intervaloAuto() + 'ms');
  void barra.offsetWidth; barra.classList.add('corre');
  temporizadorAuto = setTimeout(sortear, intervaloAuto());
}
function alternarAutomatico(activo = !automatico) {
  automatico = activo;
  if (!automatico) detenerTemporizador();
  else if (!sorteando) programarSiguiente();
  pintar();
}
function pintarVoz() {
  const silenciada = vozSilenciada();
  $('btnVoz').innerHTML = ico(silenciada ? 'silencio' : 'altavoz', silenciada ? 'Activar voz' : 'Silenciar voz') + `<small>${silenciada ? 'Silenciada' : 'Voz'}</small>`;
  $('btnVoz').setAttribute('aria-pressed', silenciada);
  $('btnVoz').hidden = !hayVoz;
}
$('btnAuto').onclick = () => alternarAutomatico();
$('intervaloAuto').value = String(leer('intervalo_auto', 8));
$('intervaloAuto').onchange = e => { guardar('intervalo_auto', +e.target.value); if (automatico && !sorteando) programarSiguiente(); };
$('selectorVoz').onchange = e => cambiarVoz(e.target.value);
$('btnVoz').onclick = () => { guardar('voz_silencio', !vozSilenciada()); if (vozSilenciada()) window.speechSynthesis?.cancel(); pintarVoz(); };
function pintarPremios() {
  const definidos = Object.entries(NOMBRES_PREMIO).filter(([tipo]) => estado.premios[tipo]);
  $('panelPremios').hidden = !definidos.length;
  $('listaPremios').innerHTML = definidos.map(([tipo, nombre]) => `<li><span>${nombre}</span><b>${escaparHtml(estado.premios[tipo])}</b></li>`).join('');
}
function cargarPremios() {
  document.querySelectorAll('[data-premio]').forEach(campo => { campo.value = estado.premios[campo.dataset.premio] ?? ''; });
  pintarPremios();
}
$('tarjetasPremios').innerHTML = Object.entries(NOMBRES_PREMIO).map(([tipo, nombre]) =>
  `<label class="ficha ficha-premio"><span class="ficha-cabecera"><span class="ficha-etiqueta">${nombre}</span><span class="mini-patron">${dibujarPatron(tipo)}</span></span><input data-premio="${tipo}" maxlength="40" placeholder="Premio" aria-label="Premio de ${nombre}" autocomplete="off"><span class="ficha-pastilla">${DESCRIPCION_PATRON[tipo]}</span></label>`).join('');

// Tarjeta para la imagen del QR: se sube cuando ya exista el dominio y se guarda en el navegador
function pintarQrImagen() {
  const imagen = leer('qr_imagen', null);
  $('qrImagen').hidden = !imagen; $('qrVacio').hidden = !!imagen; $('qrQuitar').hidden = !imagen;
  if (imagen) $('qrImagen').src = imagen;
  $('qrSubir').textContent = imagen ? 'Cambiar imagen' : 'Subir imagen';
}
$('qrSubir').onclick = () => $('qrArchivo').click();
$('qrArchivo').onchange = e => {
  const archivo = e.target.files[0];
  if (!archivo) return;
  const origen = new Image(), direccion = URL.createObjectURL(archivo);
  origen.onload = () => {
    const escala = Math.min(1, 480 / Math.max(origen.width, origen.height));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(origen.width * escala); lienzo.height = Math.round(origen.height * escala);
    lienzo.getContext('2d').drawImage(origen, 0, 0, lienzo.width, lienzo.height);
    guardar('qr_imagen', lienzo.toDataURL('image/png'));
    URL.revokeObjectURL(direccion); pintarQrImagen();
  };
  origen.onerror = () => { URL.revokeObjectURL(direccion); $('qrVacio').hidden = false; $('qrVacio').textContent = 'No se pudo leer la imagen. Prueba con PNG o JPG.'; };
  origen.src = direccion; e.target.value = '';
};
$('qrQuitar').onclick = () => { localStorage.removeItem(PREFIJO + 'qr_imagen'); $('qrVacio').textContent = 'Aquí irá la imagen del QR'; pintarQrImagen(); };

$('tarjetasPremios').addEventListener('input', e => {
  const campo = e.target.closest('[data-premio]');
  if (!campo) return;
  estado.premios[campo.dataset.premio] = campo.value.trim();
  persistir(); pintarPremios();
});

$('btnGanadores').onclick = () => {
  const entregados = estado.premiosEntregados;
  $('resumenGanadores').textContent = entregados.length ? `${entregados.length} premio${entregados.length === 1 ? '' : 's'} entregado${entregados.length === 1 ? '' : 's'}` : 'Aún no se ha entregado ningún premio.';
  $('listaGanadores').innerHTML = entregados.length
    ? entregados.map((p, i) => {
      const premio = (p.premio ?? estado.premios[p.tipo]) || '';
      return `<li class="ficha"><div class="ficha-cabecera"><span class="ficha-etiqueta">${NOMBRES_PREMIO[p.tipo]}</span>${ico('trofeo', 'Premio ganado')}</div><strong class="ficha-valor">${premio ? escaparHtml(premio) : '<span class="suave">Sin premio</span>'}</strong><input class="nombre-ganador" data-i="${i}" value="${escaparHtml(p.nombre || '')}" placeholder="Tabla ${p.idTabla}" maxlength="30" aria-label="Nombre del ganador" autocomplete="off"><span class="ficha-pastilla">Jugada ${p.jugadaValidada}${p.hora ? ' · ' + formatearHora(new Date(p.hora)) : ''}</span></li>`;
    }).join('')
    : '<li class="ficha ficha-vacia suave">Aún no hay ganadores.</li>';
  $('dlgGanadores').showModal();
};
$('listaGanadores').addEventListener('input', e => {
  const campo = e.target.closest('.nombre-ganador');
  if (!campo) return;
  estado.premiosEntregados[+campo.dataset.i].nombre = campo.value.trim();
  persistir();
});
$('cerrarGanadores').onclick = () => $('dlgGanadores').close();
$('btnEmpezar').onclick = empezar;
$('btnSortear').onclick = sortear;
$('btnVerificar').onclick = verificarVictoria;
$('btnNueva').onclick = () => {
  if (!confirm('¿Empezar una nueva partida? Se borrará la actual.')) return;
  detenerTemporizador(); automatico = false;
  estado = nuevaPartida(estado.premios); persistir(); prepararOrden(); cargarPremios(); pintar(); animarEntrada($('previa'));
};
function alternarPantallaCompleta() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}
document.addEventListener('fullscreenchange', () => {
  const activa = !!document.fullscreenElement;
  document.body.classList.toggle('pantalla-completa', activa);
  $('btnPantalla').querySelector('span').textContent = activa ? 'Salir de pantalla completa' : 'Pantalla completa';
});
$('btnPantalla').onclick = alternarPantallaCompleta;
addEventListener('resize', () => document.body.classList.toggle('pantalla-completa', !!document.fullscreenElement || innerHeight >= screen.height - 2));
addEventListener('keydown', e => {
  if (e.repeat || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || document.querySelector('dialog[open]')) return;
  const enBoton = e.target.tagName === 'BUTTON';
  if (e.code === 'Enter' && !$('previa').hidden && !enBoton) empezar();
  if (e.code === 'Space' && !$('juego').hidden && (!enBoton || e.target.id === 'btnSortear')) { e.preventDefault(); automatico ? alternarAutomatico(false) : sortear(); }
  if (e.ctrlKey || e.metaKey || $('juego').hidden) return;
  if (e.code === 'KeyV') verificarVictoria();
  if (e.code === 'KeyN') $('btnNueva').click();
});

persistir(); prepararOrden(); pintarVoz(); cargarPremios(); pintarQrImagen(); pintar();
if (estado.estado === 'en_juego') { document.body.dataset.pantallaEncendida = '1'; mantenerPantallaEncendida(); }
avisarPartidaGuardada();
