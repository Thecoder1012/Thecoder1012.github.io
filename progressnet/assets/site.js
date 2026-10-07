/* Optional enhancements only: all content and asset links work without JavaScript. */
(() => {
  'use strict';
  const dialog = document.getElementById('figure-viewer');
  const closeButton = document.getElementById('viewer-close');
  const image = document.getElementById('viewer-image');
  const heading = document.getElementById('viewer-title');
  const description = document.getElementById('viewer-description');
  const original = document.getElementById('viewer-original');
  let returnFocus = null;
  if (dialog && typeof dialog.showModal === 'function') {
    document.querySelectorAll('a[data-figure]').forEach(link => {
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        returnFocus = link;
        heading.textContent = link.dataset.title || 'ProgressNet result';
        description.textContent = link.dataset.description || 'Original paper image. Open the full-size image to inspect the detail.';
        image.src = link.href;
        image.alt = link.dataset.alt || link.querySelector('img')?.alt || heading.textContent;
        original.href = link.href;
        dialog.showModal();
        document.documentElement.classList.add('no-scroll');
        dialog.scrollTop = 0;
        closeButton.focus();
      });
    });
    const close = () => dialog.close();
    closeButton.addEventListener('click', close);
    dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close(); } });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('no-scroll');
      if (returnFocus) returnFocus.focus({preventScroll:true});
    });
  }
  // Copy works on localhost and file://, with a selection fallback where clipboard access is restricted.
  const copy = document.getElementById('copy-citation');
  const citation = document.getElementById('citation');
  if (copy && citation) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      let copied = false;
      try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(citation.textContent); copied = true; } } catch (_) {}
      if (!copied) {
        const area = document.createElement('textarea');
        area.value = citation.textContent; area.setAttribute('readonly','');
        area.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.appendChild(area); area.select();
        try { copied = document.execCommand('copy'); } catch (_) {}
        area.remove();
      }
      if (!copied) {
        const range = document.createRange(); range.selectNodeContents(citation);
        const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      }
      copy.textContent = copied ? 'Copied' : 'Selected — press Ctrl+C';
      document.getElementById('copy-status').textContent = copied ? 'Citation copied to clipboard.' : 'Citation selected. Press Control+C or Command+C to copy.';
      setTimeout(() => { copy.textContent = 'Copy BibTeX'; }, 3000);
    });
  }
  // A reader starts playback deliberately. Avoid competing soundtracks.
  const videos = [...document.querySelectorAll('video')];
  videos.forEach(video => video.addEventListener('play', () => {
    videos.forEach(other => { if (other !== video && !other.paused) other.pause(); });
  }));
})();
