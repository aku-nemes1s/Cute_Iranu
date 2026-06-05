/**
 * GALLERY — gallery.js
 *
 * Reads folders and their images from manifest.json files.
 * Each folder needs: images/FOLDER_NAME/manifest.json
 *
 * Root manifest: manifest.json → lists all folder names
 * Folder manifest: images/FOLDER_NAME/manifest.json → lists image filenames
 */

(function () {
  'use strict';

  // ─── State ────────────────────────────────────────────────────────────────
  let folders = [];       // [{ name, cover, images[] }]
  let currentFolder = null;
  let currentIndex = 0;
  let autoPlayTimer = null;
  let isAutoPlay = false;

  // ─── DOM refs ─────────────────────────────────────────────────────────────
  const container    = document.getElementById('masonry-container');
  const overlay      = document.getElementById('slideshow-overlay');
  const backBtn      = document.getElementById('back-btn');
  const closeBtn     = document.getElementById('close-btn');
  const slideImg     = document.getElementById('slide-img');
  const slideGlitch  = document.getElementById('slide-glitch');
  const thumbStrip   = document.getElementById('thumb-strip');
  const counter      = document.getElementById('slide-counter');
  const folderLabel  = document.getElementById('slide-folder-name');
  const navPrev      = document.getElementById('nav-prev');
  const navNext      = document.getElementById('nav-next');
  const autoBtn      = document.getElementById('auto-btn');
  const folderCount  = document.getElementById('folder-count'); // optional

  // ─── Bootstrap ────────────────────────────────────────────────────────────
  async function init() {
    showLoading();
    try {
      const rootManifest = await fetchJSON('manifest.json');
      const folderNames = rootManifest.folders || [];
      if (folderCount) folderCount.textContent = `${folderNames.length} FOLDERS`;

      const loaded = await Promise.all(
        folderNames.map(name => loadFolder(name))
      );
      folders = loaded.filter(Boolean);
      renderMasonry();
    } catch (err) {
      container.innerHTML = `
        <div class="loading-state">
          <span style="font-size:0.7rem;letter-spacing:0.15em;color:#555">
            NO MANIFEST FOUND — SEE README
          </span>
        </div>`;
      console.error('Gallery init error:', err);
    }
  }

  async function loadFolder(name) {
    try {
      const manifest = await fetchJSON(`images/${name}/manifest.json`);
      const images = (manifest.images || []).map(f => `images/${name}/${f}`);
      return {
        name,
        title: manifest.title || name,
        cover: images[0] || null,
        images,
      };
    } catch {
      return null;
    }
  }

  function showLoading() {
    container.innerHTML = `
      <div class="loading-state">
        <div class="loading-dots">
          <span></span><span></span><span></span>
        </div>
        <span style="font-size:0.6rem;letter-spacing:0.2em;color:#444">LOADING</span>
      </div>`;
  }

  // ─── Masonry render ───────────────────────────────────────────────────────
  function renderMasonry() {
    container.innerHTML = '';
    folders.forEach((folder, i) => {
      const card = document.createElement('div');
      card.className = 'folder-card';
      card.style.setProperty('--delay', `${i * 0.06}s`);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Open folder: ${folder.name}`);

      if (folder.cover) {
        const img = document.createElement('img');
        img.className = 'folder-cover';
        img.src = folder.cover;
        img.alt = folder.name;
        img.loading = 'lazy';
        card.appendChild(img);
      } else {
        const ph = document.createElement('div');
        ph.className = 'folder-placeholder';
        ph.innerHTML = `
          <span class="folder-placeholder-icon">◻</span>
          <span class="folder-placeholder-name">${folder.title.toUpperCase()}</span>`;
        card.appendChild(ph);
      }

      const ov = document.createElement('div');
      ov.className = 'folder-overlay';
      ov.innerHTML = `
        <span class="folder-name">${folder.title.toUpperCase()}</span>
        <span class="folder-count-label">${folder.images.length} photographs</span>`;
      card.appendChild(ov);

      card.addEventListener('click', () => openSlideshow(folder));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') openSlideshow(folder);
      });

      container.appendChild(card);
    });
  }

  // ─── Slideshow ────────────────────────────────────────────────────────────
  function openSlideshow(folder) {
    currentFolder = folder;
    currentIndex = 0;

    folderLabel.textContent = folder.title.toUpperCase();
    buildThumbs(folder.images);
    loadSlide(0, 'none');

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Add keyboard hint
    let hint = overlay.querySelector('.kbd-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'kbd-hint';
      hint.textContent = '← → ARROW KEYS TO NAVIGATE · ESC TO CLOSE';
      overlay.appendChild(hint);
    }
  }

  function closeSlideshow() {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    stopAutoPlay();
  }

  function buildThumbs(images) {
    thumbStrip.innerHTML = '';
    images.forEach((src, i) => {
      const item = document.createElement('div');
      item.className = 'thumb-item' + (i === 0 ? ' active' : '');
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Photo ${i + 1}`;
      img.loading = 'lazy';
      item.appendChild(img);
      item.addEventListener('click', () => loadSlide(i, 'thumb'));
      thumbStrip.appendChild(item);
    });
  }

  function loadSlide(index, direction) {
    if (!currentFolder) return;
    const images = currentFolder.images;
    if (!images.length) return;

    // Clamp
    index = Math.max(0, Math.min(index, images.length - 1));
    currentIndex = index;

    // Update counter
    counter.textContent =
      String(index + 1).padStart(2, '0') + ' / ' +
      String(images.length).padStart(2, '0');

    // Update thumb strip
    const thumbs = thumbStrip.querySelectorAll('.thumb-item');
    thumbs.forEach((t, i) => t.classList.toggle('active', i === index));
    // Scroll active thumb into view
    if (thumbs[index]) {
      thumbs[index].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }

    // Trigger glitch on transition
    triggerGlitch();

    // Fade out → swap → fade in
    slideImg.classList.remove('visible');
    setTimeout(() => {
      slideImg.src = images[index];
      slideImg.onload = () => slideImg.classList.add('visible');
      // Fallback for cached images
      if (slideImg.complete) slideImg.classList.add('visible');
    }, 200);
  }

  function triggerGlitch() {
    slideGlitch.classList.remove('glitching');
    void slideGlitch.offsetWidth; // reflow
    slideGlitch.classList.add('glitching');
  }

  function nextSlide() {
    const len = currentFolder?.images.length || 0;
    loadSlide((currentIndex + 1) % len);
  }

  function prevSlide() {
    const len = currentFolder?.images.length || 0;
    loadSlide((currentIndex - 1 + len) % len);
  }

  // ─── Auto play ────────────────────────────────────────────────────────────
  function toggleAutoPlay() {
    isAutoPlay = !isAutoPlay;
    autoBtn.classList.toggle('active', isAutoPlay);
    autoBtn.textContent = isAutoPlay ? '⏸' : '▶';
    if (isAutoPlay) {
      autoPlayTimer = setInterval(nextSlide, 3500);
    } else {
      stopAutoPlay();
    }
  }

  function stopAutoPlay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
    autoPlayTimer = null;
    isAutoPlay = false;
    autoBtn.classList.remove('active');
    autoBtn.textContent = '▶';
  }

  // ─── Events ───────────────────────────────────────────────────────────────
  backBtn.addEventListener('click', closeSlideshow);
  closeBtn.addEventListener('click', closeSlideshow);
  navPrev.addEventListener('click', () => { stopAutoPlay(); prevSlide(); });
  navNext.addEventListener('click', () => { stopAutoPlay(); nextSlide(); });
  autoBtn.addEventListener('click', toggleAutoPlay);

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('active')) return;
    switch (e.key) {
      case 'ArrowRight': stopAutoPlay(); nextSlide(); break;
      case 'ArrowLeft':  stopAutoPlay(); prevSlide(); break;
      case 'Escape':     closeSlideshow(); break;
    }
  });

  // Touch / swipe
  let touchStartX = 0;
  overlay.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  overlay.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      stopAutoPlay();
      dx < 0 ? nextSlide() : prevSlide();
    }
  }, { passive: true });

  // ─── Helpers ──────────────────────────────────────────────────────────────
  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.json();
  }

  // ─── Start ────────────────────────────────────────────────────────────────
  // Wait for DOM to be fully painted
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();