// === Authentication ===
async function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) alert('Sign Up Error: ' + error.message);
  else alert('Signup successful! Please check your email to confirm.');
}

async function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert('Login Error: ' + error.message);
  else {
    document.getElementById('auth').classList.add('hidden');
    checkCharacter();
  }
}

async function logout() {
  await supabase.auth.signOut();
  location.reload();
}