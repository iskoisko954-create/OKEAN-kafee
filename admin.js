(function () {
  var C = window.OKEAN_CONFIG;
  var $ = function (s) { return document.querySelector(s); };
  var menu = [], editId = null, img = "";
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  function toast(t) { var el = $("#toast"); el.textContent = t; el.classList.add("show"); setTimeout(function () { el.classList.remove("show"); }, 2200); }

  // ----- Кирүү -----
  function enter() { $("#gate").hidden = true; $("#panel").hidden = false; }
  if (sessionStorage.getItem("okean-admin") === "1") enter();
  function login() {
    if ($("#pw").value.trim() === C.ADMIN_PASSWORD) { sessionStorage.setItem("okean-admin", "1"); enter(); }
    else $("#err").textContent = "Сырсөз туура эмес. Кайра аракет кылыңыз.";
  }
  $("#login").onclick = login;
  $("#pw").onkeydown = function (e) { if (e.key === "Enter") login(); };
  $("#logout").onclick = function () { sessionStorage.removeItem("okean-admin"); location.reload(); };

  // ----- Тизме -----
  DB.watchMenu(function (items) { menu = items; render(); });
  function render() {
    var cats = menu.map(function (m) { return m.category; }).filter(function (c, i, a) { return c && a.indexOf(c) === i; });
    $("#catlist").innerHTML = cats.map(function (c) { return '<option value="' + esc(c) + '">'; }).join("");
    $("#alist").innerHTML = menu.length ? menu.map(function (m) {
      return '<div class="arow"><div class="th" ' + (m.img ? "style=\"background-image:url('" + m.img + "')\"" : "") + '></div><div class="nm"><b>' + esc(m.name) + "</b><br><small>" + esc(m.category) + " · " + Number(m.price).toLocaleString("ru-RU") + " " + C.CURRENCY +
        '</small></div><button class="btn ghost sm" data-e="' + m.id + '">Өзгөртүү</button><button class="btn danger sm" data-x="' + m.id + '">Өчүрүү</button></div>';
    }).join("") : '<p class="empty">Меню бош. Сол жактагы форма аркылуу биринчи тамакты кошуңуз.</p>';
  }
  $("#alist").onclick = function (e) {
    var ed = e.target.dataset.e, x = e.target.dataset.x;
    if (ed) {
      var m = menu.find(function (i) { return i.id === ed; }); editId = ed; img = m.img || "";
      ["name", "category", "price", "desc"].forEach(function (k) { $("#" + k).value = m[k] == null ? "" : m[k]; });
      setPreview(img); $("#ftitle").textContent = "Тамакты өзгөртүү"; $("#cancel").hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (x && confirm("Бул тамакты өчүрөсүзбү?")) {
      if (!need()) return;
      DB.removeItem(x).then(function () { toast("Өчүрүлдү"); });
    }
  };

  // ----- Сүрөт: браузерде кичирейтилет -----
  $("#file").onchange = function (e) {
    var f = e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      var im = new Image();
      im.onload = function () {
        var k = Math.min(1, 700 / im.width), c = document.createElement("canvas");
        c.width = im.width * k; c.height = im.height * k;
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        img = c.toDataURL("image/jpeg", 0.78); setPreview(img);
      };
      im.src = r.result;
    };
    r.readAsDataURL(f);
  };
  function setPreview(src) {
    $("#drop").style.backgroundImage = src ? "url('" + src + "')" : "";
    $("#dtxt").textContent = src ? "" : "Сүрөттү тандоо үчүн басыңыз";
  }

  // ----- Сактоо -----
  $("#form").onsubmit = function (e) {
    e.preventDefault(); if (!need()) return;
    var data = { name: $("#name").value.trim(), category: $("#category").value.trim(), price: +$("#price").value, desc: $("#desc").value.trim(), img: img };
    $("#saveBtn").disabled = true;
    (editId ? DB.saveItem(editId, data) : DB.addItem(data))
      .then(function () { toast("Сакталды"); reset(); })
      .catch(function (err) { toast("Ката: " + err.message); })
      .then(function () { $("#saveBtn").disabled = false; });
  };
  $("#cancel").onclick = reset;
  function reset() {
    $("#form").reset(); editId = null; img = ""; setPreview(""); $("#ftitle").textContent = "Жаңы тамак"; $("#cancel").hidden = true;
  }
  function need() { if (!DB.configured) { toast("Адегенде js/firebase-config.js файлын толтуруңуз"); return false; } return true; }
})();
