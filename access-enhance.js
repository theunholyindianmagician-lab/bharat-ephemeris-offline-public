// Auto-add aria-labels to buttons for accessibility
document.querySelectorAll('button:not([aria-label])').forEach(function(btn){
  var t = btn.textContent.trim().replace(/[⚡🔄🎨📐🔌🖥️🎓🌌⏱️🔬]/g,'').replace(/\s+/g,' ').trim();
  if(t) btn.setAttribute('aria-label', t);
});
