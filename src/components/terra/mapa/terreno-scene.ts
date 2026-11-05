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
  controls.enableRotate = false;
  controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
  controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
  controls.touches.ONE = THREE.TOUCH.PAN;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
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
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const ground = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, metalness: 0 }),
  );
  scene.add(ground);

  const logoTexture = await new THREE.TextureLoader().loadAsync("/terra/mapa/logo-terra.png");
  logoTexture.colorSpace = THREE.SRGBColorSpace;
  const logoWidth = 400 / 3;
  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(logoWidth, logoWidth * (1086 / 1448)),
    new THREE.MeshBasicMaterial({
      map: logoTexture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }),
  );
  logo.rotation.x = -Math.PI / 2;
  logo.renderOrder = 30;
  scene.add(logo);
  const logoEast = 840;
  const logoNorth = 1000;

  let boundary = perimeterRibbon(THREE, []);
  scene.add(boundary);
  const road = new THREE.Group();
  scene.add(road);
  const arrows = new THREE.Group();
  scene.add(arrows);
  const arrowDefs: { east: number; north: number; title: string; direction: 1 | -1 }[] = [
    { east: 70, north: terrain.depthM * 0.62, title: "Vereda Santa Rosa", direction: -1 },
    {
      east: terrain.widthM - 90,
      north: terrain.depthM * 0.72,
      title: "Complejo deportivo",
      direction: 1,
    },
    { east: terrain.widthM - 90, north: terrain.depthM * 0.4, title: "Popayán", direction: 1 },
  ];
  for (const arrow of arrowDefs) arrows.add(floatingArrow(THREE, arrow.title, arrow.direction));

  const lotRoot = new THREE.Group();
  scene.add(lotRoot);
  const lotMeshes: { id: string; mesh: Mesh; geometry: BufferGeometry }[] = [];
  let lotSource: JoinedLot[] = [];
  let lotVisible = new Set<string>();

  const exaggeration = 1.5;
  const terrainTarget = new THREE.Vector3(
    0,
    ((terrain.elevMax - terrain.elevMin) / 2) * exaggeration,
    0,
  );

  function frameTerrain(view: "3d" | "superior") {
    controls.target.copy(terrainTarget);
    if (view === "superior") {
      const fov = (camera.fov * Math.PI) / 180;
      const aspect = camera.aspect > 0 ? camera.aspect : 1;
      const halfView = Math.tan(fov / 2);
      const distance =
        Math.max(terrain.depthM / 2 / halfView, terrain.widthM / 2 / (halfView * aspect)) * 1.16;
      camera.position.set(0, terrainTarget.y + distance, distance * 0.06);
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
    const points = drapePerimeter(terrain, exaggeration).map(([x, z, y]) => toScene(x, y, z));
    const next = perimeterRibbon(THREE, points);
    scene.remove(boundary);
    boundary.geometry.dispose();
    (boundary.material as Material).dispose();
    boundary = next;
    scene.add(boundary);
    replaceRoad(THREE, road, terrain, exaggeration);
    arrowDefs.forEach((arrow, index) => {
      const marker = arrows.children[index];
      if (!marker) return;
      const y =
        (sampleHeight(terrain, arrow.east, arrow.north) - terrain.elevMin) * exaggeration + 18;
      marker.position.copy(toScene(arrow.east, y, arrow.north));
    });
    const logoHeight =
      (sampleHeight(terrain, logoEast, logoNorth) - terrain.elevMin) * exaggeration + 6;
    logo.position.copy(toScene(logoEast, logoHeight, logoNorth));
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
        line.geometry?.dispose();
        const material = line.material as Material & { map?: { dispose: () => void } | null };
        material.map?.dispose();
        material.dispose();
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
          transparent: true,
          opacity: 0.82,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2,
        }),
      );
      mesh.visible = lotVisible.has(lot.id);
      mesh.renderOrder = 1;
      lotRoot.add(mesh);
      const edge = lotBorder(THREE, points);
      edge.visible = mesh.visible;
      mesh.add(edge);
      const label = lotLabel(THREE, lot.id, points);
      label.visible = mesh.visible;
      mesh.add(label);
      lotMeshes.push({ id: lot.id, mesh, geometry });
    }
  }

  applyHeights();

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
  frameTerrain("superior");

  const flight = {
    active: false,
    fromPos: new THREE.Vector3(),
    toPos: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
    start: 0,
    duration: 980,
  };

  const tick = () => {
    if (!running) return;
    if (flight.active) {
      const t = Math.min(1, (performance.now() - flight.start) / flight.duration);
      const k = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      camera.position.lerpVectors(flight.fromPos, flight.toPos, k);
      controls.target.lerpVectors(flight.fromTarget, flight.toTarget, k);
      camera.lookAt(controls.target);
      if (t >= 1) {
        flight.active = false;
        controls.enabled = true;
        controls.update();
      }
    } else {
      controls.update();
    }
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
    setView: frameTerrain,
    reset() {
      frameTerrain("superior");
    },
    setSelected(id) {
      for (const item of lotMeshes) {
        const material = item.mesh.material as MeshStandardMaterial;
        const active = item.id === id;
        material.emissive.setHex(active ? 0xe07a2f : 0x000000);
        material.emissiveIntensity = active ? 0.55 : 0;
        const border = item.mesh.children[0] as Mesh | undefined;
        const borderMaterial = border?.material as MeshStandardMaterial | undefined;
        borderMaterial?.color.setHex(active ? 0xe07a2f : 0x000000);
      }
      if (!id) return;
      const mesh = lotMeshes.find((item) => item.id === id)?.mesh;
      if (!mesh) return;
      const center = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
      flight.fromPos.copy(camera.position);
      flight.fromTarget.copy(controls.target);
      flight.toTarget.copy(center);
      flight.toPos.set(center.x, center.y + 90, center.z + 6);
      flight.start = performance.now();
      flight.active = true;
      controls.enabled = false;
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
      logo.geometry.dispose();
      (logo.material as Material).dispose();
      logoTexture.dispose();
      arrows.traverse((child) => {
        const mesh = child as Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as
          (Material & { map?: { dispose: () => void } | null }) | undefined;
        material?.map?.dispose();
        material?.dispose();
      });
      road.traverse((child) => {
        const mesh = child as Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as Material | undefined;
        material?.dispose();
      });
      boundary.geometry.dispose();
      renderer.dispose();
    },
  };
}

