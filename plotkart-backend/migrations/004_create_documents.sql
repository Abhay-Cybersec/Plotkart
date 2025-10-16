-- Create Property Documents Table
CREATE TABLE IF NOT EXISTS property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('sale_deed', 'encumbrance_certificate', 'tax_receipt', 'khata', 'survey_map', 'noc', 'other')),
  file_name VARCHAR(255) NOT NULL,
  ipfs_hash VARCHAR(255),
  sha256_hash VARCHAR(255) NOT NULL,
  local_path VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_property_documents_property_id ON property_documents(property_id);
