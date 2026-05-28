let records = JSON.parse(localStorage.getItem("records")) || [];

function saveRecord() {
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const plateInput = document.getElementById("plate");
  const dashboard = document.getElementById("dashboard");

  const date = dateInput ? dateInput.value : "";
  const time = timeInput ? timeInput.value : "";
  const plate = plateInput ? plateInput.value.trim() : "";

  if (!plate) {
    alert("กรุณากรอกทะเบียนรถ");
    return;
  }

  const newRecord = { date, time, plate };
  records.push(newRecord);
  localStorage.setItem("records", JSON.stringify(records));

  if (plateInput) plateInput.value = "";
  renderDashboard();
}

function renderDashboard() {
  const dashboard = document.getElementById("dashboard");
  if (!dashboard) return;

  dashboard.innerHTML = "";

  records.forEach((item, index) => {
    const row = document.createElement("div");
    row.style.padding = "8px";
    row.style.borderBottom = "1px solid #ddd";
    row.textContent = `${index + 1}. ${item.date} ${item.time} - ${item.plate}`;
    dashboard.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveRecord);
  }
  renderDashboard();
});
``
