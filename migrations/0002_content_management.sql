-- Doğan Nakliyat content management v2
CREATE TABLE IF NOT EXISTS gallery_items (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL DEFAULT '',
 image_key TEXT NOT NULL,
 sort_order INTEGER NOT NULL DEFAULT 0,
 created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS quote_requests (
 id TEXT PRIMARY KEY,
 loading_address TEXT NOT NULL,
 unloading_address TEXT NOT NULL,
 moving_date TEXT NOT NULL,
 customer_name TEXT NOT NULL DEFAULT '',
 customer_contact TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'new',
 created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS admin_audit (
 id TEXT PRIMARY KEY,
 action TEXT NOT NULL,
 target TEXT NOT NULL DEFAULT '',
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_quote_created ON quote_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_sort ON gallery_items(sort_order,created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit ON admin_audit(created_at DESC);

CREATE TABLE IF NOT EXISTS quote_rate_limits (
 client_key TEXT PRIMARY KEY,
 attempts INTEGER NOT NULL DEFAULT 0,
 window_expires INTEGER NOT NULL DEFAULT 0
);
