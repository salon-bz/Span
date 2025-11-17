/* ===================== PARTICLES NEON (lightweight) ===================== */
(function(){
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const colors = [
    'rgba(0,240,255,0.95)',
    'rgba(255,77,240,0.95)',
    'rgba(0,255,136,0.95)',
    'rgba(255,212,96,0.95)'
  ];
  const particles = [];
  const PARTICLE_COUNT = Math.floor((w*h) / 80000) + 30; // scaled by screen
  function rand(min,max){return Math.random()*(max-min)+min;}
  function makeParticle(){
    return {
      x: rand(0,w),
      y: rand(0,h),
      vx: rand(-0.3,0.3),
      vy: rand(-0.15,0.15),
      r: rand(0.7,2.6),
      life: rand(60,240),
      hue: colors[Math.floor(Math.random()*colors.length)],
      glow: rand(6,18)
    };
  }
  for(let i=0;i<PARTICLE_COUNT;i++) particles.push(makeParticle());
  function resize(){
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
  }
  addEventListener('resize', ()=>{ resize(); });

  function draw(){
    ctx.clearRect(0,0,w,h);
    // subtle background radial gradient for depth
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0, 'rgba(10,8,20,0.0)');
    g.addColorStop(1, 'rgba(6,4,12,0.12)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    // draw particles
    for(let p of particles){
      // move
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if(p.x < -20) p.x = w+20;
      if(p.x > w+20) p.x = -20;
      if(p.y < -20) p.y = h+20;
      if(p.y > h+20) p.y = -20;
      if(p.life <= 0){
        Object.assign(p, makeParticle());
        p.x = rand(0,w);
        p.y = rand(0,h);
      }

      // glow
      ctx.beginPath();
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glow);
      grd.addColorStop(0, p.hue);
      grd.addColorStop(0.15, p.hue.replace('1)', '0.35)'));
      grd.addColorStop(0.6, p.hue.replace('1)', '0.08)'));
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.arc(p.x, p.y, p.r*3 + (p.glow/6), 0, Math.PI*2);
      ctx.fill();
    }

    // connect close particles gently
    ctx.lineWidth = 0.6;
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length && j<i+4;j++){
        const a=particles[i], b=particles[j];
        const dx=a.x-b.x, dy=a.y-b.y;
        const d2 = dx*dx+dy*dy;
        if(d2 < 25000){
          const alpha = 1 - d2/25000;
          ctx.strokeStyle = 'rgba(120,200,255,'+ (alpha*0.06) +')';
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  resize();
  draw();
})();

/* ===================== REST OF APP (YOUR LOGIC + NEW LEVEL LOGIC) ===================== */

// --- Firebase Configuración (unchanged) ---
const firebaseConfig = {
  apiKey: "AIzaSyAcbewB4Orpx4JyaXq141GgUidJbXUrEnY",
  authDomain: "sociosxit-5f841.firebaseapp.com",
  databaseURL: "https://sociosxit-5f841-default-rtdb.firebaseio.com",
  projectId: "sociosxit-5f841",
  storageBucket: "sociosxit-5f841.firebasestorage.app",
  messagingSenderId: "364183519851",
  appId: "1:364183519851:web:52a5a95d2c57f8f9f5e72e"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const pubsRef = db.ref("publications");

// UI elements (existing)
const userNameEl = document.getElementById("userName");
const userBalanceEl = document.getElementById("userBalance");
const logoutBtn = document.getElementById("logoutBtn");
const publicationsContainer = document.getElementById("publicationsContainer");
const myKeysList = document.getElementById("myKeysList");
const myKeysContainer = document.getElementById("myKeysContainer");

// menu elements (new)
const hamburgerBtn = document.getElementById("hamburgerBtn");
const sideMenu = document.getElementById("sideMenu");
const menuBackdrop = document.getElementById("menuBackdrop");
const menuUserName = document.getElementById("menuUserName");
const menuUserBalance = document.getElementById("menuUserBalance");
const menuAvatar = document.getElementById("menuAvatar");
const menuPublicaciones = document.getElementById("menuPublicaciones");
const menuKeys = document.getElementById("menuKeys");
const menuLogout = document.getElementById("menuLogout");
// NUEVO ELEMENTO DE MENÚ
const menuRecharge = document.getElementById("menuRecharge"); 

// existing modals
const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const confirmOk = document.getElementById("confirmOk");
const confirmCancel = document.getElementById("confirmCancel");
const keyModal = document.getElementById("keyModal");
const keyModalContent = document.getElementById("keyModalContent");
const keyCopyBtn = document.getElementById("keyCopyBtn");
const keyCloseBtn = document.getElementById("keyCloseBtn");
// NUEVOS ELEMENTOS DEL MODAL DE RECARGA
const rechargeModal = document.getElementById("rechargeModal");
const rechargeAmountInput = document.getElementById("rechargeAmountInput");
const rechargeConfirmBtn = document.getElementById("rechargeConfirmBtn");
const rechargeCancelBtn = document.getElementById("rechargeCancelBtn");
const rechargeError = document.getElementById("rechargeError");

// NEW elements for level/progress bar
const finalPriceDisplay = document.getElementById("finalPriceDisplay"); // Added to modal

// ELEMENTS FOR MENU BAR (RENAMED to avoid conflict)
const userLevelTextMenu = document.getElementById("userLevelTextMenu");
const levelProgressTextMenu = document.getElementById("levelProgressTextMenu");
const levelProgressBarMenu = document.getElementById("levelProgressBarMenu");
const levelNextGoalMenu = document.getElementById("levelNextGoalMenu");

// ELEMENTS FOR MAIN BAR (NEW IDs)
const userLevelTextMain = document.getElementById("userLevelTextMain");
const levelProgressTextMain = document.getElementById("levelProgressTextMain");
const levelProgressBarMain = document.getElementById("levelProgressBarMain");
const levelNextGoalMain = document.getElementById("levelNextGoalMain");


// Tabs (existing)
const tabPublicaciones = document.getElementById("tabPublicaciones");
const tabKeys = document.getElementById("tabKeys");

// --- Tabs functions (unchanged) ---
tabPublicaciones.onclick = () => showTab("pubs");
tabKeys.onclick = () => showTab("keys");
function showTab(tab) {
  if (tab === "pubs") {
    publicationsContainer.classList.remove("hidden");
    myKeysContainer.classList.add("hidden");
    tabPublicaciones.classList.add("active");
    tabKeys.classList.remove("active");
  } else {
    publicationsContainer.classList.add("hidden");
    myKeysContainer.classList.remove("hidden");
    tabPublicaciones.classList.remove("active");
    tabKeys.classList.add("active");
  }
}

// --- Session (unchanged) ---
const currentUser = sessionStorage.getItem("sociosxit_user");
if (!currentUser) window.location.href = "index.html";
else {
  userNameEl.textContent = currentUser;
  loadUserBalance(currentUser);
  loadUserPurchases(currentUser);
  loadUserSpendingAndLevel(currentUser); // NEW: Load spending and level
  // also set menu values
  menuUserName.textContent = currentUser;
  menuAvatar.textContent = String(currentUser).charAt(0)?.toUpperCase() || "U";
}

logoutBtn.onclick = () => {
  sessionStorage.removeItem("sociosxit_user");
  window.location.href = "index.html";
};

// menu interactions (open from RIGHT)
function openMenu() {
  sideMenu.classList.add("open");
  menuBackdrop.style.display = "block";
  setTimeout(()=> menuBackdrop.style.opacity = "1", 10);
  hamburgerBtn.classList.add("open");
  sideMenu.setAttribute("aria-hidden", "false");
  // menuUserBalance updated by loadUserBalance listener
}
function closeMenu() {
  sideMenu.classList.remove("open");
  menuBackdrop.style.opacity = "0";
  hamburgerBtn.classList.remove("open");
  sideMenu.setAttribute("aria-hidden", "true");
  setTimeout(()=> menuBackdrop.style.display = "none", 240);
}

hamburgerBtn.addEventListener("click", ()=> {
  if (sideMenu.classList.contains("open")) closeMenu();
  else openMenu();
});

// close when clicking backdrop
menuBackdrop.addEventListener("click", closeMenu);

// change hamburger into X on scroll (as requested) - style only
window.addEventListener("scroll", () => {
  const px = window.scrollY || document.documentElement.scrollTop;
  if (px > 20) hamburgerBtn.classList.add("open");
  else {
    // don't remove open if menu is open
    if (!sideMenu.classList.contains("open")) hamburgerBtn.classList.remove("open");
  }
});

// menu item behavior (navigate tabs + close)
menuPublicaciones.addEventListener("click", ()=> { showTab("pubs"); closeMenu(); });
menuKeys.addEventListener("click", ()=> { showTab("keys"); closeMenu(); });
menuLogout.addEventListener("click", ()=> {
  sessionStorage.removeItem("sociosxit_user");
  window.location.href = "index.html";
});

// =================================================================
// --- LÓGICA DE RECARGA DE SALDO (NUEVO) ---
// =================================================================

// Abrir modal de recarga
menuRecharge.addEventListener("click", ()=> { 
  closeMenu(); // Cierra el menú lateral
  rechargeModal.style.display = "flex";
  rechargeAmountInput.value = ""; // Limpia el input
  rechargeError.classList.add("hidden");
});

// Cerrar modal de recarga
rechargeCancelBtn.addEventListener("click", ()=> { 
  rechargeModal.style.display = "none";
});

// Lógica de recarga (redirección a WhatsApp)
rechargeConfirmBtn.addEventListener("click", ()=> { 
  const amount = parseFloat(rechargeAmountInput.value);
  const minAmount = 4.00;
  const whatsappNumber = "+573142369516";

  if (isNaN(amount) || amount < minAmount) {
    rechargeError.classList.remove("hidden");
    return;
  }
  
  rechargeError.classList.add("hidden");
  rechargeModal.style.display = "none";
  
  // Formatear mensaje para URL
  const message = `Hola quiero recargar ${amount.toFixed(2)} USD en la pagina de socios`;
  const encodedMessage = encodeURIComponent(message);
  
  // Crear URL de WhatsApp
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  
  // Redirigir
  window.open(whatsappURL, '_blank');
});

// =================================================================
// --- FIN LÓGICA DE RECARGA ---
// =================================================================


// --- Publicaciones (unchanged logic) ---
pubsRef.on("value", (snapshot) => {
  publicationsContainer.innerHTML = "";
  const data = snapshot.val();
  if (!data) {
    publicationsContainer.innerHTML = "<p>No hay publicaciones disponibles.</p>";
    return;
  }
  Object.keys(data).forEach(key => {
    const pub = data[key];
    publicationsContainer.prepend(createPublicationElement(pub, key));
  });
});

// create publication card (keeps your exact design)
function createPublicationElement(pub, key) {
  const div = document.createElement("div");
  div.className = "card rounded-xl overflow-hidden shadow-lg p-5";

  let mediaHTML = "";
  if (pub.mediaUrl) {
    if (pub.mediaUrl.includes("youtube.com") || pub.mediaUrl.includes("youtu.be")) {
      const videoId = pub.mediaUrl.split('v=')[1] || pub.mediaUrl.split('/').pop();
      mediaHTML = `
        <div class="aspect-w-16 aspect-h-9 mb-4">
          <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen class="w-full h-full rounded-lg"></iframe>
        </div>`;
    } else {
      mediaHTML = `<img src="${pub.mediaUrl}" alt="${pub.title}" class="w-full h-48 object-cover rounded-lg mb-4">`;
    }
  }

  // buttons area: transform the info block into a clickable buy button
  let buttonsHTML = "";
  if (pub.buttons) {
    Object.keys(pub.buttons).forEach(btnKey => {
      const btn = pub.buttons[btnKey];
      // price as decimal with two places
      const priceNum = parseFloat(btn.price || 0);
      const price = Number.isFinite(priceNum) ? priceNum.toFixed(2) : "0.00";
      const duration = btn.duration || (btn.days ? `${btn.days} días` : "");
      const keysCount = countKeys(btn.keys);

      // safe id for DOM
      const safeBtnId = String(btnKey).replace(/\W/g, "_");
      // onclick will open confirm modal and pass publish id + btnKey
      buttonsHTML += `
        <div class="btn-buy neon-btn p-4 rounded-lg text-center transition-transform hover:scale-105 cursor-pointer mb-3">
          <button onclick="openConfirmModal('${key}','${safeBtnId}', ${priceNum}, '${btnKey}')" class="w-full text-left">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-2xl font-bold text-neon-cyan">$${price}</div>
                <div class="text-sm font-semibold text-neon-pink">${duration || '—'}</div>
                <div class="text-xs small-muted mt-1">🔑 ${keysCount} claves disponibles</div>
              </div>
              <div>
                <div class="py-2 px-3 rounded-full bg-white text-blue-900 font-bold">Comprar</div>
              </div>
            </div>
          </button>
        </div>`;
    });
  }

  div.innerHTML = `
    ${mediaHTML}
    <h2 class="text-2xl font-bold mb-3 text-neon-pink">${pub.title}</h2>
    <button class="btn-show neon-btn w-full py-2 rounded-lg font-semibold mb-3" onclick="toggleDetails('${key}')">Mostrar Opciones</button>
    <div id="details-${key}" class="hidden mt-4 space-y-3">${buttonsHTML || "<p class='text-gray-400'>Sin botones disponibles</p>"}</div>
  `;
  return div;
}

function toggleDetails(key) {
  const el = document.getElementById(`details-${key}`);
  if (el) el.classList.toggle("hidden");
}

// --- Helpers for keys parsing + counting (unchanged) ---
function countKeys(keysField) {
  if (!keysField) return 0;
  if (Array.isArray(keysField)) return keysField.length;
  if (typeof keysField === "string") {
    return keysField.split(",").map(s => s.trim()).filter(Boolean).length;
  }
  return 0;
}

function parseKeysField(keysField) {
  // returns array of objects: { key: "...", usada: false }
  if (!keysField) return [];
  if (Array.isArray(keysField)) {
    return keysField.map(k => {
      if (typeof k === "string") {
        const raw = k.trim();
        const m = raw.match(/key\s*:\s*(.+)/i);
        const v = m ? m[1].trim() : raw;
        return { key: v, usada: false };
      } else if (typeof k === "object" && k.key) {
        return { key: String(k.key).trim(), usada: !!k.usada };
      } else return null;
    }).filter(Boolean);
  }
  if (typeof keysField === "string") {
    const parts = keysField.split(",").map(s => s.trim()).filter(Boolean);
    return parts.map(p => {
      const m = p.match(/key\s*:\s*(.+)/i);
      const v = m ? m[1].trim() : p;
      return { key: v, usada: false };
    });
  }
  return [];
}

// write keys back preserving original type (string => string, array => array of objects)
async function updateKeysField(pubId, btnKeyIdentifier, originalBtn, newKeysArr) {
  // fetch current publication to avoid clobbering concurrent edits
  const pubSnap = await db.ref(`publications/${pubId}`).once("value");
  const pub = pubSnap.val();
  if (!pub) return;

  // determine where btn is located
  if (Array.isArray(pub.buttons)) {
    const idx = Number(btnKeyIdentifier);
    if (!Number.isFinite(idx)) return;
    if (typeof originalBtn.keys === "string") {
      const s = newKeysArr.map(k => `key: ${k.key}`).join(", ");
      await db.ref(`publications/${pubId}/buttons/${idx}/keys`).set(s);
    } else {
      const arr = newKeysArr.map(k => ({ key: k.key, usada: !!k.usada }));
      await db.ref(`publications/${pubId}/buttons/${idx}/keys`).set(arr);
    }
  } else {
    const prop = btnKeyIdentifier;
    if (!pub.buttons || !pub.buttons[prop]) return;
    if (typeof originalBtn.keys === "string") {
      const s = newKeysArr.map(k => `key: ${k.key}`).join(", ");
      await db.ref(`publications/${pubId}/buttons/${prop}/keys`).set(s);
    } else {
      const arr = newKeysArr.map(k => ({ key: k.key, usada: !!k.usada }));
      await db.ref(`publications/${pubId}/buttons/${prop}/keys`).set(arr);
    }
  }
}


// --- NEW: Level and Discount Logic ---
const LEVEL_VIP_SPEND = 50;
const LEVEL_PREMIUM_SPEND = 150;
let userTotalSpending = 0; // Global variable to store current spending

/**
 * Calculates the user's current level and discount based on total spending.
 * @param {number} spending - The user's total accumulated spending.
 * @returns {{level: string, discount: number, nextGoal: number, goalLabel: string, progressColor: string}}
 */
function calculateLevel(spending) {
    if (spending >= LEVEL_PREMIUM_SPEND) {
        return {
            level: "Premium",
            discount: 0.20, // 20%
            nextGoal: LEVEL_PREMIUM_SPEND,
            goalLabel: "¡Nivel Máximo!",
            progressColor: "var(--level-premium)"
        };
    } else if (spending >= LEVEL_VIP_SPEND) {
        return {
            level: "VIP",
            discount: 0.10, // 10%
            nextGoal: LEVEL_PREMIUM_SPEND,
            goalLabel: `Próx. nivel (Premium): $${LEVEL_PREMIUM_SPEND.toFixed(2)} (20% Desc.)`,
            progressColor: "var(--level-vip)"
        };
    } else {
        return {
            level: "Base",
            discount: 0.00, // 0%
            nextGoal: LEVEL_VIP_SPEND,
            goalLabel: `Próx. nivel (VIP): $${LEVEL_VIP_SPEND.toFixed(2)} (10% Desc.)`,
            progressColor: "var(--level-base)"
        };
    }
}

/**
 * Updates the level bar UI (both menu and main screen).
 * @param {number} spending - The user's total accumulated spending.
 */
function updateLevelUI(spending) {
    const { level, discount, nextGoal, goalLabel, progressColor } = calculateLevel(spending);

    userTotalSpending = spending; // Update global spending

    // --- Logic for all bars (Menu and Main) ---
    const bars = [
        {
            userLevelText: userLevelTextMenu,
            levelProgressText: levelProgressTextMenu,
            levelProgressBar: levelProgressBarMenu,
            levelNextGoal: levelNextGoalMenu
        },
        {
            userLevelText: userLevelTextMain,
            levelProgressText: levelProgressTextMain,
            levelProgressBar: levelProgressBarMain,
            levelNextGoal: levelNextGoalMain
        }
    ];

    bars.forEach(bar => {
        if (!bar.userLevelText) return; // Skip if element not found (e.g., if you only use one bar)

        bar.userLevelText.textContent = `Nivel: ${level}`;
        bar.userLevelText.className = `level-label ${level === 'VIP' ? 'level-vip-text' : level === 'Premium' ? 'level-premium-text' : ''}`;

        bar.levelNextGoal.textContent = goalLabel;

        let percentage = 0;

        if (spending < LEVEL_VIP_SPEND) {
            percentage = (spending / LEVEL_VIP_SPEND) * 100;
            bar.levelProgressText.textContent = `$${spending.toFixed(2)} / $${LEVEL_VIP_SPEND.toFixed(2)}`;
        } else if (spending < LEVEL_PREMIUM_SPEND) {
            // Simplified: calculate progress based on total goal (150)
            percentage = (spending / LEVEL_PREMIUM_SPEND) * 100;
            bar.levelProgressText.textContent = `$${spending.toFixed(2)} / $${LEVEL_PREMIUM_SPEND.toFixed(2)}`;
        } else {
            // Max level reached
            percentage = 100;
            bar.levelProgressText.textContent = `¡Nivel Máximo! ($${spending.toFixed(2)})`;
        }

        bar.levelProgressBar.style.width = `${Math.min(percentage, 100).toFixed(2)}%`;
        bar.levelProgressBar.style.backgroundColor = progressColor;
    });

}

/**
 * Loads the user's total accumulated spending in real-time.
 */
function loadUserSpendingAndLevel(email) {
    const userKey = sanitizeEmail(email);
    const purchasesRef = db.ref(`users/${userKey}/purchases`);

    purchasesRef.on("value", snap => {
        const purchases = snap.val();
        let totalSpent = 0;
        if (purchases) {
            Object.values(purchases).forEach(p => {
                totalSpent += parseFloat(p.price || 0); // Price saved in history is the ACTUAL PRICE PAID
            });
        }
        // Use original price from purchase for calculation to avoid double counting discounts
        // Sum all "price" fields from the purchase history (which is the actual amount spent).
        // NOTE: This assumes 'price' in purchases history reflects the amount PAID.

        updateLevelUI(totalSpent);
    });
}

// --- Confirm modal flow (MODIFIED to show discounted price) ---
let _pendingPurchase = null; // { pubId, btnId, price, rawBtnId, finalPrice }

function openConfirmModal(pubId, safeBtnId, price, rawBtnId) {
    // Calculate discounted price
    const { discount } = calculateLevel(userTotalSpending);
    const discountAmount = price * discount;
    const finalPrice = price - discountAmount;

    confirmModal.style.display = "flex";

    confirmText.textContent = `¿Deseas comprar esta key? Precio base: $${Number(price).toFixed(2)} USD`;

    if (discount > 0) {
        finalPriceDisplay.innerHTML = `
            <span class="text-xl font-bold text-neon-green">
                Precio Final: $${finalPrice.toFixed(2)} USD
            </span>
            <span class="text-sm text-neon-cyan ml-2">
                (-${(discount * 100)}% Desc. ${calculateLevel(userTotalSpending).level})
            </span>
        `;
    } else {
        finalPriceDisplay.textContent = `Precio Final: $${finalPrice.toFixed(2)} USD`;
        finalPriceDisplay.classList.remove("text-neon-green");
        finalPriceDisplay.classList.remove("text-xl");
        finalPriceDisplay.classList.add("text-neon-yellow");
    }

    // Store the final price to use in the comprarKey function
    _pendingPurchase = { pubId, safeBtnId, price: Number(price), rawBtnId, finalPrice: finalPrice };
}

confirmCancel.onclick = () => {
  confirmModal.style.display = "none";
  _pendingPurchase = null;
};
confirmOk.onclick = async () => {
  if (!_pendingPurchase) return;
  confirmModal.style.display = "none";
  // Pass the discounted price to the purchase function
  await comprarKey(_pendingPurchase.pubId, _pendingPurchase.safeBtnId, _pendingPurchase.price, _pendingPurchase.rawBtnId, _pendingPurchase.finalPrice);
  _pendingPurchase = null;
};


// --- Main purchase function (MODIFIED to use finalPrice and save originalPrice) ---
async function comprarKey(pubId, safeBtnId, originalPrice, rawBtnId, finalPrice) {
  try {
    const email = currentUser;
    const userKey = sanitizeEmail(email);
    const userRef = db.ref(`users/${userKey}`);

    // get balance (support string or number)
    const balSnap = await userRef.child("balance").once("value");
    let balance = parseFloat(balSnap.val() || 0);
    if (isNaN(balance)) balance = 0;

    // Use finalPrice for the deduction check
    if (balance < finalPrice) {
      alert("⚠️ No tienes saldo suficiente para esta compra.");
      return;
    }

    // load latest publication data
    const pubSnap = await db.ref(`publications/${pubId}`).once("value");
    const pub = pubSnap.val();
    if (!pub) { alert("Publicación no encontrada."); return; }

    // find the original button object (array index or property)
    let originalBtn = null;
    let btnIndexOrKey = null;
    if (Array.isArray(pub.buttons)) {
      const idx = Number(safeBtnId);
      originalBtn = pub.buttons[idx];
      btnIndexOrKey = idx;
    } else {
      // try direct property
      if (pub.buttons.hasOwnProperty(rawBtnId)) {
        originalBtn = pub.buttons[rawBtnId];
        btnIndexOrKey = rawBtnId;
      } else {
        // fallback: find by index order mapping
        const keys = Object.keys(pub.buttons || {});
        const idx = Number(safeBtnId);
        if (Number.isFinite(idx) && keys[idx]) {
          btnIndexOrKey = keys[idx];
          originalBtn = pub.buttons[btnIndexOrKey];
        }
      }
    }

    if (!originalBtn) { alert("Opción no encontrada."); return; }

    // parse keys and pick first available
    const keysArr = parseKeysField(originalBtn.keys);
    if (!keysArr.length) { alert("❌ No quedan claves disponibles para esta opción."); return; }
    // choose first available (you asked earlier to "take first")
    const selected = keysArr[0];

    // 1) update balance (atomic-ish: read again then set)
    const balSnap2 = await userRef.child("balance").once("value");
    let balanceNow = parseFloat(balSnap2.val() || 0);
    if (isNaN(balanceNow)) balanceNow = 0;
    if (balanceNow < finalPrice) { alert("⚠️ Saldo insuficiente."); return; } // Check against final price

    const newBalance = (balanceNow - finalPrice); // Deduct final price
    await userRef.child("balance").set(Number(newBalance.toFixed(2)));

    // 2) remove selected key from keys array (do not leave it visible)
    const updatedKeys = keysArr.slice(); // copy
    updatedKeys.shift(); // remove first
    await updateKeysField(pubId, btnIndexOrKey, originalBtn, updatedKeys);

    // 3) save purchase in user history
    const purchaseRef = userRef.child("purchases").push();
    await purchaseRef.set({
      pubId,
      title: pub.title || "",
      optionText: originalBtn.text || originalBtn.option || "",
      key: selected.key,
      price: Number(finalPrice), // Store the price ACTUALLY PAID for history/level calc
      originalPrice: Number(originalPrice), // NEW: Store original price
      discountApplied: Number(originalPrice - finalPrice).toFixed(2), // NEW: Store discount amount
      days: originalBtn.days || originalBtn.duration || "",
      date: new Date().toISOString()
    });

    // 4) show key modal with copy button
    keyModalContent.innerHTML = `
      <div class="small-muted mb-2">${pub.title || "Producto" } • ${originalBtn.text || ""}</div>
      <div class="mono text-green-300 font-semibold p-2 rounded">${selected.key}</div>
    `;
    keyModal.style.display = "flex";

    // set copy button behavior
    keyCopyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(selected.key);
        alert("🔑 Clave copiada al portapapeles.");
      } catch {
        alert("No se pudo copiar automáticamente. Selecciona y copia manualmente.");
      }
    };
    keyCloseBtn.onclick = () => {
      keyModal.style.display = "none";
    };

    // 5) update UI balance (listener will also update but we set immediate)
    userBalanceEl.textContent = `$${Number(newBalance).toFixed(2)}`;

    // 6) Re-calculate level and update UI (loadUserSpendingAndLevel listener will do this automatically)

    // refresh purchases list if open
    if (tabKeys.classList.contains("active")) {
      loadUserPurchases(currentUser);
    }
  } catch (err) {
    console.error(err);
    alert("Ocurrió un error al procesar la compra.");
  }
}

