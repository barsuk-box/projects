import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
export default function Orbit({ motion }) {
  const host = useRef(null),
    running = useRef(motion);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    running.current = motion;
  }, [motion]);
  useEffect(() => {
    const element = host.current;
    let renderer,
      frame,
      model,
      mixer,
      disposed = false,
      visible = true;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer),
      room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    room.dispose();
    pmrem.dispose();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 1.1, 6.2);
    camera.lookAt(0, 0, 0);
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(3, 4, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const group = new THREE.Group();
    scene.add(group);
    const resize = () => {
      if (!element.clientWidth || !element.clientHeight) return;
      renderer.setSize(element.clientWidth, element.clientHeight);
      camera.aspect = element.clientWidth / element.clientHeight;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const visibility = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
    });
    visibility.observe(element);
    const disposeModel = (root) =>
      root.traverse((o) => {
        if (o.isMesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            m.dispose(),
          );
        }
      });
    new GLTFLoader().load(
      `${import.meta.env.BASE_URL}orbit.glb`,
      (gltf) => {
        if (disposed) {
          disposeModel(gltf.scene);
          return;
        }
        model = gltf.scene;
        group.add(model);
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((c) => mixer.clipAction(c).play());
      },
      undefined,
      () => {
        if (!disposed) setFailed(true);
      },
    );
    let x = 0,
      y = 0,
      scroll = 0;
    const pointer = (e) => {
      const r = element.getBoundingClientRect();
      x = (e.clientX - r.left) / r.width - 0.5;
      y = (e.clientY - r.top) / r.height - 0.5;
    };
    const leave = () => {
      x = 0;
      y = 0;
    };
    const onScroll = () => {
      scroll = Math.min(window.scrollY, 700) / 700;
    };
    const contextLost = (e) => {
      e.preventDefault();
      setFailed(true);
    };
    element.addEventListener("pointermove", pointer);
    element.addEventListener("pointerleave", leave);
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    window.addEventListener("scroll", onScroll, { passive: true });
    const clock = new THREE.Clock();
    function draw() {
      frame = requestAnimationFrame(draw);
      const delta = Math.min(clock.getDelta(), 0.05);
      if (!visible || document.hidden) return;
      if (running.current) {
        mixer?.update(delta);
        group.rotation.y += (x * 0.45 - group.rotation.y) * 0.045;
        group.rotation.x += (-y * 0.2 - group.rotation.x) * 0.045;
        group.position.y += (scroll * 0.3 - group.position.y) * 0.05;
      } else {
        group.rotation.set(0, 0, 0);
        group.position.y = 0;
      }
      renderer.render(scene, camera);
    }
    draw();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      element.removeEventListener("pointermove", pointer);
      element.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", onScroll);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      mixer?.stopAllAction();
      if (model) disposeModel(model);
      env.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <div
      className="scene"
      ref={host}
      aria-label="Объёмная орбита идей"
      role="img"
    >
      {failed && (
        <img
          className="scene-fallback"
          src={`${import.meta.env.BASE_URL}orbit-fallback.png`}
          alt=""
        />
      )}
    </div>
  );
}
