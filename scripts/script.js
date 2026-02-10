const API_URL = "/api/schedule";
const UPDATE_INTERVAL = 60000;

async function updateWidget() {
  const container = document.getElementById("schedule-grid");
  const footerInfo = document.getElementById("light-info");
  const statusLabel = document.getElementById("current-status");
  const titleLabel = document.getElementById("queue-title");
  const timeLabel = document.getElementById("update-time");

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.error) throw new Error(data.error);

    titleLabel.innerText = `Черга ${data.queueId}`;
    timeLabel.innerText = new Date(data.lastUpdate).toLocaleTimeString("uk-UA");

    container.innerHTML = "";
    let lightCount = 0;

    data.schedule.forEach((slot) => {
      const div = document.createElement("div");
      div.className = `slot-item ${slot.status}`;

      let statusText = "Світло є 💡";
      if (slot.status === "OFF") statusText = "Вимкнено 🌑";

      if (slot.status === "ENABLE" || slot.status === "PROBABLY_OFF") lightCount++;

      div.innerHTML = `<span class="time">${slot.time_range}</span><span class="status">${statusText}</span>`;
      container.appendChild(div);
    });

    const currentSlot = data.schedule[0];
    if (currentSlot) {
      const hasLight = currentSlot.status === "ENABLE" || currentSlot.status === "PROBABLY_OFF";
      statusLabel.innerText = hasLight ? "Зараз світло" : "Зараз темно";
      statusLabel.className = `status-indicator ${currentSlot.status}`;
    }

    footerInfo.innerText = `Зі світлом сьогодні: ${lightCount} слотів (~${lightCount * 2} год.)`;
  } catch (error) {
    console.error("Помилка:", error);
    titleLabel.innerText = "Помилка";
    container.innerHTML =
      '<div style="text-align:center; padding:20px;">Не вдалося отримати дані 😔</div>';
  }
}

updateWidget();
setInterval(updateWidget, UPDATE_INTERVAL);
