// === Supabase Initialization ===
let supabase;

function initSupabase() {
  supabase = window.supabase.createClient(
    'https://tvrgvuqtwaoxcnzwkyus.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cmd2dXF0d2FveGNuendreXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NDA3NDEsImV4cCI6MjA2MTQxNjc0MX0.LflcXpJ7Bp867auMjWvbIZ_Iv84GwKbku2BfRGUwZdE'
  );
}

async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    document.getElementById('auth').classList.add('hidden');
    checkCharacter();
  } else {
    showPage('auth');
  }
}