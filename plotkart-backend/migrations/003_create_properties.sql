-- Create Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  area VARCHAR(100) NOT NULL,
  area_value DECIMAL(10, 2) NOT NULL,
  area_unit VARCHAR(50) DEFAULT 'sq ft',
  location_text VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  cmda_approved BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'listed', 'sold', 'rejected')),
  property_type VARCHAR(50) DEFAULT 'residential' CHECK (property_type IN ('residential', 'commercial', 'agricultural', 'industrial')),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  verification_notes TEXT,
  images TEXT[],
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_location ON properties USING gist(
  ll_to_earth(latitude, longitude)
);
