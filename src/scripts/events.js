/* ============================================
   AE Bogotá — Events Renderer
   Reads EVENTS_DATA, renders card grid
   ============================================ */

(function () {
  'use strict';

  var BADGE_LABELS = {
    'talks':          { es: 'Charla',           en: 'Talk' },
    'reading-groups': { es: 'Grupo de lectura', en: 'Reading Group' },
    'workshops':      { es: 'Taller',           en: 'Workshop' },
    'social-meetups': { es: 'Encuentro social', en: 'Social Meetup' }
  };

  function el(tag, cls) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    return node;
  }

  function svgIcon(pathD) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    svg.appendChild(path);
    return svg;
  }

  var CALENDAR_PATH = 'M4.5 1a.5.5 0 0 1 .5.5V2h6v-.5a.5.5 0 0 1 1 0V2h1.5A1.5 1.5 0 0 1 15 3.5v10a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5v-10A1.5 1.5 0 0 1 2.5 2H4v-.5a.5.5 0 0 1 .5-.5zM2 6v7.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V6H2z';
  var LOCATION_PATH = 'M8 0a5.53 5.53 0 0 0-5.5 5.5C2.5 10.43 8 16 8 16s5.5-5.57 5.5-10.5A5.53 5.53 0 0 0 8 0zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z';

  function getLang() {
    return document.documentElement.lang || 'es';
  }

  function formatDate(dateStr, timeStr) {
    var lang = getLang();
    var d = new Date(dateStr + 'T' + timeStr + ':00');
    var locale = lang === 'es' ? 'es-CO' : 'en-US';
    var datePart = d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var timePart = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    return datePart + ' \u00b7 ' + timePart;
  }

  function isUpcoming(dateStr) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr + 'T00:00:00') >= today;
  }

  function renderCard(ev) {
    var lang = getLang();
    var title = lang === 'en' ? ev.title : ev.titleEs;
    var desc = lang === 'en' ? ev.description : ev.descriptionEs;
    var loc = lang === 'en' ? ev.location : ev.locationEs;
    var badge = BADGE_LABELS[ev.type] || {};
    var badgeText = lang === 'en' ? badge.en : badge.es;
    var ctaText = lang === 'en' ? 'Register' : 'Regístrate';

    var card = el('article', 'event-card fade-in');

    // Image wrap
    var imgWrap = el('div', 'event-card__image-wrap');
    var img = el('img', 'event-card__image');
    img.src = ev.image;
    img.alt = '';
    img.loading = 'lazy';
    imgWrap.appendChild(img);

    var badgeEl = el('span', 'event-card__badge event-card__badge--' + ev.type);
    badgeEl.textContent = badgeText;
    imgWrap.appendChild(badgeEl);
    card.appendChild(imgWrap);

    // Body
    var body = el('div', 'event-card__body');

    var h3 = el('h3', 'event-card__title');
    h3.textContent = title;
    body.appendChild(h3);

    // Meta
    var meta = el('div', 'event-card__meta');

    var dateLine = el('span');
    dateLine.appendChild(svgIcon(CALENDAR_PATH));
    dateLine.appendChild(document.createTextNode(' ' + formatDate(ev.date, ev.time)));
    meta.appendChild(dateLine);

    var locLine = el('span');
    locLine.appendChild(svgIcon(LOCATION_PATH));
    locLine.appendChild(document.createTextNode(' ' + loc));
    meta.appendChild(locLine);

    body.appendChild(meta);

    var descP = el('p', 'event-card__desc');
    descP.textContent = desc;
    body.appendChild(descP);

    var cta = el('a', 'event-card__cta');
    cta.href = ev.tallyUrl;
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
    cta.textContent = ctaText;
    body.appendChild(cta);

    card.appendChild(body);
    return card;
  }

  function renderEmptyState() {
    var lang = getLang();
    var container = document.getElementById('events-grid');
    while (container.firstChild) container.removeChild(container.firstChild);

    var empty = el('div', 'events-empty');
    var p = el('p');
    p.textContent = lang === 'en'
      ? 'No upcoming events at the moment. Follow us on Instagram to stay updated.'
      : 'No hay eventos próximos por el momento. Síguenos en Instagram para estar al tanto.';
    empty.appendChild(p);
    container.appendChild(empty);
  }

  function render() {
    var container = document.getElementById('events-grid');
    if (!container) return;

    var upcoming = EVENTS_DATA
      .filter(function (ev) { return isUpcoming(ev.date); })
      .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });

    while (container.firstChild) container.removeChild(container.firstChild);

    if (upcoming.length === 0) {
      renderEmptyState();
      return;
    }

    upcoming.forEach(function (ev) {
      container.appendChild(renderCard(ev));
    });
  }

  render();

  // Re-render on language toggle
  new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.attributeName === 'lang') render();
    });
  }).observe(document.documentElement, { attributes: true });
})();
