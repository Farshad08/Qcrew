const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('qcrew.db');

db.all('SELECT id, name, location, city FROM shops', (err, shops) => {
    if (err) { console.error('Shops error:', err.message); }
    else { console.log('SHOPS:', JSON.stringify(shops, null, 2)); }

    db.all("SELECT id, name, contact, role, shop_id FROM users WHERE role='admin'", (err2, admins) => {
        if (err2) { console.error('Admins error:', err2.message); }
        else { console.log('ADMINS:', JSON.stringify(admins, null, 2)); }

        db.all("PRAGMA table_info(users)", (err3, cols) => {
            if (err3) { console.error('Schema error:', err3.message); }
            else { console.log('USER COLUMNS:', cols.map(c => c.name).join(', ')); }
            db.close(() => process.exit(0));
        });
    });
});
