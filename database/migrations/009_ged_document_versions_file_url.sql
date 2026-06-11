ALTER TABLE ged_document_versions
  ADD COLUMN IF NOT EXISTS file_url TEXT;

COMMENT ON COLUMN ged_document_versions.file_url IS 'URL do arquivo armazenado para cada versao do documento GED.';
