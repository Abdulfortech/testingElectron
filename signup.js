const apiBase = window.api.backendUrl;

// Configure toastr
toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-top-right",
  timeOut: "3000"
};

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const type = document.getElementById("loginType").value;

  try {
    const res = await fetch(`${apiBase}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, type })
    });
    const data = await res.json();
    if (data.status) {
        var message = data.message || "Login successful!";
        toastr.success(message);

        // ✅ Save token and user data in localStorage
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data));

        // ✅ Redirect to home
        window.location.href = "home.html";
    } else {
        var message = data.message || "Login failed!";
        toastr.error(message);
    }
  } catch (err) {
        toastr.error(err.message);
  }
});

// document.getElementById("registerForm").addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const name = document.getElementById("regName").value;
//   const email = document.getElementById("regEmail").value;
//   const password = document.getElementById("regPassword").value;

//   try {
//     const res = await fetch(`${apiBase}/register`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ name, email, password })
//     });
//     const data = await res.json();
//     document.getElementById("message").innerHTML = `<div class="alert alert-success">${JSON.stringify(data)}</div>`;
//   } catch (err) {
//     document.getElementById("message").innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
//   }
// });
