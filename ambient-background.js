(() => {
  "use strict";

  const page = document.body.dataset.page;
  const scenes = {
    Home: [
      {
        source: "assets/dante-vs-vergil.webp",
        name: "dante",
      },
      {
        source: "assets/link-vs-ganondorf.webp",
        name: "zelda",
      },
    ],
    About: [
      {
        source: "assets/leon-bingo.webp",
        name: "leon",
      },
      {
        source: "assets/solid-snake.webp",
        name: "solid-snake",
      },
    ],
    Projects: [
      {
        source: "assets/maliketh.webp",
        name: "maliketh",
      },
      {
        source: "assets/monster-hunter-chase.webp",
        name: "hunter",
      },
    ],
    Contact: [
      { source: "assets/star-wars.webp", name: "star-wars" },
      { source: "assets/goku-vs-vegeta.webp", name: "goku" },
    ],
  };

  const pieces = scenes[page];
  if (!pieces) return;

  const stage = document.createElement("div");
  stage.className = "ambient-background";
  stage.setAttribute("aria-hidden", "true");
  document.body.prepend(stage);

  const particleLayout = [
    [7, 4, 17, -3, -18],
    [14, 6, 22, -11, 25],
    [23, 3, 15, -7, 12],
    [31, 5, 24, -16, -22],
    [42, 4, 19, -2, 18],
    [53, 7, 27, -20, -15],
    [61, 3, 16, -9, 20],
    [69, 5, 23, -14, -12],
    [78, 4, 18, -5, 22],
    [86, 6, 26, -18, -19],
    [94, 3, 20, -8, 14],
  ];

  particleLayout.forEach(([x, size, speed, delay, drift]) => {
    const particle = document.createElement("span");
    particle.className = "ambient-particle";
    particle.style.setProperty("--particle-x", `${x}%`);
    particle.style.setProperty("--particle-size", `${size}px`);
    particle.style.setProperty("--particle-speed", `${speed}s`);
    particle.style.setProperty("--particle-delay", `${delay}s`);
    particle.style.setProperty("--particle-drift", `${drift}px`);
    stage.append(particle);
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  pieces.forEach((piece, index) => {
    const role = index ? "secondary" : "primary";
    const className =
      `ambient-piece ambient-piece--${role} ambient-piece--${piece.name}`;

    const image = new Image();
    image.className = className;
    image.src = piece.source;
    image.alt = "";
    image.decoding = "async";
    stage.append(image);
  });

  let pointerFrame = 0;
  window.addEventListener(
    "pointermove",
    (event) => {
      if (reduceMotion.matches || pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        const x = ((event.clientX / innerWidth) - 0.5) * 18;
        const y = ((event.clientY / innerHeight) - 0.5) * 18;
        stage.style.setProperty("--pointer-x", `${x.toFixed(2)}px`);
        stage.style.setProperty("--pointer-y", `${y.toFixed(2)}px`);
        pointerFrame = 0;
      });
    },
    { passive: true },
  );

})();
