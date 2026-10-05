(function () {
  try {
    var t = localStorage.getItem('cl_kb_theme');
    if (t === 'dark' || t === 'accessible') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) {}
})();
