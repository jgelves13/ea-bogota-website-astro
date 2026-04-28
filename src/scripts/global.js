(function () {
  'use strict';

  // --- Mobile Navigation ---
  document.addEventListener('click', function (e) {
    var hamburger = e.target.closest('.hamburger');
    if (hamburger) {
      hamburger.classList.toggle('open');
      var mobileNav = document.querySelector('.mobile-nav');
      if (mobileNav) mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav && mobileNav.classList.contains('open') ? 'hidden' : '';
    }
  });

  document.addEventListener('click', function (e) {
    if (e.target.matches('.mobile-nav a')) {
      var hamburger = document.querySelector('.hamburger');
      var mobileNav = document.querySelector('.mobile-nav');
      if (hamburger) hamburger.classList.remove('open');
      if (mobileNav) mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // --- Scroll Fade-In (IntersectionObserver) ---
  if ('IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-in').forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('visible');
      } else {
        el.classList.add('animate');
        fadeObserver.observe(el);
      }
    });
  } else {
    document.querySelectorAll('.fade-in').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  setTimeout(function () {
    document.querySelectorAll('.fade-in.animate:not(.visible)').forEach(function (el) {
      el.classList.add('visible');
    });
  }, 2000);

  // --- Nav Dropdown toggle ---
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.nav-dropdown-toggle');
    if (toggle) {
      e.preventDefault();
      e.stopPropagation();
      var dd = toggle.closest('.nav-dropdown');
      var isOpen = dd.getAttribute('data-open') === 'true';
      document.querySelectorAll('.nav-dropdown[data-open="true"]').forEach(function (other) {
        if (other !== dd) {
          other.setAttribute('data-open', 'false');
          var otherToggle = other.querySelector('.nav-dropdown-toggle');
          if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
        }
      });
      dd.setAttribute('data-open', isOpen ? 'false' : 'true');
      toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      return;
    }
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown[data-open="true"]').forEach(function (dd) {
        dd.setAttribute('data-open', 'false');
        var t = dd.querySelector('.nav-dropdown-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown[data-open="true"]').forEach(function (dd) {
        dd.setAttribute('data-open', 'false');
        var t = dd.querySelector('.nav-dropdown-toggle');
        if (t) {
          t.setAttribute('aria-expanded', 'false');
          t.focus();
        }
      });
    }
  });

  // --- Smooth anchor scroll offset for fixed nav ---
  function scrollToHash(hash) {
    if (!hash) return;
    var id = hash.slice(1);
    var target = document.getElementById(id);
    if (target) {
      var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 64;
      var top = target.getBoundingClientRect().top + window.scrollY - offset - 20;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      e.preventDefault();
      scrollToHash(anchor.getAttribute('href'));
    }
  });

  if (window.location.hash) {
    requestAnimationFrame(function () {
      scrollToHash(window.location.hash);
    });
  }
})();
