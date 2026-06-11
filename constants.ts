
import { ReurbProcess, ReurbType, ProcessStatus } from './types';

export const SQL_SCHEMA = `
-- URBANUS IA - ARQUITETURA DE DADOS V1.2
-- Dialeto: PostgreSQL 15+ com PostGIS

-- 1. EXTENSÕES E UTILITÁRIOS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Essencial para o Módulo GIS

-- 2. GESTÃO TERRITORIAL (HIERARQUIA)
CREATE TABLE territory_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL, -- Ex: ZEIS-1, ZR-2
    type VARCHAR(20) CHECK (type IN ('ZEIS', 'ZR', 'ZC', 'ZUE', 'RURAL')),
    description TEXT,
    min_lot_area_sqm NUMERIC(10,2),
    max_height_meters NUMERIC(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE territory_sectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID REFERENCES territory_zones(id),
    name VARCHAR(100) NOT NULL, -- Ex: Núcleo Esperança, Vila Sul
    responsible_tech_id UUID, -- Link para team_members
    perimeter GEOMETRY(POLYGON, 4326), -- Polígono do Núcleo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE territory_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sector_id UUID REFERENCES territory_sectors(id),
    designation VARCHAR(20) NOT NULL, -- Ex: Quadra 04
    registry_number VARCHAR(50), -- Matrícula mãe da quadra (se houver)
    total_area_sqm NUMERIC(12,2),
    geom GEOMETRY(POLYGON, 4326)
);

-- 3. UNIDADE IMOBILIÁRIA (O LOTE)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    block_id UUID REFERENCES territory_blocks(id),
    cadastral_code VARCHAR(50) UNIQUE NOT NULL, -- Ex: LT-1001 (Inscrição Municipal)
    
    -- Endereço e Localização
    address_street VARCHAR(255),
    address_number VARCHAR(20),
    address_complement VARCHAR(100),
    address_zip VARCHAR(20),
    latitude NUMERIC(12,8),
    longitude NUMERIC(12,8),
    geom GEOMETRY(POLYGON, 4326), -- Geometria exata do lote
    
    -- Dimensões e Confrontantes
    area_sqm NUMERIC(10,2) NOT NULL,
    frontage_meters NUMERIC(8,2), -- Testada
    boundaries JSONB, -- { norte: "Rua A", sul: "Lote 02", ... }
    
    -- Infraestrutura (Booleanos para Consolidação)
    has_water BOOLEAN DEFAULT FALSE,
    has_electricity BOOLEAN DEFAULT FALSE,
    has_sewage BOOLEAN DEFAULT FALSE,
    has_pavement BOOLEAN DEFAULT FALSE,
    
    -- Imagens
    facade_image_url TEXT,
    
    status VARCHAR(50) DEFAULT 'PENDENTE', -- REGULAR, IRREGULAR, EM_ANALISE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. SOCIAL E OCUPANTES
CREATE TABLE occupants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id),
    
    -- Dados Pessoais
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    birth_date DATE,
    civil_status VARCHAR(50), -- Solteiro, Casado, União Estável
    
    -- Socioeconômico
    monthly_income NUMERIC(10,2),
    nis_number VARCHAR(20),
    profession VARCHAR(100),
    education_level VARCHAR(50),
    family_members_count INT,
    
    -- Cônjuge (Armazenado como objeto estruturado ou tabela separada se necessário)
    spouse_data JSONB, -- { nome: "...", cpf: "..." }
    
    -- Contato
    phone VARCHAR(20),
    email VARCHAR(100),
    
    -- Biometria/Assinatura
    signature_data TEXT, -- Base64 da assinatura digital coletada no FamilyManager
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    occupant_id UUID REFERENCES occupants(id) ON DELETE CASCADE,
    name VARCHAR(255),
    relation VARCHAR(50), -- Filho, Pai, Neto
    cpf VARCHAR(14),
    birth_date DATE
);

-- 5. FLUXO PROCESSUAL (REURB)
CREATE TABLE processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id),
    occupant_id UUID REFERENCES occupants(id),
    
    protocol_number VARCHAR(50) UNIQUE,
    reurb_type VARCHAR(20) CHECK (reurb_type IN ('REURB-S', 'REURB-E')),
    current_stage VARCHAR(50), -- TRIAGEM, JURIDICO, TOPOGRAFIA, CARTORIO
    status VARCHAR(50), -- ANDAMENTO, CONCLUIDO, SUSPENSO
    
    risk_level VARCHAR(10) CHECK (risk_level IN ('Low', 'Medium', 'High')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    concluded_at TIMESTAMP
);

-- 6. INTELIGÊNCIA ARTIFICIAL (LOGS E ANÁLISES)
CREATE TABLE ai_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID REFERENCES processes(id),
    
    confidence_score INT, -- 0 a 100
    model_version VARCHAR(50), -- Ex: 'AISHA v1.2'
    
    -- Armazena a árvore de decisão completa retornada pela LLM
    reasoning_tree JSONB, -- [{step: "Zoneamento", status: "OK"}, ...]
    
    -- Predições
    predicted_days_to_registry INT,
    risk_of_devolution_percent INT,
    suggested_correction TEXT,
    
    -- Auditoria Jurídica
    audit_report JSONB, -- { citationFederal: [...], justification: "..." }
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. CONFLITOS E MEDIAÇÃO
CREATE TABLE conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_a_id UUID REFERENCES properties(id),
    property_b_id UUID REFERENCES properties(id), -- Pode ser NULL se for área pública
    
    type VARCHAR(50), -- SOBREPOSICAO, INVASAO, DIVERGENCIA
    description TEXT,
    status VARCHAR(50), -- ABERTO, MEDIACAO, RESOLVIDO
    
    ai_recommendation TEXT,
    resolution_term_url TEXT, -- Link para PDF assinado
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. GESTÃO DE EQUIPE E ACESSOS
CREATE TABLE user_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
    permission_key VARCHAR(100) NOT NULL, -- Ex: 'rural:create', 'users:manage'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES user_groups(id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) CHECK (role IN ('MASTER', 'ADMIN', 'TECNICO', 'SOCIAL', 'JURIDICO', 'VISITANTE')),
    status VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, INATIVO, BLOQUEADO
    signature_data TEXT, -- Base64 da assinatura digital
    avatar_url TEXT,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. LEGISLAÇÃO (BASE DE CONHECIMENTO)
CREATE TABLE legislation_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255), -- Ex: Plano Diretor 2024
    type VARCHAR(50), -- LEI FEDERAL, LEI MUNICIPAL, DECRETO
    content_text TEXT, -- Texto completo indexado para busca
    tags VARCHAR[], -- ['REURB-S', 'APP', 'ZEIS']
    
    spatial_link_zone_id UUID REFERENCES territory_zones(id), -- Vínculo geo
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. SEGURANÇA E BLOCKCHAIN
CREATE TABLE integrity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID REFERENCES processes(id),
    
    action_type VARCHAR(50), -- EMISSAO_CRF, VALIDACAO_IA
    data_snapshot_hash VARCHAR(64), -- SHA-256 do JSON do processo no momento
    blockchain_tx_id VARCHAR(100), -- ID da transação simulada/real
    
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. EXTENSÃO RURAL (REURB-R) - BASEADO NO DER SOLICITADO
CREATE TABLE municipios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    valor_modulo_fiscal_ha DECIMAL(10, 2) NOT NULL
);

CREATE TABLE rural_properties ( -- imoveis_rurais
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_imovel VARCHAR(255) NOT NULL,
    codigo_incra VARCHAR(20) UNIQUE, -- CCIR
    numero_matricula VARCHAR(50),
    registro_car VARCHAR(50) UNIQUE, -- CAR
    nirf VARCHAR(20), -- Receita Federal
    area_total_ha DECIMAL(12, 4) NOT NULL,
    municipio_id UUID REFERENCES municipios(id),
    geom_poligono GEOMETRY(POLYGON, 4674), -- SIRGAS 2000
    
    -- Campos calculados
    modulos_fiscais_total DECIMAL(10, 2) GENERATED ALWAYS AS (area_total_ha / NULLIF(modulo_fiscal_ha, 0)) STORED,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dados_ambientais ( -- CAR Detalhado
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    propriedade_id UUID REFERENCES rural_properties(id),
    area_reserva_legal_ha DECIMAL(12, 4),
    area_app_ha DECIMAL(12, 4),
    area_uso_consolidado_ha DECIMAL(12, 4),
    vegetacao_nativa_ha DECIMAL(12, 4),
    status_car VARCHAR(20) CHECK (status_car IN ('Ativo', 'Pendente', 'Suspenso')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dados_produtivos ( -- CCIR/INCRA Detalhado
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    propriedade_id UUID REFERENCES rural_properties(id),
    tipo_exploracao VARCHAR(100),
    area_efetivamente_utilizada_ha DECIMAL(12, 4),
    area_aproveitavel_ha DECIMAL(12, 4),
    indice_produtividade DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rural_vertices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rural_property_id UUID REFERENCES rural_properties(id),
    vertex_type CHAR(1) CHECK (vertex_type IN ('M', 'P', 'V')),
    latitude NUMERIC(12,8),
    longitude NUMERIC(12,8),
    easting NUMERIC(12,3),
    northing NUMERIC(12,3),
    azimuth VARCHAR(20),
    distance NUMERIC(10,2),
    confrontante TEXT,
    sequence_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES PARA PERFORMANCE
CREATE INDEX idx_properties_geom ON properties USING GIST (geom);
CREATE INDEX idx_rural_properties_geom ON rural_properties USING GIST (geom_poligono);
CREATE INDEX idx_processes_status ON processes(status);
CREATE INDEX idx_occupants_cpf ON occupants(cpf);
CREATE INDEX idx_territory_sectors_zone ON territory_sectors(zone_id);

-- 12. GESTÃO DOCUMENTAL E BPM (GED) - CONFORME REQUISITOS DE FRAGMENTAÇÃO E CONTROLE
CREATE TABLE ged_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID REFERENCES processes(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) CHECK (category IN (
        'Cadastro e Titularidade',
        'Regularização Fundiária (REURB)',
        'Loteamento e Parcelamento',
        'Desapropriação e Utilidade',
        'Controle Territorial e Georreferenciamento',
        'Ocupação e Habitação Social',
        'Licenciamento e Integração',
        'Administrativo Interno'
    )),
    document_type VARCHAR(100) NOT NULL, -- Ex: 'Matrícula', 'Escritura Pública', 'Alvará'
    file_name VARCHAR(255) NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    current_version INT DEFAULT 1,
    status VARCHAR(50) CHECK (status IN ('Pendente', 'Aprovado', 'Rejeitado', 'Assinado')) DEFAULT 'Pendente',
    file_hash VARCHAR(64) NOT NULL, -- SHA-256 do arquivo original
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ged_document_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES ged_documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    signature_data TEXT NOT NULL, -- Representação da assinatura eletrônica
    role_description VARCHAR(100), -- Ex: 'Engenheiro Responsável', 'Advogado Parecerista'
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ged_document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES ged_documents(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ged_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES ged_documents(id) ON DELETE CASCADE,
    origin_sector VARCHAR(100) NOT NULL, -- Ex: 'Topografia', 'Jurídico', 'Secretaria'
    destination_sector VARCHAR(100) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Pendente', 'Concluído', 'Recusado')) DEFAULT 'Pendente',
    responsible_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ged_documents_category ON ged_documents(category);
CREATE INDEX idx_ged_documents_type ON ged_documents(document_type);
CREATE INDEX idx_ged_documents_hash ON ged_documents(file_hash);
CREATE INDEX idx_ged_workflows_status ON ged_workflows(status);
`;

