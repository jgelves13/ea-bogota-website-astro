(function () {
  'use strict';

  // --- Essay Sidebar TOC: Scroll Spy ---
  var tocLinks = document.querySelectorAll('.toc-link');
  if (tocLinks.length > 0) {
    var sectionIds = [];
    tocLinks.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      if (id) sectionIds.push(id);
    });

    var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 76;

    function updateActiveToc() {
      var scrollY = window.scrollY + navH + 60;
      var activeId = null;

      sectionIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= scrollY) {
          activeId = id;
        }
      });

      tocLinks.forEach(function (link) {
        var href = link.getAttribute('href').slice(1);
        link.classList.toggle('active', href === activeId);
      });
    }

    var tocRaf;
    window.addEventListener('scroll', function () {
      if (tocRaf) cancelAnimationFrame(tocRaf);
      tocRaf = requestAnimationFrame(updateActiveToc);
    }, { passive: true });
    updateActiveToc();
  }

  // --- Audio Player Widget ---
  var audioPlayer = document.getElementById('audio-player');
  var btnPlay = document.getElementById('audio-play');
  var btnBack = document.getElementById('audio-back');
  var btnFwd = document.getElementById('audio-fwd');
  var btnSpeed = document.getElementById('audio-speed');
  var progressBar = document.getElementById('audio-progress');
  var timeCurrent = document.getElementById('audio-current');
  var timeDuration = document.getElementById('audio-duration');
  var btnListen = document.getElementById('btn-listen');

  if (btnPlay && audioPlayer) {
    var audio = null;
    var speeds = [0.75, 1, 1.25, 1.5, 1.75, 2];
    var speedIdx = 1;

    function fmtTime(s) {
      if (!s || isNaN(s)) return '00:00';
      var m = Math.floor(s / 60);
      var sec = Math.floor(s % 60);
      return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function initAudio() {
      var lang = document.documentElement.lang || 'es';
      var src = '/audio/essay-' + lang + '.mp3';
      if (audio && audio.dataset.lang === lang) return audio;
      if (audio) { audio.pause(); }
      audio = new Audio(src);
      audio.dataset.lang = lang;
      audio.preload = 'metadata';

      audio.addEventListener('loadedmetadata', function () {
        timeDuration.textContent = fmtTime(audio.duration);
        progressBar.max = audio.duration || 100;
      });
      audio.addEventListener('timeupdate', function () {
        timeCurrent.textContent = fmtTime(audio.currentTime);
        progressBar.value = audio.currentTime;
      });
      audio.addEventListener('ended', function () {
        btnPlay.querySelector('.icon-play').style.display = '';
        btnPlay.querySelector('.icon-pause').style.display = 'none';
        if (btnListen) btnListen.classList.remove('active');
      });
      return audio;
    }

    function showPlayer() {
      audioPlayer.classList.add('visible');
    }

    function setPlayIcon(playing) {
      btnPlay.querySelector('.icon-play').style.display = playing ? 'none' : '';
      btnPlay.querySelector('.icon-pause').style.display = playing ? '' : 'none';
      if (btnListen) btnListen.classList.toggle('active', playing);
    }

    function togglePlay() {
      var a = initAudio();
      showPlayer();
      if (a.paused) {
        a.play();
        setPlayIcon(true);
      } else {
        a.pause();
        setPlayIcon(false);
      }
    }

    btnPlay.addEventListener('click', togglePlay);

    if (btnListen) {
      btnListen.addEventListener('click', function () {
        var a = initAudio();
        showPlayer();
        if (a.paused) {
          a.play();
          setPlayIcon(true);
        } else {
          a.pause();
          setPlayIcon(false);
        }
      });
    }

    btnBack.addEventListener('click', function () {
      if (audio) audio.currentTime = Math.max(0, audio.currentTime - 10);
    });
    btnFwd.addEventListener('click', function () {
      if (audio) audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
    });

    progressBar.addEventListener('input', function () {
      if (audio) audio.currentTime = parseFloat(progressBar.value);
    });

    btnSpeed.addEventListener('click', function () {
      speedIdx = (speedIdx + 1) % speeds.length;
      var s = speeds[speedIdx];
      if (audio) audio.playbackRate = s;
      btnSpeed.textContent = 'Speed ' + (s === 1 ? '1' : s) + 'x';
    });
  }

  // --- Share Button ---
  var btnShare = document.getElementById('btn-share');
  if (btnShare) {
    btnShare.addEventListener('click', function () {
      var url = window.location.href;
      function showToast() {
        var toast = document.getElementById('share-toast');
        if (toast) {
          toast.classList.add('visible');
          setTimeout(function () { toast.classList.remove('visible'); }, 2000);
        }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(showToast).catch(function () {
          var ta = document.createElement('textarea');
          ta.value = url;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); showToast(); } catch (e) {}
          document.body.removeChild(ta);
        });
      }
    });
  }

  // --- Footnote Popups ---
  document.addEventListener('click', function (e) {
    var ref = e.target.closest('.fn-ref');
    if (ref) {
      e.preventDefault();
      e.stopPropagation();
      var fn = ref.closest('.fn');
      var wasOpen = fn.classList.contains('open');
      document.querySelectorAll('.fn.open').forEach(function (f) { f.classList.remove('open'); });
      if (!wasOpen) fn.classList.add('open');
      return;
    }
    if (!e.target.closest('.fn-popup')) {
      document.querySelectorAll('.fn.open').forEach(function (f) { f.classList.remove('open'); });
    }
  });
})();