function drapePerimeter(terrain: TerrainPayload, exaggeration: number): [number, number, number][] {
  const ring = terrain.perimetro;
  if (ring.length < 2) return [];
  const closed =
    Math.hypot(ring[0][0] - ring[ring.length - 1][0], ring[0][1] - ring[ring.length - 1][1]) < 0.05;
  const count = closed ? ring.length - 1 : ring.length;
  const samples: [number, number, number][] = [];
  const step = 8;
  for (let index = 0; index < count; index += 1) {
    const start = ring[index];
    const end = ring[(index + 1) % count];
    if (!start || !end) continue;
    const pieces = Math.max(1, Math.ceil(Math.hypot(end[0] - start[0], end[1] - start[1]) / step));
    for (let piece = 0; piece < pieces; piece += 1) {
      const t = piece / pieces;
      const x = start[0] + (end[0] - start[0]) * t;
      const z = start[1] + (end[1] - start[1]) * t;
      const y = (sampleHeight(terrain, x, z) - terrain.elevMin) * exaggeration + 8;
      samples.push([x, z, y]);
    }
  }
  return samples;
}

function perimeterRibbon(THREE: typeof import("three"), points: import("three").Vector3[]) {
  const half = 2.4;
  const positions: number[] = [];
  for (let index = 0; index < points.length; index += 1) {
    const start = points[index];
    const end = points[(index + 1) % points.length];
    if (!start || !end) continue;
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const length = Math.hypot(dx, dz) || 1;
    const px = (-dz / length) * half;
    const pz = (dx / length) * half;
    const quad = [
      [start.x + px, start.y, start.z + pz],
      [start.x - px, start.y, start.z - pz],
      [end.x + px, end.y, end.z + pz],
      [end.x - px, end.y, end.z - pz],
    ];
    for (const corner of [0, 1, 2, 1, 3, 2]) {
      const point = quad[corner];
      if (point) positions.push(point[0], point[1], point[2]);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const ribbon = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: 0xe07a2f,
      side: THREE.DoubleSide,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: -10,
      polygonOffsetUnits: -10,
    }),
  );
  ribbon.renderOrder = 4;
  return ribbon;
}

function lotBorder(THREE: typeof import("three"), points: import("three").Vector3[]) {
  const half = 0.9;
  const positions: number[] = [];
  for (let index = 0; index < points.length; index += 1) {
    const start = points[index];
    const end = points[(index + 1) % points.length];
    if (!start || !end) continue;
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const length = Math.hypot(dx, dz) || 1;
    const px = (-dz / length) * half;
    const pz = (dx / length) * half;
    const quad = [
      [start.x + px, start.y, start.z + pz],
      [start.x - px, start.y, start.z - pz],
      [end.x + px, end.y, end.z + pz],
      [end.x - px, end.y, end.z - pz],
    ];
    const triangles = [0, 1, 2, 1, 3, 2];
    for (const corner of triangles) {
      const point = quad[corner];
      if (point) positions.push(point[0], point[1], point[2]);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const border = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: -8,
      polygonOffsetUnits: -8,
    }),
  );
  border.renderOrder = 3;
  return border;
}

/** Borde oriental del predio, de sur a norte. La vía queda recta y por dentro. */
const ROAD_A: [number, number] = [1116.8, 448];
const ROAD_B: [number, number] = [1321.7, 978.5];

