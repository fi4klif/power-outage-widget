const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const MY_QUEUE_ID = 14; 
const API_URL = 'https://off.energy.mk.ua/api/v2/schedule/active';

app.use(cors());

// Вказуємо серверу, де шукати статичні файли (стилі та скрипти)
app.use('/style', express.static(path.join(__dirname, '../style')));
app.use('/scripts', express.static(path.join(__dirname, '../scripts')));

let cachedData = null;

async function updateData() {
    try {
        const response = await axios.get(API_URL);
        if (response.data && response.data.length > 0) {
            const mySeries = response.data[0].series.filter(s => s.outage_queue_id === MY_QUEUE_ID);
            cachedData = {
                lastUpdate: new Date().toISOString(),
                queue: MY_QUEUE_ID,
                schedule: mySeries
            };
            console.log(`[${new Date().toLocaleTimeString()}] Дані оновлено`);
        }
    } catch (e) { console.error("Помилка отримання даних з API"); }
}

setInterval(updateData, 20 * 60 * 1000);
updateData();

// Головна сторінка — віддаємо наш index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// API для отримання даних
app.get('/api/schedule', (req, res) => {
    res.json(cachedData || { error: "Дані ще завантажуються..." });
});

app.listen(PORT, () => console.log(`Сервер працює на порту ${PORT}`));