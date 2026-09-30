(() => {
  "use strict";

  const page = document.body.dataset.page;
  const scenes = {
    Home: [
      {
        type: "video",
        source: "assets/dante-vs-vergil.mp4",
        key: "white",
        name: "dante",
      },
      {
        type: "image",
        source: "assets/link-vs-ganondorf.webp",
        name: "zelda",
      },
    ],
    About: [
      {
        type: "image",
        source: "assets/leon-bingo.webp",
        name: "leon",
      },
      {
        type: "video",
        source: "assets/dark-souls-sun-dance.mp4",
        key: "black",
        name: "bonfire",
      },
    ],
    Projects: [
      {
        type: "image",
        source: "assets/maliketh.webp",
        name: "maliketh",
      },
      {
        type: "image",
        source: "assets/monster-hunter-chase.webp",
        name: "hunter",
      },
    ],
    Contact: [
      { type: "image", source: "assets/star-wars.webp", name: "star-wars" },
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

    if (piece.type === "image") {
      const image = new Image();
      image.className = className;
      image.src = piece.source;
      image.alt = "";
      image.decoding = "async";
      stage.append(image);
      return;
    }

    createKeyedVideo(stage, piece, className, reduceMotion);
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

  function createKeyedVideo(container, piece, className, motionQuery) {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    let connectedMask;
    let pixelQueue;
    let lastPaint = 0;

    canvas.className = className;
    video.src = piece.source;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "auto";
    video.tabIndex = -1;
    container.append(canvas);

    video.addEventListener(
      "loadedmetadata",
      () => {
        const scale = Math.min(1, 520 / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        connectedMask = new Uint8Array(canvas.width * canvas.height);
        pixelQueue = new Int32Array(canvas.width * canvas.height);
        video.play().catch(() => {});
        renderFrame();
      },
      { once: true },
    );

    function renderFrame(now = performance.now()) {
      if (video.readyState >= 2 && now - lastPaint >= 70) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = context.getImageData(0, 0, canvas.width, canvas.height);
        removeConnectedBackground(
          frame.data,
          canvas.width,
          canvas.height,
          piece.key,
          connectedMask,
          pixelQueue,
        );
        context.putImageData(frame, 0, 0);
        lastPaint = now;
      }

      if (motionQuery.matches) {
        video.pause();
        return;
      }

      if ("requestVideoFrameCallback" in video) {
        video.requestVideoFrameCallback(renderFrame);
      } else {
        requestAnimationFrame(renderFrame);
      }
    }
  }

  function removeConnectedBackground(
    pixels,
    width,
    height,
    key,
    mask,
    queue,
  ) {
    mask.fill(0);
    let head = 0;
    let tail = 0;

    const isBackground = (pixelIndex) => {
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const darkest = Math.min(red, green, blue);
      const brightest = Math.max(red, green, blue);
      const spread = brightest - darkest;

      return key === "white"
        ? darkest >= 135 && spread <= 70
        : brightest <= 78 && spread <= 48;
    };

    const enqueue = (pixelIndex) => {
      if (mask[pixelIndex] || !isBackground(pixelIndex)) return;
      mask[pixelIndex] = 1;
      queue[tail] = pixelIndex;
      tail += 1;
    };

    for (let x = 0; x < width; x += 1) {
      enqueue(x);
      enqueue((height - 1) * width + x);
    }
    for (let y = 0; y < height; y += 1) {
      enqueue(y * width);
      enqueue(y * width + width - 1);
    }

    while (head < tail) {
      const pixelIndex = queue[head];
      head += 1;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);

      if (x > 0) enqueue(pixelIndex - 1);
      if (x + 1 < width) enqueue(pixelIndex + 1);
      if (y > 0) enqueue(pixelIndex - width);
      if (y + 1 < height) enqueue(pixelIndex + width);
    }

    for (let pixelIndex = 0; pixelIndex < mask.length; pixelIndex += 1) {
      if (mask[pixelIndex]) pixels[pixelIndex * 4 + 3] = 0;
    }
  }
})();
