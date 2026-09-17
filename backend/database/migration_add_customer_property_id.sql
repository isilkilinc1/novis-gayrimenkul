-- Müşteriler tablosuna ilgilendiği ilan için property_id sütunu ekleme
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL;
