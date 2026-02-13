-- ============================================
-- Supabase Database Schema
-- Generated from backend/models
-- ============================================

-- Drop existing tables (if they exist)
DROP TABLE IF EXISTS extractions CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS user_credits CASCADE;
DROP TABLE IF EXISTS user_credentials CASCADE;
DROP TABLE IF EXISTS oidc_states CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS state_regulations CASCADE;

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- OIDC States Table
-- ============================================
CREATE TABLE oidc_states (
    id VARCHAR(255) PRIMARY KEY,
    state VARCHAR(255) NOT NULL UNIQUE,
    nonce VARCHAR(255) NOT NULL,
    code_verifier VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for oidc_states table
CREATE INDEX idx_oidc_states_state ON oidc_states(state);
CREATE INDEX idx_oidc_states_expires_at ON oidc_states(expires_at);

-- ============================================
-- Documents Table
-- ============================================
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    file_name VARCHAR NOT NULL,
    file_key VARCHAR NOT NULL,
    file_size INTEGER,
    file_data TEXT,
    status VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for documents table
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at);

-- ============================================
-- Extractions Table
-- ============================================
CREATE TABLE extractions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    document_id INTEGER NOT NULL,
    tenant_name VARCHAR,
    landlord_name VARCHAR,
    property_address VARCHAR,
    monthly_rent DOUBLE PRECISION,
    security_deposit DOUBLE PRECISION,
    lease_start_date VARCHAR,
    lease_end_date VARCHAR,
    renewal_notice_days INTEGER,
    pet_policy VARCHAR,
    late_fee_terms VARCHAR,
    risk_flags VARCHAR,
    audit_checklist TEXT,
    compliance_data VARCHAR,
    raw_extraction VARCHAR,
    source_map VARCHAR,
    pages_meta VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for extractions table
CREATE INDEX idx_extractions_user_id ON extractions(user_id);
CREATE INDEX idx_extractions_document_id ON extractions(document_id);

-- ============================================
-- Payments Table
-- ============================================
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    stripe_session_id VARCHAR,
    amount DOUBLE PRECISION NOT NULL,
    currency VARCHAR,
    payment_type VARCHAR,
    credits_purchased INTEGER,
    status VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for payments table
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_session_id ON payments(stripe_session_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- User Credits Table
-- ============================================
CREATE TABLE user_credits (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    free_credits INTEGER,
    paid_credits INTEGER,
    subscription_type VARCHAR,
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for user_credits table
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);

-- ============================================
-- User Credentials Table
-- ============================================
CREATE TABLE user_credentials (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR NOT NULL,
    password_hash VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for user_credentials table
CREATE INDEX idx_user_credentials_user_id ON user_credentials(user_id);
CREATE INDEX idx_user_credentials_email ON user_credentials(email);

-- ============================================
-- State Regulations Table
-- ============================================
CREATE TABLE state_regulations (
    id SERIAL PRIMARY KEY,
    state_code VARCHAR NOT NULL,
    state_name VARCHAR NOT NULL,
    regulation_category VARCHAR NOT NULL,
    regulation_title VARCHAR NOT NULL,
    regulation_content VARCHAR NOT NULL,
    max_amount DOUBLE PRECISION,
    max_multiplier DOUBLE PRECISION,
    required_days INTEGER,
    source_url VARCHAR,
    last_updated VARCHAR
);

-- Create indexes for state_regulations table
CREATE INDEX idx_state_regulations_state_code ON state_regulations(state_code);
CREATE INDEX idx_state_regulations_regulation_category ON state_regulations(regulation_category);

-- ============================================
-- Enable Row Level Security (RLS) - Optional
-- Uncomment if you need RLS for your application
-- ============================================
/*
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE oidc_states ENABLE ROW LEVEL SECURITY;
*/

-- ============================================
-- Setup Functions for automatic updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables with updated_at field
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON user_credits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credentials_updated_at
    BEFORE UPDATE ON user_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Insert Initial Data for State Regulations (Optional)
-- ============================================
-- You can insert mock data here if needed
-- INSERT INTO state_regulations (state_code, state_name, regulation_category, regulation_title, regulation_content, ...)
-- VALUES ...

-- ============================================
-- Grant Permissions (if needed)
-- ============================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO YOUR_USER;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO YOUR_USER;