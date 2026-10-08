/* भुगतान-सेतु (Razorpay scaffold) · BE-S11
   ─────────────────────────────────────────
   Design: the site is a static offline PWA, so the zero-backend path is a
   Razorpay Payment Button (its data-payment_button_id goes in PAYMENT_BUTTONS
   below). Checkout is inherently online, so the Razorpay script is loaded
   lazily, only on a buy click; the rest of the site stays fully offline, and
   that click is its single, user-initiated network exception.

   While an ID is empty the CTA stays in an honest waitlist ("प्रतीक्षा-सूची",
   mailto) mode, with no fake checkout; a button goes live once its ID is set. */
(function (root) {
  "use strict";

  // ═══ Payment Button IDs (Razorpay dashboard → Payment Button → ID) ═══
  const PAYMENT_BUTTONS = {
    sadhaka: "",   // ₹499/वर्ष  · साधक (B2C)
    mandir: "",    // ₹14,999/वर्ष · मन्दिर/प्रकाशक (B2B)
    gurukul: "",   // ₹4,999/वर्ष · गुरुकुल/विद्यालय (EDU)
  };
  // ═════════════════════════════════════════════════════════════════════

  // Per-SKU mailto built at mount time (fixes the earlier bug where {SKU} was encoded
  // before replace and never matched). The subject carries the SKU and the page:
  // "प्रतीक्षा-सूची · <sku> · <page>".
  function pageToken() {
    const p = (typeof location !== "undefined" && location.pathname) || "";
    return (p.split("/").pop() || "index.html").replace(/\.html?$/i, "") || "index";
  }
  function waitlistMailto(sku) {
    return "mailto:api@bharatephemeris.com?subject=" +
      encodeURIComponent("प्रतीक्षा-सूची · " + sku + " · " + pageToken()) + "&body=" +
      encodeURIComponent("SKU: " + sku + "\nनाम: \nनगर: \nप्रयोजन: ");
  }

  function isConfigured(sku) {
    return typeof PAYMENT_BUTTONS[sku] === "string" && PAYMENT_BUTTONS[sku].trim().length > 0;
  }

  /* Mount a buy-CTA into `el` for `sku`.
     - configured → a plain local button; ONLY its click creates the Razorpay form and loads the outside script
       (council R-06: no third-party request on page load, ever)
     - not configured (every SKU today) → honest waitlist mailto (no fake checkout)          */
  function loadCheckout(el, sku) {
    if (el.getAttribute("data-pay-state") === "loading") return;
    el.setAttribute("data-pay-state", "loading");
    const form = document.createElement("form");
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/payment-button.js"; // loads ONLY after the visitor's click
    s.async = true;
    s.setAttribute("data-payment_button_id", PAYMENT_BUTTONS[sku].trim());
    form.appendChild(s);
    el.appendChild(form);
  }
  function mount(el, sku, label) {
    if (!el) return;
    el.innerHTML = "";
    if (isConfigured(sku)) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "go pay-button";
      btn.textContent = "भुगतान · Razorpay";
      el.appendChild(btn);
      const note = document.createElement("div");
      note.className = "pay-offline-note";
      note.textContent = "click करने पर ही Razorpay का script (बाहरी server) लोड होगा — बाकी site पूर्ण offline चलती है।";
      el.appendChild(note);
      btn.addEventListener("click", function () { btn.disabled = true; loadCheckout(el, sku); });
      el.setAttribute("data-pay-state", "ready");
    } else {
      const a = document.createElement("a");
      a.className = "go pay-waitlist";
      a.href = waitlistMailto(sku);
      a.textContent = (label || "प्रतीक्षा-सूची में जुड़ें") + " →";
      el.appendChild(a);
      const note = document.createElement("div");
      note.className = "pay-pending-note";
      note.textContent = "कोई भुगतान-द्वार नहीं · केवल e-mail";
      el.appendChild(note);
      el.setAttribute("data-pay-state", "waitlist");
    }
  }

  function mountAll() {
    document.querySelectorAll("[data-pay-sku]").forEach(function (el) {
      mount(el, el.getAttribute("data-pay-sku"), el.getAttribute("data-pay-label"));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAll);
  else mountAll();

  root.BharatPay = { mount, mountAll, isConfigured, PAYMENT_BUTTONS };
})(typeof globalThis !== "undefined" ? globalThis : this);
