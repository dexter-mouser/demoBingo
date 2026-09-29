const DURACION_ANIMACION_MS = 2500;
montarBarra('Anfitrión');

const nuevaPartida = () => ({ codigoSala: generarCodigo(), semillaSorteo: crearSemilla(), jugadas: [], estado: 'esperando', reclamoActual: null, premiosEntregados: [] });
let estado = leer('anfitrion', null) || nuevaPartida();
if (estado.estado === 'verificando') location.replace('verificar.html');
let ordenSorteo = [], sorteando = false;

const prepararOrden = () => { ordenSorteo = barajar(Array.from({ length: 75 }, (_, i) => i + 1), crearGenerador(estado.semillaSorteo)); };
const persistir = () => guardar('anfitrion', estado);

$('numeros').innerHTML = LETRAS.map(letra => `<span class="letra">${letra}</span>`).join('') +
  Array.from({ length: 75 }, (_, i) => { const numero = (i % 5) * 15 + Math.floor(i / 5) + 1; return `<span class="n" id="n${numero}">${numero}</span>`; }).join('');

function pintar() {
  const enEspera = estado.estado === 'esperando';
  $('previa').hidden = !enEspera;
  $('juego').hidden = enEspera;
  $('codigoGrande').textContent = $('codigoSala').textContent = estado.codigoSala;
  const jugadas = estado.jugadas, ultima = jugadas.at(-1), terminado = jugadas.length >= 75;
  $('contador').textContent = jugadas.length;
  $('restantes').textContent = 75 - jugadas.length;
  $('barra').style.width = (jugadas.length / 75 * 100) + '%';
  document.querySelectorAll('.n').forEach(n => n.className = 'n');
  jugadas.forEach(j => $('n' + j.numero).classList.add('sale'));
  if (ultima) $('n' + ultima.numero).classList.add('ultimo');
  $('numeroActual').textContent = ultima ? ultima.letra + ultima.numero : '—';
  $('historial').innerHTML = jugadas.slice(-8).reverse().map(j => `<li><b>#${j.indice}</b> ${j.letra}${j.numero}</li>`).join('');
  $('btnSortear').disabled = sorteando || terminado;
  $('btnVerificar').disabled = sorteando;
  $('mensaje').textContent = terminado ? 'Se cantaron todos los números' : (ultima ? '' : 'Presiona Espacio para sortear');
}

function sortear() {
  if (sorteando || estado.estado !== 'en_juego' || estado.jugadas.length >= 75) return;
  sorteando = true;
  pintar();
  const numero = ordenSorteo[estado.jugadas.length];
  const terminar = () => {
    estado.jugadas.push({ indice: estado.jugadas.length + 1, letra: letraDe(numero), numero });
    persistir();
    sorteando = false;
    pintar();
    const titulo = $('numeroActual');
    titulo.classList.remove('entra'); void titulo.offsetWidth; titulo.classList.add('entra');
  };
  if (reducirMovimiento) return terminar();
  $('escenario').classList.add('girando');
  const cambio = setInterval(() => { const r = 1 + Math.floor(Math.random() * 75); $('numeroActual').textContent = letraDe(r) + r; }, 80);
  setTimeout(() => { clearInterval(cambio); $('escenario').classList.remove('girando'); terminar(); }, DURACION_ANIMACION_MS);
}

function empezar() { estado.estado = 'en_juego'; persistir(); pintar(); }
function verificarVictoria() {
  if (sorteando) return;
  estado.estado = 'verificando';
  estado.reclamoActual = { jugadaCongelada: estado.jugadas.length };
  persistir();
  location.href = 'verificar.html';
}

$('btnEmpezar').onclick = empezar;
$('btnSortear').onclick = sortear;
$('btnVerificar').onclick = verificarVictoria;
$('btnNueva').onclick = () => {
  if (!confirm('¿Empezar una nueva partida? Se borrará la actual.')) return;
  estado = nuevaPartida(); persistir(); prepararOrden(); pintar();
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
addEventListener('keydown', e => {
  if (e.code === 'F5' && !e.ctrlKey) { e.preventDefault(); if (!e.repeat) alternarPantallaCompleta(); return; }
  if (e.repeat || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || document.querySelector('dialog[open]')) return;
  const enBoton = e.target.tagName === 'BUTTON';
  if (e.code === 'Enter' && !$('previa').hidden && !enBoton) empezar();
  if (e.code === 'Space' && !$('juego').hidden && (!enBoton || e.target.id === 'btnSortear')) { e.preventDefault(); sortear(); }
});

persistir(); prepararOrden(); pintar();
