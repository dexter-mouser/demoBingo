# Bingo Local

Aplicación web para jugar bingo de forma presencial, sin servidor ni base de datos. Todo funciona en el navegador con `localStorage`.

- El **anfitrión** (pensado para PC) pacta los premios, saca los números, lleva la cronología de la partida y verifica las victorias.
- Los **jugadores** (pensados para celular) entran con un código de sala, eligen hasta 2 tablas y las marcan a mano mientras el anfitrión canta los números.

El anfitrión muestra los números en su pantalla (o en un proyector) y los jugadores los siguen a la vista o de viva voz. Los celulares no reciben los números automáticamente: cada jugador marca sus propias tablas.

---

## 1. Utilidades

- Sorteo de los números 1–75 con animación visible de 2,5 segundos y tablero que se ilumina según la cronología.
- Sorteo automático con intervalos de 5, 8, 12 o 20 segundos.
- Voz que canta cada número, con silencio y selector de voz.
- Premios pactados por el anfitrión antes de empezar, uno por cada condición de victoria.
- Catálogo de 60 tablas predefinidas (`001` a `060`), hasta 2 por jugador.
- Cinco premios: línea, dos líneas, cuatro esquinas, X y bingo.
- Aviso «¡Te falta 1!» en el celular del jugador.
- Mensaje con hora y segundos al cantar un premio.
- Verificación de victorias respetando la cronología: se revisa solo hasta la jugada en que se cantó, con el patrón ganador resaltado.
- Registro de ganadores con el premio pactado y nombre editable.
- Tarjeta para subir la imagen del QR de ingreso a la sala.
- Aviso de partida guardada al volver al anfitrión.
- Galería de patrones de premio y guías de ayuda para jugadores y anfitriones.
- Tema claro y oscuro, color de acento personalizable y diseño adaptado a PC y celular.

---

## 2. Cómo se usa

### Anfitrión
1. Desde el inicio, entra a **Anfitrión**. Aparece la pantalla previa con el **código de sala**.
2. Escribe, si quieres, el premio de cada condición de victoria y sube la imagen del QR de ingreso.
3. Comparte el código con los jugadores y pulsa **Empezar partida** (o `Enter`).
4. Pulsa **Sortear** (o la barra espaciadora) para sacar cada número, o activa **Sorteo automático**.
5. Si alguien canta, pulsa **Verificar victoria** (o `V`). El sorteo queda detenido.
6. Escribe el código de tabla, elige el premio y pulsa **Verificar**. El resultado es **VÁLIDO** o **INVÁLIDO**.
7. Pulsa **Volver al bingo** (o `Esc`) para continuar exactamente donde se dejó la partida.
8. Consulta **Ganadores** en cualquier momento y personaliza el nombre de cada ganador.

### Jugador
1. Desde el inicio, entra a **Jugador** y escribe el código de sala (4 letras o números).
2. Toca hasta 2 códigos del catálogo para ver las tablas y pulsa **Jugar**. Recuerda sus códigos: se necesitan para verificar.
3. Toca cada número que el anfitrión cante para marcarlo; vuelve a tocarlo para desmarcarlo. El centro ya viene marcado.
4. Cuando una tabla cumple un premio se habilita el botón **¡Cantar!** que está debajo de ella. Púlsalo, avisa en voz alta y muestra la pantalla al anfitrión (código de tabla y hora con segundos).
5. Con **Cambiar de código** se sale de la sala y se puede entrar a otra.

---

## 3. Pantallas

| Archivo | Pantalla | Dispositivo |
|---|---|---|
| `index.html` | Inicio con accesos a Anfitrión y Jugador y botón **Cómo jugar** | Ambos |
| `anfitrion.html` | Pantalla previa y dashboard del sorteo | PC |
| `verificar.html` | Verificación de una tabla | PC |
| `jugador.html` | Código de sala, catálogo de tablas, juego y reclamo | Celular |

