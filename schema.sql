-- MGM DABHA Database Schema (Official Palacode, Dharmapuri Edition)
CREATE DATABASE IF NOT EXISTS mgm_dabha CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mgm_dabha;

-- Banners Table
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    link_url VARCHAR(255) DEFAULT '/menu.html',
    is_active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Hero Banners
INSERT INTO banners (title, image_url, link_url, is_active, display_order) VALUES
('Chicken Biryani Feast', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1600', '/menu.html', 1, 1),
('Tandoori Chicken Special', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=1600', '/menu.html', 1, 2),
('Family Dining Experience', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600', '/reservation.html', 1, 3)
ON DUPLICATE KEY UPDATE title=title;

-- Contact & Business Settings Table
CREATE TABLE IF NOT EXISTS contact_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_name VARCHAR(100) NOT NULL DEFAULT 'MGM DABHA',
    tagline VARCHAR(200) DEFAULT 'Authentic South Indian & Multi-Cuisine Family Restaurant',
    phone VARCHAR(30) NOT NULL DEFAULT '+91 9345841117',
    whatsapp VARCHAR(30) NOT NULL DEFAULT '+91 9345841117',
    email VARCHAR(100) NOT NULL DEFAULT 'sdhineshkumar7576@gmail.com',
    restaurant_logo VARCHAR(255) DEFAULT '/images/logo.png',
    banner_image VARCHAR(255) DEFAULT '/images/banner.jpg',
    gst_tax DECIMAL(5, 2) DEFAULT 5.00,
    delivery_fee DECIMAL(10, 2) DEFAULT 40.00,
    min_order_amount DECIMAL(10, 2) DEFAULT 100.00,
    currency_symbol VARCHAR(10) DEFAULT '₹',
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL DEFAULT 'Palacode',
    state VARCHAR(50) NOT NULL DEFAULT 'Tamil Nadu',
    pincode VARCHAR(20) NOT NULL DEFAULT '636806',
    google_map TEXT,
    opening_time TIME DEFAULT '07:00:00',
    closing_time TIME DEFAULT '23:00:00',
    facebook VARCHAR(255) DEFAULT 'https://facebook.com/mgmdabha',
    instagram VARCHAR(255) DEFAULT 'https://instagram.com/mgmdabha',
    youtube VARCHAR(255) DEFAULT 'https://youtube.com/mgmdabha',
    theme_primary VARCHAR(20) DEFAULT '#d35400',
    theme_secondary VARCHAR(20) DEFAULT '#8B0000',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO contact_settings (id, restaurant_name, tagline, phone, whatsapp, email, address, city, state, pincode, google_map, opening_time, closing_time, facebook, instagram, youtube) VALUES
(1, 'MGM DABHA', 'Authentic South Indian & Multi-Cuisine Family Restaurant', '+91 9345841117', '+91 9345841117', 'sdhineshkumar7576@gmail.com', 'Tomato Market Opposite MGM DABHA, Near Tomato Market', 'Palacode', 'Tamil Nadu', '636806', 'https://maps.google.com/maps?q=Tomato+Market+Dharmapuri+Tamil+Nadu+636806&output=embed', '07:00:00', '23:00:00', 'https://facebook.com/mgmdabha', 'https://instagram.com/mgmdabha', 'https://youtube.com/mgmdabha')
ON DUPLICATE KEY UPDATE restaurant_name=restaurant_name;
