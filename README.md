# Bingo Local

Aplicación web para jugar bingo de forma presencial, sin servidor ni base de datos. Todo funciona en el navegador con `localStorage`.

- El **anfitrión** (PC) canta los números, lleva la cronología de la partida y verifica los premios.
- Los **jugadores** (celular) eligen una tabla predefinida y la marcan de forma manual mientras el anfitrión canta los números.

El anfitrión muestra los números en pantalla (o proyector) y los jugadores los siguen a la vista o de viva voz. Los celulares no reciben los números automáticamente: cada jugador marca su propia tabla.

---

## 1. Páginas

| Archivo | Vista | Dispositivo |
|---|---|---|
| `index.html` | Menú con **Anfitrión** y **Jugador** | Ambos |
| `anfitrion.html` | Pantalla previa (sala de espera) y dashboard del sorteo | PC |
| `verificar.html` | Verificación de una tabla reclamada | PC |
| `jugador.html` | Ingreso de código, elección de tabla y juego | Celular |

---

## 2. Códigos y semillas

Cada partida usa dos valores aleatorios, ambos generados por el anfitrión al crear la sala:

| Valor | Quién lo conoce | Para qué sirve |
|---|---|---|
| `codigoSala` (ej. `K7QF`) | Anfitrión y jugadores | Genera el catálogo de tablas predefinidas. Los jugadores lo escriben al entrar. |
| `semillaSorteo` (número) | Solo el anfitrión | Define el orden completo en que salen los números 1–75. |

Se mantienen separados para que ningún jugador pueda calcular los números futuros a partir del código que conoce.

### Generador con semilla
Se usa un generador pseudoaleatorio determinista (por ejemplo **mulberry32**). Con la misma semilla siempre produce la misma secuencia, lo que permite:
- Reconstruir cualquier tabla solo con `codigoSala` + código de tabla.
- Reproducir el orden del sorteo si la página del anfitrión se recarga.

---

## 3. Tablas predefinidas

- Al ingresar el `codigoSala`, el celular genera un catálogo de tablas numeradas (`T-001`, `T-002`, …).
- Cada tabla se obtiene con `generarTabla(codigoSala, idTabla)`, así el anfitrión y el jugador construyen exactamente la misma tabla.
- Reglas de cada tabla (5×5):

| Columna | Rango | Cantidad |
|---|---|---|
| B | 1–15 | 5 números |
| I | 16–30 | 5 números |
| N | 31–45 | 4 números + casilla libre al centro |
| G | 46–60 | 5 números |
| O | 61–75 | 5 números |

Sin números repetidos dentro de una misma tabla.

---

## 4. Vista Anfitrión (`anfitrion.html`)

La vista tiene dos pantallas: la **pantalla previa** y el **dashboard del sorteo**. Se muestra una u otra según el `estado` guardado de la partida.

### 4.1 Pantalla previa a la partida (`estado: "esperando"`)

Se muestra al entrar como anfitrión y sirve para que los jugadores se unan antes de empezar.

- Al abrirla se genera la sala (`codigoSala` y `semillaSorteo`) y se guarda.
- El **código de sala** aparece en tamaño muy grande, pensado para proyectarlo o dictarlo.
- Botón **Empezar partida** (también con la tecla `Enter`).
- Al empezar, el estado pasa a `"en_juego"` y se muestra el dashboard con el tablero vacío.
- Si se recarga la página antes de empezar, se conserva el mismo código de sala.

### 4.2 Dashboard del sorteo (`estado: "en_juego"`)

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
│   [ ▶ Sortear (Espacio) ]        [ ✔ Verificar victoria ]     │
└───────────────────────────────────────────────────────────────┘
```

**Zona derecha: tablero general**
- Muestra los 75 números en cinco columnas (B, I, N, G y O) de 15 números cada una, ocupando todo el alto disponible.
- Cada número se **ilumina** cuando sale en el sorteo, siguiendo el orden de la cronología (`jugadas`).
- El último número salido tiene un resaltado distinto (pulso) para distinguirlo de los anteriores.
- Al recargar la página, el tablero se reconstruye iluminando todos los números de `jugadas`.

**Zona central: número actual**
- El número que acaba de salir se muestra en un título `<h2>` grande dentro de una balota de color de acento (`N15`), para que todos los presentes lo vean.
- Encima del título está la **zona de animación** del sorteo.
- Antes del primer sorteo muestra un texto de inicio (por ejemplo "Presiona Espacio para sortear").

**Zona izquierda: información**
- Tarjetas con la jugada actual y los números restantes, y una barra de progreso del sorteo.
- Historial de las últimas jugadas con su número de jugada (`#12 N15`).
- El código de sala aparece en la franja superior.

