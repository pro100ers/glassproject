// Glass Project: опрос, маска телефона, UTM, отправка заявки, лайтбокс, слайдер сертификатов.
// Без библиотек. Если JS не загрузился, на странице остаются телефон и ссылки на WhatsApp.

(function () {
  'use strict';

  var WA_NUMBER = '77714101009';

  // Будущая отправка заявки в CRM или Telegram-бота.
  // Укажите URL обработчика (например, вебхук amoCRM, Bitrix24 или своего сервера, который пишет в Telegram),
  // и заявка уйдёт туда POST-запросом в JSON, параллельно с открытием WhatsApp.
  var LEAD_ENDPOINT = null;

  /* ---------- UTM: берём из адреса, храним на время визита ---------- */

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];

  function readUtm() {
    var params = new URLSearchParams(window.location.search);
    var fromUrl = {};
    var hasAny = false;
    UTM_KEYS.forEach(function (k) {
      var v = params.get(k);
      if (v) { fromUrl[k] = v.slice(0, 200); hasAny = true; }
    });
    try {
      if (hasAny) {
        sessionStorage.setItem('gp_utm', JSON.stringify(fromUrl));
        return fromUrl;
      }
      var saved = sessionStorage.getItem('gp_utm');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return fromUrl;
    }
  }

  var utm = readUtm();

  /* ---------- WhatsApp ---------- */

  function waLink(text) {
    return 'https://wa.me/' + WA_NUMBER + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  /* ---------- Опрос ---------- */

  var quiz = document.getElementById('quiz');

  if (quiz) {
    var steps = Array.prototype.slice.call(quiz.querySelectorAll('[data-step]'));
    var questions = steps.filter(function (s) { return s.hasAttribute('data-question'); });
    var total = questions.length;
    var bar = quiz.querySelector('.quiz__bar-fill');
    var counter = quiz.querySelector('.quiz__counter');
    var backBtn = quiz.querySelector('.quiz__back');
    var form = quiz.querySelector('.quiz__form');
    var nameInput = quiz.querySelector('#lead-name');
    var phoneInput = quiz.querySelector('#lead-phone');
    var errorBox = quiz.querySelector('.quiz__error');
    var thanksWa = quiz.querySelector('.quiz__thanks-wa');
    var answers = {};
    var current = 0;

    function show(index, initial) {
      current = index;
      steps.forEach(function (s, i) { s.hidden = i !== index; });
      var isQuestion = index < total;
      var isThanks = steps[index].hasAttribute('data-thanks');
      var done = isQuestion ? index : total;
      bar.style.width = (isThanks ? 100 : Math.round((done / total) * 100)) + '%';
      counter.textContent = isQuestion ? 'Вопрос ' + (index + 1) + ' из ' + total : (isThanks ? 'Готово' : 'Последний шаг');
      backBtn.hidden = index === 0 || isThanks;
      quiz.classList.toggle('quiz--done', isThanks);

      if (initial) return;
      var title = steps[index].querySelector('.quiz__title');
      if (title) title.focus({ preventScroll: true });
      var top = quiz.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.5) {
        quiz.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      }
    }

    questions.forEach(function (step, i) {
      var key = step.getAttribute('data-question');
      step.addEventListener('click', function (e) {
        var btn = e.target.closest('.quiz__option');
        if (!btn) return;
        step.querySelectorAll('.quiz__option').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        answers[key] = btn.textContent.trim();
        window.setTimeout(function () { show(i + 1); }, 160);
      });
    });

    backBtn.addEventListener('click', function () {
      if (current > 0) show(current - 1);
    });

    // Маска +7 (XXX) XXX-XX-XX. Возвращает 10 цифр номера без кода страны.
    function phoneDigits(raw) {
      var s = String(raw).trim();
      var d = s.replace(/\D/g, '');
      if (s.indexOf('+7') === 0) d = d.slice(1);
      else if (d.length === 11 && (d.charAt(0) === '7' || d.charAt(0) === '8')) d = d.slice(1);
      // Привычное «8 701...» после +7: восьмёрку убираем, номера в Казахстане начинаются с 7
      if (d.charAt(0) === '8') d = d.slice(1);
      return d.slice(0, 10);
    }

    // Скобку и дефисы ставим только перед следующей цифрой, чтобы стирание работало без залипаний
    function formatPhone(d) {
      var out = '+7';
      if (d.length > 0) out += ' (' + d.slice(0, 3);
      if (d.length > 3) out += ') ' + d.slice(3, 6);
      if (d.length > 6) out += '-' + d.slice(6, 8);
      if (d.length > 8) out += '-' + d.slice(8, 10);
      return out;
    }

    phoneInput.addEventListener('focus', function () {
      if (!phoneInput.value) phoneInput.value = '+7 ';
    });
    phoneInput.addEventListener('blur', function () {
      if (phoneInput.value.trim() === '+7') phoneInput.value = '';
    });
    phoneInput.addEventListener('input', function () {
      phoneInput.value = formatPhone(phoneDigits(phoneInput.value));
    });

    function buildMessage(name, phone) {
      var lines = [
        'Здравствуйте. Заявка на расчёт с сайта Glass Project.',
        '',
        'Что нужно: ' + (answers.what || 'не указано'),
        'Где: ' + (answers.where || 'не указано'),
        'Проёмов: ' + (answers.count || 'не указано'),
        'Когда: ' + (answers.when || 'не указано'),
        '',
        'Имя: ' + name,
        'Телефон: ' + phone
      ];
      var utmLines = UTM_KEYS.filter(function (k) { return utm[k]; }).map(function (k) { return k + ': ' + utm[k]; });
      if (utmLines.length) lines.push('', utmLines.join('\n'));
      return lines.join('\n');
    }

    function sendLead(lead) {
      if (!LEAD_ENDPOINT) return;
      try {
        fetch(LEAD_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
          keepalive: true
        }).catch(function () {});
      } catch (e) { /* заявка всё равно уходит в WhatsApp */ }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = nameInput.value.trim();
      var digits = phoneDigits(phoneInput.value);
      var problems = [];
      if (name.length < 2) problems.push('Напишите, как к вам обращаться');
      if (digits.length !== 10) problems.push('Проверьте номер телефона: нужно 10 цифр после +7');
      nameInput.setAttribute('aria-invalid', name.length < 2 ? 'true' : 'false');
      phoneInput.setAttribute('aria-invalid', digits.length !== 10 ? 'true' : 'false');
      if (problems.length) {
        errorBox.textContent = problems.join('. ');
        errorBox.hidden = false;
        (name.length < 2 ? nameInput : phoneInput).focus();
        return;
      }
      errorBox.hidden = true;

      var phone = formatPhone(digits);
      var text = buildMessage(name, phone);
      var link = waLink(text);

      sendLead({ answers: answers, name: name, phone: phone, utm: utm, page: window.location.href, sentAt: new Date().toISOString() });

      thanksWa.href = link;
      show(steps.length - 1);
      // Открываем WhatsApp в том же нажатии, чтобы браузер не заблокировал окно
      var win = window.open(link, '_blank', 'noopener');
      if (!win) window.location.href = link;
    });

    show(0, true);
  }

  /* ---------- Кнопки «к опросу» ---------- */

  document.querySelectorAll('a[href="#raschet"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.getElementById('raschet');
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      var title = target.querySelector('[data-step]:not([hidden]) .quiz__title');
      if (title) title.focus({ preventScroll: true });
      if (history.replaceState) history.replaceState(null, '', '#raschet');
    });
  });

  /* ---------- Плавающая кнопка WhatsApp: прячем, пока виден опрос ---------- */

  var fab = document.querySelector('.wa-fab');
  if (fab && quiz && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      fab.classList.toggle('wa-fab--hidden', entries[0].isIntersecting);
    }, { threshold: 0.15 }).observe(quiz);
  }

  /* ---------- Слайдер сертификатов ---------- */

  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var track = slider.querySelector('.slider__track');
    var prev = slider.querySelector('.slider__prev');
    var next = slider.querySelector('.slider__next');
    if (!track || !prev || !next) return;
    function step(dir) {
      var item = track.querySelector(':scope > *');
      var w = item ? item.getBoundingClientRect().width + 16 : 240;
      track.scrollBy({ left: dir * w * 2, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
    function sync() {
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    }
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  /* ---------- Лайтбокс для фото, отзывов и сертификатов ---------- */

  var box = document.querySelector('.lightbox');
  if (box && typeof box.showModal === 'function') {
    var boxImg = box.querySelector('.lightbox__img');
    var boxCap = box.querySelector('.lightbox__cap');
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[data-zoom]');
      if (!link) return;
      e.preventDefault();
      boxImg.src = link.getAttribute('href');
      boxImg.alt = link.querySelector('img') ? link.querySelector('img').alt : '';
      boxCap.textContent = link.getAttribute('data-caption') || '';
      boxCap.hidden = !boxCap.textContent;
      box.showModal();
    });
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.closest('.lightbox__close')) box.close();
    });
    box.addEventListener('close', function () { boxImg.removeAttribute('src'); });
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
})();
