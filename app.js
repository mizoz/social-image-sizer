(() => {
'use strict';

// zones are in output pixels. hide = platform UI covers it, soft = cropped on some screens
const PRESETS = [
  { id: 'instagram-post', group: 'Instagram', name: 'Instagram post (square)', w: 1080, h: 1080 },
  { id: 'instagram-portrait', group: 'Instagram', name: 'Instagram post (portrait 4:5)', w: 1080, h: 1350,
    zones: [{ x: 0, y: 0, w: 34, h: 1350, kind: 'soft' }, { x: 1046, y: 0, w: 34, h: 1350, kind: 'soft' }],
    legend: 'Shaded edges are trimmed in the 3:4 profile grid.' },
  { id: 'instagram-story', group: 'Instagram', name: 'Instagram story', w: 1080, h: 1920,
    zones: [{ x: 0, y: 0, w: 1080, h: 250 }, { x: 0, y: 1670, w: 1080, h: 250 }],
    legend: 'Top and bottom 250 px sit under the profile name and reply bar.' },
  { id: 'instagram-reel', group: 'Instagram', name: 'Instagram reel cover', w: 1080, h: 1920,
    zones: [{ x: 0, y: 0, w: 1080, h: 270 }, { x: 0, y: 1250, w: 1080, h: 670 }, { x: 940, y: 820, w: 140, h: 430 },
      { x: 0, y: 270, w: 1080, h: 120, kind: 'soft' }, { x: 0, y: 1130, w: 1080, h: 120, kind: 'soft' }],
    legend: 'Caption, audio and the like/share rail cover the shaded parts. The lighter bands are cut off when the reel shows as 3:4 in your grid.' },
  { id: 'facebook-post', group: 'Facebook', name: 'Facebook post', w: 1080, h: 1350 },
  { id: 'facebook-cover', group: 'Facebook', name: 'Facebook cover photo', w: 1640, h: 624,
    zones: [{ x: 0, y: 0, w: 265, h: 624, kind: 'soft' }, { x: 1375, y: 0, w: 265, h: 624, kind: 'soft' }],
    legend: 'Shows at 820x312 on desktop. Phones show 640x360, so the sides get cut.' },
  { id: 'facebook-event', group: 'Facebook', name: 'Facebook event cover', w: 1920, h: 1005 },
  { id: 'linkedin-post', group: 'LinkedIn', name: 'LinkedIn post image', w: 1200, h: 627 },
  { id: 'linkedin-banner', group: 'LinkedIn', name: 'LinkedIn personal banner', w: 1584, h: 396,
    zones: [{ x: 47, y: 200, w: 300, h: 196, round: true }],
    legend: 'Your profile photo covers the lower left (approximate).' },
  { id: 'linkedin-company-banner', group: 'LinkedIn', name: 'LinkedIn company page cover', w: 1512, h: 256,
    zones: [{ x: 32, y: 150, w: 172, h: 106 }],
    legend: 'The page logo overlaps the lower left (approximate).' },
  { id: 'linkedin-article', group: 'LinkedIn', name: 'LinkedIn article / newsletter cover', w: 1920, h: 1080 },
  { id: 'x-post', group: 'X', name: 'X post image', w: 1600, h: 900 },
  { id: 'x-header', group: 'X', name: 'X header', w: 1500, h: 500,
    zones: [{ x: 40, y: 330, w: 335, h: 170, round: true }, { x: 0, y: 0, w: 1500, h: 60, kind: 'soft' }, { x: 0, y: 440, w: 1500, h: 60, kind: 'soft' }],
    legend: 'Profile photo covers the lower left. Top and bottom 60 px can crop on some screens.' },
  { id: 'youtube-thumbnail', group: 'YouTube', name: 'YouTube thumbnail', w: 1280, h: 720,
    zones: [{ x: 1120, y: 640, w: 145, h: 66 }],
    legend: 'The video length badge sits bottom right.' },
  { id: 'youtube-thumbnail-4k', group: 'YouTube', name: 'YouTube thumbnail (4K)', w: 3840, h: 2160,
    zones: [{ x: 3360, y: 1920, w: 435, h: 198 }],
    legend: 'YouTube now recommends 4K thumbnails. Desktop upload limit is 50 MB, phones 2 MB.' },
  { id: 'youtube-banner', group: 'YouTube', name: 'YouTube channel banner', w: 2560, h: 1440,
    zones: [{ x: 0, y: 0, w: 2560, h: 508, kind: 'soft' }, { x: 0, y: 931, w: 2560, h: 509, kind: 'soft' },
      { x: 0, y: 508, w: 507, h: 423 }, { x: 2053, y: 508, w: 507, h: 423 }],
    legend: 'Only the clear 1546x423 middle shows everywhere. Light shading is TV only, dark shading is desktop and TV only.' },
  { id: 'tiktok', group: 'TikTok', name: 'TikTok photo / video cover', w: 1080, h: 1920,
    zones: [{ x: 0, y: 0, w: 1080, h: 220 }, { x: 0, y: 1440, w: 1080, h: 480 }, { x: 940, y: 220, w: 140, h: 1220 }, { x: 0, y: 220, w: 60, h: 1220, kind: 'soft' }],
    legend: 'Recommended safe area: 880x1220 starting 60 px left, 220 px down.' },
  { id: 'pinterest-pin', group: 'Pinterest', name: 'Pinterest pin', w: 1000, h: 1500 },
  { id: 'threads-post', group: 'Threads', name: 'Threads post', w: 1080, h: 1350 },
  { id: 'bluesky-post', group: 'Bluesky', name: 'Bluesky post image', w: 1200, h: 675 },
  { id: 'bluesky-banner', group: 'Bluesky', name: 'Bluesky banner', w: 3000, h: 1000,
    zones: [{ x: 60, y: 640, w: 420, h: 360, round: true }],
    legend: 'Your avatar overlaps the lower left (approximate).' },
  { id: 'google-business', group: 'Google', name: 'Google Business Profile photo', w: 720, h: 720 },
  { id: 'og-image', group: 'Web', name: 'Open Graph / link preview', w: 1200, h: 630 }
];
const GROUPS = [...new Set(PRESETS.map(p => p.group))];
const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const PREVIEW_MAX = 520;
const STORE_KEY = 'social-image-sizer:v1';

const $ = s => document.querySelector(s);
const els = {
  drop: $('#drop'), file: $('#file'), pick: $('#pick'), sample: $('#sample'),
  work: $('#workspace'), srcBox: $('#source-box'), srcImg: $('#source-img'), dot: $('#focal-dot'), meta: $('#source-meta'),
  fmt: $('#fmt'), q: $('#q'), qOut: $('#q-out'), qField: $('#q-field'), mode: $('#mode'), bg: $('#bg'), bgField: $('#bg-field'),
  zonesToggle: $('#zones'), chips: $('#chips'), grid: $('#grid'), count: $('#count'), status: $('#status'),
  zipBtn: $('#zip'), allBtn: $('#all'), noneBtn: $('#none'), resetAll: $('#reset-all'), replace: $('#replace')
};

const state = {
  fmt: 'jpg', q: 90, mode: 'crop', bg: '#ffffff', zones: true,
  selected: new Set(PRESETS.map(p => p.id)),
  hiddenGroups: new Set(),
  focal: { x: 0.5, y: 0.5 },
  per: {} // id -> { fx, fy, zoom, custom }
};
let img = null, previewSrc = null, srcName = 'image';
const cards = {};

// ---------- persistence ----------
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      fmt: state.fmt, q: state.q, mode: state.mode, bg: state.bg, zones: state.zones,
      selected: [...state.selected], hiddenGroups: [...state.hiddenGroups]
    }));
  } catch (e) {}
  const p = new URLSearchParams();
  p.set('fmt', state.fmt);
  if (state.fmt !== 'png') p.set('q', state.q);
  if (state.mode !== 'crop') { p.set('mode', state.mode); p.set('bg', state.bg.slice(1)); }
  if (state.selected.size !== PRESETS.length) p.set('p', [...state.selected].join(','));
  try { history.replaceState(null, '', '#' + p.toString()); } catch (e) {}
}
function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) {}
  if (s) apply(s);
  const h = new URLSearchParams(location.hash.slice(1));
  if ([...h.keys()].length) {
    apply({
      fmt: h.get('fmt'), q: h.get('q') && +h.get('q'), mode: h.get('mode'),
      bg: h.get('bg') && '#' + h.get('bg'), selected: h.get('p') ? h.get('p').split(',') : null
    });
  }
}
function apply(s) {
  if (s.fmt && MIME[s.fmt]) state.fmt = s.fmt;
  if (s.q >= 40 && s.q <= 100) state.q = Math.round(s.q);
  if (s.mode === 'crop' || s.mode === 'fit') state.mode = s.mode;
  if (s.bg && /^#[0-9a-f]{6}$/i.test(s.bg)) state.bg = s.bg.toLowerCase();
  if (typeof s.zones === 'boolean') state.zones = s.zones;
  if (Array.isArray(s.selected)) state.selected = new Set(s.selected.filter(id => PRESETS.some(p => p.id === id)));
  if (Array.isArray(s.hiddenGroups)) state.hiddenGroups = new Set(s.hiddenGroups.filter(g => GROUPS.includes(g)));
}

// ---------- crop math ----------
function view(p) {
  const pv = state.per[p.id] || {};
  const zoom = pv.zoom || 1;
  const fx = pv.custom ? pv.fx : state.focal.x;
  const fy = pv.custom ? pv.fy : state.focal.y;
  return { zoom, fx, fy };
}
// returns source rect (in natural image px) for a crop-to-fill, clamped inside the image
function cropRect(p, iw, ih) {
  const v = view(p);
  const s = Math.max(p.w / iw, p.h / ih) * v.zoom;
  const cw = p.w / s, ch = p.h / s;
  let cx = v.fx * iw, cy = v.fy * ih;
  cx = Math.min(Math.max(cx, cw / 2), iw - cw / 2);
  cy = Math.min(Math.max(cy, ch / 2), ih - ch / 2);
  return { sx: cx - cw / 2, sy: cy - ch / 2, sw: cw, sh: ch, cx, cy };
}

function paint(ctx, source, p, W, H) {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const k = source.width / iw; // preview source may be scaled down
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (state.mode === 'fit' || state.fmt === 'jpg') {
    ctx.fillStyle = state.bg;
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.clearRect(0, 0, W, H);
  }
  if (state.mode === 'fit') {
    const v = view(p);
    const s = Math.min(W / iw, H / ih) * v.zoom;
    const dw = iw * s, dh = ih * s;
    // zoom in fit mode can push past the frame; keep it centred on the focal point
    const dx = dw > W ? Math.min(0, Math.max(W - dw, W / 2 - v.fx * dw)) : (W - dw) / 2;
    const dy = dh > H ? Math.min(0, Math.max(H - dh, H / 2 - v.fy * dh)) : (H - dh) / 2;
    ctx.drawImage(source, dx, dy, dw, dh);
    return;
  }
  const r = cropRect(p, iw, ih);
  ctx.drawImage(source, r.sx * k, r.sy * k, r.sw * k, r.sh * k, 0, 0, W, H);
}

function drawZones(ctx, p, scale) {
  if (!state.zones || !p.zones) return;
  ctx.save();
  for (const z of p.zones) {
    const x = z.x * scale, y = z.y * scale, w = z.w * scale, h = z.h * scale;
    ctx.fillStyle = z.kind === 'soft' ? 'rgba(220, 38, 38, .22)' : 'rgba(220, 38, 38, .45)';
    if (z.round) {
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, w, h);
    }
  }
  ctx.restore();
}

