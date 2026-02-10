const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;
const MY_QUEUE_ID = 25;
const UPDATE_INTERVAL = 10 * 60 * 1000;

const API_URL = "https://off.energy.mk.ua/api/v2/schedule/active";
const TIME_API = "https://off.energy.mk.ua/api/schedule/time-series";

app.use(cors());
app.use("/style", express.static(path.join(__dirname, "../style")));
app.use("/scripts", express.static(path.join(__dirname, "../scripts")));

let cachedData = null;
let timeMap = {};

async function updateData() {
  try {
    if (Object.keys(timeMap).length === 0) {
      const timeRes = await axios.get(TIME_API);
      timeRes.data.forEach((t) => {
        timeMap[t.id] = `${t.start.slice(0, 5)} - ${t.end.slice(0, 5)}`;
      });
      console.log(
        `[${new Date().toLocaleTimeString()}] Довідник часу завантажено. Всього слотів: ${Object.keys(timeMap).length}`,
      );
    }

    const response = await axios.get(API_URL);
    if (response.data && response.data.length > 0) {
      const daySchedule = response.data[0];
      const mySeries = daySchedule.series
        .filter((s) => s.outage_queue_id === MY_QUEUE_ID)
        .map((s) => ({
          status: s.type,
          time_id: s.time_series_id,
          time_range: timeMap[s.time_series_id] || `Слот ${s.time_series_id}`,
        }))
        .sort((a, b) => a.time_id - b.time_id);

      cachedData = {
        lastUpdate: new Date().toISOString(),
        queueId: MY_QUEUE_ID,
        schedule: mySeries,
      };
      const offCount = mySeries.filter((s) => s.status === "OFF").length;
      console.log(
        `[${new Date().toLocaleTimeString()}] ✅ Дані оновлено. Слотів: ${mySeries.length}, Відключень: ${offCount}`,
      );
    }
  } catch (e) {
    console.error(
      `[${new Date().toLocaleTimeString()}] ❌ Помилка:`,
      e.message,
    );
  }
}

setInterval(updateData, UPDATE_INTERVAL);
updateData();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.get("/api/schedule", (req, res) => {
  if (!cachedData) {
    return res
      .status(202)
      .json({ error: "Дані завантажуються, спробуйте через 5 сек" });
  }
  res.json(cachedData);
});

app.listen(PORT, () => {
  console.log(`\n🚀 Сервер запущено: http://localhost:${PORT}`);
  console.log(`📍 Чергу: ${MY_QUEUE_ID} (5.2)`);
  console.log(`⏱️  Оновлення: кожні ${UPDATE_INTERVAL / 60000} хвилин\n`);
});
