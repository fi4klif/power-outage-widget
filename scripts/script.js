const API_URL = '/api/schedule';

async function loadData() {
    const container = document.getElementById('schedule-grid');
    const footerInfo = document.getElementById('light-info');
    
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        if (data.error) {
            container.innerHTML = `<div style="text-align:center">${data.error}</div>`;
            return;
        }

        document.getElementById('queue-title').innerText = `ГПВ: Черга 5.2`; // Можна хардкодом, якщо це твій особистий віджет

        container.innerHTML = '';
        let lightCount = 0;

        data.schedule.forEach(slot => {
            const div = document.createElement('div');
            // Додаємо клас для кольору (OFF, ENABLE, PROBABLY_OFF)
            div.className = `slot-item ${slot.status}`;
            
            // Красивий текст статусу
            let statusText = "Світло є";
            if (slot.status === 'OFF') statusText = "Вимкнено";
            if (slot.status === 'PROBABLY_OFF') statusText = "Можливо";
            
            if (slot.status !== 'OFF') lightCount++; // Рахуємо слоти зі світлом

            div.innerHTML = `
                <span class="time">${slot.time_range}</span>
                <span class="status">${statusText}</span>
            `;
            container.appendChild(div);
        });

        // Виноска внизу
        // Зазвичай 1 слот = 1 година або 2, залежно від time-series. 
        // Припустимо, що це кількість слотів.
        footerInfo.innerText = `Доступних слотів: ${lightCount} з ${data.schedule.length}`;
        document.getElementById('update-time').innerText = new Date(data.lastUpdate).toLocaleTimeString();

    } catch (e) {
        console.error(e);
        container.innerHTML = "Помилка з'єднання...";
    }
}

loadData();
setInterval(loadData, 60000);