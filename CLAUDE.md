# Agenda Docente — cómo trabajar en este repo

## Cómo comunicarse con la dueña del proyecto

- **Nunca usar los cuadros de opciones para preguntar** (el widget de preguntas con
  botones). Le tildan el celular cuando está trabajando desde ahí. Si hace falta
  preguntar algo, se pregunta **en texto normal**, dentro de la respuesta.
- No es programadora. Cuando hay que hacer algo en una consola web (Firebase, Play
  Console, GitHub, PWABuilder, etc.), dar los pasos concretos ("tocá X, después Y"),
  sin asumir que sabe dónde está cada cosa. Si pide un link, pasarle el link pelado y
  nada más: suele estar en el celu, donde copiar y pegar es un engorro.
- **Dar siempre el link posta (la URL completa y clickeable) de la página a la que hay
  que ir, no solo el nombre del sitio ("andá a pwabuilder.com" no alcanza).** Y guiar
  pantalla por pantalla de una, sin esperar a que ella pida "el link y la guía" — ya
  pasó más de una vez que hubo que pedirlo explícitamente porque quedó descripto en
  general nomás. Esto vale en cualquier chat nuevo, no solo en el que quedó anotado.
- **La guía tiene que venir completa de entrada, no a cuentagotas.** No alcanza con
  describir el paso en general ("completá las opciones de firma") — hay que anotar cada
  valor exacto que tiene que cargar (Package ID, versión, alias, etc.), comparándolo
  contra los datos ya confirmados en este documento, **antes** de decirle que siga. Si
  una pantalla tiene un campo con un valor por default que no coincide con lo
  documentado acá (como el Package ID de PWABuilder, que trae uno genérico tipo
  `io.github...` en vez de `com.estudioam.agendadocente`), avisarlo de una en el mismo
  mensaje que la guía — no esperar a que ella mande una captura y lo note. Pedirle
  capturas de pantalla en cada paso para chequear es válido y bienvenido, pero no como
  sustituto de anticipar los valores correctos: es un chequeo extra, no la primera
  línea de defensa.
- Trabaja desde el celular y desde la compu, alternando. Respuestas cortas.

## Qué es esto

PWA de un solo archivo para docentes (asistencia, notas, cursada): `index.html` tiene
todo el HTML/CSS/JS. No hay build step, ni npm, ni framework. Alrededor:
`service-worker.js`, `manifest.json`, `privacy-policy.html`, los íconos y
`tools/make-icons.py`.

## Pendiente de probar (29/8/2026) — NO se probó todavía en el celular

**Importar contenidos desde un Word o PDF**, en Contenidos → "Importar contenidos desde
un Word o PDF" (dentro de un curso). Se armó y se reordenó la pantalla en esta sesión,
pero nadie lo probó de verdad con un archivo real — solo se chequeó que el diálogo se
vea bien. Falta confirmar que ande en el celular:
- Elegir un `.docx` real y que se lea el texto (usa la librería `mammoth.js`, se carga
  desde `cdnjs.cloudflare.com` la primera vez que hace falta — necesita internet).
- Elegir un `.pdf` real y que se lea el texto (usa `pdf.js`, mismo tema de conexión).
- Que el texto extraído aparezca bien en el cuadro para revisar, y que "Agregar todos"
  cargue cada línea como un contenido separado en "Contenidos propios".
- Si el Word/PDF tiene formato raro (columnas, tablas, texto escaneado sin OCR), ver qué
  tan prolijo sale el texto extraído — puede necesitar bastante edición manual, eso es
  esperable y ya está contemplado (por eso hay un paso de "revisar antes de agregar").

## La escala de valoraciones es POR CURSO, no por cuatrimestre (decidido 29/8/2026)

Decisión de la dueña, textual: la escala existe para que **cada docente elija la que usa
según su materia** (ella, profe de inglés, usa E-VG-G-R; un profe de matemática va a usar
la numérica o E-MB-B-R), no para cambiarla de un cuatrimestre a otro. Lo lógico es que use
la misma en 1° y 2°. **No hace falta partir `valScheme` por cuatrimestre** — se evaluó y se
descartó (además complicaría la tabla de Resumen, que muestra los dos cuatrimestres juntos
con una sola escala y un solo pie de página).

Dónde se elige, después del cambio del 29/8:
- **La ficha del curso → Ciclo lectivo → tarjeta "Valoraciones"**: muestra la escala
  actual con sus niveles de colores y un lápiz para cambiarla. Es la casa principal,
  porque es una decisión del alta del curso.
- El atajo chico **"Valoraciones"** que ya estaba en Clases, al lado del selector de
  cuatrimestre — se dejó igual, sin tocar (venía de reubicarse a mano en commits previos).
- El cuadro que salta solo la primera vez que se generan las clases del curso.

### "Ciclo lectivo" es una sección aparte de "Escuela y horarios" (29/8/2026)

Otra corrección de la dueña, misma sesión: **en "Escuela y horarios" tiene que ir solo lo
que es de la escuela y del horario.** El ciclo lectivo no pinta nada ahí — es su propio
tema, y es adentro de él donde se dividen los cuatrimestres y se elige la escala de
valoraciones. Así quedó "La ficha del curso":

- **Escuela y horarios**: escuela, equipo directivo, días y horario de cursada, notas
  internas, situación de revista, archivar/eliminar el curso.
- **Ciclo lectivo** (`cicloSectionHTML` / `wireCicloSection` en `index.html`): fechas del
  año + "Generar clases", el resumen de los dos cuatrimestres (rango de fechas y cantidad
  de clases de cada uno, con el recordatorio de que el corte lo marca el receso invernal
  que se carga en Calendario), y la tarjeta de Valoraciones.
- Después: Alumnos, Contenidos, Documentos (sin cambios).

Ojo si se toca esto: **"Generar clases" usa los días de clase guardados** (`g.diasClase`),
que se cargan en la otra sección. Si el curso todavía no tiene días, la pantalla muestra un
aviso con un botón para ir a cargarlos, en vez de dejar generar sin nada. Y las pantallas
que antes mandaban a "Escuela y horarios" cuando faltaban clases (Asistencia, Clases,
Resumen) ahora mandan a **Ciclo lectivo**, que es donde se generan.

Si la docente ya eligió una escala en otro curso, los dos cuadros ofrecen arriba un botón
**"Usar la misma que en <curso>"**, para no hacerla buscar de nuevo en cada curso nuevo.

**La escala se puede cambiar SIEMPRE, aunque ya haya notas cargadas** (corregido el
29/8/2026 por la dueña: "no puedo obligar a un profesor a quedarse con lo que eligió").
Antes se bloqueaba; ahora el lápiz está siempre y lo que hay es un aviso. Cómo funciona
(`aplicarValScheme()` en `index.html`, único punto por donde pasan todos los cambios):

- Sin notas cargadas: cambia derecho.
- Con notas cargadas, primero sale el cartel **"Ojo con las notas que ya cargaste"**, que
  dice cuántas son y con qué escala:
  - **Si las dos escalas tienen la misma cantidad de niveles** (el caso típico: pasar de
    E-VG-G-R inglés a E-MB-B-R español), ofrece **convertirlas solas**, mostrando la
    equivalencia como **dos listas, una arriba de la otra y alineadas en columnas** (la
    escala de ahora arriba, la que queda abajo), para poder compararlas de un vistazo. Botones: "Convertir las notas y
    cambiar" / "Cambiar sin convertir" / "Mejor no".
  - **Si tienen distinta cantidad de niveles**, no ofrece convertir (cualquier
    equivalencia sería inventada): avisa que las notas viejas **no se borran** pero dejan
    de verse hasta que vuelva a elegir la escala anterior. Botones: "Cambiar igual" /
    "Mejor no".

Detalles técnicos de la conversión, por si se toca:
- La traducción es nivel por nivel **desde el mejor**, no desde el primero de la lista:
  la escala numérica va al revés (1 es lo más bajo), por eso el preset `num10` lleva
  `asc:true` y `levelsBestFirst()` la da vuelta antes de comparar. Si se agrega otra
  escala ascendente, hay que marcarla igual o la conversión sale invertida.
- Las claves de niveles no se repiten entre escalas, así que el remapeo se puede hacer en
  una sola pasada sin pisarse (`remapValoraciones()`).
- El "Ausente" (`A`) no se toca nunca: no es parte de la escala.
- `countValoraciones()` cuenta solo las notas que usan la escala actual — es el número
  que se le muestra a la docente.

## Exámenes con varias notas y su recuperatorio (29/8/2026)

Una evaluación puede partirse en varias notas (ej.: Vocabulary y Grammar) — eso ya existía
(`e.parts` en `index.html`). Lo que se agregó el 29/8, a pedido de la dueña, es que **el
recuperatorio lleve las mismas notas que la evaluación que recupera**:

- Al crear un recuperatorio se elige de qué evaluación es (eso ya estaba). Si esa
  evaluación tiene partes, **la recu las hereda solas** y el cuadro lo avisa antes de
  crearla. Si después se editan las partes de la evaluación, la recu las sigue.
- En la pantalla del recuperatorio, **cada alumno sólo puede cargar las partes que se
  llevó**: las que ya aprobó (≥ nota de aprobación en la evaluación) salen con "–" y no se
  pueden escribir (`partYaAprobada()` en `renderExam`).
- **La nota final del recuperatorio combina las dos cosas**: para las partes ya aprobadas
  usa la nota vieja de la evaluación, y para las recuperadas la nueva
  (`recomputePartsNota()`). Esa nota es la que reemplaza a la original.
- En la evaluación, la columna RECUP. **se abre en una columna por parte** (RECUP.
  VOCABULARY, RECUP. GRAMMAR), en modo lectura: "–" si esa parte ya estaba aprobada o no la
  rindió, la nota si la recuperó, "A" si faltó.
- Migración de los recuperatorios que ya existían (con una sola nota, como los dejaba la
  versión vieja): esa nota única **es lo que el alumno sacó recuperando**, así que se copia
  a **cada parte que se llevó** — si se llevó las dos, la misma nota va en las dos — y
  después se rearma la nota final combinándola con las partes que ya tenía aprobadas.
  Corre una sola vez, en `migrate()`, cuando el recu todavía no tiene `parts`.
- **En el recuperatorio, faltar cuenta 1 en el promedio** (decisión de la dueña, 29/8:
  "si faltó por lógica es un 1, y el promedio no le da"). Es a propósito distinto de una
  evaluación común, donde un "Ausente" no pesa en el promedio de las partes: ahí todavía
  queda el recuperatorio por delante, acá ya no hay red.
