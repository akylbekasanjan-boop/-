require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const TELEGRAM_BOT_TOKEN = process.env['TELEGRAM-BOT-TOKEN'] || process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_CHAT_ID = process.env['ADMIN-CHAT-ID'] || process.env.ADMIN_CHAT_ID || '';

let bot = null;

if (TELEGRAM_BOT_TOKEN) {
    try {
        const TelegramBot = require('node-telegram-bot-api');
        bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
        console.log('✅ Telegram бот подключён');
    } catch (e) {
        console.log('⚠️ Ошибка:', e.message);
    }
}

const registrations = [];

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/register', async (req, res) => {
    try {
        const { name, phone } = req.body;
        
        if (!name || !phone) {
            return res.json({ success: false, message: 'Заполните все поля' });
        }
        
        const registration = {
            id: registrations.length + 1,
            name: name.trim(),
            phone: phone.trim(),
            timestamp: new Date().toISOString()
        };
        registrations.push(registration);
        
        console.log('📝 Заявка:', registration);
        
        if (bot && ADMIN_CHAT_ID) {
            const message = `🎉 *Новая регистрация!*\n\n👤 *Имя:* ${name}\n📱 *Телефон:* ${phone}`;
            try {
                await bot.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: 'Markdown' });
            } catch (e) { console.log('❌', e.message); }
        }
        
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: 'Ошибка' });
    }
});

app.get('/api/registrations', (req, res) => {
    res.json({ success: true, registrations: registrations.reverse() });
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер на порту ${PORT}`);
});
