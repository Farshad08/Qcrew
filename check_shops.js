const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('qcrew.db');

db.all('SELECT id, name, location, city, lat, lng FROM shops', (err, shops) => {
    if (err) { console.error(err); db.close(); return; }
    console.log('=== SHOPS ===');
    console.log(JSON.stringify(shops, null, 2));

    db.all("SELECT id, name, contact, role, shop_id FROM users WHERE role='admin'", (err2, admins) => {
        if (err2) { console.error(err2); db.close(); return; }
        console.log('\n=== ADMINS ===');
        console.log(JSON.stringify(admins, null, 2));
        db.close();
    });
});
