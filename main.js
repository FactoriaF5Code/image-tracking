import { loadGLTF } from "./libs/loader.js";

const THREE = window.MINDAR.IMAGE.THREE;

// =====================================================================
//   👇  LO ÚNICO QUE HAY QUE TOCAR EN EL TALLER  👇
// =====================================================================
// Póster 1 (marcador.png, el robot naranja) → MODELO
// Póster 2 (marcador-2.png, el zorro)       → MODELO_2
const MODELO      = './assets/robot.glb'; // ← cambia esto por tu modelo de poly.pizza (.glb)
const ANIMACION   = 'Dance';              // animación con la que empieza (si trae varias)
const MODELO_2    = './assets/zorro.glb';
const ANIMACION_2 = 'Walk';
const TAMANO    = 1;       // 1 = igual de ancho que el marcador. Prueba 0.5 o 1.5
const GIRA      = true;    // ¿gira despacio sobre sí mismo?
const FLOTA     = true;    // ¿sube y baja como si flotase?
// Abre la consola (F12) para ver los nombres de las animaciones de cada modelo.
// =====================================================================

document.addEventListener('DOMContentLoaded', () => {
  const start = async () => {

    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: './assets/targets.mind', // contiene los 2 pósters: nº 0 y nº 1
    });
    const { renderer, scene, camera } = mindarThree;

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Un personaje por póster (igual que el repo multi-imagen de Ana: addAnchor(0), addAnchor(1)...)
    const personajes = [
      await crearPersonaje(mindarThree, 0, MODELO, ANIMACION),
      await crearPersonaje(mindarThree, 1, MODELO_2, ANIMACION_2),
    ];

    // INTERACCIÓN: al tocar la pantalla, el personaje salta y cambia de animación
    document.body.addEventListener('pointerdown', () => personajes.forEach(p => p.truco()));

    // Arrancamos la cámara y el bucle de dibujo (se ejecuta ~60 veces por segundo)
    const clock = new THREE.Clock();
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();   // segundos desde el último frame
      const t = clock.elapsedTime;      // segundos desde el inicio
      personajes.forEach(p => p.actualizar(delta, t));
      renderer.render(scene, camera);
    });
  }

  start().catch((err) => {
    console.error(err);
    alert('Algo ha fallado: ' + (err.message || err) + '\nRevisa la ruta del modelo y el permiso de cámara.');
  });
});

// Carga un modelo, lo pega al marcador nº `indice` y devuelve sus funciones de animación
async function crearPersonaje(mindarThree, indice, ruta, animacionInicial) {

  // 1) Cargamos el modelo y lo centramos/escalamos sobre el marcador
  const gltf = await loadGLTF(ruta);
  const modelo = gltf.scene;
  ajustarAlMarcador(modelo, TAMANO);
  const alturaBase = modelo.position.y;

  // 2) Lo colgamos del marcador
  const anchor = mindarThree.addAnchor(indice);
  anchor.group.add(modelo);

  // 3) Si el modelo trae animaciones propias (robots, animales...), las usamos
  const clips = gltf.animations;
  let mixer = null, accion = null, actual = 0;
  const reproducir = (i) => {
    actual = i;
    if (accion) accion.fadeOut(0.2);
    accion = mixer.clipAction(clips[actual]).reset().fadeIn(0.2).play();
    console.log(`Póster ${indice + 1} · animación:`, clips[actual].name);
  };
  if (clips.length > 0) {
    console.log(`Póster ${indice + 1} · animaciones de ${ruta}:`, clips.map(c => c.name));
    mixer = new THREE.AnimationMixer(modelo);
    reproducir(Math.max(0, clips.findIndex(c => c.name === animacionInicial)));
  }

  // 4) Salto: al tocar la pantalla, o cuando el póster reaparece (tápalo y destápalo)
  let salto = 0; // segundos que quedan de salto (0 = en el suelo)
  anchor.onTargetFound = () => { salto = 0.6; console.log(`Póster ${indice + 1} detectado`); };
  const truco = () => {
    if (!anchor.group.visible) return;          // solo el personaje que se está viendo
    salto = 0.6;
    if (mixer) reproducir((actual + 1) % clips.length);
  };

  // 5) Lo que se mueve en cada frame
  const actualizar = (delta, t) => {
    if (salto > 0) {
      salto -= delta;
      const progreso = 1 - Math.max(salto, 0) / 0.6;                    // de 0 a 1
      modelo.position.y = alturaBase + Math.sin(progreso * Math.PI) * 0.35; // arco del salto
      modelo.rotation.y += delta * (Math.PI * 2 / 0.6);                 // una vuelta completa
    } else {
      if (GIRA)  modelo.rotation.y += delta * 0.8;                      // una vuelta cada ~8 s
      if (FLOTA) modelo.position.y = alturaBase + Math.sin(t * 2) * 0.04;
    }
    if (mixer) mixer.update(delta);
  };

  return { truco, actualizar };
}

// Escala el modelo para que su lado mayor mida `tamano` (el marcador mide 1 de ancho)
// y lo centra en el marcador. Así cualquier modelo de Poly Pizza se ve a la primera.
function ajustarAlMarcador(modelo, tamano) {
  const caja = new THREE.Box3().setFromObject(modelo);
  const medidas = caja.getSize(new THREE.Vector3());
  const escala = tamano / Math.max(medidas.x, medidas.y, medidas.z);
  modelo.scale.setScalar(escala);

  const centro = new THREE.Box3().setFromObject(modelo).getCenter(new THREE.Vector3());
  modelo.position.sub(centro);
  console.log('Modelo ajustado. Medidas originales:', medidas.toArray(), '→ escala:', escala.toFixed(4));
}
