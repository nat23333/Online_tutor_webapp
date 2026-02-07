const axios = require('axios');

async function testEndpoint() {
    const url = 'https://online-tutor-webapp.onrender.com/api/admin/telegram/webhook';
    console.log(`Testing POST to ${url}...`);
    try {
        const response = await axios.post(url, {
            update_id: 123456789,
            message: {
                message_id: 1,
                from: { id: 123, is_bot: false, first_name: 'Test' },
                chat: { id: 123, first_name: 'Test', type: 'private' },
                date: 1678900000,
                text: '/start'
            }
        });
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.status : error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

testEndpoint();
