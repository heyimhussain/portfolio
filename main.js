// Draggable hero tiles
const canvas = document.getElementById("canvas");
const coords = document.getElementById("coords");
let top = 10;

document.querySelectorAll("[data-drag]").forEach((tile) => {
  tile.addEventListener("pointerdown", (e) => {
    tile.setPointerCapture(e.pointerId);
    tile.style.zIndex = ++top;
    tile.classList.add("grab");
    const r = tile.getBoundingClientRect(), c = canvas.getBoundingClientRect();
    const ox = e.clientX - r.left, oy = e.clientY - r.top;
    const move = (ev) => {
      tile.style.setProperty("--x", ev.clientX - c.left - ox + "px");
      tile.style.setProperty("--y", ev.clientY - c.top - oy + "px");
    };
    const up = () => {
      tile.classList.remove("grab");
      tile.removeEventListener("pointermove", move);
    };
    tile.addEventListener("pointermove", move);
    tile.addEventListener("pointerup", up, { once: true });
  });
});

canvas.addEventListener("pointermove", (e) => {
  const c = canvas.getBoundingClientRect();
  coords.textContent = `x ${Math.round(e.clientX - c.left)} · y ${Math.round(e.clientY - c.top)}`;
});

// Reveal on scroll
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
