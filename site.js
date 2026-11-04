// JavaScript propio del sitio. Sin librerías, sin cookies y sin pedidos a otros sitios.
// Todo acceso a localStorage va protegido: si el navegador lo bloquea, el sitio sigue funcionando.
(function () {
  "use strict";
  var rootMeta = document.querySelector('meta[name="site-root"]');
  var root = rootMeta ? rootMeta.getAttribute("content") || "" : "";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function load(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* sin almacenamiento: no pasa nada */ }
  }

  // ── Copiar (enlaces, códigos, feed) ──
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy]");
    if (!btn) return;
    var text = btn.getAttribute("data-copy");
    var old = btn.textContent;
    var done = function () {
      btn.textContent = "✅ ¡Copiado!";
      setTimeout(function () { btn.textContent = old; }, 1800);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(done, function () { prompt("Copia esto:", text); });
    } else {
      prompt("Copia esto:", text);
    }
  });

  // ── Modo claro / oscuro ──
  var themeBtn = document.getElementById("theme-toggle");
  function paintTheme() {
    if (!themeBtn) return;
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    themeBtn.textContent = dark ? "☀️" : "🌙";
    themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
  }
  if (themeBtn) {
    paintTheme();
    themeBtn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      save("theme", next);
      paintTheme();
    });
  }

  // ── Barra de progreso de lectura y botón de volver arriba ──
  var bar = document.getElementById("progress");
  var top = document.getElementById("to-top");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
    if (top) top.hidden = window.scrollY < 600;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  if (top) {
    top.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  // ── Aparecer suavemente (se omite si el sistema pide reducir movimiento) ──
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".content h2, .content .table-wrap, .card, .quiz, .faq").forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  // ── Plan de hoy con casillas (se guarda solo en este navegador) ──
  document.querySelectorAll("[data-plan-key]").forEach(function (list) {
    var key = "plan:" + list.getAttribute("data-plan-key");
    var boxes = list.querySelectorAll('input[type="checkbox"]');
    var saved = [];
    try { saved = JSON.parse(load(key) || "[]"); } catch (e) { saved = []; }
    var count = document.createElement("p");
    count.className = "plan-count";
    count.setAttribute("aria-live", "polite");
    list.parentNode.insertBefore(count, list.nextSibling);
    function refresh() {
      var n = 0;
      boxes.forEach(function (b) {
        if (b.checked) n++;
        b.closest("li").classList.toggle("done", b.checked);
      });
      count.textContent = n === boxes.length && n > 0
        ? "🎉 ¡Plan completado! ¡Bien hecho!"
        : "✅ " + n + " de " + boxes.length + " listos";
    }
    boxes.forEach(function (b, i) {
      b.checked = saved.indexOf(i) !== -1;
      b.addEventListener("change", function () {
        var now = [];
        boxes.forEach(function (x, j) { if (x.checked) now.push(j); });
        save(key, JSON.stringify(now));
        refresh();
      });
    });
    refresh();
  });

  // ── Quiz con retroalimentación inmediata ──
  document.querySelectorAll("[data-quiz]").forEach(function (quiz) {
    var sets = quiz.querySelectorAll("fieldset");
    var result = quiz.querySelector("#quiz-result");
    var answered = 0, correct = 0;
    function finish() {
      var pct = correct / sets.length;
      var msg = pct === 1 ? "🏆 ¡Perfecto! " + correct + " de " + sets.length + ". ¡Eres un experto!"
        : pct >= 0.6 ? "🎉 ¡Muy bien! " + correct + " de " + sets.length + ". ¡Casi perfecto!"
        : "💪 " + correct + " de " + sets.length + ". ¡Buen intento! Lee el artículo otra vez y prueba de nuevo.";
      result.textContent = msg + " ";
      var again = document.createElement("button");
      again.type = "button";
      again.className = "btn";
      again.textContent = "🔁 Intentar otra vez";
      again.addEventListener("click", reset);
      result.appendChild(again);
      result.hidden = false;
    }
    function reset() {
      answered = 0; correct = 0;
      result.hidden = true;
      sets.forEach(function (fs) {
        fs.removeAttribute("data-done");
        fs.querySelector(".fb").textContent = "";
        fs.querySelectorAll(".opt").forEach(function (o) {
          o.disabled = false; o.classList.remove("ok", "bad");
        });
      });
    }
    sets.forEach(function (fs) {
      fs.querySelectorAll(".opt").forEach(function (opt) {
        opt.addEventListener("click", function () {
          if (fs.getAttribute("data-done")) return;
          fs.setAttribute("data-done", "1");
          var right = opt.hasAttribute("data-ok");
          var good = fs.querySelector("[data-ok]");
          fs.querySelectorAll(".opt").forEach(function (o) { o.disabled = true; });
          good.classList.add("ok");
          if (!right) opt.classList.add("bad");
          var hint = fs.getAttribute("data-hint");
          fs.querySelector(".fb").textContent =
            (right ? "✅ ¡Correcto! " : "❌ Casi. La respuesta era «" + good.textContent + "». ") +
            (hint ? "💡 Del texto: «" + hint + "»" : "");
          answered++;
          if (right) correct++;
          if (answered === sets.length) finish();
        });
      });
    });
  });

  // ── Buscador de la portada ──
  var q = document.getElementById("q");
  if (q) {
    q.addEventListener("input", function () {
      var term = q.value.trim().toLowerCase(), shown = 0;
      document.querySelectorAll(".card[data-title]").forEach(function (c) {
        var ok = !term || c.getAttribute("data-title").indexOf(term) !== -1;
        c.hidden = !ok;
        if (ok) shown++;
      });
      document.querySelectorAll(".group").forEach(function (g) {
        g.hidden = !g.querySelector(".card:not([hidden])");
      });
      var none = document.getElementById("no-results");
      if (none) none.hidden = shown > 0;
    });
  }

  // ── Sitio instalable: botón "Instalar" y service worker ──
  var deferred = null;
  var installBtn = document.getElementById("install-btn");
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferred = e;
  });
  if (installBtn) {
    installBtn.addEventListener("click", function () {
      if (deferred) {
        deferred.prompt();
        deferred = null;
      } else {
        var msg = document.getElementById("install-msg");
        if (msg) { msg.hidden = false; msg.scrollIntoView({ block: "center" }); }
      }
    });
  }
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register(root + "sw.js").catch(function () { /* sin SW: el sitio funciona igual */ });
    });
  }
})();
