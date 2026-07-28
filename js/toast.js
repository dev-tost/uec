/* ---------- TOAST ---------- */
(function injectToastStyles() {
  if (document.getElementById('ak-toast-style')) return;
  const s = document.createElement('style');
  s.id = 'ak-toast-style';
  s.textContent = `
    #ak-toast {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%) translateY(12px);
      background: #1b1b1f;
      color: #e9ebef;
      padding: 12px 22px;
      border-radius: 8px;
      font-size: 14px;
      font-family: monospace;
      opacity: 0;
      transition: opacity .25s ease, transform .25s ease;
      z-index: 9999;
      pointer-events: none;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0,0,0,.25);
    }
    #ak-toast.ak-toast-visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    #ak-toast.ak-toast-success { border-left: 3px solid #5c3d2e; }
    #ak-toast.ak-toast-error   { border-left: 3px solid #d4183d; }
  `;
  document.head.appendChild(s);
})();

export function showToast(message, type = 'success', duration = 3000) {
  const existing = document.getElementById('ak-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'ak-toast';
  toast.className = `ak-toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // ta linijka zmusza przeglądarkę, żeby najpierw "zauważyła" ukryty stan toasta,
  // zanim włączymy klasę, która go pokazuje — inaczej animacja pojawienia się by nie zadziałała
  toast.getBoundingClientRect();
  toast.classList.add('ak-toast-visible');

  setTimeout(() => {
    toast.classList.remove('ak-toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
