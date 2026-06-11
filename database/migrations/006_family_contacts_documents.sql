CREATE TABLE IF NOT EXISTS occupant_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occupant_id UUID NOT NULL REFERENCES occupants(id) ON DELETE CASCADE,
  phone VARCHAR(20),
  email VARCHAR(100),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS occupant_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occupant_id UUID NOT NULL REFERENCES occupants(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  document_number VARCHAR(100),
  file_name VARCHAR(255),
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_occupant_contacts_occupant ON occupant_contacts(occupant_id);
CREATE INDEX IF NOT EXISTS idx_occupant_documents_occupant ON occupant_documents(occupant_id);

COMMENT ON TABLE occupant_contacts IS 'Contatos de um ocupante, permitindo múltiplos telefones/emails.';
COMMENT ON TABLE occupant_documents IS 'Metadados de documentos apresentados pela família/ocupante.';
