const http = require('http');
const fs = require('fs');

const makeRequest = (path, method = 'GET', data = null) => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost', port: 3000, path, method,
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body || '{}') }));
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
};

async function run() {
    let results = { shops: null, adminLogin: null, register: null, booking: null };
    try {
        results.shops = await makeRequest('/api/shops');
        results.adminLogin = await makeRequest('/api/login', 'POST', { contact: 'admin1' });
        results.register = await makeRequest('/api/login', 'POST', { contact: 'testuser_e2e_' + Date.now(), name: 'E2E Tester' });
        if (results.register.status === 200 && results.shops.body && results.shops.body.shops && results.shops.body.shops.length > 0) {
            results.booking = await makeRequest('/api/queue', 'POST', {
                user_id: results.register.body.user.id,
                shop_id: results.shops.body.shops[0].id,
                service: 'Test Service'
            });
        }
    } catch (e) {
        results.error = e.message;
    }
    fs.writeFileSync('e2e_results.json', JSON.stringify(results, null, 2));
}
run();
