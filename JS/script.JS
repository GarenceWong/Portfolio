// progress bar
const progress = document.getElementById("readProgress");
window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  progress.style.width = `${scrolled}%`;
});

// year
document.getElementById("year").textContent = new Date().getFullYear();

// mobile menu
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");

if (burger && mobileMenu) {
  burger.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("hidden") === false;
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // close on link click
  mobileMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      burger.setAttribute("aria-expanded", "false");
    });
  });
}

// fake contact submit
const form = document.getElementById("contactForm");
const note = document.getElementById("formNote");
if (form && note) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    note.textContent = "Thanks! (Demo only — no backend connected yet.)";
    form.reset();
  });
}