**Franja superior**
- Botón pequeño **Nueva partida**, con confirmación, que vuelve a la pantalla previa con una sala nueva.

### 4.3 Menú inferior (tipo inventario)

Barra fija en la parte más baja de la pantalla, con casillas grandes como un inventario. Contiene dos opciones:

| Opción | Acción | Atajo |
|---|---|---|
| **Sortear** | Saca el siguiente número con animación | Clic o barra espaciadora |
| **Verificar victoria** | Congela la partida y abre la verificación (ver sección 7) | Clic |

Reglas de las opciones:
- **Sortear** se deshabilita mientras dura la animación, durante la verificación y cuando ya salieron los 75 números (en ese caso se muestra "Se cantaron todos los números").
- **Verificar victoria** se deshabilita mientras dura la animación, para no congelar una jugada a medias.
- Un botón deshabilitado se ve atenuado y no responde a clic ni a teclado.

### 4.4 Sorteo y animaciones

**Cómo se elige el número:** el siguiente número es siempre `ordenSorteo[jugadas.length]`, es decir, el que sigue en el orden definido por `semillaSorteo`. La animación es solo visual: el resultado ya está decidido.

**Duración:** cada animación dura entre **2 y 3 segundos** (`DURACION_ANIMACION_MS = 2500`) y siempre termina sola; nunca queda en bucle. Las animaciones son grandes y ocupan la zona central para que se vean bien.

La animación es un anillo que gira alrededor del número mientras este cambia rápidamente hasta fijarse en el resultado.

**Secuencia de un sorteo:**
1. El anfitrión hace clic en **Sortear** o presiona la barra espaciadora.
2. Se bloquean **Sortear** y **Verificar victoria** (`sorteando = true`).
3. Se reproduce la animación (2–3 segundos).
4. Al terminar, se agrega la jugada a `jugadas`, se guarda el estado, el `<h2>` muestra el número y se ilumina en el tablero.
5. Se desbloquean los botones.

Si se recarga la página durante una animación, la jugada aún no se había guardado, así que el siguiente sorteo entrega el mismo número.

### 4.5 Atajos de teclado

| Tecla | Pantalla | Acción |
|---|---|---|
| `Enter` | Previa | Empezar partida |
| `Espacio` | Dashboard | Sortear |

Reglas de la barra espaciadora:
- Se evita el desplazamiento de la página (`preventDefault`).
- Se ignora si el foco está en un campo de texto.
- Se ignora si la tecla se mantiene presionada (`event.repeat`), para no sortear varias veces seguidas.
- Se ignora mientras el botón **Sortear** esté deshabilitado.

---

## 5. Vista Jugador (`jugador.html`)

### Flujo
1. **Ingresar `codigoSala`**.
2. **Elegir tabla** del catálogo.
3. **Jugar**: ver la tabla y marcar los números manualmente.

### Marcado manual
- El jugador toca cada casilla para marcarla o desmarcarla.
- La casilla libre viene marcada.
- Las marcas se guardan en el `localStorage` del celular, así no se pierden si se cierra o recarga la página.

### Botón de premio
- Siempre visible en la pantalla de juego.
- Permanece **deshabilitado** hasta que las marcas del jugador forman una condición de victoria; entonces se habilita e indica el tipo (`Línea`, `Bingo`, …).
- Al pulsarlo se muestra una **pantalla de reclamo** con letras grandes: código de la tabla y tipo de premio, para que el anfitrión los introduzca. El jugador también avisa en voz alta.
- Las marcas del jugador solo sirven para habilitar el botón; **no cuentan como prueba**. El anfitrión siempre recalcula todo desde su propia cronología.

### Condiciones de victoria
Se definen como listas de posiciones de la tabla 5×5:
- **Línea**: cualquier fila, columna o diagonal completa.
- **Cuatro esquinas**.
- **Bingo**: las 25 casillas.
- Se pueden agregar patrones nuevos como datos, sin tocar la lógica de verificación.

---

## 6. Estado del anfitrión (`localStorage`)

Todo el estado de la partida vive en el navegador del anfitrión:

```js
estadoAnfitrion = {
  codigoSala: "K7QF",
  semillaSorteo: 918273645,
  jugadas: [],                 // [{ indice: 1, letra: "B", numero: 3 }, ...]
  estado: "esperando",         // "esperando" | "en_juego" | "verificando" | "terminada"
  reclamoActual: null,         // { idTabla, tipo, jugadaCongelada }
  premiosEntregados: []        // { idTabla, tipo, jugadaValidada }
}
```

