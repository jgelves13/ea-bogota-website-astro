/* ============================================
   Opportunities Board — V2
   Cards expand in place (EA.org-style anatomy).
   Multi-select filter dropdowns. Chips toggle filters.
   ============================================ */

(function () {
  'use strict';

  // --- Real opportunity data loaded from opportunities-data.js (124 active listings) ---
  // Fake data removed 2026-04-13. See git history for original 24 sample entries.
  var OPPORTUNITIES = (typeof OPPORTUNITIES_DATA !== 'undefined') ? OPPORTUNITIES_DATA : [];

  // Assign stable ids
  OPPORTUNITIES.forEach(function (opp, i) { opp.id = 'opp-' + (i + 1); });

  // --- Label maps (ES + EN) for every filter dimension ---
  var LABELS = {
    type: {
      job:        { es: 'Empleo',           en: 'Job' },
      fellowship: { es: 'Beca / Fellowship', en: 'Fellowship' },
      volunteer:  { es: 'Voluntariado',     en: 'Volunteer' },
      internship: { es: 'Pasantía',         en: 'Internship' },
      program:    { es: 'Programa',         en: 'Program' }
    },
    cause: {
      'ai-safety':      { es: 'AI Safety',         en: 'AI Safety' },
      'global-health':  { es: 'Salud global',      en: 'Global health' },
      'animal-welfare': { es: 'Bienestar animal',  en: 'Animal welfare' },
      'biosecurity':    { es: 'Bioseguridad',      en: 'Biosecurity' },
      'climate':        { es: 'Clima',             en: 'Climate' },
      'governance':     { es: 'Gobernanza',        en: 'Governance' },
      'poverty':        { es: 'Pobreza global',    en: 'Global poverty' },
      'meta':           { es: 'Meta / EA',         en: 'Meta / EA' }
    },
    location: {
      colombia: { es: 'Colombia',         en: 'Colombia' },
      latam:    { es: 'América Latina',   en: 'Latin America' },
      remote:   { es: 'Remoto',           en: 'Remote' },
      usa:      { es: 'Estados Unidos',   en: 'United States' },
      uk:       { es: 'Reino Unido',      en: 'United Kingdom' },
      europe:   { es: 'Europa',           en: 'Europe' }
    },
    education: {
      none:      { es: 'Sin requisito', en: 'No requirement' },
      undergrad: { es: 'Pregrado',      en: 'Undergraduate' },
      masters:   { es: 'Maestría',      en: 'Masters' },
      phd:       { es: 'Doctorado',     en: 'PhD' }
    },
    route: {
      'direct-work':     { es: 'Trabajo directo',         en: 'Direct work' },
      'research':        { es: 'Investigación',           en: 'Research' },
      'policy':          { es: 'Política pública',        en: 'Policy' },
      'earning-to-give': { es: 'Earning to give',         en: 'Earning to give' },
      'community':       { es: 'Construcción de comunidad', en: 'Community building' }
    },
    skill: {
      'engineering':    { es: 'Ingeniería / ML', en: 'Engineering / ML' },
      'research':       { es: 'Investigación',   en: 'Research' },
      'operations':     { es: 'Operaciones',     en: 'Operations' },
      'communications': { es: 'Comunicaciones',  en: 'Communications' },
      'policy':         { es: 'Política',        en: 'Policy' },
      'management':     { es: 'Gerencia',        en: 'Management' }
    }
  };

  var FILTER_TITLES = {
    type:      { es: 'Tipo de oportunidad', en: 'Opportunity type' },
    cause:     { es: 'Área de causa',       en: 'Cause area' },
    location:  { es: 'Ubicación',           en: 'Location' },
    education: { es: 'Educación',           en: 'Education' },
    route:     { es: 'Ruta de impacto',     en: 'Route to impact' },
    skill:     { es: 'Habilidades',         en: 'Skill set' }
  };

  var DETAILS_HEADINGS = {
    education:   { es: 'Educación',         en: 'Education' },
    route:       { es: 'Ruta de impacto',   en: 'Route to impact' },
    skill:       { es: 'Habilidades',       en: 'Skill set' },
    description: { es: 'Descripción',       en: 'Description' }
  };

  var APPLY_LABEL = { es: 'Aplicar', en: 'Apply' };
  var SEARCH_PLACEHOLDER_PANEL = { es: 'Buscar…', en: 'Search…' };
  var SEARCH_PLACEHOLDER_MAIN  = { es: 'Buscar oportunidades...', en: 'Search opportunities...' };

  // --- App state ---
  var state = {
    search: '',
    filters: {
      type:      Object.create(null),
      cause:     Object.create(null),
      location:  Object.create(null),
      education: Object.create(null),
      route:     Object.create(null),
      skill:     Object.create(null)
    },
    openId: null,
    openDropdown: null
  };

  function lang() { return document.documentElement.lang === 'en' ? 'en' : 'es'; }
  function label(category, key) {
    var l = lang();
    var entry = LABELS[category] && LABELS[category][key];
    return entry ? entry[l] : key;
  }

  // Filter state helpers — using plain objects as Set substitutes for IE-friendliness
  function selectedValues(category) { return Object.keys(state.filters[category]); }
  function isSelected(category, value) { return !!state.filters[category][value]; }
  function toggleFilter(category, value) {
    if (state.filters[category][value]) delete state.filters[category][value];
    else state.filters[category][value] = true;
  }
  function clearAllFilters() {
    Object.keys(state.filters).forEach(function (k) { state.filters[k] = Object.create(null); });
    state.search = '';
  }
  function hasAnyFilter() {
    if (state.search) return true;
    var f = state.filters;
    for (var k in f) if (Object.keys(f[k]).length) return true;
    return false;
  }

  // --- Relative date formatting (ES + EN) ---
  function relativeDate(dateStr) {
    var l = lang();
    var now = new Date();
    var d = new Date(dateStr);
    var diff = Math.floor((now - d) / 86400000);
    if (l === 'en') {
      if (diff <= 0) return 'Today';
      if (diff === 1) return '1 day ago';
      if (diff < 7) return diff + ' days ago';
      if (diff < 14) return '1 week ago';
      if (diff < 30) return Math.floor(diff / 7) + ' weeks ago';
      return Math.floor(diff / 30) + ' month(s) ago';
    }
    if (diff <= 0) return 'Hoy';
    if (diff === 1) return 'Hace 1 día';
    if (diff < 7) return 'Hace ' + diff + ' días';
    if (diff < 14) return 'Hace 1 semana';
    if (diff < 30) return 'Hace ' + Math.floor(diff / 7) + ' semanas';
    return 'Hace ' + Math.floor(diff / 30) + ' mes(es)';
  }

  // --- DOM helpers ---
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function chevronSvg(extraClass) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'opp-card-chevron' + (extraClass ? ' ' + extraClass : ''));
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', 'M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z');
    svg.appendChild(path);
    return svg;
  }

  function chip(category, value) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opp-chip opp-chip--' + value;
    btn.setAttribute('data-filter', category);
    btn.setAttribute('data-value', value);
    btn.setAttribute('aria-pressed', isSelected(category, value) ? 'true' : 'false');
    btn.textContent = label(category, value);
    return btn;
  }

  function detailsCell(headingKey, valueOrNode) {
    var cell = document.createElement('div');
    cell.appendChild(el('div', 'opp-card-details-heading', DETAILS_HEADINGS[headingKey][lang()]));
    if (typeof valueOrNode === 'string') {
      cell.appendChild(el('div', 'opp-card-details-value', valueOrNode));
    } else {
      cell.appendChild(valueOrNode);
    }
    return cell;
  }

  // --- Render a single card (closed or open) ---
  function renderCard(opp) {
    var l = lang();
    var isOpen = state.openId === opp.id;
    var title = (l === 'es' && opp.titleEs) ? opp.titleEs : opp.title;
    var desc  = (l === 'es' && opp.descriptionEs) ? opp.descriptionEs : (opp.description || opp.descriptionEs || '');

    var card = document.createElement('article');
    card.className = 'opp-card' + (isOpen ? ' opp-card--open' : '');
    card.setAttribute('data-id', opp.id);
    card.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    // Chevron (absolute)
    card.appendChild(chevronSvg());

    // Header
    var header = el('div', 'opp-card-header');

    var imgWrap = el('div', 'opp-card-image-wrap');
    if (opp.image) {
      var img = document.createElement('img');
      img.className = 'opp-card-image';
      img.src = opp.image;
      img.alt = '';
      img.loading = 'lazy';
      imgWrap.appendChild(img);
    } else {
      // Placeholder: first letter of org in a colored square
      var ph = el('div', 'opp-card-image-placeholder', (opp.org || '?').charAt(0).toUpperCase());
      var phColors = [
        ['#ede9fe','#6d28d9'],['#d1fae5','#047857'],['#fee2e2','#b91c1c'],
        ['#dbeafe','#1e40af'],['#fef3c7','#92400e'],['#fce7f3','#9d174d'],
        ['#e0f2fe','#0369a1'],['#f3e8ff','#7e22ce'],['#ccfbf1','#0f766e'],
        ['#fef9c3','#854d0e']
      ];
      var hash = 0;
      for (var ci = 0; ci < (opp.org||'').length; ci++) hash = (hash * 31 + (opp.org||'').charCodeAt(ci)) | 0;
      var pair = phColors[((hash % phColors.length) + phColors.length) % phColors.length];
      ph.style.setProperty('--placeholder-bg', pair[0]);
      ph.style.setProperty('--placeholder-color', pair[1]);
      imgWrap.appendChild(ph);
    }
    header.appendChild(imgWrap);

    var summary = el('div', 'opp-card-summary');
    summary.appendChild(el('div', 'opp-card-title', title));

    var orgs = el('div', 'opp-card-orgs');
    var orgLink = document.createElement('a');
    orgLink.className = 'opp-card-org';
    orgLink.href = opp.orgUrl || '#';
    if (opp.orgUrl && opp.orgUrl !== '#') {
      orgLink.target = '_blank';
      orgLink.rel = 'noopener noreferrer';
    }
    orgLink.textContent = opp.org;
    orgs.appendChild(orgLink);
    summary.appendChild(orgs);

    summary.appendChild(el('div', 'opp-card-date opp-card-date--mobile', relativeDate(opp.date)));

    var footer = el('div', 'opp-card-footer');
    var headerChips = el('div', 'opp-card-chips');
    headerChips.appendChild(chip('type', opp.type));
    headerChips.appendChild(chip('cause', opp.cause));
    headerChips.appendChild(chip('location', opp.location));
    footer.appendChild(headerChips);
    footer.appendChild(el('div', 'opp-card-date opp-card-date--desktop', relativeDate(opp.date)));
    summary.appendChild(footer);

    header.appendChild(summary);
    card.appendChild(header);

    // Open state extras
    if (isOpen) {
      var details = el('div', 'opp-card-details');

      var row = el('div', 'opp-card-details-row');
      row.appendChild(detailsCell('education', label('education', opp.education)));
      row.appendChild(detailsCell('route',     label('route', opp.route)));

      var skillChips = el('div', 'opp-card-chips');
      skillChips.appendChild(chip('skill', opp.skill));
      row.appendChild(detailsCell('skill', skillChips));

      details.appendChild(row);

      var descBlock = document.createElement('div');
      descBlock.appendChild(el('div', 'opp-card-details-heading', DETAILS_HEADINGS.description[lang()]));
      descBlock.appendChild(el('div', 'opp-card-description', desc));
      details.appendChild(descBlock);

      var actions = el('div', 'opp-card-actions');
      var apply = el('div', 'opp-card-apply');
      var applyBtn = document.createElement('a');
      applyBtn.className = 'btn btn-primary opp-card-apply-btn';
      applyBtn.href = opp.url || '#';
      if (opp.url && opp.url !== '#') {
        applyBtn.target = '_blank';
        applyBtn.rel = 'noopener noreferrer';
      }
      applyBtn.textContent = APPLY_LABEL[lang()];
      apply.appendChild(applyBtn);
      actions.appendChild(apply);
      details.appendChild(actions);

      card.appendChild(details);
    }

    return card;
  }

  // --- Filtering pipeline ---
  function matchesFilters(opp) {
    var query = state.search.toLowerCase().trim();
    if (query) {
      var searchable = (
        opp.title + ' ' + (opp.titleEs || '') + ' ' +
        opp.org + ' ' + opp.locationLabel + ' ' +
        label('cause', opp.cause) + ' ' + label('type', opp.type) + ' ' +
        (opp.descriptionEs || '') + ' ' + (opp.description || '')
      ).toLowerCase();
      if (searchable.indexOf(query) === -1) return false;
    }
    var f = state.filters;
    var cats = ['type', 'cause', 'location', 'education', 'route', 'skill'];
    for (var i = 0; i < cats.length; i++) {
      var cat = cats[i];
      var sel = Object.keys(f[cat]);
      if (sel.length && sel.indexOf(opp[cat]) === -1) return false;
    }
    return true;
  }

  // --- DOM refs ---
  var listEl       = document.getElementById('opp-list');
  var emptyEl      = document.getElementById('opp-empty');
  var countNum     = document.getElementById('count-num');
  var countNumEn   = document.getElementById('count-num-en');
  var clearBtn     = document.getElementById('opp-clear');
  var searchInput  = document.getElementById('opp-search');

  if (!listEl) return;

  // --- Render ---
  function render() {
    var sorted = OPPORTUNITIES.slice().sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
    var filtered = sorted.filter(matchesFilters);

    while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
    filtered.forEach(function (opp) { listEl.appendChild(renderCard(opp)); });

    if (countNum)   countNum.textContent   = filtered.length;
    if (countNumEn) countNumEn.textContent = filtered.length;

    emptyEl.style.display = filtered.length === 0 ? '' : 'none';
    listEl.style.display  = filtered.length === 0 ? 'none' : '';

    if (clearBtn) clearBtn.style.display = hasAnyFilter() ? '' : 'none';

    syncFilterUi();
  }

  // --- Custom filter dropdowns ---
  // Build the items inside each panel based on LABELS map.
  function buildFilterPanels() {
    var filterRoots = document.querySelectorAll('.opp-filter');
    filterRoots.forEach(function (root) {
      var category = root.getAttribute('data-filter');
      var listUl = root.querySelector('.opp-filter-list');
      if (!listUl || !LABELS[category]) return;
      while (listUl.firstChild) listUl.removeChild(listUl.firstChild);

      Object.keys(LABELS[category]).forEach(function (value) {
        var item = el('li', 'opp-filter-item');
        var inputId = 'filter-' + category + '-' + value;

        var input = document.createElement('input');
        input.type = 'checkbox';
        input.id = inputId;
        input.value = value;
        input.className = 'opp-filter-checkbox';
        input.checked = isSelected(category, value);
        input.addEventListener('change', function () {
          toggleFilter(category, value);
          render();
        });

        var lbl = document.createElement('label');
        lbl.setAttribute('for', inputId);
        lbl.textContent = label(category, value);

        item.appendChild(input);
        item.appendChild(lbl);
        listUl.appendChild(item);
      });
    });
  }

  // Update label text + button text + checkbox state to reflect current state + lang
  function syncFilterUi() {
    var l = lang();
    var filterRoots = document.querySelectorAll('.opp-filter');
    filterRoots.forEach(function (root) {
      var category = root.getAttribute('data-filter');

      // Button label (with selected count)
      var btnLabelEl = root.querySelector('.opp-filter-button-label');
      if (btnLabelEl) {
        var sel = selectedValues(category);
        var base = FILTER_TITLES[category][l];
        btnLabelEl.textContent = sel.length ? base + ' (' + sel.length + ')' : base;
      }

      // Checkbox states + label text (after lang switch)
      var items = root.querySelectorAll('.opp-filter-item');
      items.forEach(function (item) {
        var input = item.querySelector('.opp-filter-checkbox');
        var labelEl = item.querySelector('label');
        if (input && labelEl) {
          input.checked = isSelected(category, input.value);
          labelEl.textContent = label(category, input.value);
        }
      });
    });

    // Update main search placeholder
    if (searchInput) searchInput.placeholder = SEARCH_PLACEHOLDER_MAIN[l];

    // Update each panel search placeholder
    document.querySelectorAll('.opp-filter-search').forEach(function (input) {
      input.placeholder = SEARCH_PLACEHOLDER_PANEL[l];
    });
  }

  // Open / close a single dropdown
  function toggleDropdown(category, force) {
    var root = document.querySelector('.opp-filter[data-filter="' + category + '"]');
    if (!root) return;
    var panel = root.querySelector('.opp-filter-panel');
    var btn   = root.querySelector('.opp-filter-button');
    var open  = (typeof force === 'boolean') ? force : panel.hasAttribute('hidden');

    // Close all others first
    document.querySelectorAll('.opp-filter').forEach(function (other) {
      var p = other.querySelector('.opp-filter-panel');
      var b = other.querySelector('.opp-filter-button');
      if (other !== root) {
        if (p && !p.hasAttribute('hidden')) p.setAttribute('hidden', '');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });

    if (open) {
      panel.removeAttribute('hidden');
      btn.setAttribute('aria-expanded', 'true');
      state.openDropdown = category;
      // Focus the panel search input for quick filtering
      var searchEl = panel.querySelector('.opp-filter-search');
      if (searchEl) { searchEl.value = ''; filterPanelItems(panel, ''); searchEl.focus(); }
    } else {
      panel.setAttribute('hidden', '');
      btn.setAttribute('aria-expanded', 'false');
      state.openDropdown = null;
    }
  }

  // Highlight items in the panel that match the search input (no global state)
  function filterPanelItems(panel, query) {
    var q = query.toLowerCase().trim();
    var items = panel.querySelectorAll('.opp-filter-item');
    items.forEach(function (item) {
      var labelEl = item.querySelector('label');
      var text = labelEl ? labelEl.textContent.toLowerCase() : '';
      var match = q === '' || text.indexOf(q) !== -1;
      item.style.display = match ? '' : 'none';
      item.classList.toggle('opp-filter-item--highlight', q !== '' && match);
    });
  }

  // --- Wire up event listeners ---

  // Main search bar
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      state.search = searchInput.value;
      render();
    });
  }

  // Clear filters button
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      clearAllFilters();
      if (searchInput) searchInput.value = '';
      render();
    });
  }

  // Card list — delegated clicks for chips and card toggle
  listEl.addEventListener('click', function (e) {
    // Chip click? Toggle filter, do not toggle card
    var chipBtn = e.target.closest('[data-filter][data-value]');
    if (chipBtn) {
      e.stopPropagation();
      e.preventDefault();
      toggleFilter(chipBtn.dataset.filter, chipBtn.dataset.value);
      render();
      return;
    }

    // Apply button or org link? Let it through, do not toggle card
    if (e.target.closest('a')) return;

    // Otherwise: toggle the card
    var card = e.target.closest('.opp-card');
    if (!card) return;
    var id = card.getAttribute('data-id');
    state.openId = (state.openId === id) ? null : id;
    render();
  });

  // Filter dropdown buttons
  document.addEventListener('click', function (e) {
    // Click on a filter button
    var btn = e.target.closest('.opp-filter-button');
    if (btn) {
      var root = btn.closest('.opp-filter');
      if (root) {
        e.stopPropagation();
        toggleDropdown(root.getAttribute('data-filter'));
      }
      return;
    }
    // Click outside any .opp-filter closes any open dropdown
    if (!e.target.closest('.opp-filter')) {
      document.querySelectorAll('.opp-filter-panel').forEach(function (p) {
        if (!p.hasAttribute('hidden')) p.setAttribute('hidden', '');
      });
      document.querySelectorAll('.opp-filter-button').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
      });
      state.openDropdown = null;
    }
  });

  // Panel search inputs (delegated)
  document.addEventListener('input', function (e) {
    var input = e.target;
    if (!input.classList || !input.classList.contains('opp-filter-search')) return;
    var panel = input.closest('.opp-filter-panel');
    if (panel) filterPanelItems(panel, input.value);
  });

  // Language toggle hook (preserves filter / open state)
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.lang-toggle button')) {
      setTimeout(render, 50);
    }
  });

  // ESC closes the open dropdown or open card
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (state.openDropdown) {
      toggleDropdown(state.openDropdown, false);
    } else if (state.openId) {
      state.openId = null;
      render();
    }
  });

  // Initial setup
  buildFilterPanels();
  render();
})();
