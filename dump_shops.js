const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('qcrew.db');
const fs = require('fs');

db.all('SELECT * FROM shops', (err, rows) => {
    fs.writeFileSync('shops_dump.json', JSON.stringify(rows, null, 2));
    process.exit(0);
});
