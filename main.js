// === Main Setup ===
function showPage(page) {
  ["auth", "creation", "dashboard"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  document.getElementById(page).classList.remove('hidden');
}

window.addEventListener('DOMContentLoaded', async function() {
  initSupabase();
  await checkSession();
});

// === Error Catcher ===
window.onerror = function(message, source, lineno, colno, error) {
  alert('Console Error: ' + message + '\n' +
        'Source: ' + source + '\n' +
        'Line: ' + lineno + '\n' +
        'Column: ' + colno);
};