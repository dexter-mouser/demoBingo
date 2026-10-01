# Bingo Local

Aplicación web para jugar bingo de forma presencial, sin servidor ni base de datos. Todo funciona en el navegador con `localStorage`.

- El **anfitrión** (pensado para PC) saca los números, lleva la cronología de la partida y verifica los premios.
- Los **jugadores** (pensados para celular) entran con un código de sala, eligen una tabla y la marcan a mano mientras el anfitrión canta los números.

El anfitrión muestra los números en su pantalla (o en un proyector) y los jugadores los siguen a la vista o de viva voz. Los celulares no reciben los números automáticamente: cada jugador marca su propia tabla.

---

## 1. Utilidades

- Sorteo de los números 1–75 con animación visible de 2 a 3 segundos.
- Catálogo de 60 tablas predefinidas (`001` a `060`) que el anfitrión puede reconstruir solo con su código.
- Cinco premios: línea, dos líneas, cuatro esquinas, X y bingo.
- Verificación de victorias respetando la cronología: se revisa solo hasta la jugada en que se cantó.
- Pantalla previa con el código de sala y vista de anfitrión de pantalla completa.
- Guías de ayuda para jugadores y para anfitriones, explicadas de forma muy sencilla.
- Tema claro y oscuro, color de acento personalizable y diseño adaptado a PC y celular.

---

## 2. Cómo se usa

### Anfitrión
1. Desde el inicio, entra a **Anfitrión**. Aparece la pantalla previa con el **código de sala** en grande.
2. Comparte el código con los jugadores y pulsa **Empezar partida** (o `Enter`).
3. Pulsa **Sortear** (o la barra espaciadora) para sacar cada número. Espera a que termine la animación antes de sacar otro.
4. Si alguien canta un premio, pulsa **Verificar victoria**. El sorteo queda detenido.
5. Escribe el código de tabla del jugador, elige el premio y pulsa **Verificar**. El resultado es **VÁLIDO** o **INVÁLIDO**.
6. Pulsa **Volver al bingo** para continuar exactamente donde se dejó la partida.

### Jugador
1. Desde el inicio, entra a **Jugador** y escribe el código de sala (4 letras o números).
2. Elige una tabla del catálogo (toca un código para ver cómo es) y pulsa **Jugar con esta tabla**. Recuerda su código: se necesita para verificar.
3. Toca cada número que el anfitrión cante para marcarlo; vuelve a tocarlo para desmarcarlo. El centro ya viene marcado.
4. Cuando la tabla cumple un premio se habilita **Cantar premio**. Púlsalo, avisa en voz alta y muestra la pantalla al anfitrión (código de tabla y premio).
5. Con **Cambiar de código** se sale de la sala y se puede entrar a otra.

---

## 3. Pantallas

| Archivo | Pantalla | Dispositivo |
|---|---|---|
| `index.html` | Inicio con accesos a Anfitrión y Jugador y botón **Cómo jugar** | Ambos |
| `anfitrion.html` | Pantalla previa y dashboard del sorteo | PC |
| `verificar.html` | Verificación de una tabla | PC |
| `jugador.html` | Código de sala, catálogo de tablas, juego y reclamo | Celular |

### Dashboard del anfitrión

```
┌───────────────────────────────────────────────────────────────┐
│ [ Sala K7QF ]                                [Nueva partida]  │
├────────────┬──────────────────────────────┬───────────────────┤
│ Jugada  12 │                              │  B   I   N  G   O │
│ Restan  63 │        ╭──────────╮          │  1  16  31 46  61 │
│ ▓▓░░░░░░░░ │        │   N15    │          │  2  17  32 47  62 │
│ Historial  │        ╰──────────╯          │  3  18  33 48  63 │
│ #12 N15    │      (balota y animación)    │  …   …   …  …   … │
│ #11 B3     │                              │ 15  30  45 60  75 │
├────────────┴──────────────────────────────┴───────────────────┤
│   [ ▶ Sortear ]   [ ✔ Verificar victoria ]   [ ⛶ Pantalla ]  │
└───────────────────────────────────────────────────────────────┘
```

