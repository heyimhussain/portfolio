(() => {
  // Draggable hero tiles
  const canvas = document.getElementById("canvas");
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

  // Experience board: pick a job on the left, show it on the right
  const tabs = [...document.querySelectorAll(".jl")];
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => {
      tabs.forEach((o) => {
        const on = o === t;
        o.classList.toggle("on", on);
        o.setAttribute("aria-selected", on);
        document.getElementById(o.getAttribute("aria-controls")).hidden = !on;
      });
    });
    t.addEventListener("keydown", (e) => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      const n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus(); n.click();
    });
  });

  // Highlight the pill button for the section in view
  const links = [...document.querySelectorAll(".pill a")];
  const targets = links.map((l) => document.querySelector(l.getAttribute("href")));
  const spy = () => {
    const y = window.innerHeight * 0.4;
    let cur = 0;
    targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top <= y) cur = i; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) cur = links.length - 1;
    links.forEach((l, i) => l.classList.toggle("on", i === cur));
  };
  window.addEventListener("scroll", spy, { passive: true });
  spy();
})();
