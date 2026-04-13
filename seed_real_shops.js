/**
 * seed_real_shops.js
 * Clears existing shops/admins and inserts 22 real saloon shops across Indian cities.
 * Run: node seed_real_shops.js
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('qcrew.db');

const shops = [
    // Mumbai
    { name: "Royal Cuts", location: "Andheri West, Mumbai", city: "Mumbai", lat: 19.1360, lng: 72.8296, image_url: "https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80" },
    { name: "The Barber House", location: "Bandra, Mumbai", city: "Mumbai", lat: 19.0596, lng: 72.8295, image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80" },
    { name: "Grooming Station", location: "Dadar, Mumbai", city: "Mumbai", lat: 19.0178, lng: 72.8478, image_url: "https://images.unsplash.com/photo-1599351431202-1e0f01221b0b?w=800&q=80" },
    { name: "Sharpline Salon", location: "Powai, Mumbai", city: "Mumbai", lat: 19.1197, lng: 72.9086, image_url: "https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80" },

    // Chennai
    { name: "Classic Trim Co.", location: "T. Nagar, Chennai", city: "Chennai", lat: 13.0374, lng: 80.2329, image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80" },
    { name: "Gentlemen's Cut", location: "Anna Nagar, Chennai", city: "Chennai", lat: 13.0850, lng: 80.2101, image_url: "https://images.unsplash.com/photo-1599351431202-1e0f01221b0b?w=800&q=80" },
    { name: "The Style Den", location: "Velachery, Chennai", city: "Chennai", lat: 12.9815, lng: 80.2180, image_url: "https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80" },
    { name: "Fades & Blades", location: "Tambaram, Chennai", city: "Chennai", lat: 12.9249, lng: 80.1000, image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80" },

    // Bangalore
    { name: "Urban Barbers", location: "Koramangala, Bangalore", city: "Bangalore", lat: 12.9352, lng: 77.6245, image_url: "https://images.unsplash.com/photo-1599351431202-1e0f01221b0b?w=800&q=80" },
    { name: "The Blade & Co.", location: "Indiranagar, Bangalore", city: "Bangalore", lat: 12.9784, lng: 77.6408, image_url: "https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80" },
    { name: "Prestige Cuts", location: "HSR Layout, Bangalore", city: "Bangalore", lat: 12.9116, lng: 77.6389, image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80" },
    { name: "Mr. Clipper", location: "Whitefield, Bangalore", city: "Bangalore", lat: 12.9698, lng: 77.7500, image_url: "https://images.unsplash.com/photo-1599351431202-1e0f01221b0b?w=800&q=80" },

    // Delhi
    { name: "Capital Cuts", location: "Connaught Place, Delhi", city: "Delhi", lat: 28.6315, lng: 77.2167, image_url: "https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80" },
    { name: "The Dapper Room", location: "Lajpat Nagar, Delhi", city: "Delhi", lat: 28.5677, lng: 77.2433, image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80" },
    { name: "Metro Shave & Style", location: "Saket, Delhi", city: "Delhi", lat: 28.5245, lng: 77.2066, image_url: "https://images.unsplash.com/photo-1599351431202-1e0f01221b0b?w=800&q=80" },

    // Hyderabad
    { name: "Nawab's Barber", location: "Banjara Hills, Hyderabad", city: "Hyderabad", lat: 17.4126, lng: 78.4483, image_url: "https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80" },
    { name: "The Clipper's Club", location: "Hitech City, Hyderabad", city: "Hyderabad", lat: 17.4435, lng: 78.3772, image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80" },
    { name: "Pearl Cuts", location: "Jubilee Hills, Hyderabad", city: "Hyderabad", lat: 17.4239, lng: 78.4071, image_url: "https://images.unsplash.com/photo-1599351431202-1e0f01221b0b?w=800&q=80" },

    // Pune
    { name: "Pune Fade Studio", location: "Koregaon Park, Pune", city: "Pune", lat: 18.5362, lng: 73.8939, image_url: "https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80" },
    { name: "Sharp & Smart", location: "Wakad, Pune", city: "Pune", lat: 18.5984, lng: 73.7650, image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80" },

    // Kochi
    { name: "Kochi Kuts", location: "MG Road, Kochi", city: "Kochi", lat: 9.9666, lng: 76.2831, image_url: "https://images.unsplash.com/photo-1599351431202-1e0f01221b0b?w=800&q=80" },
    { name: "The Groom Room", location: "Edapally, Kochi", city: "Kochi", lat: 10.0269, lng: 76.3089, image_url: "https://images.unsplash.com/photo-1585747860113-1f3c3a4f61fb?w=800&q=80" },
];

db.serialize(() => {
    console.log('Clearing old shop and admin data...');

    // Delete all queue entries first (foreign key dependency)
    db.run('DELETE FROM queue', (err) => {
        if (err) console.error('Error clearing queue:', err.message);
    });

    // Delete all users
    db.run('DELETE FROM users', (err) => {
        if (err) console.error('Error clearing users:', err.message);
    });

    // Delete all shops
    db.run('DELETE FROM shops', (err) => {
        if (err) console.error('Error clearing shops:', err.message);
    });

    // Reset autoincrement counters
    db.run("DELETE FROM sqlite_sequence WHERE name='shops'", () => {});
    db.run("DELETE FROM sqlite_sequence WHERE name='users'", () => {});
    db.run("DELETE FROM sqlite_sequence WHERE name='queue'", () => {});

    // Insert shops
    const shopStmt = db.prepare(
        'INSERT INTO shops (name, location, city, lat, lng, image_url, open_time, close_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    shops.forEach(s => {
        shopStmt.run([s.name, s.location, s.city, s.lat, s.lng, s.image_url, '09:00', '21:00']);
    });
    shopStmt.finalize();

    // Insert admin for each shop (admin1..admin22, default PIN 1234)
    const adminStmt = db.prepare('INSERT INTO users (name, contact, role, shop_id, pin) VALUES (?, ?, ?, ?, ?)');
    shops.forEach((s, i) => {
        const shopId = i + 1;
        adminStmt.run([`Admin - ${s.name}`, `admin${shopId}`, 'admin', shopId, '1234']);
    });
    adminStmt.finalize();

    console.log(`\n✅ Done! Inserted ${shops.length} shops and ${shops.length} admin accounts.`);
    console.log('\nAdmin logins:');
    shops.forEach((s, i) => {
        console.log(`  admin${i + 1}  →  ${s.name} (${s.city})`);
    });
    db.close(() => process.exit(0));
});