### Pantalla previa del anfitrión
Una fila superior con dos recuadros del mismo tamaño (el código a la izquierda y el cuadro de la imagen del QR a la derecha) y, debajo, un recuadro con las tarjetas de premio organizadas con flexbox (3 por fila en PC; se acomodan en pantallas más estrechas):

- **Código de sala:** en un recuadro con el título «Sala lista» y el código en grande, para proyectarlo o dictarlo.
- **Imagen del QR:** cuadro del mismo tamaño que el del código, a su derecha, para subir una imagen (PNG o JPG), por ejemplo el QR de la página. Se reduce a un máximo de 480 px y se guarda en el navegador; se puede cambiar o quitar y se conserva entre partidas.
- **Premios de la partida:** un recuadro con una tarjeta por cada condición (línea, dos líneas, cuatro esquinas, X y bingo) ordenadas en cuadrícula. Cada una muestra el dibujo del patrón, un campo para escribir el premio y una descripción corta. La sexta casilla de la cuadrícula es la tarjeta con el botón **Empezar partida**.


### Dashboard del anfitrión

```
┌───────────────────────────────────────────────────────────────┐
│ [ Sala K7QF ]                    [Ganadores] [Nueva partida]  │
├────────────┬──────────────────────────────┬───────────────────┤
│ Jugada  12 │                              │  B   I   N  G   O │
│ Restan  63 │        ╭──────────╮          │  1  16  31 46  61 │
│ ▓▓░░░░░░░░ │        │   N15    │          │  2  17  32 47  62 │
│ Premios    │        ╰──────────╯          │  3  18  33 48  63 │
│ Historial  │      (balota y animación)    │  …   …   …  …   … │
│ #12 N15    │                              │ 15  30  45 60  75 │
├────────────┴──────────────────────────────┴───────────────────┤
│ [Sortear] [Automático 8 s] [Voz] [Verificar] [Pantalla compl.]│
└───────────────────────────────────────────────────────────────┘
```

- **Tablero (derecha):** los 75 números en cinco columnas (B, I, N, G, O). Cada número se ilumina al salir; el último tiene un resaltado propio.
- **Centro:** el número recién salido en un título `<h2>` dentro de una balota de color de acento, visible para todos. Con el sorteo automático activo muestra una barra de cuenta regresiva.
- **Panel izquierdo:** jugada actual, números restantes, barra de progreso, premios pactados (solo los que tienen texto) e historial de las últimas jugadas.
- **Menú inferior:** **Sortear**, **Sorteo automático** con selector de intervalo, **Voz** con selector de voz (si el navegador ofrece varias), **Verificar victoria** y **Pantalla completa**.
- El dashboard se ajusta al alto de la ventana para verse completo sin desplazarse.

### Ganadores
Un diálogo con un resumen («2 premios entregados») y una tarjeta por ganador: condición, trofeo, premio pactado en grande, nombre editable (muestra el código de tabla mientras esté vacío) y una pastilla con la jugada y la hora.

### Verificación (`verificar.html`)
Dos columnas en PC: a la izquierda el formulario en tres pasos (código de tabla, premio y jugada) y a la derecha el resultado, con el icono de VÁLIDO o INVÁLIDO, etiquetas con tabla, premio, premio pactado y jugada, y la tabla con el patrón ganador resaltado. En celular se apilan.

---

## 4. Cómo funciona

### Sala y semillas
Al crear la sala se generan dos valores aleatorios:

| Valor | Quién lo conoce | Para qué sirve |
|---|---|---|
| `codigoSala` (4 caracteres) | Anfitrión y jugadores | Genera el catálogo de tablas. Los jugadores lo escriben al entrar. |
| `semillaSorteo` (número) | Solo el anfitrión | Define el orden completo en que salen los 75 números. |

El código usa letras y números sin caracteres ambiguos (no incluye `I`, `O`, `0` ni `1`). Se mantienen separados para que ningún jugador pueda calcular los números futuros a partir del código que conoce. Ambos valores usan un generador pseudoaleatorio con semilla (mulberry32): la misma semilla siempre produce la misma secuencia, lo que permite recuperar el sorteo al recargar la página.

