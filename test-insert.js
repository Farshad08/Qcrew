const db = require('./database');
setTimeout(() => {
    db.run('INSERT INTO queue (user_id, shop_id, service) VALUES (?, ?, ?)', [1, 1, 'Haircut'], function (err) {
        if (err) {
            console.error('Queue Insert Error:', err.message);
        } else {
            console.log('Insert Success:', this.lastID);
        }
    });
}, 1000);
