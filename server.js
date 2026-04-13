const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Average service time in minutes to estimate wait
const AVG_SERVICE_TIME = 20;

// API: List available shops
app.get('/api/shops', (req, res) => {
    db.all('SELECT * FROM shops', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, shops: rows });
    });
});

// API: List all admin accounts with their shop (for login helper UI)
app.get('/api/admins', (req, res) => {
    const query = `
        SELECT u.contact, u.shop_id, s.name as shop_name, s.city
        FROM users u
        JOIN shops s ON u.shop_id = s.id
        WHERE u.role = 'admin'
        ORDER BY s.city, u.shop_id
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, admins: rows });
    });
});

// API: Login or Register
app.post('/api/login', (req, res) => {
    const { contact, name } = req.body;
    if (!contact) return res.status(400).json({ error: 'Contact is required' });

    db.get('SELECT id, name, contact, role, shop_id FROM users WHERE contact = ?', [contact], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });

        if (user) {
            res.json({ success: true, user });
        } else {
            // Register if not found and name is provided (for customers)
            if (!name) return res.status(400).json({ error: 'Name required for new registration' });

            // Check if it's a walkin (starts with walkin_)
            const role = 'customer';

            db.run('INSERT INTO users (name, contact, role) VALUES (?, ?, ?)', [name, contact, role], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, user: { id: this.lastID, name: name, contact: contact, role: role, shop_id: null } });
            });
        }
    });
});

// API: Secure Admin Login with PIN
// Each admin's PIN is stored as their contact-derived code:
// Default PIN for all admins is 1234 (stored in users.pin column, falls back to '1234')
app.post('/api/admin-login', (req, res) => {
    const { contact, pin } = req.body;
    if (!contact || !pin) return res.status(400).json({ error: 'Contact and PIN required' });

    db.get('SELECT id, name, contact, role, shop_id, pin FROM users WHERE contact = ? AND role = ?',
        [contact, 'admin'], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Admin account not found' });

        // Use stored PIN or default '1234' if not set
        const correctPin = user.pin || '1234';
        if (pin !== correctPin) {
            return res.status(401).json({ error: 'Incorrect PIN' });
        }

        res.json({
            success: true,
            user: { id: user.id, name: user.name, contact: user.contact, role: user.role, shop_id: user.shop_id }
        });
    });
});

// API: Get single shop by ID
app.get('/api/shops/:id', (req, res) => {
    const shopId = req.params.id;
    db.get('SELECT * FROM shops WHERE id = ?', [shopId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Shop not found' });
        res.json({ success: true, shop: row });
    });
});

// API: Get shop hours (open_time, close_time)
app.get('/api/shops/:id/hours', (req, res) => {
    db.get('SELECT open_time, close_time FROM shops WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Shop not found' });
        res.json({ success: true, open_time: row.open_time || '09:00', close_time: row.close_time || '21:00' });
    });
});

// API: Update shop hours (admin)
app.put('/api/shops/:id/hours', (req, res) => {
    const { open_time, close_time } = req.body;
    if (!open_time || !close_time) return res.status(400).json({ error: 'open_time and close_time required' });
    db.run('UPDATE shops SET open_time = ?, close_time = ? WHERE id = ?', [open_time, close_time, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// API: Get all bookings for a shop on a date (admin view)
app.get('/api/bookings', (req, res) => {
    const { shop_id, date } = req.query;
    if (!shop_id) return res.status(400).json({ error: 'shop_id required' });
    const d = date || new Date().toISOString().split('T')[0];
    const query = `
        SELECT q.id, q.status, q.service, q.slot_time, q.slot_duration, q.created_at,
               u.name as customer_name, u.contact as customer_contact, q.user_id
        FROM queue q
        JOIN users u ON q.user_id = u.id
        WHERE q.shop_id = ? AND date(q.slot_time) = ?
        ORDER BY q.slot_time ASC
    `;
    db.all(query, [shop_id, d], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, bookings: rows });
    });
});

// API: Get booked slots for a shop on a given date
// Returns array of {slot_time, slot_duration} for overlap checking
app.get('/api/slots', (req, res) => {
    const { shop_id, date } = req.query;
    if (!shop_id || !date) return res.status(400).json({ error: 'shop_id and date required' });

    const query = `
        SELECT slot_time, slot_duration
        FROM queue
        WHERE shop_id = ?
          AND date(slot_time) = ?
          AND status NOT IN ('cancelled')
    `;
    db.all(query, [shop_id, date], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, bookings: rows });
    });
});

// API: Get Current Queue & Estimate Wait Time (Requires shop_id)
app.get('/api/queue', (req, res) => {
    const shop_id = req.query.shop_id;
    if (!shop_id) return res.status(400).json({ error: 'Shop ID required' });

    const query = `
        SELECT q.id, q.status, q.service, q.slot_time, q.slot_duration, q.created_at, u.name as customer_name, q.user_id, q.shop_id
        FROM queue q
        JOIN users u ON q.user_id = u.id
        WHERE q.status IN ('waiting', 'serving') AND q.shop_id = ?
        ORDER BY q.slot_time ASC, q.created_at ASC
    `;

    db.all(query, [shop_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const serving = rows.find(r => r.status === 'serving') || null;
        const waiting = rows.filter(r => r.status === 'waiting');
        const estimatedWaitMins = waiting.length * AVG_SERVICE_TIME;

        res.json({ success: true, queue: { serving, waiting, estimatedWaitMins } });
    });
});

// API: Add to Queue / Book a Time Slot
app.post('/api/queue', (req, res) => {
    const { user_id, shop_id, service, slot_time, slot_duration } = req.body;
    if (!user_id || !service || !shop_id) return res.status(400).json({ error: 'User ID, Shop ID, and service required' });

    // If slot_time provided, check for conflicts first
    if (slot_time) {
        const dur = slot_duration || 30;
        const conflictQ = `
            SELECT id FROM queue
            WHERE shop_id = ?
              AND date(slot_time) = date(?)
              AND status NOT IN ('cancelled')
              AND (
                  (CAST(strftime('%H', slot_time) AS INTEGER)*60 + CAST(strftime('%M', slot_time) AS INTEGER)) < (CAST(strftime('%H', ?) AS INTEGER)*60 + CAST(strftime('%M', ?) AS INTEGER) + ?)
                  AND
                  (CAST(strftime('%H', slot_time) AS INTEGER)*60 + CAST(strftime('%M', slot_time) AS INTEGER) + slot_duration) > (CAST(strftime('%H', ?) AS INTEGER)*60 + CAST(strftime('%M', ?) AS INTEGER))
              )
        `;
        db.get(conflictQ, [shop_id, slot_time, slot_time, slot_time, dur, slot_time, slot_time], (err, conflict) => {
            if (err) return res.status(500).json({ error: err.message });
            if (conflict) return res.status(409).json({ error: 'This time slot is already booked. Please choose another.' });

            db.run(
                'INSERT INTO queue (user_id, shop_id, service, slot_time, slot_duration) VALUES (?, ?, ?, ?, ?)',
                [user_id, shop_id, service, slot_time, slot_duration || 30],
                function (err) {
                    if (err) { console.error('Queue Insert Error:', err); return res.status(500).json({ error: err.message }); }
                    res.json({ success: true, bookingId: this.lastID });
                }
            );
        });
    } else {
        db.run('INSERT INTO queue (user_id, shop_id, service) VALUES (?, ?, ?)', [user_id, shop_id, service], function (err) {
            if (err) { console.error('Queue Insert Error:', err); return res.status(500).json({ error: err.message }); }
            res.json({ success: true, bookingId: this.lastID });
        });
    }
});

// API: Update Queue Status (Admin only conceptually)
app.put('/api/queue/:id/status', (req, res) => {
    const { status } = req.body; // 'serving', 'completed', 'cancelled'
    const queueId = req.params.id;
    let timeField = null;

    if (status === 'serving') timeField = 'started_at';
    else if (status === 'completed' || status === 'cancelled') timeField = 'completed_at';

    if (!timeField) return res.status(400).json({ error: 'Invalid status' });

    const query = "UPDATE queue SET status = ?, " + timeField + " = CURRENT_TIMESTAMP WHERE id = ?";
    db.run(query, [status, queueId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, updated: this.changes });
    });
});

// API: Daily customer count per shop
app.get('/api/stats', (req, res) => {
    const shop_id = req.query.shop_id;
    if (!shop_id) return res.status(400).json({ error: 'Shop ID required' });

    const query = `
        SELECT COUNT(*) as count 
        FROM queue 
        WHERE date(created_at) = date('now') 
        AND status = 'completed' AND shop_id = ?`;
    db.get(query, [shop_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, todayCompleted: row.count });
    });
});

app.listen(PORT, () => {
    console.log(`Qcrew multi-shop server running on http://localhost:${PORT}`);
});
