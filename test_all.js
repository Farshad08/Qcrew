const http = require('http');
const fs = require('fs');

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });

        req.on('error', e => reject(e));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function run() {
    let out = {};
    try {
        out.shops = await makeRequest('/api/shops');
        if (out.shops && out.shops.shops) {
            out.register = await makeRequest('/api/login', 'POST', { contact: 'testuser', name: 'Test' });
            out.adminLogin = await makeRequest('/api/login', 'POST', { contact: 'admin1' }); // Check if admin login returns shop_id

            if (out.register.success && out.shops.shops.length > 0) {
                out.book = await makeRequest('/api/queue', 'POST', {
                    user_id: out.register.user.id,
                    shop_id: out.shops.shops[0].id,
                    service: 'Haircut'
                });
                out.queue = await makeRequest(`/api/queue?shop_id=${out.shops.shops[0].id}`);
            }
        }
    } catch (e) {
        out.error = e.message;
    }
    fs.writeFileSync('test_results.json', JSON.stringify(out, null, 2));
}

run();
