/**
 * app.js — Navigation, Music Player, Clock
 */
(function () {
  'use strict';

  // ─── Clock ────────────────────────────────────────────────────────────────
  const clockEl = document.getElementById('clock');
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${h}:${m}:${s}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ─── Page Navigation ──────────────────────────────────────────────────────
  const navItems = document.querySelectorAll('.nav-item');
  const pages    = document.querySelectorAll('.page');

  function showPage(pageId) {
    pages.forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
    });
    navItems.forEach(n => n.classList.remove('active'));

    const target = document.getElementById('page-' + pageId);
    const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);

    if (target) {
      target.style.display = 'block';
      // Small tick for transition to apply
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { target.classList.add('active'); });
      });
    }
    if (navItem) navItem.classList.add('active');

    // Close sidebar on mobile after selecting
    if (window.innerWidth <= 900) closeSidebar();
  }

  navItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      showPage(item.dataset.page);
    });
  });

  // Initialize first page
  showPage('photos');

  // ─── Sidebar (mobile) ────────────────────────────────────────────────────
  const sidebar        = document.getElementById('sidebar');
  const hamburger      = document.getElementById('hamburger');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  function openSidebar()  { sidebar.classList.add('open'); sidebarOverlay.classList.add('open'); }
  function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); }

  hamburger.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  sidebarOverlay.addEventListener('click', closeSidebar);

  // ─── Music Player ────────────────────────────────────────────────────────
  const audio       = document.getElementById('bg-audio');
  const toggleBtn   = document.getElementById('music-toggle');
  const trackLabel  = document.getElementById('music-track');
  const progressFill = document.getElementById('music-progress-fill');
  const volSlider   = document.getElementById('vol-slider');
  const iconPlay    = toggleBtn.querySelector('.icon-play');
  const iconPause   = toggleBtn.querySelector('.icon-pause');

  // Try to load the ambient track
  const TRACK_PATH  = 'music/ambient.mp3';
  const TRACK_NAME  = 'ambient.mp3';

  audio.volume = parseFloat(volSlider.value);
  audio.src    = TRACK_PATH;

  audio.addEventListener('canplay', () => {
  trackLabel.textContent = TRACK_NAME;
  // Try immediate autoplay first
  audio.play().then(() => {
    setPlaying(true);
  }).catch(() => {
    // Blocked — wait for first user interaction anywhere on page
    setPlaying(false);
    const startOnInteraction = () => {
      audio.play().then(() => {
        setPlaying(true);
        document.removeEventListener('click', startOnInteraction);
        document.removeEventListener('keydown', startOnInteraction);
        document.removeEventListener('touchstart', startOnInteraction);
      });
    };
    document.addEventListener('click', startOnInteraction);
    document.addEventListener('keydown', startOnInteraction);
    document.addEventListener('touchstart', startOnInteraction);
  });
});

  audio.addEventListener('error', () => {
    trackLabel.textContent = '— drop music/ambient.mp3 —';
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = pct + '%';
    }
  });

  function setPlaying(playing) {
    if (playing) {
      iconPlay.style.display  = 'none';
      iconPause.style.display = 'block';
    } else {
      iconPlay.style.display  = 'block';
      iconPause.style.display = 'none';
    }
  }

  toggleBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  });

  volSlider.addEventListener('input', () => {
    audio.volume = parseFloat(volSlider.value);
  });

})();
