const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Додай це: npm install cors
const app = express();

// Render сам призначає порт, тому використовуємо process.env.PORT
const PORT = process.env.PORT || 3000; 

app.use(cors()); // Дозволяє запити з будь-яких пристроїв (Obsidian, телефон)

const MY_QUEUE_ID = 14; 
const API_URL = 'https://off.energy.mk.ua/api/v2/schedule/active';

let cachedData = null;

async function updateData() {
    try {
        const response = await axios.get(API_URL);
        if (response.data && response.data.length > 0) {
            // Фільтруємо дані під твою чергу
            const mySeries = response.data[0].series.filter(s => s.outage_queue_id === MY_QUEUE_ID);
            cachedData = {
                lastUpdate: new Date().toISOString(),
                queue: MY_QUEUE_ID,
                schedule: mySeries
            };
            console.log(`[${new Date().toLocaleTimeString()}] Дані оновлено`);
        }
    } catch (e) { console.error("Помилка API"); }
}

setInterval(updateData, 20 * 60 * 1000);
updateData();

app.get('/', (req, res) => res.send("Energy API is Running! ⚡"));
app.get('/api/schedule', (req, res) => res.json(cachedData || { error: "No data" }));

app.listen(PORT, () => console.log(`Server on port ${PORT}`));