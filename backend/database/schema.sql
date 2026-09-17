-- =====================================================
-- NOVIS GAYRİMENKUL - PRODUCTION DATABASE SCHEMA
-- PostgreSQL Initial Schema & Table Definitions
-- =====================================================

-- 1. USERS TABLOSU (Admin hesapları)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROPERTIES TABLOSU (Gayrimenkul ilanları)
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    property_type VARCHAR(50) NOT NULL DEFAULT 'HOUSE',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    listing_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    city VARCHAR(100),
    district VARCHAR(100),
    neighborhood VARCHAR(100),
    address TEXT,
    rooms VARCHAR(50),
    square_meters INTEGER,
    floor INTEGER,
    building_age INTEGER,
    heating_type VARCHAR(100),
    balcony BOOLEAN DEFAULT FALSE,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PROPERTY_IMAGES TABLOSU (İlan fotoğraf ve videoları)
CREATE TABLE IF NOT EXISTS property_images (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    cloudinary_public_id VARCHAR(255) DEFAULT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    media_type VARCHAR(20) DEFAULT 'image',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CUSTOMERS TABLOSU (Müşteri CRM kayıtları)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    budget NUMERIC(15, 2),
    request_type VARCHAR(255),
    status VARCHAR(50) DEFAULT 'NEW',
    notes TEXT,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PROPERTY_TRANSACTIONS TABLOSU (Satış ve kiralama işlem geçmişi / Audit log)
CREATE TABLE IF NOT EXISTS property_transactions (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    final_price NUMERIC(15, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CONTACT_REQUESTS TABLOSU (Web sitesi ziyaretçi iletişim ve ilan talepleri)
CREATE TABLE IF NOT EXISTS contact_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    message TEXT NOT NULL,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'NEW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SITE_SETTINGS TABLOSU (Hakkımızda içeriği ve kurumsal iletişim bilgileri)
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    about_title VARCHAR(255) NOT NULL DEFAULT 'Hakkımızda',
    about_content TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PERFORMANS İNDEKSLERİ
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_order ON property_images(property_id, display_order);
CREATE INDEX IF NOT EXISTS idx_property_transactions_date ON property_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at DESC);

-- =====================================================
-- BAŞLANGIÇ VERİLERİ (SEED)
-- =====================================================

-- Varsayılan Site Ayarları (ID = 1)
INSERT INTO site_settings (id, about_title, about_content, phone, email, created_at, updated_at)
VALUES (
    1,
    'Hakkımızda',
    'NOVIS Gayrimenkul; alım, satım, kiralama ve inşaat alanlarında profesyonel hizmet sunan bir gayrimenkul firmasıdır.\n\nMüşterilerimizin ihtiyaçlarını doğru şekilde anlayarak, güvenilir ve şeffaf bir hizmet anlayışıyla kendileri için en uygun gayrimenkul seçeneklerine ulaşmalarına yardımcı oluyoruz.\n\nAmacımız yalnızca bir gayrimenkul işlemi gerçekleştirmek değil, müşterilerimiz için güvene dayalı ve uzun süreli ilişkiler kurmaktır.',
    '+90 555 000 00 00',
    'info@novisgayrimenkul.com',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;
