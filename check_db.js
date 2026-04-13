const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('qcrew.db');
const fs = require('fs');

db.serialize(() => {
    db.all("SELECT * FROM shops", (err, rows) => {
        fs.writeFileSync("check_shops.json", JSON.stringify(rows, null, 2));
    });
    db.all("SELECT * FROM users", (err, rows) => {
        fs.writeFileSync("check_users.json", JSON.stringify(rows, null, 2));
    });
    db.all("SELECT * FROM queue", (err, rows) => {
        fs.writeFileSync("check_queue.json", JSON.stringify(rows, null, 2));
    });
});
setTimeout(() => process.exit(0), 1000);