// --- sanitize email (unchanged) ---
function sanitizeEmail(email) {
  return email.replace(/\./g, "_");
}

// --- load user balance (real-time) (unchanged, but also updates menu) ---
function loadUserBalance(email) {
  const userKey = sanitizeEmail(email);
  db.ref(`users/${userKey}/balance`).on("value", snap => {
    const balance = parseFloat(snap.val() || 0) || 0;
    const formatted = `$${Number(balance).toFixed(2)}`;
    userBalanceEl.textContent = formatted;
    // also update menu display
    menuUserBalance.textContent = `Saldo: ${formatted}`;
  });
}

// --- Historial (Mis Keys) with search & filter (MODIFIED to show original/final price) ---
function loadUserPurchases(email) {
  const userKey = sanitizeEmail(email);
  const purchasesRef = db.ref(`users/${userKey}/purchases`);
  const searchInput = document.getElementById("searchKeyInput");
  const filterSelect = document.getElementById("filterDateSelect");
  let allPurchases = [];

  purchasesRef.on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      myKeysList.innerHTML = "<p class='small-muted'>No has comprado claves aún.</p>";
      allPurchases = [];
      return;
    }
    allPurchases = Object.keys(data).map(k => ({ id: k, ...data[k] })).reverse();
    renderPurchases();
  });

  function renderPurchases() {
    const term = (searchInput.value || "").toLowerCase();
    const filter = filterSelect.value;
    const now = new Date();
    myKeysList.innerHTML = "";

    const filtered = allPurchases.filter(it => {
      const title = (it.title || "").toLowerCase();
      const keyVal = (it.key || "").toLowerCase();
      const matchTerm = !term || title.includes(term) || keyVal.includes(term);

      const date = new Date(it.date);
      const diffDays = (now - date) / (1000 * 60 * 60 * 24);
      let matchDate = true;
      if (filter === "today") matchDate = diffDays < 1;
      else if (filter === "7days") matchDate = diffDays <= 7;
      else if (filter === "month") matchDate = date.getMonth() === now.getMonth();

      return matchTerm && matchDate;
    });

    if (!filtered.length) {
      myKeysList.innerHTML = "<p class='small-muted'>No hay resultados para tu búsqueda.</p>";
      return;
    }

    filtered.forEach(it => {
      const div = document.createElement("div");
      div.className = "card rounded-lg p-4 transition-transform hover:scale-[1.01]";
      const date = new Date(it.date).toLocaleString();
      const finalPrice = parseFloat(it.price || 0).toFixed(2);
      const originalPrice = parseFloat(it.originalPrice || finalPrice).toFixed(2);
      const discountApplied = parseFloat(it.discountApplied || 0).toFixed(2);

      let priceHTML = `<div class="font-bold text-green-400">$${finalPrice}</div>`;
      if (discountApplied > 0.01) {
          priceHTML = `
            <div class="small-muted line-through text-sm">$${originalPrice}</div>
            <div class="font-bold text-green-400">$${finalPrice}</div>
            <div class="text-xs text-neon-cyan">(-$${discountApplied} Desc.)</div>
          `;
      }

      div.innerHTML = `
        <div class="flex flex-col md:flex-row justify-between items-start gap-2">
          <div>
            <div class="text-lg font-semibold">${it.title || "Sin título"}</div>
            <div class="small-muted">${it.optionText || ""} • ${it.days || ""}</div>
            <div class="small-muted mt-2">📅 ${date}</div>
          </div>
          <div class="text-left md:text-right">
            ${priceHTML}
            <div class="mono text-sm text-green-300 mt-2 break-all">${it.key}</div>
            <button class="mt-2 bg-white text-blue-900 font-bold py-1 px-3 rounded" onclick="copiarKey('${it.key}')">Copiar</button>
          </div>
        </div>`;
      myKeysList.appendChild(div);
    });
  }

  searchInput.oninput = renderPurchases;
  filterSelect.onchange = renderPurchases;
}

function copiarKey(text) {
  navigator.clipboard.writeText(text).then(() => alert("🔑 Clave copiada al portapapeles."));
}

// show publications by default
showTab("pubs");
