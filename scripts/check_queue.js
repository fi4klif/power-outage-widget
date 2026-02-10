const axios = require('axios');

async function getQueues() {
    try {
        console.log("🔍 Шукаю ID для черг...");
        // Отримуємо список черг (тип 3 = ГПВ)
        const response = await axios.get('https://off.energy.mk.ua/api/outage-queue/by-type/3');
        const queues = response.data;

        // Шукаємо 5.2
        const myQueue = queues.find(q => q.name.includes("5.2"));
        
        if (myQueue) {
            console.log(`✅ ЗНАЙДЕНО! Для черги ${myQueue.name} використовуй ID: ${myQueue.id}`);
        } else {
            console.log("⚠️ Чергу 5.2 не знайдено в списку. Ось усі доступні:", queues.map(q => `${q.name}: ${q.id}`));
        }
    } catch (e) {
        console.error("Помилка:", e.message);
    }
}

getQueues();