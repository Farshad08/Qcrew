const http = require('http');

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

async function runTests() {
    try {
        console.log("=== Testing API ===");

        // 1. Get Shops
        let res = await makeRequest('/api/shops');
        console.log("Shops:", JSON.stringify(res.shops.map(s => s.name)));
        const shopId = res.shops[0].id;

        // 2. Register User
        res = await makeRequest('/api/login', 'POST', { contact: 'bob123', name: 'Bob' });
        console.log("Registered:", res.user.name);
        const userId = res.user.id;

        // 3. Admin Login
        res = await makeRequest('/api/login', 'POST', { contact: 'admin1' });
        console.log("Admin Login:", res.user.name, "Shop ID:", res.user.shop_id);

        // 4. Book Slot
        res = await makeRequest('/api/queue', 'POST', { user_id: userId, shop_id: shopId, service: 'Haircut' });
        console.log("Booked Slot ID:", res.bookingId);
        const queueId = res.bookingId;

        // 5. Get Queue for Shop
        res = await makeRequest(`/api/queue?shop_id=${shopId}`);
        console.log("Queue Length:", res.queue.waiting.length);

        // 6. Set Serving
        res = await makeRequest(`/api/queue/${queueId}/status`, 'PUT', { status: 'serving' });
        console.log("Set to serving:", res.success);

        // 7. Complete
        res = await makeRequest(`/api/queue/${queueId}/status`, 'PUT', { status: 'completed' });
        console.log("Set to completed:", res.success);

        // 8. Output Stats
        res = await makeRequest(`/api/stats?shop_id=${shopId}`);
        console.log("Total Served Today:", res.todayCompleted);

        console.log("=== ALL TESTS PASSED ===");
    } catch (err) {
        console.error("Test Failed", err);
    }
}

runTests();
