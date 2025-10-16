-- Create Ledger Table (Simulated Blockchain)
CREATE TABLE IF NOT EXISTS ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_index SERIAL UNIQUE NOT NULL,
  previous_hash VARCHAR(255),
  payload_hash VARCHAR(255) NOT NULL,
  block_hash VARCHAR(255) UNIQUE NOT NULL,
  payload JSONB NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('property_upload', 'property_verification', 'ownership_transfer', 'ekyc_verification')),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ledger_block_index ON ledger(block_index);
CREATE INDEX idx_ledger_event_type ON ledger(event_type);
CREATE INDEX idx_ledger_block_hash ON ledger(block_hash);