- **Tablero (derecha):** los 75 números en cinco columnas (B, I, N, G, O). Cada número se ilumina al salir, siguiendo la cronología; el último tiene un resaltado propio.
- **Centro:** el número recién salido en un título `<h2>` dentro de una balota de color de acento, visible para todos los presentes.
- **Panel izquierdo:** jugada actual, números restantes, barra de progreso e historial de las últimas jugadas (`#12 N15`).
- **Menú inferior:** **Sortear**, **Verificar victoria** y **Pantalla completa**.
- El dashboard se ajusta al alto de la ventana para verse completo sin desplazarse.

---

## 4. Cómo funciona

### Sala y semillas
Al crear la sala se generan dos valores aleatorios:

| Valor | Quién lo conoce | Para qué sirve |
|---|---|---|
| `codigoSala` (4 caracteres) | Anfitrión y jugadores | Genera el catálogo de tablas. Los jugadores lo escriben al entrar. |
| `semillaSorteo` (número) | Solo el anfitrión | Define el orden completo en que salen los 75 números. |

Se mantienen separados para que ningún jugador pueda calcular los números futuros a partir del código que conoce. Ambos valores usan un generador pseudoaleatorio con semilla (mulberry32): la misma semilla siempre produce la misma secuencia, lo que permite recuperar el sorteo al recargar la página.

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
- Al terminar, la jugada se guarda, el `<h2>` muestra el número y el tablero lo ilumina.
- Si la página se recarga durante una animación, esa jugada aún no estaba guardada y el siguiente sorteo entrega el mismo número.
- Al llegar a 75 jugadas **Sortear** se deshabilita y se muestra «Se cantaron todos los números».
- Si el sistema pide reducir el movimiento, no hay animación y el número aparece al instante.

### Premios

| Premio | Condición |
|---|---|
| Línea | Una fila, columna o diagonal completa |
| Dos líneas | Dos filas, columnas o diagonales completas, en cualquier combinación |
| Cuatro esquinas | Las cuatro esquinas de la tabla |
| X | Las dos diagonales completas |
| Bingo | Las 25 casillas |

La casilla libre del centro siempre cuenta como marcada. Los patrones están definidos como datos en `nucleo.js`, por lo que se pueden agregar otros sin cambiar la lógica de verificación.

En el celular del jugador, **Cantar premio** se habilita cuando sus marcas cumplen algún premio y muestra el último que cumple en este orden: línea, dos líneas, cuatro esquinas, X, bingo. Las marcas del jugador solo sirven para habilitar el botón y **no cuentan como prueba**: el anfitrión siempre recalcula todo desde su propia cronología.

### Verificación y cronología

> La cronología es la del anfitrión. Un premio cantado en la jugada N se verifica **solo con las primeras N jugadas**, aunque la partida ya haya avanzado.

1. Al pulsar **Verificar victoria** se detiene el sorteo y se guarda la jugada actual como punto de verificación.
2. En `verificar.html` el anfitrión escribe el código de tabla, elige el premio y, si hace falta, cambia **«Verificar hasta la jugada»**. Por defecto es la jugada en que se detuvo la partida; se puede bajar si salió un número de más antes de pulsar el botón.
3. La verificación reconstruye la tabla y solo considera los números de las primeras N jugadas:

```js
function verificarReclamo(codigoSala, idTabla, tipo, jugadas, hastaJugada) {
  const tabla = generarTabla(codigoSala, idTabla);
  const validos = new Set(jugadas.slice(0, hastaJugada).map(jugada => jugada.numero));
  const marcadas = tabla.casillas.map(casilla => casilla.libre || validos.has(casilla.numero));
  return { tabla, marcadas, valido: cumplePatron(marcadas, tipo) };
}
```

