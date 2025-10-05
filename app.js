import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, set, onChildAdded, onChildRemoved, onValue, query, orderByChild, limitToLast, get, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// --- CONFIG FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBHLckCRt9pbhwwBkp9-G2wWfqGM3Rq9fs",
  authDomain: "miapp-spam.firebaseapp.com",
  databaseURL: "https://miapp-spam-default-rtdb.firebaseio.com",
  projectId: "miapp-spam",
  storageBucket: "miapp-spam.firebasestorage.app",
  messagingSenderId: "739179855589",
  appId: "1:739179855589:web:42ccf3054897da99231e0c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- ELEMENTOS DOM ---
const usersRef = ref(db, 'users');
const messagesRef = ref(db, 'messages');

const loginCard = document.getElementById('loginCard');
const chatArea = document.getElementById('chatArea');
const panelCard = document.getElementById('panelCard');
const btnRegister = document.getElementById('btnRegister');
const btnLogout = document.getElementById('btnLogout');
const statusEl = document.getElementById('status');
const userCountEl = document.getElementById('userCount');
const messagesEl = document.getElementById('messages');
const totalMsgEl = document.getElementById('totalMsg');
const savedCountEl = document.getElementById('savedCount');
const openPanelBtn = document.getElementById('openPanel');
const btnPublish = document.getElementById('btnPublish');
const btnCancel = document.getElementById('btnCancel');
const phoneIn = document.getElementById('phone');
const messageIn = document.getElementById('message');
const reasonIn = document.getElementById('reason');
const btnNoti = document.getElementById('btnNoti');
const notifStatus = document.getElementById('notifStatus');
const dbStatus = document.getElementById('dbStatus');

let myId = localStorage.getItem('app_uid') || null;
let userRef = null;
let lastPublishAt = 0;
const MIN_MS_BETWEEN_PUB = 2000;
const MAX_MESSAGES = 50;

// --- UTILIDADES ---
function uid(){
  let id = localStorage.getItem('app_uid');
  if (!id){
    id = 'u_' + Math.random().toString(36).slice(2,12);
    localStorage.setItem('app_uid', id);
  }
  return id;
}
function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }
function esc(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }

// --- NOTIFICACIONES ---
// Pide permiso al abrir por primera vez
window.addEventListener('load', async () => {
  if (Notification.permission === 'default') {
    try {
      const p = await Notification.requestPermission();
      notifStatus.textContent = (p === 'granted') ? 'activadas' : 'desactivadas';
      if (p === 'granted') {
        console.log('✅ Permiso de notificaciones concedido.');
      }
    } catch (e) {
      console.error('Error al pedir permiso de notificación:', e);
    }
  } else {
    notifStatus.textContent = (Notification.permission === 'granted') ? 'activadas' : 'desactivadas';
  }
});

function mostrarNotificacion(titulo, cuerpo) {
  if (Notification.permission !== 'granted') return;
  try {
    const n = new Notification(titulo, {
      body: cuerpo,
      icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png", // ícono genérico
      tag: "nuevo-mensaje",
      vibrate: [100, 50, 100],
    });
    n.onclick = () => window.focus();
  } catch(e){
    console.warn("No se pudo mostrar notificación:", e);
  }
}

// --- REGISTRO DE USUARIOS ---
async function registerPresence(){
  myId = uid();
  await set(ref(db, 'users/' + myId), { online: true, ts: Date.now() });
  userRef = ref(db, 'users/' + myId);
  statusEl.textContent = 'Estado: registrado como ' + myId;
  btnRegister.classList.add('hidden');
  btnLogout.classList.remove('hidden');
  hide(loginCard);
  show(chatArea);
  hide(panelCard);
}
async function unregisterPresence(){
  if (myId){
    try { await remove(ref(db, 'users/' + myId)); } catch(e){}
  }
  localStorage.removeItem('app_uid');
  myId = null; userRef = null;
  statusEl.textContent = 'Estado: no registrado';
  btnRegister.classList.remove('hidden');
  btnLogout.classList.add('hidden');
  show(loginCard);
  hide(chatArea);
  hide(panelCard);
}

// --- EVENTOS FIREBASE ---
onValue(usersRef, snap => {
  const v = snap.val() || {};
  userCountEl.textContent = Object.keys(v).length;
});

