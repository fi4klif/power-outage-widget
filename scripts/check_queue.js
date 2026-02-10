const axios = require("axios");

async function findQueueId(queueName) {
  try {
    console.log(`🔍 Пошук черги: ${queueName}...\n`);
    const response = await axios.get(
      "https://off.energy.mk.ua/api/outage-queue/by-type/3",
    );
    const queues = response.data;

    const myQueue = queues.find((q) => q.name.includes(queueName));

    if (myQueue) {
      console.log(`✅ ЗНАЙДЕНО!`);
      console.log(`   Назва: ${myQueue.name}`);
      console.log(`   ID: ${myQueue.id}\n`);
      console.log(
        `📝 Замініть у server.js: const MY_QUEUE_ID = ${myQueue.id};\n`,
      );
    } else {
      console.log(`⚠️ Чергу "${queueName}" не знайдено.`);
      console.log(`Доступні черги:`);
      queues.forEach((q) => console.log(`   - ${q.name}: ${q.id}`));
      console.log();
    }
  } catch (e) {
    console.error(`❌ Помилка: ${e.message}`);
  }
}

findQueueId("5.2");
