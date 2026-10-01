montarBarra('Verificar victoria');
$('campoPremio').innerHTML = Object.entries(NOMBRES_PREMIO).map(([tipo, nombre]) => `<option value="${tipo}">${nombre}</option>`).join('');
const estado = leer('anfitrion', null);
$('btnVolver').onclick = () => {
  if (estado) { estado.estado = 'en_juego'; estado.reclamoActual = null; guardar('anfitrion', estado); }
  location.href = 'anfitrion.html';
};

if (!estado) {
  $('formulario').hidden = true;
  $('contenido').insertAdjacentHTML('afterbegin', '<p>No hay una partida activa. Crea una desde el anfitrión.</p>');
} else {
  const total = estado.jugadas.length;
  $('campoJugada').max = total;
  $('campoJugada').value = estado.reclamoActual?.jugadaCongelada ?? total;
  $('formulario').onsubmit = evento => {
    evento.preventDefault();
    const idTabla = normalizarTabla($('campoTabla').value);
    if (!esTablaValida(idTabla)) { $('error').textContent = `Código de tabla no válido. Usa de 001 a ${nombreTabla(TOTAL_TABLAS)}.`; return; }
    $('error').textContent = '';
    const hasta = Math.min(total, Math.max(0, +$('campoJugada').value || 0));
    const tipo = $('campoPremio').value;
    const r = verificarReclamo(estado.codigoSala, idTabla, tipo, estado.jugadas, hasta);
    dibujarTabla($('tabla'), r.tabla, r.marcadas);
    $('zonaResultado').hidden = false;
    $('resultado').className = 'resultado ' + (r.valido ? 'valido' : 'invalido');
    $('resultado').textContent = (r.valido ? 'VÁLIDO · ' : 'INVÁLIDO · ') + NOMBRES_PREMIO[tipo];
    $('detalle').textContent = `Verificado hasta la jugada ${hasta} de ${total}`;
    if (r.valido && !estado.premiosEntregados.some(p => p.idTabla === idTabla && p.tipo === tipo)) {
      estado.premiosEntregados.push({ idTabla, tipo, jugadaValidada: hasta });
      guardar('anfitrion', estado);
    }
  };
}
