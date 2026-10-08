/* Masterwork Edition Navigation Enhancer & Performance Accelerator */
(function(window, document) {
  "use strict";

  // Global API Namespace
  const EditionNavEnhancer = {
    fontScale: parseFloat(localStorage.getItem("be_reader_font_scale") || "1.0"),
    
    // 1. KaTeX Math Renderer (Native / Fallback)
    renderKaTeX: function(latexSrc) {
      if (!latexSrc) return '';
      if (window.katex && typeof window.katex.renderToString === 'function') {
        try {
          return window.katex.renderToString(latexSrc, { displayMode: true, throwOnError: false });
        } catch (e) {
          console.warn("KaTeX native rendering error, using fallback:", e);
        }
      }
      return EditionNavEnhancer.renderKaTeXFallback(latexSrc);
    },

    renderKaTeXFallback: function(src) {
      if (!src) return '';
      let s = String(src).trim();
      s = s.replace(/^\\\[\s*/, '').replace(/\s*\\\]$/, '');
      s = s.replace(/^\\\(\s*/, '').replace(/\s*\\\)$/, '');
      s = s.replace(/^\$\s*/, '').replace(/\s*\$$/, '');
      
      s = s.replace(/\\text\{([^}]+)\}/g, '<span class="katex-text">$1</span>');
      s = s.replace(/\\mathrm\{([^}]+)\}/g, '<span class="katex-text">$1</span>');
      s = s.replace(/\\mathbf\{([^}]+)\}/g, '<strong class="katex-bold">$1</strong>');
      s = s.replace(/\\bar\{([^}]+)\}/g, '<span class="katex-bar">$1</span>');
      s = s.replace(/\\vec\{([^}]+)\}/g, '<span class="katex-vec">$1</span>');

      for (let i = 0; i < 4; i++) {
        s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '<span class="katex-frac"><span class="katex-num">$1</span><span class="katex-den">$2</span></span>');
      }
      for (let i = 0; i < 4; i++) {
        s = s.replace(/\\sqrt\{([^{}]+)\}/g, '<span class="katex-sqrt"><span class="katex-sqrt-symbol">√</span><span class="katex-stem">$1</span></span>');
      }
      s = s.replace(/\\left\(/g, '<span class="katex-delim">(</span>').replace(/\\right\)/g, '<span class="katex-delim">)</span>');
      s = s.replace(/\\left\[/g, '<span class="katex-delim">[</span>').replace(/\\right\]/g, '<span class="katex-delim">]</span>');
      s = s.replace(/\\pmod\{([^}]+)\}/g, '<span class="katex-mod">(mod $1)</span>');
      s = s.replace(/\\quad|\\,/g, ' ');

      const symbols = [
        [/\\pi/g, 'π'], [/\\theta/g, 'θ'], [/\\lambda/g, 'λ'], [/\\phi/g, 'φ'], [/\\delta/g, 'δ'],
        [/\\alpha/g, 'α'], [/\\beta/g, 'β'], [/\\epsilon/g, 'ε'], [/\\gamma/g, 'γ'], [/\\omega/g, 'ω'],
        [/\\Delta/g, 'Δ'], [/\\Phi/g, 'Φ'], [/\\Sigma/g, 'Σ'],
        [/\\times/g, '×'], [/\\cdot/g, '·'], [/\\circ/g, '°'], [/\\approx/g, '≈'], [/\\implies/g, '⟹'],
        [/\\neq/g, '≠'], [/\\ge/g, '≥'], [/\\le/g, '≤'], [/\\pm/g, '±'], [/\\infty/g, '∞'],
        [/\\int/g, '∫'], [/\\sum/g, '∑'], [/\\partial/g, '∂'], [/\\arcsin/g, 'arcsin'],
        [/\\sin/g, 'sin'], [/\\cos/g, 'cos'], [/\\tan/g, 'tan'], [/\\arccos/g, 'arccos'], [/\\arctan/g, 'arctan']
      ];
      for (const [r, v] of symbols) {
        s = s.replace(r, v);
      }
      s = s.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');
      s = s.replace(/_([a-zA-Z0-9°]+)/g, '<sub>$1</sub>');
      s = s.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
      s = s.replace(/\^([a-zA-Z0-9°]+)/g, '<sup>$1</sup>');

      return `<span class="katex-rendered">${s}</span>`;
    },

    // 2. Font Size Scaling & Preferences
    setFontScale: function(scale) {
      scale = Math.min(1.5, Math.max(0.8, parseFloat(scale) || 1.0));
      EditionNavEnhancer.fontScale = scale;
      localStorage.setItem("be_reader_font_scale", scale.toString());
      
      const readerBody = document.getElementById("readerBody");
      if (readerBody) {
        readerBody.style.fontSize = `${scale * 0.95}rem`;
      }
      
      const scaleLabel = document.getElementById("readerFontScaleLabel");
      if (scaleLabel) {
        scaleLabel.textContent = `${Math.round(scale * 100)}%`;
      }
    },

    adjustFontScale: function(delta) {
      EditionNavEnhancer.setFontScale(EditionNavEnhancer.fontScale + delta);
    },

    // 3. JSON Dataset Export Generator
    exportJSON: function(bookKey, chIdx) {
      const corpus = window.granthaCorpus || {};
      let exportData = null;
      let filename = "dataset.json";

      if (bookKey === 'bundle') {
        exportData = {
          exportType: "Deca-Grantha Full Collector Corpus",
          timestamp: new Date().toISOString(),
          totalBooks: Object.keys(corpus).length,
          books: corpus
        };
        filename = "Complete_Deca_Grantha_Collector_Bundle.json";
      } else if (bookKey && corpus[bookKey]) {
        const book = corpus[bookKey];
        if (typeof chIdx === 'number' && book.chapters && book.chapters[chIdx]) {
          exportData = {
            exportType: "Single Chapter Dataset",
            bookKey: bookKey,
            bookTitle: book.title,
            chapterIndex: chIdx,
            chapter: book.chapters[chIdx],
            timestamp: new Date().toISOString()
          };
          const titleClean = (book.chapters[chIdx].shortTitle || `ch_${chIdx+1}`).toLowerCase().replace(/[^a-z0-9]/g, '_');
          filename = `${bookKey}_${titleClean}_Dataset.json`;
        } else {
          exportData = {
            exportType: "Masterwork Edition Dataset",
            bookKey: bookKey,
            title: book.title,
            subtitle: book.subtitlePrefix,
            badge: book.badge,
            totalChapters: (book.chapters || []).length,
            chapters: book.chapters,
            timestamp: new Date().toISOString()
          };
          filename = `${bookKey}_Full_Dataset.json`;
        }
      } else {
        EditionNavEnhancer.showToast("Dataset not available for export");
        return;
      }

      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 500);
      EditionNavEnhancer.showToast(`✓ Exported ${filename}`);
    },

    // 4. Toast Notification Manager
    showToast: function(message) {
      let toast = document.getElementById("be-toast-notification");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "be-toast-notification";
        toast.style.cssText = "position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:#0b1321; border:1px solid var(--gold, #ea017b); color:var(--gold, #eac97b); padding:10px 20px; border-radius:30px; font-weight:700; font-size:0.85rem; z-index:200000; box-shadow:0 8px 24px rgba(0,0,0,0.8); backdrop-filter:blur(10px); transition:opacity 200ms ease; opacity:0; pointer-events:none;";
        document.body.appendChild(toast);
      }
      toast.textContent = message;
      toast.style.opacity = "1";
      clearTimeout(EditionNavEnhancer._toastTimer);
      EditionNavEnhancer._toastTimer = setTimeout(function() {
        toast.style.opacity = "0";
      }, 2400);
    },

    // 5. Deep Link Copy Helper
    copyDeepLink: async function(anchorId, customUrl) {
      const url = customUrl || `${window.location.origin}${window.location.pathname}#${anchorId}`;
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Clipboard API unavailable");
        await navigator.clipboard.writeText(url);
        EditionNavEnhancer.showToast("✓ Deep link copied to clipboard");
      } catch (err) {
        window.location.hash = anchorId;
        EditionNavEnhancer.showToast("✓ Hash anchor set in address bar");
      }
    },

    // 6. Deep Link Hash Router
    handleHashNavigation: function() {
      const hash = window.location.hash || '';
      if (!hash) return;

      // Check for #reader-[bookKey]-[chIdx] or #reader-[bookKey]-[chIdx]-v[slokaIdx]
      const mReader = /^#reader-([a-z]+)-(\d+)(?:-v(\d+))?$/i.exec(hash);
      if (mReader) {
        const bookKey = mReader[1];
        const chIdx = parseInt(mReader[2], 10);
        if (typeof window.openReader === 'function') {
          window.openReader(bookKey, chIdx);
          if (mReader[3]) {
            setTimeout(function() {
              const slokaEl = document.getElementById(`sloka-${mReader[3]}`);
              if (slokaEl) slokaEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }
        }
        return;
      }

      // Check for #book-[bookKey]
      const mBook = /^#book-([a-z]+)$/i.exec(hash);
      if (mBook) {
        const targetEl = document.getElementById(`book-${mBook[1]}`);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      // Standard anchor scroll fallback
      // an id looked up as text, so a malformed hash (#reader-constructor-1, #"><…) is simply not found (council R-20)
      let anchorEl = null;
      try { anchorEl = document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { anchorEl = null; }
      if (anchorEl) anchorEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // 7. Reading Progress Tracker
    updateReadingProgress: function() {
      const progressBar = document.getElementById("reading-progress-bar");
      const readerBody = document.getElementById("readerBody");
      const readerModal = document.getElementById("readerModal");

      // Modal reading progress taking precedence when open
      if (readerModal && readerModal.classList.contains("open") && readerBody) {
        const sTop = readerBody.scrollTop;
        const sHeight = readerBody.scrollHeight - readerBody.clientHeight;
        const pct = sHeight > 0 ? Math.min(100, Math.max(0, Math.round((sTop / sHeight) * 100))) : 0;
        
        if (progressBar) progressBar.style.width = pct + "%";
        
        const progBadge = document.getElementById("readerProgressBadge");
        if (progBadge) progBadge.textContent = `${pct}% read`;

        // Save progress to localStorage
        if (window.currentBookKey) {
          localStorage.setItem("be_reading_progress", JSON.stringify({
            bookKey: window.currentBookKey,
            chapterIndex: window.currentChapterIndex || 0,
            progress: pct,
            timestamp: Date.now()
          }));
        }
        return;
      }

      // Page level window scroll reading progress
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? Math.min(100, Math.max(0, (winScroll / height) * 100)) : 0;
      if (progressBar) progressBar.style.width = scrolled + "%";
    }
  };

  // Attach to window
  window.EditionNavEnhancer = EditionNavEnhancer;

  document.addEventListener("DOMContentLoaded", function() {
    // 1. Inject Top Reading Progress Bar
    if (!document.getElementById("reading-progress-bar")) {
      const progressBar = document.createElement("div");
      progressBar.id = "reading-progress-bar";
      progressBar.style.cssText = "position:fixed; top:0; left:0; height:3px; background:linear-gradient(90deg, var(--gold, #eac97b), var(--cyan, #70d9eb)); width:0%; z-index:100000; transition:width 100ms ease;";
      document.body.appendChild(progressBar);
    }

    window.addEventListener("scroll", EditionNavEnhancer.updateReadingProgress, { passive: true });

    // 2. Inject Styles for Enhancements
    const styleTag = document.createElement("style");
    styleTag.textContent = `
      .chapter, section.chapter, .grantha-card {
        content-visibility: auto;
        contain-intrinsic-size: 1px 600px;
      }
      .verse, .sloka-card, .formula-card {
        position: relative;
      }
      .verse:hover .verse-anchor-btn, .sloka-card:hover .verse-anchor-btn, .formula-card:hover .verse-anchor-btn {
        opacity: 1;
      }
      .verse:focus-within .verse-anchor-btn, .sloka-card:focus-within .verse-anchor-btn, .formula-card:focus-within .verse-anchor-btn {
        opacity: 1;
      }
      .verse-anchor-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        opacity: 0.6;
        transition: opacity 150ms ease, background 150ms ease;
        background: rgba(234, 201, 123, 0.12);
        border: 1px solid var(--gold, #eac97b);
        color: var(--gold, #eac97b);
        font-size: 0.72rem;
        min-width: 36px;
        min-height: 28px;
        padding: 3px 8px;
        border-radius: 4px;
        cursor: pointer;
        z-index: 10;
      }
      .verse-anchor-btn:hover {
        opacity: 1;
        background: var(--gold, #eac97b);
        color: #03060e;
      }

      /* KaTeX Fallback Typography Styles */
      .katex-rendered {
        font-family: 'KaTeX_Main', 'Cambria Math', 'STIX Two Math', 'Latin Modern Math', Georgia, serif;
        font-size: 1.12rem;
        color: var(--gold, #eac97b);
        display: inline-block;
        line-height: 1.6;
        padding: 4px 8px;
      }
      .katex-frac {
        display: inline-flex;
        flex-direction: column;
        vertical-align: middle;
        text-align: center;
        padding: 0 4px;
        margin: 0 2px;
      }
      .katex-num {
        border-bottom: 1px solid var(--gold, #eac97b);
        padding-bottom: 2px;
        font-size: 0.92em;
      }
      .katex-den {
        padding-top: 2px;
        font-size: 0.92em;
      }
      .katex-sqrt {
        display: inline-flex;
        align-items: center;
      }
      .katex-sqrt-symbol {
        font-size: 1.3em;
        margin-right: 1px;
      }
      .katex-stem {
        border-top: 1px solid var(--gold, #eac97b);
        padding-top: 1px;
      }
      .katex-text {
        font-family: var(--font-sans, system-ui, sans-serif);
        font-style: normal;
        font-size: 0.88em;
        color: var(--ink, #f0f4fc);
      }
      .katex-bar {
        text-decoration: overline;
      }

      /* Reader Font Size Toolbar */
      .reader-font-toolbar {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--rule, rgba(234, 201, 123, 0.2));
        border-radius: 20px;
        padding: 3px 10px;
        font-size: 0.78rem;
      }
      .btn-font-step {
        background: none;
        border: none;
        color: var(--gold, #eac97b);
        font-weight: 700;
        cursor: pointer;
        padding: 2px 6px;
        min-width: 24px;
        border-radius: 4px;
      }
      .btn-font-step:hover {
        background: rgba(234, 201, 123, 0.2);
      }
    `;
    document.head.appendChild(styleTag);

    // 3. Inject Sticky TOC Drawer Button & Sidebar
    const staticChapters = Array.from(document.querySelectorAll(".chapter, section.chapter, div.chapter, .grantha-card"));
    const corpus = window.granthaCorpus || {};
    const hasCorpus = Object.keys(corpus).length > 0;

    if (staticChapters.length > 0 || hasCorpus) {
      const drawerBtn = document.createElement("button");
      drawerBtn.id = "toc-drawer-btn";
      drawerBtn.type = "button";
      drawerBtn.setAttribute("aria-controls", "toc-sidebar");
      drawerBtn.setAttribute("aria-expanded", "false");
      drawerBtn.style.cssText = "position:fixed; bottom:24px; right:24px; z-index:99999; background:#0b1321; border:1px solid var(--gold, #eac97b); color:var(--gold, #eac97b); padding:10px 16px; border-radius:30px; font-weight:700; font-size:0.85rem; box-shadow:0 10px 25px rgba(0,0,0,0.6); cursor:pointer; display:flex; align-items:center; gap:8px; backdrop-filter:blur(8px); transition:transform 150ms ease;";
      
      const totalChapterCount = hasCorpus 
        ? Object.values(corpus).reduce((acc, b) => acc + (b.chapters ? b.chapters.length : 0), 0)
        : staticChapters.length;

      drawerBtn.innerHTML = `📜 <span>TOC (${totalChapterCount} Chapters)</span>`;

      const sidebar = document.createElement("div");
      sidebar.id = "toc-sidebar";
      sidebar.setAttribute("role", "dialog");
      sidebar.setAttribute("aria-modal", "true");
      sidebar.setAttribute("aria-labelledby", "toc-sidebar-title");
      sidebar.setAttribute("aria-hidden", "true");
      sidebar.style.cssText = "position:fixed; top:0; right:-360px; width:340px; height:100vh; background:rgba(7,12,22,0.96); backdrop-filter:blur(14px); border-left:1px solid var(--gold, #eac97b); z-index:100001; padding:20px; box-shadow:-10px 0 30px rgba(0,0,0,0.8); transition:right 300ms ease; display:flex; flex-direction:column;";

      sidebar.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid var(--rule, rgba(234,201,123,0.3)); padding-bottom:10px;">
          <h3 id="toc-sidebar-title" style="margin:0; color:var(--gold, #eac97b); font-size:1.1rem; font-family:sans-serif;">विषय-सूची · Table of Contents</h3>
          <button type="button" id="toc-close-btn" aria-label="Close table of contents" style="min-width:44px; min-height:44px; background:none; border:none; color:var(--gold, #eac97b); font-size:1.4rem; cursor:pointer; font-weight:700;">✕</button>
        </div>
        <input type="text" id="toc-search-input" placeholder="Search chapters, ślokas, topics..." style="width:100%; background:rgba(255,255,255,0.06); border:1px solid var(--rule, #3a332a); color:var(--ink, #f0f4fc); padding:8px 12px; border-radius:6px; font-size:0.85rem; margin-bottom:14px; outline:none;" />
        <div id="toc-list" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:6px; padding-right:4px;"></div>
      `;
      document.body.appendChild(drawerBtn);
      document.body.appendChild(sidebar);

      const tocList = sidebar.querySelector("#toc-list");
      const searchInput = sidebar.querySelector("#toc-search-input");
      let returnFocus = null;

      function closeSidebar() {
        sidebar.style.right = "-360px";
        sidebar.setAttribute("aria-hidden", "true");
        drawerBtn.setAttribute("aria-expanded", "false");
        if (returnFocus) returnFocus.focus();
        returnFocus = null;
      }

      function populateTOC(filter = "") {
        tocList.innerHTML = "";
        const lowerFilter = filter.toLowerCase();
        let matchCount = 0;

        // A) Populate from window.granthaCorpus if available
        if (hasCorpus) {
          for (const bKey in corpus) {
            const book = corpus[bKey];
            if (!book.chapters) continue;

            let bookMatched = false;
            book.chapters.forEach((ch, chIdx) => {
              const chTitle = `${ch.num}. ${ch.nameSa || ''} · ${ch.shortTitle || ''} ${ch.nameEn || ''}`;
              if (lowerFilter && !chTitle.toLowerCase().includes(lowerFilter)) return;

              if (!bookMatched) {
                const header = document.createElement("div");
                header.style.cssText = "color:var(--cyan, #70d9eb); font-size:0.75rem; text-transform:uppercase; font-weight:700; margin-top:8px; padding-left:4px;";
                header.textContent = book.title;
                tocList.appendChild(header);
                bookMatched = true;
              }

              matchCount++;
              const item = document.createElement("button");
              item.type = "button";
              item.style.cssText = "color:var(--ink, #f0f4fc); text-align:left; background:rgba(255,255,255,0.03); border:none; border-left:2px solid transparent; padding:8px 10px; border-radius:6px; font-size:0.82rem; line-height:1.4; cursor:pointer; transition:all 150ms ease; width:100%;";
              item.innerHTML = `<strong style="color:var(--gold, #eac97b);">${ch.num}.</strong> ${ch.nameSa || ''} <span style="color:var(--soft, #8b9bb4); font-size:0.75rem;">(${ch.shortTitle})</span>`;
              item.onmouseover = () => item.style.borderLeftColor = "var(--gold, #eac97b)";
              item.onmouseout = () => item.style.borderLeftColor = "transparent";
              item.onclick = function() {
                closeSidebar();
                if (typeof window.openReader === "function") {
                  window.openReader(bKey, chIdx);
                }
              };
              tocList.appendChild(item);
            });
          }
        } else {
          // B) Populate from static HTML chapters
          staticChapters.forEach((ch, idx) => {
            const id = ch.id || `ch${idx + 1}`;
            if (!ch.id) ch.id = id;

            const titleEl = ch.querySelector("h2, h3, .ch-sa, .ch-en");
            const titleText = titleEl && titleEl.textContent.trim() ? titleEl.textContent.trim() : `Chapter ${idx + 1}`;
            if (lowerFilter && !titleText.toLowerCase().includes(lowerFilter)) return;

            matchCount++;
            const item = document.createElement("a");
            item.href = `#${id}`;
            item.style.cssText = "color:var(--ink, #f0f4fc); text-decoration:none; padding:8px 10px; border-radius:6px; background:rgba(255,255,255,0.03); font-size:0.82rem; line-height:1.4; border-left:2px solid transparent; transition:all 150ms ease;";
            item.innerHTML = `<strong style="color:var(--gold, #eac97b);">${idx + 1}.</strong> ${titleText}`;
            item.onmouseover = () => item.style.borderLeftColor = "var(--gold, #eac97b)";
            item.onmouseout = () => item.style.borderLeftColor = "transparent";
            item.onclick = closeSidebar;
            tocList.appendChild(item);
          });
        }

        if (matchCount === 0) {
          tocList.innerHTML = `<div style="color:var(--soft, #8b9bb4); font-size:0.85rem; text-align:center; padding:20px;">No matching chapters found</div>`;
        }
      }

      populateTOC();

      drawerBtn.onclick = () => {
        returnFocus = document.activeElement;
        sidebar.style.right = "0";
        sidebar.setAttribute("aria-hidden", "false");
        drawerBtn.setAttribute("aria-expanded", "true");
        searchInput.focus();
      };
      sidebar.querySelector("#toc-close-btn").onclick = closeSidebar;
      searchInput.oninput = (e) => populateTOC(e.target.value);
      
      document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && sidebar.getAttribute("aria-hidden") === "false") {
          closeSidebar();
        }
      });
    }

    // 4. Inject Verse Anchor Buttons on Static HTML Verses
    document.querySelectorAll(".verse").forEach((verse, vIdx) => {
      const vnum = verse.querySelector(".vnum");
      const verseId = vnum ? vnum.innerText.trim().replace(/\s+/g, "") : `v-${vIdx + 1}`;
      if (!verse.id) verse.id = verseId;

      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "verse-anchor-btn";
      copyBtn.innerHTML = "🔗 Link";
      copyBtn.title = "Copy deep link to verse";
      copyBtn.setAttribute("aria-label", `Copy deep link to verse ${verseId}`);
      copyBtn.onclick = (e) => {
        e.preventDefault();
        EditionNavEnhancer.copyDeepLink(verse.id);
      };
      verse.appendChild(copyBtn);
    });

    // 5. Check URL Deep Link Hash Navigation on Load
    EditionNavEnhancer.handleHashNavigation();
    window.addEventListener("hashchange", EditionNavEnhancer.handleHashNavigation);
  });
})(window, document);
