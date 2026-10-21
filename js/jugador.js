montarBarra('Jugador', AYUDA_JUGADOR);
const PANTALLAS = ['pantallaCodigo', 'pantallaTablas', 'pantallaJuego', 'pantallaReclamo'];
const MAX_TABLAS = 2;
const marcasIniciales = () => Object.assign(Array(25).fill(false), { 12: true });
const datosVacios = () => ({ codigoSala: '', tablas: [], premios: '' });

function cargarDatos() {
  const guardados = leer('jugador', null);
  if (!guardados) return datosVacios();
  if (guardados.idTabla && esTablaValida(guardados.idTabla)) { // formato con una sola tabla
    return { codigoSala: guardados.codigoSala, tablas: [{ idTabla: guardados.idTabla, marcas: guardados.marcas }], premios: '' };
  }
  return { ...datosVacios(), ...guardados, tablas: (guardados.tablas || []).filter(t => esTablaValida(t.idTabla)) };
}
let datos = cargarDatos();
let seleccion = [];
const persistir = () => guardar('jugador', datos);

function irA(id) {
  PANTALLAS.forEach(p => $(p).hidden = p !== id);
  const pantalla = $(id);
  pantalla.classList.remove('entra'); void pantalla.offsetWidth; pantalla.classList.add('entra');
}

// --- Elegir tablas
function pintarVistaPrevia() {
  $('vistaPrevia').innerHTML = seleccion.map(id => `<div><p class="suave">Tabla ${id}</p><div></div></div>`).join('');
  seleccion.forEach((id, i) => dibujarTabla($('vistaPrevia').children[i].lastElementChild, generarTabla(datos.codigoSala, id), marcasIniciales()));
  $('btnElegir').disabled = !seleccion.length;
  $('catalogo').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', seleccion.includes(b.dataset.id)));
}
function mostrarCatalogo() {
  seleccion = [];
  $('catalogo').innerHTML = Array.from({ length: TOTAL_TABLAS }, (_, i) => `<button class="btn" data-id="${nombreTabla(i + 1)}" aria-pressed="false">${nombreTabla(i + 1)}</button>`).join('');
  $('campoPremios').value = datos.premios;
  pintarVistaPrevia();
  irA('pantallaTablas');
}
$('catalogo').onclick = e => {
  const id = e.target.closest('button')?.dataset.id;
  if (!id) return;
  seleccion = seleccion.includes(id) ? seleccion.filter(x => x !== id) : [...seleccion, id].slice(-MAX_TABLAS);
  pintarVistaPrevia();
};

// --- Juego: cada tabla se dibuja una vez; al marcar solo cambia esa casilla
function construirJuego() {
  mantenerPantallaEncendida();
  $('salaJuego').textContent = datos.codigoSala;
  $('premiosJuego').hidden = !datos.premios;
  $('premiosJuego').textContent = datos.premios ? 'Premios: ' + datos.premios : '';
  $('tablas').innerHTML = datos.tablas.map((t, i) => `<article class="tarjeta-tabla"><h2>Tabla ${t.idTabla}</h2><div></div><p class="aviso" hidden>¡Te falta 1 casilla! Mira las de borde punteado.</p><button class="btn primario" data-cantar="${i}">${ico('verificar', 'Cantar')}<span>¡Cantar!</span></button></article>`).join('');
  datos.tablas.forEach((t, i) => {
    dibujarTabla($('tablas').children[i].children[1], generarTabla(datos.codigoSala, t.idTabla), t.marcas, j => marcar(i, j));
    actualizarTabla(i);
  });
}
function marcar(i, j) {
  if (j === 12) return;
  const t = datos.tablas[i];
  t.marcas[j] = !t.marcas[j];
  const casilla = $('tablas').children[i].children[1].children[5 + j];
  casilla.classList.toggle('marcada', t.marcas[j]);
  casilla.setAttribute('aria-pressed', t.marcas[j]);
  vibrarAlMarcar(); persistir(); actualizarTabla(i);
}
function actualizarTabla(i) {
  const tarjeta = $('tablas').children[i], marcas = datos.tablas[i].marcas, faltan = casillasQueFaltan(marcas);
  tarjeta.children[1].querySelectorAll('.casilla').forEach((c, j) => c.classList.toggle('falta', faltan.has(j)));
  tarjeta.children[2].hidden = !faltan.size;
  tarjeta.children[3].disabled = !premiosPosibles(marcas).length;
}
$('tablas').addEventListener('click', e => {
  const boton = e.target.closest('[data-cantar]');
  if (!boton || boton.disabled) return;
  const idTabla = datos.tablas[+boton.dataset.cantar].idTabla, hora = formatearHora(new Date());
  $('reclamoTabla').textContent = idTabla;
  $('reclamoHora').textContent = hora;
  $('reclamoMensaje').textContent = `Tabla ${idTabla} cantó a las ${hora}`;
  irA('pantallaReclamo');
});

// --- Navegación
$('formCodigo').onsubmit = e => {
  e.preventDefault();
  const codigo = $('campoCodigo').value.trim().toUpperCase();
  if (!/^[A-Z0-9]{4}$/.test(codigo)) { $('errorCodigo').textContent = 'El código tiene 4 letras o números.'; return; }
  $('errorCodigo').textContent = '';
  datos = { ...datosVacios(), codigoSala: codigo }; persistir();
  mostrarCatalogo();
};
$('btnOtroCodigo').onclick = () => irA('pantallaCodigo');
$('btnElegir').onclick = () => {
  datos.tablas = seleccion.map(idTabla => ({ idTabla, marcas: marcasIniciales() }));
  datos.premios = $('campoPremios').value.trim();
  persistir(); construirJuego(); irA('pantallaJuego');
};
$('btnCambiar').onclick = () => {
  if (!confirm('¿Cambiar de código? Saldrás de esta sala y se borrarán tus marcas.')) return;
  datos = datosVacios(); persistir(); $('campoCodigo').value = '';
  irA('pantallaCodigo');
};
$('btnVolverTabla').onclick = () => irA('pantallaJuego');

if (datos.tablas.length) { construirJuego(); irA('pantallaJuego'); }
else if (datos.codigoSala) mostrarCatalogo();
else irA('pantallaCodigo');
