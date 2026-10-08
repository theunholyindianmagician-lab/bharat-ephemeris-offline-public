/* Global UI & Section Collapse Controller for Bharat Ephemeris */
(function(window, document) {
  "use strict";

  window.toggleSectionCollapse = function(btn) {
    if (!btn) return;
    const panel = btn.closest(".panel, section, .card, .glass-panel, .panel-collapsible, [data-collapsible]");
    if (!panel) return;
    const isCollapsed = panel.classList.toggle("is-collapsed");
    btn.textContent = isCollapsed ? "+ Expand Section" : "— Minimize";
    btn.style.background = isCollapsed ? "var(--gold)" : "rgba(234, 201, 123, 0.12)";
    btn.style.color = isCollapsed ? "#03060e" : "var(--gold)";
  };

  window.toggleAllSections = function(expand) {
    document.querySelectorAll(".panel, section.glass-panel, .card.glass-card, [data-collapsible]").forEach(panel => {
      const btn = panel.querySelector(".btn-panel-minimize");
      if (expand) {
        panel.classList.remove("is-collapsed");
        if (btn) {
          btn.textContent = "— Minimize";
          btn.style.background = "rgba(234, 201, 123, 0.12)";
          btn.style.color = "var(--gold)";
        }
      } else {
        panel.classList.add("is-collapsed");
        if (btn) {
          btn.textContent = "+ Expand Section";
          btn.style.background = "var(--gold)";
          btn.style.color = "#03060e";
        }
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function() {
    console.log("UI controller initialized: global collapse handlers active.");
  });

  // Guided Tour modal implementation programmatically
  window.openGuidedTour = function() {
    let modal = document.getElementById("guidedTourModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "guidedTourModal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.style.position = "fixed";
      modal.style.top = "50%";
      modal.style.left = "50%";
      modal.style.transform = "translate(-50%, -50%)";
      modal.style.background = "#0c0f1d";
      modal.style.border = "2px solid var(--gold, #d4af37)";
      modal.style.borderRadius = "8px";
      modal.style.padding = "24px";
      modal.style.zIndex = "10000";
      modal.style.width = "90%";
      modal.style.maxWidth = "500px";
      modal.style.boxShadow = "0 10px 30px rgba(0,0,0,0.8)";
      modal.style.color = "#e6edf3";
      modal.style.fontFamily = "var(--font-sans, system-ui, sans-serif)";

      modal.innerHTML = `
        <h2 style="color: var(--gold, #d4af37); margin-top: 0; font-size: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
          <span>🕉️ मार्गदर्शिका (Guided Tour)</span>
          <button onclick="window.closeGuidedTour()" style="background: none; border: none; color: var(--gold, #d4af37); font-size: 1.5rem; cursor: pointer;" aria-label="Close">&times;</button>
        </h2>
        <p>स्वागतम्! This guided tour helps you navigate the surfaces of <b>Bharat Ephemeris Offline</b>:</p>
        <ol style="padding-left: 20px; line-height: 1.6;">
          <li><b>यन्त्र (Dashboard):</b> Live planetary positions (dṛk tier, VSOP87/ELP) and local time tracking.</li>
          <li><b>शून्यभेद (ShunyaBheda):</b> Classical Sūrya-Siddhānta vs dṛk-tier calculations &amp; audits.</li>
          <li><b>ग्रन्थालय (Library):</b> Ancient treatises in Panini-clean digitized form.</li>
          <li><b>संग्रहालय (Museum):</b> Virtualized history of mathematical Indian achievements.</li>
          <li><b>पञ्चाङ्ग (Panchang):</b> Five-limb calendar — the dṛk tier displayed, the classical Sūrya-Siddhānta path alongside.</li>
          <li><b>सिद्धान्त-पञ्चाङ्ग:</b> The pañcāṅga on the Sūrya-Siddhānta's own engine.</li>
          <li><b>वेध (Vedha):</b> The observation companion — the text predicts, you observe.</li>
        </ol>
        <p style="font-size: .85rem; color: #aab4c0;">यह एक ऐतिहासिक ग्रन्थ/गणना है, चिकित्सा-परामर्श नहीं। · This is a historical text and a computation, not medical advice.</p>
        <div style="text-align: right; margin-top: 20px;">
          <button onclick="window.closeGuidedTour()" style="background: var(--gold, #d4af37); color: #03060e; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">यात्रा आरम्भ करें (Close)</button>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = "block";

    // Add overlay if it doesn't exist
    let overlay = document.getElementById("guidedTourOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "guidedTourOverlay";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.background = "rgba(0, 0, 0, 0.7)";
      overlay.style.backdropFilter = "blur(4px)";
      overlay.style.zIndex = "9999";
      document.body.appendChild(overlay);
    }
    overlay.style.display = "block";

    const closeBtn = modal.querySelector("button");
    if (closeBtn) closeBtn.focus();
  };

  window.closeGuidedTour = function() {
    const modal = document.getElementById("guidedTourModal");
    const overlay = document.getElementById("guidedTourOverlay");
    if (modal) modal.style.display = "none";
    if (overlay) overlay.style.display = "none";
  };

  // Keyboard handlers for trap focus (Tab) and Escape to close
  document.addEventListener("keydown", function(e) {
    const modal = document.getElementById("guidedTourModal");
    if (!modal || modal.style.display === "none") return;

    if (e.key === "Escape") {
      window.closeGuidedTour();
    }

    if (e.key === "Tab") {
      const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
      if (focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    }
  });
})(window, document);
