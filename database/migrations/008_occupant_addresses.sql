CREATE TABLE IF NOT EXISTS occupant_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occupant_id UUID NOT NULL UNIQUE REFERENCES occupants(id) ON DELETE CASCADE,
  street VARCHAR(255),
  number VARCHAR(20),
  complement VARCHAR(100),
  neighborhood VARCHAR(120),
  zip_code VARCHAR(20),
  city VARCHAR(120),
  state VARCHAR(2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_occupant_addresses_occupant ON occupant_addresses(occupant_id);

COMMENT ON TABLE occupant_addresses IS 'Endereço principal do ocupante/família para o cadastro social.';
