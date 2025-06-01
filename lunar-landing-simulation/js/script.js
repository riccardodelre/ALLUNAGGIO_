
const gTerra = 9.81;
const gLuna = 1.66;
const massaTerra = 5.976e24;
const massaLuna = 7.348e22;
const distanzaTerraLuna = 3.84e8;

function calcolaTempo() {
  const massaNav = parseFloat(document.getElementById("massa").value);
  const velocitaIniziale = parseFloat(document.getElementById("velocita").value);

  if (
    isNaN(massaNav) || isNaN(velocitaIniziale) ||
    massaNav < 10 || massaNav > 100000 ||
    velocitaIniziale < 1 || velocitaIniziale > 1000
  ) {
    document.getElementById("risultato").innerHTML = "Inserisci valori validi!";
    document.getElementById("confermaBtn").style.display = "none";
    return;
  }

  const accelerazione = gLuna;
  const r = 1.7374e6;
  const distanza = Math.random() * (2.5 * r - r) + r;
  window.distanzaLuna = distanza;

  const delta = Math.pow(velocitaIniziale, 2) + 2 * accelerazione * distanza;
  let tempo;
  if (delta < 0) {
    tempo = NaN;
  } else {
    tempo = (-velocitaIniziale + Math.sqrt(delta)) / accelerazione;
  }

  document.getElementById("risultato").innerHTML =
    `Accelerazione: <b>${accelerazione.toFixed(2)} m/s²</b><br>` +
    `<span class="nowrap">Tempo: <b>${tempo.toFixed(2)} s</b></span>`;

  const noteBox = document.querySelector('.note-box');
  if (noteBox) {
    noteBox.innerHTML =
      `<b>Distanza:</b> ${distanza.toLocaleString('it-IT', {maximumFractionDigits: 0})} m<br><br>` +
      `<b>Note tecniche:</b><br>
      La simulazione utilizza la gravità lunare costante (1.66 m/s²).<br>
      Inserisci valori realistici per massa e velocità.<br>
      <br>
      <b>Valori accettabili:</b><br>
      <span class="label-blu">Massa navicella</span>: da 10 a 100.000 kg<br>
      <span class="label-blu">Velocità iniziale</span>: da 1 a 1.000 m/s`;
  }

  const distanzaSpan = document.getElementById("distanza-note");
  if (distanzaSpan) {
    distanzaSpan.textContent = distanza.toLocaleString('it-IT', {maximumFractionDigits: 0});
  }

  document.getElementById("confermaBtn").style.display = "inline-block";
}

function mostraGioco() {
  document.getElementById("menu-container").style.display = "none";
  document.getElementById("game-section").style.display = "block";
  document.querySelector("h1").style.display = "none";
  const note = document.querySelector(".note-tecniche");
  if (note) note.style.display = "none";
  document.body.classList.add("gioco-attivo");
  if (typeof startGame === "function") startGame();
}

const lander = document.getElementById("lander");
const flame = document.getElementById("flame");
const leftFlame = document.getElementById("left-flame");
const rightFlame = document.getElementById("right-flame");
const speedDisplay = document.getElementById("speed");
const engineDisplay = document.getElementById("engine");
const fuelDisplay = document.getElementById("fuel");
const message = document.getElementById("message");
const scoreDisplay = document.getElementById("score");
const target = document.getElementById("target");
const engineSound = document.getElementById("engine-sound");
const collisionSound = document.getElementById("collision-sound");
const landingSuccessSound = document.getElementById("landing-success-sound");
const fuelEmptySound = document.getElementById("fuel-empty-sound");
const asteroidContainer = document.getElementById("asteroid-container");
const starContainer = document.getElementById("stars");

for (let i = 0; i < 100; i++) {
  const star = document.createElement("div");
  star.className = "star";
  star.style.top = Math.random() * 100 + "vh";
  star.style.left = Math.random() * 100 + "vw";
  starContainer.appendChild(star);
}