// ---------- cards ----------
function ratio(w, h) {
  const g = (a, b) => (b ? g(b, a % b) : a);
  const d = g(w, h);
  const a = w / d, b = h / d;
  if (a > 30 || b > 30) return (w / h).toFixed(2).replace(/\.?0+$/, '') + ':1';
  return a + ':' + b;
}

function buildCards() {
  els.grid.innerHTML = '';
  for (const p of PRESETS) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.group = p.group;
    const cid = 'c-' + p.id;
    card.innerHTML =
      '<div class="card-head"><div><h3 id="' + cid + '-t">' + p.name + '</h3>' +
      '<div class="dims">' + p.w + ' x ' + p.h + ' px &middot; ' + ratio(p.w, p.h) + '</div></div>' +
      '<label class="check"><input type="checkbox" id="' + cid + '-sel"><span>Include</span></label></div>' +
      '<div class="stage"><canvas tabindex="0" role="img" aria-labelledby="' + cid + '-t" aria-describedby="' + cid + '-help"></canvas></div>' +
      '<span class="sr-only" id="' + cid + '-help">Drag to move the crop. Arrow keys move it, plus and minus zoom.</span>' +
      (p.legend ? '<p class="legend">' + p.legend + '</p>' : '') +
      '<div class="card-controls"><label class="zoom" for="' + cid + '-z">Zoom <input type="range" id="' + cid + '-z" min="1" max="4" step="0.01" value="1"></label>' +
      '<button type="button" class="btn small" data-act="reset">Reset</button>' +
      '<button type="button" class="btn small" data-act="dl">Download</button></div>';
    const canvas = card.querySelector('canvas');
    const sel = card.querySelector('input[type=checkbox]');
    const zoom = card.querySelector('input[type=range]');
    const head = card.querySelector('.card-head > div');
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'custom crop';
    badge.hidden = true;
    head.appendChild(badge);

    const s = Math.min(1, PREVIEW_MAX / Math.max(p.w, p.h));
    canvas.width = Math.round(p.w * s);
    canvas.height = Math.round(p.h * s);

    sel.checked = state.selected.has(p.id);
    sel.addEventListener('change', () => {
      sel.checked ? state.selected.add(p.id) : state.selected.delete(p.id);
      card.classList.toggle('off', !sel.checked);
      updateCount(); save();
    });
    zoom.addEventListener('input', () => {
      ensurePer(p).zoom = +zoom.value;
      markCustom(p); queue(p.id);
    });
    card.querySelector('[data-act=reset]').addEventListener('click', () => {
      delete state.per[p.id];
      zoom.value = 1;
      badge.hidden = true;
      queue(p.id);
    });
    card.querySelector('[data-act=dl]').addEventListener('click', () => downloadOne(p));
    bindDrag(canvas, p);

    cards[p.id] = { card, canvas, ctx: canvas.getContext('2d'), sel, zoom, badge, scale: s };
    card.classList.toggle('off', !sel.checked);
    els.grid.appendChild(card);
  }
}

