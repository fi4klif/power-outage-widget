const API_URL = '/api/schedule';

async function updateWidget() {
    // Отримуємо елементи
    const container = document.getElementById('schedule-grid');
    const footerInfo = document.getElementById('light-info');
    const statusLabel = document.getElementById('current-status');
    const titleLabel = document.getElementById('queue-title');
    const timeLabel = document.getElementById('update-time');

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.error) throw new Error(data.error);

        // 1. Оновлюємо заголовок
        titleLabel.innerText = `Черга ${data.queueId || data.queue}`;
        timeLabel.innerText = new Date(data.lastUpdate).toLocaleTimeString('uk-UA');

        // 2. Очищуємо список
        container.innerHTML = '';
        let lightCount = 0;

        // 3. Будуємо список
        data.schedule.forEach(slot => {
            const div = document.createElement('div');
            div.className = `slot-item ${slot.status}`; // status приходить з server.js (OFF, ENABLE)

            // Текст статусу
            let statusText = 'Світло є 💡';
            if (slot.status === 'OFF') statusText = 'Вимкнено 🌑';
            if (slot.status === 'PROBABLY_OFF') statusText = 'Можливо ⚠️';

            // Підрахунок годин (приблизно 1 слот = 2 години, якщо time-series стандартний)
            // Або просто рахуємо кількість слотів
            if (slot.status === 'ENABLE') lightCount++;

            div.innerHTML = `
                <span class="time">${slot.time_range}</span>
                <span class="status">${statusText}</span>
            `;
            container.appendChild(div);
        });

        // 4. Оновлюємо статус вгорі (по першому слоту або поточному часу)
        // Для простоти беремо статус першого слоту у списку, який зазвичай є "поточним" або "найближчим"
        const currentSlot = data.schedule[0]; 
        if (currentSlot) {
            statusLabel.innerText = currentSlot.status === 'OFF' ? 'Зараз темно' : 'Зараз світло';
            statusLabel.className = `status-indicator ${currentSlot.status}`;
        }

        // 5. Виноска внизу
        footerInfo.innerText = `Зі світлом сьогодні: ~${lightCount * 2} год.`; // Множимо на 2, бо слот ~2 години

    } catch (error) {
        console.error('Помилка:', error);
        titleLabel.innerText = 'Помилка';
        container.innerHTML = '<div style="text-align:center; padding:20px;">Не вдалося отримати дані 😔</div>';
    }
}

updateWidget();
setInterval(updateWidget, 60000); // Оновлення раз на хвилину