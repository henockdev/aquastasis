/* ==========================================================================
   AquaStasis — Premium JS Engine (ES Module)
   - Three.js real 3D vial (procedural glass + fluid + bubbles + particles)
   - WebGL fluid backdrop
   - Custom cursor with hover/cta/drag states
   - Magnetic CTA + tilt cards + parallax ribbons
   - Scroll-triggered reveals + count-up
   - Page transitions (clip-path sweep)
   - Accordion, bundle selector, sticky buy, mobile nav, marquee pause
   ========================================================================== */
import * as THREE from './three.module.js';

const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(hover: none)').matches;

/* ---------- Sticky header shadow ---------- */
const header = $('.header');
if(header){
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
}

/* ---------- Custom cursor (disabled — using default browser cursor) ---------- */
const cursor = { classList: { add(){}, remove(){} } };

/* ---------- Mobile nav ---------- */
const navToggle = $('.nav-toggle');
const nav = $('.nav');
if(navToggle && nav){
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
    navToggle.classList.toggle('is-open');
  });
  nav.addEventListener('click', e => { if(e.target.tagName === 'A'){ nav.classList.remove('is-open'); navToggle.classList.remove('is-open'); } });
}

/* ---------- Reveal on scroll ---------- */
if('IntersectionObserver' in window){
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(en.isIntersecting){ en.target.classList.add('is-visible'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger').forEach(el => io.observe(el));
} else {
  $$('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger').forEach(el => el.classList.add('is-visible'));
}

/* ---------- Count-up ---------- */
if('IntersectionObserver' in window){
  const cu = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(!en.isIntersecting) return;
      const el = en.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = parseInt(el.dataset.dur || '1600', 10);
      if(isNaN(target)) return;
      if(prefersReduced){ el.textContent = target.toLocaleString() + suffix; cu.unobserve(el); return; }
      const start = performance.now();
      const step = now => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const v = target * eased;
        el.textContent = (Number.isInteger(target) ? Math.round(v) : v.toFixed(1)).toLocaleString() + suffix;
        if(p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      cu.unobserve(el);
    });
  }, { threshold: 0.4 });
  $$('[data-count]').forEach(el => cu.observe(el));
}