### Tablas
- Cada tabla se obtiene con `generarTabla(codigoSala, idTabla)`, así el celular del jugador y el anfitrión construyen exactamente la misma tabla.
- El código de tabla son solo tres dígitos (`001` a `060`). En la verificación basta escribir `1` para que se complete a `001`.
- Cada tabla es de 5×5 y no repite números:

| Columna | Rango | Cantidad |
|---|---|---|
| B | 1–15 | 5 números |
| I | 16–30 | 5 números |
| N | 31–45 | 4 números + casilla libre al centro |
| G | 46–60 | 5 números |
| O | 61–75 | 5 números |

### Sorteo
- El siguiente número es siempre el que sigue en el orden definido por `semillaSorteo`. La animación es solo visual.
- Cada sorteo dura 2,5 segundos y termina sola: un anillo gira alrededor de la balota mientras el número cambia hasta fijarse en el resultado.
- Durante la animación **Sortear** y **Verificar victoria** quedan bloqueados.
- Al terminar, la jugada se guarda con su hora, el `<h2>` muestra el número y el tablero lo ilumina.
- Si la página se recarga durante una animación, esa jugada aún no estaba guardada y el siguiente sorteo entrega el mismo número.
- Al llegar a 75 jugadas **Sortear** se deshabilita y se muestra «Se cantaron todos los números».
- Si el sistema pide reducir el movimiento, no hay animación y el número aparece al instante.

### Sorteo automático
Saca un número cada intervalo elegido (5, 8, 12 o 20 segundos; se guarda la preferencia). Espera a que termine la voz antes de empezar la cuenta, se detiene al verificar, al iniciar una nueva partida o al llegar a 75, y la barra espaciadora lo pausa. Mientras está activo, **Sortear** queda deshabilitado.

### Voz
Al terminar la animación se dice la letra y el número con la síntesis de voz del navegador. Elige la voz en español que suene más natural (prefiere las «Natural», «Online» o de Google y evita las sintéticas básicas); si hay varias, un selector permite escoger otra, y al cambiarla suena una muestra. El botón **Voz** la silencia y la preferencia se guarda. Si el navegador no tiene voz en español, el botón se oculta y el juego sigue en silencio.

### Premios

| Premio | Condición |
|---|---|
| Línea | Una fila, columna o diagonal completa |
| Dos líneas | Dos filas, columnas o diagonales completas, en cualquier combinación |
| Cuatro esquinas | Las cuatro esquinas de la tabla |
| X | Las dos diagonales completas |
| Bingo | Las 25 casillas |

- La casilla libre del centro siempre cuenta como marcada.
- Los patrones están definidos como datos en `nucleo.js`, por lo que se pueden agregar otros sin cambiar la lógica de verificación.
- Los premios pactados (por ejemplo «Línea: $1000») los escribe el anfitrión en la pantalla previa. Se ven en el panel izquierdo del dashboard, en el resultado de la verificación y en el registro de ganadores. Al iniciar una nueva partida se conservan los de la anterior. Los jugadores no los ven en su celular.

### Experiencia del jugador
- **¡Cantar!:** se habilita cuando las marcas de una tabla cumplen algún premio, sin indicar cuál: el jugador debe estar atento al premio que se juega. Cada tabla tiene su propio botón.
- **¡Te falta 1!:** las casillas a las que les falta una sola para completar un patrón se resaltan con borde punteado y un aviso bajo la tabla.
- **Reclamo:** al cantar se muestra el código de tabla, la hora con segundos y el mensaje «Tabla 014 cantó a las 20:47:32».
- **Vibración y pantalla encendida:** en celular vibra al marcar; en PC se mantiene la pantalla encendida mientras se juega.
- Las marcas del jugador solo sirven para habilitar el botón y **no cuentan como prueba**: el anfitrión siempre recalcula todo desde su propia cronología.

