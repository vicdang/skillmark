-- Per-user notification preferences
CREATE TABLE IF NOT EXISTS user_notification_prefs (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_on_wishlist BOOLEAN NOT NULL DEFAULT TRUE,
    email_on_allocation BOOLEAN NOT NULL DEFAULT TRUE,
    email_on_allocation_response BOOLEAN NOT NULL DEFAULT TRUE,
    email_on_rfp_complete BOOLEAN NOT NULL DEFAULT TRUE,
    inapp_on_skill_update BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
