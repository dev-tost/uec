/* ---------- TOAST ---------- */
// Wygląd toasta jest w całości w style.css (.ak-toast / .ak-toast-success / .ak-toast-error)

export function showToast(message, type = 'success', duration = 3000) {
  const existing = document.getElementById('ak-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'ak-toast';
  toast.className = `ak-toast ak-toast-${type}`;
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
