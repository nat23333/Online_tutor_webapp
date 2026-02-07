const axios = require('axios');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const domain = 'https://online-tutor-webapp.onrender.com';
const webhookPath = '/api/admin/telegram/webhook';

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is missing in .env');
    process.exit(1);
}

async function setWebhook() {
    try {
        const url = `https://api.telegram.org/bot${token}/setWebhook?url=${domain}${webhookPath}`;
        console.log(`Setting webhook to: ${domain}${webhookPath}`);
        const response = await axios.get(url);
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error setting webhook:', error.response ? error.response.data : error.message);
    }
}

setWebhook();