function ensurePer(p) {
  if (!state.per[p.id]) state.per[p.id] = { zoom: 1, fx: state.focal.x, fy: state.focal.y, custom: false };
  return state.per[p.id];
}
function markCustom(p) {
  const pv = ensurePer(p);
  if (!pv.custom) { pv.custom = true; pv.fx = state.focal.x; pv.fy = state.focal.y; }
  cards[p.id].badge.hidden = false;
}

function nudge(p, dxPx, dyPx, displayW) {
  // dxPx is in displayed canvas pixels; convert to normalised source movement
  if (!img) return;
  const iw = img.naturalWidth, ih = img.naturalHeight;
  markCustom(p);
  const pv = state.per[p.id];
  if (state.mode === 'fit') {
    const s = Math.min(p.w / iw, p.h / ih) * pv.zoom;
    const per = (p.w / displayW) / s;
    pv.fx -= dxPx * per / iw; pv.fy -= dyPx * per / ih;
  } else {
    const r = cropRect(p, iw, ih);
    const per = r.sw / displayW;
    // start from the clamped centre so dragging past an edge doesn't build up dead travel
    pv.fx = (r.cx - dxPx * per) / iw;
    pv.fy = (r.cy - dyPx * per) / ih;
  }
  pv.fx = Math.min(1, Math.max(0, pv.fx));
  pv.fy = Math.min(1, Math.max(0, pv.fy));
  queue(p.id);
}

