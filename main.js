(() => {
  // Draggable hero tiles
  const canvas = document.getElementById("canvas");
  const coords = document.getElementById("coords");
  let z = 10;

  document.querySelectorAll("[data-drag]").forEach((tile) => {
    tile.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      tile.setPointerCapture(e.pointerId);
      tile.style.zIndex = ++z;
      tile.classList.add("grab");
      const r = tile.getBoundingClientRect(), c = canvas.getBoundingClientRect();
      const ox = e.clientX - r.left, oy = e.clientY - r.top;
      const move = (ev) => {
        const x = Math.max(0, Math.min(ev.clientX - c.left - ox, c.width - r.width));
        const y = Math.max(0, Math.min(ev.clientY - c.top - oy, c.height - r.height));
        tile.style.setProperty("--x", x + "px");
        tile.style.setProperty("--y", y + "px");
      };
      const up = () => {
        tile.classList.remove("grab");
        tile.removeEventListener("pointermove", move);
      };
      tile.addEventListener("pointermove", move);
      tile.addEventListener("pointerup", up, { once: true });
      tile.addEventListener("pointercancel", up, { once: true });
    });
  });

  canvas.addEventListener("pointermove", (e) => {
    const c = canvas.getBoundingClientRect();
    coords.textContent = `x ${Math.round(e.clientX - c.left)}, y ${Math.round(e.clientY - c.top)}`;
  });
})();
