const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
// ⚠️ ЗАМІНИ НА ID, ЯКИЙ ОТРИМАВ НА КРОЦІ 1 (наприклад, може бути 52 або інше)
const MY_QUEUE_ID = 26; 

const API_URL = 'https://off.energy.mk.ua/api/v2/schedule/active';
const TIME_API = 'https://off.energy.mk.ua/api/schedule/time-series';

app.use(cors());

// --- ВИПРАВЛЕННЯ ВІЗУАЛУ ---
// Робимо папку style публічною, щоб HTML міг бачити CSS
app.use('/style', express.static(path.join(__dirname, '../style')));
app.use('/scripts', express.static(path.join(__dirname, '../scripts')));

let cachedData = null;
let timeMap = {};

async function updateData() {
    try {
        // 1. Оновлюємо довідник часу (00:00-02:00 і т.д.)
        if (Object.keys(timeMap).length === 0) {
            const timeRes = await axios.get(TIME_API);
            timeRes.data.forEach(t => {
                // Обрізаємо секунди: 00:00:00 -> 00:00
                timeMap[t.id] = `${t.start.slice(0, 5)} - ${t.end.slice(0, 5)}`;
            });
        }

        // 2. Отримуємо графік
        const response = await axios.get(API_URL);
        if (response.data && response.data.length > 0) {
            const daySchedule = response.data[0]; // Беремо графік на сьогодні/завтра
            
            // Фільтруємо ТІЛЬКИ твою чергу
            const mySeries = daySchedule.series
                .filter(s => s.outage_queue_id === MY_QUEUE_ID)
                .map(s => ({
                    status: s.type, // OFF, ENABLE, PROBABLY_OFF
                    time_id: s.time_series_id,
                    // Підставляємо реальний час із довідника
                    time_range: timeMap[s.time_series_id] || `Слот ${s.time_series_id}`
                }))
                .sort((a, b) => a.time_id - b.time_id); // Сортуємо по часу

            cachedData = {
                lastUpdate: new Date().toISOString(),
                queueId: MY_QUEUE_ID,
                schedule: mySeries
            };
            console.log(`[${new Date().toLocaleTimeString()}] Дані оновлено. Знайдено ${mySeries.length} слотів.`);
        }
    } catch (e) {
        console.error("Помилка оновлення даних:", e.message);
    }
}

// Оновлення раз на 10 хв
setInterval(updateData, 10 * 60 * 1000);
updateData();

// Головна сторінка
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// API для фронтенда
app.get('/api/schedule', (req, res) => {
    res.json(cachedData || { error: "Іде завантаження..." });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));