/* =========================================================
   Storage abstraction layer
   ---------------------------------------------------------
   All pages call NICE.store.xxx().
   - When config.js is populated  -> Supabase (REST API)
   - When empty                   -> LOCAL MODE (localStorage)
   ========================================================= */
(function () {
  "use strict";

  var cfg = window.NICE_CONFIG || {};
  var REMOTE = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  var BASE = REMOTE ? cfg.SUPABASE_URL.replace(/\/+$/, "") : "";

  /* ---------- Safe localStorage (may throw in private browsing) ---------- */
  function lsGet(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }
  function ssGet(key) { try { return sessionStorage.getItem(key); } catch (e) { return null; } }
  function ssSet(key, v) { try { sessionStorage.setItem(key, v); } catch (e) { /* ignore */ } }
  function ssDel(key) { try { sessionStorage.removeItem(key); } catch (e) { /* ignore */ } }

  function uid() {
    return "l" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------- Seed itineraries (used in local mode & fallback) ---------- */
  function seeds() {
    var t = Date.now();
    return [
      {
        id: "contoh-kuliner",
        title: "Foodie Walk: Iconic Flavors of Vieux Nice",
        author: "Naura (Foodie)",
        type: "list",
        badge: "Food & Wine",
        cover: "images/fenocchio.jpg",
        likes: 18,
        commentCount: 0,
        created_at: new Date(t - 86400000 * 5).toISOString(),
        seed: true,
        days: [
          {
            title: "Must-Try Gourmet Trail",
            items: [
              { place: "cours-saleya", note: "Start fresh at 8:30 AM before the crowds. Sample fresh figs, regional spices, and steaming hot socca straight from market stalls." },
              { place: "chez-pipo", note: "A legendary spot near the port since 1923. Order warm, wood-fired socca with a generous crack of black pepper." },
              { place: "fenocchio", note: "Stroll the pastel alleys toward Place Rossetti. Choose from nearly 100 flavors of artisanal ice cream; lavender and rosemary are pure Riviera!" },
              { place: "gare-du-sud", note: "Wrap up the evening inside this grand former train station turned food hall. Perfect for wine and relaxed casual dining." }
            ]
          }
        ]
      },
      {
        id: "contoh-klasik-3hari",
        title: "3 Days in Nice & the French Riviera",
        author: "Julian (Traveler)",
        type: "itinerary",
        cover: "images/colline-du-chateau.jpg",
        likes: 14,
        commentCount: 0,
        created_at: new Date(t - 86400000 * 4).toISOString(),
        seed: true,
        days: [
          {
            items: [
              { place: "vieux-nice", note: "Day 1: Get lost in the maze of cobblestone streets, ochre buildings, and quirky artisan boutiques without checking a map." },
              { place: "colline-du-chateau", note: "Ride the free lift up Castle Hill in the late afternoon for the most breathtaking views of the Baie des Anges." },
              { place: "promenade-des-anglais", note: "Take a sunset stroll along the pebbled shore under swaying palm trees as the sky turns gold." }
            ]
          },
          {
            items: [
              { place: "eze", note: "Day 2: Morning bus up to the medieval clifftop village of Èze perched high above the Mediterranean." },
              { place: "monaco", note: "Catch the scenic coastal train to Monaco for mega yachts, glamour, and the lavish Monte-Carlo district." }
            ]
          },
          {
            items: [
              { place: "menton", note: "Day 3: Day trip to the sunny lemon capital right by the Italian border with postcard-perfect pastel houses." },
              { place: "villefranche-sur-mer", note: "Stop by this picturesque sheltered bay with tranquil pebble beaches and colorful fishing boats on your return." }
            ]
          }
        ]
      },
      {
        id: "contoh-budget",
        title: "Budget & Slow Travel Guide in Nice",
        author: "Rifky (Backpacker)",
        type: "list",
        badge: "Budget Guide",
        cover: "images/promenade-des-anglais.jpg",
        likes: 10,
        commentCount: 0,
        created_at: new Date(t - 86400000 * 3).toISOString(),
        seed: true,
        days: [
          {
            title: "Free & Budget Highlights",
            items: [
              { place: "tram-t2", note: "Airport travel hack: Take Tram T2 directly into the city center with a standard transit pass—skip the costly taxi fares." },
              { place: "jardin-albert", note: "The city's oldest public park, peaceful and completely free. Relax beneath palm trees near the Arc de Venet sculpture." },
              { place: "colline-du-chateau", note: "Take the Castle Hill elevator to the panoramic summit for free with zero admission cost." },
              { place: "i-love-nice", note: "Snap the iconic finishing photo at Quai Rauba Capèu with the deep azure Mediterranean as your backdrop." },
              { place: "mont-boron", note: "Pack a picnic and walk scenic wooded trails on Mont Boron overlooking both Nice and Villefranche bay." }
            ]
          }
        ]
      },
      {
        id: "contoh-art-heritage",
        title: "Art Trails & Riviera Architectural Gems",
        author: "Clara (Art Lover)",
        type: "list",
        badge: "Art & Culture",
        cover: "images/opera-de-nice.webp",
        likes: 12,
        commentCount: 0,
        created_at: new Date(t - 86400000 * 2).toISOString(),
        seed: true,
        days: [
          {
            title: "Cultural & Heritage Collection",
            items: [
              { place: "musee-matisse", note: "Admire Henri Matisse's masterworks and paper cut-outs inside a 17th-century Genoese villa on Cimiez hill." },
              { place: "musee-chagall", note: "A bright national museum dedicated to Marc Chagall's luminous Biblical Message canvases." },
              { place: "palais-lascaris", note: "A 17th-century baroque palace in Old Nice featuring ornate marble staircases and a collection of antique musical instruments." },
              { place: "opera-de-nice", note: "Photograph the elegant neoclassical facade of the historic opera house, just steps away from the sea." }
            ]
          }
        ]
      },
      {
        id: "contoh-antibes-escape",
        title: "One-Day Escape: Ancient Ramparts & Antibes Shore",
        author: "Devina",
        type: "itinerary",
        cover: "images/antibes.jpg",
        likes: 8,
        commentCount: 0,
        created_at: new Date(t - 86400000).toISOString(),
        seed: true,
        days: [
          {
            items: [
              { place: "antibes", note: "A quick 15-20 min TER train ride west. Wander the 16th-century sea ramparts and visit the Picasso Museum at Château Grimaldi." },
              { place: "port-lympia", note: "Return to Port Lympia at golden hour for fresh Mediterranean seafood right along the historic quayside." }
            ]
          }
        ]
      }
    ];
  }

  /* =======================================================
     LOCAL IMPLEMENTATION
     ======================================================= */
  var SEED_VER = 6;

  var local = {
    list: function () {
      var data = lsGet("nice.local.itineraries", null);
      var curVer = lsGet("nice.local.seed_v", 1);
      if (!data || !Array.isArray(data) || !data.length || curVer < SEED_VER) {
        var userItems = (data && Array.isArray(data)) ? data.filter(function (it) { return it && !it.seed && it.title; }) : [];
        data = seeds().concat(userItems);
        lsSet("nice.local.itineraries", data);
        lsSet("nice.local.seed_v", SEED_VER);
      }
      var comments = lsGet("nice.local.comments", []);
      data.forEach(function (it) {
        if (it) it.commentCount = comments.filter(function (c) { return c.itinerary_id === it.id; }).length;
      });
      return Promise.resolve(data.slice().sort(function (a, b) {
        var ca = a && a.created_at ? a.created_at : "";
        var cb = b && b.created_at ? b.created_at : "";
        return cb.localeCompare(ca);
      }));
    },
    add: function (item) {
      var data = lsGet("nice.local.itineraries", null) || seeds();
      var row = {
        id: uid(),
        title: item.title,
        author: item.author,
        days: item.days,
        type: item.type || "itinerary",
        badge: item.badge || null,
        likes: 0,
        commentCount: 0,
        created_at: new Date().toISOString()
      };
      data.push(row);
      lsSet("nice.local.itineraries", data);
      return Promise.resolve(row);
    },
    like: function (id, delta) {
      var data = lsGet("nice.local.itineraries", []);
      var count = 0;
      data.forEach(function (it) { if (it.id === id) { it.likes = Math.max(0, (it.likes || 0) + delta); count = it.likes; } });
      lsSet("nice.local.itineraries", data);
      return Promise.resolve(count);
    },
    comments: function (id) {
      var all = lsGet("nice.local.comments", []);
      return Promise.resolve(all.filter(function (c) { return c.itinerary_id === id; }));
    },
    addComment: function (id, author, body) {
      var all = lsGet("nice.local.comments", []);
      var row = { id: uid(), itinerary_id: id, author: author, body: body, created_at: new Date().toISOString() };
      all.push(row);
      lsSet("nice.local.comments", all);
      return Promise.resolve(row);
    },
    removeItinerary: function (id) {
      var data = lsGet("nice.local.itineraries", []).filter(function (it) { return it.id !== id; });
      lsSet("nice.local.itineraries", data);
      var comments = lsGet("nice.local.comments", []).filter(function (c) { return c.itinerary_id !== id; });
      lsSet("nice.local.comments", comments);
      return Promise.resolve();
    },
    removeComment: function (id) {
      lsSet("nice.local.comments", lsGet("nice.local.comments", []).filter(function (c) { return c.id !== id; }));
      return Promise.resolve();
    },
    message: function (msg) {
      var all = lsGet("nice.local.messages", []);
      all.push(Object.assign({ created_at: new Date().toISOString() }, msg));
      lsSet("nice.local.messages", all);
      return Promise.resolve();
    }
  };

  /* =======================================================
     SUPABASE IMPLEMENTATION (REST / PostgREST)
     ======================================================= */
  function session() {
    try { return JSON.parse(ssGet("nice.session") || "null"); } catch (e) { return null; }
  }

  function request(path, options) {
    options = options || {};
    var s = session();
    var headers = {
      apikey: cfg.SUPABASE_ANON_KEY,
      Authorization: "Bearer " + (s && s.access_token ? s.access_token : cfg.SUPABASE_ANON_KEY),
      "Content-Type": "application/json"
    };
    if (options.prefer) headers.Prefer = options.prefer;
    return fetch(BASE + path, {
      method: options.method || "GET",
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) {
          var err = new Error("Request failed (" + res.status + ")");
          err.status = res.status; err.detail = t;
          throw err;
        });
      }
      if (res.status === 204) return null;
      var type = res.headers.get("content-type") || "";
      return type.indexOf("json") > -1 ? res.json() : null;
    });
  }

  var remote = {
    list: function () {
      return request("/rest/v1/itineraries?select=*,comments(count)&order=created_at.desc&limit=100").then(function (rows) {
        return rows.map(function (r) {
          r.commentCount = (r.comments && r.comments[0] && r.comments[0].count) || 0;
          delete r.comments;
          return r;
        });
      });
    },
    add: function (item) {
      return request("/rest/v1/itineraries", {
        method: "POST",
        prefer: "return=representation",
        body: {
          title: item.title,
          author: item.author,
          days: item.days,
          type: item.type || "itinerary",
          badge: item.badge || null
        }
      }).then(function (rows) { var r = rows[0]; r.commentCount = 0; return r; });
    },
    like: function (id, delta) {
      var fn = delta > 0 ? "like_itinerary" : "unlike_itinerary";
      return request("/rest/v1/rpc/" + fn, { method: "POST", body: { p_id: id } });
    },
    comments: function (id) {
      return request("/rest/v1/comments?itinerary_id=eq." + encodeURIComponent(id) + "&select=*&order=created_at.asc");
    },
    addComment: function (id, author, body) {
      return request("/rest/v1/comments", { method: "POST", prefer: "return=representation", body: { itinerary_id: id, author: author, body: body } })
        .then(function (rows) { return rows[0]; });
    },
    removeItinerary: function (id) {
      return request("/rest/v1/itineraries?id=eq." + encodeURIComponent(id), { method: "DELETE" });
    },
    removeComment: function (id) {
      return request("/rest/v1/comments?id=eq." + encodeURIComponent(id), { method: "DELETE" });
    },
    message: function (msg) {
      return request("/rest/v1/messages", { method: "POST", prefer: "return=minimal", body: msg });
    }
  };

  var impl = REMOTE ? remote : local;

  /* Itinerary list: fallback to local seeds if Supabase fails */
  var degraded = false;
  function list() {
    return impl.list().catch(function () {
      degraded = true;
      return local.list();
    });
  }

  /* ---------- Admin (Supabase Auth, email + password) ---------- */
  function login(email, password) {
    if (!REMOTE) return Promise.reject(new Error("Local mode does not require an admin."));
    return fetch(BASE + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { apikey: cfg.SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    }).then(function (res) {
      return res.json().then(function (j) {
        if (!res.ok || !j.access_token) throw new Error("Invalid email or password.");
        ssSet("nice.session", JSON.stringify({ access_token: j.access_token, email: email }));
        return j;
      });
    });
  }
  function logout() { ssDel("nice.session"); }
  function isAdmin() { return REMOTE && !!session(); }

  /* ---------- User Preferences (browser localStorage) ---------- */
  function setHas(key, id) { return lsGet(key, []).indexOf(id) > -1; }
  function setToggle(key, id) {
    var arr = lsGet(key, []);
    var i = arr.indexOf(id);
    if (i > -1) arr.splice(i, 1); else arr.push(id);
    lsSet(key, arr);
    return i === -1;
  }

  window.NICE = window.NICE || {};
  window.NICE.store = {
    remote: REMOTE,
    isDegraded: function () { return degraded; },
    list: list,
    add: function (item) { return impl.add(item); },
    like: function (id, delta) { return impl.like(id, delta); },
    comments: function (id) { return impl.comments(id); },
    addComment: function (id, a, b) { return impl.addComment(id, a, b); },
    removeItinerary: function (id) { return impl.removeItinerary(id); },
    removeComment: function (id) { return impl.removeComment(id); },
    sendMessage: function (msg) { return impl.message(msg); },
    login: login, logout: logout, isAdmin: isAdmin,
    isLiked: function (id) { return setHas("nice.liked", id); },
    toggleLiked: function (id) { return setToggle("nice.liked", id); },
    isSaved: function (id) { return setHas("nice.saved", id); },
    toggleSaved: function (id) { return setToggle("nice.saved", id); },
    savedIds: function () { return lsGet("nice.saved", []); },
    isMine: function (id) { return setHas("nice.mine", id); },
    markMine: function (id) { var a = lsGet("nice.mine", []); a.push(id); lsSet("nice.mine", a); },
    getDraft: function () { return lsGet("nice.draft", null); },
    setDraft: function (d) { lsSet("nice.draft", d); },
    clearDraft: function () { try { localStorage.removeItem("nice.draft"); } catch (e) { /* ignore */ } }
  };
})();
