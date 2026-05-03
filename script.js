const carousel = document.getElementById("carousel");
const albumName = document.getElementById("albumName");
const artistName = document.getElementById("artistName");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

const cases = carousel.querySelectorAll(".cd-case");

let currentIndex = 0;

/* =========================
   RENDER
   ========================= */
function render() {
  const leftIndex = (currentIndex - 1 + albums.length) % albums.length;
  const rightIndex = (currentIndex + 1) % albums.length;

  cases[0].querySelector(".album-cover").src = albums[leftIndex].image;
  cases[1].querySelector(".album-cover").src = albums[currentIndex].image;
  cases[2].querySelector(".album-cover").src = albums[rightIndex].image;

  albumName.textContent = albums[currentIndex].album;
  artistName.textContent = albums[currentIndex].artist;

  resetTilt();
}

/* =========================
   BOTÕES
   ========================= */
next.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % albums.length;
  render();
});

prev.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + albums.length) % albums.length;
  render();
});

/* =========================
   SWIPE
   ========================= */
let touchStartX = 0;

carousel.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
});

carousel.addEventListener("touchend", (e) => {
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) < 50) return;
  delta < 0 ? next.click() : prev.click();
});

/* =========================
   GIROSCÓPIO 360°
   ========================= */

let currentX = 0;
let currentY = 0;
let targetX = 0;
let targetY = 0;

function resetTilt() {
  const visual = document.querySelector(".cd-case.active .cd-visual");
  if (visual) {
    visual.style.transform = "rotateX(0deg) rotateY(0deg)";
  }
}

function handleOrientation(event) {
  const visual = document.querySelector(".cd-case.active .cd-visual");
  if (!visual) return;

  let beta = event.beta;   // frente / trás
  let gamma = event.gamma; // esquerda / direita

  if (beta === null || gamma === null) return;

  // Sensibilidade maior para pegar diagonais bem
  const sensitivity = 0.7;

  targetX = beta * -sensitivity;
  targetY = gamma * sensitivity;
}

function animateTilt() {
  const visual = document.querySelector(".cd-case.active .cd-visual");
  if (!visual) {
    requestAnimationFrame(animateTilt);
    return;
  }

  // suavização real por frame
  const ease = 0.12;

  currentX += (targetX - currentX) * ease;
  currentY += (targetY - currentY) * ease;

  visual.style.transform =
    `rotateX(${currentX}deg) rotateY(${currentY}deg)`;

  requestAnimationFrame(animateTilt);
}

function enableGyroscope() {

  if (!window.DeviceOrientationEvent) return;

  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    document.body.addEventListener("click", async () => {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === "granted") {
          window.addEventListener("deviceorientation", handleOrientation);
        }
      } catch (e) {}
    }, { once: true });
  } else {
    window.addEventListener("deviceorientation", handleOrientation);
  }

  animateTilt();
}

/* =========================
   INIT
   ========================= */
render();
enableGyroscope();
