(() => {
  "use strict";
  const slot = document.querySelector("[data-intro-media]");
  if (!slot) return;
  const fallback = slot.querySelector("[data-intro-fallback]");
  fetch("assets/media/intro.json")
    .then((response) => (response.ok ? response.json() : null))
    .then((config) => {
      if (!config?.src) return;
      const video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      if (config.poster) video.poster = config.poster;
      video.setAttribute("aria-label", "Aws talks about his work");
      for (const track of config.tracks || []) {
        const element = document.createElement("track");
        element.kind = "captions";
        element.src = track.src;
        element.srclang = track.language;
        element.label = track.label;
        element.default = Boolean(track.default);
        video.append(element);
      }
      video.src = config.src;
      video.addEventListener("error", () => {
        video.remove();
        if (fallback) fallback.hidden = false;
        document.querySelector("[data-intro-label]").textContent =
          "THE PERSON BEHIND THE PRODUCTS";
      });
      slot.append(video);
      if (fallback) fallback.hidden = true;
      document.querySelector("[data-intro-label]").textContent =
        "IN MY OWN WORDS · PRESS PLAY";
    })
    .catch(() => {});
})();
