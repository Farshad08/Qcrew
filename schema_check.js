const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('qcrew.db');

db.serialize(() => {
    db.all('PRAGMA table_info(queue)', (err, rows) => {
        console.log("Queue Table:", rows);
    });
    db.all('PRAGMA table_info(users)', (err, rows) => {
        console.log("Users Table:", rows);
    });
});