export const MOCK_FAMILIES = [
  { id: 'fam1', name: 'Maria da Silva Oliveira', cpf: '123.456.789-00', income: 1412 },
  { id: 'fam2', name: 'João Batista Santos', cpf: '987.654.321-00', income: 2100 },
  { id: 'fam3', name: 'Ricardo Alencar', cpf: '444.555.666-77', income: 8500 },
  { id: 'fam4', name: 'Ana Pereira Costa', cpf: '111.222.333-44', income: 3200 },
  { id: 'fam5', name: 'Carlos Eduardo Souza', cpf: '555.666.777-88', income: 1800 },
];

export const MOCK_PROCESSES: ReurbProcess[] = [
  {
    id: '1',
    title: 'Núcleo Esperança - Q04 L12',
    neighborhood: 'Jardim das Flores',
    type: ReurbType.SOCIAL,
    status: ProcessStatus.DIAGNOSTICO,
    createdAt: '2024-03-10',
    riskLevel: 'Low',
    aiInsights: ['Lote em conformidade com gabarito municipal', 'Zona ZEIS-1 verificada'],
    occupant: { name: 'Maria da Silva Oliveira', cpf: '123.456.789-00', income: 1412 },
    property: { 
      id: 'prop1', cadastralCode: 'LT-1001', zone: 'ZEIS-1', sector: 'S-02', block: 'Q-04', area_sqm: 250,
      registryArea_sqm: 250,
      confrontantes: { norte: '', sul: '', leste: '', oeste: '' },
      confrontantes_lista: [],
      units: [{ id: 'u1', designation: 'Casa Principal', area_privativa: 65, occupantId: 'occ1', isIndependent: true }]
    }
  },
  {
    id: '2',
    title: 'Vila Industrial - Q02 L08',
    neighborhood: 'Vila Industrial',
    type: ReurbType.SOCIAL,
    status: ProcessStatus.TRIAGEM,
    createdAt: '2024-03-12',
    riskLevel: 'Medium',
    aiInsights: ['Documentação de posse incompleta', 'Possível sobreposição de divisa detectada'],
    occupant: { name: 'João Batista Santos', cpf: '987.654.321-00', income: 2100 },
    property: { 
      id: 'prop2', cadastralCode: 'LT-2055', zone: 'ZEIS-2', sector: 'S-05', block: 'Q-02', area_sqm: 180,
      registryArea_sqm: 180,
      confrontantes: { norte: '', sul: '', leste: '', oeste: '' },
      confrontantes_lista: [],
      units: [{ id: 'u2', designation: 'Casa', area_privativa: 50, occupantId: 'occ2', isIndependent: true }]
    }
  },
  {
    id: '3',
    title: 'Fazenda Santa Luzia - Gleba A',
    neighborhood: 'Zona Rural - Setor Norte',
    type: ReurbType.RURAL,
    status: ProcessStatus.DIAGNOSTICO,
    createdAt: '2024-03-15',
    riskLevel: 'High',
    aiInsights: [
      'Sobreposição detectada com Reserva Legal vizinha (5%)',
      'Vértices georreferenciados em conformidade com Norma INCRA 3ª Ed.',
      'Área de APP preservada conforme Código Florestal'
    ],
    occupant: { name: 'Ricardo Alencar', cpf: '444.555.666-77', income: 8500 },
    property: { 
      id: 'prop3', cadastralCode: 'RUR-5001', zone: 'RURAL', sector: 'Gleba Mãe Sta Luzia', block: 'Parcela 01', area_sqm: 450000,
      registryArea_sqm: 448000,
      confrontantes: { norte: 'Fazenda Boa Vista', sul: 'Estrada Municipal', leste: 'Rio Claro', oeste: 'Lote 02' },
      confrontantes_lista: [],
      units: [{ id: 'u3', designation: 'Sede', area_privativa: 350, occupantId: 'occ3', isIndependent: true }]
    },
    ruralDetails: {
      id: 'rural1',
      nome_imovel: 'Fazenda Santa Luzia',
      codigo_incra: '950.123.456.789-0',
      registro_car: 'PA-1502308-BF23.4567.8901',
      nirf: '1234567-8',
      area_total_ha: 45.00,
      municipio_id: 'mun1',
      geomPoligono: null,
      fiscalModule: '1.25',
      originRegistry: 'Matrícula 12.345 - Cartório 1º Ofício',
      dados_ambientais: {
        id: 'amb1',
        propriedade_id: 'rural1',
        area_reserva_legal_ha: 9.00, // 20%
        area_app_ha: 4.50,
        area_uso_consolidado_ha: 31.50,
        vegetacao_nativa_ha: 13.50,
        status_car: 'Ativo'
      },
      dados_produtivos: {
        id: 'prod1',
        propriedade_id: 'rural1',
        tipo_exploracao: 'Pecuária Extensiva',
        area_efetivamente_utilizada_ha: 30.00,
        area_aproveitavel_ha: 35.00,
        indice_produtividade: 0.85
      },
      vertices: [],
      confrontantes: ['Fazenda Boa Vista', 'Rio Claro']
    }
  }
];
