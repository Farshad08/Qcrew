const db = require('./database');

db.serialize(() => {
    db.all("SELECT * FROM users", (err, users) => console.log("Users:", users));
    db.all("SELECT * FROM queue", (err, queue) => console.log("Queue:", queue));
});
