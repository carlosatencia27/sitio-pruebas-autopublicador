// Copiar enlace y buscador de la portada. Sin dependencias.
document.addEventListener("click", function (e) {
  var btn = e.target.closest("[data-copy]");
  if (!btn) return;
  var url = btn.getAttribute("data-copy");
  var done = function () {
    var old = btn.textContent;
    btn.textContent = "✅ ¡Copiado!";
    setTimeout(function () { btn.textContent = old; }, 1800);
  };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(done, function () { prompt("Copia este enlace:", url); });
  } else {
    prompt("Copia este enlace:", url);
  }
});
(function () {
  var q = document.getElementById("q");
  if (!q) return;
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
})();