### Verificación y cronología

> La cronología es la del anfitrión. Un premio cantado en la jugada N se verifica **solo con las primeras N jugadas**, aunque la partida ya haya avanzado.

1. Al pulsar **Verificar victoria** se detiene el sorteo y se guarda la jugada actual como punto de verificación.
2. En `verificar.html` el anfitrión escribe el código de tabla, elige el premio y define la jugada de una de dos formas: escribiendo la **hora del reclamo** que muestra el celular del jugador (la jugada se calcula sola con la hora de cada número) o cambiando **«Verificar hasta la jugada»**. Por defecto es la jugada en que se detuvo la partida.
3. La verificación reconstruye la tabla y solo considera los números de las primeras N jugadas:

```js
function verificarReclamo(codigoSala, idTabla, tipo, jugadas, hastaJugada) {
  const tabla = generarTabla(codigoSala, idTabla);
  const validos = new Set(jugadas.slice(0, hastaJugada).map(jugada => jugada.numero));
  const marcadas = tabla.casillas.map(casilla => casilla.libre || validos.has(casilla.numero));
  const valido = cumplePatron(marcadas, tipo);
  return { tabla, marcadas, valido, ganadoras: valido ? celdasDelPremio(marcadas, tipo) : new Set() };
}
```

4. Se muestra la tabla con las casillas marcadas hasta esa jugada (si es válido, el patrón ganador se resalta con otro color), el resultado **VÁLIDO / INVÁLIDO** y el indicador `Jugada 12 de 27`.
5. Los premios válidos se guardan en el registro de ganadores con su hora y el premio pactado de ese momento (sin duplicar el mismo premio de la misma tabla).
6. **Volver al bingo** reanuda la partida con las mismas jugadas, el mismo número en pantalla y el tablero iluminado igual. Está disponible en todo momento, también antes de escribir el código.

Ejemplo: si el bingo se canta en la jugada 1 y la partida ya va por la jugada 30, la tabla se revisa únicamente contra la jugada 1. Si dos jugadores cantan casi a la vez, se verifican uno por uno, cada uno con su propia jugada.

### Partida guardada
Al abrir el anfitrión con una partida en curso aparece un aviso para **Continuar** o empezar una **Nueva partida**. Solo se muestra una vez por pestaña, por lo que no molesta al volver desde la verificación ni al recargar.

### Estado y almacenamiento
Todo se guarda en el `localStorage` de cada dispositivo (claves con prefijo `bingo_`):

- **Anfitrión:** `bingo_anfitrion`

```js
estadoAnfitrion = {
  codigoSala: "K7QF",
  semillaSorteo: 918273645,
  jugadas: [],                 // [{ indice: 1, letra: "B", numero: 3, hora: 1730000000000 }, ...]
  estado: "esperando",         // "esperando" | "en_juego" | "verificando"
  reclamoActual: null,         // { jugadaCongelada }
  premiosEntregados: [],       // { idTabla, tipo, jugadaValidada, hora, premio, nombre }
  premios: {}                  // premio pactado por condición: { linea: "$1000", bingo: "Gorra" }
}
```

- **Jugador:** `bingo_jugador` guarda el código de sala, las tablas elegidas (hasta 2) y sus marcas, por lo que se conservan si se cierra o se recarga la página.
- **Apariencia y ajustes:** `bingo_tema`, `bingo_acento`, `bingo_intervalo_auto`, `bingo_voz_silencio`, `bingo_voz_nombre` y `bingo_qr_imagen`.

Cada acción del anfitrión guarda el estado completo. Al recargar, retoma la partida en la pantalla que corresponde a su `estado`: la previa, el dashboard o la verificación.

---

## 5. Atajos de teclado

