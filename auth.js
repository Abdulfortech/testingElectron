window.onload = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
        // 🚫 Not logged in → go back to login page
        window.location.href = "index.html";
        return;
    }

    // ✅ Show user info
    document.getElementById("navbarUser").textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById("businessName").textContent = user.business.name;
};

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

