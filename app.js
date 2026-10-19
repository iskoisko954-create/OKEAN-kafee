(function () {
  var C = window.OKEAN_CONFIG;
  var $ = function (s) { return document.querySelector(s); };
  var fmt = function (n) { return Number(n).toLocaleString("ru-RU") + " " + C.CURRENCY; };
  var menu = [], cat = "Баары";
  var cart = JSON.parse(localStorage.getItem("okean-cart") || "{}");
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  function toast(t) { var el = $("#toast"); el.textContent = t; el.classList.add("show"); setTimeout(function () { el.classList.remove("show"); }, 1800); }

  // ----- Кирүү анимациясы -----
  var intro = $("#intro");
  for (var i = 0; i < 14; i++) {
    var b = document.createElement("span"), s = 6 + Math.random() * 22;
    b.className = "bubble";
    b.style.cssText = "left:" + Math.random() * 100 + "%;width:" + s + "px;height:" + s + "px;animation-duration:" + (3 + Math.random() * 3) + "s;animation-delay:" + Math.random() * 2.5 + "s";
    intro.appendChild(b);
  }
  setTimeout(function () { document.body.classList.add("ready"); }, 4700);

  // ----- Меню -----
  DB.watchMenu(function (items) { menu = items; renderCats(); renderGrid(); renderCart(); });

  function renderCats() {
    var cats = ["Баары"].concat(menu.map(function (m) { return m.category; }).filter(function (c, i, a) { return c && a.indexOf(c) === i; }));
    if (cats.indexOf(cat) < 0) cat = "Баары";
    $("#cats").innerHTML = cats.map(function (c) { return '<button class="' + (c === cat ? "on" : "") + '" data-c="' + esc(c) + '">' + esc(c) + "</button>"; }).join("");
  }
  $("#cats").onclick = function (e) { var c = e.target.dataset.c; if (c) { cat = c; renderCats(); renderGrid(); } };

  function renderGrid() {
    var list = menu.filter(function (m) { return cat === "Баары" || m.category === cat; });
    $("#grid").innerHTML = list.length ? list.map(function (m) {
      return '<article class="dish"><div class="ph" ' + (m.img ? "style=\"background-image:url('" + m.img + "');font-size:0\"" : "") + ">" + (m.img ? "" : esc((m.name || "?")[0])) + "</div>" +
        '<div class="bd"><h3>' + esc(m.name) + "</h3><p>" + esc(m.desc || "") + '</p><div class="row"><span class="price">' + fmt(m.price) +
        '</span><button class="btn sm" data-add="' + m.id + '">Кошуу</button></div></div></article>';
    }).join("") : '<p class="empty">Азырынча тамак жок. Жакында кошобуз.</p>';
  }
  $("#grid").onclick = function (e) { var id = e.target.dataset.add; if (id) { cart[id] = (cart[id] || 0) + 1; save(); toast("Себетке кошулду"); } };

  // ----- Себет -----
  function save() { localStorage.setItem("okean-cart", JSON.stringify(cart)); renderCart(); }
  function rows() { return Object.keys(cart).map(function (id) { return { m: menu.find(function (x) { return x.id === id; }), q: cart[id], id: id }; }).filter(function (r) { return r.m; }); }
  function renderCart() {
    var r = rows(), total = r.reduce(function (s, x) { return s + x.m.price * x.q; }, 0);
    $("#count").textContent = r.reduce(function (s, x) { return s + x.q; }, 0);
    $("#total").textContent = fmt(total);
    $("#items").innerHTML = r.length ? r.map(function (x) {
      return '<div class="line-item"><div class="nm">' + esc(x.m.name) + "<small>" + fmt(x.m.price) + '</small></div><div class="qty"><button data-d="-1" data-id="' + x.id + '">−</button><b>' + x.q + '</b><button data-d="1" data-id="' + x.id + '">+</button></div></div>';
    }).join("") : '<p class="empty" style="padding:40px 0">Себет бош. Менюдан тамак тандаңыз.</p>';
  }
  $("#items").onclick = function (e) {
    var id = e.target.dataset.id, d = e.target.dataset.d; if (!id) return;
    cart[id] += +d; if (cart[id] <= 0) delete cart[id]; save();
  };
  function toggle(o) { $("#drawer").classList.toggle("open", o); $("#shade").classList.toggle("open", o); }
  $("#openCart").onclick = function () { toggle(true); };
  $("#closeCart").onclick = $("#shade").onclick = function () { toggle(false); };

  $("#send").onclick = function () {
    var r = rows();
    if (!r.length) return toast("Адегенде себетке тамак кошуңуз");
    var name = $("#cname").value.trim(), phone = $("#cphone").value.trim();
    if (!name || !phone) return toast("Аты-жөнүңүздү жана телефонду жазыңыз");
    var total = r.reduce(function (s, x) { return s + x.m.price * x.q; }, 0), note = $("#cnote").value.trim();
    var text = "🌊 *" + C.CAFE_NAME + "* — жаңы буйрутма\n\n" +
      r.map(function (x, i) { return (i + 1) + ". " + x.m.name + " × " + x.q + " = " + fmt(x.m.price * x.q); }).join("\n") +
      "\n\n*Жалпы: " + fmt(total) + "*\n\n👤 " + name + "\n📞 " + phone + (note ? "\n📍 " + note : "");
    window.open("https://wa.me/" + C.WHATSAPP + "?text=" + encodeURIComponent(text), "_blank");
  };
})();
