(function () {
  var THEMES = [
    { id: 'light', label: 'Light', desc: 'Default, bright surfaces', swatch: 'linear-gradient(135deg, #FFFFFF 50%, #155EEF 50%)' },
    { id: 'dark', label: 'Dark', desc: 'Low-light, dark surfaces', swatch: 'linear-gradient(135deg, #0B0D12 50%, #5B8DFF 50%)' },
    { id: 'accessible', label: 'Accessible', desc: 'AAA contrast, larger text, no motion', swatch: 'linear-gradient(135deg, #FFFFFF 50%, #0040CC 50%)', swatchBorder: '#767676' }
  ];

  function current() {
    try { return localStorage.getItem('cl_kb_theme') || 'light'; } catch (e) { return 'light'; }
  }

  function apply(id) {
    if (id === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', id);
    }
    try { localStorage.setItem('cl_kb_theme', id); } catch (e) {}
  }

  function build() {
    var mount = document.getElementById('theme-switcher');
    if (!mount) return;

    var wrap = document.createElement('div');
    wrap.className = 'theme-switcher';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-switcher-btn';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg><span></span>';

    var menu = document.createElement('div');
    menu.className = 'theme-menu';
    menu.setAttribute('role', 'menu');

    function render() {
      var active = current();
      var activeTheme = THEMES.filter(function (t) { return t.id === active; })[0] || THEMES[0];
      btn.querySelector('span').textContent = activeTheme.label;
      menu.innerHTML = '';
      THEMES.forEach(function (t) {
        var opt = document.createElement('button');
        opt.type = 'button';
        opt.className = 'theme-option' + (t.id === active ? ' active' : '');
        opt.setAttribute('role', 'menuitemradio');
        opt.setAttribute('aria-checked', t.id === active ? 'true' : 'false');
        var swatchStyle = 'background:' + t.swatch + (t.swatchBorder ? ';border-color:' + t.swatchBorder : '');
        opt.innerHTML =
          '<span class="theme-swatch" style="' + swatchStyle + '"></span>' +
          '<span class="theme-info"><span class="theme-name">' + t.label + '</span>' +
          '<span class="theme-desc">' + t.desc + '</span></span>' +
          (t.id === active ? '<svg class="theme-check" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' : '');
        opt.addEventListener('click', function () {
          apply(t.id);
          render();
          closeMenu();
        });
        menu.appendChild(opt);
      });
    }

    function openMenu() {
      wrap.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      document.addEventListener('click', onOutsideClick, true);
    }
    function closeMenu() {
      wrap.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onOutsideClick, true);
    }
    function onOutsideClick(e) {
      if (!wrap.contains(e.target)) closeMenu();
    }

    btn.addEventListener('click', function () {
      if (wrap.classList.contains('open')) closeMenu();
      else openMenu();
    });

    render();
    wrap.appendChild(btn);
    wrap.appendChild(menu);
    mount.appendChild(wrap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