4. Se muestra la tabla con las casillas marcadas hasta esa jugada, el resultado **VÁLIDO / INVÁLIDO**, el premio y el indicador `Verificado hasta la jugada 12 de 27`.
5. Los premios válidos se guardan en `premiosEntregados` (sin duplicar el mismo premio de la misma tabla).
6. **Volver al bingo** reanuda la partida con las mismas jugadas, el mismo número en pantalla y el tablero iluminado igual. Está disponible en todo momento, también antes de escribir el código.

Ejemplo: si el bingo se canta en la jugada 1 y la partida ya va por la jugada 30, la tabla se revisa únicamente contra la jugada 1. Si dos jugadores cantan casi a la vez, se verifican uno por uno, cada uno con su propia jugada.

### Estado y almacenamiento
Todo se guarda en el `localStorage` de cada dispositivo (claves con prefijo `bingo_`):

- **Anfitrión:** `bingo_anfitrion`

```js
estadoAnfitrion = {
  codigoSala: "K7QF",
  semillaSorteo: 918273645,
  jugadas: [],                 // [{ indice: 1, letra: "B", numero: 3 }, ...]
  estado: "esperando",         // "esperando" | "en_juego" | "verificando"
  reclamoActual: null,         // { jugadaCongelada }
  premiosEntregados: []        // { idTabla, tipo, jugadaValidada }
}
```

- **Jugador:** `bingo_jugador` guarda el código de sala, la tabla elegida y las marcas, por lo que se conservan si se cierra o se recarga la página.
- **Apariencia:** `bingo_tema` y `bingo_acento`.

Cada acción del anfitrión guarda el estado completo. Al recargar, retoma la partida en la pantalla que corresponde a su `estado`: la previa, el dashboard o la verificación.

---

## 5. Atajos de teclado

| Tecla | Dónde | Acción |
|---|---|---|
| `Enter` | Pantalla previa | Empezar partida |
| `Espacio` | Dashboard | Sortear |
| `F5` | Anfitrión | Pantalla completa (no recarga la página) |

La barra espaciadora se ignora si el foco está en un campo de texto, si la tecla se mantiene presionada o si **Sortear** está deshabilitado. En pantalla completa se oculta la barra superior para aprovechar todo el espacio.

---

## 6. Personalización y accesibilidad

- **Tema:** claro y oscuro definidos con variables CSS. Por defecto sigue la preferencia del sistema hasta que se pulsa el botón de sol o luna.
- **Color de acento:** cinco colores predefinidos o un selector libre; se usa en botones principales, iconos activos y elementos destacados, y se guarda en el navegador. El color del texto sobre el acento se ajusta solo para mantener el contraste.
- **Icono:** la aplicación tiene un icono SVG (`img/icono.svg`) en verde `#008608`, que también es uno de los colores de acento predefinidos.
- **Ayuda:** botón en la barra superior. En el inicio muestra dos pestañas, «Soy jugador» y «Soy anfitrión»; en la vista del jugador solo explica cómo jugar y en la del anfitrión solo cómo administrar la sala. Ambas guías incluyen una historia de usuario y pasos muy sencillos.
- **Gráficos:** iconos e ilustraciones en SVG en línea que heredan los colores del tema; tipografía del sistema, sin fuentes ni librerías externas.
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
    ├── interfaz.js    # Iconos SVG, tema, acento, guías de ayuda y dibujo de tablas
    ├── anfitrion.js   # Pantalla previa, sorteo, menú y pantalla completa
    ├── verificar.js   # Verificación cronológica
    └── jugador.js     # Código de sala, catálogo, marcado y reclamo
```

`nucleo.js` e `interfaz.js` se cargan en todas las páginas para que las tablas generadas sean idénticas en el celular y en el anfitrión.

---

## 8. Requisitos y límites

- Basta abrir `index.html` en un navegador moderno; no hay instalación ni servidor.
- Cada dispositivo tiene su propio `localStorage`: el celular del jugador no se conecta con el equipo del anfitrión. La sincronización es presencial (el anfitrión canta y los jugadores marcan).
- Para probar en un solo equipo, abre el anfitrión y el jugador en pestañas distintas.
- Borrar los datos del navegador elimina la partida guardada.
