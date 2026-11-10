(() => {
  const d = window.PORTFOLIO;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  $("tagline").textContent = d.tagline;
  $("about-text").textContent = d.about;
  $("stats").innerHTML = d.stats.map((s) => `<li><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></li>`).join("");
  const m = d.marquee.map((t) => `<span>${esc(t)}</span><i>✦</i>`).join("");
  $("marquee").innerHTML = m + m;

  $("experience-list").innerHTML = d.experience.map((e) => `
    <li class="reveal">
      <span class="mono period">${esc(e.period)}</span>
      <div>
        <h3>${esc(e.role)} <span class="at">@ ${esc(e.company)}</span></h3>
        <ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
      </div>
    </li>`).join("");

  $("project-list").innerHTML = d.projects.map((p, i) => `
    <a class="card reveal" href="${esc(p.link)}" target="_blank" rel="noopener">
      <span class="mono num">0${i + 1}</span>
      <h3>${esc(p.title)} <span class="arrow">↗</span></h3>
      <p>${esc(p.desc)}</p>
      <div class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
    </a>`).join("");

  $("skills").innerHTML = d.skills.map((s) => `<li>${esc(s)}</li>`).join("");
  $("education").innerHTML = d.education.map((e) => `
    <li><h3>${esc(e.degree)}</h3><p>${esc(e.school)}</p><span class="mono">${esc(e.period)}</span></li>`).join("");
  $("contact-links").innerHTML = d.contact.map((c, i) =>
    `<a class="btn${i ? " ghost" : ""}" href="${esc(c.href)}" target="_blank" rel="noopener">${esc(c.label)} ↗</a>`).join("");
  $("year").textContent = new Date().getFullYear();

  // reveal on scroll
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll(".reveal, .section").forEach((el) => io.observe(el));

  // cursor glow
  const g = document.querySelector(".cursor-glow");
  window.addEventListener("pointermove", (e) => {
    g.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
  });
})();
