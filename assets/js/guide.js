(function () {
  'use strict';

  function decodeEmail(u, d) {
    var rev = function (s) { return s.split('').reverse().join(''); };
    return rev(atob(u)) + '@' + rev(atob(d));
  }
  globalThis.GuideEmail = { decode: decodeEmail };

  var THEMES = ['light', 'dark', 'night'];
  function normalizeTheme(v) { return THEMES.indexOf(v) === -1 ? null : v; }
  globalThis.GuideTheme = { normalize: normalizeTheme };
  if (typeof document === 'undefined') return;

  function readPref(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function writePref(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* yalnızca kolaylık */ } }

  document.querySelectorAll('a.email[data-u]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      if (a.dataset.revealed) return;
      ev.preventDefault();
      var addr = decodeEmail(a.dataset.u, a.dataset.d);
      a.textContent = addr;
      a.href = 'mailto:' + addr;
      a.dataset.revealed = '1';
      var hint = a.parentNode.querySelector('.email-hint');
      if (hint) hint.remove();
    });
  });

  var themeRadios = document.querySelectorAll('input[name="tema"]');
  function applyTheme(v) {
    var t = normalizeTheme(v);
    if (t) document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
    themeRadios.forEach(function (r) { r.checked = r.value === (t || 'auto'); });
  }
  themeRadios.forEach(function (r) {
    r.addEventListener('change', function () { applyTheme(r.value); writePref('tema', r.value); });
  });
  applyTheme(readPref('tema'));

  var q = document.getElementById('ara');
  var out = document.getElementById('ara-sonuc');
  if (q && out) {
    q.addEventListener('input', function () {
      var term = q.value.trim().toLocaleLowerCase('tr');
      out.innerHTML = '';
      if (term.length < 3) return;
      document.querySelectorAll('article.card').forEach(function (card) {
        if (card.textContent.toLocaleLowerCase('tr').indexOf(term) === -1) return;
        var li = document.createElement('li');
        var link = document.createElement('a');
        link.href = '#' + card.id;
        link.textContent = card.querySelector('h3').textContent;
        li.appendChild(link);
        out.appendChild(li);
      });
      if (!out.children.length) {
        var none = document.createElement('li');
        none.textContent = 'Aranan ifadeyle eşleşen sonuç bulunamadı.';
        out.appendChild(none);
      }
    });
  }

  function selectText(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  document.querySelectorAll('button.copy[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var src = document.getElementById(btn.dataset.copy);
      if (!src) return;
      var label = btn.textContent;
      var done = function () {
        btn.textContent = btn.dataset.done;
        setTimeout(function () { btn.textContent = label; }, 2000);
      };
      var fallback = function () {
        selectText(src);
        try { if (document.execCommand('copy')) done(); } catch (e) { /* metin seçili kalır */ }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(src.textContent).then(done, fallback);
      } else {
        fallback();
      }
    });
  });

  var nav = document.querySelector('.toc-nav');
  if (nav && window.matchMedia('(max-width: 900px)').matches) nav.open = false;
})();
