CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  role VARCHAR(40) NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reurb_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(80) UNIQUE,
  title TEXT NOT NULL,
  reurb_type VARCHAR(20) NOT NULL,
  status VARCHAR(80) NOT NULL,
  cadastral_code VARCHAR(80),
  neighborhood VARCHAR(180),
  risk_level VARCHAR(20),
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ged_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES reurb_processes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category VARCHAR(120) NOT NULL,
  document_type VARCHAR(120) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_hash VARCHAR(64) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  status VARCHAR(40) NOT NULL DEFAULT 'Pendente',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aisha_analysis_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id VARCHAR(80),
  model_type VARCHAR(10) NOT NULL,
  request_payload JSONB NOT NULL,
  response_payload JSONB,
  status VARCHAR(10) NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
