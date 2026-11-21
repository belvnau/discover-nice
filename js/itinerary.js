/* =========================================================
   ITINERARY PAGE (js/itinerary.js)
   Fitur utama:
   1. Tab Browse: Menampilkan daftar itinerary komunitas & sorting
   2. Tab Create: Builder itinerary (Day-by-Day vs Curated List)
   3. Kalkulasi otomatis estimasi tiket masuk (Admission cost)
   4. Modal Detail: Timeline perjalanan, suka (likes) & komentar
   5. Salin & Edit (Copy & Edit) itinerary ke builder draft
   6. Tab Saved: Menyimpan itinerary favorit ke localStorage
   ========================================================= */
(function () {
  "use strict";
  var NICE = window.NICE, ui = NICE.ui, h = ui.h, D = NICE.data, S = NICE.store;

  var items = [];            // Seluruh itinerary yang dimuat
  var current = null;        // Itinerary yang aktif di modal detail
  var itinModal;
  var draft;

  function byId(id) { return items.filter(function (x) { return x.id === id; })[0] || null; }
  function $(id) { return document.getElementById(id); }

  /* ==================== 1. TAB BROWSE & SAVED ==================== */
  // Sorting itinerary: Terbaru (newest) atau Paling Disukai (likes)
  function sorted() {
    var sortEl = $("sort");
    var mode = sortEl ? sortEl.value : "newest";
    return items.slice().sort(function (a, b) {
      if (mode === "likes") return (b.likes || 0) - (a.likes || 0);
      return (b.created_at || "").localeCompare(a.created_at || "");
    });
  }

  function renderList() {
    var box = $("itinList");
    if (!box) return;
    box.innerHTML = "";
    var list = sorted();
    list.forEach(function (it) { box.appendChild(ui.itineraryCard(it, openDetail)); });
    var info = $("listInfo");
    if (info) info.textContent = list.length ? (list.length + (list.length === 1 ? " itinerary" : " itineraries")) : "No itineraries yet. Be the first to share one!";
  }

  function renderSaved() {
    var box = $("savedList");
    if (!box) return;
    box.innerHTML = "";
    var ids = S.savedIds();
    var list = items.filter(function (x) { return ids.indexOf(x.id) > -1; });
    list.forEach(function (it) { box.appendChild(ui.itineraryCard(it, openDetail)); });
    var empty = $("savedEmpty");
    if (empty) empty.hidden = list.length > 0;
  }

  function load() {
    return S.list().then(function (rows) {
      items = rows || [];
      renderList();
      renderSaved();
    }).catch(function (err) {
      console.error("Failed to load itineraries:", err);
    });
  }

  /* ==================== 2. MODAL DETAIL ITINERARY, LIKES & KOMENTAR ==================== */
  // Hitung total estimasi biaya tiket masuk untuk seluruh tempat dalam itinerary
  function costText(days) {
    var c = ui.costOf(days);
    return c > 0 ? "Estimated admission: ± €" + c : "Estimated admission: Free / €0";
  }

  function renderDays(days, target, it) {
    target.innerHTML = "";
    var isList = it && (it.type === "list" || it.type === "guide");
    (days || []).forEach(function (day, i) {
      if (!isList) {
        target.appendChild(h("h3", { class: "day-title", text: day.title || ("Day " + (i + 1)) }));
      } else if (day.title) {
        target.appendChild(h("h3", { class: "day-title", text: day.title }));
      }
      var ol = h("ol", { class: "timeline" });
      (day.items || []).forEach(function (x) {
        var p = D.placeById(x.place);
        if (!p) return;
        var costBadge = p.cost ? h("span", { class: "badge badge-soft small ms-2", text: "€" + p.cost }) : null;
        ol.appendChild(h("li", {}, [
          h("div", { class: "d-flex gap-3 align-items-start" }, [
            h("img", { src: p.photo, alt: "", loading: "lazy" }),
            h("div", { class: "flex-grow-1" }, [
              h("div", { class: "d-flex align-items-center flex-wrap" }, [
                h("a", { class: "t-name", href: "explore.html#place=" + encodeURIComponent(p.id), text: p.name }),
                costBadge
              ]),
              x.note ? h("p", { class: "t-note mt-1 mb-0", text: x.note }) : null
            ])
          ])
        ]));
      });
      target.appendChild(ol);
    });
  }

  function paintActions() {
    var it = current;
    var liked = S.isLiked(it.id), saved = S.isSaved(it.id);
    var like = $("btnLike");
    like.innerHTML = "";
    like.appendChild(ui.icon(liked ? "heart-fill" : "heart"));
    like.appendChild(document.createTextNode(" " + (it.likes || 0)));
    like.setAttribute("aria-pressed", String(liked));
    like.setAttribute("aria-label", (liked ? "Unlike. " : "Like. ") + (it.likes || 0) + " likes");
    var save = $("btnSave");
    save.innerHTML = "";
    save.appendChild(ui.icon(saved ? "bookmark-fill" : "bookmark"));
    save.appendChild(document.createTextNode(saved ? " Saved" : " Save"));
    save.setAttribute("aria-pressed", String(saved));
    $("btnDelete").classList.toggle("admin-only", !(S.isMine(it.id) && !S.remote));
  }

  function openDetail(it) {
    current = it;
    $("itinModalTitle").textContent = it.title;
    $("itinModalMeta").textContent = "by " + it.author + " · " + ui.fmtDate(it.created_at);
    $("itinCost").textContent = costText(it.days);
    renderDays(it.days, $("itinDays"), it);
    paintActions();
    loadComments();
    $("cError").hidden = true;
    try { if (!$("cAuthor").value) $("cAuthor").value = localStorage.getItem("nice.nick") || ""; } catch (e) { /* ignore */ }
    history.replaceState(null, "", "#i=" + encodeURIComponent(it.id));
    itinModal.show();
  }

  function loadComments() {
    var it = current;
    var box = $("commentList");
    box.innerHTML = "";
    S.comments(it.id).then(function (rows) {
      if (!current || current.id !== it.id) return;
      $("commentCount").textContent = "(" + rows.length + ")";
      if (!rows.length) {
        box.appendChild(h("p", { class: "text-muted small", text: "No comments yet. Write the first one!" }));
        return;
      }
      rows.forEach(function (c) {
        box.appendChild(h("div", { class: "comment" }, [
          h("div", { class: "d-flex justify-content-between align-items-start gap-2" }, [
            h("div", { class: "small" }, [h("strong", { text: c.author }), h("span", { class: "text-muted", text: " · " + ui.fmtDate(c.created_at) })]),
            h("button", { type: "button", class: "btn btn-sm btn-outline-danger admin-only", "aria-label": "Delete comment from " + c.author, onclick: function () {
              S.removeComment(c.id).then(function () { it.commentCount = Math.max(0, (it.commentCount || 1) - 1); loadComments(); renderList(); })
                .catch(function () { ui.toast("Failed to delete comment.", "danger"); });
            } }, [ui.icon("trash")])
          ]),
          h("p", { text: c.body })
        ]));
      });
    }).catch(function () {
      box.appendChild(h("p", { class: "text-danger small", text: "Comments could not be loaded." }));
    });
  }

  function initDetail() {
    itinModal = new bootstrap.Modal($("itinModal"));
    $("itinModal").addEventListener("hidden.bs.modal", function () {
      if (/^#i=/.test(window.location.hash)) history.replaceState(null, "", window.location.pathname);
      current = null;
    });

    $("btnLike").addEventListener("click", function () {
      var it = current;
      var nowLiked = S.toggleLiked(it.id);
      var delta = nowLiked ? 1 : -1;
      it.likes = Math.max(0, (it.likes || 0) + delta);
      paintActions();
      S.like(it.id, delta).then(function (n) {
        if (typeof n === "number") { it.likes = n; paintActions(); }
        renderList(); renderSaved();
      }).catch(function () {
        S.toggleLiked(it.id);
        it.likes = Math.max(0, it.likes - delta);
        paintActions();
        ui.toast("Failed to process like. Please try again.", "danger");
      });
    });

    $("btnSave").addEventListener("click", function () {
      var saved = S.toggleSaved(current.id);
      paintActions();
      renderSaved();
      ui.toast(saved ? "Itinerary saved." : "Removed from saved.");
    });

    $("btnCopy").addEventListener("click", function () {
      if (ui.draftCount() > 0 && !window.confirm("Your current draft itinerary will be replaced with this copy. Continue?")) return;
      var copy = {
        title: "Copy: " + current.title,
        author: draft && draft.author ? draft.author : "",
        days: JSON.parse(JSON.stringify(current.days || [{ items: [] }]))
      };
      copy.title = copy.title.slice(0, 80);
      S.setDraft(copy);
      draft = copy;
      ui.updateBadge();
      renderBuilder();
      itinModal.hide();
      showTab("tab-create");
      ui.toast("Copied to draft. Customize and share your plan!", "success");
    });

    $("btnDelete").addEventListener("click", function () {
      if (!window.confirm("Delete this itinerary along with its comments?")) return;
      var id = current.id;
      S.removeItinerary(id).then(function () {
        items = items.filter(function (x) { return x.id !== id; });
        itinModal.hide();
        renderList(); renderSaved();
        ui.toast("Itinerary deleted.");
      }).catch(function () { ui.toast("Failed to delete. Make sure you are logged in as admin.", "danger"); });
    });

    var cForm = $("commentForm");
    var saveAuthor = null;
    try { saveAuthor = localStorage.getItem("nice.nick"); } catch (e) { /* ignore */ }
    if (saveAuthor) $("cAuthor").value = saveAuthor;
    cForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = $("cError");
      var a = $("cAuthor").value.trim(), b = $("cBody").value.trim();
      if (a.length < 2 || a.length > 30) { err.textContent = "Nickname must be 2 to 30 characters."; err.hidden = false; return; }
      if (!b || b.length > 500) { err.textContent = "Comment must be 1 to 500 characters."; err.hidden = false; return; }
      err.hidden = true;
      var it = current;
      S.addComment(it.id, a, b).then(function () {
        try { localStorage.setItem("nice.nick", a); } catch (e2) { /* ignore */ }
        $("cBody").value = "";
        it.commentCount = (it.commentCount || 0) + 1;
        loadComments(); renderList();
      }).catch(function () { ui.toast("Failed to post comment.", "danger"); });
    });

    document.addEventListener("nice:adminchange", function () { if (current) { paintActions(); loadComments(); } });
  }

  /* ==================== 3. BUILDER ITINERARY (TAB CREATE) ==================== */
  // Muat atau buat kerangka awal draft dari localStorage
  function ensureDraft() {
    draft = S.getDraft() || { title: "", author: "", type: "itinerary", days: [{ items: [] }] };
    if (!draft.type) draft.type = "itinerary";
    if (!Array.isArray(draft.days) || !draft.days.length) draft.days = [{ items: [] }];
    draft.days.forEach(function (d) { if (!d || !Array.isArray(d.items)) d.items = []; });
    var nick = null;
    try { nick = localStorage.getItem("nice.nick"); } catch (e) { /* ignore */ }
    if (!draft.author && nick) draft.author = nick;
  }

  function saveDraft() {
    S.setDraft(draft);
    ui.updateBadge();
    renderSummary();
  }

  function placeSelect() {
    var sel = h("select", { class: "form-select form-select-sm", "aria-label": "Select a place" }, [
      h("option", { value: "", text: "Select a place to add…" })
    ]);
    D.CATEGORIES.forEach(function (c) {
      var og = h("optgroup", { label: c });
      D.PLACES.filter(function (p) { return p.category === c; }).forEach(function (p) {
        var opt = h("option", { value: p.id, text: p.name + (p.cost ? " (€" + p.cost + ")" : " (Free)") });
        og.appendChild(opt);
      });
      sel.appendChild(og);
    });
    return sel;
  }

  function move(arr, i, dir) {
    var j = i + dir;
    if (j < 0 || j >= arr.length) return;
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }

  function renderBuilder() {
    var isList = draft.type === "list";
    var titleEl = $("bTitle");
    if (titleEl) {
      titleEl.value = draft.title || "";
      titleEl.placeholder = isList ? "e.g. Best Cafes & Sweets in Old Nice" : "e.g. 2 Days of Slow Travel in Nice";
    }
    var authorEl = $("bAuthor");
    if (authorEl) authorEl.value = draft.author || "";

    var radItin = $("typeItinerary");
    var radList = $("typeList");
    if (radItin && radList) {
      if (isList) radList.checked = true;
      else radItin.checked = true;
    }

    var addDayBtn = $("addDay");
    if (addDayBtn) addDayBtn.hidden = isList;

    var box = $("builderDays");
    if (!box) return;
    box.innerHTML = "";

    draft.days.forEach(function (day, di) {
      var list = h("div", { class: "d-flex flex-column gap-2 mb-3" });
      (day.items || []).forEach(function (it, ii) {
        var p = D.placeById(it.place);
        if (!p) return;

        var noteInput = h("input", {
          class: "form-control form-control-sm",
          maxlength: "200",
          placeholder: "Note / tips (optional)",
          "aria-label": "Note for " + p.name
        });
        noteInput.value = it.note || "";
        noteInput.addEventListener("input", function (e) {
          it.note = e.target.value;
          S.setDraft(draft);
        });

        list.appendChild(h("div", { class: "builder-item p-3" }, [
          h("div", { class: "d-flex gap-3 align-items-center mb-2" }, [
            h("img", { src: p.photo, alt: "", loading: "lazy", class: "rounded-2", style: "width: 48px; height: 48px; object-fit: cover;" }),
            h("div", { class: "flex-grow-1" }, [
              h("div", { class: "fw-semibold", text: p.name }),
              h("div", { class: "d-flex gap-2 align-items-center mt-1" }, [
                h("span", { class: "badge badge-soft small", text: p.category }),
                p.cost
                  ? h("span", { class: "small text-muted", text: "Ticket: €" + p.cost })
                  : h("span", { class: "small text-success", text: "Free admission" })
              ])
            ]),
            h("div", { class: "btn-group btn-group-sm", role: "group", "aria-label": "Organize " + p.name }, [
              h("button", { type: "button", class: "btn btn-outline-secondary", "aria-label": "Move up " + p.name, disabled: ii === 0, onclick: function () { move(day.items, ii, -1); saveDraft(); renderBuilder(); } }, [ui.icon("arrow-up")]),
              h("button", { type: "button", class: "btn btn-outline-secondary", "aria-label": "Move down " + p.name, disabled: ii === day.items.length - 1, onclick: function () { move(day.items, ii, 1); saveDraft(); renderBuilder(); } }, [ui.icon("arrow-down")]),
              h("button", { type: "button", class: "btn btn-outline-danger", "aria-label": "Remove " + p.name, onclick: function () { day.items.splice(ii, 1); saveDraft(); renderBuilder(); } }, [ui.icon("x-lg")])
            ])
          ]),
          noteInput
        ]));
      });

      if (!day.items.length) {
        list.appendChild(h("p", { class: "text-muted small border-top pt-3 mb-0", text: isList ? "No places added to this collection yet. Choose a place below or add from Explore!" : "No places added to this day yet. Choose a place below or add from Explore!" }));
      }

      var sel = placeSelect();
      var addBtn = h("button", { type: "button", class: "btn btn-sm btn-nice text-nowrap", onclick: function () {
        if (!sel.value) return;
        day.items.push({ place: sel.value, note: "" });
        saveDraft();
        renderBuilder();
      } }, [ui.icon("plus-lg"), " Add"]);

      var sectionTitle = isList ? "Places in this Collection" : ("Day " + (di + 1));
      box.appendChild(h("section", { class: "builder-day-section", "aria-label": sectionTitle }, [
        h("div", { class: "builder-day-header d-flex justify-content-between align-items-center" }, [
          h("h2", { class: "h5 mb-0 fw-bold", text: sectionTitle }),
          (!isList && draft.days.length > 1) ? h("button", { type: "button", class: "btn btn-sm btn-outline-danger", "aria-label": "Remove Day " + (di + 1), onclick: function () {
            if (day.items.length && !window.confirm("Remove Day " + (di + 1) + " and all its places?")) return;
            draft.days.splice(di, 1);
            saveDraft();
            renderBuilder();
          } }, [ui.icon("trash"), " Remove day"]) : null
        ]),
        list,
        h("div", { class: "d-flex gap-2 mt-3" }, [
          h("div", { class: "flex-grow-1" }, [sel]),
          addBtn
        ])
      ]));
    });

    renderSummary();
  }

  function renderSummary() {
    var isList = draft && draft.type === "list";
    var elLabel = $("sumLabel");
    var elDays = $("sumDays") || $("bDaysCount");
    var elPlaces = $("sumPlaces") || $("bPlacesCount");
    var elCost = $("sumCost") || $("bCost");
    if (elLabel) {
      elLabel.textContent = isList ? "Format" : "Days";
    }
    if (elDays) {
      var dCount = (draft && draft.days) ? draft.days.length : 1;
      elDays.textContent = isList ? "Curated List" : (dCount + (dCount === 1 ? " day" : " days"));
    }
    if (elPlaces) {
      var count = ui.placeCountOf(draft ? draft.days : []);
      elPlaces.textContent = count + (count === 1 ? " place" : " places");
    }
    if (elCost) {
      var c = ui.costOf(draft ? draft.days : []);
      elCost.textContent = c > 0 ? "± €" + c : "Free / €0";
    }
  }

  function initBuilder() {
    ensureDraft();
    renderBuilder();
    var bTitle = $("bTitle");
    if (bTitle) bTitle.addEventListener("input", function (e) {
      draft.title = e.target.value;
      S.setDraft(draft);
      bTitle.classList.remove("is-invalid");
    });
    var bAuthor = $("bAuthor");
    if (bAuthor) bAuthor.addEventListener("input", function (e) {
      draft.author = e.target.value;
      S.setDraft(draft);
      bAuthor.classList.remove("is-invalid");
    });

    var radItin = $("typeItinerary");
    var radList = $("typeList");
    if (radItin) {
      radItin.addEventListener("change", function () {
        if (radItin.checked) {
          draft.type = "itinerary";
          saveDraft();
          renderBuilder();
        }
      });
    }
    if (radList) {
      radList.addEventListener("change", function () {
        if (radList.checked) {
          draft.type = "list";
          if (draft.days.length > 1) {
            var merged = [];
            draft.days.forEach(function (d) { merged = merged.concat(d.items || []); });
            draft.days = [{ items: merged }];
          }
          saveDraft();
          renderBuilder();
        }
      });
    }

    var btnAddDay = $("addDay") || $("bAddDay");
    if (btnAddDay) {
      btnAddDay.addEventListener("click", function () {
        if (draft.days.length >= 7) { ui.toast("Maximum 7 days per itinerary.", "warning"); return; }
        draft.days.push({ items: [] });
        saveDraft();
        renderBuilder();
      });
    }

    var btnReset = $("resetDraft") || $("bClear");
    if (btnReset) {
      btnReset.addEventListener("click", function () {
        if (ui.draftCount() > 0 && !window.confirm("Clear all items in the draft?")) return;
        S.clearDraft();
        ensureDraft();
        renderBuilder();
        ui.updateBadge();
      });
    }

    var form = $("builder");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var hint = $("publishHint");
      var bTitleEl = $("bTitle"), bAuthorEl = $("bAuthor");
      var days = draft.days.filter(function (d) { return d.items && d.items.length; }).map(function (d) {
        return {
          items: d.items.map(function (x) {
            return {
              place: x.place,
              note: String(x.note || "").trim().slice(0, 200)
            };
          })
        };
      });
      var title = (draft.title || "").trim(), author = (draft.author || "").trim();
      var hasTitleErr = title.length < 3 || title.length > 80;
      var hasAuthorErr = author.length < 2 || author.length > 30;

      if (bTitleEl) bTitleEl.classList.toggle("is-invalid", hasTitleErr);
      if (bAuthorEl) bAuthorEl.classList.toggle("is-invalid", hasAuthorErr);

      if (hasTitleErr || hasAuthorErr) {
        hint.textContent = "Please fill in title (3–80 characters) and your name (2–30 characters).";
        return;
      }
      if (!days.length) { hint.textContent = "Add at least one place to your itinerary."; return; }
      hint.textContent = "";
      if (bTitleEl) bTitleEl.classList.remove("is-invalid");
      if (bAuthorEl) bAuthorEl.classList.remove("is-invalid");
      var btn = $("publishBtn");
      btn.disabled = true;
      var itemToSave = {
        title: title,
        author: author,
        days: days,
        type: draft.type || "itinerary",
        badge: draft.type === "list" ? "Collection" : null
      };
      S.add(itemToSave).then(function (row) {
        if (!S.remote) S.markMine(row.id);
        try { localStorage.setItem("nice.nick", author); } catch (e2) { /* ignore */ }
        S.clearDraft();
        ensureDraft(); draft.author = author;
        S.setDraft(draft);
        renderBuilder();
        ui.updateBadge();
        ui.toast("Plan published successfully!", "success");
        return load().then(function () {
          showTab("tab-browse");
          var fresh = byId(row.id);
          if (fresh) openDetail(fresh);
        });
      }).catch(function () {
        hint.textContent = "Failed to publish. Check connection and try again.";
      }).then(function () { btn.disabled = false; });
    });
  }

  /* ==================== 4. NAVIGASI TAB & URL HASH ROUTING ==================== */
  function showTab(id) {
    var btn = $(id);
    if (btn) bootstrap.Tab.getOrCreateInstance(btn).show();
  }

  function routeHash() {
    var hash = window.location.hash;
    if (hash === "#create") { showTab("tab-create"); return; }
    var m = /^#i=(.+)$/.exec(hash);
    if (m) {
      var it = byId(decodeURIComponent(m[1]));
      if (it) openDetail(it);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    load().then(routeHash);
    try { initDetail(); } catch (e) { console.error("initDetail error:", e); }
    try { initBuilder(); } catch (e) { console.error("initBuilder error:", e); }
    var sort = $("sort");
    if (sort) sort.addEventListener("change", renderList);
    var tabSaved = $("tab-saved");
    if (tabSaved) tabSaved.addEventListener("shown.bs.tab", renderSaved);
    var tabCreate = $("tab-create");
    if (tabCreate) {
      tabCreate.addEventListener("shown.bs.tab", function () {
        ensureDraft();
        renderBuilder();
      });
    }
    window.addEventListener("hashchange", routeHash);
  });
})();
