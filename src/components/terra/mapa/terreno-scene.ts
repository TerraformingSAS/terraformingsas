import type { BufferGeometry, Line, Material, Mesh, MeshStandardMaterial } from "three";
import type { JoinedLot } from "@/lib/terra/mapa/join";
import { colocarLotes } from "@/lib/terra/mapa/ubicar-lotes";

export type TerrainPayload = {
  west: number;
  east: number;
  south: number;
  north: number;
  widthM: number;
  depthM: number;
  grid: number;
  elevMin: number;
  elevMax: number;
  heights: number[];
  perimetro: [number, number][];
  fuenteElevacion: string;
  fuenteImagen: string;
};

const STATE_COLOR: Record<string, number> = {
  Disponible: 0x66b48a,
  Reservado: 0xebcb6a,
  "En negociación": 0x86b9da,
  Vendido: 0xdb8179,
  "No disponible": 0xb4b9b4,
};

export type TerrainHandle = {
  setLots: (lots: JoinedLot[], visible: Set<string>) => void;
  setExaggeration: (value: number) => void;
  setView: (view: "3d" | "superior") => void;
  reset: () => void;
  setSelected: (id: string | null) => void;
  dispose: () => void;
};

export async function mountTerrain(
  canvas: HTMLCanvasElement,
  terrain: TerrainPayload,
  onPick: (id: string) => void,
): Promise<TerrainHandle> {
  const THREE = await import("three");
  const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xc5d5df);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xc5d5df, 2800, 7000);
  const camera = new THREE.PerspectiveCamera(42, 1, 1, 12000);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.minDistance = 40;
  controls.maxDistance = 4000;

  scene.add(new THREE.HemisphereLight(0xf4f7fb, 0x6d8a62, 1.15));
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.35);
  sun.position.set(400, 900, 200);
  scene.add(sun);

  const grid = terrain.grid;
  const geometry = new THREE.PlaneGeometry(terrain.widthM, terrain.depthM, grid - 1, grid - 1);
  geometry.rotateX(-Math.PI / 2);
  const base = geometry.attributes.position.array as Float32Array;
  const originalY = new Float32Array(base.length / 3);
  for (let row = 0; row < grid; row += 1) {
    for (let col = 0; col < grid; col += 1) {
      const index = row * grid + col;
      originalY[index] = terrain.heights[index] - terrain.elevMin;
      base[index * 3 + 1] = originalY[index];
    }
  }
  geometry.computeVertexNormals();

  const texture = await new THREE.TextureLoader().loadAsync("/terra/mapa/terreno.jpg");
  texture.colorSpace = THREE.SRGBColorSpace;
  const ground = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, metalness: 0 }),
  );
  scene.add(ground);

  const ring = terrain.perimetro.map(([x, z]) => {
    const y = sampleHeight(terrain, x, z) - terrain.elevMin + 3;
    return toScene(x, y, z);
  });
  const boundary = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(ring),
    new THREE.LineBasicMaterial({ color: 0xe07a2f }),
  );
  scene.add(boundary);

  const lotRoot = new THREE.Group();
  scene.add(lotRoot);
  const lotMeshes: { id: string; mesh: Mesh; geometry: BufferGeometry }[] = [];
  let lotSource: JoinedLot[] = [];
  let lotVisible = new Set<string>();

  const terrainTarget = new THREE.Vector3(0, (terrain.elevMax - terrain.elevMin) / 2, 0);
  let exaggeration = 1;

  function frameTerrain(view: "3d" | "superior") {
    controls.target.copy(terrainTarget);
    if (view === "superior") {
      camera.position.set(0, Math.max(terrain.widthM, terrain.depthM) * 0.9, 1);
    } else {
      camera.position.set(terrain.widthM * 0.35, 420, terrain.depthM * 0.42);
    }
    camera.lookAt(terrainTarget);
    controls.update();
  }

  function applyHeights() {
    const positions = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < originalY.length; i += 1)
      positions[i * 3 + 1] = originalY[i] * exaggeration;
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    const lift = exaggeration;
    const points = terrain.perimetro.map(([x, z]) => {
      const y = (sampleHeight(terrain, x, z) - terrain.elevMin) * lift + 3;
      return toScene(x, y, z);
    });
    boundary.geometry.dispose();
    boundary.geometry = new THREE.BufferGeometry().setFromPoints(points);
    rebuildLots();
  }

  function meshPoint(x: number, z: number) {
    const y = (sampleHeight(terrain, x, z) - terrain.elevMin) * exaggeration + 1.6;
    return toScene(x, y, z);
  }

  function toScene(x: number, y: number, z: number) {
    // La foto queda con el norte en −Z. El perímetro y los lotes usan ese mismo eje.
    return new THREE.Vector3(x - terrain.widthM / 2, y, terrain.depthM / 2 - z);
  }

  function rebuildLots() {
    for (const item of lotMeshes) {
      lotRoot.remove(item.mesh);
      for (const child of item.mesh.children) {
        const line = child as Line;
        line.geometry.dispose();
        (line.material as Material).dispose();
      }
      item.geometry.dispose();
      (item.mesh.material as Material).dispose();
    }
    lotMeshes.length = 0;
    const placed = colocarLotes(terrain, lotSource);
    for (const lot of placed) {
      const source = lotSource.find((item) => item.id === lot.id);
      const contour = lot.anillo.map(([x, z]) => new THREE.Vector2(x, z));
      const faces = THREE.ShapeUtils.triangulateShape(contour, []);
      const vertices: number[] = [];
      const points = lot.anillo.map(([x, z]) => meshPoint(x, z));
      for (const face of faces) {
        for (const index of face) {
          const point = points[index];
          vertices.push(point.x, point.y, point.z);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
          color: STATE_COLOR[source?.estado ?? ""] ?? 0xc5ced6,
          roughness: 0.55,
          metalness: 0,
          emissive: 0x000000,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2,
        }),
      );
      mesh.visible = lotVisible.has(lot.id);
      lotRoot.add(mesh);
      const edge = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: 0x0e2a47 }),
      );
      mesh.add(edge);
      lotMeshes.push({ id: lot.id, mesh, geometry });
    }
  }

  frameTerrain("3d");

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let moved = false;
  const onPointerDown = () => {
    moved = false;
  };
  const onPointerMove = (event: PointerEvent) => {
    if (event.buttons) moved = true;
  };
  const onClick = (event: MouseEvent) => {
    if (moved) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(lotMeshes.map((item) => item.mesh));
    const hit = hits[0]?.object;
    const found = lotMeshes.find((item) => item.mesh === hit);
    if (found) onPick(found.id);
  };
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("click", onClick);

  let running = true;
  const resize = () => {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const tick = () => {
    if (!running) return;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  tick();

  return {
    setLots(lots, visible) {
      lotSource = lots;
      lotVisible = visible;
      rebuildLots();
    },
    setExaggeration(value) {
      exaggeration = value;
      applyHeights();
    },
    setView: frameTerrain,
    reset() {
      frameTerrain("3d");
    },
    setSelected(id) {
      for (const item of lotMeshes) {
        const material = item.mesh.material as MeshStandardMaterial;
        const active = item.id === id;
        material.emissive.setHex(active ? 0xe07a2f : 0x000000);
        material.emissiveIntensity = active ? 0.55 : 0;
      }
      if (!id) return;
      const mesh = lotMeshes.find((item) => item.id === id)?.mesh;
      if (!mesh) return;
      const center = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
      controls.target.copy(center);
      camera.position.set(center.x + 70, center.y + 55, center.z + 70);
      camera.lookAt(center);
    },
    dispose() {
      running = false;
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("click", onClick);
      controls.dispose();
      geometry.dispose();
      texture.dispose();
      boundary.geometry.dispose();
      renderer.dispose();
    },
  };
}

function sampleHeight(terrain: TerrainPayload, x: number, z: number): number {
  const col = THREEClamp((x / terrain.widthM) * (terrain.grid - 1), 0, terrain.grid - 1);
  const row = THREEClamp((1 - z / terrain.depthM) * (terrain.grid - 1), 0, terrain.grid - 1);
  const c0 = Math.floor(col);
  const r0 = Math.floor(row);
  const c1 = Math.min(c0 + 1, terrain.grid - 1);
  const r1 = Math.min(r0 + 1, terrain.grid - 1);
  const tx = col - c0;
  const ty = row - r0;
  const at = (r: number, c: number) => terrain.heights[r * terrain.grid + c];
  return (
    at(r0, c0) * (1 - tx) * (1 - ty) +
    at(r0, c1) * tx * (1 - ty) +
    at(r1, c0) * (1 - tx) * ty +
    at(r1, c1) * tx * ty
  );
}

function THREEClamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