Cada acción (empezar, sortear, verificar) guarda el estado completo. Si se recarga la página, el anfitrión retoma la partida tal como estaba, en la pantalla que corresponda a su `estado`. El indicador `sorteando` solo existe en memoria: no se guarda.

---

## 7. Verificación y cronología

> La cronología es la del anfitrión. Un reclamo hecho en la jugada N se verifica **solo con las primeras N jugadas**, aunque la partida ya haya avanzado.

### Flujo de un reclamo
1. Un jugador canta bingo (o línea) y muestra la pantalla de reclamo de su celular.
2. El anfitrión pulsa **Verificar victoria** en el menú inferior:
   - Se bloquea el sorteo (no se pueden sacar más números).
   - Se guarda `jugadaCongelada = jugadas.length`.
   - El estado pasa a `"verificando"` y se abre `verificar.html`.
3. En `verificar.html` el anfitrión introduce el **código de tabla** y el **tipo de premio** que muestra el celular del jugador.
4. Se muestra el resultado de la verificación.
5. Con **Volver al bingo** se regresa al dashboard con la partida exactamente donde quedó (mismas jugadas, mismo número en el `<h2>`, mismo tablero iluminado). El sorteo se reanuda desde ahí.

**Volver al bingo** está disponible en todo momento, también antes de introducir el código, por si se pulsó **Verificar victoria** por error.

### Ajuste del punto de verificación
Si el anfitrión tardó en pulsar **Verificar victoria** y salió un número de más, en `verificar.html` puede cambiar el campo **"Verificar hasta la jugada"** eligiendo la jugada correcta del historial (por defecto es `jugadaCongelada`). Ese valor es el que fija la cronología del reclamo.

### Algoritmo de verificación

```js
function verificarReclamo(codigoSala, idTabla, tipo, jugadas, hastaJugada) {
  const tabla = generarTabla(codigoSala, idTabla);
  const numerosValidos = new Set(
    jugadas.slice(0, hastaJugada).map(jugada => jugada.numero)
  );
  // La casilla libre siempre cuenta como marcada
  const casillasMarcadas = tabla.casillas.map(
    casilla => casilla.libre || numerosValidos.has(casilla.numero)
  );
  return cumplePatron(casillasMarcadas, tipo);
}
```

Puntos importantes:
- Solo se usan `jugadas[0 .. hastaJugada - 1]`; los números cantados después se ignoran.
- Ejemplo: si el bingo se canta en la jugada 1 y la partida ya va por la jugada 30, la tabla se revisa únicamente contra la jugada 1.
- Si dos jugadores cantan casi a la vez, el anfitrión los atiende **uno por uno**, respetando el orden en que los cantaron; cada verificación usa su propia jugada.
- Si el reclamo es válido se guarda en `premiosEntregados` con la jugada validada; si no lo es, se informa y la partida continúa.

---

## 8. Vista de verificación (`verificar.html`)

Muestra:
- Formulario inicial: código de tabla, tipo de premio y campo **"Verificar hasta la jugada"** (`Enter` para verificar).
- La tabla reconstruida con las casillas marcadas **hasta la jugada verificada**.
- El patrón ganador resaltado, o las casillas que faltan si no es válido.
- Indicador: `Verificado hasta la jugada 12 de 27`.
- Resultado grande: **VÁLIDO / INVÁLIDO**.
- Botón **Volver al bingo**.

---

## 9. Estructura del proyecto

```
bingo/
├── README.md
├── index.html
├── anfitrion.html
├── verificar.html
├── jugador.html
├── estilos/style.css
└── js/
    ├── nucleo.js      # Semillas, tablas, patrones, verificación y localStorage
    ├── interfaz.js    # Iconos SVG, tema claro/oscuro, acento, ayuda y dibujo de tablas
    ├── anfitrion.js   # Pantalla previa, sorteo y menú del anfitrión
    ├── verificar.js   # Verificación cronológica
    └── jugador.js     # Código, catálogo de tablas, marcado y reclamo
```

## 10. Personalización

- **Tema:** sigue la preferencia del sistema hasta que se pulsa el botón de sol o luna.
- **Color de acento:** cinco colores predefinidos o un selector libre; se guarda en el navegador.
- **Cómo jugar:** botón de ayuda en la barra superior de todas las pantallas.
- **Movimiento reducido:** si el sistema lo pide, se desactivan transiciones y el sorteo se muestra al instante.

## 11. Uso

Abre `index.html` en el navegador. Para probar en un solo equipo, abre el anfitrión y el jugador en pestañas distintas.