/* ---------- Magnetic ---------- */
if(!isTouch && !prefersReduced){
  $$('.magnetic').forEach(el => {
    const strength = parseFloat(el.dataset.magnetic || '0.35');
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width/2) * strength;
      const y = (e.clientY - r.top - r.height/2) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ---------- Tilt cards ---------- */
if(!isTouch && !prefersReduced){
  $$('.tilt').forEach(el => {
    const max = parseFloat(el.dataset.tilt || '8');
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top)  / r.height;
      const rx = (0.5 - py) * max;
      const ry = (px - 0.5) * max;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      el.style.setProperty('--glow-x', `${px*100}%`);
      el.style.setProperty('--glow-y', `${py*100}%`);
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ---------- Parallax ribbons ---------- */
if(!prefersReduced){
  const ribbons = $$('[data-parallax]');
  if(ribbons.length){
    let ticking = false;
    window.addEventListener('scroll', () => {
      if(ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ribbons.forEach(el => {
          const speed = parseFloat(el.dataset.parallax);
          const rect  = el.getBoundingClientRect();
          const center = rect.top + rect.height/2 - innerHeight/2;
          el.style.transform = `translate3d(0, ${center * speed * -0.12}px, 0)`;
        });
        ticking = false;
      });
    }, {passive:true});
  }
}

/* ---------- Accordion ---------- */
$$('.faq, .accordions').forEach(group => {
  const items = $$('.faq__item, .accord', group);
  items.forEach(it => {
    const q = $('.faq__q, .accord__q', it);
    q.addEventListener('click', () => {
      const open = it.classList.contains('is-open');
      if(group.dataset.single !== 'false') items.forEach(o => o.classList.remove('is-open'));
      if(!open) it.classList.add('is-open');
    });
  });
});

/* ---------- Bundle selector ---------- */
const bundles = $$('.bundle-selector');
if(bundles.length){
  bundles.forEach(b => b.addEventListener('click', () => {
    bundles.forEach(o => o.classList.remove('is-selected'));
    b.classList.add('is-selected');
    const price = b.dataset.price;
    const name  = b.dataset.name;
    const sticky = $('.sticky-buy__price');
    const sname = $('.sticky-buy__name');
    if(sticky && price) sticky.textContent = price;
    if(sname && name)   sname.textContent  = name;
  }));
}

/* ---------- Toast ---------- */
const toast = $('.toast');
function showToast(msg){
  if(!toast) return;
  let txt = toast.querySelector('.toast-msg');
  if(!txt){ txt = document.createElement('span'); txt.className='toast-msg'; toast.appendChild(txt); }
  txt.textContent = msg;
  toast.classList.add('is-visible');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}
$$('[data-add-to-cart]').forEach(b => b.addEventListener('click', e => {
  e.preventDefault();
  const c = $('.cart-count');
  if(c){
    const n = parseInt(c.textContent || '0', 10) + 1;
    c.textContent = n;
    c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
  }
  showToast('Added to cart');
}));
$$('[data-subscribe]').forEach(b => b.addEventListener('click', e => {
  e.preventDefault();
  showToast('Subscribed — first shipment locked in');
}));

/* ---------- Contact form ---------- */
const form = $('#contactForm');
if(form){
  form.addEventListener('submit', e => {
    e.preventDefault();
    showToast("Message sent — we'll reply within one business day");
    form.reset();
  });
}

/* ---------- Page transition ---------- */
const trans = $('.page-transition');
if(trans && !prefersReduced){
  requestAnimationFrame(() => trans.classList.add('is-entering'));
  setTimeout(() => { trans.style.display = 'none'; }, 1100);
  $$('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || a.target === '_blank' || a.hasAttribute('download')) return;
    const u = new URL(href, location.href);
    if(u.origin !== location.origin) return;
    a.addEventListener('click', e => {
      if(e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      trans.style.display = 'flex';
      trans.classList.remove('is-entering');
      requestAnimationFrame(() => requestAnimationFrame(() => trans.classList.add('is-entering')));
      setTimeout(() => location.href = u.href, 750);
    });
  });
}

/* ---------- Hero WebGL fluid backdrop ---------- */
const fluid = $('.hero .fluid');
if(fluid && !prefersReduced){
  const gl = fluid.getContext('webgl', {alpha:true, antialias:false, premultipliedAlpha:false});
  if(gl){
    const vsrc = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }`;
    const fsrc = `
      precision mediump float;
      uniform float t; uniform vec2 r;
      float n(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p), f = fract(p);
        float a = n(i), b = n(i+vec2(1.,0.)), c = n(i+vec2(0.,1.)), d = n(i+vec2(1.,1.));
        vec2 u = f*f*(3.-2.*f);
        return mix(a,b,u.x) + (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
      }
      float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.; a*=.5;} return v; }
      void main(){
        vec2 uv = gl_FragCoord.xy / r.xy;
        vec2 q = uv - 0.5;
        q.x *= r.x / r.y;
        float T = t * 0.08;
        float a = fbm(q*2.0 + vec2(T, -T*0.6));
        float b = fbm(q*3.0 + vec2(-T*0.8, T*1.2) + a);
        vec3 col = mix(vec3(0.04,0.08,0.26), vec3(0.16,0.24,0.6), a);
        col = mix(col, vec3(0.27,0.91,0.83), b*0.7);
        col += 0.08 * sin(q.y*6.0 + T*4.0);
        float vign = smoothstep(1.2, 0.4, length(q));
        gl_FragColor = vec4(col * vign, vign);
      }`;
    const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsrc));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsrc));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const p = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(p);
    gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
    const uT = gl.getUniformLocation(prog, 't');
    const uR = gl.getUniformLocation(prog, 'r');
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      fluid.width  = fluid.clientWidth  * dpr;
      fluid.height = fluid.clientHeight * dpr;
      gl.viewport(0, 0, fluid.width, fluid.height);
      gl.uniform2f(uR, fluid.width, fluid.height);
    };
    resize();
    window.addEventListener('resize', resize);
    const start = performance.now();
    const draw = () => {
      gl.uniform1f(uT, (performance.now() - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(draw);
    };
    draw();
  }
}

/* ==========================================================================
   Procedural label texture (shared)
   ========================================================================== */
function makeLabelTexture(){
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const g = c.getContext('2d');

  // Paper background
  const grad = g.createLinearGradient(0,0,0,512);
  grad.addColorStop(0,'#ffffff'); grad.addColorStop(1,'#EEF3FB');
  g.fillStyle = grad; g.fillRect(0,0,1024,512);

  // Top brand band (blue) — Parrox-style
  const band = g.createLinearGradient(0,0,0,90);
  band.addColorStop(0,'#5A95FF');
  band.addColorStop(1,'#123E9E');
  g.fillStyle = band;
  g.fillRect(40,40,944,90);

  // Brand wordmark in band: "aqua" white + "stasis" aqua
  g.font = '800 64px sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillStyle = '#FFFFFF';
  g.fillText('aqua', 380, 85);
  g.fillStyle = '#7DF4E8';
  g.fillText('stasis', 525, 85);
  // R symbol
  g.font = '500 18px sans-serif';
  g.fillStyle = '#7DF4E8';
  g.fillText('®', 660, 60);

  // Sub-line
  g.font = '600 22px monospace';
  g.fillStyle = '#54637C';
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.fillText('BACTERIOSTATIC WATER · 30 mL', 512, 168);

  // Divider
  g.strokeStyle = '#E3E8F1'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(100, 200); g.lineTo(924, 200); g.stroke();

  // Two-column data table
  g.font = '500 22px monospace';
  g.textAlign = 'left';
  const rows = [
    ['LOT',       'AQ-2026-0712',  false],
    ['MFG',       '2026·07·12',    false],
    ['EXP',       '2028·07·12',    false],
    ['STERILE',   '✓  PASS',       true ],
    ['ENDOTOXIN', '< 0.25 EU/mL',  false],
    ['pH',        '5.8 · PASS',    false],
  ];
  rows.forEach((r,i) => {
    const y = 248 + i*36;
    g.fillStyle = '#8C9AB2'; g.fillText(r[0], 110, y);
    g.fillStyle = r[2] ? '#17B26A' : '#0B1524';
    g.textAlign = 'right';
    g.font = r[2] ? '700 22px monospace' : '500 22px monospace';
    g.fillText(r[1], 914, y);
    g.textAlign = 'left';
    g.font = '500 22px monospace';
  });

  // GMP certified stamp
  g.save();
  g.translate(840, 400); g.rotate(-0.22);
  g.strokeStyle = '#17B26A'; g.lineWidth = 4; g.beginPath(); g.arc(0,0,52,0,Math.PI*2); g.stroke();
  g.beginPath(); g.arc(0,0,46,0,Math.PI*2); g.stroke();
  g.fillStyle = '#17B26A'; g.font = '700 18px monospace';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('GMP', 0, -6);
  g.font = '600 11px monospace';
  g.fillText('CERTIFIED', 0, 14);
  g.restore();

  // Barcode
  g.fillStyle = '#0B1524';
  for(let i=0;i<80;i++){
    const w = Math.random()>0.5 ? 2 : 3;
    if(Math.random()>0.4) g.fillRect(120 + i*7, 440, w, 32);
  }

  // Border
  g.strokeStyle = '#0EA5A0'; g.lineWidth = 4;
  g.strokeRect(40,40,944,432);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  return tex;
}

/* Shared vial geometry */
function makeVial({labelTex} = {}){
  const group = new THREE.Group();
  const pts = [
    new THREE.Vector2(0.0, 1.2), new THREE.Vector2(0.35, 1.2), new THREE.Vector2(0.35, 1.1),
    new THREE.Vector2(0.22, 1.05), new THREE.Vector2(0.22, 0.95), new THREE.Vector2(0.34, 0.85),
    new THREE.Vector2(0.5, 0.75), new THREE.Vector2(0.62, 0.55), new THREE.Vector2(0.7, 0.0),
    new THREE.Vector2(0.66, -0.7), new THREE.Vector2(0.55, -1.05), new THREE.Vector2(0.0, -1.12),
  ];
  const glassMat = new THREE.MeshPhysicalMaterial({
    color:0xffffff, metalness:0, roughness:0.05,
    transmission:0.95, thickness:1.4, ior:1.45,
    clearcoat:1, clearcoatRoughness:0.04,
    attenuationColor:0x9ad8ff, attenuationDistance:1.6,
    envMapIntensity:1.1, transparent:true, opacity:0.95,
  });
  group.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 64), glassMat));

  const fpts = pts.map(p => new THREE.Vector2(p.x*0.92, p.y*0.99));
  const fluidPts = fpts.filter(p => p.y < 0.55);
  fluidPts.unshift(new THREE.Vector2(0.001, 0.55));
  fluidPts.push(new THREE.Vector2(0.001, -1.12));
  const fluidMat = new THREE.MeshPhysicalMaterial({
    color:0x2be9d4, metalness:0, roughness:0.15,
    transmission:0.7, thickness:1.0, ior:1.33,
    attenuationColor:0x0ea5a0, attenuationDistance:0.6,
    emissive:0x0ea5a0, emissiveIntensity:0.08,
    transparent:true, opacity:0.85,
  });
  group.add(new THREE.Mesh(new THREE.LatheGeometry(fluidPts, 64), fluidMat));

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,0.32,48), new THREE.MeshPhysicalMaterial({
    color:0x2461ff, metalness:0.85, roughness:0.18, clearcoat:1, clearcoatRoughness:0.15
  }));
  cap.position.y = 1.36;
  group.add(cap);

  const capRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 16, 48), new THREE.MeshPhysicalMaterial({
    color:0x2be9d4, metalness:1, roughness:0.05, emissive:0x2be9d4, emissiveIntensity:0.6
  }));
  capRing.position.y = 1.52; capRing.rotation.x = Math.PI/2;
  group.add(capRing);

  if(labelTex){
    const labelGeo = new THREE.CylinderGeometry(0.701,0.701,1.2,64,1,true,-Math.PI*0.45,Math.PI*0.9);
    const label = new THREE.Mesh(labelGeo, new THREE.MeshStandardMaterial({map:labelTex, roughness:0.55, side:THREE.DoubleSide}));
    label.position.y = -0.05;
    group.add(label);
  }

  return {group, cap};
}

/* ==========================================================================
   Three.js: HOME hero 3D vial with full FX
   ========================================================================== */
function setupHeroVial(stage){
  if(!stage) return;
  const canvas = $('.hero-stage__canvas', stage);
  if(!canvas) return;
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.4, 6.2);

  scene.add(new THREE.AmbientLight(0x88aaff, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x2be9d4, 1.4); rim.position.set(-3, 1, -3); scene.add(rim);
  const fill = new THREE.PointLight(0x8b5cf6, 1.2, 10); fill.position.set(0, 2, 2); scene.add(fill);
  const bottom = new THREE.PointLight(0x0ea5a0, 0.9, 8); bottom.position.set(0, -2, 2); scene.add(bottom);

  const labelTex = makeLabelTexture();
  const {group: vialGroup, cap} = makeVial({labelTex});
  scene.add(vialGroup);

  // particles
  const partGroup = new THREE.Group();
  const partGeo = new THREE.BufferGeometry();
  const N = 220;
  const pos = new Float32Array(N*3);
  for(let i=0;i<N;i++){
    const r = 1.4 + Math.random()*1.8;
    const a = Math.random()*Math.PI*2;
    const y = (Math.random()-0.5)*3.2;
    pos[i*3]   = Math.cos(a)*r;
    pos[i*3+1] = y;
    pos[i*3+2] = Math.sin(a)*r * 0.4;
  }
  partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(partGeo, new THREE.PointsMaterial({
    color:0x2be9d4, size:0.025, transparent:true, opacity:0.8,
    sizeAttenuation:true, blending:THREE.AdditiveBlending, depthWrite:false
  }));
  partGroup.add(particles);
  scene.add(partGroup);

  // bubbles
  const bubbles = [];
  const bubMat = new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.6});
  for(let i=0;i<14;i++){
    const s = 0.012 + Math.random()*0.022;
    const m = new THREE.Mesh(new THREE.SphereGeometry(s, 12, 12), bubMat);
    m.userData = { speed:0.3 + Math.random()*0.5, offset:Math.random()*1.5, angle:Math.random()*Math.PI*2, radius:0.05 + Math.random()*0.45 };
    vialGroup.add(m);
    bubbles.push(m);
  }

  // glow
  const glowGeo = new THREE.RingGeometry(0.2, 1.4, 64);
  const glowMat = new THREE.MeshBasicMaterial({color:0x2be9d4, transparent:true, opacity:0.4, side:THREE.DoubleSide, blending:THREE.AdditiveBlending});
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.rotation.x = -Math.PI/2; glow.position.y = -1.18;
  scene.add(glow);

  const resize3D = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  resize3D();
  window.addEventListener('resize', resize3D);

  let pX = 0, pY = 0;
  stage.addEventListener('mousemove', e => {
    const r = stage.getBoundingClientRect();
    pX = (e.clientX - r.left)/r.width - 0.5;
    pY = (e.clientY - r.top)/r.height - 0.5;
  });
  stage.addEventListener('mouseleave', () => { pX = 0; pY = 0; });

  let dragging = false, lx = 0, ly = 0, vy = 0;
  canvas.addEventListener('pointerdown', e => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); cursor.classList.add('is-drag'); });
  canvas.addEventListener('pointerup',   e => { dragging = false; canvas.releasePointerCapture(e.pointerId); cursor.classList.remove('is-drag'); });
  canvas.addEventListener('pointermove', e => {
    if(!dragging) return;
    vialGroup.rotation.y += (e.clientX - lx) * 0.012;
    vy = (e.clientY - ly) * 0.005;
    lx = e.clientX; ly = e.clientY;
  });

  const clock = new THREE.Clock();
  let firstFrame = true;
  const animate = () => {
    const t = clock.getElapsedTime();
    if(!dragging){
      vialGroup.rotation.y += 0.004 + Math.sin(t*0.3)*0.001;
      vialGroup.rotation.x += (pY*0.3 - vialGroup.rotation.x) * 0.05;
    } else {
      vialGroup.rotation.x += vy;
      vy *= 0.92;
    }
    vialGroup.position.x += (pX*0.4 - vialGroup.position.x) * 0.05;
    vialGroup.position.y = Math.sin(t*0.8) * 0.05;
    cap.position.y = 1.36 + Math.sin(t*1.6)*0.004;

    glow.scale.setScalar(1 + Math.sin(t*2)*0.05);
    glowMat.opacity = 0.32 + Math.sin(t*2)*0.08;

    const arr = partGeo.attributes.position.array;
    for(let i=0;i<N;i++){
      arr[i*3+1] += 0.003;
      if(arr[i*3+1] > 1.6) arr[i*3+1] = -1.6;
    }
    partGeo.attributes.position.needsUpdate = true;
    particles.rotation.y += 0.002;

    bubbles.forEach(b => {
      b.userData.offset += 0.005 * b.userData.speed;
      if(b.userData.offset > 1.5){
        b.userData.offset = 0;
        b.userData.angle = Math.random()*Math.PI*2;
        b.userData.radius = 0.05 + Math.random()*0.45;
      }
      const y = 0.5 - b.userData.offset * 1.7;
      const a = b.userData.angle + t*0.4;
      b.position.set(Math.cos(a)*b.userData.radius, y, Math.sin(a)*b.userData.radius);
      b.material.opacity = 0.4 + Math.sin(t*3 + b.userData.offset*5)*0.3;
    });

    renderer.render(scene, camera);
    if(firstFrame){ firstFrame = false; stage.classList.add('is-3d-ready'); }
    requestAnimationFrame(animate);
  };
  animate();
}

/* ==========================================================================
   Three.js: PRODUCT page bottle viewer
   ========================================================================== */
function setupProductBottle(canvas){
  if(!canvas) return;
  const renderer2 = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer2.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene2 = new THREE.Scene();
  const cam2 = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  cam2.position.set(0, 0.3, 5.6);
  scene2.add(new THREE.AmbientLight(0xaaccff, 0.6));
  const k2 = new THREE.DirectionalLight(0xffffff, 1.4); k2.position.set(3,4,5); scene2.add(k2);
  const r2 = new THREE.DirectionalLight(0x2be9d4, 1.2); r2.position.set(-3,1,-2); scene2.add(r2);
  const bg2 = new THREE.PointLight(0x2461ff, 1.0, 8); bg2.position.set(0,0,3); scene2.add(bg2);

  const {group: g, cap} = makeVial({labelTex: makeLabelTexture()});
  scene2.add(g);

  const resize2 = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer2.setSize(w,h,false); cam2.aspect = w/h; cam2.updateProjectionMatrix();
  };
  resize2();
  window.addEventListener('resize', resize2);

  let dragging=false, lx=0, ly=0, vy=0;
  canvas.addEventListener('pointerdown', e => { dragging=true; lx=e.clientX; ly=e.clientY; canvas.setPointerCapture(e.pointerId); cursor.classList.add('is-drag'); });
  canvas.addEventListener('pointerup',   e => { dragging=false; canvas.releasePointerCapture(e.pointerId); cursor.classList.remove('is-drag'); });
  canvas.addEventListener('pointermove', e => {
    if(!dragging) return;
    g.rotation.y += (e.clientX - lx) * 0.012;
    vy = (e.clientY - ly) * 0.005;
    lx = e.clientX; ly = e.clientY;
  });
  const t0 = performance.now();
  const tick2 = () => {
    const t = (performance.now()-t0)/1000;
    if(!dragging){ g.rotation.y += 0.006; }
    else { g.rotation.x += vy; vy *= 0.9; }
    g.position.y = Math.sin(t*0.9)*0.04;
    cap.position.y = 1.36 + Math.sin(t*1.6)*0.004;
    renderer2.render(scene2, cam2);
    requestAnimationFrame(tick2);
  };
  tick2();
}

/* ---------- Init 3D ---------- */
if(!prefersReduced){
  setupHeroVial($('.hero-stage'));
  setupProductBottle($('.product-main__canvas'));
} else {
  $$('.hero-stage, .product-main').forEach(el => el.classList.add('is-3d-ready'));
}

/* ---------- Year auto-fill ---------- */
$$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());