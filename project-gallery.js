(() => {
  "use strict";

  window.renderCollegeGallery = () => {
    const gallery = document.querySelector("#college-media-grid");
    const emptyState = document.querySelector("#college-media-empty");
    const items = Array.isArray(window.COLLEGE_MEDIA)
      ? window.COLLEGE_MEDIA
      : [];

    if (!gallery || !items.length) return;

    const safeAsset = (value) =>
      typeof value === "string" &&
      value.startsWith("assets/college-work/") &&
      !value.includes("..") &&
      !value.includes("\\")
        ? value
        : null;

    const cards = items.flatMap((item) => {
      const source = safeAsset(item.src);
      if (!source || !item.title || !["image", "video"].includes(item.type)) {
        return [];
      }

      const card = document.createElement("article");
      card.className = "media-card";

      const frame = document.createElement("div");
      frame.className = "media-frame";

      if (item.type === "video") {
        const video = document.createElement("video");
        video.src = source;
        video.controls = true;
        video.preload = "metadata";
        video.playsInline = true;
        const poster = safeAsset(item.poster);
        if (poster) video.poster = poster;
        frame.append(video);
      } else {
        const link = document.createElement("a");
        link.href = source;
        link.setAttribute("aria-label", `Open ${item.title}`);
        const image = document.createElement("img");
        image.src = source;
        image.alt = item.alt || item.title;
        image.loading = "lazy";
        link.append(image);
        frame.append(link);
      }

      const copy = document.createElement("div");
      copy.className = "media-card-copy";

      const meta = document.createElement("p");
      meta.className = "eyebrow";
      meta.textContent = [item.course, item.year].filter(Boolean).join(" / ");

      const title = document.createElement("h3");
      title.textContent = item.title;
      copy.append(meta, title);

      if (item.description) {
        const description = document.createElement("p");
        description.textContent = item.description;
        copy.append(description);
      }

      card.append(frame, copy);
      return [card];
    });

    if (!cards.length) return;

    gallery.replaceChildren(...cards);
    emptyState?.remove();
  };

  window.renderCollegeGallery();
})();
