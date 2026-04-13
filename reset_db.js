/**
 * reset_db.js  — wipes shops/users/queue and re-seeds with 22 real Indian shops
 * Run: node reset_db.js
 */
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('qcrew.db');

const shops = [
    ['Royal Cuts',         'Andheri West, Mumbai',     'https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80',  'Mumbai',    19.1360, 72.8296],
    ['The Barber House',   'Bandra, Mumbai',            'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',  'Mumbai',    19.0596, 72.8295],
    ['Grooming Station',   'Dadar, Mumbai',             'https://images.unsplash.com/photo-1599351431202-1e0f01221b0b?w=800&q=80',  'Mumbai',    19.0178, 72.8478],
    ['Sharpline Salon',    'Powai, Mumbai',             'https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80',  'Mumbai',    19.1197, 72.9086],
    ['Classic Trim Co.',   'T. Nagar, Chennai',         'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',  'Chennai',   13.0374, 80.2329],
    ["Gentlemen's Cut",    'Anna Nagar, Chennai',       'https://images.unsplash.com/photo-1599351431202-1e0f01221b0b?w=800&q=80',  'Chennai',   13.0850, 80.2101],
    ['The Style Den',      'Velachery, Chennai',        'https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80',  'Chennai',   12.9815, 80.2180],
    ['Fades & Blades',     'Tambaram, Chennai',         'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',  'Chennai',   12.9249, 80.1000],
    ['Urban Barbers',      'Koramangala, Bangalore',    'https://images.unsplash.com/photo-1599351431202-1e0f01221b0b?w=800&q=80',  'Bangalore', 12.9352, 77.6245],
    ['The Blade & Co.',    'Indiranagar, Bangalore',    'https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80',  'Bangalore', 12.9784, 77.6408],
    ['Prestige Cuts',      'HSR Layout, Bangalore',     'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',  'Bangalore', 12.9116, 77.6389],
    ['Mr. Clipper',        'Whitefield, Bangalore',     'https://images.unsplash.com/photo-1599351431202-1e0f01221b0b?w=800&q=80',  'Bangalore', 12.9698, 77.7500],
    ['Capital Cuts',       'Connaught Place, Delhi',    'https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80',  'Delhi',     28.6315, 77.2167],
    ['The Dapper Room',    'Lajpat Nagar, Delhi',       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',  'Delhi',     28.5677, 77.2433],
    ['Metro Shave',        'Saket, Delhi',              'https://images.unsplash.com/photo-1599351431202-1e0f01221b0b?w=800&q=80',  'Delhi',     28.5245, 77.2066],
    ["Nawab's Barber",     'Banjara Hills, Hyderabad',  'https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80',  'Hyderabad', 17.4126, 78.4483],
    ["The Clipper's Club", 'Hitech City, Hyderabad',    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',  'Hyderabad', 17.4435, 78.3772],
    ['Pearl Cuts',         'Jubilee Hills, Hyderabad',  'https://images.unsplash.com/photo-1599351431202-1e0f01221b0b?w=800&q=80',  'Hyderabad', 17.4239, 78.4071],
    ['Pune Fade Studio',   'Koregaon Park, Pune',       'https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80',  'Pune',      18.5362, 73.8939],
    ['Sharp & Smart',      'Wakad, Pune',               'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',  'Pune',      18.5984, 73.7650],
    ['Kochi Kuts',         'MG Road, Kochi',            'https://images.unsplash.com/photo-1599351431202-1e0f01221b0b?w=800&q=80',  'Kochi',      9.9666, 76.2831],
    ['The Groom Room',     'Edapally, Kochi',           'https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80',  'Kochi',     10.0269, 76.3089],
];

db.serialize(() => {
    console.log('Resetting database...');

    // Add pin column if it doesn't exist yet (safe migration)
    db.run("ALTER TABLE users ADD COLUMN pin TEXT DEFAULT '1234'", () => {});

    // Clear all tables
    db.run('DELETE FROM queue');
    db.run('DELETE FROM users');
    db.run('DELETE FROM shops');
    db.run("DELETE FROM sqlite_sequence WHERE name IN ('shops','users','queue')", () => {});

    // Insert shops
    const shopStmt = db.prepare(
        'INSERT INTO shops (name, location, image_url, city, lat, lng, open_time, close_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    shops.forEach(s => shopStmt.run([s[0], s[1], s[2], s[3], s[4], s[5], '09:00', '21:00']));
    shopStmt.finalize();

    // Insert admins
    const adminStmt = db.prepare(
        'INSERT INTO users (name, contact, role, shop_id, pin) VALUES (?, ?, ?, ?, ?)'
    );
    shops.forEach((s, i) => adminStmt.run([`Admin - ${s[0]}`, `admin${i + 1}`, 'admin', i + 1, '1234']));
    adminStmt.finalize();

    // Verify
    db.all('SELECT id, name, city FROM shops', (err, rows) => {
        if (err) { console.error('Error:', err.message); db.close(); return; }
        console.log(`\n✅ Done! ${rows.length} shops inserted:\n`);
        rows.forEach(r => console.log(`  [${r.id}] ${r.name} — ${r.city}`));
        console.log('\n🔐 All admin PINs: 1234');
        console.log('📋 Admin logins: admin1 (Royal Cuts) ... admin22 (The Groom Room)');
        db.close(() => process.exit(0));
    });
});
