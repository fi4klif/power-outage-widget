const axios = require("axios");

const API_URL = "https://off.energy.mk.ua/api/v2/schedule/active";
const TIME_API = "https://off.energy.mk.ua/api/schedule/time-series";
const MY_QUEUE_ID = 25;

async function testConnection() {
  console.log("\n🧪 ТЕСТ ПІДКЛЮЧЕННЯ\n");
  console.log("═".repeat(50));

  try {
    console.log("\n1️⃣ Перевірка часової таблиці...");
    const timeRes = await axios.get(TIME_API);
    const timeData = timeRes.data;
    console.log(`   ✅ Отримано ${timeData.length} часових слотів`);
    console.log(
      `   Приклад: ${timeData[0].id} = ${timeData[0].start.slice(0, 5)} - ${timeData[0].end.slice(0, 5)}`,
    );

    console.log("\n2️⃣ Перевірка графіку відключень...");
    const schedRes = await axios.get(API_URL);
    const schedData = schedRes.data;
    console.log(`   ✅ Отримано ${schedData.length} графіків`);

    if (schedData.length > 0) {
      const daySchedule = schedData[0];
      console.log(`   📅 Дата: ${daySchedule.date}`);
      console.log(`   Всього записів: ${daySchedule.series.length}`);

      console.log("\n3️⃣ Перевірка черги 5.2 (ID: ${MY_QUEUE_ID})...");
      const myData = daySchedule.series.filter(
        (s) => s.outage_queue_id === MY_QUEUE_ID,
      );
      console.log(`   ✅ Знайдено ${myData.length} слотів для черги 5.2`);

      if (myData.length > 0) {
        const statuses = {};
        myData.forEach((s) => {
          statuses[s.type] = (statuses[s.type] || 0) + 1;
        });

        console.log("\n   📊 Статистика:");
        Object.entries(statuses).forEach(([status, count]) => {
          const statusName =
            {
              OFF: "Вимкнено 🌑",
              ENABLE: "Світло є 💡",
              PROBABLY_OFF: "Можливо ⚠️",
            }[status] || status;
          console.log(`      - ${statusName}: ${count}`);
        });

        console.log("\n   🕐 Перші 5 слотів:");
        myData.slice(0, 5).forEach((s) => {
          const timeRange = timeData.find((t) => t.id === s.time_series_id);
          const time = timeRange
            ? `${timeRange.start.slice(0, 5)} - ${timeRange.end.slice(0, 5)}`
            : `Слот ${s.time_series_id}`;
          const icon =
            s.type === "OFF" ? "🌑" : s.type === "ENABLE" ? "💡" : "⚠️";
          console.log(`      ${icon} [${time}] - ${s.type}`);
        });
      }

      console.log("\n═".repeat(50));
      console.log("✨ ВСІ ПЕРЕВІРКИ ПРОЙДЕНІ!\n");
    }
  } catch (error) {
    console.error("\n❌ ПОМИЛКА:", error.message);
    console.log("\n🔧 Можливі причини:");
    console.log("   - Немає інтернету");
    console.log("   - API сайту недоступний");
    console.log("   - Блокування запитів\n");
  }
}

testConnection();
