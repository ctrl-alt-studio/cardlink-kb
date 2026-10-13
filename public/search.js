(function () {
  var INDEX_URL = '/search-index.json';
  var indexPromise = null;

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(INDEX_URL)
        .then(function (r) { return r.json(); })
        .catch(function () { return []; });
    }
    return indexPromise;
  }

  function norm(s) { return (s || '').toLowerCase(); }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function score(entry, terms) {
    var title = norm(entry.title);
    var tags = norm((entry.tags || []).join(' '));
    var text = norm(entry.text);
    var total = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (title.indexOf(t) === -1 && tags.indexOf(t) === -1 && text.indexOf(t) === -1) return -1;
      if (title.indexOf(t) !== -1) total += 10;
      if (tags.indexOf(t) !== -1) total += 4;
      total += Math.min(text.split(t).length - 1, 5);
    }
    return total;
  }

  function snippet(entry, terms) {
    var text = entry.text || '';
    var lower = norm(text);
    var pos = -1;
    for (var i = 0; i < terms.length && pos === -1; i++) pos = lower.indexOf(terms[i]);
    if (pos === -1) return text.slice(0, 110) + (text.length > 110 ? '…' : '');
    var start = Math.max(0, pos - 40);
    var end = Math.min(text.length, pos + 80);
    return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
  }

  function runSearch(index, query) {
    var terms = norm(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return { terms: terms, results: [] };
    var scored = [];
    for (var i = 0; i < index.length; i++) {
      var s = score(index[i], terms);
      if (s > 0) scored.push({ entry: index[i], score: s });
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    return { terms: terms, results: scored.slice(0, 8).map(function (r) { return r.entry; }) };
  }

  function build() {
    var mount = document.getElementById('kb-search');
    if (!mount) return;

    var wrap = document.createElement('div');
    wrap.className = 'kb-search';

    var input = document.createElement('input');
    input.type = 'search';
    input.className = 'kb-search-input';
    input.placeholder = 'Search…';
    input.autocomplete = 'off';
    input.setAttribute('aria-label', 'Search this site');

    var results = document.createElement('div');
    results.className = 'kb-search-results';
    results.setAttribute('role', 'listbox');

    var activeIndex = -1;
    var lastTerms = [];

    function render(list) {
      activeIndex = -1;
      results.innerHTML = '';
      if (!list.length) {
        wrap.classList.remove('open');
        return;
      }
      list.forEach(function (entry) {
        var a = document.createElement('a');
        a.href = entry.path;
        a.className = 'kb-search-result';
        a.setAttribute('role', 'option');
        a.innerHTML =
          '<span class="kb-search-result-title">' + escapeHtml(entry.title) + '</span>' +
          '<span class="kb-search-result-snippet">' + escapeHtml(snippet(entry, lastTerms)) + '</span>';
        results.appendChild(a);
      });
      wrap.classList.add('open');
    }

    function doSearch() {
      var q = input.value;
      if (!q.trim()) { render([]); return; }
      loadIndex().then(function (index) {
        var out = runSearch(index, q);
        lastTerms = out.terms;
        render(out.results);
      });
    }

    var debounceTimer;
    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(doSearch, 120);
    });
    input.addEventListener('focus', function () {
      loadIndex();
      if (input.value.trim()) doSearch();
    });

    input.addEventListener('keydown', function (e) {
      var items = results.querySelectorAll('.kb-search-result');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!items.length) return;
        activeIndex = Math.min(activeIndex + 1, items.length - 1);
        updateActive(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!items.length) return;
        activeIndex = Math.max(activeIndex - 1, 0);
        updateActive(items);
      } else if (e.key === 'Enter') {
        var target = items[activeIndex >= 0 ? activeIndex : 0];
        if (target) window.location.href = target.getAttribute('href');
      } else if (e.key === 'Escape') {
        wrap.classList.remove('open');
        input.blur();
      }
    });

    function updateActive(items) {
      items.forEach(function (el, i) { el.classList.toggle('active', i === activeIndex); });
      if (items[activeIndex]) items[activeIndex].scrollIntoView({ block: 'nearest' });
    }

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) wrap.classList.remove('open');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      var active = document.activeElement;
      var tag = active && active.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (active && active.isContentEditable)) return;
      e.preventDefault();
      input.focus();
    });

    wrap.appendChild(input);
    wrap.appendChild(results);
    mount.appendChild(wrap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
