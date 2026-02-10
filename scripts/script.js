// Конфігурація: встав сюди URL свого деплою на Render
const API_URL = 'https://power-outage-widget.onrender.com/api/schedule';

async function updateWidget() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.error) throw new Error(data.error);

        // 1. Оновлюємо текстові дані
        document.getElementById('queue-title').innerText = `Черга ${data.queue}`;
        document.getElementById('update-time').innerText = new Date(data.lastUpdate).toLocaleTimeString();

        // 2. Оновлюємо головний статус (на основі масиву series)
        const isPowerOff = data.schedule.some(item => item.type === 'OFF');
        const statusElement = document.getElementById('current-status');
        
        statusElement.innerText = isPowerOff ? 'Світло обмежено 🌑' : 'Світло є 💡';
        statusElement.className = `status-indicator ${isPowerOff ? 'off' : 'on'}`;

        // 3. Очищуємо та будуємо сітку графіку
        const grid = document.getElementById('schedule-grid');
        grid.innerHTML = '';

        data.schedule.forEach(slot => {
            const slotElement = document.createElement('div');
            // Присвоюємо клас 'off' або 'probably_off' на основі типу з JSON
            slotElement.className = `schedule-item ${slot.type.toLowerCase()}`;
            
            slotElement.innerHTML = `
                <span class="slot-id">Слот ${slot.time_series_id}</span>
                <span class="slot-type">${getReadableType(slot.type)}</span>
            `;
            grid.appendChild(slotElement);
        });

    } catch (error) {
        console.error('Помилка завантаження даних:', error);
        document.getElementById('queue-title').innerText = 'Помилка з\'єднання';
    }
}

function getReadableType(type) {
    switch(type) {
        case 'OFF': return 'Відключено';
        case 'PROBABLY_OFF': return 'Можливе відключення';
        case 'ENABLE': return 'Є світло';
        default: return type;
    }
}

updateWidget();
setInterval(updateWidget, 300000);