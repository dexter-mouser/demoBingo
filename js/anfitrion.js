const DURACION_ANIMACION_MS = 2500;
montarBarra('Anfitrión', AYUDA_ANFITRION);

const nuevaPartida = () => ({ codigoSala: generarCodigo(), semillaSorteo: crearSemilla(), jugadas: [], estado: 'esperando', reclamoActual: null, premiosEntregados: [] });
let estado = leer('anfitrion', null) || nuevaPartida();
if (estado.estado === 'verificando') location.replace('verificar.html');
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

function empezar() {
  estado.estado = 'en_juego'; persistir(); pintar();
  sessionStorage.setItem('bingo_sesion', '1');
  document.body.dataset.pantallaEncendida = '1'; mantenerPantallaEncendida();
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
  estado = nuevaPartida(); persistir(); prepararOrden(); pintar();
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
$('btnVoz').onclick = () => { guardar('voz_silencio', !vozSilenciada()); if (vozSilenciada()) window.speechSynthesis?.cancel(); pintarVoz(); };
$('btnGanadores').onclick = () => {
  $('listaGanadores').innerHTML = estado.premiosEntregados.length
    ? estado.premiosEntregados.map(p => `<li><b>${NOMBRES_PREMIO[p.tipo]}</b> · Tabla ${p.idTabla} · jugada ${p.jugadaValidada}${p.hora ? ' · ' + formatearHora(new Date(p.hora)) : ''}</li>`).join('')
    : '<li class="suave">Aún no hay ganadores.</li>';
  $('dlgGanadores').showModal();
};
$('cerrarGanadores').onclick = () => $('dlgGanadores').close();
$('btnEmpezar').onclick = empezar;
$('btnSortear').onclick = sortear;
$('btnVerificar').onclick = verificarVictoria;
$('btnNueva').onclick = () => {
  if (!confirm('¿Empezar una nueva partida? Se borrará la actual.')) return;
  detenerTemporizador(); automatico = false;
  estado = nuevaPartida(); persistir(); prepararOrden(); pintarVoz(); pintar();
if (estado.estado === 'en_juego') { document.body.dataset.pantallaEncendida = '1'; mantenerPantallaEncendida(); }
avisarPartidaGuardada();
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

persistir(); prepararOrden(); pintar();