function bindDrag(canvas, p) {
  let last = null;
  canvas.addEventListener('pointerdown', e => {
    if (!img) return;
    canvas.setPointerCapture(e.pointerId);
    last = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointermove', e => {
    if (!last) return;
    const w = canvas.getBoundingClientRect().width;
    nudge(p, e.clientX - last.x, e.clientY - last.y, w);
    last = { x: e.clientX, y: e.clientY };
  });
  const end = () => { last = null; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('wheel', e => {
    if (!img || document.activeElement !== canvas) return;
    e.preventDefault();
    setZoom(p, view(p).zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08));
  }, { passive: false });
  canvas.addEventListener('keydown', e => {
    if (!img) return;
    const w = canvas.getBoundingClientRect().width;
    const step = e.shiftKey ? 40 : 8;
    const k = e.key;
    if (k === 'ArrowLeft') nudge(p, step, 0, w);
    else if (k === 'ArrowRight') nudge(p, -step, 0, w);
    else if (k === 'ArrowUp') nudge(p, 0, step, w);
    else if (k === 'ArrowDown') nudge(p, 0, -step, w);
    else if (k === '+' || k === '=') setZoom(p, view(p).zoom * 1.1);
    else if (k === '-' || k === '_') setZoom(p, view(p).zoom / 1.1);
    else return;
    e.preventDefault();
  });
}
function setZoom(p, z) {
  z = Math.min(4, Math.max(1, z));
  ensurePer(p).zoom = z;
  cards[p.id].zoom.value = z;
  markCustom(p);
  queue(p.id);
}

