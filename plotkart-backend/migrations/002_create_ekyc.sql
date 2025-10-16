-- Create eKYC Table
CREATE TABLE IF NOT EXISTS ekyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('aadhaar', 'pan', 'passport', 'driving_license')),
  document_number VARCHAR(255),
  ipfs_hash VARCHAR(255),
  sha256_hash VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES users(id),
  verification_notes TEXT,
  verified_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ekyc_user_id ON ekyc(user_id);
CREATE INDEX idx_ekyc_status ON ekyc(status);
