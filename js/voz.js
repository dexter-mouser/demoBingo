// Voz que canta cada número con la síntesis de voz del navegador
const NOMBRES_LETRA = { B: 'Be', I: 'I', N: 'Ene', G: 'Ge', O: 'O' };
const hayVoz = 'speechSynthesis' in window;
let vozElegida = null;

function elegirVoz() {
  const voces = speechSynthesis.getVoices();
  vozElegida = voces.find(v => /^es[-_](CO|MX|US|419)/i.test(v.lang)) || voces.find(v => /^es/i.test(v.lang)) || null;
}
if (hayVoz) { elegirVoz(); speechSynthesis.addEventListener('voiceschanged', elegirVoz); }

const vozSilenciada = () => leer('voz_silencio', false);

function hablarNumero(letra, numero, alTerminar) {
  if (!hayVoz || vozSilenciada()) return alTerminar?.();
  speechSynthesis.cancel();
  const frase = new SpeechSynthesisUtterance(`${NOMBRES_LETRA[letra]}, ${numero}`);
  frase.lang = vozElegida?.lang || 'es-ES';
  if (vozElegida) frase.voice = vozElegida;
  frase.rate = 0.9;
  let terminado = false;
  const terminar = () => { if (!terminado) { terminado = true; alTerminar?.(); } };
  frase.onend = frase.onerror = terminar;
  setTimeout(terminar, 4000); // respaldo si el navegador no avisa
  speechSynthesis.speak(frase);
}
