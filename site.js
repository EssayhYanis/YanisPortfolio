(() => {
  "use strict";
  const profile = window.PORTFOLIO || {};
  if (profile.name && profile.name.trim()) {
    document.querySelectorAll("[data-name]").forEach((node) => {
      node.textContent = profile.name.trim();
    });
    document.title =
      document.body.dataset.page === "Home"
        ? `${profile.name.trim()} · Game Developer`
        : `${document.body.dataset.page || "Portfolio"} · ${profile.name.trim()}`;
  }
  const safeLink = (value, allowLocal = false) => {
    if (typeof value !== "string" || !value.trim()) return null;
    const input = value.trim();
    if (
      allowLocal &&
      !/^[a-z][a-z\d+.-]*:/i.test(input) &&
      !input.startsWith("//") &&
      !input.startsWith("/") &&
      !input.includes("..") &&
      !input.includes("\\")
    )
      return input;
    try {
      const url = new URL(input);
      return url.protocol === "https:" || url.protocol === "http:"
        ? url.href
        : null;
    } catch {
      return null;
    }
  };
  const makeLink = (label, href) => {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    const arrow = document.createElement("span");
    arrow.textContent = "↗";
    arrow.setAttribute("aria-hidden", "true");
    link.append(arrow);
    return link;
  };
  const contacts = document.querySelector("#contact-links");
  const links = [];
  if (
    typeof profile.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)
  )
    links.push([
      "Email",
      `mailto:${encodeURIComponent(profile.email).replace("%40", "@")}`,
    ]);
  for (const [key, label] of [
    ["resume", "Résumé"],
    ["github", "GitHub"],
    ["linkedin", "LinkedIn"],
    ["youtube", "YouTube"],
    ["itch", "itch.io"],
  ]) {
    const href = safeLink(profile[key], key === "resume");
    if (href) links.push([label, href]);
  }
  if (contacts && links.length) {
    contacts.replaceChildren(
      ...links.map(([label, href]) => makeLink(label, href)),
    );
  }
  const capstone = profile.capstone || {};
  const projectLinks = document.querySelector("#capstone-links");
  for (const [key, label] of [
    ["projectUrl", "View on Steam"],
    ["videoUrl", "Watch gameplay"],
  ]) {
    const href = safeLink(capstone[key]);
    if (href && projectLinks) {
      const link = makeLink(label, href);
      link.className = "button";
      projectLinks.append(link);
      projectLinks.hidden = false;
    }
  }
  const imageUrl = safeLink(capstone.image, true);
  if (
    imageUrl &&
    capstone.imageAlt &&
    document.querySelector("#capstone-image")
  ) {
    const image = document.querySelector("#capstone-image");
    image.addEventListener("load", () => {
      document.querySelector("#capstone-media").hidden = false;
    });
    image.src = imageUrl;
    image.alt = capstone.imageAlt;
    document.querySelector("#capstone-caption").textContent =
      capstone.imageCaption || "";
  }
  const portrait = profile.portrait || {};
  const portraitImage = document.querySelector("#portrait-image");
  const portraitUrl = safeLink(portrait.image, true);
  if (portraitImage && portraitUrl && portrait.alt) {
    portraitImage.addEventListener("load", () => {
      document.querySelector("#portrait").hidden = false;
    });
    portraitImage.src = portraitUrl;
    portraitImage.alt = portrait.alt;
    document.querySelector("#portrait-caption").textContent =
      portrait.caption || "";
  }
  // Preserve links shared before the site was split into separate pages.
  if (document.body.dataset.page === "Home") {
    const target = location.hash.slice(1);
    const routes = {
      about: "about.html",
      skills: "about.html#skills",
      contact: "contact.html",
      projects: "projects.html",
      "blood-and-lineage": "projects.html#blood-and-lineage",
      networking: "projects.html#networking",
      programming: "projects.html#programming",
      "design-art": "projects.html#design-art",
    };
    if (routes[target]) location.replace(routes[target]);
  }

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (!reducedMotion && finePointer) {
    const canvas = document.createElement("canvas");
    canvas.className = "ambient-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    const context = canvas.getContext("2d");
    const pointer = { x: 0, y: 0, active: false };
    const particles = [];
    const ripples = [];
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const resetCanvas = () => {
      width = document.documentElement.clientWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      particles.length = 0;
      const count = Math.min(54, Math.max(28, Math.round(width / 28)));
      for (let index = 0; index < count; index += 1) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        particles.push({
          x,
          y,
          homeX: x,
          homeY: y,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          size: Math.random() * 1.3 + 0.7,
          color: Math.random() > 0.72 ? "92, 207, 191" : "241, 145, 99",
        });
      }
    };

    const drawFrame = () => {
      context.clearRect(0, 0, width, height);

      if (pointer.active) {
        const glow = context.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          170,
        );
        glow.addColorStop(0, "rgba(241, 145, 99, 0.09)");
        glow.addColorStop(1, "rgba(241, 145, 99, 0)");
        context.fillStyle = glow;
        context.fillRect(pointer.x - 170, pointer.y - 170, 340, 340);
      }

      particles.forEach((particle, index) => {
        if (pointer.active) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < 135) {
            const force = (135 - distance) / 135;
            particle.vx += (dx / distance) * force * 0.16;
            particle.vy += (dy / distance) * force * 0.16;
          }
        }

        particle.vx += (particle.homeX - particle.x) * 0.00015;
        particle.vy += (particle.homeY - particle.y) * 0.00015;
        particle.vx *= 0.982;
        particle.vy *= 0.982;
        particle.x += particle.vx;
        particle.y += particle.vy;

        context.beginPath();
        context.fillStyle = `rgba(${particle.color}, 0.24)`;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();

        for (let next = index + 1; next < particles.length; next += 1) {
          const other = particles[next];
          const distance = Math.hypot(
            particle.x - other.x,
            particle.y - other.y,
          );
          if (distance < 95) {
            context.beginPath();
            context.strokeStyle = `rgba(170, 180, 192, ${
              (1 - distance / 95) * 0.07
            })`;
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }
      });

      for (let index = ripples.length - 1; index >= 0; index -= 1) {
        const ripple = ripples[index];
        ripple.radius += 2.2;
        ripple.alpha -= 0.018;
        context.beginPath();
        context.strokeStyle = `rgba(241, 145, 99, ${ripple.alpha})`;
        context.lineWidth = 1;
        context.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        context.stroke();
        if (ripple.alpha <= 0) ripples.splice(index, 1);
      }

      window.requestAnimationFrame(drawFrame);
    };

    window.addEventListener("resize", resetCanvas, { passive: true });
    window.addEventListener(
      "pointermove",
      (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      },
      { passive: true },
    );
    document.documentElement.addEventListener("mouseleave", () => {
      pointer.active = false;
    });
    window.addEventListener("pointerdown", (event) => {
      if (event.button === 0)
        ripples.push({
          x: event.clientX,
          y: event.clientY,
          radius: 8,
          alpha: 0.34,
        });
    });
    resetCanvas();
    drawFrame();
  }

  const soundToggle = document.createElement("button");
  soundToggle.className = "sound-toggle";
  soundToggle.type = "button";
  soundToggle.setAttribute("aria-pressed", "false");
  soundToggle.innerHTML =
    '<span class="sound-toggle-icon" aria-hidden="true">♪</span><span>Sound off</span>';
  document.body.append(soundToggle);

  let audioContext = null;
  let music = null;
  let soundEnabled = localStorage.getItem("portfolioSound") === "on";
  const audioSessionId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const updateSoundToggle = () => {
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.lastElementChild.textContent = soundEnabled
      ? "Sound on"
      : "Sound off";
  };

  const playTone = (startFrequency, endFrequency, duration, volume) => {
    if (!soundEnabled || !audioContext) return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      endFrequency,
      now + duration,
    );
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  };

  const midiToFrequency = (note) => 440 * 2 ** ((note - 69) / 12);

  const startMusic = () => {
    if (music || !audioContext || audioContext.state !== "running") return;
    soundToggle.dataset.audioSession = audioSessionId;
    const master = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const delay = audioContext.createDelay(1);
    const feedback = audioContext.createGain();
    master.gain.value = 0.15;
    filter.type = "lowpass";
    filter.frequency.value = 1700;
    filter.Q.value = 0.45;
    delay.delayTime.value = 0.24;
    feedback.gain.value = 0.17;
    master.connect(filter).connect(audioContext.destination);
    filter.connect(delay).connect(feedback).connect(delay);
    delay.connect(audioContext.destination);

    const playMusicVoice = (
      note,
      duration,
      volume,
      type = "sine",
      delayAmount = 0,
    ) => {
      if (!soundEnabled || audioContext.state !== "running") return;
      const now = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.value = midiToFrequency(note);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain).connect(master);
      if (delayAmount) {
        const delaySend = audioContext.createGain();
        delaySend.gain.value = delayAmount;
        gain.connect(delaySend).connect(delay);
      }
      oscillator.start(now);
      oscillator.stop(now + duration + 0.05);
    };

    const progression = [
      [60, 64, 67, 71],
      [57, 60, 64, 67],
      [53, 57, 60, 64],
      [55, 59, 62, 64],
    ];
    let step = 0;
    const playStep = () => {
      const chord = progression[Math.floor(step / 4) % progression.length];
      const chordStep = step % 4;
      if (chordStep === 0) {
        playMusicVoice(chord[0] - 12, 3.3, 0.032, "sine");
        playMusicVoice(chord[2] - 12, 3.1, 0.012, "triangle");
      }
      playMusicVoice(chord[chordStep], 1.45, 0.07, "sine", 0.4);
      if (chordStep === 2)
        playMusicVoice(chord[1] + 12, 1.05, 0.018, "sine", 0.25);
      step += 1;
      soundToggle.dataset.musicStep = String(step);
    };
    playStep();
    const timer = window.setInterval(playStep, 920);
    music = { master, timer };
  };

  const stopMusic = () => {
    if (!music || !audioContext) return;
    const stoppingMusic = music;
    music = null;
    window.clearInterval(stoppingMusic.timer);
    const now = audioContext.currentTime;
    stoppingMusic.master.gain.cancelScheduledValues(now);
    stoppingMusic.master.gain.setValueAtTime(
      stoppingMusic.master.gain.value,
      now,
    );
    stoppingMusic.master.gain.linearRampToValueAtTime(0, now + 0.3);
    window.setTimeout(() => stoppingMusic.master.disconnect(), 380);
  };

  const ensureSound = async () => {
    if (!audioContext)
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") await audioContext.resume();
    if (soundEnabled) startMusic();
  };

  soundToggle.addEventListener("click", async () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("portfolioSound", soundEnabled ? "on" : "off");
    updateSoundToggle();
    if (soundEnabled) {
      await ensureSound();
      playTone(520, 760, 0.12, 0.025);
    } else {
      stopMusic();
    }
  });

  const loadScript = (source) =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = source;
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", reject, { once: true });
      document.head.append(script);
    });

  const prepareProjectGallery = async () => {
    if (!document.querySelector("#college-media-grid")) return;
    if (!Array.isArray(window.COLLEGE_MEDIA))
      await loadScript("project-media.js?v=20261012-2");
    if (typeof window.renderCollegeGallery !== "function")
      await loadScript("project-gallery.js?v=20261012-2");
    window.renderCollegeGallery?.();
  };

  const hydrateRoutedPage = async () => {
    document.querySelectorAll("[data-name]").forEach((node) => {
      node.textContent = profile.name?.trim() || "Yanis Essayh";
    });

    const routedContacts = document.querySelector("#contact-links");
    if (routedContacts && links.length)
      routedContacts.replaceChildren(
        ...links.map(([label, href]) => makeLink(label, href)),
      );

    const routedProjectLinks = document.querySelector("#capstone-links");
    if (routedProjectLinks) {
      for (const [key, label] of [
        ["projectUrl", "View on Steam"],
        ["videoUrl", "Watch gameplay"],
      ]) {
        const href = safeLink(capstone[key]);
        if (!href) continue;
        const link = makeLink(label, href);
        link.className = "button";
        routedProjectLinks.append(link);
        routedProjectLinks.hidden = false;
      }
    }

    const routedCapstoneImage = document.querySelector("#capstone-image");
    if (routedCapstoneImage && imageUrl && capstone.imageAlt) {
      const revealCapstone = () => {
        document.querySelector("#capstone-media")?.removeAttribute("hidden");
      };
      routedCapstoneImage.addEventListener("load", revealCapstone, {
        once: true,
      });
      routedCapstoneImage.src = imageUrl;
      routedCapstoneImage.alt = capstone.imageAlt;
      document.querySelector("#capstone-caption").textContent =
        capstone.imageCaption || "";
      if (routedCapstoneImage.complete) revealCapstone();
    }

    const routedPortrait = document.querySelector("#portrait-image");
    if (routedPortrait && portraitUrl && portrait.alt) {
      const revealPortrait = () => {
        document.querySelector("#portrait")?.removeAttribute("hidden");
      };
      routedPortrait.addEventListener("load", revealPortrait, { once: true });
      routedPortrait.src = portraitUrl;
      routedPortrait.alt = portrait.alt;
      document.querySelector("#portrait-caption").textContent =
        portrait.caption || "";
      if (routedPortrait.complete) revealPortrait();
    }

    await prepareProjectGallery();
  };

  const updateCurrentNavigation = (destination) => {
    document.querySelectorAll("nav a").forEach((link) => {
      const linkUrl = new URL(link.href, location.href);
      if (linkUrl.pathname === destination.pathname)
        link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };

  let routeInProgress = false;
  const navigateWithoutReload = async (href, pushHistory = true) => {
    if (routeInProgress) return;
    routeInProgress = true;
    const destination = new URL(href, location.href);
    try {
      const response = await fetch(destination.href, {
        headers: { "X-Portfolio-Navigation": "partial" },
      });
      if (!response.ok) throw new Error(`Navigation failed: ${response.status}`);
      const nextDocument = new DOMParser().parseFromString(
        await response.text(),
        "text/html",
      );
      const nextMain = nextDocument.querySelector("main");
      if (!nextMain) throw new Error("Navigation target has no main content");

      document.querySelector("main").replaceWith(nextMain);
      document.body.dataset.page = nextDocument.body.dataset.page || "";
      document.title = nextDocument.title;
      const nextDescription = nextDocument.querySelector(
        'meta[name="description"]',
      )?.content;
      if (nextDescription)
        document.querySelector('meta[name="description"]').content =
          nextDescription;
      updateCurrentNavigation(destination);
      if (pushHistory) history.pushState({}, "", destination.href);
      await hydrateRoutedPage();

      const target = destination.hash
        ? document.getElementById(decodeURIComponent(destination.hash.slice(1)))
        : null;
      if (target) target.scrollIntoView();
      else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch {
      location.assign(destination.href);
    } finally {
      routeInProgress = false;
    }
  };

  document.addEventListener("click", async (event) => {
    if (event.target.closest(".sound-toggle")) return;
    const control = event.target.closest("a, button, summary");
    if (!control) return;
    const link = control.closest("a[href]");
    const isRegularClick =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;
    const destination = link ? new URL(link.href, location.href) : null;
    const isInternalPage =
      destination &&
      destination.origin === location.origin &&
      destination.pathname !== location.pathname &&
      (destination.pathname.endsWith(".html") ||
        destination.pathname.endsWith("/")) &&
      !link.hasAttribute("download") &&
      link.target !== "_blank";

    if (isInternalPage && isRegularClick) event.preventDefault();
    if (soundEnabled && !link) {
      await ensureSound();
      playTone(340, 230, 0.07, 0.008);
    }
    if (isInternalPage && isRegularClick)
      navigateWithoutReload(destination.href);
  });

  window.addEventListener("popstate", () => {
    navigateWithoutReload(location.href, false);
  });

  updateSoundToggle();
  if (soundEnabled) {
    ensureSound().catch(() => {});
    window.addEventListener(
      "pointerdown",
      () => ensureSound().catch(() => {}),
      { once: true, capture: true },
    );
  }
})();
