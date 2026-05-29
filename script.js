const canvas = document.getElementById("robot-canvas");
const ctx = canvas.getContext("2d", { alpha: true });
let width = 0;
let height = 0;
let pixelRatio = 1;
let animationFrame = 0;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = Math.max(1, Math.floor(rect.width));
  height = Math.max(1, Math.floor(rect.height));
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function line(x1, y1, x2, y2, color, lineWidth = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function circle(x, y, radius, stroke, fill, lineWidth = 1) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawGrid(t) {
  const spacing = 42;
  ctx.strokeStyle = "rgba(89, 220, 224, 0.08)";
  ctx.lineWidth = 1;

  for (let x = (t * 12) % spacing; x < width; x += spacing) {
    line(x, 0, x, height, "rgba(89, 220, 224, 0.08)");
  }

  for (let y = spacing - ((t * 8) % spacing); y < height; y += spacing) {
    line(0, y, width, y, "rgba(103, 232, 165, 0.055)");
  }
}

function drawLidar(t) {
  const originX = width * 0.72;
  const originY = height * 0.54;
  const radius = Math.min(width, height) * 0.34;
  const sweep = t * 0.85;

  circle(originX, originY, radius * 0.32, "rgba(89, 220, 224, 0.18)");
  circle(originX, originY, radius * 0.55, "rgba(89, 220, 224, 0.12)");
  circle(originX, originY, radius * 0.78, "rgba(89, 220, 224, 0.1)");
  line(
    originX,
    originY,
    originX + Math.cos(sweep) * radius,
    originY + Math.sin(sweep) * radius,
    "rgba(103, 232, 165, 0.55)",
    2
  );

  for (let i = 0; i < 90; i += 1) {
    const a = i * 0.58 + Math.sin(i) * 0.2;
    const r = radius * (0.18 + ((i * 37) % 80) / 100);
    const pulse = 0.5 + 0.5 * Math.sin(t * 2 + i);
    const x = originX + Math.cos(a) * r;
    const y = originY + Math.sin(a) * r * 0.58;
    const color = i % 5 === 0 ? "241, 185, 81" : "89, 220, 224";
    circle(x, y, 1.4 + pulse * 1.2, null, `rgba(${color}, ${0.2 + pulse * 0.38})`);
  }
}

function drawRobotArm(t) {
  const baseX = width * 0.58;
  const baseY = height * 0.73;
  const scale = Math.min(width, height) / 680;
  const upper = 150 * scale;
  const lower = 124 * scale;
  const shoulder = -1.15 + Math.sin(t * 0.75) * 0.36;
  const elbow = 1.25 + Math.cos(t * 0.95) * 0.28;
  const jointX = baseX + Math.cos(shoulder) * upper;
  const jointY = baseY + Math.sin(shoulder) * upper;
  const wristX = jointX + Math.cos(shoulder + elbow) * lower;
  const wristY = jointY + Math.sin(shoulder + elbow) * lower;

  ctx.lineCap = "round";
  line(baseX, baseY, jointX, jointY, "rgba(89, 220, 224, 0.88)", 16 * scale);
  line(jointX, jointY, wristX, wristY, "rgba(241, 185, 81, 0.9)", 12 * scale);
  line(baseX, baseY, jointX, jointY, "rgba(7, 16, 18, 0.8)", 5 * scale);
  line(jointX, jointY, wristX, wristY, "rgba(7, 16, 18, 0.82)", 4 * scale);

  circle(baseX, baseY, 25 * scale, "rgba(103, 232, 165, 0.9)", "rgba(10, 18, 20, 0.9)", 3 * scale);
  circle(jointX, jointY, 18 * scale, "rgba(89, 220, 224, 0.9)", "rgba(10, 18, 20, 0.88)", 3 * scale);
  circle(wristX, wristY, 14 * scale, "rgba(241, 185, 81, 0.95)", "rgba(10, 18, 20, 0.86)", 3 * scale);

  const claw = 28 * scale;
  line(wristX, wristY, wristX + claw, wristY - claw * 0.35, "rgba(237, 245, 242, 0.72)", 3 * scale);
  line(wristX, wristY, wristX + claw, wristY + claw * 0.35, "rgba(237, 245, 242, 0.72)", 3 * scale);
  circle(wristX + claw * 1.18, wristY, 5 * scale, null, "rgba(103, 232, 165, 0.92)");
  ctx.lineCap = "butt";
}

function drawCameraFrustum(t) {
  const x = width * 0.2;
  const y = height * 0.63;
  const tilt = Math.sin(t * 0.6) * 12;
  const sensorW = 86;
  const sensorH = 54;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((tilt * Math.PI) / 180);
  ctx.strokeStyle = "rgba(230, 111, 143, 0.68)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-sensorW / 2, -sensorH / 2, sensorW, sensorH);
  line(-sensorW / 2, -sensorH / 2, -170, -88, "rgba(230, 111, 143, 0.46)");
  line(sensorW / 2, -sensorH / 2, 170, -88, "rgba(230, 111, 143, 0.46)");
  line(-sensorW / 2, sensorH / 2, -170, 88, "rgba(230, 111, 143, 0.46)");
  line(sensorW / 2, sensorH / 2, 170, 88, "rgba(230, 111, 143, 0.46)");
  for (let i = 0; i < 7; i += 1) {
    const px = -115 + i * 38;
    const py = Math.sin(t * 2 + i) * 18;
    circle(px, py, 3, null, "rgba(241, 185, 81, 0.68)");
  }
  ctx.restore();
}

function render() {
  const t = performance.now() / 1000;
  ctx.clearRect(0, 0, width, height);
  drawGrid(t);
  drawCameraFrustum(t);
  drawLidar(t);
  drawRobotArm(t);
  animationFrame = requestAnimationFrame(render);
}

function setupProjectFilters() {
  const buttons = Array.from(document.querySelectorAll("[data-filter]"));
  const cards = Array.from(document.querySelectorAll(".project-card"));

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach((candidate) => candidate.classList.toggle("active", candidate === button));

      cards.forEach((card) => {
        const tags = card.dataset.tags || "";
        const shouldShow = filter === "all" || tags.includes(filter);
        card.classList.toggle("hidden", !shouldShow);
      });
    });
  });
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
setupProjectFilters();
render();

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame);
    return;
  }
  render();
});
