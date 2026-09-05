-- =====================================================================
-- Local Business Marketplace — Database Schema (PostgreSQL 15+)
-- =====================================================================
-- Covers: users/auth, business listings, categories, media, hours,
-- subscriptions/payments, reviews, messaging, bookings/quote requests,
-- favorites, notifications.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- for lat/lng distance search

-- ---------------------------------------------------------------------
-- USERS & AUTH
-- ---------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('customer', 'business_owner', 'admin');

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(20),
    password_hash   TEXT NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    role            user_role NOT NULL DEFAULT 'customer',
    avatar_url      TEXT,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token   TEXT NOT NULL,
    user_agent      TEXT,
    ip_address      INET,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- CATEGORIES (autoshop, plumber, hvac, roofer, salon, church, etc.)
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    id              SERIAL PRIMARY KEY,
    slug            VARCHAR(60) UNIQUE NOT NULL,   -- e.g. 'plumbers'
    name            VARCHAR(100) NOT NULL,          -- e.g. 'Plumbers'
    parent_id       INTEGER REFERENCES categories(id),
    icon            VARCHAR(50),
    sort_order      INTEGER NOT NULL DEFAULT 0
);

-- 'is_free_category' = businesses in this category are never required to
-- have an active paid subscription to stay listed (e.g. churches, funeral homes).
ALTER TABLE categories ADD COLUMN is_free_category BOOLEAN NOT NULL DEFAULT FALSE;

-- Seed example (run separately):
-- INSERT INTO categories (slug, name, is_free_category) VALUES
-- ('auto-repair','Auto Repair Shops', FALSE),('car-dealers','Car Dealers', FALSE),
-- ('carpenters','Carpenters', FALSE),('plumbers','Plumbers', FALSE),('hvac','HVAC', FALSE),
-- ('roofers','Roofers', FALSE),('remodelers','Remodelers', FALSE),
-- ('clothing-stores','Clothing Stores', FALSE),('beauty-salons','Beauty Salons', FALSE),
-- ('restaurants','Restaurants', FALSE),
-- ('churches','Churches', TRUE),('funeral-homes','Funeral Homes & Services', TRUE);

-- ---------------------------------------------------------------------
-- BUSINESSES (the core listing)
-- ---------------------------------------------------------------------
CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'active', 'suspended', 'expired');
CREATE TYPE plan_tier AS ENUM ('basic', 'featured', 'premium');

CREATE TABLE businesses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     INTEGER NOT NULL REFERENCES categories(id),
    name            VARCHAR(150) NOT NULL,
    slug            VARCHAR(180) UNIQUE NOT NULL,
    description     TEXT,
    phone           VARCHAR(20),
    email           VARCHAR(255),
    website_url     TEXT,
    address_line1   VARCHAR(255),
    address_line2   VARCHAR(255),
    city            VARCHAR(100),
    state           VARCHAR(50),
    postal_code     VARCHAR(20),
    country         VARCHAR(2) DEFAULT 'US',
    location        GEOGRAPHY(POINT, 4326),  -- lat/lng for distance search
    logo_url        TEXT,
    cover_photo_url TEXT,
    plan_tier       plan_tier NOT NULL DEFAULT 'basic',
    status          listing_status NOT NULL DEFAULT 'draft',
    -- App logic: if categories.is_free_category = TRUE for this business's
    -- category, the app skips subscription enforcement entirely (status can
    -- go straight from pending_review -> active with no payment required).
    avg_rating      NUMERIC(2,1) DEFAULT 0,
    review_count    INTEGER NOT NULL DEFAULT 0,
    view_count      INTEGER NOT NULL DEFAULT 0,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_businesses_category ON businesses(category_id);
CREATE INDEX idx_businesses_location ON businesses USING GIST(location);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_city_state ON businesses(city, state);

CREATE TABLE business_photos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    caption         VARCHAR(255),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE business_hours (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
    open_time       TIME,
    close_time      TIME,
    is_closed       BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(business_id, day_of_week)
);

-- ---------------------------------------------------------------------
-- SUBSCRIPTIONS & PAYMENTS
-- ---------------------------------------------------------------------
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');
CREATE TYPE sub_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'expired');

CREATE TABLE plans (
    id              SERIAL PRIMARY KEY,
    tier            plan_tier NOT NULL UNIQUE,
    name            VARCHAR(50) NOT NULL,
    price_monthly   NUMERIC(10,2) NOT NULL,
    price_yearly    NUMERIC(10,2),
    features        JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    plan_id         INTEGER NOT NULL REFERENCES plans(id),
    billing_cycle   billing_cycle NOT NULL DEFAULT 'monthly',
    status          sub_status NOT NULL DEFAULT 'trialing',
    stripe_customer_id      VARCHAR(100),
    stripe_subscription_id  VARCHAR(100),
    current_period_start    TIMESTAMPTZ,
    current_period_end      TIMESTAMPTZ,
    canceled_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    amount          NUMERIC(10,2) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    stripe_payment_intent_id VARCHAR(100),
    status          VARCHAR(30) NOT NULL, -- succeeded, failed, refunded
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title           VARCHAR(150),
    body            TEXT,
    owner_reply      TEXT,
    owner_replied_at TIMESTAMPTZ,
    is_flagged      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(business_id, user_id) -- one review per user per business
);

CREATE INDEX idx_reviews_business ON reviews(business_id);

-- ---------------------------------------------------------------------
-- MESSAGING
-- ---------------------------------------------------------------------
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(business_id, customer_id)
);

CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id),
    body            TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- ---------------------------------------------------------------------
-- BOOKINGS / QUOTE REQUESTS
-- ---------------------------------------------------------------------
CREATE TYPE booking_status AS ENUM ('requested', 'confirmed', 'declined', 'completed', 'canceled');

CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_requested VARCHAR(255),
    notes           TEXT,
    requested_date  DATE,
    requested_time  TIME,
    status          booking_status NOT NULL DEFAULT 'requested',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_business ON bookings(business_id, status);

-- ---------------------------------------------------------------------
-- FAVORITES / SAVED BUSINESSES
-- ---------------------------------------------------------------------
CREATE TABLE favorites (
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, business_id)
);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL, -- new_message, new_review, booking_request, payment_failed
    payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ---------------------------------------------------------------------
-- TRIGGER: keep businesses.avg_rating / review_count in sync
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION refresh_business_rating() RETURNS TRIGGER AS $$
BEGIN
    UPDATE businesses b
    SET avg_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric,1) FROM reviews WHERE business_id = b.id), 0),
        review_count = (SELECT COUNT(*) FROM reviews WHERE business_id = b.id)
    WHERE b.id = COALESCE(NEW.business_id, OLD.business_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION refresh_business_rating();
