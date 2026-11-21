/* =========================================================
   CONTACT PAGE (js/contact.js)
   Fitur utama:
   1. Validasi form sisi klien menggunakan Bootstrap 5
   2. Penghitung karakter dinamis untuk pesan (textarea)
   3. Pengiriman pesan & penyimpanan lokal via NICE.store
   ========================================================= */
(function () {
  "use strict";
  var NICE = window.NICE, ui = NICE.ui;

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("contactForm");
    var message = document.getElementById("message");
    var counter = document.getElementById("messageCount");
    var submitBtn = document.getElementById("submitBtn");

    // 1. Live character counter pada textarea pesan
    message.addEventListener("input", function () { counter.textContent = message.value.length + "/1000"; });

    // 2. Event listener pengiriman pesan dengan validasi Bootstrap
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }
      var visitDate = document.getElementById("visitDate").value;
      var payload = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        topic: document.getElementById("topic").value,
        visit_date: visitDate ? visitDate : null,
        body: message.value.trim()
      };
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      NICE.store.sendMessage(payload).then(function () {
        ui.toast("Message sent successfully. Thank you!", "success");
        form.reset();
        form.classList.remove("was-validated");
        counter.textContent = "0/1000";
      }).catch(function () {
        ui.toast("Failed to send message. Please try again or email us directly.", "danger");
      }).then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      });
    });
  });
})();