// redraws are batched per frame so dragging the focal point stays smooth
const dirty = new Set();
let raf = 0;
function queue(id) {
  if (id) dirty.add(id); else PRESETS.forEach(p => dirty.add(p.id));
  if (!raf) raf = requestAnimationFrame(flush);
}
function flush() {
  raf = 0;
  for (const id of dirty) {
    const p = PRESETS.find(x => x.id === id);
    const c = cards[id];
    if (!img || c.card.hidden) continue;
    paint(c.ctx, previewSrc, p, c.canvas.width, c.canvas.height);
    drawZones(c.ctx, p, c.scale);
  }
  dirty.clear();
}

function updateCount() {
  const visible = PRESETS.filter(p => !state.hiddenGroups.has(p.group));
  const n = visible.filter(p => state.selected.has(p.id)).length;
  els.count.textContent = n + ' of ' + visible.length + ' sizes selected';
  els.zipBtn.disabled = !img || n === 0;
  els.zipBtn.textContent = 'Download ' + n + ' as ZIP';
}

function buildChips() {
  els.chips.innerHTML = '';
  for (const g of GROUPS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = g;
    b.setAttribute('aria-pressed', String(!state.hiddenGroups.has(g)));
    b.addEventListener('click', () => {
      state.hiddenGroups.has(g) ? state.hiddenGroups.delete(g) : state.hiddenGroups.add(g);
      b.setAttribute('aria-pressed', String(!state.hiddenGroups.has(g)));
      applyGroups(); save();
    });
    els.chips.appendChild(b);
  }
}
function applyGroups() {
  for (const p of PRESETS) cards[p.id].card.hidden = state.hiddenGroups.has(p.group);
  updateCount();
  queue();
}

// ---------- loading ----------
function setStatus(t) { els.status.textContent = t; }

