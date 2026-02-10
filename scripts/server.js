const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const MY_QUEUE_ID = 26; // ID для черги 5.2
const API_URL = 'https://off.energy.mk.ua/api/v2/schedule/active';
const TIME_API = 'https://off.energy.mk.ua/api/schedule/time-series';

app.use(cors());
app.use('/style', express.static(path.join(__dirname, '../style')));
app.use('/scripts', express.static(path.join(__dirname, '../scripts')));

let cachedData = null;
let timeMap = {}; // Сюди збережемо інтервали часу

async function updateData() {
    try {
        // Завантажуємо інтервали часу, якщо ще не завантажили
        if (Object.keys(timeMap).length === 0) {
            const timeRes = await axios.get(TIME_API);
            timeRes.data.forEach(t => {
                timeMap[t.id] = `${t.start.substring(0,5)} - ${t.end.substring(0,5)}`;
            });
        }

        const response = await axios.get(API_URL);
        if (response.data && response.data.length > 0) {
            const mySeries = response.data[0].series
                .filter(s => s.outage_queue_id === MY_QUEUE_ID)
                .map(s => ({
                    ...s,
                    time: timeMap[s.time_series_id] || `Слот ${s.time_series_id}`
                }));

            cachedData = {
                lastUpdate: new Date().toISOString(),
                queue: "5.2",
                schedule: mySeries
            };
            console.log(`[${new Date().toLocaleTimeString()}] Дані оновлено для 5.2`);
        }
    } catch (e) { console.error("Помилка API:", e.message); }
}

setInterval(updateData, 20 * 60 * 1000);
updateData();

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));
app.get('/api/schedule', (req, res) => res.json(cachedData || { error: "Завантаження..." }));

app.listen(PORT, () => console.log(`Server started on ${PORT}`));