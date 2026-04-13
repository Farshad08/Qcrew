const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('qcrew.db');

db.serialize(() => {
    let result = '';
    db.all('SELECT * FROM shops', (err, rows) => {
        result += `Shops: ${rows ? rows.length : err}\n`;
        db.all('SELECT * FROM users', (err, rows) => {
            result += `Users: ${rows ? rows.length : err}\n`;
            fs.writeFileSync('db_status.txt', result);
            process.exit(0);
        });
    });
});