| Tecla | Dónde | Acción |
|---|---|---|
| `Enter` | Pantalla previa | Empezar partida |
| `Espacio` | Dashboard | Sortear, o pausar el sorteo automático |
| `V` | Dashboard | Verificar victoria |
| `N` | Dashboard | Nueva partida (pide confirmación) |
| `Esc` | Verificación | Volver al bingo |
| `F11` | Anfitrión | Pantalla completa del navegador (también oculta la barra superior) |

Los atajos se ignoran si el foco está en un campo de texto, si hay un diálogo abierto o si se mantiene la tecla presionada. En pantalla completa se oculta la barra superior para aprovechar todo el espacio.

---

## 6. Personalización y accesibilidad

- **Tema:** claro y oscuro definidos con variables CSS. Por defecto sigue la preferencia del sistema hasta que se pulsa el botón de sol o luna.
- **Color de acento:** cinco colores predefinidos (uno de ellos el verde `#008608` del icono) o un selector libre; se usa en botones principales, iconos activos y elementos destacados, y se guarda en el navegador. El color del texto sobre el acento se ajusta solo para mantener el contraste.
- **Patrones:** botón en la barra superior de todas las pantallas que abre la galería de premios; las cuadrículas se generan a partir de la definición de cada premio y se construyen solo la primera vez que se abren.
- **Ayuda:** botón en la barra superior. En el inicio muestra dos pestañas, «Soy jugador» y «Soy anfitrión»; en la vista del jugador solo explica cómo jugar y en la del anfitrión solo cómo administrar la sala. Ambas guías incluyen una historia de usuario y pasos muy sencillos.
- **Gráficos:** iconos e ilustraciones en SVG en línea que heredan los colores del tema; tipografía del sistema, sin fuentes ni librerías externas.
- **Movimiento suave:** las balotas de la ilustración de inicio flotan despacio y, al empezar la partida, la pantalla previa se desvanece antes de que entre el dashboard. Solo se animan `transform` y `opacity`, y todo se desactiva si el sistema pide reducir el movimiento.
- **Accesibilidad:** contraste suficiente en ambos temas, `aria-label` en los SVG, áreas seguras del dispositivo (notch y barra inferior) y transiciones breves que se desactivan si el sistema pide reducir el movimiento.

---

## 7. Estructura del proyecto

```
bingo/
├── README.md
├── index.html
├── anfitrion.html
├── verificar.html
├── jugador.html
├── estilos/
│   └── style.css
├── img/
│   └── icono.svg
└── js/
    ├── nucleo.js      # Semillas, tablas, premios, verificación y localStorage
    ├── interfaz.js    # Iconos SVG, tema, acento, ayuda, patrones y dibujo de tablas
    ├── voz.js         # Voz que canta cada número
    ├── anfitrion.js   # Pantalla previa, sorteo, menú y ganadores
    ├── verificar.js   # Verificación cronológica
    └── jugador.js     # Código de sala, catálogo, marcado y reclamo
```

`nucleo.js` e `interfaz.js` se cargan en todas las páginas para que las tablas generadas sean idénticas en el celular y en el anfitrión. Los estilos de las tarjetas de la pantalla previa y del diálogo de ganadores están en un bloque `<style>` dentro de `anfitrion.html`.

---

## 8. Requisitos y límites

- Basta abrir `index.html` en un navegador moderno; no hay instalación ni servidor.
- Cada dispositivo tiene su propio `localStorage`: el celular del jugador no se conecta con el equipo del anfitrión. La sincronización es presencial (el anfitrión canta y los jugadores marcan).
- Para probar en un solo equipo, abre el anfitrión y el jugador en pestañas distintas.
- Mantener la pantalla encendida en PC solo funciona en HTTPS o `localhost`, no abriendo el archivo directamente. En iOS no hay vibración.
- La voz depende de las voces en español que tenga el navegador y el sistema.
- La imagen del QR se sube desde la pantalla previa y se guarda en el navegador del anfitrión.
- Las partidas guardadas antes de que existiera la hora de cada jugada no sirven para calcular la jugada a partir de la hora del reclamo.
- Borrar los datos del navegador elimina la partida guardada.
