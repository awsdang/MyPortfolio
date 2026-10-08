(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Filters keep all project copy in the HTML, including without JavaScript.
  const projects = [...document.querySelectorAll(".project[data-category]")];
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      document
        .querySelectorAll("[data-filter]")
        .forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
      let count = 0;
      projects.forEach((project) => {
        const categories = project.dataset.category.split(" ");
        project.hidden = filter !== "all" && !categories.includes(filter);
        if (!project.hidden && !categories.includes("all")) count++;
      });
      $("#project-count").textContent =
        `SHOWING ${String(count).padStart(2, "0")} PROJECT${count === 1 ? "" : "S"}`;
    });
  });

  let arrangement = 0;
  $("#shuffle-desk").addEventListener("click", () => {
    arrangement++;
    const sets = [
      [-3, -5, 4],
      [5, 11, -9],
      [-8, 9, -5],
    ];
    const angles = sets[(arrangement - 1) % sets.length];
    [".architecture-scrap", ".tree-scrap", ".desk-note"].forEach(
      (selector, index) => {
        $(selector).style.transform = `rotate(${angles[index]}deg)`;
      },
    );
  });

  const imageDialog = $("#image-dialog");
  document.querySelectorAll("[data-image]").forEach((button) => {
    button.addEventListener("click", () => {
      $("#lightbox-image").src = button.dataset.image;
      $("#lightbox-image").alt = button.querySelector("img").alt;
      $("#image-caption").textContent = button.dataset.caption;
      $("#image-source").href = button.dataset.source;
      imageDialog.showModal();
    });
  });
  $("#open-credits").addEventListener("click", () =>
    $("#credits-dialog").showModal(),
  );
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog
      .querySelector(".dialog-close")
      .addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        dialog.close();
    });
    dialog.addEventListener("close", () => {
      if (![...document.querySelectorAll("dialog")].some((item) => item.open))
        document.body.style.overflow = "";
    });
    new MutationObserver(() => {
      if (dialog.open) document.body.style.overflow = "hidden";
    }).observe(dialog, { attributes: true, attributeFilter: ["open"] });
  });

  let copyTimer;
  $("#copy-email").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("awsdang@gmail.com");
      $("#copy-email").textContent = "Copied ✓";
      $("#copy-status").textContent = "Email address copied to clipboard.";
    } catch {
      $("#copy-email").textContent = "awsdang@gmail.com";
      $("#copy-status").textContent =
        "Copy unavailable. The email address is awsdang@gmail.com.";
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      $("#copy-email").textContent = "Copy email";
    }, 2600);
  });

  // This demonstrates queue behavior; it makes no network requests or performance claims.
  let pending = [];
  let delivered = 0;
  let retries = 0;
  let flaky = false;
  let nextId = 0;
  let interval;
  let workerActive = false;
  const maximumPending = 240;
  const counterStatus = $(".demo-counters");
  function render(announce = false) {
    $("#queued-count").textContent = pending.length;
    // Announce batch completion, not every frame of the demonstration.
    counterStatus.setAttribute("aria-live", announce ? "polite" : "off");
    $("#delivered-count").textContent = delivered;
    $("#retry-count").textContent = retries;
    $("#queue-dots").replaceChildren(
      ...Array.from({ length: Math.min(18, pending.length) }, () =>
        document.createElement("i"),
      ),
    );
    $("#worker-indicator").classList.toggle("active", workerActive);
    $("#api-activity").classList.toggle("active", pending.length > 0);
    $("#send-burst").disabled = pending.length >= maximumPending;
  }
  function tick() {
    if (document.hidden) return;
    if (!pending.length) {
      stop();
      render(true);
      return;
    }
    const messages = pending.splice(0, 3);
    workerActive = true;
    for (const message of messages) {
      if (flaky && message.id % 3 === 0 && message.attempt === 0) {
        message.attempt++;
        retries++;
        pending.push(message);
      } else delivered++;
    }
    if (!pending.length) stop();
    render(!pending.length);
  }
  function stop() {
    clearInterval(interval);
    interval = undefined;
    workerActive = false;
  }
  $("#send-burst").addEventListener("click", () => {
    const size = Math.min(24, maximumPending - pending.length);
    for (let i = 0; i < size; i++) pending.push({ id: nextId++, attempt: 0 });
    if (reducedMotion.matches) {
      while (pending.length) {
        const message = pending.shift();
        if (flaky && message.id % 3 === 0 && message.attempt === 0) retries++;
        delivered++;
      }
      render(true);
    } else {
      render();
      if (!interval) interval = setInterval(tick, 190);
    }
  });
  $("#toggle-failure").addEventListener("click", () => {
    flaky = !flaky;
    $("#toggle-failure").setAttribute("aria-pressed", String(flaky));
    $("#toggle-failure").textContent = flaky
      ? "Restore the provider"
      : "Make the provider flaky";
    $(".provider-stage").classList.toggle("flaky", flaky);
    $("#provider-desc").textContent = flaky
      ? "First attempts may fail."
      : "All systems behaving.";
  });
  $("#reset-demo").addEventListener("click", () => {
    stop();
    pending = [];
    delivered = 0;
    retries = 0;
    nextId = 0;
    flaky = false;
    $("#toggle-failure").setAttribute("aria-pressed", "false");
    $("#toggle-failure").textContent = "Make the provider flaky";
    $(".provider-stage").classList.remove("flaky");
    $("#provider-desc").textContent = "All systems behaving.";
    render(true);
  });
})();
