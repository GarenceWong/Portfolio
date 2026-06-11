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

  // ===== Fixed header — glass on scroll + scrollspy =====
  const initHeader = () => {
    const header = document.getElementById("siteHeader");
    if (header) {
      const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    // Scrollspy — highlight the nav link of the section in view.
    const links = Array.from(document.querySelectorAll("#navLinks .nav-link"));
    if (links.length === 0 || !("IntersectionObserver" in window)) return;

    const map = new Map();
    links.forEach((link) => {
      const sec = document.querySelector(link.getAttribute("href"));
      if (sec) map.set(sec, link);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) => l.classList.remove("is-active"));
          map.get(entry.target).classList.add("is-active");
        });
      },
      // A band around the middle of the viewport decides the active section.
      { rootMargin: "-35% 0px -55% 0px" }
    );
    map.forEach((_, sec) => io.observe(sec));
  };

  // ===== Smooth scroll for anchor links =====
  const initSmoothScroll = () => {
    const links = Array.from(document.querySelectorAll('a[href^="#"]'));
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        const target = id && id.length > 1 ? document.querySelector(id) : null;
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  // ===== Hero — typewriter reveal on the name =====
  // Types "Garence Wong" out character-by-character on load, with a
  // blinking cursor (a real element, see .type-cursor) that disappears
  // shortly after the name finishes typing.
  const initHeroNameTypewriter = () => {
    const nameEl = document.getElementById("heroName");
    if (!nameEl) return;

    const text = nameEl.textContent;
    nameEl.textContent = "";

    const textNode = document.createTextNode("");
    const cursor = document.createElement("span");
    cursor.className = "type-cursor";
    cursor.setAttribute("aria-hidden", "true");

    nameEl.appendChild(textNode);
    nameEl.appendChild(cursor);

    const TYPE_SPEED_MS = 90;
    const START_DELAY_MS = 350;

    setTimeout(() => {
      let i = 0;
      const timer = setInterval(() => {
        i += 1;
        textNode.nodeValue = text.slice(0, i);
        if (i >= text.length) {
          clearInterval(timer);
          setTimeout(() => cursor.remove(), 1200);
        }
      }, TYPE_SPEED_MS);
    }, START_DELAY_MS);
  };

  // ===== Hero — drifting sakura petals (cursor-reactive) =====
  // Each petal is wrapped in a .sakura-drift span: the inner petal runs the
  // sakuraFall animation while the wrapper takes a repel offset when the
  // cursor gets close, so falling and dodging never fight over transform.
  // The hero background also gets a soft mouse parallax here.
  const initSakuraPetals = () => {
    const hero = document.getElementById("home");
    if (!hero || hero.querySelector(".sakura-layer")) return;

    const layer = document.createElement("div");
    layer.className = "sakura-layer";
    layer.setAttribute("aria-hidden", "true");
    hero.appendChild(layer);

    const petals = [];
    const PETAL_COUNT = 14;
    for (let i = 0; i < PETAL_COUNT; i += 1) {
      const wrap = document.createElement("span");
      wrap.className = "sakura-drift";

      const petal = document.createElement("span");
      petal.className = "sakura-petal";

      const size = 11 + Math.random() * 11;     // 11–22px
      const duration = 9 + Math.random() * 8;   // 9–17s
      const delay = -Math.random() * duration;  // start mid-flight, not all at once
      const drift = 30 + Math.random() * 70;    // 30–100px sideways sway

      wrap.style.left = `${Math.random() * 100}%`;
      petal.style.width = `${size}px`;
      petal.style.height = `${size * 0.8}px`;
      petal.style.setProperty("--drift", `${drift}px`);
      petal.style.animationDuration = `${duration}s`;
      petal.style.animationDelay = `${delay}s`;

      wrap.appendChild(petal);
      layer.appendChild(wrap);
      petals.push({ wrap, petal });
    }

    if (prefersReduced || !window.matchMedia("(pointer:fine)").matches) return;

    const bg = document.getElementById("heroBg");
    const REPEL_RADIUS = 130;
    const REPEL_MAX = 56;

    let raf = 0;
    hero.addEventListener("mousemove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;

        petals.forEach(({ wrap, petal }) => {
          // The petal's rect reflects its mid-animation position.
          const r = petal.getBoundingClientRect();
          const dx = r.left + r.width / 2 - e.clientX;
          const dy = r.top + r.height / 2 - e.clientY;
          const dist = Math.hypot(dx, dy);

          if (dist < REPEL_RADIUS && dist > 0.01) {
            const push = (1 - dist / REPEL_RADIUS) * REPEL_MAX;
            wrap.style.transform =
              `translate(${((dx / dist) * push).toFixed(1)}px, ${((dy / dist) * push).toFixed(1)}px)`;
          } else if (wrap.style.transform) {
            wrap.style.transform = "";
          }
        });

        if (bg) {
          const relX = e.clientX / window.innerWidth - 0.5;
          const relY = e.clientY / window.innerHeight - 0.5;
          bg.style.transform =
            `translate3d(${(relX * -14).toFixed(1)}px, ${(relY * -10).toFixed(1)}px, 0) scale(1.05)`;
        }
      });
    });

    hero.addEventListener("mouseleave", () => {
      petals.forEach(({ wrap }) => { wrap.style.transform = ""; });
      if (bg) bg.style.transform = "";
    });
  };

  // ===== Staggered reveal — cascade a group's children into view =====
  const initStagger = () => {
    const groups = Array.from(document.querySelectorAll(".stagger"));
    if (groups.length === 0) return;

    groups.forEach((g) => {
      Array.from(g.children).forEach((child, i) => {
        child.style.setProperty("--d", `${Math.min(i, 6) * 90}ms`);
      });
    });

    if (prefersReduced || !("IntersectionObserver" in window)) {
      groups.forEach((g) => g.classList.add("is-in"));
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
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    groups.forEach((g) => io.observe(g));
  };

  // ===== Magnetic elements — pull gently toward the cursor =====
  const initMagnetic = () => {
    if (prefersReduced || !window.matchMedia("(pointer:fine)").matches) return;

    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${(x * 0.35).toFixed(1)}px, ${(y * 0.35).toFixed(1)}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  };

  // ===== Cursor ring — trailing accent that grows over interactive elements =====
  const initCursorRing = () => {
    if (prefersReduced || !window.matchMedia("(pointer:fine)").matches) return;

    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(ring);

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      ring.classList.add("is-visible");
    });
    document.addEventListener("mouseleave", () => ring.classList.remove("is-visible"));

    document.addEventListener("mouseover", (e) => {
      ring.classList.toggle("is-hover", !!e.target.closest("a, button"));
    });

    const follow = () => {
      // Lerp toward the cursor for the trailing feel.
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);
  };

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

  // ===== About — directional float reveal =====
  // Floats up into place when scrolled down to from the hero, and floats
  // down into place when scrolled back up to from Featured Projects.
  const initAboutFloat = () => {
    const about = document.getElementById("about");
    if (!about) return;

    if (!("IntersectionObserver" in window)) {
      about.classList.add("is-in");
      return;
    }

    let lastY = window.scrollY;
    let direction = "down";
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y !== lastY) direction = y > lastY ? "down" : "up";
        lastY = y;
      },
      { passive: true }
    );

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            about.classList.remove("is-in");
            return;
          }
          // Set the entry offset to match scroll direction, applying it
          // without a transition so the (invisible, opacity:0) jump isn't seen.
          about.style.transitionProperty = "none";
          about.style.setProperty("--float-from", direction === "down" ? "72px" : "-72px");
          void about.offsetHeight;
          about.style.transitionProperty = "";
          requestAnimationFrame(() => about.classList.add("is-in"));
        });
      },
      { root: null, threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    io.observe(about);
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
        btn.classList.toggle("bg-white", !isActive);
        btn.classList.toggle("text-ink", !isActive);
        if (isActive) {
          btn.classList.add("hover:bg-ink");
          btn.classList.remove("hover:bg-warm/20");
        } else {
          btn.classList.add("hover:bg-warm/20");
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
      demo: "https://pokeguesserr.vercel.app/"
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
      <article class="cf-card tilt-card flex flex-col gap-4 p-5 rounded-xl2 border border-ink/10 bg-white/20 shadow-soft"
               data-index="${i}" tabindex="0" role="group" aria-label="${p.title}">
        <div class="h-52 md:h-60 rounded-2xl border border-ink/10 overflow-hidden bg-white/10">
          <img src="${p.image}" alt="${p.title}" loading="lazy" decoding="async" class="w-full h-full object-cover" />
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

    // Arrow-key navigation while the carousel is on screen (and the user
    // isn't typing in the contact form).
    document.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.target.closest && e.target.closest("input, textarea, select")) return;
      const rect = stage.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      e.preventDefault();
      go(active + (e.key === "ArrowRight" ? 1 : -1));
    });

    // Touch swipe support — swipe left/right on the stage to move through projects.
    let touchStartX = 0;
    stage.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) go(active + 1);
        else go(active - 1);
      }
    });

    // 3D tilt on hover — composed on top of the carousel's own translateX/scale
    // transform (captured on enter) so the card keeps its carousel position.
    cards.forEach((c) => {
      let baseTransform = "";
      c.addEventListener("mouseenter", () => {
        baseTransform = c.style.transform || "";
      });
      c.addEventListener("mousemove", (e) => {
        const rect = c.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateY = relX * 12;
        const rotateX = relY * -12;
        c.style.transform = `${baseTransform} perspective(600px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      });
      c.addEventListener("mouseleave", () => {
        c.style.transform = baseTransform;
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
    initHeader();
    initSmoothScroll();
    initHeroNameTypewriter();
    initSakuraPetals();
    initScrollReveal();
    initStagger();
    initAboutFloat();
    initMagnetic();
    initCursorRing();
    initProjects();
    initQualificationTabs();
    initContactForm();
  });
})();