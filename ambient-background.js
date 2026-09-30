(() => {
  "use strict";

  const page = document.body.dataset.page;
  const scenes = {
    Home: [
      { type: "video", source: "assets/dante-vs-vergil.mp4", key: "white" },
      { type: "image", source: "assets/link-vs-ganondorf.webp" },
    ],
    About: [
      { type: "image", source: "assets/leon-bingo.webp" },
      { type: "image", source: "assets/link-vs-ganondorf.webp" },
    ],
    Projects: [
      { type: "image", source: "assets/maliketh.webp" },
      { type: "image", source: "assets/monster-hunter-chase.webp" },
    ],
    Contact: [
      { type: "video", source: "assets/dark-souls-sun-dance.mp4", key: "black" },
    ],
  };

  const pieces = scenes[page];
  if (!pieces) return;

  const stage = document.createElement("div");
  stage.className = "ambient-background";
  stage.setAttribute("aria-hidden", "true");
  document.body.prepend(stage);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  pieces.forEach((piece, index) => {
    const className = `ambient-piece ambient-piece--${index ? "secondary" : "primary"}`;

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
        video.play().catch(() => {});
        renderFrame();
      },
      { once: true },
    );

    function renderFrame() {
      if (video.readyState >= 2) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = context.getImageData(0, 0, canvas.width, canvas.height);
        removeFlatBackground(frame.data, piece.key);
        context.putImageData(frame, 0, 0);
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

  function removeFlatBackground(pixels, key) {
    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      let alpha;

      if (key === "white") {
        const darkest = Math.min(red, green, blue);
        const spread = Math.max(red, green, blue) - darkest;
        alpha = spread > 28 ? 255 : Math.min(255, Math.max(0, (242 - darkest) * 10));
      } else {
        const brightest = Math.max(red, green, blue);
        alpha = Math.min(255, Math.max(0, (brightest - 13) * 9));
      }

      pixels[index + 3] = alpha;
    }
  }
})();