function loadFile(file) {
  if (!file || !/^image\//.test(file.type)) { setStatus('That file is not an image. Try a JPG, PNG, WebP, GIF or AVIF.'); return; }
  const url = URL.createObjectURL(file);
  const i = new Image();
  i.onload = () => {
    srcName = (file.name || 'pasted image').replace(/\.[^.]+$/, '');
    useImage(i, url, file.name || 'pasted image', file.size);
  };
  i.onerror = () => { URL.revokeObjectURL(url); setStatus('Could not read that image. HEIC from iPhones may need converting to JPG first.'); };
  i.src = url;
}

function useImage(i, url, label, bytes) {
  if (img && img.src && img.src.startsWith('blob:') && img.src !== url) URL.revokeObjectURL(img.src);
  img = i;
  const s = Math.min(1, 1600 / Math.max(i.naturalWidth, i.naturalHeight));
  if (s < 1) {
    const c = document.createElement('canvas');
    c.width = Math.round(i.naturalWidth * s);
    c.height = Math.round(i.naturalHeight * s);
    const cx = c.getContext('2d');
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(i, 0, 0, c.width, c.height);
    previewSrc = c;
  } else {
    previewSrc = i;
  }
  state.focal = { x: 0.5, y: 0.5 };
  state.per = {};
  for (const id in cards) { cards[id].zoom.value = 1; cards[id].badge.hidden = true; }
  els.srcImg.src = url;
  els.srcImg.alt = 'Your image: ' + label;
  els.meta.textContent = label + ' - ' + i.naturalWidth + ' x ' + i.naturalHeight + ' px' + (bytes ? ' - ' + fmtBytes(bytes) : '');
  els.drop.hidden = true;
  els.work.hidden = false;
  placeDot();
  updateCount();
  const small = PRESETS.filter(p => !state.hiddenGroups.has(p.group) && (p.w > i.naturalWidth * 1.01 && p.h > i.naturalHeight * 1.01)).length;
  setStatus(small ? 'Heads up: your image is smaller than ' + small + ' of the sizes, so those will be upscaled and may look soft.' : 'Image loaded. Click it to set the focal point.');
  queue();
}

function fmtBytes(b) { return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }

function makeSample() {
  const c = document.createElement('canvas');
  c.width = 2400; c.height = 1600;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 2400, 1600);
  g.addColorStop(0, '#0f3d91'); g.addColorStop(0.55, '#3a7bd5'); g.addColorStop(1, '#f2a65a');
  x.fillStyle = g; x.fillRect(0, 0, 2400, 1600);
  x.fillStyle = 'rgba(255,255,255,.08)';
  for (let i = 0; i < 2400; i += 120) x.fillRect(i, 0, 2, 1600);
  for (let i = 0; i < 1600; i += 120) x.fillRect(0, i, 2400, 2);
  x.fillStyle = '#ffd166';
  x.beginPath(); x.arc(1560, 640, 260, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#1b2a41';
  x.beginPath(); x.moveTo(0, 1600); x.lineTo(700, 900); x.lineTo(1150, 1250); x.lineTo(1600, 820); x.lineTo(2400, 1450); x.lineTo(2400, 1600); x.fill();
  x.fillStyle = '#fff';
  x.font = 'bold 120px system-ui, sans-serif';
  x.textAlign = 'center';
  x.fillText('Your headline here', 1200, 360);
  x.font = '56px system-ui, sans-serif';
  x.fillText('drag the crops around to see what fits', 1200, 460);
  c.toBlob(b => {
    const f = new File([b], 'sample.png', { type: 'image/png' });
    loadFile(f);
  }, 'image/png');
}

// ---------- focal point on the source ----------
function placeDot() {
  els.dot.style.left = (state.focal.x * 100) + '%';
  els.dot.style.top = (state.focal.y * 100) + '%';
  els.srcBox.setAttribute('aria-valuetext', 'Focal point ' + Math.round(state.focal.x * 100) + '% across, ' + Math.round(state.focal.y * 100) + '% down');
}
function setFocal(e) {
  const r = els.srcImg.getBoundingClientRect();
  state.focal.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  state.focal.y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
  placeDot();
  queue();
}
let focalDrag = false;
els.srcBox.addEventListener('pointerdown', e => { if (!img) return; focalDrag = true; els.srcBox.setPointerCapture(e.pointerId); setFocal(e); });
els.srcBox.addEventListener('pointermove', e => { if (focalDrag) setFocal(e); });
els.srcBox.addEventListener('pointerup', () => { focalDrag = false; });
els.srcBox.addEventListener('pointercancel', () => { focalDrag = false; });
els.srcBox.addEventListener('keydown', e => {
  const d = e.shiftKey ? 0.1 : 0.02;
  const m = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key];
  if (!m) return;
  e.preventDefault();
  state.focal.x = Math.min(1, Math.max(0, state.focal.x + m[0]));
  state.focal.y = Math.min(1, Math.max(0, state.focal.y + m[1]));
  placeDot(); queue();
});

// ---------- export ----------
function render(p) {
  return new Promise((resolve, reject) => {
    const c = document.createElement('canvas');
    c.width = p.w; c.height = p.h;
    const ctx = c.getContext('2d');
    paint(ctx, img, p, p.w, p.h);
    const type = MIME[state.fmt];
    c.toBlob(b => {
      if (!b) return reject(new Error('Export failed'));
      // older Safari quietly hands back PNG when asked for WebP
      const ext = b.type === 'image/webp' ? 'webp' : b.type === 'image/jpeg' ? 'jpg' : 'png';
      resolve({ blob: b, name: p.id + '-' + p.w + 'x' + p.h + '.' + ext, ext });
    }, type, state.fmt === 'png' ? undefined : state.q / 100);
  });
}

function saveBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

async function downloadOne(p) {
  if (!img) return;
  try {
    const r = await render(p);
    saveBlob(r.blob, r.name);
    setStatus('Saved ' + r.name + ' (' + fmtBytes(r.blob.size) + ')' + (r.ext !== state.fmt ? '. Your browser could not make ' + state.fmt.toUpperCase() + ', so it is ' + r.ext.toUpperCase() + '.' : ''));
  } catch (e) {
    setStatus('Sorry, that export failed: ' + e.message);
  }
}

