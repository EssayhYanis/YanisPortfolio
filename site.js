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
  let ambience = null;
  let soundEnabled = false;

  const playTone = (startFrequency, endFrequency, duration, volume) => {
    if (!soundEnabled || !audioContext) return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  };

  const startAmbience = () => {
    const master = audioContext.createGain();
    master.gain.value = 0.012;
    master.connect(audioContext.destination);
    const tones = [65.41, 98, 130.81].map((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = index === 1 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 0 ? 0.42 : 0.18;
      oscillator.connect(gain).connect(master);
      oscillator.start();
      return oscillator;
    });
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.004;
    lfo.connect(lfoGain).connect(master.gain);
    lfo.start();
    ambience = { master, tones, lfo };
  };

  const stopAmbience = () => {
    if (!ambience) return;
    const stoppingAmbience = ambience;
    ambience = null;
    const now = audioContext.currentTime;
    stoppingAmbience.master.gain.cancelScheduledValues(now);
    stoppingAmbience.master.gain.setValueAtTime(
      stoppingAmbience.master.gain.value,
      now,
    );
    stoppingAmbience.master.gain.linearRampToValueAtTime(0, now + 0.18);
    window.setTimeout(() => {
      stoppingAmbience.tones.forEach((tone) => tone.stop());
      stoppingAmbience.lfo.stop();
    }, 220);
  };

  soundToggle.addEventListener("click", async () => {
    if (!audioContext)
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") await audioContext.resume();
    soundEnabled = !soundEnabled;
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.lastElementChild.textContent = soundEnabled
      ? "Sound on"
      : "Sound off";
    if (soundEnabled) {
      startAmbience();
      playTone(520, 760, 0.12, 0.025);
    } else {
      stopAmbience();
    }
  });

  document.addEventListener("click", (event) => {
    if (!soundEnabled || event.target.closest(".sound-toggle")) return;
    if (event.target.closest("a, button, summary"))
      playTone(340, 190, 0.09, 0.018);
  });
})();
