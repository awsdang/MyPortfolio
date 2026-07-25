/* AWSDANG.COM · shared UI. Reveals, section label, odometers,
   NotifyX queue sim + real web push,
   screenshot-slot loader. Hand-written JS, no build step. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- scroll reveals ---------------- */
  var rvs = document.querySelectorAll(".rv");
  if (reduced || !("IntersectionObserver" in window)) {
    rvs.forEach(function (el) { el.classList.add("on"); });
  } else {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("on"); rio.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    rvs.forEach(function (el) { rio.observe(el); });
  }

  /* ---------------- odometers ---------------- */
  function fmt(n, kind) {
    if (kind === "m") return n >= 999999 ? "1M+" : Math.round(n / 1000) + "K";
    if (kind === "kmo") return "~" + Math.round(n) + "K";
    if (kind === "pct") return (n / 10).toFixed(1) + "%";
    if (kind === "plus") return Math.round(n) + "+";
    if (kind === "k10") return n >= 9999 ? "10K+" : Math.round(n / 1000) + "K";
    if (kind === "msg") return Math.round(n) + "/s";
    return Math.round(n).toString();
  }
  function runOdo(el) {
    var target = parseInt(el.getAttribute("data-n"), 10);
    var kind = el.getAttribute("data-fmt");
    if (reduced) { el.textContent = fmt(target, kind); return; }
    var t0 = null, DUR = 1100;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / DUR);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(target * eased, kind);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var odos = document.querySelectorAll(".odo");
  if ("IntersectionObserver" in window && !reduced) {
    var oio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { runOdo(e.target); oio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    odos.forEach(function (el) { oio.observe(el); });
  } else {
    odos.forEach(runOdo);
  }

  /* ---------------- current section label ---------------- */
  var hudDistrict = document.getElementById("hud-district");
  var named = document.querySelectorAll("[data-district][data-name]");
  if ("IntersectionObserver" in window && named.length) {
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (hudDistrict) hudDistrict.textContent = e.target.getAttribute("data-name");
      });
    }, { threshold: 0.25 });
    named.forEach(function (s) { dio.observe(s); });
  }

  /* ---------------- screenshot slots (see ASSETS.md) ---------------- */
  var root = document.body.getAttribute("data-root") || "";
  document.querySelectorAll(".shot[data-shot]").forEach(function (fig) {
    var name = fig.getAttribute("data-shot");
    var img = new Image();
    img.onload = function () {
      var ph = fig.querySelector(".shot-ph");
      img.alt = fig.getAttribute("data-alt") || "";
      img.loading = "lazy";
      if (ph) ph.replaceWith(img);
    };
    img.src = root + "assets/shots/" + name + ".webp";
  });

  /* ================================================================
     NOTIFYX QUEUE SIMULATION (canvas)
     ================================================================ */
  var cv = document.getElementById("queue");
  if (cv) {
    var ctx = cv.getContext("2d");
    var W2 = 0, H2 = 0, DPR2 = Math.min(2, window.devicePixelRatio || 1);
    var delivered = 0, retried = 0;
    var dEl = document.getElementById("q-delivered");
    var rEl = document.getElementById("q-retried");

    var C = {
      line: "#303328", text: "#9ea195",
      acc: "#7657ff", green: "#caff3d", amber: "#ffc151", red: "#ff5c35",
      node: "#171912", edge: "#45483d"
    };

    function resize2() {
      W2 = cv.clientWidth; H2 = 260;
      cv.width = W2 * DPR2; cv.height = H2 * DPR2;
      ctx.setTransform(DPR2, 0, 0, DPR2, 0, 0);
    }
    resize2();
    window.addEventListener("resize", resize2);

    function L() {
      var pad = Math.max(30, W2 * 0.04);
      return {
        api:   { x: pad + 30,        y: H2 * 0.34 },
        sch:   { x: pad + 30,        y: H2 * 0.66 },
        queue: { x: W2 * 0.32,       y: H2 / 2 },
        wk:    [ { x: W2 * 0.56, y: H2 * 0.24 }, { x: W2 * 0.56, y: H2 * 0.5 }, { x: W2 * 0.56, y: H2 * 0.76 } ],
        pv:    [ { x: W2 - pad - 40, y: H2 * 0.16 }, { x: W2 - pad - 40, y: H2 * 0.39 },
                 { x: W2 - pad - 40, y: H2 * 0.62 }, { x: W2 - pad - 40, y: H2 * 0.85 } ],
        retry: { x: W2 * 0.44, y: H2 * 0.94 }
      };
    }
    var PVN = ["FCM", "APNS", "HMS", "WEB"];

    var dots = [];
    function spawn(src) {
      var l = L();
      var o = src === "sch" ? l.sch : l.api;
      dots.push({
        x: o.x, y: o.y, src: src || "api", ph: 0, t: 0,
        wk: Math.floor(Math.random() * 3),
        pv: Math.floor(Math.random() * 4),
        fail: Math.random() < 0.12, failed: false,
        speed: 0.011 + Math.random() * 0.006
      });
    }

    function lerp(a, b, k) { return a + (b - a) * k; }

    function nodeBox(x, y, w, h, label, color) {
      ctx.fillStyle = C.node; ctx.strokeStyle = C.edge; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y - h / 2, w, h, 4);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = color || C.text;
      ctx.font = "600 10px Inter, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(label, x, y);
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    }

    function edge2(a, b) {
      ctx.strokeStyle = C.line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    var last = 0, acc = 0, running = true;
    var pulses = [];

    function frame2(t) {
      if (!running) return;
      var dt = Math.min(50, t - last); last = t; acc += dt;
      if (acc > 300) {
        acc = 0;
        spawn(Math.random() < 0.3 ? "sch" : "api");
        if (dots.length > 70) dots.splice(0, dots.length - 70);
      }

      ctx.clearRect(0, 0, W2, H2);
      var l = L();

      edge2(l.api, l.queue);
      edge2(l.sch, l.queue);
      l.wk.forEach(function (w) { edge2(l.queue, w); });
      l.wk.forEach(function (w) { l.pv.forEach(function (p) { edge2(w, p); }); });
      ctx.strokeStyle = "rgba(255,187,85,0.35)";
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(l.pv[1].x, l.pv[1].y + 12);
      ctx.quadraticCurveTo(l.retry.x, l.retry.y + 24, l.queue.x, l.queue.y + 14);
      ctx.stroke();
      ctx.setLineDash([]);

      for (var pi = pulses.length - 1; pi >= 0; pi--) {
        var pu = pulses[pi]; pu.t += dt / 500;
        if (pu.t >= 1) { pulses.splice(pi, 1); continue; }
        var pn = l.pv[pu.i];
        ctx.beginPath();
        ctx.arc(pn.x, pn.y, 14 + pu.t * 16, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(101,246,166," + (0.5 * (1 - pu.t)) + ")";
        ctx.lineWidth = 1.5; ctx.stroke();
      }

      ctx.fillStyle = "rgba(126,135,152,0.6)";
      ctx.font = "600 10px Inter, sans-serif";
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText("NOTIFYX v1 · API · SCHEDULER → QUEUE (BullMQ) → WORKERS → FCM / APNS / HMS / WEB", 12, 10);

      nodeBox(l.api.x, l.api.y, 58, 24, "API");
      nodeBox(l.sch.x, l.sch.y, 78, 24, "SCHEDULER");
      nodeBox(l.queue.x, l.queue.y, 70, 26, "QUEUE", C.acc);
      l.wk.forEach(function (w, i) { nodeBox(w.x, w.y, 66, 24, "WORKER " + (i + 1)); });
      l.pv.forEach(function (p, i) { nodeBox(p.x, p.y, 56, 22, PVN[i], C.text); });
      ctx.fillStyle = "rgba(255,187,85,0.75)";
      ctx.font = "600 9px Inter, sans-serif";
      ctx.fillText("RETRY / DLQ", l.retry.x, l.retry.y + 30);

      dots.forEach(function (d) {
        d.t += d.speed * (dt / 16.7);
        var from, to;
        if (d.ph === 0) { from = (d.src === "sch" ? l.sch : l.api); to = l.queue; }
        else if (d.ph === 1) { from = l.queue; to = l.wk[d.wk]; }
        else if (d.ph === 2) { from = l.wk[d.wk]; to = l.pv[d.pv]; }
        else if (d.ph === 3) {
          from = l.pv[d.pv]; to = l.queue;
          var k = d.t, mx = l.retry.x, my = l.retry.y + 20;
          d.x = (1-k)*(1-k)*from.x + 2*(1-k)*k*mx + k*k*to.x;
          d.y = (1-k)*(1-k)*(from.y+10) + 2*(1-k)*k*my + k*k*(to.y+10);
        }
        if (d.ph !== 3) { d.x = lerp(from.x, to.x, d.t); d.y = lerp(from.y, to.y, d.t); }

        if (d.t >= 1) {
          d.t = 0;
          if (d.ph === 2) {
            if (d.fail && !d.failed) { d.failed = true; retried++; if (rEl) rEl.textContent = retried; d.ph = 3; }
            else { delivered++; if (dEl) dEl.textContent = delivered; pulses.push({ i: d.pv, t: 0 }); d.dead = true; }
          } else if (d.ph === 3) { d.ph = 1; }
          else { d.ph++; }
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = d.ph === 3 ? C.red : (d.failed ? C.amber : C.green);
        ctx.fill();
      });
      for (var i = dots.length - 1; i >= 0; i--) if (dots[i].dead) dots.splice(i, 1);

      requestAnimationFrame(frame2);
    }

    function staticDiagram() {
      ctx.clearRect(0, 0, W2, H2);
      var l = L();
      edge2(l.api, l.queue); edge2(l.sch, l.queue);
      l.wk.forEach(function (w) { edge2(l.queue, w); l.pv.forEach(function (p) { edge2(w, p); }); });
      nodeBox(l.api.x, l.api.y, 58, 24, "API");
      nodeBox(l.sch.x, l.sch.y, 78, 24, "SCHEDULER");
      nodeBox(l.queue.x, l.queue.y, 70, 26, "QUEUE", C.acc);
      l.wk.forEach(function (w, i) { nodeBox(w.x, w.y, 66, 24, "WORKER " + (i + 1)); });
      l.pv.forEach(function (p, i) { nodeBox(p.x, p.y, 56, 22, PVN[i]); });
    }

    if (typeof ctx.roundRect !== "function") {
      CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r); this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r); this.closePath(); return this;
      };
    }
    if (reduced) staticDiagram();

    window.spawnBurst = function () {
      for (var j = 0; j < 14; j++) (function (jj) {
        setTimeout(function () { spawn(jj % 3 === 0 ? "sch" : "api"); }, jj * 90);
      })(j);
      if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame2); }
    };
    if (!reduced) {
      if ("IntersectionObserver" in window) {
        var qio = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting && !running) { running = true; last = performance.now(); requestAnimationFrame(frame2); }
            else if (!e.isIntersecting) { running = false; }
          });
        }, { threshold: 0.1 });
        qio.observe(cv);
        running = false;
      } else {
        requestAnimationFrame(frame2);
      }
    }
  }

  /* ================================================================
     WEB PUSH via the NotifyX web SDK
     ================================================================ */
  var sendBtn = document.getElementById("q-send");
  if (sendBtn) {
    var toast = document.createElement("div");
    toast.id = "nx-toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
    var toastTimer = null;
    var showToast = function (html) {
      toast.innerHTML = html;
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 3200);
    };

    /* A configured NotifyX app sends a remote push. Without those credentials,
       the same permission flow still delivers a real system notification from
       the registered service worker—never a fake in-page notification. */
    var nxCfg = window.NOTIFYX_CONFIG || {};
    var demoVapidPublicKey =
      "BJSUo00Yprcp7vvJeSirF0PXteeGulA7GSzyCLzTCOfzLQVQxnljq7uhRE3gBgX5zMBEKfaRWhCESKZ59rCF1-A";
    var notificationsSupported = "Notification" in window;
    var nxReady = Boolean(
      window.NotifyXWebSDK && NotifyXWebSDK.isSupported() &&
      nxCfg.baseUrl && nxCfg.appId && nxCfg.apiKey && nxCfg.vapidPublicKey
    );
    var nx = null, nxBusy = false;
    if (nxReady) {
      nx = new NotifyXWebSDK({
        baseUrl: nxCfg.baseUrl,
        appId: nxCfg.appId,
        apiKey: nxCfg.apiKey,
        vapidPublicKey: nxCfg.vapidPublicKey,
        serviceWorkerPath: nxCfg.serviceWorkerPath || "/notifyx-sw.js"
      });
      if (nx.getState()) nx.refreshSubscription().catch(function () {});
    }

    var visitorId = function () {
      var key = "nx:visitor";
      var id = null;
      try { id = localStorage.getItem(key); } catch (e) {}
      if (!id) {
        id = "web-visitor-" + Math.random().toString(36).slice(2, 10);
        try { localStorage.setItem(key, id); } catch (e) {}
      }
      return id;
    };

    var base64UrlToUint8Array = function (value) {
      var padding = "=".repeat((4 - (value.length % 4)) % 4);
      var base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
      var raw = window.atob(base64);
      return Uint8Array.from(raw, function (char) { return char.charCodeAt(0); });
    };

    var notificationPayload = function () {
      return {
        title: "Hey, you need a system fixed?",
        body: "NotifyX is enabled. This is a real browser notification from Aws.",
        actionUrl: window.location.href.split("#")[0] + "#d-infra"
      };
    };

    var requestPermissionAndWorker = function () {
      if (!notificationsSupported) {
        return Promise.reject(new Error("This browser does not support web notifications."));
      }
      if (window.location.protocol === "file:") {
        return Promise.reject(
          new Error("Open http://127.0.0.1:4173/ to send—browsers block notifications on file:// pages.")
        );
      }
      if (!window.isSecureContext) {
        return Promise.reject(new Error("Notifications require HTTPS or localhost."));
      }
      if (Notification.permission === "denied") {
        return Promise.reject(new Error("Notifications are blocked. Allow them in your browser settings and try again."));
      }

      showToast("<b>NOTIFYX</b> · asking this browser for notification permission…");
      return Notification.requestPermission().then(function (permission) {
        if (permission !== "granted") {
          throw new Error("Notification permission was not granted.");
        }
        showToast("<b>NOTIFYX</b> · permission granted · enabling this browser…");
        if (!("serviceWorker" in navigator)) {
          return null;
        }
        return navigator.serviceWorker
          .register(nxCfg.serviceWorkerPath || "/notifyx-sw.js")
          .then(function () { return navigator.serviceWorker.ready; })
          .catch(function () { return null; });
      }).then(function (registration) {
        if (!registration || nxReady || !registration.pushManager) {
          return { registration: registration, subscription: null };
        }

        showToast("<b>NOTIFYX</b> · permission granted · subscribing this browser…");
        return registration.pushManager.getSubscription().then(function (subscription) {
          if (subscription) return subscription;
          return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: base64UrlToUint8Array(
              nxCfg.vapidPublicKey || demoVapidPublicKey
            )
          });
        }).then(function (subscription) {
          return { registration: registration, subscription: subscription };
        }).catch(function (error) {
          return {
            registration: registration,
            subscription: null,
            subscriptionError: error
          };
        });
      });
    };

    var sendRemotePush = function () {
      var registered = nx.getState()
        ? nx.refreshSubscription().then(function (device) {
            return device ? device : nx.init({ externalUserId: visitorId() });
          })
        : nx.init({ externalUserId: visitorId() });
      return registered.then(function () {
        return nx.sendTestNotification(notificationPayload());
      });
    };

    var showSystemNotification = function (registration) {
      var payload = notificationPayload();
      var options = {
        body: payload.body,
        tag: "notifyx-portfolio-test",
        renotify: true,
        data: {
          actionUrl: payload.actionUrl,
          source: "notifyx-portfolio"
        }
      };

      if (registration && registration.showNotification) {
        return registration.showNotification(payload.title, options);
      }

      return new Promise(function (resolve, reject) {
        try {
          var notification = new Notification(payload.title, options);
          notification.onclick = function () {
            window.focus();
            window.location.hash = "d-infra";
            notification.close();
          };
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    };

    var subscribeAndSend = function () {
      return requestPermissionAndWorker().then(function (context) {
        if (nxReady) {
          showToast("<b>NOTIFYX</b> · subscribing this browser and queueing the push…");
          return sendRemotePush().then(function () { return "remote"; });
        }
        return showSystemNotification(context.registration).then(function () {
          return context.subscription ? "local-subscribed" : "local";
        });
      });
    };

    sendBtn.addEventListener("click", function () {
      if (!reduced && typeof window.spawnBurst === "function") window.spawnBurst();
      if (nxBusy) return;

      nxBusy = true;
      sendBtn.disabled = true;
      sendBtn.setAttribute("aria-busy", "true");
      sendBtn.textContent = "SENDING…";

      subscribeAndSend().then(function (mode) {
        sendBtn.textContent = "✓ SENT";
        showToast(
          mode === "remote"
            ? "<b>NOTIFYX</b> · subscribed and delivered through the real push queue."
            : mode === "local-subscribed"
              ? "<b>NOTIFYX</b> · subscribed · notification sent to your system tray."
            : "<b>NOTIFYX</b> · notifications enabled · check your system tray."
        );
      }).catch(function (err) {
        sendBtn.textContent = "TRY AGAIN";
        showToast("<b>NOTIFYX</b> · " + (err && err.message ? err.message : "notification failed."));
      }).finally(function () {
        nxBusy = false;
        sendBtn.disabled = false;
        sendBtn.removeAttribute("aria-busy");
        setTimeout(function () { sendBtn.textContent = "SEND"; }, 2600);
      });
    });
  }

})();
