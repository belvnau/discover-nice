/* =========================================================
   HOMEPAGE (js/home.js)
   Fitur utama:
   1. Menampilkan 4 tempat populer dalam bentuk photo-tile
   2. Menampilkan 3 itinerary dengan likes terbanyak
   ========================================================= */
(function () {
  "use strict";
  var NICE = window.NICE, ui = NICE.ui, h = ui.h, D = NICE.data;

  document.addEventListener("DOMContentLoaded", function () {
    // 1. Render Tempat Populer (photo-tile dengan efek hover zoom & caption mengambang)
    var grid = document.getElementById("homePlaces");
    if (grid) {
      grid.innerHTML = "";
      D.PLACES.filter(function (p) { return p.popular; }).forEach(function (p) {
        var st = D.openStatus(p);
        var kids = [h("img", { src: p.photo, alt: p.alt || p.name, loading: "lazy" })];
        if (st.state !== "none") kids.push(h("span", { class: "status badge status-" + st.state, text: st.label }));
        kids.push(h("span", { class: "caption" }, [
          h("strong", { text: p.name }),
          h("small", { text: p.category })
        ]));

        var btn = h("button", {
          type: "button",
          class: "shot-tile",
          "aria-label": "View details for " + p.name,
          onclick: function () {
            window.location.href = "explore.html#place=" + encodeURIComponent(p.id);
          }
        }, kids);

        grid.appendChild(h("div", { class: "col-sm-6 col-lg-3" }, [btn]));
      });
    }

    // 2. Render 3 Itinerary Terpopuler (diurutkan berdasarkan jumlah likes)
    var box = document.getElementById("homeItin");
    if (box) {
      NICE.store.list().then(function (rows) {
        box.innerHTML = "";
        if (!rows.length) {
          box.appendChild(h("div", { class: "col-12 text-muted", text: "No itineraries yet. Be the first to share your journey!" }));
          return;
        }
        rows.slice().sort(function (a, b) { return (b.likes || 0) - (a.likes || 0); }).slice(0, 3).forEach(function (it) {
          box.appendChild(ui.itineraryCard(it, function (x) {
            window.location.href = "itinerary.html#i=" + encodeURIComponent(x.id);
          }));
        });
      });
    }
  });
})();
