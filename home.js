
const apiBase = 'https://pharmalogs.abdulfortech.com/api';

window.onload = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html"; // not logged in
    return;
  }

  fetch(`${apiBase}/cashier/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(response => {
      if (!response.status) return;

      const { stats, transactions } = response.data;

      // Update stats counts
      document.getElementById("patientsCount").textContent = stats.customers;
      document.getElementById("ordersCount").textContent = stats.orders;
      document.getElementById("transactionsCount").textContent = stats.transactions;
      document.getElementById("transactionsTodayCount").textContent = stats.transactions_today;

      // Populate transactions table
      const tbody = document.getElementById("transactionsTableBody");
      tbody.innerHTML = ""; // clear

      transactions.forEach((tx, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${tx.user}</td>
            <td>${tx.cashier ?? "-"}</td>
            <td>${tx.store}</td>
            <td>${tx.dispensary}</td>
            <td>${tx.order_code}</td>
            <td>₦${tx.amount.toLocaleString()}</td>
            <td>${tx.channel}</td>
            <td><span class="badge bg-${tx.status === "Paid" ? "success" : "danger"}">${tx.status}</span></td>
            <td>${tx.date}</td>
            <td>
              <button class="btn btn-sm btn-primary view-btn" data-id="${tx.id}">
                <i class="fas fa-eye"></i> View
              </button>
              <button class="btn btn-sm btn-primary" onclick='printTransaction(${JSON.stringify(tx)})'>Print</button>
            </td>
          </tr>
        `;
        tbody.insertAdjacentHTML("beforeend", row);
      });
      // Add event listeners for buttons
      document.querySelectorAll(".view-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const txId = this.getAttribute("data-id");
          viewTransaction(txId);
        });
      });
    })
    .catch(err => console.error("Error fetching dashboard:", err));
};

function viewTransaction(id) {
  const token = localStorage.getItem("token");

  fetch(`${apiBase}/cashier/transactions/${id}/get`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((result) => {
      if (result.status && result.data) {
        const tx = result.data;

        // Fill modal fields
        document.getElementById("txReference").textContent = tx.reference || "N/A";
        document.getElementById("txAmount").textContent = tx.amount || "0";
        document.getElementById("txStatus").innerHTML =
          `<span class="badge bg-${tx.status === "success" ? "success" : "danger"}">${tx.status}</span>`;
        document.getElementById("txDate").textContent = new Date(tx.created_at).toLocaleString();
        document.getElementById("txChannel").textContent = tx.channel || "N/A";
        document.getElementById("txDescription").textContent = tx.description || "N/A";

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById("transactionModal"));
        modal.show();
      } else {
        toastr.error("Failed to load transaction details");
      }
    })
    .catch((err) => {
      console.error("Error fetching transaction details:", err);
      toastr.error("An error occurred");
    });
}

function printTransaction(transaction) {
  const business = JSON.parse(localStorage.getItem("business"));
  const user = JSON.parse(localStorage.getItem("user"));

  const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Transaction Receipt</title>
      <style>
        body { font-family: Courier, monospace; font-size: 13px; margin: 0; width: 80mm; }
        .receipt-container { padding: 10px; }
        .text-center { text-align: center; }
        .divider { border-top: 1px dashed #999; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="text-center">
          <h2>${business?.name?.toUpperCase() || "BUSINESS NAME"}</h2>
          <p><i>${business?.motto || ""}</i><br>Unit: ${transaction.dispensary || "N/A"}</p>
        </div>
        <div class="divider"></div>
        <p>Customer: ${transaction.customer_name || "Unknown"}</p>
        <p>Issuer: ${user?.firstName || ""} ${user?.lastName || ""}</p>
        <p>Reference: ${transaction.reference}</p>
        <p>Type: ${transaction.type === "Credit" ? "Purchase" : "Refund"}</p>
        <p>Amount: ₦${Number(transaction.amount).toLocaleString()}</p>
        <p>Status: ${transaction.status}</p>
        <div class="divider"></div>
        <div class="text-center"><h2>${transaction.status === "Paid" ? "PAID" : "UNPAID"}</h2></div>
      </div>
    </body>
    </html>
  `;

  if (window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.send("print-transaction", receiptHtml);
  } else {
    console.warn("Electron not available, fallback to browser print");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.print();
  }
}