function replaceRoad(
  THREE: typeof import("three"),
  road: import("three").Group,
  terrain: TerrainPayload,
  exaggeration: number,
) {
  for (const child of [...road.children]) {
    const mesh = child as Mesh;
    road.remove(mesh);
    mesh.geometry?.dispose();
    (mesh.material as Material | undefined)?.dispose();
  }
  const dx = ROAD_B[0] - ROAD_A[0];
  const dy = ROAD_B[1] - ROAD_A[1];
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const px = uy;
  const py = -ux;
  const step = 7;
  const centerOffset = -9.2;
  const center: [number, number, number][] = [];
  for (let distance = 20; distance <= length - 4; distance += step) {
    const east = ROAD_A[0] + ux * distance + px * centerOffset;
    const north = ROAD_A[1] + uy * distance + py * centerOffset;
    const y = (sampleHeight(terrain, east, north) - terrain.elevMin) * exaggeration + 1.15;
    center.push([east, north, y]);
  }
  road.add(flatRibbon(THREE, terrain, center, 5.1, 0x6a645c, 0));
  road.add(flatRibbon(THREE, terrain, center, 3.6, 0x3a3e42, 0.08));
  road.add(flatRibbon(THREE, terrain, shiftLine(center, px, py, 3.35), 0.11, 0xf4f6f8, 0.16));
  road.add(flatRibbon(THREE, terrain, shiftLine(center, px, py, -3.35), 0.11, 0xf4f6f8, 0.16));
  for (let index = 0; index < center.length - 1; index += 2) {
    const start = center[index];
    const end = center[index + 1];
    if (!start || !end) continue;
    road.add(flatRibbon(THREE, terrain, [start, end], 0.12, 0xe2b400, 0.22));
  }
}

function shiftLine(
  points: [number, number, number][],
  px: number,
  py: number,
  meters: number,
): [number, number, number][] {
  return points.map(([east, north, y]) => [east + px * meters, north + py * meters, y]);
}

function flatRibbon(
  THREE: typeof import("three"),
  terrain: TerrainPayload,
  points: [number, number, number][],
  half: number,
  color: number,
  lift: number,
) {
  const positions: number[] = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    if (!start || !end) continue;
    const dx = end[0] - start[0];
    const dz = end[1] - start[1];
    const length = Math.hypot(dx, dz) || 1;
    const px = (-dz / length) * half;
    const pz = (dx / length) * half;
    const scene = [start, end].map(([east, north, y]) => {
      const point = new THREE.Vector3(
        east - terrain.widthM / 2,
        y + lift,
        terrain.depthM / 2 - north,
      );
      return point;
    });
    const a = scene[0];
    const b = scene[1];
    if (!a || !b) continue;
    const quad = [
      [a.x + px, a.y, a.z - pz],
      [a.x - px, a.y, a.z + pz],
      [b.x + px, b.y, b.z - pz],
      [b.x - px, b.y, b.z + pz],
    ];
    for (const corner of [0, 1, 2, 1, 3, 2]) {
      const point = quad[corner];
      if (point) positions.push(point[0], point[1], point[2]);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
    }),
  );
  mesh.renderOrder = 6;
  return mesh;
}

function floatingArrow(THREE: typeof import("three"), title: string, direction: 1 | -1) {
  const group = new THREE.Group();
  const head = new THREE.Mesh(
    new THREE.ConeGeometry(16, 54, 3),
    new THREE.MeshStandardMaterial({ color: 0xe07a2f, roughness: 0.35, metalness: 0.05 }),
  );
  head.rotation.z = direction === 1 ? -Math.PI / 2 : Math.PI / 2;
  group.add(head);
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 160;
  const context = canvas.getContext("2d");
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = "700 68px Inter, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.lineWidth = 12;
    context.strokeStyle = "rgba(255,255,255,0.94)";
    context.strokeText(title, 320, 80);
    context.fillStyle = "#102033";
    context.fillText(title, 320, 80);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }),
  );
  label.position.set(direction * -150, 8, 0);
  label.scale.set(216, 54, 1);
  label.renderOrder = 25;
  group.add(label);
  return group;
}

function lotLabel(THREE: typeof import("three"), name: string, points: import("three").Vector3[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = "700 72px Inter, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.lineWidth = 10;
    context.strokeStyle = "rgba(255,255,255,0.92)";
    context.strokeText(name, 128, 64);
    context.fillStyle = "#102033";
    context.fillText(name, 128, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }),
  );
  const center = points
    .reduce((sum, point) => sum.add(point), new THREE.Vector3())
    .multiplyScalar(1 / Math.max(points.length, 1));
  sprite.position.copy(center);
  sprite.position.y += 0.35;
  sprite.scale.set(29.4, 14.7, 1);
  sprite.renderOrder = 20;
  return sprite;
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
