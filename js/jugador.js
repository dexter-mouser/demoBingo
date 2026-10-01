montarBarra('Jugador', AYUDA_JUGADOR);
const PANTALLAS = ['pantallaCodigo', 'pantallaTablas', 'pantallaJuego', 'pantallaReclamo'];
const marcasIniciales = () => Object.assign(Array(25).fill(false), { 12: true });
let datos = leer('jugador', { codigoSala: '', idTabla: '', marcas: marcasIniciales() });
if (datos.idTabla && !esTablaValida(datos.idTabla)) datos.idTabla = '';
let tablaElegida = '';
const persistir = () => guardar('jugador', datos);

function irA(id) {
  PANTALLAS.forEach(p => $(p).hidden = p !== id);
  const pantalla = $(id);
  pantalla.classList.remove('entra'); void pantalla.offsetWidth; pantalla.classList.add('entra');
}
function mostrarCatalogo() {
  $('catalogo').innerHTML = Array.from({ length: TOTAL_TABLAS }, (_, i) => `<button class="btn" data-id="${nombreTabla(i + 1)}">${nombreTabla(i + 1)}</button>`).join('');
  $('catalogo').querySelectorAll('button').forEach(b => b.onclick = () => {
    tablaElegida = b.dataset.id;
    dibujarTabla($('vistaPrevia'), generarTabla(datos.codigoSala, tablaElegida), marcasIniciales());
    $('btnElegir').disabled = false;
  });
  $('vistaPrevia').innerHTML = ''; $('btnElegir').disabled = true;
  irA('pantallaTablas');
}
function pintarJuego() {
  $('salaJuego').textContent = datos.codigoSala;
  $('tablaJuego').textContent = datos.idTabla;
  dibujarTabla($('tablero'), generarTabla(datos.codigoSala, datos.idTabla), datos.marcas, i => {
    if (i === 12) return;
    datos.marcas[i] = !datos.marcas[i]; persistir(); pintarJuego();
  });
  const premios = premiosPosibles(datos.marcas);
  $('btnPremio').disabled = !premios.length;
  $('btnPremio').querySelector('span').textContent = premios.length ? 'Cantar ' + NOMBRES_PREMIO[premios.at(-1)] : 'Cantar premio';
}

$('formCodigo').onsubmit = e => {
  e.preventDefault();
  const codigo = $('campoCodigo').value.trim().toUpperCase();
  if (!/^[A-Z0-9]{4}$/.test(codigo)) { $('errorCodigo').textContent = 'El código tiene 4 letras o números.'; return; }
  $('errorCodigo').textContent = '';
  datos = { codigoSala: codigo, idTabla: '', marcas: marcasIniciales() }; persistir();
  mostrarCatalogo();
};
$('btnOtroCodigo').onclick = () => irA('pantallaCodigo');
$('btnElegir').onclick = () => { datos.idTabla = tablaElegida; datos.marcas = marcasIniciales(); persistir(); pintarJuego(); irA('pantallaJuego'); };
$('btnCambiar').onclick = () => {
  if (!confirm('¿Cambiar de código? Saldrás de esta sala y se borrarán tus marcas.')) return;
  datos = { codigoSala: '', idTabla: '', marcas: marcasIniciales() }; persistir();
  $('campoCodigo').value = '';
  irA('pantallaCodigo');
};
$('btnPremio').onclick = () => {
  const premios = premiosPosibles(datos.marcas);
  if (!premios.length) return;
  $('reclamoTabla').textContent = datos.idTabla;
  $('reclamoPremio').textContent = NOMBRES_PREMIO[premios.at(-1)];
  irA('pantallaReclamo');
};
$('btnVolverTabla').onclick = () => irA('pantallaJuego');

if (datos.idTabla) { pintarJuego(); irA('pantallaJuego'); }
else if (datos.codigoSala) mostrarCatalogo();
else irA('pantallaCodigo');
