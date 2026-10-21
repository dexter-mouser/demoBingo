// Voz que canta cada número con la síntesis de voz del navegador
const NOMBRES_LETRA = { B: 'B', I: 'I', N: 'E', G: 'G', O: 'O' };
const hayVoz = 'speechSynthesis' in window;
let vozElegida = null;

// Prefiere voces naturales (Edge «Natural», Google, Apple) y evita las sintéticas
const puntuarVoz = v => (/natural|neural|online/i.test(v.name) ? 4 : 0) + (/google/i.test(v.name) ? 3 : 0)
  + (/premium|enhanced|siri|paulina|m[oó]nica|luciana/i.test(v.name) ? 3 : 0) + (/es[-_](MX|US|419|CO)/i.test(v.lang) ? 1 : 0)
  - (/espeak|compact/i.test(v.name) ? 5 : 0);
const vocesEnEspanol = () => speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang)).sort((a, b) => puntuarVoz(b) - puntuarVoz(a));

function elegirVoz() {
  const lista = vocesEnEspanol(), guardada = leer('voz_nombre', null);
  vozElegida = lista.find(v => v.name === guardada) || lista[0] || null;
  const selector = document.getElementById('selectorVoz');
  if (!selector) return;
  selector.innerHTML = lista.map(v => `<option value="${escaparHtml(v.name)}"${v === vozElegida ? ' selected' : ''}>${escaparHtml(v.name)}</option>`).join('');
  selector.hidden = lista.length < 2;
}
if (hayVoz) { elegirVoz(); speechSynthesis.addEventListener('voiceschanged', elegirVoz); }

const vozSilenciada = () => leer('voz_silencio', false);
function cambiarVoz(nombre) { guardar('voz_nombre', nombre); elegirVoz(); hablarNumero('B', 7); }

function hablarNumero(letra, numero, alTerminar) {
  if (!hayVoz || vozSilenciada()) return alTerminar?.();
  speechSynthesis.cancel();
  const frase = new SpeechSynthesisUtterance(`${NOMBRES_LETRA[letra]}, ${numero}`);
  frase.lang = vozElegida?.lang || 'es-ES';
  if (vozElegida) frase.voice = vozElegida;
  frase.rate = 1;
  let terminado = false;
  const terminar = () => { if (!terminado) { terminado = true; alTerminar?.(); } };
  frase.onend = frase.onerror = terminar;
  setTimeout(terminar, 4000); // respaldo si el navegador no avisa
  speechSynthesis.speak(frase);
}
