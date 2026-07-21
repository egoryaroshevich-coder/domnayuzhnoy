const loginForm = document.querySelector("#admin-login-form");
const emailInput = document.querySelector("#admin-email");
const passwordInput = document.querySelector("#admin-password");
const errorBox = document.querySelector("#admin-login-error");
const submitButton = document.querySelector("#admin-login-submit");

async function existingAdminSession() {
  const { data } = await window.supabaseClient.auth.getSession();
  if (data.session?.user) {
    location.replace("../admin/");
  }
}

loginForm?.addEventListener("submit", async event => {
  event.preventDefault();
  errorBox.textContent = "";

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  if (!email || !password) {
    errorBox.textContent = "Проверьте email и пароль.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Входим...";

  const { data, error } = await window.supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    errorBox.textContent = "Неверный email или пароль.";
    submitButton.disabled = false;
    submitButton.textContent = "Войти";
    return;
  }

  location.replace("../admin/");
});

existingAdminSession();
