// ===== Base UI =====
document.getElementById("year").textContent = new Date().getFullYear();

const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");

if (burger && mobileMenu) {
  burger.addEventListener("click", () => {
    const isOpen = !mobileMenu.classList.toggle("hidden");
    burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

const bar = document.getElementById("readProgress");
if (bar) {
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? (h.scrollTop / max) * 100 : 0;
    bar.style.width = `${p}%`;
  });
}

// ===== Qualification Tabs =====
document.addEventListener("DOMContentLoaded", () => {
  const wrap = document.getElementById("qual-panels-wrap");
  const exp = document.getElementById("qual-experience");
  const edu = document.getElementById("qual-education");
  const tabs = Array.from(document.querySelectorAll(".qual-tab"));

  if (!wrap || !exp || !edu || tabs.length === 0) return;

  const setTabStyles = (activeName) => {
    tabs.forEach((btn) => {
      const isActive = btn.dataset.tab === activeName;
      btn.setAttribute("aria-selected", isActive ? "true" : "false");

      btn.classList.toggle("bg-ink/90", isActive);
      btn.classList.toggle("text-white/95", isActive);
      btn.classList.toggle("shadow-soft", isActive);

      btn.classList.toggle("bg-white/10", !isActive);
      btn.classList.toggle("text-ink", !isActive);

      btn.classList.toggle("hover:bg-ink", isActive);
      btn.classList.toggle("hover:bg-white/20", !isActive);
    });
  };

  const showPanel = (name) => {
    const isExp = name === "experience";
    exp.classList.toggle("hidden", !isExp);
    edu.classList.toggle("hidden", isExp);
    setTabStyles(name);
  };

  const lockHeight = () => {
    const expWasHidden = exp.classList.contains("hidden");
    const eduWasHidden = edu.classList.contains("hidden");

    exp.classList.remove("hidden");
    edu.classList.remove("hidden");

    const maxH = Math.max(exp.scrollHeight, edu.scrollHeight);
    wrap.style.minHeight = `${maxH}px`;

    if (expWasHidden) exp.classList.add("hidden");
    if (eduWasHidden) edu.classList.add("hidden");
  };

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab || "experience";
      showPanel(tab);
      requestAnimationFrame(lockHeight);
    });
  });

  showPanel("experience");
  requestAnimationFrame(lockHeight);
  window.addEventListener("resize", () => requestAnimationFrame(lockHeight));
  window.addEventListener("load", () => requestAnimationFrame(lockHeight));
});

// ===== Contact Form  =====
const form = document.getElementById("contactForm");
const note = document.getElementById("formNote");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (note) note.textContent = "Thanks! This form is demo-only (no backend yet).";
    form.reset();
  });
}
