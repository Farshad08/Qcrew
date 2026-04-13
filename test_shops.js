const http = require('http');
const fs = require('fs');

http.get('http://localhost:3000/api/shops', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('api_shops_out.json', data);
        console.log("Wrote to api_shops_out.json");
    });
}).on('error', err => {
    console.error(err.message);
});
