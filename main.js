(() => {
  // Draggable hero tiles
  const canvas = document.getElementById("home");
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
  const ind = document.querySelector(".pill-ind");
  addEventListener("resize", () => spy());
  const targets = links.map((l) => document.querySelector(l.getAttribute("href")));
  const spy = () => {
    const y = window.innerHeight * 0.4;
    let cur = 0;
    targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top <= y) cur = i; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) cur = links.length - 1;
    links.forEach((l, i) => l.classList.toggle("on", i === cur));
    const on = links[cur];
    ind.style.width = on.offsetWidth + "px";
    ind.style.transform = `translateX(${on.offsetLeft}px)`;
  };
  window.addEventListener("scroll", spy, { passive: true });
  spy();
  document.fonts?.ready.then(spy);

  // Living ASCII wave background, inspired by Atless:
  // glyphs ripple on their own and swell + glow teal around the cursor.
  const cv = canvas.querySelector(".waves");
  const ctx = cv.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CH = ["·", "~", "≈", "∿", "≋"];
  let cur = null, last = 0, W = 0, H = 0, D = 1, visible = true;
  const size = () => {
    D = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    cv.width = W * D; cv.height = H * D;
  };
  size(); addEventListener("resize", size);
  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    cur = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  canvas.addEventListener("pointerleave", () => { cur = null; });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  const draw = (now) => {
    requestAnimationFrame(draw);
    if (!visible || now - last < 66) return;
    last = now;
    ctx.setTransform(D, 0, 0, D, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.font = "12px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const t = still ? 0 : now / 1400, gap = 24;
    for (let x = gap / 2; x < W; x += gap) {
      for (let y = gap / 2; y < H; y += gap) {
        let v = Math.sin(x * 0.05 + t) + Math.cos(y * 0.05 - t * 0.8);
        let g = 0;
        if (cur) {
          const d = Math.hypot(x - cur.x, y - cur.y);
          if (d < 240) { const b = 1 - d / 240; v += b * 3; g = b * b; }
        }
        const i = Math.max(0, Math.min(CH.length - 1, Math.floor(((v + 2) / 5.5) * CH.length)));
        ctx.globalAlpha = Math.min(1, 0.1 + i * 0.03 + g * 0.75);
        ctx.fillStyle = g > 0.02 ? "#2dd4bf" : "#ffffff";
        ctx.fillText(CH[i], x, y);
      }
    }
  };
  requestAnimationFrame(draw);

  // Languages: hover backspaces the English name, then types it in its own script
  const seg = typeof Intl.Segmenter === "function" ? new Intl.Segmenter() : null;
  const glyphs = (t) => (seg ? [...seg.segment(t)].map((g) => g.segment) : [...t]);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  document.querySelectorAll(".lw").forEach((el) => {
    const roman = el.textContent, native = el.dataset.native;
    if (native === roman) return;
    let run = 0;
    const morph = async (to) => {
      const id = ++run;
      el.classList.add("typing");
      let cur = glyphs(el.textContent);
      while (cur.length) {
        cur.pop(); el.textContent = cur.join("");
        await wait(55); if (id !== run) return;
      }
      await wait(160); if (id !== run) return;
      const out = glyphs(to);
      for (let i = 1; i <= out.length; i++) {
        el.textContent = out.slice(0, i).join("");
        await wait(90); if (id !== run) return;
      }
      el.classList.remove("typing");
    };
    const li = el.parentElement;
    li.addEventListener("mouseenter", () => morph(native));
    li.addEventListener("mouseleave", () => morph(roman));
  });

  // Atless ship: 3D tilt that follows the cursor anywhere over the project row
  document.querySelectorAll(".p-ship").forEach((ship) => {
    const area = ship.closest(".project");
    const head = ship.closest(".p-head");
    const t = { x: 0, y: 0 }, c = { x: 0, y: 0 };
    let raf = 0;
    const tick = () => {
      c.x += (t.x - c.x) * 0.12;
      c.y += (t.y - c.y) * 0.12;
      ship.style.setProperty("--ry", `${c.x * 36}deg`);
      ship.style.setProperty("--rx", `${-c.y * 28}deg`);
      raf = Math.abs(t.x - c.x) + Math.abs(t.y - c.y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    area.addEventListener("pointermove", (e) => {
      const r = ship.getBoundingClientRect();
      t.x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      t.y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      head.classList.add("tilting");
      kick();
    });
    area.addEventListener("pointerleave", () => {
      t.x = 0; t.y = 0;
      head.classList.remove("tilting");
      kick();
    });
  });
})();
