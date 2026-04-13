const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const db = new sqlite3.Database('qcrew.db');

db.serialize(() => {
    db.all("SELECT * FROM users", (err, users) => fs.writeFileSync('users.json', JSON.stringify(users, null, 2)));
    db.all("SELECT * FROM queue", (err, queue) => fs.writeFileSync('queue.json', JSON.stringify(queue, null, 2)));
    db.all('PRAGMA table_info(queue)', (err, res) => fs.writeFileSync('queue_schema.json', JSON.stringify(res, null, 2)));
});
