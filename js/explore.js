/* =========================================================
   EXPLORE PAGE (js/explore.js)
   Fitur utama:
   1. Filter pencarian teks & kategori tempat wisata
   2. Galeri foto dinamis bergaya Pinterest (masonry)
   3. Integrasi peta interaktif (Leaflet & OpenStreetMap)
   4. Modal detail tempat, jam buka real-time & link Google Maps
   5. Penambahan tempat ke draft itinerary
   ========================================================= */
(function () {
  "use strict";
  var NICE = window.NICE, ui = NICE.ui, h = ui.h, D = NICE.data;

  // 1. State pencarian, kategori, dan referensi modal
  var ALL = "all";
  var state = { q: "", cat: ALL, view: "gallery" };
  var used = {};            // Jumlah itinerary yang memakai tiap tempat
  var map = null, markers = {};
  var currentPlace = null;
  var placeModal, dayModal;

  // 2. Rasio foto bervariasi untuk efek Pinterest masonry
  var RATIOS = ["2 / 3", "1 / 1", "3 / 4", "3 / 5", "4 / 5", "1 / 1", "3 / 4"];

  // 3. Warna dan ikon pin peta per kategori
  var CAT_STYLE = {
    "Culture & History": { color: "#1F4E79", icon: "bank" },
    "Sights & Views":    { color: "#2E8B6E", icon: "camera" },
    "Food & Shopping":   { color: "#D9622B", icon: "basket" },
    "Day Trips":         { color: "#8A5BB5", icon: "signpost-split" },
    "Transport":         { color: "#6B7280", icon: "train-front" }
  };
  function styleOf(cat) { return CAT_STYLE[cat] || { color: "#E3B04B", icon: "geo-alt" }; }

  // Normalisasi string (case-insensitive & abaikan aksen/diakritik)
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

  // 4. Logika filter tempat berdasarkan kata kunci & kategori
  function filtered() {
    var q = norm(state.q.trim());
    return D.PLACES.filter(function (p) {
      if (state.cat !== ALL && p.category !== state.cat) return false;
      if (!q) return true;
      return norm(p.name + " " + p.category + " " + p.summary).indexOf(q) > -1;
    });
  }

  // 5. Render kartu foto tempat (Pinterest tile)
  function tile(p) {
    var st = D.openStatus(p);
    var idx = D.PLACES.indexOf(p);
    var kids = [h("img", { src: p.photo, alt: p.alt, loading: "lazy" })];
    if (st.state !== "none") kids.push(h("span", { class: "status badge status-" + st.state, text: st.label }));
    kids.push(h("span", { class: "caption" }, [h("strong", { text: p.name }), h("small", { text: p.category })]));
    return h("button", {
      type: "button", class: "shot", "data-id": p.id,
      style: "aspect-ratio: " + RATIOS[idx % RATIOS.length],
      "aria-label": "View details for " + p.name,
      onclick: function () { openPlace(p); }
    }, kids);
  }

  function render() {
    var list = filtered();
    var grid = document.getElementById("placeGrid");
    grid.innerHTML = "";
    list.forEach(function (p) { grid.appendChild(tile(p)); });
    document.getElementById("emptyState").hidden = list.length > 0;
    document.getElementById("resultInfo").textContent = list.length + (list.length === 1 ? " place" : " places") + (state.cat !== ALL ? " in " + state.cat : "");
    if (map) updateMarkers(list);
  }

  function renderChips() {
    var box = document.getElementById("chips");
    [ALL].concat(D.CATEGORIES).forEach(function (c) {
      box.appendChild(h("button", {
        type: "button", "data-cat": c, class: "chip" + (c === state.cat ? " active" : ""),
        text: c === ALL ? "All" : c, "aria-pressed": String(c === state.cat),
        onclick: function () {
          state.cat = c;
          box.querySelectorAll(".chip").forEach(function (b) {
            var on = b.dataset.cat === c;
            b.classList.toggle("active", on);
            b.setAttribute("aria-pressed", String(on));
          });
          render();
        }
      }));
    });
  }

  // 6. Integrasi peta interaktif Leaflet, OpenStreetMap, dan marker custom
  function initMap() {
    if (map || typeof L === "undefined") return;
    map = L.map("mapBox", { scrollWheelZoom: false }).setView([43.6990, 7.2700], 13);

    /* Primary tile layer: OpenStreetMap */
    var osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
    });

    /* Fallback tile layer: Esri */
    var esri = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: "Tiles &copy; Esri"
    });

    var fellBack = false;
    osm.on("tileerror", function () {
      if (fellBack) return;
      fellBack = true;
      map.removeLayer(osm);
      esri.addTo(map);
    });

    /* Category legend */
    var legend = L.control({ position: "bottomleft" });
    legend.onAdd = function () {
      var box = L.DomUtil.create("div", "map-legend");
      Object.keys(CAT_STYLE).forEach(function (c) {
        var row = L.DomUtil.create("div", "", box);
        var dot = L.DomUtil.create("span", "dot", row);
        dot.style.background = CAT_STYLE[c].color;
        row.appendChild(document.createTextNode(c));
      });
      return box;
    };
    legend.addTo(map);

    osm.addTo(map);
    updateMarkers(filtered());
  }

  function updateMarkers(list) {
    Object.keys(markers).forEach(function (k) { map.removeLayer(markers[k]); });
    markers = {};
    var pts = [];
    list.forEach(function (p) {
      var s = styleOf(p.category);
      var icon = L.divIcon({
        className: "",
        html: '<div class="pin2" style="--pin:' + s.color + '"><i class="bi bi-' + s.icon + '"></i></div>',
        iconSize: [34, 42], iconAnchor: [17, 42], popupAnchor: [0, -38]
      });
      var m = L.marker([p.lat, p.lng], { icon: icon, title: p.name, alt: p.name }).addTo(map);

      var st = D.openStatus(p);
      var pop = h("div", { class: "map-pop" }, [
        h("img", { src: p.photo, alt: p.alt }),
        h("div", { class: "map-pop-body" }, [
          h("strong", { text: p.name }),
          h("small", { text: p.category }),
          st.state !== "none" ? h("span", { class: "badge status-" + st.state, text: st.label }) : null,
          h("div", { class: "w-100 d-flex justify-content-end mt-2" }, [
            h("button", { type: "button", class: "btn-navy-sm", text: "View details", onclick: function () { openPlace(p); } })
          ])
        ].filter(Boolean))
      ]);
      m.bindPopup(pop, { minWidth: 220, maxWidth: 240 });
      m.on("click", function () { map.panTo([p.lat, p.lng], { animate: true }); });
      markers[p.id] = m;
      pts.push([p.lat, p.lng]);
    });
    if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40], maxZoom: 14 });
    else if (pts.length === 1) map.setView(pts[0], 14);
  }

  function setView(v) {
    state.view = v;
    var gallery = v === "gallery";
    document.getElementById("placeGrid").hidden = !gallery;
    document.getElementById("mapView").hidden = gallery;
    if (!gallery) {
      initMap();
      if (map) setTimeout(function () { map.invalidateSize(); updateMarkers(filtered()); }, 50);
    }
  }

  // 7. Modal detail tempat: foto, jam buka, harga tiket, tips & link Google Maps
  function mapsLink(p) { return "https://www.google.com/maps/search/?api=1&query=" + p.lat + "," + p.lng; }

  function openPlace(p) {
    currentPlace = p;
    document.getElementById("placeModalTitle").textContent = p.name;
    var body = document.getElementById("placeModalBody");
    body.innerHTML = "";
    var st = D.openStatus(p);

    body.appendChild(h("img", { class: "modal-hero", src: p.photo, alt: p.alt }));
    var wrap = h("div", { class: "p-3 p-md-4" });

    var badges = h("div", { class: "d-flex flex-wrap gap-2 mb-3" }, [h("span", { class: "badge badge-soft", text: p.category })]);
    if (st.state !== "none") badges.appendChild(h("span", { class: "badge status-" + st.state, text: st.label }));
    if (used[p.id]) badges.appendChild(h("span", { class: "badge badge-soft", text: "featured in " + used[p.id] + (used[p.id] === 1 ? " itinerary" : " itineraries") }));
    wrap.appendChild(badges);

    wrap.appendChild(h("p", { text: p.description }));
    wrap.appendChild(h("p", { class: "mb-3" }, [h("strong", { text: "Admission: " }), p.price]));

    var rows = D.hoursRows(p);
    if (rows.length) {
      var tb = h("tbody");
      rows.forEach(function (r) { tb.appendChild(h("tr", {}, [h("th", { scope: "row", text: r.hari }), h("td", { text: r.jam })])); });
      wrap.appendChild(h("h3", { class: "h5 mt-3", text: "Opening hours" }));
      wrap.appendChild(h("table", { class: "table table-sm hours-table" }, [tb]));
    }
    if (p.hoursNote) wrap.appendChild(h("p", { class: "small text-muted", text: p.hoursNote }));

    if (p.steps) {
      wrap.appendChild(h("h3", { class: "h5 mt-3", text: "How to ride Tram T1" }));
      wrap.appendChild(h("ol", {}, p.steps.map(function (s) { return h("li", { text: s }); })));
    }
    if (p.fares) {
      wrap.appendChild(h("h3", { class: "h5 mt-3", text: "Fares & Tickets" }));
      wrap.appendChild(h("ul", {}, p.fares.map(function (s) { return h("li", { text: s }); })));
    }
    if (p.tips && p.tips.length) {
      wrap.appendChild(h("h3", { class: "h5 mt-3", text: "Visitor Tips" }));
      wrap.appendChild(h("ul", {}, p.tips.map(function (s) { return h("li", { text: s }); })));
    }
    wrap.appendChild(h("a", { class: "maps-link mt-3", href: mapsLink(p), target: "_blank", rel: "noopener noreferrer" }, [ui.icon("geo-alt"), " Open in Google Maps"]));
    body.appendChild(wrap);

    history.replaceState(null, "", "#place=" + encodeURIComponent(p.id));
    document.querySelectorAll(".modal.show").forEach(function (m) { if (m.id !== "placeModal") bootstrap.Modal.getInstance(m).hide(); });
    placeModal.show();
  }

  // 8. Logika tambah tempat ke draft itinerary (Day-by-Day atau Curated List)
  function askDay(p) {
    currentPlace = p;
    var d = NICE.store.getDraft();
    if (d && d.type === "list") {
      commitAdd(0);
      return;
    }
    var n = (d && d.days && d.days.length) ? d.days.length : 1;
    document.getElementById("dayModalPlace").textContent = p.name;
    var box = document.getElementById("dayModalButtons");
    box.innerHTML = "";
    for (var i = 0; i < n; i++) {
      (function (idx) {
        box.appendChild(h("button", { type: "button", class: "btn btn-nice-outline", text: "Day " + (idx + 1), onclick: function () { commitAdd(idx); } }));
      })(i);
    }
    if (n < 7) box.appendChild(h("button", { type: "button", class: "btn btn-nice", text: "+ New Day", onclick: function () { commitAdd(-1); } }));

    var pmEl = document.getElementById("placeModal");
    if (pmEl.classList.contains("show")) {
      pmEl.addEventListener("hidden.bs.modal", function once() {
        pmEl.removeEventListener("hidden.bs.modal", once);
        dayModal.show();
      });
      bootstrap.Modal.getInstance(pmEl).hide();
    } else {
      dayModal.show();
    }
  }

  function commitAdd(idx) {
    var ok = ui.addToDraft(currentPlace.id, idx);
    if (dayModal) dayModal.hide();
    var d = NICE.store.getDraft();
    var msg = (d && d.type === "list")
      ? currentPlace.name + " added to your collection."
      : currentPlace.name + " added to draft itinerary.";
    if (ok) ui.toast(msg, "success");
  }

  // 9. Jam buka & waktu real-time kota Nice (Europe/Paris timezone)
  function tickClock() {
    document.getElementById("nowNice").textContent = "Now in Nice: " + D.nowInNice().text;
  }

  function openFromHash() {
    var m = /^#place=(.+)$/.exec(window.location.hash);
    if (!m) return;
    var p = D.placeById(decodeURIComponent(m[1]));
    if (p) openPlace(p);
  }

  document.addEventListener("DOMContentLoaded", function () {
    placeModal = new bootstrap.Modal(document.getElementById("placeModal"));
    dayModal = new bootstrap.Modal(document.getElementById("dayModal"));

    document.getElementById("placeModalAdd").addEventListener("click", function () { askDay(currentPlace); });
    document.getElementById("placeModal").addEventListener("hidden.bs.modal", function () {
      if (/^#place=/.test(window.location.hash)) history.replaceState(null, "", window.location.pathname);
    });

    document.getElementById("search").addEventListener("input", function (e) { state.q = e.target.value; render(); });
    document.getElementById("viewGallery").addEventListener("change", function () { setView("gallery"); });
    document.getElementById("viewMap").addEventListener("change", function () { setView("map"); });

    renderChips();
    render();
    tickClock();
    setInterval(tickClock, 30000);
    openFromHash();
    window.addEventListener("hashchange", openFromHash);

    /* Calculate "used in N itineraries" after store is ready */
    NICE.store.list().then(function (rows) {
      rows.forEach(function (it) {
        var seen = {};
        (it.days || []).forEach(function (d) { (d.items || []).forEach(function (x) { seen[x.place] = true; }); });
        Object.keys(seen).forEach(function (id) { used[id] = (used[id] || 0) + 1; });
      });
    });
  });
})();