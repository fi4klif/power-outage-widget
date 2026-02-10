const API_URL = '/api/schedule';

async function updateWidget() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.error) return;

        document.getElementById('queue-title').innerText = `Черга ${data.queue}`;
        document.getElementById('update-time').innerText = new Date(data.lastUpdate).toLocaleTimeString();

        const grid = document.getElementById('schedule-grid');
        grid.innerHTML = '';

        let totalLightHours = 0;

        data.schedule.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = `schedule-item ${slot.type.toLowerCase()}`;
            
            // Якщо тип не OFF, додаємо 2 години до загального часу зі світлом
            // (Зазвичай 1 слот = 2 години у графіках)
            if (slot.type !== 'OFF') totalLightHours += 2;

            slotElement.innerHTML = `
                <span class="slot-time">${slot.time}</span>
                <span class="slot-status">${getStatusName(slot.type)}</span>
            `;
            grid.appendChild(slotElement);
        });

        // Додаємо інформацію про загальний час зі світлом
        const footer = document.querySelector('.widget-footer');
        footer.innerHTML = `
            <div>Загалом зі світлом сьогодні: <strong>~${totalLightHours} год.</strong></div>
            <div style="font-size: 0.8em; margin-top:5px;">Оновлено: ${new Date(data.lastUpdate).toLocaleTimeString()}</div>
        `;

    } catch (error) {
        console.error('Помилка:', error);
    }
}

function getStatusName(type) {
    if (type === 'OFF') return '🌑 Немає';
    if (type === 'PROBABLY_OFF') return '⏳ Можливо';
    return '💡 Є світло';
}

updateWidget();
setInterval(updateWidget, 60000);