let position = 70;
let speed = 0;
let horizontalSpeed = 0;
let gravity = 0.0005;
let thrust = -0.001;
let lateralThrust = 0.001;
let engineOn = false;
let movingLeft = false;
let movingRight = false;
let gameOver = false;
let score = 0;
let fuel = 100;
let waitingToStart = false;
let waitingToRestart = false;
let gameStarted = false;

let targetPosition = Math.random() * 80 + 10;
target.style.left = targetPosition + "%";

const asteroidData = [];

function createAsteroids() {
  asteroidContainer.innerHTML = "";
  asteroidData.length = 0;
  for (let i = 0; i < 6; i++) {
    const asteroid = document.createElement("div");
    asteroid.classList.add("asteroid");
    const centerX = Math.random() * 70 + 10;
    const centerY = Math.random() * 30 + 40;
    const radius = 3 + Math.random() * 2;
    const angle = Math.random() * 2 * Math.PI;
    const speed = 0.005 + Math.random() * 0.003;
    asteroid.dataset.index = i;
    asteroidData.push({element: asteroid, centerX, centerY, radius, angle, speed});
    asteroidContainer.appendChild(asteroid);
  }
}

function moveAsteroids() {
  asteroidData.forEach(data => {
    data.angle += data.speed;
    const x = data.centerX + Math.cos(data.angle) * data.radius;
    const y = data.centerY + Math.sin(data.angle) * data.radius;
    data.element.style.left = x + "vw";
    data.element.style.top = y + "vh";
  });
}

createAsteroids();

