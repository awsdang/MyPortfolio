(() => {
  "use strict";
  const links = [...document.querySelectorAll("[data-gallery] a[data-shot]")];
  if (!links.length || typeof HTMLDialogElement === "undefined") return;
  const dialog = document.createElement("dialog");
  dialog.className = "screen-viewer";
  dialog.setAttribute("aria-label", "Project screenshots");
  dialog.innerHTML = `<div class="viewer-toolbar"><span class="viewer-counter" aria-live="polite"></span><a class="viewer-original" target="_blank" rel="noopener">Open full image ↗</a><button type="button" class="viewer-close" aria-label="Close screenshots">Close ×</button></div><div class="viewer-stage"><img alt="" /></div><div class="viewer-bottom"><button type="button" class="viewer-prev" aria-label="Previous screenshot">←</button><div class="viewer-copy"><h2></h2><p></p></div><button type="button" class="viewer-next" aria-label="Next screenshot">→</button></div>`;
  document.body.append(dialog);
  const image = dialog.querySelector("img");
  let group = [],
    current = 0,
    opener,
    previousOverflow;
  function render() {
    const link = group[current];
    image.src = link.href;
    image.alt = link.querySelector("img").alt;
    dialog.querySelector("h2").textContent = link.dataset.title;
    dialog.querySelector(".viewer-copy p").textContent = link.dataset.caption;
    dialog.querySelector(".viewer-counter").textContent =
      `${current + 1} / ${group.length}`;
    dialog.querySelector(".viewer-original").href = link.href;
    dialog.querySelector(".viewer-stage").scrollTop = 0;
  }
  function move(direction) {
    current = (current + direction + group.length) % group.length;
    render();
  }
  links.forEach((link) => {
    link.setAttribute("aria-haspopup", "dialog");
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      opener = link;
      group = [
        ...link.closest("[data-gallery]").querySelectorAll("a[data-shot]"),
      ];
      current = group.indexOf(link);
      previousOverflow = document.body.style.overflow;
      render();
      dialog.showModal();
      document.body.style.overflow = "hidden";
      dialog.querySelector(".viewer-close").focus();
    });
  });
  dialog
    .querySelector(".viewer-close")
    .addEventListener("click", () => dialog.close());
  dialog
    .querySelector(".viewer-prev")
    .addEventListener("click", () => move(-1));
  dialog.querySelector(".viewer-next").addEventListener("click", () => move(1));
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.style.overflow = previousOverflow || "";
    image.removeAttribute("src");
    opener?.focus();
  });
})();