async function downloadZip() {
  if (!img) return;
  if (typeof JSZip === 'undefined') { setStatus('The ZIP helper did not load. Check your connection, or use the Download button on each size.'); return; }
  const list = PRESETS.filter(p => state.selected.has(p.id) && !state.hiddenGroups.has(p.group));
  if (!list.length) return;
  els.zipBtn.disabled = true;
  const zip = new JSZip();
  try {
    let i = 0;
    for (const p of list) {
      setStatus('Rendering ' + (++i) + ' of ' + list.length + ': ' + p.name);
      const r = await render(p);
      zip.file(r.name, r.blob);
    }
    setStatus('Zipping...');
    const out = await zip.generateAsync({ type: 'blob' });
    const base = srcName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'image';
    saveBlob(out, base + '-social-sizes.zip');
    setStatus('Done. ' + list.length + ' images, ' + fmtBytes(out.size) + ' zipped.');
  } catch (e) {
    setStatus('Sorry, the ZIP failed: ' + e.message);
  } finally {
    updateCount();
  }
}

// ---------- settings ----------
function syncSettingsUI() {
  els.fmt.value = state.fmt;
  els.q.value = state.q;
  els.qOut.textContent = state.q;
  els.qField.hidden = state.fmt === 'png';
  els.mode.value = state.mode;
  els.bg.value = state.bg;
  els.bgField.hidden = state.mode !== 'fit' && state.fmt !== 'jpg';
  els.zonesToggle.checked = state.zones;
}
els.fmt.addEventListener('change', () => { state.fmt = els.fmt.value; syncSettingsUI(); save(); queue(); });
els.q.addEventListener('input', () => { state.q = +els.q.value; els.qOut.textContent = state.q; save(); });
els.mode.addEventListener('change', () => { state.mode = els.mode.value; syncSettingsUI(); save(); queue(); });
els.bg.addEventListener('input', () => { state.bg = els.bg.value; save(); queue(); });
els.zonesToggle.addEventListener('change', () => { state.zones = els.zonesToggle.checked; save(); queue(); });
els.allBtn.addEventListener('click', () => setAll(true));
els.noneBtn.addEventListener('click', () => setAll(false));
els.resetAll.addEventListener('click', () => {
  state.per = {};
  state.focal = { x: 0.5, y: 0.5 };
  for (const id in cards) { cards[id].zoom.value = 1; cards[id].badge.hidden = true; }
  placeDot(); queue();
});
function setAll(on) {
  for (const p of PRESETS) {
    if (state.hiddenGroups.has(p.group)) continue;
    on ? state.selected.add(p.id) : state.selected.delete(p.id);
    cards[p.id].sel.checked = on;
    cards[p.id].card.classList.toggle('off', !on);
  }
  updateCount(); save();
}
els.zipBtn.addEventListener('click', downloadZip);

// ---------- input: pick, drop, paste ----------
els.pick.addEventListener('click', () => els.file.click());
els.replace.addEventListener('click', () => els.file.click());
els.sample.addEventListener('click', makeSample);
els.file.addEventListener('change', () => { if (els.file.files[0]) loadFile(els.file.files[0]); els.file.value = ''; });
let dragDepth = 0;
window.addEventListener('dragenter', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { dragDepth++; els.drop.classList.add('over'); } });
window.addEventListener('dragleave', () => { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) els.drop.classList.remove('over'); });
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => {
  e.preventDefault();
  dragDepth = 0; els.drop.classList.remove('over');
  const f = e.dataTransfer && [...e.dataTransfer.files].find(x => /^image\//.test(x.type));
  if (f) loadFile(f); else setStatus('Drop an image file (JPG, PNG, WebP, GIF or AVIF).');
});
window.addEventListener('paste', e => {
  const items = e.clipboardData ? [...e.clipboardData.items] : [];
  const it = items.find(x => x.kind === 'file' && /^image\//.test(x.type));
  if (!it) return;
  e.preventDefault();
  loadFile(it.getAsFile());
});

load();
syncSettingsUI();
buildCards();
buildChips();
applyGroups();
})();
