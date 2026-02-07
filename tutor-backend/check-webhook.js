const axios = require('axios');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is missing in .env');
    process.exit(1);
}

async function checkWebhook() {
    try {
        const url = `https://api.telegram.org/bot${token}/getWebhookInfo`;
        console.log(`Checking webhook status...`);
        const response = await axios.get(url);
        console.log('Webhook Status:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error checking webhook:', error.response ? error.response.data : error.message);
    }
}

checkWebhook();
