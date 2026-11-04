'use strict';

/*
 * TERRA: visor 3D progresivo.
 * La geometría SIEMPRE procede de /api/terra-estado; no se reconstruyen lotes
 * a partir de la fotografía aérea ni se alteran sus coordenadas.
 * Three.js se carga bajo demanda. Ante cualquier fallo permanece el SVG 2D.
 */
(function () {
  const host = document.getElementById('visor-3d');
  const originalMap = document.getElementById('plano');
  const threeButton = document.getElementById('vista-3d');
  const flatButton = document.getElementById('vista-2d');
  const modeNote = document.getElementById('vista-nota');
  if (!host || !originalMap || !threeButton || !flatButton) return;

  const stateColors = {
    'Disponible': '#66b48a',
    'Reservado': '#ebcb6a',
    'En negociación': '#86b9da',
    'Vendido': '#db8179',
    'No disponible': '#b4b9b4',
  };
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let THREE, scene, camera, renderer, root, canvas, raycaster, pointerNdc;
  let requestedMode = '3d';
  let loading = false;
  let ready = false;
  let failed = false;
  let active = false;
  let initialized = false;
  let geometrySignature = '';
  let models = new Map();
  let hovered = '';
  let selected = '';
  let frame = 0;
  let transition = null;
  let initialFit = false;
  const cameraState = { x: 0, y: 0, zoom: 1 };
  const pointers = new Map();
  let moved = false;
  let pressed = false;

  function bridge() { return window.terraMapBridge; }
  function reduced() { return motion.matches; }
  function note(message) { if (modeNote) modeNote.textContent = message; }
  function dimensions() {
    const rect = host.getBoundingClientRect();
    return { width: Math.max(1, rect.width), height: Math.max(1, rect.height) };
  }
  function show2D(message) {
    active = false;
    host.hidden = true;
    originalMap.hidden = false;
    originalMap.removeAttribute('aria-hidden');
    originalMap.inert = false;
    threeButton.setAttribute('aria-pressed', 'false');
    flatButton.setAttribute('aria-pressed', 'true');
    if (message) note(message);
  }
  function show3D() {
    if (!ready || requestedMode !== '3d') return;
    host.hidden = false;
    originalMap.hidden = true;
    originalMap.setAttribute('aria-hidden', 'true');
    originalMap.inert = true;
    active = true;
    threeButton.setAttribute('aria-pressed', 'true');
    flatButton.setAttribute('aria-pressed', 'false');
    note('Vista 3D de lotes a escala. La fotografía aérea es un fondo referencial, no una imagen georreferenciada.');
    resize();
    sync();
  }
  function failure() {
    if (failed) return;
    failed = true;
    requestedMode = '2d';
    threeButton.disabled = true;
    threeButton.title = 'La vista 3D no está disponible en este dispositivo o conexión.';
    show2D('Vista 2D activa: se conserva el plano original y todas las funciones de cotización.');
    if (renderer) renderer.dispose();
  }
  function getBounds(items) {
    if (!items || !items.length) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const lot of items) {
      for (const point of lot.puntos) {
        minX = Math.min(minX, point[0]);
        maxX = Math.max(maxX, point[0]);
        // Se invierte el eje vertical de SVG en el plano XY de Three.js.
        minY = Math.min(minY, -point[1]);
        maxY = Math.max(maxY, -point[1]);
      }
    }
    return { minX, minY, maxX, maxY, width: maxX-minX, height: maxY-minY,
      x: (minX+maxX)/2, y: (minY+maxY)/2 };
  }
  function drawFrame() {
    frame = 0;
    if (!ready || !renderer || !active || document.hidden) return;
    let animateAgain = false;
    if (transition) {
      const t = Math.min(1, (performance.now()-transition.start)/transition.duration);
      const easing = 1-Math.pow(1-t,3);
      cameraState.x = transition.from.x+(transition.to.x-transition.from.x)*easing;
      cameraState.y = transition.from.y+(transition.to.y-transition.from.y)*easing;
      cameraState.zoom = transition.from.zoom+(transition.to.zoom-transition.from.zoom)*easing;
      if (t >= 1) transition = null;
      else animateAgain = true;
    }
    for (const [id, model] of models) {
      const goal = (id === selected ? 3.6 : id === hovered ? 2.2 : 0);
      if (reduced()) model.lift = goal;
      else {
        model.lift += (goal-model.lift)*0.25;
        if (Math.abs(model.lift-goal)>0.025) animateAgain = true;
        else model.lift=goal;
      }
      model.group.position.z = model.lift;
    }
    camera.position.set(cameraState.x, cameraState.y-370, 600);
    camera.lookAt(cameraState.x, cameraState.y, 0);
    camera.zoom = cameraState.zoom;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    if (animateAgain) schedule();
  }
  function schedule() {
    if (!frame && ready && active) frame = requestAnimationFrame(drawFrame);
  }
  function animateCamera(x, y, zoom) {
    if (!ready) return;
    const next = { x, y, zoom: Math.min(9,Math.max(0.35,zoom)) };
    if (reduced()) {
      transition = null;
      Object.assign(cameraState,next);
    } else {
      transition = { from: { ...cameraState }, to: next,
        start: performance.now(), duration: 620 };
    }
    schedule();
  }
  function applyCameraSize() {
    if (!camera) return;
    const size = dimensions();
    const viewHeight = 360;
    const viewWidth = viewHeight*(size.width/size.height);
    camera.left = -viewWidth/2;
    camera.right = viewWidth/2;
    camera.top = viewHeight/2;
    camera.bottom = -viewHeight/2;
    camera.updateProjectionMatrix();
  }
  function resize() {
    if (!ready || !active) return;
    const size = dimensions();
    renderer.setSize(size.width,size.height,false);
    applyCameraSize();
    schedule();
  }
  function makeLabel(text, color, width, height) {
    const c=document.createElement('canvas');
    c.width=320; c.height=110;
    const ctx=c.getContext('2d');
    ctx.fillStyle='rgba(12,39,57,0.83)';
    ctx.beginPath();
    ctx.roundRect(8,12,304,84,19);
    ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.30)';
    ctx.lineWidth=2;
    ctx.stroke();
    ctx.font='bold 43px Inter,Arial,sans-serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillStyle=color;
    ctx.fillText(text,160,54,284);
    const texture=new THREE.CanvasTexture(c);
    texture.colorSpace=THREE.SRGBColorSpace;
    const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false});
    const sprite=new THREE.Sprite(material);
    sprite.scale.set(width,height,1);
    sprite.renderOrder=30;
    return sprite;
  }
  function makeModel(lot) {
    const points=lot.puntos;
    if (!Array.isArray(points) || points.length<3) return null;
    const shape=new THREE.Shape();
    shape.moveTo(points[0][0],-points[0][1]);
    for (let i=1; i<points.length; i++) shape.lineTo(points[i][0],-points[i][1]);
    shape.closePath();
    const face=new THREE.MeshStandardMaterial({
      color: stateColors[lot.estado] || '#b4b9b4',
      roughness:0.80, metalness:0.03, transparent:true,
      opacity:0.96, side:THREE.DoubleSide
    });
    const side=new THREE.MeshStandardMaterial({
      color:'#163b4a', roughness:0.95, metalness:0, transparent:true, opacity:0.92
    });
    const extruded=new THREE.ExtrudeGeometry(shape,{depth:1.2,steps:1,bevelEnabled:false,curveSegments:1});
    const mesh=new THREE.Mesh(extruded,[face,side]);
    mesh.userData.lotId=lot.id;
    const group=new THREE.Group();
    group.add(mesh);
    const borderPoints=points.map(p=>new THREE.Vector3(p[0],-p[1],1.32));
    const borderGeometry=new THREE.BufferGeometry().setFromPoints(borderPoints);
    const border=new THREE.LineLoop(borderGeometry,new THREE.LineBasicMaterial({
      color:'#f7fbf8', transparent:true, opacity:0.97, depthTest:false
    }));
    border.renderOrder=8;
    group.add(border);
    const label=makeLabel(lot.id,'#f7faf9',13,5);
    label.position.set(lot.centro[0],-lot.centro[1],2.4);
    group.add(label);
    root.add(group);
    return {group,mesh,face,side,border,label,lift:0,lot};
  }
  function clearGeometry() {
    for (const model of models.values()) {
      model.mesh.geometry.dispose();
      model.face.dispose();
      model.side.dispose();
      model.border.geometry.dispose();
      model.border.material.dispose();
      model.label.material.map.dispose();
      model.label.material.dispose();
      root.remove(model.group);
    }
    models.clear();
    // Los rótulos de manzana también forman parte del mismo sistema cartesiano.
    for (const obj of [...root.children]) {
      if (obj.userData.isBlockLabel) {
        obj.material.map.dispose();
        obj.material.dispose();
        root.remove(obj);
      }
    }
  }
  function addBlockLabels(lots) {
    for (const name of 'ABCDEF') {
      const groupLots=lots.filter(lot=>lot.manzana===name);
      if (!groupLots.length) continue;
      const b=getBounds(groupLots);
      const label=makeLabel('MANZANA '+name,'#ffca81',45,9);
      label.position.set(b.x,b.maxY+15,5.2);
      label.userData.isBlockLabel=true;
      root.add(label);
    }
  }
  function updateColors() {
    const b=bridge();
    if (!b) return;
    for (const [id,model] of models) {
      const isMatching=b.matches(model.lot);
      const isSelected=id===selected;
      const isHovered=id===hovered;
      // Las manzanas A y B mantienen el aspecto gris del plano comercial.
      const tone=(model.lot.manzana==='A'||model.lot.manzana==='B')
        ? '#b4b9b4' : (stateColors[model.lot.estado]||'#b4b9b4');
      model.face.color.set(tone);
      model.face.opacity=isMatching?0.96:0.14;
      model.side.opacity=isMatching?0.90:0.12;
      model.face.emissive.set(isSelected?'#ac5e13':isHovered?'#245843':'#000000');
      model.face.emissiveIntensity=isSelected?0.44:isHovered?0.27:0;
      model.border.material.color.set(isSelected?'#ff9e3c':isHovered?'#ffead2':'#f7fbf8');
      model.border.material.opacity=isMatching?1:0.22;
      model.label.visible=isMatching||isSelected;
      model.label.material.opacity=isSelected?1:(isMatching?0.9:0.25);
    }
    schedule();
  }
  function sync() {
    if (!ready) return;
    const b=bridge();
    if (!b || !Array.isArray(b.getLots()) || !b.getLots().length) return;
    const lots=b.getLots();
    const signature=lots.map(lot=>lot.id+JSON.stringify(lot.puntos)).join('|');
    const changed=signature!==geometrySignature;
    if (changed) {
      clearGeometry();
      geometrySignature=signature;
      for (const lot of lots) {
        const model=makeModel(lot);
        if (model) models.set(lot.id,model);
      }
      addBlockLabels(lots);
    }
    for (const lot of lots) {
      const model=models.get(lot.id);
      if (model) model.lot=lot;
    }
    selected=b.getSelected()||'';
    updateColors();
    if (!initialFit && models.size) {
      initialFit=true;
      if (selected) focusLot(lots.find(lot=>lot.id===selected));
      else fitVisible(lots);
    }
  }
  function fitVisible(subset) {
    if (!ready) return;
    const b=getBounds(subset && subset.length ? subset : bridge()?.getLots());
    if (!b) return;
    const viewW=camera.right-camera.left, viewH=camera.top-camera.bottom;
    const zoom=Math.min(viewW/(b.width+70),viewH/(b.height+105));
    animateCamera(b.x,b.y,zoom);
  }
  function focusLot(lot) {
    if (!ready || !lot) return;
    const b=getBounds([lot]);
    if (!b) return;
    const viewW=camera.right-camera.left, viewH=camera.top-camera.bottom;
    const zoom=Math.min(7,viewW/Math.max(65,b.width*4.7),
      viewH/Math.max(85,b.height*3.3));
    const rightPanel=window.matchMedia('(min-width:1024px)').matches;
    const shift=rightPanel?(viewW/zoom)*0.12:0;
    animateCamera(b.x+shift,b.y,zoom);
  }
  function zoomBy(factor) {
    if (!ready) return;
    transition=null;
    animateCamera(cameraState.x,cameraState.y,cameraState.zoom*factor);
  }
  function pan(dx,dy) {
    if (!ready) return;
    transition=null;
    const size=dimensions();
    const scale=(camera.right-camera.left)/(size.width*cameraState.zoom);
    cameraState.x-=dx*scale;
    cameraState.y+=dy*scale*1.16;
    schedule();
  }
  function pick(event) {
    if (!active || !ready) return '';
    const rect=canvas.getBoundingClientRect();
    pointerNdc.set(2*(event.clientX-rect.left)/rect.width-1,
      1-2*(event.clientY-rect.top)/rect.height);
    raycaster.setFromCamera(pointerNdc,camera);
    const meshes=[...models.values()].map(m=>m.mesh);
    const hits=raycaster.intersectObjects(meshes,false);
    return hits[0]?.object.userData.lotId || '';
  }
  function pointerDown(event) {
    if (event.button!==0 && event.pointerType==='mouse') return;
    pressed=true;
    moved=false;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    canvas.setPointerCapture(event.pointerId);
  }
  function pointerMove(event) {
    const previous=pointers.get(event.pointerId);
    if (!previous) {
      if (event.pointerType==='mouse') {
        const hit=pick(event);
        if (hit!==hovered) {
          hovered=hit;
          canvas.style.cursor=hit?'pointer':'grab';
          updateColors();
        }
      }
      return;
    }
    const dx=event.clientX-previous.x,dy=event.clientY-previous.y;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if (Math.abs(dx)+Math.abs(dy)>2) moved=true;
    if (pointers.size===1) pan(dx,dy);
    else if (pointers.size===2) {
      const entries=[...pointers.values()];
      const current=Math.hypot(entries[0].x-entries[1].x,entries[0].y-entries[1].y);
      const lastX=entries.find(p=>p===pointers.get(event.pointerId));
      if (lastX) {
        const prior=Math.hypot(current,0);
        const other=entries.find(p=>p!==lastX);
        const oldDistance=Math.hypot(previous.x-other.x,previous.y-other.y);
        if (oldDistance>5 && prior>5) zoomBy(prior/oldDistance);
      }
    }
  }
  function pointerUp(event) {
    const existed=pointers.delete(event.pointerId);
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (existed && !moved && pointers.size===0) {
      const id=pick(event);
      if (id) bridge()?.selectLot(id);
    }
    if (!pointers.size) {
      pressed=false;
      moved=false;
    }
  }
  function installEvents() {
    canvas.addEventListener('pointerdown',pointerDown);
    canvas.addEventListener('pointermove',pointerMove);
    canvas.addEventListener('pointerup',pointerUp);
    canvas.addEventListener('pointercancel',pointerUp);
    canvas.addEventListener('pointerleave',()=>{hovered='';updateColors();});
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();failure();});
    if (typeof ResizeObserver!=='undefined') {
      const observer=new ResizeObserver(()=>{if (active) resize();});
      observer.observe(host);
    } else window.addEventListener('resize',resize);
    document.addEventListener('visibilitychange',()=>{if (!document.hidden) schedule();});
  }
  function build() {
    scene=new THREE.Scene();
    camera=new THREE.OrthographicCamera(-300,300,180,-180,0.01,4000);
    camera.up.set(0,1,0);
    root=new THREE.Group();
    scene.add(root);
    scene.add(new THREE.AmbientLight('#e7f4ee',2));
    const light=new THREE.DirectionalLight('#ffffff',2.5);
    light.position.set(-260,340,540);
    scene.add(light);
    const base=new THREE.Mesh(
      new THREE.PlaneGeometry(740,235),
      new THREE.MeshBasicMaterial({color:'#123d43',transparent:true,opacity:0.39,depthWrite:false})
    );
    base.position.set(12,12,-4);
    scene.add(base);
    const grid=new THREE.GridHelper(780,39,'#799f91','#41636a');
    grid.rotation.x=Math.PI/2;
    grid.position.z=-2;
    grid.material.transparent=true;
    grid.material.opacity=0.13;
    scene.add(grid);
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    canvas=renderer.domElement;
    canvas.className='map-3d-canvas';
    canvas.setAttribute('aria-label','Vista tridimensional de los lotes TERRA. Para usar el teclado, cambia a vista 2D.');
    canvas.setAttribute('role','img');
    canvas.style.touchAction='none';
    host.append(canvas);
    raycaster=new THREE.Raycaster();
    pointerNdc=new THREE.Vector2();
    installEvents();
    ready=true;
    applyCameraSize();
  }
  async function load() {
    if (loading || failed || ready) return;
    loading=true;
    note('Preparando vista tridimensional. El plano 2D sigue disponible.');
    try {
      const testCanvas=document.createElement('canvas');
      if (!testCanvas.getContext('webgl2')) throw new Error('WebGL2 no disponible');
      THREE=await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
      build();
      if (requestedMode==='3d') show3D();
    } catch (_error) {
      failure();
    } finally { loading=false; }
  }
  function setMode(mode) {
    requestedMode=mode;
    if (mode==='2d') show2D('Vista 2D: geometría original, con selección y cotización disponibles.');
    else if (ready) show3D();
    else load();
  }
  threeButton.addEventListener('click',()=>setMode('3d'));
  flatButton.addEventListener('click',()=>setMode('2d'));
  window.terra3d={
    isActive:()=>active,
    sync, zoomBy, fitVisible, focusLot,
    clearSelection:()=>{selected='';updateColors();}
  };
  if (motion.addEventListener) motion.addEventListener('change',()=>schedule());
  // Solo solicita la librería cuando la zona del mapa está cerca del viewport.
  if ('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>{
      if (entries.some(entry=>entry.isIntersecting)) {observer.disconnect();load();}
    },{rootMargin:'320px'});
    observer.observe(host.parentElement);
  } else load();
})();
