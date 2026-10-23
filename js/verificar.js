montarBarra('Verificar victoria', AYUDA_ANFITRION);
const estado = leer('anfitrion', null);
$('opcionesPremio').innerHTML = Object.entries(NOMBRES_PREMIO).map(([tipo, nombre], i) =>
  `<label class="opcion"><input type="radio" name="premio" value="${tipo}"${i ? '' : ' checked'}><span>${nombre}</span></label>`).join('');
$('btnVolver').onclick = () => {
  if (estado) { estado.estado = 'en_juego'; estado.reclamoActual = null; guardar('anfitrion', estado); }
  location.href = 'anfitrion.html';
};

// Cuenta las jugadas hechas hasta la hora indicada (hh:mm:ss)
function jugadaPorHora(texto, jugadas) {
  const partes = texto.split(':').map(Number);
  if (partes.length !== 3 || partes.some(n => !Number.isInteger(n) || n < 0) || jugadas.some(j => !j.hora)) return null;
  const [h, m, s] = partes;
  if (h > 23 || m > 59 || s > 59) return null;
  const limite = h * 3600 + m * 60 + s;
  return jugadas.filter(j => { const f = new Date(j.hora); return f.getHours() * 3600 + f.getMinutes() * 60 + f.getSeconds() <= limite; }).length;
}

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
    let hasta = Math.min(total, Math.max(0, +$('campoJugada').value || 0));
    const textoHora = $('campoHora').value.trim();
    if (textoHora) {
      const calculada = jugadaPorHora(textoHora, estado.jugadas);
      if (calculada === null) { $('error').textContent = 'Hora no válida (usa hh:mm:ss) o la partida no tiene horas guardadas.'; return; }
      hasta = calculada; $('campoJugada').value = calculada;
    }
    const tipo = document.querySelector('input[name=premio]:checked').value;
    const r = verificarReclamo(estado.codigoSala, idTabla, tipo, estado.jugadas, hasta);
    dibujarTabla($('tabla'), r.tabla, r.marcadas, null, r.ganadoras, 'ganadora');
    $('vacio').hidden = true;
    const zona = $('zonaResultado');
    zona.hidden = false; zona.classList.remove('entra'); void zona.offsetWidth; zona.classList.add('entra');
    $('resultado').className = 'resultado ' + (r.valido ? 'valido' : 'invalido');
    $('resultado').innerHTML = ico(r.valido ? 'verificar' : 'fallo', r.valido ? 'Válido' : 'Inválido') + `<span>${r.valido ? 'VÁLIDO' : 'INVÁLIDO'}</span>`;
    $('datosResultado').innerHTML = `<span class="chip">Tabla ${idTabla}</span><span class="chip">${NOMBRES_PREMIO[tipo]}</span>${estado.premios?.[tipo] ? `<span class="chip">Premio: ${escaparHtml(estado.premios[tipo])}</span>` : ''}<span class="chip">Jugada ${hasta} de ${total}</span>`;
    if (r.valido && !estado.premiosEntregados.some(p => p.idTabla === idTabla && p.tipo === tipo)) {
      estado.premiosEntregados.push({ idTabla, tipo, jugadaValidada: hasta, hora: Date.now(), premio: estado.premios?.[tipo] || '' });
      guardar('anfitrion', estado);
    }
  };
}
addEventListener('keydown', e => { if (e.code === 'Escape' && !document.querySelector('dialog[open]')) $('btnVolver').click(); });