window.addEventListener("keydown", (e) => {
  if (!gameStarted && e.code === "Enter") {
    gameStarted = true;
    resetLander();
    return;
  }

  if (waitingToRestart && e.code === "Enter") {
    waitingToRestart = false;
    waitingToStart = true;
    resetLander();
    return;
  }

  if (waitingToStart && e.code === "Space") {
    waitingToStart = false;
    engineOn = true;
    requestAnimationFrame(update);
    return;
  }
  if (waitingToStart || waitingToRestart) return;

  if (fuel <= 0) {
    fuelEmptySound.play();
    return;
  }
  if (e.code === "Space") {
    e.preventDefault();
    engineOn = true;
    fuel = Math.max(0, fuel - 1);
  }
  if (e.code === "ArrowLeft") {
    movingLeft = true;
    fuel = Math.max(0, fuel - 1);
  }
  if (e.code === "ArrowRight") {
    movingRight = true;
    fuel = Math.max(0, fuel - 1);
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Space") engineOn = false;
  if (e.code === "ArrowLeft") movingLeft = false;
  if (e.code === "ArrowRight") movingRight = false;
});

function update() {
  if (gameOver) return;
  message.textContent = '';
  let acc = gravity;
  if (engineOn && fuel > 0) {
    acc += thrust;
    if (engineSound.paused) engineSound.play();
  } else {
    engineOn = false;
    engineSound.pause();
    engineSound.currentTime = 0;
  }

  speed += acc;
  position -= speed * 100;

  if (movingLeft) {
    horizontalSpeed -= lateralThrust;
  }
  if (movingRight) {
    horizontalSpeed += lateralThrust;
  }

  const maxLeft = 0;
  const maxRight = window.innerWidth - lander.offsetWidth;
  let newX = lander.offsetLeft + horizontalSpeed * 100;
  newX = Math.max(maxLeft, Math.min(maxRight, newX));
  lander.style.left = newX + "px";

  for (let a of asteroidData) {
    const r1 = lander.getBoundingClientRect();
    const r2 = a.element.getBoundingClientRect();
    if (
      r1.bottom > r2.top &&
      r1.top < r2.bottom &&
      r1.left < r2.right &&
      r1.right > r2.left
    ) {
      collisionSound.play();
      message.innerHTML = "<span style='color:red;'>Hai colpito un asteroide!</span>";
      message.innerHTML += '<br><span id="restart-hint" style="font-size:0.7em;color:#fff;font-family:\'Press Start 2P\',monospace;">Premere INVIO per ricominciare</span>';
      gameOver = true;
      waitingToRestart = true;
      engineSound.pause();
      return;
    }
  }

  const surfaceHeight = 80;
  const minPosition = (surfaceHeight / window.innerHeight) * 100;

  const landerRect = lander.getBoundingClientRect();
  const gameRect = document.getElementById('game').getBoundingClientRect();
  const landerBottomFromGame = gameRect.bottom - landerRect.bottom;

  if (landerBottomFromGame <= surfaceHeight) {
    position = minPosition;
    gameOver = true;
    waitingToRestart = true;
    engineSound.pause();
    const landingPosition = lander.offsetLeft + lander.offsetWidth / 2;
    const targetCenter = target.offsetLeft + target.offsetWidth / 2;
    const distance = Math.abs(landingPosition - targetCenter);
    if (distance < 55 && speed < 0.03) {
      landingSuccessSound.play();
      message.textContent = "Atterraggio perfetto!";
      message.style.color = "yellow";
      message.style.fontSize = "2.5em";
      score = Math.max(0, 100 - (distance / 5));
      message.innerHTML += '<br><span id="restart-hint" style="font-size:0.7em;color:#fff;font-family:\'Press Start 2P\',monospace;">Premere INVIO per ricominciare</span>';
    } else {
      message.textContent = "MISSION FAILED";
      message.style.color = "red";
      message.style.fontSize = "2.5em";
      score = 0;
      message.innerHTML += '<br><span id="restart-hint" style="font-size:0.7em;color:#fff;font-family:\'Press Start 2P\',monospace;">Premere INVIO per ricominciare</span>';
    }
    scoreDisplay.textContent = score.toFixed(0);
  }

  lander.style.bottom = position + "%";
  speedDisplay.textContent = speed.toFixed(4);
  engineDisplay.textContent = engineOn ? "ON" : "OFF";
  fuelDisplay.textContent = Math.max(0, fuel.toFixed(0));
  flame.style.display = engineOn ? "block" : "none";
  leftFlame.style.display = movingRight ? "block" : "none";
  rightFlame.style.display = movingLeft ? "block" : "none";

  moveAsteroids();

  requestAnimationFrame(update);
}

function resetLander() {
  position = 70;
  speed = 0;
  horizontalSpeed = 0;
  fuel = 100;
  engineOn = false;
  movingLeft = false;
  movingRight = false;
  gameOver = false;
  score = 0;
  waitingToStart = true;
  waitingToRestart = false;

  lander.style.left = (window.innerWidth / 2 - lander.offsetWidth / 2) + "px";
  lander.style.bottom = position + "%";

  speedDisplay.textContent = '0';
  fuelDisplay.textContent = '100';
  engineDisplay.textContent = 'OFF';
  message.textContent = 'Premi SPAZIO per iniziare!';
  message.style.fontSize = "1.5em";
  message.style.color = "#fff";
  scoreDisplay.textContent = '0';

  targetPosition = Math.random() * 80 + 10;
  target.style.left = targetPosition + "%";
  createAsteroids();

  animateAsteroids();
}

function animateAsteroids() {
  if (!waitingToStart) return;
  moveAsteroids();
  requestAnimationFrame(animateAsteroids);
}

function startGame() {
  resetLander();
  animateAsteroids();
}

if (!gameStarted) {
  message.textContent = 'Premi INVIO per iniziare!';
  message.style.fontSize = "1.5em";
  message.style.color = "#fff";
}

resetLander();

function checkLanding() {
  const landerRect = document.getElementById("lander").getBoundingClientRect();
  const targetRect = document.getElementById("target").getBoundingClientRect();

  const isTouching =
    landerRect.right > targetRect.left &&
    landerRect.left < targetRect.right &&
    landerRect.bottom > targetRect.top &&
    landerRect.top < targetRect.bottom;

  if (isTouching) {
    landingSuccess();
    return true;
  }
  return false;
}