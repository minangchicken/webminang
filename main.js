document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('mode-toggle');
  const body = document.body;
  const headerImg = document.getElementById('header-img');
  const subtitle = document.querySelector('.subtitle');
  const loginBtn = document.getElementById('loginBtn');
  const btnText = loginBtn?.querySelector('.btn-text');
  const spinner = loginBtn?.querySelector('.spinner');
  const popup = document.getElementById('popup');

  if (!toggle || !headerImg || !subtitle || !loginBtn || !btnText || !spinner || !popup) {
    console.warn("Element penting tidak ditemukan. Periksa ID/class HTML.");
    return;
  }

  const lightImg = "https://i.imgur.com/ICtnWt9.png";
  const darkImg = "https://fontmeme.com/permalink/250529/c5fbc9fd5fe46637522e00b6e65508da.png";

  // Inisialisasi tema berdasarkan preferensi
  function initMode() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      body.classList.add('dark');
      toggle.checked = true;
      headerImg.src = darkImg;
      subtitle.style.color = "#bbb";
    } else {
      body.classList.remove('dark');
      toggle.checked = false;
      headerImg.src = lightImg;
      subtitle.style.color = "#666";
    }
  }

  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      headerImg.src = darkImg;
      subtitle.style.color = "#bbb";
    } else {
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      headerImg.src = lightImg;
      subtitle.style.color = "#666";
    }
  });

  initMode();

  // Fungsi tampilkan popup notifikasi
  function showPopup(message, success = true) {
    const icon = success
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>`;

    popup.innerHTML = `${icon}<span style="margin-left: 8px;">${message}</span>`;
    popup.style.backgroundColor = success ? '#4caf50' : '#f44336';
    popup.style.color = '#fff';
    popup.classList.add('show');

    setTimeout(() => popup.classList.remove('show'), 3000);
  }

  // Fungsi login pakai JSONP
  async function login() {
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!username || !password) {
      showPopup("Username dan password harus diisi", false);
      return;
    }

    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    loginBtn.disabled = true;

    // Hapus script JSONP lama jika ada
    const oldScript = document.getElementById('jsonp-login-script');
    if (oldScript) oldScript.remove();

    const callbackName = 'handleLogin_' + Date.now();

    // Timeout 10 detik jika server tidak merespon
    let timeoutId = setTimeout(() => {
      showPopup("Timeout: Server tidak merespon", false);
      btnText.style.display = 'inline';
      spinner.style.display = 'none';
      loginBtn.disabled = false;
      delete window[callbackName];
      document.getElementById('jsonp-login-script')?.remove();
    }, 10000);

    window[callbackName] = function(result) {
      clearTimeout(timeoutId);
      btnText.style.display = 'inline';
      spinner.style.display = 'none';
      loginBtn.disabled = false;

      if (result.success) {
        const user = {
          username: result.username,
          nama: result.nama,
          level: result.level
        };
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("username", result.username);  // tambah ini
        localStorage.setItem("nama", result.nama);          // dan ini
        localStorage.setItem("lastActivity", Date.now());

        showPopup(`Selamat Datang ${result.nama}`, true);

        setTimeout(() => {
          window.location.href = "menu.html";
        }, 1000);
      }
      else {
        showPopup(result.message || "Username atau Password Salah !!!", false);
      }

      delete window[callbackName];
      document.getElementById('jsonp-login-script')?.remove();
    };

    // Buat dan tambahkan script JSONP
    const script = document.createElement('script');
    script.id = 'jsonp-login-script';
    script.src = `https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec?action=index&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&callback=${callbackName}`;
    document.body.appendChild(script);
  }

  loginBtn.addEventListener('click', login);

  // Login dengan Enter
  document.getElementById('username')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); login(); } });
  document.getElementById('password')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); login(); } });

  // Cek session user sudah login atau belum (hanya di halaman selain login.html)
  const path = window.location.pathname;
  const isLoginPage = path.includes('index.html');
  if (!isLoginPage) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      // Kalau belum login, redirect ke login.html
      window.location.href = "/index.html";
    }
  }

});
