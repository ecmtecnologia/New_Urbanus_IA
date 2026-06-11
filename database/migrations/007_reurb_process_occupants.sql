CREATE TABLE IF NOT EXISTS reurb_process_occupants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reurb_process_id UUID NOT NULL UNIQUE REFERENCES reurb_processes(id) ON DELETE CASCADE,
  occupant_id UUID NOT NULL REFERENCES occupants(id) ON DELETE CASCADE,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reurb_process_occupants_process ON reurb_process_occupants(reurb_process_id);
CREATE INDEX IF NOT EXISTS idx_reurb_process_occupants_occupant ON reurb_process_occupants(occupant_id);

COMMENT ON TABLE reurb_process_occupants IS 'Vincula processo REURB (reurb_processes) ao ocupante social selecionado.';
