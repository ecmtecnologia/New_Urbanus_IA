CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE IF NOT EXISTS user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES user_groups(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) CHECK (role IN ('MASTER', 'ADMIN', 'TECNICO', 'SOCIAL', 'JURIDICO', 'VISITANTE')),
  status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
  signature_data TEXT,
  avatar_url TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS territory_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('ZEIS', 'ZR', 'ZC', 'ZUE', 'RURAL')),
  description TEXT,
  min_lot_area_sqm NUMERIC(10, 2),
  max_height_meters NUMERIC(5, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS territory_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES territory_zones(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  responsible_tech_id UUID REFERENCES users(id) ON DELETE SET NULL,
  perimeter geometry(POLYGON, 4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS territory_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES territory_sectors(id) ON DELETE SET NULL,
  designation VARCHAR(20) NOT NULL,
  registry_number VARCHAR(50),
  total_area_sqm NUMERIC(12, 2),
  geom geometry(POLYGON, 4326)
);

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID REFERENCES territory_blocks(id) ON DELETE SET NULL,
  cadastral_code VARCHAR(50) UNIQUE NOT NULL,
  address_street VARCHAR(255),
  address_number VARCHAR(20),
  address_complement VARCHAR(100),
  address_zip VARCHAR(20),
  latitude NUMERIC(12, 8),
  longitude NUMERIC(12, 8),
  geom geometry(POLYGON, 4326),
  area_sqm NUMERIC(10, 2) NOT NULL,
  frontage_meters NUMERIC(8, 2),
  boundaries JSONB,
  has_water BOOLEAN DEFAULT FALSE,
  has_electricity BOOLEAN DEFAULT FALSE,
  has_sewage BOOLEAN DEFAULT FALSE,
  has_pavement BOOLEAN DEFAULT FALSE,
  facade_image_url TEXT,
  status VARCHAR(50) DEFAULT 'PENDENTE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS occupants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  rg VARCHAR(20),
  birth_date DATE,
  civil_status VARCHAR(50),
  monthly_income NUMERIC(10, 2),
  nis_number VARCHAR(20),
  profession VARCHAR(100),
  education_level VARCHAR(50),
  family_members_count INT,
  spouse_data JSONB,
  phone VARCHAR(20),
  email VARCHAR(100),
  signature_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occupant_id UUID REFERENCES occupants(id) ON DELETE CASCADE,
  name VARCHAR(255),
  relation VARCHAR(50),
  cpf VARCHAR(14),
  birth_date DATE
);

CREATE TABLE IF NOT EXISTS processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  occupant_id UUID REFERENCES occupants(id) ON DELETE SET NULL,
  protocol_number VARCHAR(50) UNIQUE,
  reurb_type VARCHAR(20) CHECK (reurb_type IN ('REURB-S', 'REURB-E')),
  current_stage VARCHAR(50),
  status VARCHAR(50),
  risk_level VARCHAR(10) CHECK (risk_level IN ('Low', 'Medium', 'High')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  concluded_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES processes(id) ON DELETE SET NULL,
  confidence_score INT,
  model_version VARCHAR(50),
  reasoning_tree JSONB,
  predicted_days_to_registry INT,
  risk_of_devolution_percent INT,
  suggested_correction TEXT,
  audit_report JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_a_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  property_b_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  type VARCHAR(50),
  description TEXT,
  status VARCHAR(50),
  ai_recommendation TEXT,
  resolution_term_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS legislation_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  type VARCHAR(50),
  content_text TEXT,
  tags VARCHAR[],
  spatial_link_zone_id UUID REFERENCES territory_zones(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integrity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES processes(id) ON DELETE SET NULL,
  action_type VARCHAR(50),
  data_snapshot_hash VARCHAR(64),
  blockchain_tx_id VARCHAR(100),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS municipios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  uf CHAR(2) NOT NULL,
  valor_modulo_fiscal_ha DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS rural_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_imovel VARCHAR(255) NOT NULL,
  codigo_incra VARCHAR(20) UNIQUE,
  numero_matricula VARCHAR(50),
  registro_car VARCHAR(50) UNIQUE,
  nirf VARCHAR(20),
  area_total_ha DECIMAL(12, 4) NOT NULL,
  municipio_id UUID REFERENCES municipios(id) ON DELETE SET NULL,
  modulo_fiscal_ha DECIMAL(10, 2) NOT NULL DEFAULT 0,
  modulos_fiscais_total DECIMAL(10, 2) GENERATED ALWAYS AS (area_total_ha / NULLIF(modulo_fiscal_ha, 0)) STORED,
  geom_poligono geometry(POLYGON, 4674),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dados_ambientais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propriedade_id UUID REFERENCES rural_properties(id) ON DELETE CASCADE,
  area_reserva_legal_ha DECIMAL(12, 4),
  area_app_ha DECIMAL(12, 4),
  area_uso_consolidado_ha DECIMAL(12, 4),
  vegetacao_nativa_ha DECIMAL(12, 4),
  status_car VARCHAR(20) CHECK (status_car IN ('Ativo', 'Pendente', 'Suspenso')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dados_produtivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propriedade_id UUID REFERENCES rural_properties(id) ON DELETE CASCADE,
  tipo_exploracao VARCHAR(100),
  area_efetivamente_utilizada_ha DECIMAL(12, 4),
  area_aproveitavel_ha DECIMAL(12, 4),
  indice_produtividade DECIMAL(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rural_vertices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rural_property_id UUID REFERENCES rural_properties(id) ON DELETE CASCADE,
  vertex_type CHAR(1) CHECK (vertex_type IN ('M', 'P', 'V')),
  latitude NUMERIC(12, 8),
  longitude NUMERIC(12, 8),
  easting NUMERIC(12, 3),
  northing NUMERIC(12, 3),
  azimuth VARCHAR(20),
  distance NUMERIC(10, 2),
  confrontante TEXT,
  sequence_order INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ged_documents
  ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS file_size VARCHAR(50),
  ADD COLUMN IF NOT EXISTS current_version INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS ged_document_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES ged_documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  signature_data TEXT NOT NULL,
  role_description VARCHAR(100),
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ged_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES ged_documents(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_hash VARCHAR(64) NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ged_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES ged_documents(id) ON DELETE CASCADE,
  origin_sector VARCHAR(100) NOT NULL,
  destination_sector VARCHAR(100) NOT NULL,
  status VARCHAR(50) CHECK (status IN ('Pendente', 'Concluído', 'Recusado')) DEFAULT 'Pendente',
  responsible_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_territory_sectors_zone ON territory_sectors(zone_id);
CREATE INDEX IF NOT EXISTS idx_territory_sectors_responsible_tech ON territory_sectors(responsible_tech_id);
CREATE INDEX IF NOT EXISTS idx_territory_blocks_sector ON territory_blocks(sector_id);
CREATE INDEX IF NOT EXISTS idx_properties_geom ON properties USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_properties_block ON properties(block_id);
CREATE INDEX IF NOT EXISTS idx_properties_cadastral_code ON properties(cadastral_code);
CREATE INDEX IF NOT EXISTS idx_occupants_property ON occupants(property_id);
CREATE INDEX IF NOT EXISTS idx_occupants_cpf ON occupants(cpf);
CREATE INDEX IF NOT EXISTS idx_family_members_occupant ON family_members(occupant_id);
CREATE INDEX IF NOT EXISTS idx_processes_property ON processes(property_id);
CREATE INDEX IF NOT EXISTS idx_processes_occupant ON processes(occupant_id);
CREATE INDEX IF NOT EXISTS idx_processes_status ON processes(status);
CREATE INDEX IF NOT EXISTS idx_processes_protocol ON processes(protocol_number);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_process ON ai_analyses(process_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_property_a ON conflicts(property_a_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_property_b ON conflicts(property_b_id);
CREATE INDEX IF NOT EXISTS idx_group_permissions_group ON group_permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_users_group ON users(group_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_legislation_library_zone ON legislation_library(spatial_link_zone_id);
CREATE INDEX IF NOT EXISTS idx_integrity_logs_process ON integrity_logs(process_id);
CREATE INDEX IF NOT EXISTS idx_municipios_uf ON municipios(uf);
CREATE INDEX IF NOT EXISTS idx_rural_properties_geom ON rural_properties USING GIST (geom_poligono);
CREATE INDEX IF NOT EXISTS idx_rural_properties_municipio ON rural_properties(municipio_id);
CREATE INDEX IF NOT EXISTS idx_rural_vertices_property ON rural_vertices(rural_property_id);
CREATE INDEX IF NOT EXISTS idx_ged_documents_process ON ged_documents(process_id);
CREATE INDEX IF NOT EXISTS idx_ged_documents_property ON ged_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_ged_documents_uploaded_by ON ged_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_ged_documents_hash ON ged_documents(file_hash);
CREATE INDEX IF NOT EXISTS idx_ged_document_signatures_document ON ged_document_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_ged_document_versions_document ON ged_document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_ged_workflows_document ON ged_workflows(document_id);
CREATE INDEX IF NOT EXISTS idx_ged_workflows_responsible_user ON ged_workflows(responsible_user_id);

COMMENT ON TABLE territory_zones IS 'Mapa de zonas urbanísticas e rurais para enquadramento territorial.';
COMMENT ON TABLE territory_sectors IS 'Setores operacionais dentro de cada zona, usados pela equipe técnica.';
COMMENT ON TABLE territory_blocks IS 'Quadras ou blocos dentro de um setor para organização cadastral.';
COMMENT ON TABLE properties IS 'Lotes/unidades imobiliárias urbanas com geometria e infraestrutura.';
COMMENT ON TABLE occupants IS 'Famílias e possuidores vinculados ao imóvel para análise social.';
COMMENT ON TABLE processes IS 'Fluxo principal de REURB com vínculo ao imóvel e ao ocupante.';
COMMENT ON TABLE ai_analyses IS 'Histórico das análises da Aisha e das respostas preditivas.';
COMMENT ON TABLE conflicts IS 'Ocorrências de sobreposição, invasão ou divergência territorial.';
COMMENT ON TABLE user_groups IS 'Agrupamentos de usuários para RBAC.';
COMMENT ON TABLE group_permissions IS 'Permissões associadas a cada grupo.';
COMMENT ON TABLE users IS 'Usuários operacionais do domínio territorial, jurídico e social.';
COMMENT ON TABLE legislation_library IS 'Base documental e normativa pesquisável pela IA.';
COMMENT ON TABLE integrity_logs IS 'Trilha de integridade e rastreabilidade dos atos críticos.';
COMMENT ON TABLE rural_properties IS 'Imóveis rurais e seus índices fundiários e ambientais.';
COMMENT ON TABLE ged_documents IS 'Repositório documental do processo com versionamento e assinatura.';