-- create table
CREATE TABLE IF NOT EXISTS distress_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('dire', 'normal')) DEFAULT 'normal',
    status VARCHAR(20) CHECK (status IN ('pending', 'in-progress', 'resolved')) DEFAULT 'pending',
    people_count INTEGER DEFAULT 1,
    voice_transcript TEXT,
    responder_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- create indexes
CREATE INDEX IF NOT EXISTS idx_distress_signals_location ON distress_signals(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_distress_signals_severity ON distress_signals(severity);
CREATE INDEX IF NOT EXISTS idx_distress_signals_status ON distress_signals(status);
CREATE INDEX IF NOT EXISTS idx_distress_signals_created_at ON distress_signals(created_at DESC);

-- set up Row Level Security
ALTER TABLE distress_signals ENABLE ROW LEVEL SECURITY;

-- policies
CREATE POLICY "Allow read access to all signals" ON distress_signals
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated responders to update status" ON distress_signals
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow anyone to insert signals" ON distress_signals
    FOR INSERT WITH CHECK (true);

-- grant permissions
GRANT SELECT, INSERT ON distress_signals TO anon;
GRANT ALL PRIVILEGES ON distress_signals TO authenticated;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- grant permissions
GRANT SELECT, INSERT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;

-- Responders Table
CREATE TABLE IF NOT EXISTS responders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'responder',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- grant permissions
GRANT SELECT ON responders TO authenticated;
