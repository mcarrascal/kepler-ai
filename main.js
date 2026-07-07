(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var escHTML = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  /* ---------------------------------------------------------------
     Nav — sticky solidify + mobile menu
  --------------------------------------------------------------- */
  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;
    var onScroll = function () {
      if (window.scrollY > 40) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var burger = $("[data-nav-burger]");
    var mobile = $("[data-nav-mobile]");
    if (!burger || !mobile) return;
    var toggle = function (open) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      mobile.setAttribute("data-open", open ? "true" : "false");
      document.documentElement.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", function () {
      toggle(burger.getAttribute("aria-expanded") !== "true");
    });
    $$("a", mobile).forEach(function (a) {
      a.addEventListener("click", function () { toggle(false); });
    });
  }

  /* ---------------------------------------------------------------
     Smooth anchor scroll (native — no Lenis, see gotcha B.1.4)
  --------------------------------------------------------------- */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 76;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth",
      });
    });
  }

  /* ---------------------------------------------------------------
     Custom cursor — two circles, hidden until first mousemove
  --------------------------------------------------------------- */
  function initCursor() {
    var root = $("[data-cursor-root]");
    if (!root || !fineHover) return;
    document.documentElement.classList.add("has-cursor");
    var ring = $(".cursor-ring", root);
    var dot = $(".cursor-dot", root);
    var tx = 0, ty = 0, rx = 0, ry = 0, firstMove = false;

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (dot) dot.style.transform = "translate3d(" + tx + "px," + ty + "px,0)";
      if (!firstMove) {
        firstMove = true;
        rx = tx; ry = ty;
        if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
        root.classList.add("is-ready");
      }
    }, { passive: true });

    function tick() {
      rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
      if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    var HOVERABLES = "a, button, .card, [data-magnetic]";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(HOVERABLES)) root.classList.add("is-interactive");
    });
    document.addEventListener("mouseout", function (e) {
      var related = e.relatedTarget;
      var stillIn = related && related.closest && related.closest(HOVERABLES);
      if (e.target.closest && e.target.closest(HOVERABLES) && !stillIn) root.classList.remove("is-interactive");
    });
  }

  /* ---------------------------------------------------------------
     Mouse-reactive gradient mesh (signature effect — Archetype 05)
  --------------------------------------------------------------- */
  function initMouseGradient() {
    var el = $("[data-mouse-gradient]");
    if (!el) return;
    var mx = 62, my = 38, tx = 62, ty = 38;
    if (fineHover) {
      document.addEventListener("mousemove", function (e) {
        tx = (e.clientX / window.innerWidth) * 100;
        ty = (e.clientY / window.innerHeight) * 100;
      }, { passive: true });
    }
    function frame() {
      mx += (tx - mx) * 0.05;
      my += (ty - my) * 0.05;
      document.documentElement.style.setProperty("--mx", mx + "%");
      document.documentElement.style.setProperty("--my", my + "%");
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------
     Hero interactive canvas — drifting neon nodes in a constellation
     network, gently repelled by the cursor (autonoma.agency-style).
  --------------------------------------------------------------- */
  function initHeroCanvas() {
    var canvas = $("[data-hero-canvas]");
    var hero = canvas && canvas.closest(".hero");
    if (!canvas || !hero || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var mx = null, my = null;
    var colors = ["#3B82F6", "#A855F7", "#EC4899", "#F97316"];
    var nodes = [];
    var NODE_COUNT = 24;
    var LINK_DIST = 190;
    var INFLUENCE_RADIUS = 260;
    var speedFactor = reduced ? 0.3 : 1;

    function resize() {
      var rect = hero.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeNodes() {
      nodes = [];
      for (var i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          r: 1.8 + Math.random() * 2.6,
          color: colors[i % colors.length],
        });
      }
    }

    resize();
    makeNodes();
    var resizeTo;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTo);
      resizeTo = setTimeout(function () { resize(); }, 200);
    });

    if (fineHover) {
      hero.addEventListener("mousemove", function (e) {
        var rect = hero.getBoundingClientRect();
        mx = e.clientX - rect.left; my = e.clientY - rect.top;
      }, { passive: true });
      hero.addEventListener("mouseleave", function () { mx = null; my = null; });
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);

      // Big glowing halo that follows the cursor — makes the interactivity obvious
      if (mx != null) {
        var glow = ctx.createRadialGradient(mx, my, 0, mx, my, 320);
        glow.addColorStop(0, "rgba(168,85,247,0.22)");
        glow.addColorStop(0.5, "rgba(236,72,153,0.1)");
        glow.addColorStop(1, "rgba(236,72,153,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      nodes.forEach(function (n) {
        n.x += n.vx * speedFactor;
        n.y += n.vy * speedFactor;
        n.vx *= 0.99; n.vy *= 0.99;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
        n.boost = 0;
        if (mx != null) {
          var dx = n.x - mx, dy = n.y - my;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < INFLUENCE_RADIUS && dist > 0.01) {
            var t = (INFLUENCE_RADIUS - dist) / INFLUENCE_RADIUS;
            var force = t * t * 5.2;
            n.x += (dx / dist) * force;
            n.y += (dy / dist) * force;
            n.vx += (dx / dist) * force * 0.05;
            n.vy += (dy / dist) * force * 0.05;
            n.boost = t;
          }
        }
        var speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        var maxSpeed = 3.4;
        if (speed > maxSpeed) { n.vx = (n.vx / speed) * maxSpeed; n.vy = (n.vy / speed) * maxSpeed; }
      });

      ctx.lineWidth = 1;
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var dx2 = a.x - b.x, dy2 = a.y - b.y;
          var dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (dist2 < LINK_DIST) {
            var boostBoth = Math.max(a.boost || 0, b.boost || 0);
            ctx.strokeStyle = "rgba(168,85,247," + ((0.16 + boostBoth * 0.4) * (1 - dist2 / LINK_DIST)) + ")";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach(function (n) {
        var scale = 1 + (n.boost || 0) * 1.6;
        ctx.beginPath();
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 12 + (n.boost || 0) * 22;
        ctx.arc(n.x, n.y, n.r * scale, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------
     Vertical scroll progress bar — shows start/end of the page
  --------------------------------------------------------------- */
  function initScrollProgressV() {
    var fill = $("[data-scroll-progress-v-fill]");
    if (!fill) return;
    var raf = null;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      fill.style.transform = "scaleY(" + pct + ")";
      raf = null;
    }
    window.addEventListener("scroll", function () {
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------------------------------------------------------------
     Tilt 3D subtle on cards
  --------------------------------------------------------------- */
  function initTilt() {
    if (matchMedia("(hover: none)").matches) return;
    $$(".card").forEach(function (card) {
      var MAX = 6;
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      function loop() {
        cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15;
        card.style.setProperty("--rx", cx.toFixed(2) + "deg");
        card.style.setProperty("--ry", cy.toFixed(2) + "deg");
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ---------------------------------------------------------------
     Magnetic buttons (subtle, never on form submit)
  --------------------------------------------------------------- */
  function initMagnetic() {
    if (!fineHover) return;
    $$("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.dataset.magneticStrength || "0.25");
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) - r.width / 2) * strength;
        ty = ((e.clientY - r.top) - r.height / 2) * strength;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener("mouseleave", function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      function loop() {
        cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
        el.style.transform = "translate3d(" + cx.toFixed(2) + "px," + cy.toFixed(2) + "px,0)";
        raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ---------------------------------------------------------------
     Reveal on scroll (universal) — threshold low + 6s safety net
  --------------------------------------------------------------- */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-revealed");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      $$("[data-reveal]:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  /* ---------------------------------------------------------------
     Split-text word reveal on hero headline
  --------------------------------------------------------------- */
  function splitWords(el) {
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    var wrap = function (text) {
      return text.split(/(\s+)/).map(function (w) {
        return /^\s+$/.test(w) ? w : '<span class="split-word" aria-hidden="true">' + escHTML(w) + "</span>";
      }).join("");
    };
    var html = Array.prototype.map.call(el.childNodes, function (node) {
      if (node.nodeType === 3) return wrap(node.textContent);
      if (node.nodeName === "BR") return "<br>";
      if (node.nodeType === 1) {
        var tag = node.tagName.toLowerCase();
        return "<" + tag + ">" + wrap(node.textContent) + "</" + tag + ">";
      }
      return "";
    }).join("");
    el.innerHTML = html;
    return $$(".split-word", el);
  }

  function initSplitText() {
    var el = $('[data-split="words"]');
    if (!el) return;
    var parts = splitWords(el);
    if (!window.gsap) return;
    gsap.set(parts, { y: 22, opacity: 0 });
    gsap.to(parts, {
      y: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: "expo.out", delay: 0.15,
    });
  }

  /* ---------------------------------------------------------------
     Count-up numbers
  --------------------------------------------------------------- */
  function initCountUp() {
    $$("[data-count-to]").forEach(function (el) {
      var target = parseFloat(el.dataset.countTo);
      var prefix = el.dataset.countPrefix || "";
      var suffix = el.dataset.countSuffix || "";
      var decimals = (el.dataset.countTo.split(".")[1] || "").length;
      var obj = { v: 0 };
      var trigger = function () {
        if (window.gsap) {
          gsap.to(obj, {
            v: target, duration: 1.3, ease: "power2.out",
            onUpdate: function () { el.textContent = prefix + obj.v.toFixed(decimals) + suffix; },
          });
        } else {
          el.textContent = prefix + target.toFixed(decimals) + suffix;
        }
      };
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { trigger(); io.unobserve(e.target); } });
      }, { threshold: 0.05 });
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------------
     FAQ accordion
  --------------------------------------------------------------- */
  function initFaq() {
    var list = $("[data-faq]");
    if (!list) return;
    $$(".faq-item", list).forEach(function (item) {
      var btn = $(".faq-question", item);
      btn.addEventListener("click", function () {
        var isOpen = item.getAttribute("data-open") === "true";
        $$(".faq-item", list).forEach(function (other) {
          other.setAttribute("data-open", "false");
          $(".faq-question", other).setAttribute("aria-expanded", "false");
        });
        item.setAttribute("data-open", isOpen ? "false" : "true");
        btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      });
    });
  }

  /* ---------------------------------------------------------------
     Chat demo — re-plays the scripted conversation with typing dots.
     HTML already shows the full static conversation (works without JS);
     this progressively reveals it once when it scrolls into view.
  --------------------------------------------------------------- */
  function initChatDemo() {
    var body = $("[data-chat-body]");
    var script = data.demoScript;
    if (!body || !script || !script.length) return;

    var bubbles = $$(".bubble", body);
    if (!bubbles.length) return;

    // Hide the static bubbles; we'll re-append them on a timed sequence.
    bubbles.forEach(function (b) { b.remove(); });

    var typing = document.createElement("div");
    typing.className = "typing-indicator";
    typing.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(typing);

    var played = false;
    function play() {
      if (played) return;
      played = true;
      var delay = 300;
      script.forEach(function (turn, i) {
        var isAgent = turn.from === "agent";
        var showTyping = isAgent;
        if (showTyping) {
          setTimeout(function () {
            typing.classList.add("is-visible");
            body.insertBefore(typing, null);
            body.scrollTop = body.scrollHeight;
          }, delay);
          delay += reduced ? 80 : 650;
        }
        setTimeout(function () {
          typing.classList.remove("is-visible");
          var div = document.createElement("div");
          div.className = "bubble " + (turn.from === "user" ? "bubble-user" : turn.from === "agent" ? "bubble-agent" : "bubble-chip");
          div.textContent = turn.text;
          body.insertBefore(div, typing);
          body.scrollTop = body.scrollHeight;
        }, delay);
        delay += reduced ? 90 : (turn.from === "chip" ? 500 : 900);
      });
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { play(); io.unobserve(e.target); } });
    }, { threshold: 0.05 });
    io.observe(body);
  }

  /* ---------------------------------------------------------------
     Contact form — submits to Web3Forms so leads reach our inbox
  --------------------------------------------------------------- */
  function initContactForm() {
    var form = $("[data-contact-form]");
    var success = $("[data-contact-success]");
    if (!form || !success) return;
    var submitBtn = $('[type="submit"]', form);
    var msg = $("[data-contact-success-msg]");
    var errorEl = $("[data-contact-error]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.classList.contains("is-sending")) return;
      if (!form.reportValidity()) return;
      if (form.elements.botcheck && form.elements.botcheck.checked) return;

      form.classList.add("is-sending");
      submitBtn.disabled = true;
      if (errorEl) errorEl.hidden = true;

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (res) { return res.json(); })
        .then(function (result) {
          if (!result.success) throw new Error(result.message || "submit failed");

          var firstName = (form.elements.name.value || "").trim().split(/\s+/)[0] || "Hola";
          if (msg) msg.textContent = firstName + ", recibimos tu solicitud. Te vamos a escribir en breve para coordinar la reunión.";
          form.classList.remove("is-sending");
          form.classList.add("is-sent");
          success.setAttribute("aria-hidden", "false");
          success.classList.add("is-visible");
        })
        .catch(function (err) {
          console.warn("[initContactForm] submit failed:", err);
          form.classList.remove("is-sending");
          submitBtn.disabled = false;
          if (errorEl) errorEl.hidden = false;
        });
    });
  }

  /* ---------------------------------------------------------------
     ScrollTrigger-based section reveals disabled by default — using
     native IntersectionObserver reveals above for robustness.
  --------------------------------------------------------------- */

  function boot() {
    safe(initNav, "initNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initCursor, "initCursor");
    safe(initMouseGradient, "initMouseGradient");
    safe(initHeroCanvas, "initHeroCanvas");
    safe(initScrollProgressV, "initScrollProgressV");
    safe(initTilt, "initTilt");
    safe(initMagnetic, "initMagnetic");
    safe(initReveals, "initReveals");
    safe(initSplitText, "initSplitText");
    safe(initCountUp, "initCountUp");
    safe(initFaq, "initFaq");
    safe(initChatDemo, "initChatDemo");
    safe(initContactForm, "initContactForm");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
