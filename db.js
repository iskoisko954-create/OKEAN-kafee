(function () {
  var cfg = window.OKEAN_CONFIG;
  var db = null;
  if (!cfg.firebaseConfig.apiKey.startsWith("YOUR_") && window.firebase) {
    try { firebase.initializeApp(cfg.firebaseConfig); db = firebase.firestore(); }
    catch (e) { console.error("Firebase ката:", e); }
  }
  // Firebase туташпаса — үлгү тамактар көрсөтүлөт
  var DEMO = [
    { id: "d1", name: "Палоо", category: "Ысык тамактар", price: 280, desc: "Уй эти, сабиз, күрүч", img: "" },
    { id: "d2", name: "Лагман", category: "Ысык тамактар", price: 250, desc: "Колго тартылган кесме, эт, жашылча", img: "" },
    { id: "d3", name: "Манты", category: "Ысык тамактар", price: 220, desc: "Бууга бышкан, 5 даана", img: "" },
    { id: "d4", name: "Цезарь салаты", category: "Салаттар", price: 260, desc: "Тоок эти, пармезан, крутон", img: "" },
    { id: "d5", name: "Лимонад", category: "Суусундуктар", price: 120, desc: "Лайм, жалбыз, муз", img: "" }
  ];
  window.DB = {
    configured: !!db,
    watchMenu: function (cb) {
      if (!db) { cb(DEMO); return; }
      db.collection("menu").orderBy("category").onSnapshot(
        function (s) { cb(s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); })); },
        function (e) { console.error(e); cb([]); });
    },
    addItem: function (data) { return db.collection("menu").add(data); },
    saveItem: function (id, data) { return db.collection("menu").doc(id).set(data); },
    removeItem: function (id) { return db.collection("menu").doc(id).delete(); }
  };
})();
