// ===== Base UI + Animations =====
(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      const isOpen = !mobileMenu.classList.toggle("hidden");
      burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    mobileMenu.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      mobileMenu.classList.add("hidden");
      burger.setAttribute("aria-expanded", "false");
    });
  }

  const bar = document.getElementById("readProgress");
  if (bar) {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = `${p}%`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const initScrollReveal = () => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (els.length === 0) return;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        });
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    els.forEach((el) => io.observe(el));
  };

  // ===== Qualification Tabs =====
  const initQualificationTabs = () => {
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
        if (isActive) {
          btn.classList.add("hover:bg-ink");
          btn.classList.remove("hover:bg-white/20");
        } else {
          btn.classList.add("hover:bg-white/20");
          btn.classList.remove("hover:bg-ink");
        }
      });
    };

    let current = "experience";
    let busy = false;

    const showPanel = (name) => {
      if (name === current || busy) return;
      busy = true;
      setTabStyles(name);

      const fromEl = name === "experience" ? edu : exp;
      const toEl   = name === "experience" ? exp : edu;

      if (prefersReduced) {
        fromEl.classList.add("hidden");
        toEl.classList.remove("hidden");
        current = name;
        busy = false;
        return;
      }

      fromEl.classList.add("is-fading");
      setTimeout(() => {
        fromEl.classList.add("hidden");
        fromEl.classList.remove("is-fading");

        toEl.classList.add("is-fading");
        toEl.classList.remove("hidden");

        requestAnimationFrame(() => requestAnimationFrame(() => {
          toEl.classList.remove("is-fading");
          current = name;
          busy = false;
        }));
      }, 220);
    };

    tabs.forEach((btn) => {
      btn.addEventListener("click", () => showPanel(btn.dataset.tab || "experience"));
    });

    setTabStyles("experience");
    edu.classList.add("hidden");
    exp.classList.remove("hidden");
  };

  // ===== Featured Projects (coverflow carousel) =====
  // Add a project by appending an object here — the cards, counter,
  // dashes, and info panel are all generated from this array.
  const PROJECTS = [
    {
      title: "雪峰 Yukimine Sake",
      image: "Resources/Yukimine.png",
      description:
        "A premium Japanese sake brand site drawing inspiration from Japanese craftsmanship, winter brewing, and mountain purity.",
      code: "https://github.com/GarenceWong/Yukimine",
      demo: "https://garencewong.github.io/Yukimine/"
    },
    {
      title: "PokeGuesser",
      image: "Resources/PokeGuesser.png",
      description:
        "A Pokémon guessing game where players identify Pokémon from silhouettes. Test your Pokédex knowledge across all generations with score tracking and hints.",
      code: "https://github.com/GarenceWong/PokeGuesser",
      demo: "https://garencewong.github.io/PokeGuesser/"
    },
    {
      title: "Witch Hat Battle",
      image: "Resources/WitchHatBattle.png",
      description:
        "A fan-made, browser-based spell-drawing battle game inspired by the anime Witch Hat Atelier. Draw magical sigils on a canvas to cast spells, just like the apprentice witches of the atelier.",
      code: "https://github.com/GarenceWong/Witch-Hat-Battle",
      demo: "https://witchhatbattle.vercel.app/"
    }
  ];

  const GH_PATH =
    "M12 .8a11.3 11.3 0 0 0-3.6 22c.6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.4-1.2-1.8-1.2-1.8-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.8.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.2 11.2 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.2 0 4.6-2.7 5.6-5.3 5.9.4.3.8 1 .8 2.1v3.1c0 .3.2.7.8.6A11.3 11.3 0 0 0 12 .8z";
  const EXT_PATH =
    "M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z";

  const initProjects = () => {
    const stage = document.getElementById("cfStage");
    const dotsWrap = document.getElementById("cfDots");
    const prev = document.getElementById("cfPrev");
    const next = document.getElementById("cfNext");
    if (!stage || !dotsWrap || !prev || !next) return;

    const N = PROJECTS.length;
    let active = 0;

    stage.innerHTML = PROJECTS.map((p, i) => `
      <article class="cf-card flex flex-col gap-4 p-5 rounded-xl2 border border-ink/10 bg-white/20 shadow-soft"
               data-index="${i}" tabindex="0" role="group" aria-label="${p.title}">
        <div class="h-52 md:h-60 rounded-2xl border border-ink/10 overflow-hidden bg-white/10">
          <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover" />
        </div>
        <h3 class="font-black text-lg truncate">${p.title}</h3>
        <p class="text-ink/65 line-clamp-3">${p.description}</p>
        <div class="flex items-center gap-4 pt-1 mt-auto">
          <a href="${p.code}" target="_blank" rel="noopener"
             class="inline-flex items-center gap-2 font-extrabold text-ink/70 hover:text-ink/90 transition">
            <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current" aria-hidden="true"><path d="${GH_PATH}"/></svg>
            <span>Code</span>
          </a>
          <a href="${p.demo}" target="_blank" rel="noopener"
             class="inline-flex items-center gap-2 font-extrabold text-ink/70 hover:text-ink/90 transition">
            <svg viewBox="0 0 24 24" class="w-5 h-5 fill-none" aria-hidden="true">
              <path d="${EXT_PATH}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Live Demo</span>
          </a>
        </div>
      </article>`).join("");

    dotsWrap.innerHTML = PROJECTS.map((_, i) =>
      `<button type="button" class="cf-dash" data-dot="${i}" aria-label="Go to project ${i + 1}"></button>`
    ).join("");

    const cards = Array.from(stage.children);
    const dashes = Array.from(dotsWrap.children);

    // Circular offset so both sides always show a card.
    const offsetOf = (i) => {
      let o = i - active;
      if (o > N / 2) o -= N;
      if (o < -N / 2) o += N;
      return o;
    };

    const render = () => {
      const w = cards[0] ? cards[0].offsetWidth : 320;
      const shift = w * 0.98;

      cards.forEach((c, i) => {
        const o = offsetOf(i);
        const abs = Math.abs(o);
        let scale = 0.66;
        let opacity = 0;
        let tx = o * shift * 1.4;
        if (o === 0) { scale = 1; opacity = 1; tx = 0; }
        else if (abs === 1) { scale = 0.78; opacity = 0.3; tx = o * shift; }

        c.style.transform = `translateX(${tx}px) scale(${scale})`;
        c.style.opacity = opacity;
        c.style.pointerEvents = abs >= 2 ? "none" : "auto";
        c.setAttribute("aria-hidden", abs >= 2 ? "true" : "false");
        c.classList.toggle("is-active", o === 0);
        c.classList.toggle("is-side", abs === 1);
        c.classList.toggle("is-hiddenside", abs >= 2);
      });

      dashes.forEach((d, i) => d.classList.toggle("is-on", i === active));
    };

    const go = (i) => { active = ((i % N) + N) % N; render(); };

    prev.addEventListener("click", () => go(active - 1));
    next.addEventListener("click", () => go(active + 1));
    dashes.forEach((d, i) => d.addEventListener("click", () => go(i)));
    cards.forEach((c, i) => {
      c.addEventListener("click", () => { if (offsetOf(i) !== 0) go(i); });
      c.addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === " ") && offsetOf(i) !== 0) { e.preventDefault(); go(i); }
      });
    });

    window.addEventListener("resize", render);
    window.addEventListener("load", render);
    render();
  };

  // ===== Contact Form (Web3Forms) =====
  const initContactForm = () => {
    const form = document.getElementById("contactForm");
    const note = document.getElementById("formNote");
    const btn = document.getElementById("contactSubmit");
    const btnText = document.getElementById("contactSubmitText");

    if (!form) return;

    const setNote = (msg, ok) => {
      if (!note) return;
      note.textContent = msg;
      note.classList.toggle("text-clay", ok === false);
      note.classList.toggle("text-ink/60", ok !== false);
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = new FormData(form);
      if (data.get("access_key") === "YOUR_ACCESS_KEY_HERE") {
        setNote("Form isn't configured yet — add your Web3Forms access key.", false);
        return;
      }

      if (btn) btn.disabled = true;
      const originalText = btnText ? btnText.textContent : "";
      if (btnText) btnText.textContent = "Sending…";
      setNote("", true);

      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data
        });
        const result = await res.json();

        if (res.ok && result.success) {
          setNote("Thanks! Your message has been sent — I'll get back to you soon.", true);
          form.reset();
        } else {
          setNote(result.message || "Something went wrong. Please try again or email me directly.", false);
        }
      } catch (err) {
        setNote("Network error. Please try again or email me directly.", false);
      } finally {
        if (btn) btn.disabled = false;
        if (btnText) btnText.textContent = originalText;
      }
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initScrollReveal();
    initProjects();
    initQualificationTabs();
    initContactForm();
  });
})();