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
    ["projectUrl", "View project"],
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
})();