const q = query(messagesRef, orderByChild('ts'), limitToLast(200));
onValue(messagesRef, snap => {
  totalMsgEl.textContent = snap.numChildren();
  savedCountEl.textContent = snap.numChildren();
});

onChildAdded(q, (snap) => {
  const m = snap.val();
  appendMessage(snap.key, m);

  // 🔔 Enviar notificación a todos (si tiene permiso)
  if (Notification.permission === 'granted') {
    const title = 'Nuevo mensaje';
    const body = `${m.text || ''}${m.reason ? ' — ' + m.reason : ''}`;
    mostrarNotificacion(title, body);
  }
});

onChildRemoved(messagesRef, (snap) => {
  const id = 'm_' + snap.key;
  const el = document.getElementById(id);
  if (el) el.remove();
});

function appendMessage(key, m){
  if (!m) return;
  if (document.getElementById('m_' + key)) return;
  const el = document.createElement('div');
  el.id = 'm_' + key;
  el.className = 'msg';
  const meta = document.createElement('div');
  meta.className = 'meta';
  const left = document.createElement('div'); left.textContent = m.phone || '—';
  const right = document.createElement('div'); right.textContent = new Date(m.ts).toLocaleString();
  meta.appendChild(left); meta.appendChild(right);

  const body = document.createElement('div');
  body.className = 'body';
  body.innerHTML = `<strong>${esc(m.text || '')}</strong>
    <div class="small" style="margin-top:6px;color:var(--muted)">Motivo: ${esc(m.reason||'')}</div>`;

  const waWrap = document.createElement('div'); waWrap.style.marginTop='8px';
  const waA = document.createElement('a');
  waA.href = createWhatsAppLink(m.phone, (m.text||'') + (m.reason ? ' — ' + m.reason : ''));
  waA.target = '_blank'; waA.rel = 'noopener noreferrer'; waA.className = 'linkish';
  waA.textContent = 'Abrir WhatsApp';
  waWrap.appendChild(waA);

  el.appendChild(meta); el.appendChild(body); el.appendChild(waWrap);
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function createWhatsAppLink(phone, text){
  const p = (phone||'').replace(/\D/g,'');
  if(!p) return 'javascript:void(0)';
  return 'https://wa.me/' + encodeURIComponent(p) + '?text=' + encodeURIComponent(text || '');
}

// --- PUBLICAR MENSAJE ---
btnPublish.addEventListener('click', async () => {
  if (!myId) { alert('Regístrate antes de publicar.'); return; }
  const phone = phoneIn.value.trim();
  const text = messageIn.value.trim();
  const reason = reasonIn.value.trim();
  if (!phone || !text) { alert('Teléfono y mensaje son obligatorios.'); return; }
  const now = Date.now();
  if (now - lastPublishAt < MIN_MS_BETWEEN_PUB) { alert('Espera un momento antes de publicar otra vez.'); return; }
  if (!confirm('¿Confirmas publicar este mensaje?')) return;
  lastPublishAt = now;

  const newRef = push(messagesRef);
  await set(newRef, { phone, text, reason, author: myId, ts: Date.now() });
  maintainMessageLimit(MAX_MESSAGES);

  phoneIn.value=''; messageIn.value=''; reasonIn.value='';
  hide(panelCard); show(chatArea);
});

btnCancel.addEventListener('click', () => { hide(panelCard); show(chatArea); });
openPanelBtn.addEventListener('click', () => { hide(chatArea); show(panelCard); phoneIn.focus(); window.scrollTo({ top: 9999, behavior: 'smooth' }); });

btnRegister.addEventListener('click', async () => { await registerPresence(); });
btnLogout.addEventListener('click', async () => { await unregisterPresence(); });

btnNoti.addEventListener('click', async () => {
  const p = await Notification.requestPermission();
  notifStatus.textContent = (p === 'granted') ? 'activadas' : 'desactivadas';
});

async function maintainMessageLimit(max){
  const snap = await get(query(messagesRef, orderByChild('ts')));
  const msgs = snap.val() || {};
  const keys = Object.keys(msgs);
  if (keys.length <= max) return;
  const sorted = keys.sort((a,b) => msgs[a].ts - msgs[b].ts);
  for (let i=0; i<keys.length - max; i++){
    await remove(ref(db, 'messages/' + sorted[i]));
  }
}

// --- Estado DB ---
dbStatus.textContent = 'Conectado';
