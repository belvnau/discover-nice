/* =========================================================
   SHARED UTILITIES (js/main.js)
   Fitur utama:
   1. Dark Mode / Light Mode persisten (localStorage)
   2. Notifikasi Toast Bootstrap dinamis
   3. Counter draft itinerary & lencana badge di navbar
   4. Kalkulasi otomatis estimasi biaya tiket masuk
   5. Komponen kartu bersama (kartu itinerary & kartu tempat)
   6. Fallback gambar aman & rendering anti-XSS (textContent)
   ========================================================= */
(function () {
  "use strict";

  var NICE = (window.NICE = window.NICE || {});

  // 1. Fallback gambar otomatis: jika foto belum ada/gagal dimuat, pakai foto hero
  document.addEventListener("error", function (e) {
    var img = e.target;
    if (!img || img.tagName !== "IMG" || img.dataset.fallback) return;
    img.dataset.fallback = "1";
    img.src = "images/hero-nice.jpg";
  }, true);

  // 2. DOM Helper: h(tag, attrs, children) untuk membuat elemen tanpa innerHTML (anti-XSS)
  function h(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "text") node.textContent = v;
        else if (k === "class") node.className = v;
        else if (k.indexOf("on") === 0 && typeof v === "function") node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function icon(name) { return h("i", { class: "bi bi-" + name, "aria-hidden": "true" }); }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    } catch (e) { return ""; }
  }

  // 3. Tema Dark / Light Mode (tersimpan di localStorage "nice.theme")
  function currentTheme() { return document.documentElement.getAttribute("data-bs-theme") || "light"; }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    try { localStorage.setItem("nice.theme", theme); } catch (e) { /* ignore */ }
    var btn = document.getElementById("themeToggle");
    if (btn) {
      var dark = theme === "dark";
      btn.setAttribute("aria-pressed", String(dark));
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      btn.innerHTML = "";
      btn.appendChild(icon(dark ? "sun-fill" : "moon-stars-fill"));
    }
  }

  // 4. Notifikasi Toast dinamis (Bootstrap Toast)
  function toast(message, type) {
    var box = document.getElementById("toastBox");
    if (!box) return;
    var el = h("div", { class: "toast align-items-center text-bg-" + (type || "dark") + " border-0", role: "status", "aria-live": "polite", "aria-atomic": "true" }, [
      h("div", { class: "d-flex" }, [
        h("div", { class: "toast-body", text: message }),
        h("button", { type: "button", class: "btn-close btn-close-white me-2 m-auto", "data-bs-dismiss": "toast", "aria-label": "Close" })
      ])
    ]);
    box.appendChild(el);
    var t = new bootstrap.Toast(el, { delay: 3500 });
    el.addEventListener("hidden.bs.toast", function () { el.remove(); });
    t.show();
  }

  // 5. Manajemen draft itinerary & lencana counter di navbar
  function draftCount() {
    var d = NICE.store.getDraft();
    if (!d || !d.days) return 0;
    return d.days.reduce(function (n, day) { return n + (day.items ? day.items.length : 0); }, 0);
  }

  function updateBadge() {
    var n = draftCount();
    document.querySelectorAll(".draft-badge").forEach(function (b) {
      b.textContent = String(n);
      b.hidden = n === 0;
    });
  }

  /* Add place to draft. dayIndex = day number (0...), -1 = new day */
  function addToDraft(placeId, dayIndex) {
    var d = NICE.store.getDraft() || { title: "", author: "", days: [{ items: [] }] };
    if (!d.days || !d.days.length) d.days = [{ items: [] }];
    if (dayIndex === -1 || dayIndex >= d.days.length) {
      if (d.days.length >= 7) { toast("Maximum 7 days per itinerary.", "warning"); return false; }
      d.days.push({ items: [] });
      dayIndex = d.days.length - 1;
    }
    d.days[dayIndex].items.push({ place: placeId, note: "" });
    NICE.store.setDraft(d);
    updateBadge();
    return true;
  }

  // 6. Kalkulasi total estimasi biaya tiket masuk tempat wisata
  function costOf(days) {
    var total = 0;
    (days || []).forEach(function (day) {
      (day.items || []).forEach(function (it) {
        var p = NICE.data.placeById(it.place);
        if (p) total += p.cost || 0;
      });
    });
    return total;
  }

  function placeCountOf(days) {
    return (days || []).reduce(function (n, d) { return n + ((d && d.items) ? d.items.length : 0); }, 0);
  }

  // 7. Komponen kartu itinerary (dipakai di Beranda & halaman Itinerary)
  function itineraryCard(it, onOpen) {
    if (!it) return h("div");
    var names = [];
    (it.days || []).forEach(function (d) {
      if (!d || !d.items) return;
      (d.items || []).forEach(function (x) {
        if (!x || !x.place) return;
        var p = NICE.data.placeById(x.place);
        if (p && names.length < 4) names.push(p.name);
      });
    });
    var first = (it.days && it.days[0] && it.days[0].items && it.days[0].items[0]) ? NICE.data.placeById(it.days[0].items[0].place) : null;
    var img = it.cover || (first ? first.photo : "images/hero-nice.jpg");
    var open = function () { if (onOpen) onOpen(it); };
    var isList = it.type === "list" || it.type === "guide";
    var durationText = isList ? (it.badge || "Collection") : ((it.days || []).length + ((it.days || []).length === 1 ? " day" : " days"));
    var count = placeCountOf(it.days);
    var placeText = count + (count === 1 ? " place" : " places");
    var card = h("article", { class: "card itin-card h-100" }, [
      h("img", { class: "card-img-top", src: img, alt: "", loading: "lazy" }),
      h("div", { class: "card-body d-flex flex-column" }, [
        h("div", { class: "d-flex gap-2 mb-2 flex-wrap" }, [
          h("span", { class: "badge badge-soft", text: durationText }),
          h("span", { class: "badge badge-soft", text: placeText })
        ]),
        h("h3", { class: "h5 card-title" }, [
          h("a", { href: "itinerary.html#i=" + encodeURIComponent(it.id), class: "stretched-link text-decoration-none", text: it.title || "Untitled Itinerary", onclick: function (e) { if (onOpen) { e.preventDefault(); open(); } } })
        ]),
        h("p", { class: "small text-muted mb-2", text: "by " + (it.author || "Traveler") + " · " + fmtDate(it.created_at) }),
        h("p", { class: "small mb-3 flex-grow-1", text: names.join(" → ") + (placeCountOf(it.days) > names.length ? " …" : "") }),
        h("div", { class: "d-flex gap-3 small text-muted" }, [
          h("span", {}, [icon("heart-fill"), " " + (it.likes || 0)]),
          h("span", {}, [icon("chat-dots"), " " + (it.commentCount || 0)])
        ])
      ])
    ]);
    return h("div", { class: "col-md-6 col-lg-4" }, [card]);
  }

  /* ---------- Place Card Component ----------
     opts.onOpen(place)  : card click handler
     opts.onAdd(place)   : "+ Itinerary" button handler (optional)
     opts.used           : number of itineraries using this place */
  function placeCard(p, opts) {
    opts = opts || {};
    var st = NICE.data.openStatus(p);
    var thumbKids = [h("img", { src: p.photo, alt: p.alt, loading: "lazy" })];
    if (st.state !== "none") thumbKids.push(h("span", { class: "status badge status-" + st.state, text: st.label }));

    var foot = [];
    if (typeof opts.used === "number" && opts.used > 0) {
      foot.push(h("span", { class: "small text-muted", text: "in " + opts.used + (opts.used === 1 ? " itinerary" : " itineraries") }));
    } else {
      foot.push(h("span", { class: "small text-muted", text: p.price }));
    }
    if (opts.onAdd) {
      foot.push(h("button", { type: "button", class: "btn btn-nice btn-sm btn-add", "aria-label": "Add " + p.name + " to itinerary", onclick: function () { opts.onAdd(p); } }, [icon("plus-lg"), " Itinerary"]));
    }

    var card = h("article", { class: "place-card h-100 position-relative d-flex flex-column" }, [
      h("div", { class: "thumb" }, thumbKids),
      h("div", { class: "p-3 d-flex flex-column flex-grow-1" }, [
        h("span", { class: "badge badge-soft align-self-start mb-2", text: p.category }),
        h("h3", { class: "card-title mb-1" }, [
          h("button", { type: "button", class: "open-detail", text: p.name, onclick: function () { opts.onOpen(p); } })
        ]),
        h("p", { class: "small text-muted flex-grow-1", text: p.summary }),
        h("div", { class: "d-flex justify-content-between align-items-center gap-2" }, foot)
      ])
    ]);
    return h("div", { class: "col-sm-6 col-lg-4 col-xl-3", "data-id": p.id }, [card]);
  }

  // 8. Autentikasi Admin (modal login & session)
  function injectShared() {
    var host = document.createElement("div");
    host.innerHTML =
      '<div class="toast-container position-fixed bottom-0 end-0 p-3" id="toastBox"></div>' +
      '<div class="modal fade" id="adminModal" tabindex="-1" aria-labelledby="adminTitle" aria-hidden="true">' +
      '<div class="modal-dialog modal-dialog-centered modal-sm"><form class="modal-content" id="adminForm" novalidate>' +
      '<div class="modal-header"><h2 class="modal-title h5" id="adminTitle">Admin Login</h2>' +
      '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>' +
      '<div class="modal-body">' +
      '<div class="mb-3"><label class="form-label" for="adminEmail">Email</label><input class="form-control" type="email" id="adminEmail" autocomplete="username" required></div>' +
      '<div class="mb-1"><label class="form-label" for="adminPass">Password</label><input class="form-control" type="password" id="adminPass" autocomplete="current-password" required></div>' +
      '<p class="small text-danger mb-0" id="adminError" role="alert" hidden></p>' +
      '</div><div class="modal-footer"><button type="submit" class="btn btn-nice w-100">Login</button></div>' +
      '</form></div></div>';
    while (host.firstChild) document.body.appendChild(host.firstChild);
  }

  function refreshAdminUI() {
    var admin = NICE.store.isAdmin();
    document.body.classList.toggle("is-admin", admin);
    document.querySelectorAll(".admin-sep").forEach(function (a) { a.hidden = !NICE.store.remote; });
    document.querySelectorAll(".admin-link").forEach(function (a) {
      a.hidden = !NICE.store.remote;
      a.textContent = admin ? "Logout Admin" : "Admin";
    });
    document.dispatchEvent(new CustomEvent("nice:adminchange"));
  }

  function initAdmin() {
    var form = document.getElementById("adminForm");
    var modalEl = document.getElementById("adminModal");
    var modal = new bootstrap.Modal(modalEl);
    document.querySelectorAll(".admin-link").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        if (NICE.store.isAdmin()) {
          NICE.store.logout();
          refreshAdminUI();
          toast("You have logged out of admin mode.");
        } else {
          document.getElementById("adminError").hidden = true;
          modal.show();
        }
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = document.getElementById("adminError");
      NICE.store.login(document.getElementById("adminEmail").value.trim(), document.getElementById("adminPass").value)
        .then(function () {
          form.reset();
          modal.hide();
          refreshAdminUI();
          toast("Logged in as admin.", "success");
        })
        .catch(function (ex) {
          err.textContent = ex.message || "Login failed.";
          err.hidden = false;
        });
    });
    refreshAdminUI();
  }

  /* ---------- Initialization ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    injectShared();
    applyTheme(currentTheme());
    var tbtn = document.getElementById("themeToggle");
    if (tbtn) tbtn.addEventListener("click", function () { applyTheme(currentTheme() === "dark" ? "light" : "dark"); });
    updateBadge();
    initAdmin();
    document.querySelectorAll("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });
  });

  NICE.ui = {
    h: h, icon: icon, fmtDate: fmtDate, toast: toast, updateBadge: updateBadge,
    addToDraft: addToDraft, draftCount: draftCount, costOf: costOf, placeCountOf: placeCountOf,
    itineraryCard: itineraryCard, placeCard: placeCard, refreshAdminUI: refreshAdminUI
  };
})();
