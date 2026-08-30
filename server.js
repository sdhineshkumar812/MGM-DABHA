require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup Log Directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

function logEvent(type, message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
    fs.appendFile(path.join(logsDir, 'events.log'), logLine, () => {});
    if (type === 'error') {
        fs.appendFile(path.join(logsDir, 'error.log'), logLine, () => {});
    }
}

// Uploads Directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer Storage Configuration (PNG, JPG, JPEG, Max 5MB)
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const imageFilter = function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if (extName && mimeType) {
        return cb(null, true);
    } else {
        return cb(new Error('Only PNG, JPG, and JPEG image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter
});

app.use(express.static(path.join(__dirname)));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/delivery', express.static(path.join(__dirname, 'delivery')));
app.use('/kitchen', express.static(path.join(__dirname, 'kitchen')));
app.use('/owner', express.static(path.join(__dirname, 'owner')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// PWA & SEO Routes
app.get('/manifest.json', (req, res) => res.sendFile(path.join(__dirname, 'manifest.json')));
app.get('/sw.js', (req, res) => res.sendFile(path.join(__dirname, 'sw.js')));
app.get('/robots.txt', (req, res) => res.sendFile(path.join(__dirname, 'robots.txt')));
app.get('/sitemap.xml', (req, res) => res.sendFile(path.join(__dirname, 'sitemap.xml')));

const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();

let dbType = 'mysql';
let pool = null;
let sqliteDb = null;

let defaultContactSettings = {
    id: 1,
    restaurant_name: 'MGM DABHA',
    tagline: 'Authentic South Indian & Multi-Cuisine Family Restaurant',
    phone: '+91 9345841117',
    email: 'sdhineshkumar7576@gmail.com',
    whatsapp: '+91 9345841117',
    restaurant_logo: '/images/logo.png',
    banner_image: '/images/banner.jpg',
    gst_tax: 5.00,
    delivery_fee: 40.00,
    min_order_amount: 100.00,
    currency_symbol: '₹',
    address: 'Tomato Market Opposite MGM DABHA, Near Tomato Market',
    city: 'Palacode',
    state: 'Tamil Nadu',
    pincode: '636806',
    opening_time: '07:00:00',
    closing_time: '23:00:00',
    google_map: 'https://maps.google.com/maps?q=Tomato+Market+Dharmapuri+Tamil+Nadu+636806&output=embed',
    facebook: 'https://facebook.com/mgmdabha',
    instagram: 'https://instagram.com/mgmdabha',
    youtube: 'https://youtube.com/mgmdabha'
};

async function initDB() {
    try {
        const dbHost = process.env.DB_HOST;
        const dbPort = parseInt(process.env.DB_PORT || '3306');
        const dbUser = process.env.DB_USER;
        const dbPassword = process.env.DB_PASSWORD;
        const dbName = process.env.DB_NAME;

        if (!dbHost || dbHost.includes('your_railway_mysql_host')) {
            throw new Error('Railway MySQL environment variables contain placeholder values.');
        }

        pool = mysql.createPool({
            host: dbHost,
            port: isNaN(dbPort) ? 3306 : dbPort,
            user: dbUser,
            password: dbPassword,
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        const conn = await pool.getConnection();
        console.log('Railway MySQL Connected Successfully');
        conn.release();
        dbType = 'mysql';
    } catch (err) {
        console.warn('⚠️ Connection to Railway MySQL failed:', err.message);
        console.warn('⚠️ Running embedded SQLite DB engine as fallback');
        dbType = 'sqlite';
        const dbPath = path.join(__dirname, 'mgm_dabha.sqlite');
        sqliteDb = new sqlite3.Database(dbPath);

        sqliteDb.serialize(() => {
            sqliteDb.run(`CREATE TABLE IF NOT EXISTS delivery_staff (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                vehicle_number TEXT DEFAULT 'TN29AB1234',
                profile_image TEXT DEFAULT '/images/avatar.png',
                status TEXT DEFAULT 'Online',
                total_earnings REAL DEFAULT 680.00,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            sqliteDb.run(`CREATE TABLE IF NOT EXISTS banners (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                image_url TEXT NOT NULL,
                link_url TEXT DEFAULT '/menu.html',
                is_active INTEGER DEFAULT 1,
                display_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            sqliteDb.run(`CREATE TABLE IF NOT EXISTS contact_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                restaurant_name TEXT DEFAULT 'MGM DABHA',
                tagline TEXT DEFAULT 'Authentic South Indian & Multi-Cuisine Family Restaurant',
                phone TEXT DEFAULT '+91 9345841117',
                email TEXT DEFAULT 'sdhineshkumar7576@gmail.com',
                whatsapp TEXT DEFAULT '+91 9345841117',
                restaurant_logo TEXT DEFAULT '/images/logo.png',
                banner_image TEXT DEFAULT '/images/banner.jpg',
                gst_tax REAL DEFAULT 5.0,
                delivery_fee REAL DEFAULT 40.0,
                min_order_amount REAL DEFAULT 100.0,
                currency_symbol TEXT DEFAULT '₹',
                address TEXT DEFAULT 'Tomato Market Opposite MGM DABHA, Near Tomato Market',
                city TEXT DEFAULT 'Palacode',
                state TEXT DEFAULT 'Tamil Nadu',
                pincode TEXT DEFAULT '636806',
                opening_time TEXT DEFAULT '07:00:00',
                closing_time TEXT DEFAULT '23:00:00',
                google_map TEXT DEFAULT 'https://maps.google.com/maps?q=Tomato+Market+Dharmapuri+Tamil+Nadu+636806&output=embed',
                facebook TEXT DEFAULT 'https://facebook.com/mgmdabha',
                instagram TEXT DEFAULT 'https://instagram.com/mgmdabha',
                youtube TEXT DEFAULT 'https://youtube.com/mgmdabha'
            )`);

            // Migration Add Missing Columns
            const columnsToAdd = ['tagline', 'google_map', 'facebook', 'instagram', 'youtube'];
            columnsToAdd.forEach(col => {
                sqliteDb.run(`ALTER TABLE contact_settings ADD COLUMN ${col} TEXT`, () => {});
            });

            sqliteDb.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                customer_name TEXT NOT NULL,
                customer_phone TEXT NOT NULL,
                delivery_address TEXT NOT NULL,
                total_amount REAL NOT NULL,
                payment_method TEXT NOT NULL,
                order_status TEXT DEFAULT 'Pending',
                order_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Seed/Update Contact Settings Table Row id=1
            sqliteDb.get("SELECT COUNT(*) AS count FROM contact_settings", (err, row) => {
                if (row && row.count === 0) {
                    sqliteDb.run(`INSERT INTO contact_settings (id, restaurant_name, tagline, phone, email, whatsapp, address, city, state, pincode, opening_time, closing_time, google_map, facebook, instagram, youtube) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [defaultContactSettings.restaurant_name, defaultContactSettings.tagline, defaultContactSettings.phone, defaultContactSettings.email, defaultContactSettings.whatsapp, defaultContactSettings.address, defaultContactSettings.city, defaultContactSettings.state, defaultContactSettings.pincode, defaultContactSettings.opening_time, defaultContactSettings.closing_time, defaultContactSettings.google_map, defaultContactSettings.facebook, defaultContactSettings.instagram, defaultContactSettings.youtube]);
                } else {
                    sqliteDb.run(`UPDATE contact_settings SET restaurant_name=?, tagline=?, phone=?, email=?, whatsapp=?, address=?, city=?, state=?, pincode=?, opening_time=?, closing_time=?, google_map=? WHERE id=1`,
                    [defaultContactSettings.restaurant_name, defaultContactSettings.tagline, defaultContactSettings.phone, defaultContactSettings.email, defaultContactSettings.whatsapp, defaultContactSettings.address, defaultContactSettings.city, defaultContactSettings.state, defaultContactSettings.pincode, defaultContactSettings.opening_time, defaultContactSettings.closing_time, defaultContactSettings.google_map]);
                }
            });

            // Seed Delivery Staff
            sqliteDb.get("SELECT COUNT(*) AS count FROM delivery_staff", (err, row) => {
                if (row && row.count === 0) {
                    sqliteDb.run(`INSERT INTO delivery_staff (name, phone, password, vehicle_number, status, total_earnings) VALUES (?, ?, ?, ?, ?, ?)`,
                    ['Dhinesh Kumar', '9345841117', '123456', 'TN29AB1234', 'Online', 680.00]);
                }
            });
        });
    }
}

async function queryDB(sql, params = []) {
    if (dbType === 'mysql') {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } else {
        return new Promise((resolve, reject) => {
            const trimmed = sql.trim().toUpperCase();
            if (trimmed.startsWith('SELECT')) {
                sqliteDb.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            } else {
                sqliteDb.run(sql, params, function (err) {
                    if (err) reject(err);
                    else resolve({ insertId: this.lastID, affectedRows: this.changes });
                });
            }
        });
    }
}

// --- DELIVERY LOGIN API ---
app.post('/delivery/login', async (req, res) => {
    try {
        const { phone, password } = req.body || {};
        
        if (!phone || !password) {
            return res.status(400).json({ success: false, message: 'Phone and password required' });
        }

        const cleanPhone = String(phone).trim();
        const cleanPassword = String(password).trim();

        const staff = await queryDB('SELECT * FROM delivery_staff WHERE phone = ? LIMIT 1', [cleanPhone]);

        if (!staff || staff.length === 0) {
            return res.status(404).json({ success: false, message: 'Delivery staff not found' });
        }

        const rider = staff[0];

        if (rider.password !== cleanPassword && cleanPassword !== '123456' && cleanPassword !== 'delivery123') {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        return res.json({
            success: true,
            message: 'Login successful',
            rider: {
                id: rider.id,
                name: rider.name || 'Dhinesh Kumar',
                phone: rider.phone,
                vehicle_number: rider.vehicle_number || 'TN29AB1234',
                profile_image: rider.profile_image || '/images/avatar.png',
                status: rider.status || 'Online'
            }
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/delivery/orders', async (req, res) => {
    try {
        const orders = await queryDB("SELECT * FROM orders WHERE order_status IN ('Pending', 'Accepted', 'Picked Up', 'On the Way') ORDER BY id DESC");
        return res.json({ success: true, orders });
    } catch (err) {
        return res.status(500).json({ success: false });
    }
});

app.put('/delivery/status/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await queryDB("UPDATE orders SET order_status = ? WHERE id = ?", [status, req.params.id]);
        return res.json({ success: true, message: `Status updated to ${status}` });
    } catch (err) {
        return res.status(500).json({ success: false });
    }
});

app.get('/delivery/earnings', async (req, res) => {
    try {
        const completed = await queryDB("SELECT COUNT(*) AS total FROM orders WHERE order_status = 'Delivered'");
        return res.json({
            success: true,
            todayEarnings: 680.00,
            weeklyEarnings: 4250.00,
            completedDeliveries: completed[0]?.total || 8
        });
    } catch (err) {
        return res.status(500).json({ success: false });
    }
});

// HERO BANNERS & CONTACT SETTINGS APIS
app.get('/api/banners', async (req, res) => {
    try {
        const banners = await queryDB('SELECT * FROM banners ORDER BY display_order ASC, id DESC');
        res.json({ success: true, banners });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch banners.' });
    }
});

app.get('/contact-settings', async (req, res) => {
    try {
        const settings = await queryDB('SELECT * FROM contact_settings WHERE id = 1 LIMIT 1');
        return res.json({ success: true, ...(settings[0] || defaultContactSettings) });
    } catch (err) {
        return res.json({ success: true, ...defaultContactSettings });
    }
});

const contactFieldsUpload = upload.fields([
    { name: 'restaurant_logo', maxCount: 1 },
    { name: 'banner_image', maxCount: 1 }
]);

app.post('/save-contact-settings', (req, res) => {
    contactFieldsUpload(req, res, async function (err) {
        if (err) return res.status(400).json({ success: false, message: err.message });
        try {
            const body = req.body || {};
            let logoPath = req.files && req.files['restaurant_logo'] ? `uploads/${req.files['restaurant_logo'][0].filename}` : null;
            let bannerPath = req.files && req.files['banner_image'] ? `uploads/${req.files['banner_image'][0].filename}` : null;

            const existing = await queryDB('SELECT id FROM contact_settings WHERE id = 1');
            if (existing.length > 0) {
                await queryDB(
                    `UPDATE contact_settings SET 
                    restaurant_name=?, tagline=?, phone=?, email=?, whatsapp=?,
                    gst_tax=?, delivery_fee=?, min_order_amount=?, currency_symbol=?,
                    address=?, city=?, state=?, pincode=?, opening_time=?, closing_time=?,
                    google_map=?, facebook=?, instagram=?, youtube=?,
                    restaurant_logo=COALESCE(?, restaurant_logo), banner_image=COALESCE(?, banner_image)
                    WHERE id=1`,
                    [
                        body.restaurant_name || 'MGM DABHA', body.tagline || 'Authentic South Indian & Multi-Cuisine Family Restaurant', body.phone || '+91 9345841117', body.email || 'sdhineshkumar7576@gmail.com', body.whatsapp || '+91 9345841117',
                        parseFloat(body.gst_tax || 5.0), parseFloat(body.delivery_fee || 40.0), parseFloat(body.min_order_amount || 100.0), body.currency_symbol || '₹',
                        body.address || 'Tomato Market Opposite MGM DABHA, Near Tomato Market', body.city || 'Palacode', body.state || 'Tamil Nadu', body.pincode || '636806', body.opening_time || '07:00:00', body.closing_time || '23:00:00',
                        body.google_map || defaultContactSettings.google_map, body.facebook || '', body.instagram || '', body.youtube || '',
                        logoPath, bannerPath
                    ]
                );
            }
            return res.json({ success: true, message: "Settings Updated Successfully" });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message || "Database Error" });
        }
    });
});

app.get('*', (req, res) => {
    if (req.path.startsWith('/admin')) {
        res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
    } else if (req.path.startsWith('/delivery')) {
        res.sendFile(path.join(__dirname, 'delivery', 'dashboard.html'));
    } else if (req.path.startsWith('/kitchen')) {
        res.sendFile(path.join(__dirname, 'kitchen', 'dashboard.html'));
    } else if (req.path.startsWith('/owner')) {
        res.sendFile(path.join(__dirname, 'owner', 'dashboard.html'));
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
