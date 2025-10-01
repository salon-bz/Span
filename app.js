// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getDatabase, ref, set, push, onChildAdded, onValue, remove } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBHLckCRt9pbhwwBkp9-G2wWfqGM3Rq9fs",
  authDomain: "miapp-spam.firebaseapp.com",
  databaseURL: "https://miapp-spam-default-rtdb.firebaseio.com",
  projectId: "miapp-spam",
  storageBucket: "miapp-spam.appspot.com",
  messagingSenderId: "739179855589",
  appId: "1:739179855589:web:42ccf3054897da99231e0c"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Elementos DOM
const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");
const panelScreen = document.getElementById("panelScreen");

const registerBtn = document.getElementById("registerBtn");
const openPanel = document.getElementById("openPanel");
const backToChat = document.getElementById("backToChat");
const sendSpam = document.getElementById("sendSpam");

const userCountEl = document.getElementById("userCount");
const messagesDiv = document.getElementById("messages");

const spamNumber = document.getElementById("spamNumber");
const spamMessage = document.getElementById("spamMessage");
const spamReason = document.getElementById("spamReason");

let currentUserId = null;

// Revisar si ya está logueado en localStorage
window.addEventListener("load", () => {
  const savedUser = localStorage.getItem("currentUserId");
  if (savedUser) {
    currentUserId = savedUser;
    loginScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");
  }
});

// Función para registrar usuario de forma segura
async function registerUser() {
  try {
    const userCredential = await signInAnonymously(auth);
    const uid = userCredential.user.uid;

    // Leer contador actual
    const counterRef = ref(db, "userCounter");
    const snapshot = await new Promise(resolve => onValue(counterRef, resolve, { onlyOnce: true }));
    const currentCount = snapshot.exists() ? snapshot.val() : 0;
    const newCount = currentCount + 1;

    // Guardar nuevo contador
    await set(counterRef, newCount);

    // Crear ID de usuario secuencial
    currentUserId = "usuario-" + newCount;

    // Guardar usuario en la DB
    await set(ref(db, "users/" + currentUserId), { uid: uid, registrado: true });

    // Guardar en localStorage para que no pida login otra vez
    localStorage.setItem("currentUserId", currentUserId);

    // Cambiar de pantalla
    loginScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    alert("No se pudo registrar. Revisa tu conexión o reglas de Firebase.");
  }
}

// Botón Registrar
registerBtn.addEventListener("click", registerUser);

// Contador total de usuarios registrados
onValue(ref(db, "users"), (snapshot) => {
  userCountEl.textContent = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
});

// Mostrar mensajes en tiempo real
onChildAdded(ref(db, "messages"), (data) => {
  const msg = data.val();
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
    <p><b>${msg.number}</b>: ${msg.text}</p>
    <p>Motivo: ${msg.reason}</p>
    <a href="https://wa.me/${msg.number}?text=${encodeURIComponent(msg.text)}" target="_blank">Abrir en WhatsApp</a>
  `;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Abrir panel
openPanel.addEventListener("click", () => {
  chatScreen.classList.add("hidden");
  panelScreen.classList.remove("hidden");
});

// Volver al chat
backToChat.addEventListener("click", () => {
  panelScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");
});

// Enviar spam
sendSpam.addEventListener("click", async () => {
  const number = spamNumber.value.trim();
  const text = spamMessage.value.trim();
  const reason = spamReason.value.trim();

  if (!number || !text || !reason) return alert("Completa todos los campos");

  try {
    await push(ref(db, "messages"), { number, text, reason, timestamp: Date.now() });
    spamNumber.value = "";
    spamMessage.value = "";
    spamReason.value = "";
    panelScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    alert("No se pudo enviar el mensaje. Revisa tu conexión.");
  }
});

// Limitar mensajes a 50
onValue(ref(db, "messages"), (snapshot) => {
  const data = snapshot.val();
  if (data && Object.keys(data).length > 50) remove(ref(db, "messages"));
});
