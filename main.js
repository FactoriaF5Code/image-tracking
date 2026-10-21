import { loadGLTF } from "./libs/loader.js";

const THREE = window.MINDAR.IMAGE.THREE;

// --- Config del taller: cambia aquí tu modelo ---------------------------
// Para poner otro modelo de poly.pizza: guarda el .glb en assets/ y cambia la ruta.
const MODELO      = './assets/robot.glb';   // póster del robot
const ANIMACION   = 'Dance';                // animación inicial (los nombres salen en la consola)
const MODELO_2    = './assets/zorro.glb';   // póster del zorro
const ANIMACION_2 = 'Walk';
const TAMANO = 1;      // 1 = tan ancho como el póster
const GIRA   = true;   // gira despacio
const FLOTA  = true;   // sube y baja
// -----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const start = async () => {

    // MindAR: le pasamos targets.mind, que tiene los dos pósters (0 = robot, 1 = zorro)
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: './assets/targets.mind',
    });
    const { renderer, scene, camera } = mindarThree;

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Cargamos los modelos. ajustarAlMarcador (abajo) los centra y escala al póster,
    // así no hay que andar probando scale y position para cada modelo.
    const robot = await loadGLTF(MODELO);
    ajustarAlMarcador(robot.scene, TAMANO);
    const robotAltura = robot.scene.position.y;

    const zorro = await loadGLTF(MODELO_2);
    ajustarAlMarcador(zorro.scene, TAMANO);
    const zorroAltura = zorro.scene.position.y;

    // Un ancla por póster. Lo que metemos en el ancla se mueve con el póster.
    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(robot.scene);

    const zorroAnchor = mindarThree.addAnchor(1);
    zorroAnchor.group.add(zorro.scene);

    // Animaciones: vienen dentro del .glb, solo hay que reproducirlas
    console.log('Animaciones del robot:', robot.animations.map(a => a.name));
    console.log('Animaciones del zorro:', zorro.animations.map(a => a.name));

    const robotMixer = new THREE.AnimationMixer(robot.scene);
    let robotClip = Math.max(0, robot.animations.findIndex(a => a.name === ANIMACION));
    let robotAccion = robotMixer.clipAction(robot.animations[robotClip]).play();

    const zorroMixer = new THREE.AnimationMixer(zorro.scene);
    let zorroClip = Math.max(0, zorro.animations.findIndex(a => a.name === ANIMACION_2));
    let zorroAccion = zorroMixer.clipAction(zorro.animations[zorroClip]).play();

    // Al tocar la pantalla: salto + siguiente animación de la lista
    let salto = 0;   // segundos que quedan de salto
    document.body.addEventListener('pointerdown', () => {
      salto = 0.6;

      robotAccion.stop();
      robotClip = (robotClip + 1) % robot.animations.length;
      robotAccion = robotMixer.clipAction(robot.animations[robotClip]).play();
      console.log('Robot:', robot.animations[robotClip].name);

      zorroAccion.stop();
      zorroClip = (zorroClip + 1) % zorro.animations.length;
      zorroAccion = zorroMixer.clipAction(zorro.animations[zorroClip]).play();
      console.log('Zorro:', zorro.animations[zorroClip].name);
    });

    // Cuando la cámara encuentra un póster, el personaje entra saltando
    anchor.onTargetFound = () => { salto = 0.6; console.log('Póster 1 detectado'); };
    zorroAnchor.onTargetFound = () => { salto = 0.6; console.log('Póster 2 detectado'); };

    // Bucle de dibujo, ~60 veces por segundo
    const clock = new THREE.Clock();
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();   // segundos desde el frame anterior
      const t = clock.elapsedTime;

      if (salto > 0) {
        // salto: altura en forma de arco y una vuelta entera mientras dura
        salto -= delta;
        const progreso = 1 - Math.max(salto, 0) / 0.6;
        const altura = Math.sin(progreso * Math.PI) * 0.35;
        robot.scene.position.y = robotAltura + altura;
        zorro.scene.position.y = zorroAltura + altura;
        robot.scene.rotation.y += delta * (Math.PI * 2 / 0.6);
        zorro.scene.rotation.y += delta * (Math.PI * 2 / 0.6);
      } else {
        if (GIRA) {
          robot.scene.rotation.y += delta * 0.8;
          zorro.scene.rotation.y += delta * 0.8;
        }
        if (FLOTA) {
          robot.scene.position.y = robotAltura + Math.sin(t * 2) * 0.04;
          zorro.scene.position.y = zorroAltura + Math.sin(t * 2) * 0.04;
        }
      }

      robotMixer.update(delta);
      zorroMixer.update(delta);
      renderer.render(scene, camera);
    });
  }

  start().catch((err) => {
    console.error(err);
    alert('Algo ha fallado: ' + (err.message || err) + '\nRevisa la ruta del modelo y el permiso de cámara.');
  });
});

// Escala el modelo para que su lado más largo mida `tamano` (el póster mide 1)
// y lo centra en el origen del ancla.
function ajustarAlMarcador(modelo, tamano) {
  const caja = new THREE.Box3().setFromObject(modelo);
  const medidas = caja.getSize(new THREE.Vector3());
  const escala = tamano / Math.max(medidas.x, medidas.y, medidas.z);
  modelo.scale.setScalar(escala);

  const centro = new THREE.Box3().setFromObject(modelo).getCenter(new THREE.Vector3());
  modelo.position.sub(centro);
}