- **Pero el recuperatorio NUNCA baja la nota** (misma sesión, la dueña: "si no, no quieren
  rendir"). En `examEffective()` la nota efectiva es la mejor de las dos: si en la recu le
  fue peor que en la evaluación, vale la original. Vale para las dos formas de recu (el
  examen aparte con `recuOf` y la columna vieja `c.recu`). Ej.: 3 en Vocabulary y 9 en
  Grammar da 6; si falta al recu, la recu calcula (1+9)/2 = 5 pero le queda su 6.

**Por qué se había perdido:** con dos partes + recu no entraban las columnas en el celular
y la columna de nombres se achicaba hasta partir cada apellido letra por letra. Se resolvió
haciendo que la tabla de Exámenes funcione como la de Resumen: **la columna de alumnos
queda fija (`position:sticky`) y las de notas corren al costado**. El borde y el redondeo
viven en `.examgrid-wrap` (el que scrollea), no en `.examgrid`, porque si no el sticky no
funciona.

**En Clases se ve igual (30/8/2026).** El reflejo del examen del día (`renderClaseExam`)
usaba una lista de `.arow` con las notas apretadas al lado del nombre: con dos partes + recu
mostraba una sola columna RECUP. y no entraba nada. Ahora usa **la misma grilla
`.examgrid-wrap` / `.examgrid` de Exámenes** (columna de alumnos fija, notas que corren al
costado) y **abre RECUP. en una columna por parte**, así se ven las cuatro columnas
(VOCABULARY, GRAMMAR, RECUP. VOCABULARY, RECUP. GRAMMAR). Sigue siendo de sólo lectura: se
carga desde Exámenes. Si el bloque del día ES el recuperatorio, la parte que el alumno ya
tenía aprobada sale con "–" azul, igual que en la pantalla del examen.

Dos ajustes de ancho de esa grilla (30/8/2026, pedidos por la dueña):
- **Las columnas de Clases van más angostas** (80 px contra 104 px en Exámenes): la clase
  es de sólo lectura, no tiene el casillero para escribir ni el botón "A", así que no
  necesita tanto lugar. Se hace con la clase `eg-ro` en el `<div class="examgrid">` de
  `renderClaseExam` (regla `.examgrid.eg-ro .eg-col` en el CSS).
- **Cuando sobra ancho, las columnas lo reparten en vez de dejar un hueco a la derecha**
  (`flex:1 0 auto` en `.eg-nm` y `.eg-col`): antes, con una sola columna NOTA —una
  Carpeta, por ejemplo— la tabla quedaba con un vacío grande al costado y los apellidos
  partidos en dos renglones al pedo. Vale para las dos pantallas.

## La "clase de revisión" (corregida el 30/8/2026)

Corrección de la dueña: **revisión es sólo el día anterior a la prueba, y no puede haber
dos días seguidos marcados.** Antes se marcaba cualquier clase cuya clase siguiente
tuviera algo cargado en Exámenes, así que una carpeta o un TP también la disparaban, y el
día del examen quedaba marcado "revisión" porque a la clase siguiente le tocaba otra cosa.
Ahora (`revisionExam()` en `index.html`):

- Sólo cuentan las **evaluaciones, escrita u oral** (`REVISION_TYPES`). **Nada más**
  (precisión de la dueña, misma fecha): ni un recuperatorio, ni una carpeta, ni un TP, ni
  un proyecto, ni una evaluación de intensificación la disparan.
- **El día que tiene la prueba nunca es de revisión**, aunque a la clase siguiente le toque
  otra. Con esas dos reglas no pueden quedar dos días de revisión seguidos.

Y **en la barra de fechas va sólo la fecha**: el aviso salió de ahí y ahora aparece abajo,
junto a los temas del día (`revisionNoteHTML()`, arriba de "Temas y páginas de la clase"),
diciendo qué prueba viene y qué día.

## El contador "X/Y cargadas" del listado de Exámenes no contaba a los Ausentes (30/8/2026)

Bug encontrado por la dueña: en la lista de Exámenes y recup, el número (ej. "17/19
cargadas") nunca llegaba al total en un curso con faltas, aunque no quedara nada por
cargar — todas las filas tenían nota o "A". `examEffective()` devuelve `null` cuando el
alumno está marcado Ausente (el campo `nota` se borra, no se pone en 0 ni en ningún valor),
y el contador sólo miraba `examEffective()!=null`. Arreglado (`renderExam()` en
`index.html`): ahora también cuenta a los ausentes con `gradeAusenteEffective(...,"nota",
e.date)` — un alumno resuelto con "A" ya está resuelto, no le falta nada por cargar.

## Elegir los contenidos de un examen ya creado, desde "Editar" (30/8/2026)

Pedido de la dueña: cuando se olvida elegir los contenidos evaluados al crear el examen
(y ya tiene notas cargadas), no encontraba dónde volver a elegirlos. Existía un link
"+ Agregar"/"Editar" en la tarjeta "Contenidos evaluados" de la pantalla del examen, y
funcionaba bien — el problema era que no estaba en el cuadro **"Editar"** (el lápiz de
arriba, `promptEditExam`), que es donde ella iba a buscarlo.

Se sacó el diálogo de elegir contenidos a una función aparte (`promptEditExamTopics()` en
`index.html`) para no duplicar el código, y ahora se usa desde los dos lugares:
- La tarjeta "Contenidos evaluados" de la pantalla del examen (como antes).
- Un campo nuevo "Contenidos evaluados" **dentro del cuadro "Editar"**, con los chips ya
  elegidos (o "Sin contenidos seleccionados.") y un link "+ Agregar contenidos" / "Editar
  contenidos". Al guardar, vuelve al mismo cuadro "Editar" con la lista actualizada.

## El cuadro "Editar" de un examen, más liviano (30/8/2026)

Pedido de la dueña: el nombre casi siempre queda igual al tipo (ej.: "Evaluación
escrita" y listo), así que mostrar los dos por separado era repetir lo mismo. Y "Link del
examen online" ocupaba un campo grande siempre visible aunque la mayoría de las docentes
no cargan examen online. Se achicó el cuadro (`promptEditExam()` en `index.html`):

- **Tipo y Fecha van en la misma fila** (el tipo elegido a la izquierda, la fecha a la
  derecha), y **"Cambiar tipo" queda debajo** de esa fila, no al lado del chip — así no
  compite por el mismo renglón angosto.
- **Nombre y Link arrancan colapsados**: sólo el título del campo con un lápiz al lado
  (mismo patrón `.titleEdit` que se usa para el nombre del curso). Tocar el lápiz abre el
  campo para escribir. Si ya tienen algo cargado que no sea el default (un nombre propio
  distinto del tipo, o ya hay un link), arrancan abiertos de una — nunca se esconde algo
  que ya está cargado.
- Esto además deja lugar para el campo "Contenidos evaluados" (ver más abajo) sin que el
  cuadro se vuelva interminable.

## Los contenidos de un examen ya no se pueden escribir sueltos ahí mismo (30/8/2026)

Pedido de la dueña: en "Contenidos del examen" (tanto al crear el examen como al editarlo)
había un campo para escribir un contenido extra directo ahí, sin haberlo cargado antes en
"Contenidos". El problema: ese contenido suelto (`e.extraTopics`, texto libre) no tiene el
`id` de la ficha del curso, así que `topicsDesaprobados()` — que arma sola la lista de
pendientes en Intensificación — nunca lo puede detectar como algo que el alumno desaprobó,
porque esa función sólo mira `e.topicIds` (ver `index.html`). Un contenido cargado así
quedaba invisible para Intensificación aunque se viera bien en la pantalla del examen.

Se sacó el campo de texto libre de los dos lugares (`promptNewExam()` y
`promptEditExamTopics()`, compartida entre la tarjeta "Contenidos evaluados" y el cuadro
"Editar"): ahora sólo se puede tildar contenidos que ya estén cargados en "Contenidos". Si
falta algo, el mensaje de ayuda dice cargarlo ahí primero y volver a elegirlo. Los
contenidos sueltos que ya existían de antes (antes de este cambio) se siguen mostrando y se
pueden sacar, sólo que no se pueden agregar más.

## Cada nota de una evaluación partida sabe qué contenidos evalúa (30/8/2026)

El problema que encontró la dueña: si una evaluación se parte en dos notas (Vocabulary y
Grammar) y el alumno saca 9 y 3, el promedio da 6 y queda desaprobada — pero
`topicsDesaprobados()` le mandaba a Intensificación **todos** los contenidos de la
evaluación, incluidos los de vocabulario que sí aprobó. La app ya sabía qué parte
desaprobó cada alumno (las notas por parte se guardan aparte); lo que faltaba era el
puente: **qué contenidos evalúa cada parte**.

Se descartó adivinarlo por el nombre de la parte ("Grammar" → contenidos gramaticales):
andaría con los nombres de ella, pero se rompe con cualquier otro profe ("Teoría/Práctica",
"Reading/Writing", "Parte 1/Parte 2") y cuando adivina mal nadie se entera.

**Cómo quedó (decisión de la dueña): primero se decide si la evaluación se separa en notas,
y después los contenidos se eligen por nota.** En el cuadro de crear la evaluación, el campo
"¿Necesitás poner varias notas?" ya venía **antes** que "Contenidos a evaluar"; ahora,
cuando se escriben las partes, el selector de contenidos se reacomoda solo: pasa de chips
sueltos a **una fila por contenido con las notas al lado** ("Present Perfect · [Vocabulary]
[Grammar]"). Cada contenido va en una sola nota; el que no se toca no entra en el examen.

- Dato nuevo: `e.partTopicIds` — array alineado con `e.parts`. `e.topicIds` se sigue
  guardando como la unión de todos, así nada de lo que ya existía se entera del cambio.
- Funciones nuevas en `index.html`: `examTienePartes()`, `examGruposDeContenidos()`,
  `examPartEffective()` (nota efectiva de UNA parte, con el recu aplicado y sin bajar la
  nota), `selDesdeExamen()` / `selHaciaExamen()`, `examTopicsPickerHTML()` +
  `mountExamTopicsPicker()` (el selector, compartido entre crear y editar) y
  `examTopicsReadHTML()` (la vista de sólo lectura, agrupada por nota — se usa en la
  pantalla del examen y en Clases).
- `topicsDesaprobados()` ahora: si los contenidos están atados a las partes, sólo entran
  los de las partes que quedaron debajo del mínimo. Si no están atados (exámenes viejos, o
  evaluaciones sin partir), se lleva todo lo de esa evaluación como siempre.
- Un contenido elegido que quedó **sin parte** (ej.: se borró una nota después) entra si la
  evaluación quedó desaprobada — el criterio de antes. Por eso ninguna combinación rara
  deja contenidos sin poder aparecer nunca.
- En "Editar", cambiar las partes mantiene la atadura por posición: renombrar no rompe
  nada; sacar una nota deja sus contenidos sueltos (siguen evaluados).

**Ojo si se toca `mountExamTopicsPicker`:** la función que devuelve rehace la lista **sólo
si las partes cambiaron de verdad**. Antes rehacía siempre, y como el campo de las partes
dispara `blur` al tocar un contenido, el primer toque se perdía (encontrado probándolo).

Lo que sigue sin ser exacto, y está bien que así sea: si una evaluación sin partir toca 5
contenidos y el alumno saca 4, no hay forma de saber cuáles falló — se llevan los 5 y la
docente saca con la × los que no correspondan. La lista de Intensificación siempre fue un
punto de partida, no un veredicto.

## Intensificación: la lista de lo que se lleva sale sola, cargue contenidos o no (30/8/2026)

Pedido de la dueña, y cambio de fondo de la pestaña: **cargar contenidos tiene que seguir
siendo opcional.** "Algunos profes son medio vagos y no van a querer cargar todos los
contenidos de la materia, y la idea es que les funcione igual." Y la pestaña estaba pensada
para carga manual de todo, cuando debería salir sola con lo que el alumno debe.

**Cómo se nombra cada cosa pendiente ahora** (`deudaAuto()` en `index.html`):
- Evaluación **con** contenidos cargados → van los contenidos (y si están atados a cada
  nota, sólo los de las notas que se llevó — ver la sección de arriba).
- Evaluación **sin** contenidos, partida en notas → va la nota con su nombre:
  *"✏️ Evaluación escrita — Grammar"*. Si se llevó todas las notas, va la evaluación
  entera (más corto de leer que repetir todas las partes).
- Evaluación **sin** contenidos ni partes → va entera, con el nombre que le puso la
  docente: *"🎤 Unidad 2 — oral"*.
- **Carpeta, TP y proyecto** nunca se dividen en contenidos: si no los aprobó los debe
  enteros, con su nombre (*"📓 Carpeta"*, *"📋 TP de escritura"*, *"🧩 Proyecto final"*).
- Los recuperatorios y las evaluaciones de intensificación no entran (el recu ya se refleja
  en la nota de su evaluación; las de intensificación son de la instancia siguiente).

🚨 **La lista NO se edita a mano (decisión de la dueña, 30/8/2026).** No se puede sacar un
contenido, ni "Carpeta", ni agregar nada: es un espejo de las notas. "Si por algún motivo
el alumno ya mejoró la nota y el profe quiere sacarla de Intensificación, debe ir a
Exámenes y notas y modificarlo desde ahí para que repique acá." Lo único editable por
alumno es un **comentario libre** (`d.comentario`), que se guarda al salir del cuadro (sin
volver a dibujar la pantalla, para no perder el foco mientras se escribe).

Por eso se borraron `d.quitados` / `d.extra` / `setDeudaItem()` / `promptChooseTopics()` /
`deudaLegacy()` y el botón "↩ Volver a poner lo que saqué": `deudaLista()` quedó como un
alias de `deudaAuto()`. `migrarDeuda()` ahora sólo limpia los campos de los formatos viejos
(`topics`, `topicsInit`, `quitados`, `extra`, `debeCarpeta`) y marca `migrado=3`.

**Historia, por si aparece algo raro en datos viejos:** la lista pasó por tres formas —
guardada entera (`d.topics`), después como excepciones sobre lo automático
(`d.quitados`/`d.extra`), y ahora puramente calculada. La versión de excepciones duró unas
horas el 30/8.

**El modelo de datos cambió: la lista ya no se guarda, se calcula.** Antes se guardaba
entera en `d.topics` y se editaba a mano (por eso había un botón "↻ Rehacer la lista", que
ya no existe: la lista está siempre al día sola). Ahora se guardan **sólo las excepciones**:
`d.quitados` (lo que la docente sacó con la ×) y `d.extra` (lo que agregó a mano). La lista
que se ve es `deudaAuto() − quitados + extra` (`deudaLista()`), así que **se actualiza sola
al cargar o corregir cualquier nota**.

Cada cosa pendiente es una clave de texto: un id de contenido, `"ex:<idExamen>"` (algo que
se debe entero), `"ex:<idExamen>#<n>"` (una nota suelta de una evaluación partida) o
`"carpeta"` (la marca vieja de "solo debe carpeta/TP"). `deudaLabel()` devuelve **null** si
la cosa ya no existe (se borró la evaluación, o el contenido) — así la deuda se limpia sola
sin dejar restos raros.

**Migración (`migrarDeuda()`), corre una sola vez por alumno:** si la lista guardada
coincide con lo que la versión vieja habría puesto sola (`deudaLegacy()`), se entiende que
la docente nunca la tocó y arranca limpia con el criterio nuevo. Si la había editado, se
conserva exactamente lo que sacó y lo que agregó, como excepciones. El `debeCarpeta` que se
marcaba a mano pasa a ser una cosa pendiente más. Probado con los tres casos.

🚨 **Ojo con la lista vieja vacía (arreglado el 30/8/2026, lo encontró la dueña):** una
lista vieja vacía **no** significa "no debe nada". Podía ser que nunca se hubiera llenado,
o que se hubiera usado el viejo botón "Solo debe carpeta/TP", que la vaciaba. La primera
versión de la migración la arrastraba como "sacó todo a mano" y la lista nueva nacía en
blanco: en la pantalla se veía sólo "📓 Carpeta" y un "↩ Volver a poner lo que saqué (5)".
Ahora, si la lista vieja estaba vacía, no se guarda ningún `quitados`. Y como esa migración
ya había corrido en el celular de la dueña (y borraba `d.topics`, así que no se puede
recalcular), la marca pasó de `d.migrado=true` a `d.migrado=2`, con una reparación: si los
`quitados` tapan **todo** lo que sale solo, se borran. Una curación de verdad (sacar
algunos, no todos) no se toca.

Se borraron `getOwed()` y `hasAnyDeuda()` (código muerto que leía el formato viejo y habría
confundido a cualquiera que lo leyera después), y `topicsDesaprobados()` quedó reemplazada
por `deudaAuto()`.

### Cómo quedó la tarjeta de cada alumno (30/8/2026)

Pedido de la dueña: que la pestaña quede prolija y **fácil de completar cuando el alumno
viene a rendir**, y que se vea de qué nota viene cada contenido.

- **La lista va agrupada por la evaluación (y la nota) de la que viene cada contenido**:
  *"✏️ Evaluación escrita — Grammar"* con sus contenidos debajo, *"— Vocabulary"* con los
  suyos. Lo que se debe entero (la carpeta, un TP, una evaluación sin contenidos) va suelto
  arriba, sin encabezado. Para eso `deudaAutoDetalle()` devuelve `[{key,origen}]` y
  `deudaAuto()` pasó a ser `deudaAutoDetalle(...).map(x=>x.key)` — una sola pasada, sin
  duplicar la lógica.
- **El período en curso va destacado** (`guessIntensPeriodByDate`): el casillero de esa
  instancia queda con borde naranja y el título dice "· estamos en Julio". Con cinco
  casilleros iguales había que buscar cuál tocar. Si el mes no es de ninguna instancia
  (agosto, por ejemplo) no se destaca nada, que es lo honesto.
- Los cinco períodos van en **una grilla de 5 columnas** con el mes abreviado (JUL, NOV,
  DIC, FEB, MAR): antes eran flex y "Marzo" caía solo en un segundo renglón, a lo ancho.
- "¿Entregó el módulo?" pasó a una fila compacta con el Sí/No a la derecha, en vez de
  ocupar un bloque propio. Y **sólo aparece si hay un módulo subido** en Documentos
  (decisión de la dueña, 30/8): si hay módulo tienen que entregarlo hecho para poder
  rendir; si no subió ninguno no hay nada que entregar, así que ni se pregunta y el aviso
  de arriba dice "no subiste ninguno, así que rinden sin entregar nada". El toggle es
  informativo — `estado()` no lo mira —, así que esconderlo no cambia ningún cálculo.

## Intensificación: los contenidos pendientes salen solos (29/8/2026)

Pedido de la dueña: si un alumno terminó el cuatrimestre desaprobado, en Intensificación
tienen que aparecerle **los contenidos de las evaluaciones que no aprobó**, sin cargarlos
a mano.

- `topicsDesaprobados(t,sid,pm)` en `index.html`: recorre las evaluaciones del cuatrimestre
  y junta los `topicIds` de cada una cuya **nota efectiva** (ya con el recuperatorio
  aplicado) queda debajo del mínimo. **Sin nota también cuenta** como pendiente (no la
  rindió, no la aprobó). Se saltea los recuperatorios (`recuOf` — ya se reflejan en la nota
  de su evaluación) y las evaluaciones de intensificación (`intens_*`, que son de la
  instancia siguiente).
- Esa lista es la **precarga** de `ensureDeuda()` la primera vez que el alumno aparece en
  Intensificación. Si no se puede deducir ninguno (las evaluaciones no tienen contenidos
  cargados), se cae en el criterio viejo: se lleva **todos** los contenidos del cuatrimestre
  y la docente va sacando los que sí aprobó.
- La precarga corre **una sola vez** por alumno (`topicsInit`), para no pisar lo que la
  docente saque o agregue a mano después. Para los alumnos que ya venían con la lista vieja
  (todos los contenidos), cada tarjeta tiene el link **"↻ Rehacer la lista con lo que
  desaprobó"**, que la recalcula pidiendo confirmación.

## Las fechas de los últimos guardados (1/9/2026)

Pedido de la dueña. La app guarda en cuatro lados distintos y no había forma de saber
cuándo fue la última vez de cada uno. Ahora, en el menú ⋯ → **Respaldo**, arriba de todo,
hay un recuadro (`#bkStamps`, clase `.bkstamps`) con cuatro renglones:

- **En este dispositivo** → `state.lastModified` (lo que escribe `save()` en cada cambio).
- **En tu Google Drive** → la última subida del archivo principal (`gdPushNow()`).
- **Último backup en Drive** → el último backup fechado (`backupSnapshotToDrive()`, tanto
  el automático diario como el manual).
- **Copia en un archivo** → la última vez que se bajó el `.json` (`exportToFile()`).

Detalles por si se toca (todo en `index.html`):
- Las tres últimas se guardan en `localStorage` (`LAST_DRIVE_PUSH_KEY`,
  `LAST_DRIVE_BK_KEY`, `LAST_FILE_EXPORT_KEY`, vía `markStamp()`/`readStamp()`), **no en
  `state`**, y eso es a propósito: son "la última vez que se guardó desde ACÁ". Si viajaran
  con los datos, al sincronizar mostrarían la fecha de la compu en el celular.
- El formato lo arma `fmtStamp()`: "hoy 14:32", "ayer 09:05", "28/8 10:15" y, si es de otro
  año, "28/8/25 10:15". Sin fecha muestra en gris "todavía nada" / "nunca" / "sin conectar"
  (esto último cuando Drive no está conectado).
- El recuadro se rearma en `openMenu()` y también dentro de `gdUI()`, que es lo que hace
  que la fecha de Drive se actualice sola al tocar "Actualizar Drive" con el menú abierto.
  `updateSavedStamps()` va envuelta en `try/catch` porque `gdUI()` puede correr antes de que
  el arranque termine de armar todo.

## Repaso de diseño en el celular (31/8/2026)

Pedido de la dueña: que la app se vea prolija en el teléfono. Se recorrió entera con
Chromium a 360, 390 y 430 px de ancho (Playwright, que ya viene instalado en el entorno
de Claude Code — ver abajo). **Resultado general: no hay ni una pantalla que desborde a lo
ancho**, y el único texto que se recorta es el de la columna fija de nombres en Resumen,
que es a propósito (para eso está la columna sticky). Lo que sí había eran cuatro
problemas de alineación, ya arreglados:

- **Documentos: las filas quedaban escalonadas.** Era un flex que envolvía distinto en
  cada fila según lo largo del nombre del documento, así que el clip de subir archivo
  caía en una `x` distinta en cada renglón y las filas con fecha medían el doble que las
  otras. Ahora `.docrow` es una **grilla de dos renglones fijos, iguales en todas las
  filas**: arriba el nombre con la fecha y los botones a la derecha, abajo el clip y el
  archivo. 🚨 **El clip va en el renglón de abajo a propósito** — es lo que lo mantiene en
  una sola columna; si alguien lo devuelve al lado del nombre, vuelve el escalonado.
  De paso, el nombre del archivo ya no se corta a 20 caracteres a mano (`f.name.slice`):
  ahora tiene el renglón entero y lo recorta el CSS sólo si de verdad no entra.
- **"✓ Finalizada" se partía en dos** en el bloque del horario de Inicio ("Finalizad" /
  "a"): el chip heredaba el `word-break:break-word` del bloque. Ahora va `nowrap`, y en el
  celular **se esconde el símbolo** (`.st-ic`) y se achica la letra, porque el bloque mide
  ~50 px y con el símbolo delante la palabra no entra. Por eso el símbolo va en su propio
  `<span>`: no es decoración al pedo.
- **El nombre de la app salía cortado ("Agenda D…")** en la barra de arriba. El reloj se
  comía el ancho. Ahora, en pantallas de menos de 460 px, **la fecha y la hora van una
  debajo de la otra** y "Agenda Docente" entra entero.
- **El atajo "Valoraciones" de Clases** estaba 6 px más abajo que los botones de
  cuatrimestre: el `margin-bottom` de `.seg` desbalanceaba el centrado vertical de la fila.

**Cómo repetir el recorrido** (sirve para cualquier cambio de diseño futuro): en el
entorno de Claude Code hay Chromium y Playwright ya instalados
(`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`,
`/opt/node22/lib/node_modules/playwright`). Se levanta un servidor local
(`npx http-server -p 8099`), se abre `index.html` a 390x844, se siembran datos de prueba
llamando a las **funciones de la propia app** (`addGroup`, `addStudent`, `addSession`,
`addExam`…) en vez de inventar el JSON a mano, y se navega con `go({screen,groupId,term,tab})`.
Las 10 secciones del curso están en `GRP_SEC`. Conviene medir (`scrollWidth>clientWidth`,
`document.documentElement.scrollWidth`) además de mirar capturas: varias cosas de acá se
veían "casi bien" y sólo aparecían midiendo.

## Datos confirmados (verificados en producción, no suponer otra cosa)

- **Hosting:** GitHub Pages, rama `main`, carpeta raíz.
  Producción en `https://estudioamsoftware.github.io/agendadocente/`.
  ⚠️ **Todo cambio va SIEMPRE a `main`, y no está publicado hasta que llegue ahí.**
  Instrucción explícita de la dueña (29/8/2026), vale para toda sesión futura: no dejar
  el trabajo colgado en una rama esperando que ella apruebe un pedido de cambio. Si se
  trabajó en una rama, hay que mergearla a `main` y pushear `main` en la misma sesión —
  si no, ella recarga la app, sigue viendo el número de versión viejo, y perdemos el
  viaje (ya pasó). Al terminar un cambio, confirmar que `main` tiene el `APP_VER` nuevo.
- **Empaquetado para Android:** se usó **PWABuilder** (pwabuilder.com), no Bubblewrap.
  El `.aab` que está publicado salió de ahí. `twa/README.md` documenta Bubblewrap como
  alternativa, pero nunca se usó.
- **Package ID:** `com.estudioam.agendadocente` (definitivo, no se puede cambiar).
- **Digital Asset Links:** publicado en el repo aparte
  `estudioamsoftware/estudioamsoftware.github.io`, en `.well-known/assetlinks.json`.
  Ese repo necesita el archivo `.nojekyll` en la raíz, si no GitHub Pages ignora la
  carpeta `.well-known` y el archivo da 404.
  🚨 **PROBLEMA ABIERTO (encontrado 29/8/2026): ese archivo tiene la huella equivocada.**
  Tiene la huella de la clave **de subida** (el `signing.keystore` de PWABuilder), que es
  la que firma el `.apk` que se instala a mano. Pero **cuando la app se baja de Play
  Store, Google la vuelve a firmar con su propia clave** (Play App Signing), que tiene
  otra huella. Como no coincide, Android no verifica el dominio, la app **no arranca como
  TWA** sino como una pestaña de navegador con la barra de dirección arriba, y ahí
  `getDigitalGoodsService()` tira `OperationError: unsupported context` → **no se puede
  comprar**. Hay que agregar al `assetlinks.json` la huella SHA-256 de la **clave de firma
  de la app** que da Play Console (Prueba y lanza → Integridad de la app). Se pueden
  tener varias huellas en el mismo archivo: conviene dejar las dos, así funcionan tanto la
  instalada de Play como la instalada a mano.
  **Huella SHA-256 de la clave de firma de Play (sacada de Play Console el 29/8/2026 —
  no volver a pedirla):**

      DE:35:EC:45:38:4C:A8:D4:32:2E:BC:2D:07:05:F3:DA:D9:2A:E6:CD:84:4A:49:52:E5:07:77:01:9C:E0:83:25

  Dónde se saca, porque Google movió la pantalla y cuesta encontrarla: Play Console →
  `.../app/<id>/keymanagement` (link directo; el camino por menú es Prueba y lanza →
  Integridad de la app → "Ir a Protegido con Play", y desde 2026 ya no está donde
  decía la documentación vieja).
- **Estado en Play Console:** publicada en pista de **prueba interna**.
  ⚠️ Acá decía que abría "sin barra de navegador, o sea que la verificación de dominio
  anda". **Eso estaba mal y confundió todo:** esa observación se hizo sobre la app
  instalada **a mano desde el `.apk`**, que sí verifica porque está firmada con la clave
  de subida. La instalada **desde Play Store** abre CON barra de navegador. Nunca dar por
  buena la verificación de dominio probando el `.apk` — solo cuenta la que vino de Play.

Si algún documento del repo dice Cloudflare Pages o Bubblewrap, está desactualizado:
quedó de intentos anteriores.

## El login de Google / Drive

### Mudado a proyecto propio (27/8/2026)

Agenda Docente ya no comparte proyecto de Google Cloud con las otras apps de la dueña.

- **Proyecto nuevo:** `Agenda Docente` (ID `agenda-docente-506819`), en la cuenta
  **`estudioam.dev@gmail.com`** (la de Estudio AM, no la vieja de English Beats).
- **Cliente OAuth en uso:** `186098387728-efdun1mckj6jcil78b6hnn9pbpgij9dr`
  (tipo Aplicación web, creado el 27/8/2026 en ese proyecto nuevo). Es el que está
  escrito en `index.html` como `GD_CID`. Origen autorizado:
  `https://estudioamsoftware.github.io`.
- Google Drive API habilitada en el proyecto nuevo, pantalla de consentimiento OAuth
  creada (Externo, nombre "Agenda Docente").
- **Antes de este cambio se le pidió a la única usuaria activa (la dueña) que bajara
  "Guardar copia en un archivo"**, siguiendo el plan de abajo. Reconectó Drive después
  del cambio de `GD_CID` sin pérdida de datos.
- El proyecto viejo (`agenda-docente-500923`, cuenta `englishbeatsclasesyrecursos@gmail.com`,
  cliente `721873412047-e1kbmt4a2uah5cekj69gb8qmqsrmn55m`) queda retirado para esta app.
  No hace falta borrarlo — ya no lo usa `index.html` — pero si algún día se quiere borrar,
  primero confirmar que ninguna otra app de la dueña lo usa (no debería, era específico de
  Agenda Docente).

### Publicado a "En producción" (27/8/2026) — ya no hace falta anotar testers para Drive

Como el proyecto ya es exclusivo de Agenda Docente, publicarlo **no arrastra a ninguna otra
app** de la dueña (antes sí, por eso no se tocaba en el proyecto viejo compartido). Se hizo
en Google Auth Platform → Público → "Publicar app", sin pedir verificación de Google (los
permisos que pide la app —`drive.file` y `email`— son no sensibles). Cualquier profe con
cuenta de Google ya puede conectar Drive sin que la anotemos a mano en ninguna lista.

Antes de poder publicar hizo falta completar en **Información de la marca**:
- Página principal: `https://estudioamsoftware.github.io/agendadocente/`
- Política de Privacidad: `https://estudioamsoftware.github.io/agendadocente/privacy-policy.html`

**A propósito no se subió logo.** En cuanto se sube un logo a esa pantalla, Google exige
mandar la app a verificación (trámite de semanas, pide video de demostración, etc.). Sin
logo la pantalla de permisos de Google se ve más genérica, pero funciona igual. Si en algún
momento se quiere esa pantalla más prolija, hay que estar dispuestas a pasar por la
verificación — no es necesario para que la app funcione.

### No cambiar el cliente de OAuth por prolijidad (sigue valiendo)

El permiso que usa la app es `drive.file`, que da acceso **solo a los archivos que creó
ese cliente**. Si se cambia el `GD_CID` de nuevo sin plan, la app deja de ver el `Datos de
Agenda Docente.json` que ya existe para cada docente que conectó Drive con el cliente
actual — no se borra, pero queda huérfano y la app arranca uno nuevo en blanco. La mudanza
del 27/8 fue la excepción justificada (aislar el proyecto); no repetir el cambio sin un
motivo igual de bueno y sin seguir el plan de abajo.

### Cómo mudar el `GD_CID` sin perder datos (por si hace falta otra vez)

**Ojo: un plan viejo decía hacerlo con "Crear backup" y "Restaurar backup de Drive". No
sirve:** ese backup se sube al Drive de la docente pero *dentro de la carpeta que creó el
cliente viejo*, y con permiso `drive.file` el cliente nuevo no puede verla. Queda del lado
equivocado de la mudanza.

Lo que sí vale, mirando el código:

- **Los datos de verdad viven en el dispositivo** (`localStorage`, clave `agendaDocente.v1`).
  Drive es respaldo y sincronización entre la compu y el celu, no la fuente.
- Cuando el cliente nuevo conecta y no encuentra archivo remoto, la app **sube lo local**
  (`gdPull()`: `if(!gd.fid){ await gdPushNow(); ... }`). No borra nada.
- Ya hay red anti-pisada (`remotePierdeDatos` / `localPierdeDatos` + `showSyncConflictDialog`),
  agregada justo por el susto del cambio de dominio de agosto.

O sea que para la docente que usa la app en **un solo dispositivo** —el caso normal— la
mudanza es casi transparente: reconecta Drive, la app no encuentra nada, sube lo que tiene y
sigue. Lo único que se pierde es el historial de backups viejos, y queda un archivo huérfano
en su Drive (no se borra, simplemente la app deja de verlo).

**Dos trampas nuevas que aparecieron al hacer la mudanza del 27/8, para no repetirlas:**

1. **No alcanza con crear el cliente OAuth — hay que declarar los permisos aparte.** En
   Google Auth Platform → "Acceso a los datos", si no se agregan explícitamente los scopes
   (`.../auth/drive.file` y `.../auth/userinfo.email`), el cliente nuevo consigue un token
   pero sin permiso real sobre Drive: la app tira **"Error en Drive: Request had
   insufficient authentication scopes"**. Se soluciona agregando esos dos scopes ahí y
   guardando — pero ojo con el punto 2, no alcanza con arreglar esto solo.

2. **Una vez que la app quedó con un token "malo" guardado, no se autocorrige sola.** El
   token se guarda en `sessionStorage` (`gd_tok`) y la marca de "ya se conectó antes" en
   `localStorage` (`gd_was_connected`). Mientras esa marca siga en `1`, la app solo reintenta
   en silencio (`gdReconnect()`, sin mostrar pantalla de permisos) — nunca vuelve a pedir el
   consentimiento completo con los scopes nuevos. Ni recargar la página ni tocar "Reintentar"
   alcanza. Hace falta borrar **todos los datos guardados del sitio** (`chrome://settings/content/all`
   → buscar `estudioamsoftware.github.io` → Eliminar datos, o en la consola del navegador
   `localStorage.clear(); sessionStorage.clear(); location.reload();`) para forzar que
   vuelva a pedir todo de cero. Como esto también borra `agendaDocente.v1` (los datos locales),
   por eso el paso 1 del orden de abajo (bajar el archivo antes de tocar nada) es imprescindible.

Los dos casos donde **sí** se puede perder algo:
1. La docente usa **dos dispositivos** y depende de Drive para sincronizar.
2. Reinstala la app, cambia de teléfono o limpia los datos del navegador *entre medio*.

Para cubrir esos dos casos se agregó al menú ⋯ (27/8): **"Guardar copia en un archivo"** y
**"Restaurar desde un archivo"** (`exportToFile()` / `importFromFile()` en `index.html`).
Bajan y cargan un `.json` común, que no depende ni de Drive ni del cliente de OAuth — es la
única copia que cruza una mudanza de `GD_CID`.

**Orden para el día de la mudanza:**
1. Que cada docente entre a la app y use "Guardar copia en un archivo" (queda en Descargas).
2. Recién ahí cambiar el `GD_CID` en `index.html` y publicar.
3. Cada una reconecta Drive. Si sus datos siguen ahí (lo esperable), listo.
4. Si a alguna le falta algo, "Restaurar desde un archivo" con el `.json` del paso 1.

### Play Console

Cuenta "Estudio AM" → **`estudioam.dev@gmail.com`** (ver "Ojo con las cuentas" abajo).

Para sumar una docente nueva a la prueba interna de Play Store:
https://play.google.com/console/u/0/developers/6208089129841152998/app/4974565274805185721/tracks/internal-testing?tab=testers

**Link de invitación a la prueba interna (el que se le pasa a cada tester) — anotado el
29/8/2026, NO volver a pedirlo:**

    https://play.google.com/apps/internaltest/4701617366361420267

Se abre en el celular **con la cuenta que esa persona tiene puesta en Play Store**, se
acepta ser verificador, y recién ahí aparece el botón para instalar desde Play Store. El
mail tiene que estar además en la lista de arriba: las dos cosas hacen falta.
Ojo: mientras la ficha esté incompleta, en Play Store la app se ve con el **nombre temporal
`com.estudioam.agendadocente (unreviewed)`** en vez de "Agenda Docente". Es normal, no es
un error — se arregla al completar la ficha.

Si a una tester le sale **"No se encontró el elemento"** en la Play Store, o no está
anotada ahí, o el mail anotado no es el que tiene puesto en la Play Store del celular
(aceptar la invitación en el navegador con otra cuenta no sirve). Esta lista sigue siendo
necesaria — es independiente de la lista de testers de Drive, y no desaparece con la
mudanza de arriba.

### Pendientes de orden (actualizado 27/8/2026)

- ~~Mudar Agenda Docente a su propio proyecto de Google Cloud~~ ✅ hecho (ver arriba).
- ~~Publicar el proyecto nuevo a "En producción"~~ ✅ hecho (ver arriba). Ya no hace falta
  anotar testers a mano para el login de Drive.
- Lo del tope de 10 dominios sin verificar y "limpiar dominios muertos"
  (`plantillacomercios.pages.dev`, `comercios.pages.dev`) ya **no aplica a Agenda
  Docente** — era un problema del proyecto viejo compartido. Sigue siendo un tema para
  las otras apps de la dueña si algún día se ordena ese proyecto, pero no es parte de
  este repo.

### Ojo con las cuentas (CORREGIDO 29/8/2026 por la dueña — leer esto antes de nombrar ninguna cuenta)

🚨 **`mullerana@hotmail.com` (sin el 2) NO es la cuenta de Play Console ni la que administra
nada de este proyecto.** Estuvo escrito acá por error desde el commit `f2b0b99`
presentándolo como la dueña de Play Console, cuando en realidad Play Console se administra
con `estudioam.dev@gmail.com`. La dueña ya lo había corregido en una sesión anterior, pero
**esa corrección se dijo en el chat y nunca se guardó en este archivo**, así que al cerrarse
esa conversación se perdió y el dato viejo volvió a salir. Por eso terminó teniendo que
explicarlo de nuevo, a los gritos y con razón. **Moraleja para cualquier sesión futura: una
corrección que no se commitea, no existe.** Si la dueña corrige un dato, se escribe acá y se
pushea a `main` en el momento, antes de seguir con nada.

⚠️ **MATIZ (29/8/2026, más tarde la misma noche): `mullerana@hotmail.com` sí es una cuenta
real de la dueña** (ella lo confirmó) — lo que sigue siendo cierto es que **no es con la que
se administra Play Console día a día** (eso es `estudioam.dev@gmail.com`). Apareció en la
pantalla de Play Console → Cuentas de desarrollador asociadas → "Inscribirse en el programa
de cargos del servicio del 15%", como **"Cuenta principal"** del grupo de cuentas "Estudio
AM".

**RESUELTO DEL TODO (29/8/2026), con la fuente exacta encontrada.** Chequeado en tres
pantallas seguidas de Play Console:

1. **"Usuarios y permisos"**: `mullerana@hotmail.com` no figura en la lista. Solo tienen
   acceso `estudioam.dev@gmail.com` (Propietaria — el nombre de perfil de Google es "Annie
   Muller", un apodo, no el nombre legal) y la cuenta de servicio técnica.
2. **"Cuenta de desarrollador"**: el **nombre legal** registrado (el que se comparó contra
   el DNI) es **"Ana Teresa Catalina Müller"** — no hay ningún problema con que el perfil de
   Gmail diga "Annie", son campos distintos. Y ahí mismo, bajo "Datos de contacto", está la
   explicación completa: **`mullerana@hotmail.com` es la "Dirección de correo electrónico de
   contacto"** — el mail que usa Google para mandar avisos administrativos, un campo
   totalmente separado de con qué cuenta se entra a la consola.
3. **"Cuentas de desarrollador asociadas"** (en esa misma pantalla): dice literal **"No
   asociaste esta cuenta a ninguna otra"** — confirma que no hay ninguna otra cuenta de
   desarrollador de por medio.

**Conclusión: `mullerana@hotmail.com` no tiene ningún permiso ni acceso a Play Console —
es simplemente el mail de contacto administrativo.** Por eso aparecía como "Cuenta
principal" en la pantalla del programa del 15%: esa pantalla usa el mail de contacto como
etiqueta para identificar el grupo de cuentas, no como usuario con acceso. Cero riesgo de
seguridad, cero misterio. No hace falta volver a tocar este tema.

**Cómo es de verdad — todo el lado Google de estas apps es `estudioam.dev@gmail.com`:**

- **Play Console / Google Play, y la cuenta que creó las apps** (cuenta "Estudio AM",
  ID `6208089129841152998`) → **`estudioam.dev@gmail.com`**.
- **Firebase** (proyecto `agenda-docente-8c53d`) → `estudioam.dev@gmail.com`.
- **Google Cloud del login de Drive** (proyecto `agenda-docente-506819`) →
  `estudioam.dev@gmail.com`.
- **`englishbeatsclasesyrecursos@gmail.com`** no administra nada: quedó como la cuenta con
  la que se prueba el **Drive de Agenda Docente**, y además está anotada como tester.

**Testers de la prueba interna — lista completa y verificada en pantalla el 29/8/2026.
NO volver a preguntar esto ni pedir captura: está acá.** La lista se llama
**"Verificadores Agenda Docente"** (Play Console en español dice "Verificadores", no
"Testers" — por eso cuesta encontrar la pestaña). Los cuatro mails cargados son:

1. `englishbeatsclasesyrecursos@gmail.com`
2. `estudioam.dev@gmail.com`
3. `marcelodanielcordoba74@gmail.com`
4. `mullerana2@hotmail.com`

👉 **De acá salió el error del mail fantasma:** alguna sesión anterior leyó
`mullerana2@hotmail.com` (que es un **tester**, el cuarto de esta lista) y lo escribió como
`mullerana@hotmail.com` presentándolo como **la dueña de Play Console**. Dos errores en uno:
le comió el `2` y le cambió el rol. Play Console es `estudioam.dev@gmail.com` y punto.

**Si Play Console ofrece "crear una cuenta de desarrollador"**, es que el navegador está
usando otra cuenta: hay que cambiar a `estudioam.dev@gmail.com` desde la foto de perfil, o
entrar por `https://play.google.com/console`. **Nunca crear esa cuenta** — sería una cuenta
nueva y se paga. Ojo también con el `/u/0/` de los links guardados en este documento: ese
`0` significa "la primera cuenta con la que estés logueada", así que teniendo varias
abiertas puede caer en la equivocada.

## La venta: estado y qué falta (actualizado 27/8/2026, ramas ya mergeadas)

Las dos ramas viejas de venta/suscripción (`claude/agenda-docente-play-store-7lv177` y
`claude/subscription-by-device-jzdkkp`, ninguna mergeada a `main` hasta hoy) ya están
juntas en esta rama. Quedaron sumados:

- El candado de la versión gratis (sección `/* ============ Licencia ============ */` en
  `index.html`, ver detalle abajo) y `VENTA.md` con el plan de venta.
- La config de referencia del TWA con Bubblewrap en `twa/` (no es la que se usa hoy — el
  `.aab` publicado salió de PWABuilder — pero sirve si el día de mañana hay que regenerar
  declarando Play Billing).
- Firebase Auth + Firestore integrados en `index.html` (al final, `<script type="module">`
  nuevo que no toca el resto de la app), esqueleto de Cloud Functions (`functions/`), config
  de Firebase CLI (`firebase.json`, `firestore.rules`, `firestore.indexes.json`) y los
  assets de la ficha de Play Store (`play-store-assets/`).
- `privacy-policy.html` ya tiene la sección "Suscripción y pagos".

### El candado de la versión gratis

- `LIC_ENFORCE` en `index.html` está en **`false`**: mientras esté apagado, nadie ve el
  candado (las profes que están probando la app no se topan con esto). Se enciende recién
  cuando la app salga a la venta de verdad.
- `LIC_FREE_GROUPS=1`: la versión gratis deja llevar un curso.
- `LIC_REGALADAS`: cuentas con la versión completa de regalo, como hash SHA-256 del mail
  (el repo es público). Hoy solo la cuenta de Estudio AM. Esta lista es un parche
  provisorio — la idea es que la responda Firebase, no el código público (ver abajo).
- `licPaywall()`: hoy el botón "Quiero la completa" abre un mail a `estudioam.dev@gmail.com`.
  Cuando esté Play Billing, tiene que disparar la compra en su lugar.

### Qué funciones van a ser premium (decidido, no implementado todavía)

Esta decisión es más amplia que el candado de "un curso" de arriba — quedó pendiente
unificar los dos enfoques:

- **Gratis:** cursos y alumnos ilimitados, carga de asistencia y notas sin restricción — el
  uso diario core de la app no se toca.
- **Premium:**
  - Cursos ilimitados (el candado de `LIC_FREE_GROUPS` de arriba).
  - Carga de **licencias, paros y demás eventos administrativos** (todo lo que hoy permite
    llevar registro/conteo anual — ver `LICENCIA_TIPOS`, `LICENCIA_INFO`,
    `licenciaTallyThisYear()` etc. en `index.html`).
  - **Alertas automáticas** (ej. `listadosProximosAVencer()`).
  - Ver la **ayuda de licencias sacada del Estatuto Docente** (`LICENCIA_INFO`): la idea es
    que sepan que existe (visible pero bloqueada), no que esté oculta del todo.
- La web (`estudioamsoftware.github.io/agendadocente/`) también queda bloqueada, no solo la
  app de Play Store — Google Play Billing solo se puede usar dentro de la app empaquetada,
  así que en la web hay que mostrar un cartel tipo "Descargá la app de Play Store para
  suscribirte" en vez de un flujo de pago in-situ.
- Cuando se encienda el bloqueo, la cuenta de Google de la dueña tiene que quedar exceptuada
  (hoy vía `LIC_REGALADAS`, más adelante vía su doc en `subscriptions/{uid}` marcado `active`).

### Decisiones tomadas sobre la venta

- Se vende **por Play Store**, no por afuera ("por fuera nadie la toma en serio").
- **Salir de la prueba interna y pasar a prueba abierta / pública (decidido 29/8/2026).**
  En cuanto se confirme que la compra funciona de punta a punta, hay que sacar la app de
  la pista de **prueba interna**. Motivo, en palabras de la dueña: si le pasa un link a
  una profe y esa profe **ya tiene problemas para bajar la app**, no va a llegar nunca a
  probarla ni a aprobarla. La prueba interna obliga a anotar cada mail a mano y a que cada
  una acepte una invitación antes de poder instalar — fricción fatal para conseguir que
  una docente la pruebe. En prueba abierta (o producción) se les pasa un link de Play
  Store común y la instalan como cualquier app, sin listas ni invitaciones.
  Para poder pasar hace falta **terminar la ficha de Play Store** (descripción, capturas
  —ya están en `play-store-assets/`—, clasificación de contenido), que iba en "2 de 11
  tareas" y hay que completar igual antes de vender. Es el próximo tema grande después de
  la compra.
  **Las 11 tareas de la ficha ya están completas y ENVIADAS A REVISIÓN el 29/8/2026** —
  ver el detalle en "Pendientes en orden" más abajo. Al enviar apareció un trámite corto
  más, no relacionado con las 11 tareas: la **declaración de ID de publicidad** (obligatoria
  para apps con `targetSdk` 13+) — se completó con "No, la app no usa ID de publicidad"
  (no tiene anuncios ni rastreo). Quedó todo mandado junto: la ficha completa y la primera
  versión de la pista de prueba cerrada (ver abajo). Ahora toca esperar la revisión de
  Google (puede tardar de horas a un par de días).

  🚨 **TRABA NUEVA ENCONTRADA (29/8/2026), cambia el plan: "Prueba abierta" NO es un
  atajo.** Verificado en pantalla (Play Console → Prueba y lanza → Prueba abierta): dice
  literal **"Las pruebas abiertas están disponibles cuando tienes acceso a producción"**.
  O sea que Prueba abierta está bloqueada hasta conseguir Producción, no es un escalón
  intermedio más fácil como se pensaba. Y para pedir acceso a Producción (Panel → sección
  "Producción"), Google exige:
  1. Publicar una versión en **prueba cerrada** (distinta de la prueba interna que ya se
     usa).
  2. Conseguir que **al menos 12 verificadores acepten participar** en esa prueba cerrada
     (hoy: 0).
  3. Que esa prueba cerrada corra con esos 12+ verificadores durante **al menos 14 días**.
  Recién ahí se habilita pedir Producción, y una vez aprobada, se desbloquean Producción
  **y** Prueba abierta juntas.
  **Esto es requisito de Google para cuentas de desarrollador nuevas (antiabuso), no algo
  que dependa de nuestro trabajo técnico — no hay forma de saltearlo.**
  **✅ Pista de prueba cerrada YA ARMADA (29/8/2026), pendiente de gente.** Se creó el
  segmento **"Prueba cerrada - Alpha"** (ya existía, quedó de un intento viejo sin usar),
  con:
  - Países: **todos** (así no se repite el susto de un país que bloquee a un tester).
  - Verificadores: la misma lista **"Verificadores Agenda Docente"** que ya se usa en
    prueba interna (hoy 4 personas: englishbeats, estudioam.dev, marcelodanielcordoba74,
    mullerana2). Se puede seguir sumando gente a esta misma lista — no hace falta crear
    una lista aparte para la prueba cerrada.
  - Versión: se promovió la **misma versión 2 (1.0.1.0)** que ya está en prueba interna
    (botón "Agregar desde la biblioteca" al crear la versión — no hizo falta subir un
    `.aab` nuevo).
  - Enviada a revisión junto con la ficha de Play Store (ver arriba).
  **Lo único que falta es humano, no técnico: llegar a 12 verificadores que acepten.**
  Hoy hay 4. Faltan **8 más**. Quedó pendiente para que la dueña piense a quién sumar
  (otras docentes, familia, conocidos con Android) — no bloquea nada del trabajo técnico
  mientras tanto. El reloj de los 14 días arranca recién cuando los 12 ya hayan aceptado
  la invitación, así que conviene sumar gente cuanto antes.
  **Ojo, esto NO es un trámite de una sola vez para toda la cuenta de desarrollador — se
  repite con CADA app nueva** que se quiera sacar de prueba a producción (confirmado
  investigando, 29/8/2026: aplica a toda cuenta personal creada después del 13/11/2023, que
  es el caso de esta cuenta "Estudio AM"). Vale la pena tenerlo presente para las demás apps
  de la dueña (ej. Che Taxi), no es específico de Agenda Docente. **Lo que sí se puede
  reusar:** la misma lista de 12+ personas sirve para todas las apps — solo tienen que
  aceptar la invitación de cada app puntual, no hace falta reclutar gente nueva cada vez. Y
  una vez que una app ya pasó el filtro y llegó a Producción, **sus actualizaciones futuras
  no vuelven a pedir testers** — el trámite es una sola vez por app (la primera vez que esa
  app en particular pide Producción), no por cada versión que se suba después.
- Modelo: **gratis con límite de cursos, versión completa paga**. Se descartó la app paga
  de entrada porque nadie compra a ciegas una herramienta de uso diario.
- **Cobro: Google Play Billing únicamente.** Se descartó Mercado Pago porque Google exige
  que el contenido digital consumido dentro de una app de Play use su propio sistema de
  facturación.
- **Backend: Firebase** (no Supabase — la dueña usa Supabase en otro proyecto sin relación).
  Se eligió Firebase porque las notificaciones de Google Play (RTDN) se integran
  nativamente vía Pub/Sub con Cloud Functions, sin webhook intermedio.
- Ojo con esto: Play deja pasar una app de paga a gratis, **nunca al revés**.
- **Pendiente de decidir con la dueña:** la licencia se ata a la cuenta de Google, pero
  **el teléfono ofrece solo la cuenta con la que está logueado Chrome**, sin dejar elegir
  otra. Si la docente compra con una cuenta y usa el celu con otra, no va a poder activar.
  Falta resolver esto (explicarlo bien, o sumar activación por código).

### Estado del proyecto de Firebase (backend de la suscripción — no confundir con el de Drive)

- **Nombre:** Agenda Docente — **Project ID:** `agenda-docente-8c53d`, en
  `estudioam.dev@gmail.com` (mismo dueño que el proyecto de Drive, ver arriba, pero es
  **otro proyecto de Google Cloud** — Drive usa `agenda-docente-506819`).
- **Plan actual:** Spark (gratis). Para desplegar las Cloud Functions hay que pasar a
  **Blaze** (pago por uso, pide tarjeta) — se puede poner una alerta de presupuesto en $0 y
  el uso esperado de esta app cae dentro de la capa gratuita de Blaze igual.
- **Firestore:** creado. Edición Standard, modo producción, región `southamerica-east1`
  (São Paulo). Reglas de `firestore.rules` (cada docente lee solo su propio doc de
  suscripción, nadie escribe salvo el Admin SDK) ya están pegadas y publicadas a mano en la
  consola de Firestore (pestaña Reglas) — si se vuelve a tocar `firestore.rules`, hay que
  repetir el pegado a mano o desplegar con `firebase deploy --only firestore:rules`.
- **Authentication:** proveedor Google habilitado.
- **Dominios autorizados: ya está prolijo (28/8/2026).** Quedaron `localhost`,
  `agenda-docente-8c53d.firebaseapp.com`, `agenda-docente-8c53d.web.app` y
  `estudioamsoftware.github.io` (el dominio real de producción, agregado). Se sacó
  `agendadocente.pages.dev`, el dominio viejo de Cloudflare que ya no se usa.
- **Cloud Functions (`functions/index.js`), sin desplegar todavía** (falta el plan Blaze):
  `verifyPurchase` (callable, valida una compra recién hecha contra la Google Play
  Developer API) y `playRtdn` (HTTP endpoint que recibe las notificaciones push de Play
  cuando una suscripción se renueva o cancela). Ambas necesitan el secreto
  `PLAY_SERVICE_ACCOUNT` (JSON de una cuenta de servicio con permiso "Ver datos
  financieros" en Play Console → Configuración → Acceso a la API), que todavía no se creó.
- **Validado el 19/8/2026** (en un preview de Cloudflare Pages que ya no existe, pero la
  lógica de Firebase es independiente del dominio): `fbSignIn()` abre el popup de Google y
  devuelve el usuario logueado; la escucha en tiempo real de `subscriptions/{uid}` en
  Firestore funciona sin recargar la página. **Auth + Firestore confirmado funcionando
  end-to-end.** Falta todo lo de Play Store/Billing, que depende de Play Console.
- Login de Firebase Auth (para la suscripción) y login de Google Drive (para el respaldo)
  son **dos flujos de Google distintos que todavía no se unificaron** — cada uno pide su
  propio consentimiento por separado.

### El perfil de pagos de Play (hecho 27/8/2026) y lo que falta del banco

Para poder siquiera **entrar** a Monetiza con Play → Productos → Suscripciones, Play
Console exige tener creada una **cuenta de comerciante de Google Payments**. Antes de eso
la pantalla de suscripciones está bloqueada con "Requisitos que faltan para acceder a esta
página". Ese perfil se creó el 27/8/2026 con estos datos (son el **perfil público**, lo ve
la compradora):

- Nombre de la empresa: `Estudio AM` (no hace falta tener sociedad; monotributista con CUIT
  alcanza, se pone el nombre de fantasía).
- Sitio web: `https://estudioamsoftware.github.io/agendadocente/`
- ¿Qué vende?: `Software de computadoras`
- Correo de Atención al cliente: `estudioam.dev@gmail.com`
- Nombre del resumen de la tarjeta de crédito: `ESTUDIO AM` (es lo que la docente ve en el
  resumen de su tarjeta; si no lo reconoce, desconoce el cargo).

**Umbral de pago: USD 1.00, se paga mensual.** O sea que Google deposita todos los meses
con que haya habido cualquier venta — no acumula hasta juntar un mínimo grande.

**Falta todavía (y es a propósito):** cargar la **forma de pago** (la cuenta bancaria donde
Google deposita). La dueña es **monotributista y no tiene contador**. Antes de completar ese
paso quedó en hacer una consulta suelta con un contador/gestor, porque:
- lo que pague Google suma a su facturación anual del monotributo (ojo con el tope de
  categoría y la recategorización);
- es plata que entra del exterior, y las reglas cambiarias/impositivas argentinas para eso
  cambian seguido — no improvisar acá.

Esto **no bloquea nada del trabajo técnico**: es el último eslabón, hace falta recién el día
que se quiera cobrar de verdad.

**Preguntas para la consulta con el contador/gestor (armadas 28/8/2026):**
1. Lo que paga Google Play, ¿suma a la facturación anual del monotributo? ¿A qué tipo de
   cambio se toma (el del día que llega, el oficial, el del banco)?
2. ¿Cuenta como "exportación de servicios"? ¿Tiene algún tratamiento impositivo distinto
   (exenciones, retenciones) por ser un ingreso digital del exterior?
3. ¿Hay que declararlo de alguna forma en particular, más allá de la facturación mensual
   común del monotributo?
4. ¿Puede hacer que se pase de categoría de monotributo? ¿Cómo se calcula el tope estando
   una parte de los ingresos en dólares?
5. ¿Conviene recibirlo en una cuenta en pesos (se convierte solo) o en una cuenta en
   dólares (para decidir cuándo convertir)? ¿Hay diferencia impositiva entre una y otra?
6. ¿Hay algún límite o restricción del BCRA para este tipo de ingreso, siendo
   monotributista?

✅ **Programa de cargos del servicio del 15%: inscripto (29/8/2026).** El link para
aceptar los términos (que antes no aparecía) se encuentra en Play Console → **Cuenta de
desarrollador → Cuentas de desarrollador asociadas**
(`https://play.google.com/console/u/0/developers/6208089129841152998/associated-developer-accounts`)
→ botón **"Confirmar y ver condiciones"**. Las condiciones son las estándar de Google (15%
en vez de 30% sobre el primer millón de USD de ganancias por año, sin letra chica rara) —
se leyeron completas y se aceptaron. Confirmado en pantalla: "Tu grupo de cuentas se
inscribió en el programa de cargos del servicio del 15%".

### El requisito que reordena todo: el `.aab` tiene que declarar Play Billing

**Descubierto el 27/8/2026, cambia el orden del plan.** Con el perfil de pagos ya creado, la
pantalla de Suscripciones se destraba, pero dice *"La app aún no tiene suscripciones"* y el
único botón es **"Sube un nuevo APK"**. Play Console **no deja crear el producto de
suscripción hasta que haya subido un build que declare el permiso de Play Billing**
(`com.android.vending.BILLING`). El `.aab` que está publicado hoy salió de PWABuilder y no
lo trae.

O sea: **primero el `.aab`, después el producto de suscripción.** Al revés no se puede.

**La firma está guardada y aparecida (27/8/2026).** En el Drive de la dueña, carpeta
`agenda docente play store`, están los seis archivos que largó PWABuilder el 19/8:
`Agenda Docente.aab`, `Agenda Docente.apk`, `assetlinks.json`, `Readme.html`,
**`signing-key-info.txt`** (las contraseñas) y **`signing.keystore`** (la firma).

Eso es lo que hace fácil la regeneración, porque:
- Firmando con la **misma** clave, Play reconoce el build como una versión nueva de la app
  que ya está. Con otra clave lo rechaza por firma que no coincide (habría que pedirle a
  Google el reseteo de la clave de subida — se puede, pero es trámite).
- La verificación de dominio (`assetlinks.json`, publicado en el repo
  `estudioamsoftware/estudioamsoftware.github.io`) está atada a la huella de la firma.
  Como la clave no cambia, **ese archivo no hay que tocarlo** y la app va a seguir abriendo
  sin la barra del navegador.

⚠️ Ese `signing.keystore` es irreemplazable: si se pierde, no se puede volver a actualizar
nunca más la app en Play. Y `signing-key-info.txt` tiene contraseñas en texto plano —
**nunca commitearlo al repo**, que es público.

**Cómo regenerar: con PWABuilder, no hace falta Bubblewrap.** Verificado en la documentación
de PWABuilder: soporta tanto la opción de **Google Play Billing** (que es justo lo que
falta) como la de **firmar con una clave propia** ("Mine": se sube el `.keystore` y se
completan alias, key password y store password). Se hace entero desde la web, sin instalar
Node ni JDK. Pasos:

1. pwabuilder.com → pegar `https://estudioamsoftware.github.io/agendadocente/`.
2. Paquete de Android / Google Play → abrir las opciones.
3. Activar **Google Play Billing**.
4. Subir la versión: `appVersion` a `1.0.1` y **`appVersionCode` de 1 a 2** (Play rechaza
   subir dos veces el mismo version code).
5. Signing key → **"Mine"** → subir `signing.keystore` y completar alias/contraseñas
   leyéndolas de `signing-key-info.txt`.
6. Generar, descargar, y subir el `.aab` a la pista de prueba interna en Play Console.

`twa/` (Bubblewrap) queda como plan B nomás; con PWABuilder alcanza.

### El producto de suscripción (creado 27/8/2026)

- **Producto:** ID `agenda_completa` (con prefijo del nombre de la app, a propósito — ver
  `PLAY-STORE-GUIA.md` sobre por qué, si se agregan más apps vendibles a futuro).
  Nombre visible: "Agenda Docente completa".
- **Plan básico mensual:** ID `mensual`, renovación automática, **$5.99 USD**, cargado con
  "Set prices" a los 177 países de una. **Ya activado.** Es el plan marcado
  **"Retrocompatibilidad"**, o sea el único que la app puede cobrar hoy (ver el issue de
  Bubblewrap #830 más arriba).
- **Plan anual:** ID `anual`, renovación automática, **$50 USD** (~30% menos que 12 meses
  sueltos del mensual). **Ya activado**, pero **no se puede comprar desde la app** — está
  cargado para el día que Google habilite vender los dos planes.

**Precios subidos el 31/8/2026** (antes: mensual $2.99, anual $25). Motivo, en palabras de
la dueña: a 4.500 pesos por mes "no me van a tomar en serio con ese número". Se descartó
empujar el anual como plan principal porque, con descuento y todo, son ~75 lucas de un
saque y una docente argentina eso lo piensa dos veces. Se aprovechó que **no había ni un
suscriptor**: en Play bajar un precio es libre, pero subirlo con gente ya suscripta obliga
a avisarles y a que muchos acepten, y ahí es cuando se dan de baja. Si hay que volver a
tocarlo, cuanto antes mejor.

🚨 **ARGENTINA NO TIENE PRECIO EN PESOS EN PLAY — se cobra en dólares** (verificado en
pantalla el 31/8/2026, no volver a suponer lo contrario). En la tabla de precios del plan,
Argentina **no aparece con fila propia**: está adentro del grupo **"Otros países o
regiones"** (hay que desplegarlo con la flechita ▶ para verla), con el precio en **USD** y
marcada "Sin IVA". O sea:
- La docente paga **en dólares** con su tarjeta argentina; la conversión a pesos la hace su
  banco, al "dólar tarjeta", que es más caro que el oficial. El número de su resumen va a
  ser bastante más alto que el precio en dólares por el cambio oficial. Las alícuotas
  argentinas cambian seguido — no anotar un porcentaje acá, se desactualiza.
- **No se puede fijar un precio redondo en pesos** aunque se quiera: el campo de esa fila
  es en dólares. Por eso la landing anuncia el precio en USD y aclara lo del banco, en vez
  de prometer un número en pesos que después no se cumple.

⚠️ **Y los precios NO siguen al tipo de cambio solos.** Google convierte una sola vez, en
el momento de guardar, y ese número queda congelado hasta que se lo cambie a mano (como
mucho manda un aviso sugiriendo actualizarlo). Para los países que sí tienen moneda local,
eso significa revisarlos cada tanto. (En una sesión anterior se dijo lo contrario acá — era
falso.)

**Cómo se cambia un precio, por si hay que repetirlo** (cuesta encontrarlo): Monetiza con
Play → Productos → Suscripciones → `agenda_completa` → tocar el plan base (`mensual`) →
scrollear hasta abajo del todo, pasando período de gracia / suspensión / "Volver a
suscribirse", hasta la tabla de países → tildar el casillero del encabezado (ojo con la
paginación de 10 filas: confirmar que diga "Se eligieron 177 países") → botón **"Definir
precio"** → poner el valor en **USD** → **Actualizar** → **Guardar cambios**. Conviene
hacerlo en la compu: en el celular la tabla scrollea de costado y es un suplicio.
- Los beneficios cargados en la ficha del producto (visibles para la compradora): Cursos
  ilimitados, Licencias/paros y eventos administrativos, Alertas automáticas de
  vencimientos, Respaldo en tu Google Drive. El diálogo `licPaywall()` en `index.html` ya
  se actualizó para decir lo mismo (antes tenía el texto viejo de la primera versión del
  candado, que ofrecía como premium cosas que en realidad son gratis).
- Clasificación por edad del producto: sin especificar (ese campo solo aplica a ciertos
  estados de EE.UU., no afecta a Argentina).

### La cuenta de servicio para `PLAY_SERVICE_ACCOUNT` (creada 28/8/2026)

- **Cuenta de servicio:** `play-store-api@agenda-docente-8c53d.iam.gserviceaccount.com`,
  creada en Google Cloud Console (proyecto `agenda-docente-8c53d`, IAM y administración →
  Cuentas de servicio). Sin roles de IAM asignados en Cloud — no los necesita.
- **Clave JSON descargada** y guardada en la carpeta de Drive de la dueña junto con el
  `signing.keystore` (mismo criterio: nunca commitear al repo).
- **Invitada en Play Console** (Usuarios y permisos → Invitar a un usuario) con **un solo
  permiso**: "Ver los datos financieros" sobre la app Agenda Docente. A propósito no se le
  dio "Administrar los pedidos y las suscripciones" — las funciones (`verifyPurchase`,
  `playRtdn`) solo necesitan leer el estado, no reembolsar ni cancelar.
- **El secreto ya está cargado** en Secret Manager (Google Cloud Console → Seguridad →
  Secret Manager → `PLAY_SERVICE_ACCOUNT`, proyecto `agenda-docente-8c53d`), subiendo el
  archivo JSON directo desde el navegador — no hizo falta la Firebase CLI para este paso.
  `defineSecret("PLAY_SERVICE_ACCOUNT")` en `functions/index.js` lo va a encontrar solo en
  el momento del deploy, sin volver a tocar nada de esto.
- **Nota para la pantalla de "Acceso a la API" de Play Console:** en esta versión de Play
  Console esa pantalla clásica no aparece ni en "Usuarios y permisos" ni en "Configuración"
  — se resolvió igual armando la cuenta de servicio directo en Google Cloud e invitándola
  como "usuario" en Play Console con el permiso puntual.

### Pendientes en orden (actualizado 27/8/2026 — el orden cambió)

1. ~~Revisar y juntar las dos ramas~~ ✅ hecho.
2. ~~Crear la cuenta de comerciante / perfil de pagos~~ ✅ hecho (falta solo el banco, ver
   arriba).
3. ~~Regenerar el `.aab` declarando Play Billing y subirlo a prueba interna~~ ✅ hecho
   (versión 2, `1.0.1.0`), reusando la firma original de PWABuilder.
4. ~~Crear el producto de suscripción en Play Console~~ ✅ hecho, planes mensual y anual
   activos (ver arriba).
5. ~~Actualizar el texto de `licPaywall()` en `index.html`~~ ✅ hecho, ya coincide con los
   beneficios reales cargados en Play Console (ver arriba).
6. ~~Pasar Firebase a plan Blaze~~ ✅ hecho (28/8/2026), reusando la cuenta de facturación
   que ya tenía la dueña de otro proyecto. Se armó además una alerta de presupuesto en $0
   para el proyecto `agenda-docente-8c53d` específicamente (solo alertas, no corta el
   servicio), en Google Cloud Console → Facturación → Presupuestos y alertas.
   ~~Crear el secreto `PLAY_SERVICE_ACCOUNT`~~ ✅ hecho (28/8/2026) — ver el bloque nuevo
   más abajo con el detalle de la cuenta de servicio.
   ~~Desplegar `functions/`~~ ✅ hecho (28/8/2026) desde Google Cloud Shell (sin instalar
   nada en la compu de la dueña — `git clone` del repo, `npm install -g firebase-tools`,
   `firebase login --no-localhost`, `firebase deploy --only functions --project
   agenda-docente-8c53d`). Las dos funciones están corriendo:
   - `verifyPurchase`: callable, sin URL pública.
   - `playRtdn`: `https://us-central1-agenda-docente-8c53d.cloudfunctions.net/playRtdn`
   ~~Configurar RTDN~~ ✅ hecho (28/8/2026), armado entero desde Cloud Shell con `gcloud`
   (no hizo falta la pantalla de Pub/Sub en la consola web):
   1. Tema de Pub/Sub creado: `projects/agenda-docente-8c53d/topics/play-rtdn`
      (`gcloud pubsub topics create play-rtdn`).
   2. Permiso de publicar en ese tema otorgado a la cuenta de servicio de Google Play
      (`google-play-developer-notifications@system.gserviceaccount.com`, rol
      `roles/pubsub.publisher`).
   3. Suscripción push creada (`play-rtdn-sub`) apuntando a la URL de `playRtdn`.
   4. Probado a mano con `gcloud pubsub topics publish` + `curl` directo a la función
      (devolvió `HTTP/2 400 Falta message.data`, lo esperado sin `purchaseToken` real —
      confirma que la función está pública y responde bien, sin bloqueo de permisos).
   5. Cargado en Play Console → Monetiza con Play → Configuración de monetización →
      "Notificaciones en tiempo real": tildado "Habilitar", nombre del tema
      `projects/agenda-docente-8c53d/topics/play-rtdn`, contenido "Solo suscripciones y
      compras anuladas" (correcto, esta app no vende productos únicos). Guardado, y se
      mandó la "notificación de prueba" desde el botón de Play Console — confirmó "Se
      envió la notificación de prueba". **Pendiente para la próxima sesión:** confirmar
      en los logs de Cloud Functions (`gcloud functions logs read playRtdn --gen2
      --region=us-central1 --limit=10`) que esa notificación de prueba de Play realmente
      llegó a la función — se cortó la sesión antes de revisar ese último log.
   (No hay ningún "cruce de cuentas": es todo `estudioam.dev@gmail.com` — ver "Ojo con
   las cuentas".)
7. Integrar en `index.html` el flujo de compra con la Digital Goods API — **código
   hecho, probado a fondo en el celular real el 28/8/2026, pero todavía NO se pudo
   completar una compra de punta a punta.** Se llegó lejos y se encontraron y
   arreglaron varios bugs reales; queda un bloqueo final sin resolver. Detalle completo
   abajo para no repetir la investigación en la próxima sesión.

   **Cómo quedó el flujo:**
   - Botón en el menú ⋯ → **"Mi suscripción"**. Si no tenés la versión completa, abre el
     cuadro de siempre (beneficios) y, si la app está corriendo empaquetada
     (`getDigitalGoodsService` existe), busca los planes disponibles y muestra tarjeta(s)
     con precio real y botón de compra. Si la abrís desde el navegador, en cambio,
     muestra "abrí la app de Play Store" con un link — no se puede pagar desde la web.
   - Al comprar: pide iniciar sesión con `fbSignIn()` (Firebase, si no lo hizo antes),
     dispara el cuadro de pago nativo con `PaymentRequest` + `https://play.google.com/billing`,
     y al confirmar llama a la Cloud Function `verifyPurchase` con el `purchaseToken`
     para dar acceso inmediato. `verifyPurchase` también hace el **acknowledge** de la
     suscripción (`purchases.subscriptions.acknowledge`), que Google exige dentro de las
     72 hs o reembolsa sola.

   **Bugs reales encontrados y ya arreglados (28/8/2026), probando en el celular:**
   - `getDetails()` no reconocía ningún formato de id de plan probado
     (`agenda_completa:mensual`, `mensual` solo) → **causa real**: comprando desde la
     Digital Goods API en una TWA, Google Play hoy **solo deja ver/comprar el plan
     marcado como "Compatible con versiones anteriores"** en la consola — no los dos a
     la vez. No es un bug de la app, es una limitación real y actual de esta tecnología,
     confirmada con un reporte idéntico de otro desarrollador a Google (issue de
     Bubblewrap #830). Se arregló consultando primero el id "plano" del producto
     (`agenda_completa`, sin plan), que sí encuentra el plan permitido, e identificando
     cuál es (mensual/anual) por la duración que informa Google
     (`subscriptionPeriod`). Con la config actual, el plan comprable es el **mensual**.
     El anual quedó configurado en Play Console pero no comprable desde la app hasta que
     Google lo permita.
     - `licPaywall()` ya lo maneja bien: si solo hay un plan disponible, muestra una
       sola tarjeta con una nota chica y neutra explicándolo (no un error) — si algún
       día Google habilita los dos, la grilla de dos columnas vuelve sola sin tocar
       código.
     - **Pendiente de decisión (no técnica, es de la dueña):** ¿dejar así (solo vender
       el mensual desde la app, sumar el anual cuando Google lo permita), o cambiar cuál
       plan está marcado "Compatible con versiones anteriores" en Play Console
       (Monetiza con Play → Productos → Suscripciones → `agenda_completa` → planes
       base) para vender el anual en su lugar? Cambiarlo no tiene costo técnico, es un
       toggle en la consola — pero el otro plan sigue sin poderse comprar desde la app
       hasta que Google resuelva esto de fondo.
   - `PaymentRequest` tiraba **"No se pudo iniciar la compra"** sin detalle → causa
     real: el código mandaba el identificador del producto en `data:{itemId}`, pero la
     documentación oficial de Chrome para este método de pago pide la clave **`sku`**,
     no `itemId` (aunque el resto de la Digital Goods API sí usa `itemId` para
     `getDetails()` — son dos convenciones distintas conviviendo). Arreglado:
     `data:{sku:itemId}`.
   - Se agregó `describeError()` para mostrar nombre + código de cualquier error de
     Play en vez de un genérico sin info — fue clave para diagnosticar todo lo de
     arriba sin depurar por USB. Si en algún test futuro el diagnóstico muestra texto en
     rojo, copiarlo tal cual.
   - Quedó un documento de prueba vieja en Firestore (`subscriptions/{uid}` con
     `status:"active"`, sin `purchaseToken` real) que hacía que la cuenta de prueba
     pareciera tener ya la versión completa — se identificó y se borró a mano desde la
     consola de Firebase. Si vuelve a pasar algo similar (una cuenta que "ya tiene la
     completa" sin haber comprado nunca), revisar `subscriptions` en Firestore por un
     documento viejo de alguna prueba.

   **🔴 Bloqueo actual, sin resolver:** con el `sku` ya arreglado, la compra real en el
   celular tira ahora **`NotSupportedError: The payment method
   "https://play.google.com/billing" is not supported. (code 9)`**.

   ⚠️ **CORRECCIÓN IMPORTANTE (29/8/2026): el "code 9" NO es de Google Play.** Se había
   anotado que era `FEATURE_NOT_SUPPORTED` de Play Billing, y eso mandó a investigar el
   `.aab` al pedo. Verificado contra la documentación oficial de Android:
   `FEATURE_NOT_SUPPORTED` vale **−2**, y **ningún** código de Play Billing vale 9. El 9
   sale de `describeError()` en `index.html`, que imprime `e.code`: para un
   `DOMException` ese campo es el código viejo del estándar web, donde
   `NotSupportedError` = 9. O sea, el "(code 9)" es simplemente la forma numérica de
   "NotSupportedError" y no agrega información ninguna. El error real es el texto pelado:
   **Chrome dice que no encuentra quién atienda el método de pago de Google Play.**
   (Se dejó un comentario en `describeError()` avisando esto, para no volver a caer.)

   **✅ EL `.aab` PUBLICADO ESTÁ PERFECTO — verificado abriéndolo (29/8/2026). NO hay
   que regenerarlo, ni con PWABuilder ni con Bubblewrap.** Se abrió el archivo
   `Agenda Docente.aab` de la carpeta de Drive (un `.aab` es un zip: se descomprime y se
   leen `BUNDLE-METADATA/com.android.tools.build.libraries/dependencies.pb` y
   `base/manifest/AndroidManifest.xml`). Es el build publicado: `versionName 1.0.1.0`,
   `package com.estudioam.agendadocente`, `targetSdk 36`. Trae **todo** lo que hace falta:
   - `com.google.androidbrowserhelper:billing:1.2.0` (el mínimo exigido era 1.1.0) ✅
   - `com.android.billingclient:billing:8.3.0` (el mínimo exigido era 7.0.0) ✅
   - `com.google.androidbrowserhelper:androidbrowserhelper:2.7.0-alpha02` — la versión
     *alpha*, o sea que PWABuilder efectivamente prendió `alphaDependencies` ✅
   - permiso `com.android.vending.BILLING` ✅
   - `...playbilling.provider.PaymentActivity` y `...playbilling.provider.PaymentService` ✅
   - los filtros `org.chromium.intent.action.PAY` e `IS_READY_TO_PAY`, y el dato
     `org.chromium.default_payment_method_name` = `https://play.google.com/billing` ✅

   **Quedan descartadas de raíz, con evidencia, las dos hipótesis viejas:** (1) que
   PWABuilder no armara el puente nativo — lo arma completo, idéntico a lo que armaría
   Bubblewrap (además se leyó su código fuente: `pwabuilder-google-play`,
   `build/bubbleWrapper.ts`, prende `alphaDependencies` solo cuando pedís playBilling);
   y (2) que la librería de billing estuviera vieja — está más nueva que el mínimo.
   **Migrar a Bubblewrap no tiene ningún sentido: produciría exactamente lo mismo.**

   **Dónde queda parada la búsqueda entonces:** el paquete está bien y el código de
   `index.html` sigue la documentación oficial al pie de la letra (se releyó
   `playComprar()`: método `https://play.google.com/billing`, `data:{sku:itemId}`,
   `total` presente — todo correcto). Y sabemos que el puente **funciona en parte**,
   porque `getDigitalGoodsService()` + `getDetails()` sí devolvieron el precio real del
   plan mensual desde Google. O sea: Play contesta cuando le preguntamos el precio, pero
   Chrome dice no encontrar quién cobre cuando le pedimos cobrar. Eso deja como
   sospechoso principal **el entorno del celular de prueba, no el paquete ni el código**:
   - **Hipótesis principal: qué navegador está mostrando la app por dentro.** Una app
     empaquetada (TWA) la dibuja el navegador predeterminado del celular, que no siempre
     es Chrome (en Samsung suele ser Samsung Internet). Hay un reporte de otro
     desarrollador con este mismo cuadro —Digital Goods API andando, `PaymentRequest`
     fallando— que **se resolvió solo con poner Chrome como navegador predeterminado**
     (PWABuilder issue #6151). Es lo más barato de probar y lo primero que hay que
     descartar.
   - Hipótesis secundaria: Chrome o Play Store desactualizados en ese celular puntual.
   - Hipótesis a tener presente pero difícil de confirmar: que el modelo nuevo de
     "planes base y ofertas" de Play Console tenga soporte incompleto en este camino de
     compra. Ojo que el límite de "solo se puede comprar el plan marcado compatible con
     versiones anteriores" ya está confirmado (issue #830 de Bubblewrap) y ya está
     resuelto en el código — es otra cosa, no este bloqueo.

   **Herramienta nueva para la próxima prueba (ya en el código, `APP_VER v2026.08.28-2`):**
   cuando la compra falla, en vez de un cartelito que se va solo, ahora se abre un cuadro
   que se queda quieto y se puede fotografiar, con cuatro datos: el error, **qué navegador
   está mostrando la app** (`describeBrowser()`), el id del producto, y si Google Play
   acepta el pago (`canMakePayment()`). Con una sola prueba en el celular ya se sabe si la
   hipótesis del navegador es la buena, sin publicar otra versión ni enchufar el celu a
   una computadora.

   **RESULTADO DE ESA PRUEBA (29/8/2026, celular Motorola de la dueña, `v2026.08.28-2`):**
   ```
   Error: NotSupportedError: The payment method "https://play.google.com/billing"
          is not supported. (code 9)
   Navegador que muestra la app: Chrome 151.0.0.0
   Producto: agenda_completa
   Google Play acepta el pago: no
   ```
   Qué se deduce de ahí:
   - **La hipótesis del navegador queda descartada: es Chrome 151**, actualizadísimo. (La
     dueña usa **Motorola**, no Samsung — anotarlo porque ya se dio por sentado mal una
     vez.)
   - **El puente de Play funciona a medias, y eso es el dato más raro:** para llegar a
     tocar el botón de comprar, la app tuvo que haber mostrado la tarjeta del plan con su
     precio real, y esas tarjetas solo se dibujan si `getDigitalGoodsService()` conectó
     **y** `getDetails()` devolvió el producto desde Google (ver `licPaywall()`: si no
     hay detalles, muestra "No se pudo cargar el precio" y no dibuja ninguna tarjeta).
     O sea: **Play contesta el precio, pero Chrome no encuentra quién cobre.** Confirma
     de nuevo que el `.aab` y el código están bien.
   - `canMakePayment()` da **no**, así que no es un problema de "gesto del usuario"
     (eso daría `NotAllowedError`, y `canMakePayment` no necesita gesto): Chrome
     directamente no encuentra un método de pago disponible.

   **🎯 CAUSA ENCONTRADA (29/8/2026): la app estaba instalada desde el archivo `.apk`,
   no desde Play Store.** Lo confirmó la dueña. **Google Play Billing no funciona jamás
   en una app instalada a mano (sideload):** Play acepta *consultar* el catálogo —por eso
   `getDetails()` devolvía el precio real del plan mensual, que fue lo que nos confundió
   toda la investigación— pero **rechaza el cobro** si la app no llegó desde Play Store.
   Del lado de Chrome eso se ve exactamente como lo que salía: no encuentra un método de
   pago disponible (`canMakePayment()` → `no`, y `PaymentRequest` tira
   `NotSupportedError`). No había nada roto en el `.aab`, ni en `index.html`, ni en el
   navegador.

   ⚠️ **Regla general, vale para cualquier app de la dueña que venda algo por Play (va a
   subir más):** el `.apk` que largan PWABuilder/Bubblewrap sirve para probar que la app
   *abre* y se ve bien, pero **NO sirve para probar compras**. Cualquier prueba de pago
   tiene que hacerse con la app bajada desde Play Store (pista de prueba interna alcanza)
   y con la cuenta del celular anotada como tester. Si alguien vuelve a ver "precio sí,
   compra no", chequear ESTO antes que nada — nos costó una sesión entera.

   **Hipótesis previa (ya confirmada, se deja escrito el razonamiento):**
   `getDetails()` puede funcionar aunque la app no se haya instalado desde Play (Play
   reconoce el paquete y el producto publicado igual), pero el **cobro** sí exige que la
   app haya llegado desde Play Store y que la cuenta del celular sea tester. En la
   carpeta de Drive hay también un `Agenda Docente.apk` — si en algún momento se instaló
   ese archivo a mano en vez de bajarla desde la prueba interna, encaja con todo el
   cuadro. **Falta confirmarlo con la dueña**, no está verificado.
   Ojo con la deducción inversa: la app instalada **es la versión 2** (la 1 no declaraba
   billing y `getDigitalGoodsService()` habría fallado), así que si el `.apk` de Drive es
   el del 19/8 (versión 1), entonces la instalada vino de Play y esta hipótesis se cae
   sola. No está chequeado cuál de los dos casos es.

   **AVANCE GRANDE DEL 29/8/2026 (noche): dos causas encontradas y arregladas, queda una.**
   Con la app ya bajada de Play Store (no del `.apk`) y el `assetlinks.json` corregido con
   la huella de la clave de firma de Play, la app **abre como app de verdad, sin la barra
   de dirección del navegador**, y el error cambió: ya no dice `unsupported context`.
   Ahora `getDetails()` falla con **`OperationError: clientAppUnavailable`** para todas
   las variantes de id probadas (`agenda_completa`, `agenda_completa:mensual`, `mensual`,
   `agenda_completa:anual`, `anual`).

   `clientAppUnavailable` quiere decir que Chrome no consigue hablar con el servicio de
   facturación que vive dentro de la app empaquetada. **Es un bug conocido y SIN arreglo
   publicado**: hay dos reportes abiertos y sin resolver de otros desarrolladores
   (`GoogleChrome/android-browser-helper` #431 y `GoogleChromeLabs/bubblewrap` #805),
   ambos en Android 13+, donde el "Delegation Service" de la app no llega a arrancar.
   Cosas que esos reportes ya probaron **sin éxito**: limpiar la caché de Play Store,
   subir el `targetSdkVersion`, revisar el permiso `BILLING`, actualizar Google Play
   Services. Ojo que esos reportes usaban `androidbrowserhelper 2.4.0` y nuestro `.aab`
   trae `2.7.0-alpha02`, bastante más nuevo.

   **✅ RESUELTO EL MISMO 29/8, Y LO QUE LO DESTRABÓ FUE REINICIAR EL CELULAR.** Después
   del reinicio, con la app bajada de Play y el `assetlinks.json` ya corregido, la compra
   abrió el cuadro de pago nativo de Google Play. Importante para no atribuirlo mal: en la
   pantalla se veía `v2026.08.28-2`, o sea **sin** los reintentos de `playFetchPlans()` —
   el reinicio solo. Encaja con el diagnóstico de que `clientAppUnavailable` es el
   "Delegation Service" de la app que no llegó a arrancar: reiniciar el sistema lo arma
   de nuevo. **Si vuelve a aparecer ese error, lo primero es reiniciar el celular**, antes
   de tocar nada de código o del `.aab`.

   **Lo que se probó de nuestro lado (en `v2026.08.28-3`), queda como red de seguridad:** como el síntoma parece una
   carrera contra el reloj —el puente tarda en quedar atado después de abrir la app—, se
   agregó `playFetchPlans()`, que reintenta hasta 5 veces con 1,5 s de espera y va
   mostrando "Conectando con Google Play… (intento N)". Si el problema era solo que
   preguntábamos demasiado pronto, esto lo resuelve. **Falta confirmarlo en el celular.**

   **Si el reintento no alcanza, ideas en orden para la próxima sesión:** (a) reiniciar el
   celular y probar de nuevo (el atado del servicio es cosa del sistema, y es gratis
   probarlo); (b) probar en otro celular Android, preferentemente con otra versión de
   Android, para ver si es específico de ese equipo; (c) revisar si `androidbrowserhelper`
   sacó una versión estable posterior a `2.7.0-alpha02` y regenerar el `.aab` con esa;
   (d) sumar nuestro caso a los reportes #431 / #805, que siguen abiertos — con los datos
   del `.aab` ya verificados en este documento, que son bastante más completos que los de
   esos hilos.

   **Próximos pasos concretos (ya hechos el 29/8, se dejan por si hay que rehacerlos):** reinstalar la app
   desde Play Store con la cuenta `englishbeatsclasesyrecursos@gmail.com` y repetir la
   compra. En orden: (a) que la dueña baje "Guardar copia en un archivo" del menú ⋯ antes
   de tocar nada; (b) confirmar que esa cuenta esté en la lista de **testers de la prueba
   interna** (es una lista distinta de la de prueba de licencias — está confirmada solo en
   la segunda), y sacar de ahí el link de invitación para testers; (c) aceptar la
   invitación con esa cuenta; (d) desinstalar la app instalada a mano; (e) instalarla
   desde Play Store; (f) repetir la compra del plan mensual.
   Si aun así fallara —no es lo esperable—, quedan como plan B: probar en un segundo
   celular Android, y escalar con el error exacto, los datos del `.aab` verificados arriba
   y este diagnóstico al repositorio `GoogleChrome/android-browser-helper` en GitHub, que
   es donde vive el puente y donde contestan quienes lo mantienen.
   - `LIC_ENFORCE` **sigue en `false`** a propósito — no lo enciendas hasta resolver
     este bloqueo y completar una compra de punta a punta de verdad. La cuenta de
     Estudio AM no sirve para probar porque está en `LIC_REGALADAS`. Ya hay una lista de
     **cuentas de prueba de licencias** cargada en Play Console (Configuración → Prueba
     de licencia — nombre de la lista: "Verificadores Agenda Docente"), con 4 mails
     agregados, entre ellos `englishbeatsclasesyrecursos@gmail.com` (la que se usó para
     esta prueba) y `estudioam.dev@gmail.com`.
     **Confirmado de nuevo el 29/8/2026 por la dueña: esa lista está cargada y englishbeats
     está adentro. NO volver a preguntarlo ni pedir captura.** Link directo, por si hace
     falta mirarlo:
     `https://play.google.com/console/u/0/developers/6208089129841152998/settings/license-testing`

   **DÓNDE QUEDÓ LA COMPRA AL CIERRE DEL 29/8/2026 (lo único pendiente):** el cuadro de
   pago de Google Play **abre correctamente** — toda la cadena técnica funciona. Pero la
   cuenta `englishbeats` **nunca tuvo una forma de pago cargada**, así que Google muestra
   la pantalla de alta *"Comienza por agregar una forma de pago"* (opciones: "Canjear
   código" y "Agregar tarjeta") en vez del listado de tarjetas donde vive la **tarjeta de
   prueba** ("siempre aprueba"). Verificado en el celular: en "Más opciones" solo ofrece
   cargar una tarjeta real. O sea que la compra **todavía no se completó de punta a punta**.
   Ojo: esas pantallas de pago **no se pueden fotografiar** (Android bloquea la captura y
   sale toda negra), así que no pedirle capturas de ahí — que lo cuente con palabras.
   **Dato del celular de prueba (Motorola de la dueña), por si explica algo más adelante:
   tiene DOS perfiles (personal y de trabajo), o sea dos Google Play Store instaladas.**
   Por eso Play Store le ofrece "Cambiar a Play Store (personal)". Al limpiar caché hay que
   hacerlo en las dos. Si alguna vez algo se comporta distinto entre "la app que veo" y "la
   cuenta que paga", mirar esto antes que nada.
   **Se probó borrar la caché de Google Play Store (29/8, las dos —el celular tiene dos
   perfiles, personal y de trabajo, ver más abajo) y no alcanzó:** sigue sin aparecer la
   tarjeta de prueba, solo el alta de una tarjeta real.

   **Investigado (29/8/2026): no hay una solución oficial documentada para esto.** Se
   buscó en la documentación de Android para desarrolladores y en la comunidad de Google
   Play Developer — la única explicación es que "los probadores de licencia tienen acceso
   a métodos de pago de prueba", sin detallar por qué a veces Google muestra el alta de
   una tarjeta real en su lugar. Hay un hilo de otro desarrollador con el mismo síntoma
   exacto (comunidad de Google Play Developer, "Test subscription is asking for my real
   payment method instead of showing a test card") pero no se pudo leer su resolución
   (`support.google.com` está bloqueado desde este entorno). **Descartada la idea de
   "canjear código"**: es para tarjetas de regalo de Play compradas con plata real, no
   tiene que ver con ser probador de licencia — no sirve para esto.

   **Hipótesis más probable, sin confirmar:** la pantalla de alta aparece cuando la cuenta
   nunca tuvo ningún historial de pago en Google (ni siquiera fallido) — parece un tema de
   "cuenta en cero", no específico de esta app. Probar con una cuenta que tenga algo de
   movimiento en Play (otra app, un juego) en vez de una cuenta nueva/vacía.

   **Se probó con `mullerana2@hotmail.com` (29/8/2026, mismo Motorola) y dio un cuadro
   distinto y sin explicar todavía:** esa cuenta es la principal del celular de la dueña,
   con uso real de Play Store (bajó apps, juega juegos) — o sea que la teoría de "cuenta
   en cero" no aplica acá. Al abrir el link de invitación, Google **sí la reconoce como
   tester** ("You're a tester for com.estudioam.agendadocente"), pero al tocar "Download
   test app" tira **"No se encontró el elemento"**. Y buscando "agenda docente" a mano en
   Play Store con esa cuenta, la nuestra **no aparece en absoluto** (solo apps de otros
   desarrolladores con nombre parecido). Se descartó de entrada la idea de restricción de
   país: la dueña confirmó que en la pista de prueba interna ya está tildado "todos los
   países". Causa real sin identificar todavía — no es la misma familia de problemas que
   la de englishbeats (que si aparece y se puede bajar, solo falla en el pago).

   **Próximo a probar, en orden:** (a) repetir la compra logueada con
   `marcelodanielcordoba74@gmail.com` (otro tester de la lista, en el celular del marido
   de la dueña, no disponible el 29/8 a la noche) por si esa cuenta muestra la tarjeta de
   prueba sin el problema de "item not found" que dio mullerana2; (b) si hay tiempo,
   investigar por separado por qué mullerana2 ni aparece en la búsqueda de Play Store
   pese a que Google la reconoce como tester — no se investigó a fondo, se dejó de lado
   por prioridad (esto es solo para probar la tarjeta, no bloquea nada real); (c) dejarlo
   unos días — puede que la condición de probador tarde en propagarse del todo pese a
   estar bien cargada; (d) si nada de esto destraba y hay apuro por confirmar la compra
   de punta a punta, evaluar una compra real + pedir el reembolso desde Play Console
   (plata real por un rato, decisión de la dueña, no urgente).
   **Importante: esto NO afecta a ninguna profe real** — una cuenta real con su propia
   tarjeta jamás ve esta pantalla rara, paga y ya. Es puramente un artefacto de la cuenta
   de prueba.

   **Otros arreglos de esta sesión (28/8/2026), no relacionados con la compra en sí
   pero encontrados mientras se probaba, todos ya en `main`:**
   - El `service-worker.js` pedía la página con `fetch()` normal, que respeta la caché
     HTTP del navegador — GitHub Pages manda `Cache-Control` con un rato de validez, así
     que el celular podía quedarse mostrando una versión vieja por más que el service
     worker en sí estuviera al día. Se agregó `cache:"no-store"` para forzar siempre ir
     a la red. Este fue el motivo real de tener que estar borrando caché constantemente
     durante toda la sesión de hoy.
   - El botón "Recargar la app" (flechita circular del topbar) antes solo hacía
     `location.reload()`, que no alcanza si quedó un service worker viejo controlando la
     página. Ahora primero desregistra el service worker y borra su caché, y recién ahí
     recarga — reemplaza tener que ir a la configuración de Android a borrar caché.
   - Se agregó un número de versión (`APP_VER`, formato `v2026.08.28-1`) visible
     siempre, en su propia fila chiquita y gris debajo de la barra del logo (no adentro
     del saludo de bienvenida, que dura muy poco) — pedido explícito de la dueña, con el
     mismo formato que usa en sus otras apps (ver "My Band Box" como referencia).
     **Acordarse de incrementar el número al final de `APP_VER` en cada cambio real**
     que se publique, para poder confirmar de un vistazo si una actualización llegó.
8. Completar la ficha de Play Store (iba en "2 de 11 tareas").
   **Verificado en pantalla el 29/8/2026: nombre, descripción breve y descripción completa
   YA ESTÁN CARGADOS** en Play Console (Presencia en Play Store → Fichas de Play Store →
   `.../app/4974565274805185721/main-store-listing`). Ese texto vive solo en Play Console,
   no está guardado en este repo — si se vuelve a tocar, convendría copiarlo acá también
   para no depender de una sola fuente. Las capturas también están, en `play-store-assets/`.
   **Corrección (29/8/2026): no era solo la clasificación de contenido — el panel real
   (`.../app/4974565274805185721/app-dashboard`) tiene 11 tareas en total**, de las cuales
   3 ya estaban hechas (política de privacidad, categoría/contacto, ficha de Play Store).
   Yendo una por una:
   - **Categoría de app** → se completó en esta sesión: "Educación".
   - **Anuncios** → "No, mi app no contiene anuncios".
   - **Apps gubernamentales**, **Funciones financieras**, **Salud** → las tres "no aplica".
   - **Detalles de acceso** → se marcó **"No"** (ninguna parte restringida): correcto
     mientras `LIC_ENFORCE=false`, porque hoy nada de la app pide cuenta ni pago.
     🚨 **Volver a tocar esto el día que se prenda el candado de pago de verdad** — ahí sí
     va a haber contenido pago y hay que marcar "Sí" y darle a Google una cuenta de
     prueba para revisar esas partes.
   - **Clasificación de contenido** → completada: categoría "El resto de los tipos de app",
     todo "No" salvo **"¿Permite comprar productos digitales?" → Sí** (por la suscripción
     de Play Billing, aunque hoy esté apagada) y sin loot boxes. Dio 14+ en Brasil (ClassInd
     es más estricto con cualquier compra dentro de la app) y "Todos" en EE.UU. (ESRB) —
     es normal, no es un error.
   - **Público objetivo** → completada: solo **"Mayores de 18 años"** (no es una app para
     chicos), sin restringir además el acceso a menores detectados por Google (opcional,
     no hace falta).
   - **Seguridad de los datos** → completada, la más larga. Resumen de lo que se declaró:
     - **Sí recopila datos, pero no comparte nada con terceros.**
     - Datos que sí se declaran como recopilados: **Nombre, Dirección de correo
       electrónico, ID de usuario** (los tres vía Google Sign-In/Firebase Auth, opcionales,
       con fin "Funciones de la app") y **Historial de compras** (por Firestore/Play
       Billing, con fin "Funciones de la app").
     - **Todo lo demás declarado que NO se recopila**: ubicación, fotos/videos, audio,
       archivos y documentos, calendario, contactos, mensajes, actividad en la app,
       navegación web, rendimiento, IDs de dispositivo. El criterio usado: los cursos,
       asistencia, notas y archivos/fotos que carga la docente **nunca salen del
       dispositivo ni van a un servidor de Estudio AM** — quedan locales o, como mucho,
       en el Google Drive propio de la docente, así que no cuentan como "recopilados por
       el desarrollador". Solo cuenta lo que efectivamente toca Firebase (mail, nombre,
       uid, estado de suscripción).
     - **URL de eliminación de datos** (se pidió dos veces, para cuenta completa y para
       datos parciales): se usó la misma,
       `https://estudioamsoftware.github.io/agendadocente/privacy-policy.html#eliminar-datos`
       — se le agregó el `id="eliminar-datos"` al `<h2>` de la sección 7 de
       `privacy-policy.html` para poder linkear directo a esa parte.
     - Todos los datos declarados como "encriptados en tránsito: Sí" (todo viaja por
       HTTPS) y con login por "OAuth" (Google Sign-In).
   - **Las 11 tareas quedaron completas el 29/8/2026.** Falta un solo paso: ir a
     "Descripción general de la publicación" y tocar "Enviar la app para su revisión" —
     no se hizo todavía en esta sesión, hacerlo apenas se retome.
9. Cargar la forma de pago (cuenta bancaria) después de la consulta con contador/gestor.
10. ~~Armar una landing page para promocionar la app por fuera de Google Play~~ ✅ hecha
    el 29/8/2026. Vive en **`landing.html`** (más las imágenes livianas de
    `landing-assets/`), o sea:

        https://estudioamsoftware.github.io/agendadocente/landing.html

    Ese es el link que se pasa por WhatsApp para promocionar. **No se tocó `index.html`**:
    la app sigue siendo la raíz del sitio, así que ni la PWA, ni el TWA de Play, ni el
    `assetlinks.json` se enteran de que existe la landing.
    Cosas que conviene saber antes de tocarla:
    - **A propósito NO enlaza `manifest.json` ni registra el service worker.** Si lo
      hiciera, el navegador ofrecería instalar la página equivocada como app.
    - Las capturas son las mismas de `play-store-assets/`, pero convertidas a `.webp` de
      460 px de ancho (`landing-assets/shot-*.webp`, ~25 KB cada una en vez de ~180 KB)
      para que cargue rápido con datos del celular. Si se cambian las capturas de Play,
      regenerarlas con Pillow (`Image.open(...).resize(...).save(..., "WEBP", quality=80)`).
      **Ojo con `screenshot-7-notas-finales.png`:** esa tabla es más ancha que la
      pantalla del celular y la captura de Play Store quedó a mitad de un scroll
      horizontal, con columnas cortadas a los dos lados — se ve prolija en la ficha de
      Play (ahí no llama tanto la atención), pero como carta de presentación sola en la
      landing quedaba confusa. Por eso **no está en la galería de `landing.html`** — se
      usa `screenshot-1-bienvenida.png` en su lugar (`landing-assets/shot-bienvenida.webp`,
      que no se usaba en ningún otro lado). Si el día de mañana se saca una captura nueva
      de esa pantalla sin el corte, ahí sí se puede sumar.
    - `landing-assets/og.jpg` es la imagen que se ve cuando se comparte el link por
      WhatsApp o Facebook (sale de `play-store-assets/feature-graphic.png`).
    - **El botón de Google Play está apagado a propósito**: mientras la app esté en prueba
      interna, el link público de Play da 404 a quien no sea tester, así que dice
      "Pronto en Google Play". Cuando se pase a prueba abierta o producción (pendiente 8),
      hay un comentario en `landing.html`, dentro de la tarjeta del plan pago, con el
      `<a>` ya escrito para reemplazar ese cartel.
    - **La landing anuncia SOLO el plan mensual (USD 5,99), a propósito.** El anual de
      USD 50 está creado y activo en Play Console, pero hoy Google no deja comprarlo
      desde la app (por la Digital Goods API solo se puede comprar el plan marcado
      "Compatible con versiones anteriores", que es el mensual — ver más arriba, issue
      de Bubblewrap #830). Anunciarlo sería prometer algo que la app no puede cobrar.
      Hay un comentario en `landing.html` avisándolo, en la tarjeta del plan pago. Si
      algún día Google lo habilita, o si se cambia cuál plan está marcado compatible,
      ahí se suma. El precio está escrito a mano: si se cambia en Play Console, hay que
      cambiarlo también ahí.
    - **El precio va en dólares, no en pesos** (ver arriba: Argentina cae en "Otros países
      o regiones" y Play la cobra en USD). A propósito **no** se anuncia un número en
      pesos: con los recargos del dólar tarjeta se le erraría por bastante y quedaría
      viejo en cuanto se mueva el cambio.
    - 🚨 **Y tampoco se aclara en la landing que la conversión la hace el banco**
      (decisión de la dueña, 31/8/2026, textual: "no aclares lo del banco, que lo vean al
      pagar... cómo hace Netflix"). Hubo una versión de la letra chica que lo explicaba y
      se sacó. Sostiene la decisión que **Play muestra el importe final antes de
      confirmar la compra**, así que nadie se entera después de pagar. Hay un comentario
      en `landing.html` avisándolo, para que a nadie se le ocurra "mejorarlo" volviendo a
      agregar la explicación.
    - Los beneficios del plan pago son **los mismos cuatro** que están cargados en la
      ficha del producto de Play Console y en `licPaywall()`. Si se toca uno, tocar los
      tres lugares.
11. **Pendiente futuro, no bloquea nada de lo anterior:** unificar los dos proyectos de
    Google Cloud de esta app (`agenda-docente-506819` de Drive y `agenda-docente-8c53d` de
    Firebase) en uno solo. Hoy conviven sin problema y ninguna docente nota la diferencia
    — es una prolijada administrativa, no algo urgente. Pero **conviene hacerlo mientras
    solo la dueña usa el respaldo de Drive** (nadie más todavía, 28/8/2026), porque después
    de que se sumen docentes reales, mudar el `GD_CID` vuelve a tener el mismo costo que la
    mudanza del 27/8 (ver "Cómo mudar el `GD_CID` sin perder datos" arriba — son los mismos
    pasos: crear un cliente OAuth nuevo *dentro* del proyecto `agenda-docente-8c53d`,
    declarar los scopes, la dueña baja "Guardar copia en un archivo" antes de tocar nada, se
    cambia `GD_CID` en `index.html`, se reconecta). Ojo: esto **no** resuelve por sí solo
    que hoy el login de Drive y el de Firebase Auth sean dos ventanas de consentimiento
    separadas — eso es un tema de código (dos flujos de login distintos), no de cuántos
    proyectos de Cloud hay atrás.
12. **Pendiente futuro, es un cambio de fondo — merece su propia sesión, no un ajuste
    arriba de otra cosa:** soportar que **un mismo dispositivo lo usen dos o más
    docentes** (caso real: una tablet del colegio compartida entre profes, planteado por
    la dueña el 28/8/2026). Hoy el diseño asume **un dispositivo = una docente**: los
    cursos (`localStorage`), la conexión de Google Drive (`gd`) y la suscripción
    (`lic` / Firebase Auth) son un solo cajón compartido en todo el dispositivo, sin
    separar por cuenta. Si dos profes comparten un celu/tablet, la segunda ve los cursos
    de la primera al abrir la app, y si conecta su propio Drive puede pisar o mezclar los
    datos de la primera (bajar el Drive de la segunda sobre los cursos locales de la
    primera, o subir los cursos de la primera al Drive de la segunda).
    - **Propuesta pensada (no implementada):** un selector de "¿Quién sos?" al abrir la
      app, con las docentes que ya usaron ese dispositivo más la opción de agregar una
      nueva. Cada una con su propio cajón de datos, su propia conexión de Drive y su
      propia suscripción, sin mezclarse entre sí.
    - Toca la base de cómo se guarda todo (no es un ajuste chico): hay que revisar cada
      lugar que lee/escribe `localStorage`, la lógica de `gd` (Drive) y de `lic`/Firebase
      Auth para que queden separados por perfil, en vez de global al dispositivo.
