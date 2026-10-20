# Taller AR · Image Tracking 🤖🦊

**Objetivo:** hacer que una imagen impresa cobre vida. Apuntas la cámara a un póster y
aparece encima un personaje 3D que puedes cambiar por el que tú quieras. Funciona en el
navegador, sin instalar ninguna app, con [MindAR](https://hiukim.github.io/mind-ar-js-doc/)
(reconoce la imagen) y [three.js](https://threejs.org/) (dibuja el 3D).

| Póster | Aparece |
|---|---|
| Robot naranja, "¡ESCANÉAME!" | Un robot que baila |
| Zorro, "MIRA MÁS DE CERCA" | Un zorro que anda |

## 1. Pruébalo en el móvil

1. Abre **https://CUENTA.github.io/taller-ar/** y permite la cámara.
2. Apunta a un póster.
3. Toca la pantalla: el personaje salta y cambia de animación.

## 2. Arráncalo en tu ordenador

Necesitas [VS Code](https://code.visualstudio.com/) con la extensión **Live Server** y una webcam.

1. Descarga el proyecto: **Code → Download ZIP**, y descomprímelo.
2. Abre la carpeta en VS Code.
3. Clic derecho en `index.html` → **Open with Live Server** → permite la cámara.
4. Enseña un póster a la webcam.

## 3. Pon tu propio personaje

1. Busca un modelo en [poly.pizza](https://poly.pizza/) y descárgalo en formato **GLB**.
2. Guárdalo en la carpeta `assets/` con un nombre sin espacios ni acentos, por ejemplo `dino.glb`.
3. Abre `main.js` y cambia la ruta:

   ```js
   const MODELO = './assets/dino.glb';
   ```

4. Guarda. La página se recarga sola y tu modelo aparece sobre el póster.

No hace falta ajustar el tamaño: el código lo centra y lo escala solo.

## Qué puedes tocar

Todo está al principio de `main.js`:

| Constante | Qué hace |
|---|---|
| `MODELO` | Personaje del póster del robot. |
| `MODELO_2` | Personaje del póster del zorro. |
| `ANIMACION`, `ANIMACION_2` | Animación inicial, si el modelo trae varias. Sus nombres salen en la consola (`F12`). |
| `TAMANO` | `1` = tan ancho como el póster. Prueba `0.5` o `1.5`. |
| `GIRA`, `FLOTA` | `true` o `false`: gira sobre sí mismo, sube y baja. |

**Reto extra:** usa tu propia imagen como póster. Súbela al
[compilador de MindAR](https://hiukim.github.io/mind-ar-js-doc/tools/compile), descarga el
archivo y sustituye `assets/targets.mind`. Funciona mejor con imágenes con muchos detalles.

## Si algo falla

- **No aparece nada:** más luz, sin reflejos, y que el póster ocupe buena parte de la imagen.
- **Pantalla en blanco:** abre la consola (`F12`). Casi siempre es la ruta del modelo mal escrita.
- **No arranca la cámara:** ábrelo siempre con Live Server, no con doble clic.
- **El modelo sale tumbado:** tras `ajustarAlMarcador(modelo, TAMANO);` añade `modelo.rotation.x = -Math.PI / 2;`

## Créditos

- Robot: *Robot Expressive* de [Quaternius](https://quaternius.com/), CC0.
- Zorro: *Fox* de PixelMannen (CC0) con animación de @tomkranis (CC-BY 4.0), vía [Khronos](https://github.com/KhronosGroup/glTF-Sample-Models/tree/main/2.0/Fox).
- Hecho con [MindAR](https://github.com/hiukim/mind-ar-js) y [three.js](https://threejs.org/).
