
export enum ReurbType {
  SOCIAL = 'REURB-S',
  ESPECIFICO = 'REURB-E',
  RURAL = 'REURB-R'
}

export enum ProcessStatus {
  TRIAGEM = 'Triagem e Enquadramento',
  DIAGNOSTICO = 'Diagnóstico Técnico',
  NOTIFICACAO = 'Instrução e Notificação',
  APROVACAO = 'Aprovação Municipal',
  EMISSAO_CRF = 'Emissão de CRF',
  REGISTRO = 'Protocolo no Registro de Imóveis',
  CONCLUIDO = 'Registrado/Matriculado'
}

export interface TerritoryZone {
  id: string;
  name: string;
  type: 'ZEIS' | 'ZR' | 'ZC' | 'ZUE';
  description: string;
  minLotArea: number;
}

export interface TerritorySector {
  id: string;
  zoneId: string;
  name: string;
  responsibleName: string;
}

export interface TerritoryBlock {
  id: string;
  sectorId: string;
  designation: string; // Ex: Quadra 04
  totalArea: number;
  registryNumber?: string;
}

export interface TerritoryLot {
  id: string;
  blockId: string;
  cadastralCode: string;
  area: number;
  occupantName?: string;
  status: 'Vago' | 'Ocupado' | 'Regularizado' | 'Conflito';
}

export interface GisMetadata {
  precision: number; // em cm
  source: 'Drone' | 'RTK' | 'Estação Total';
  flightDate?: string;
  divergencePercentage?: number;
  topologyErrors: string[];
}

export interface Conflict {
  id: string;
  propertyAId: string;
  propertyBId: string;
  type: 'Divisa' | 'Sobreposição' | 'Invasão';
  description: string;
  status: 'Aberto' | 'Mediação' | 'Acordo Firmado' | 'Judicializado';
  aiRecommendation: string;
  mediationDate?: string;
}

export interface LegislationEntry {
  id: string;
  article: string;
  content: string;
  tags: string[];
  geoZone?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'Social' | 'Engenharia' | 'Jurídico';
  avatar: string;
  dailyGoal: number;
  completedToday: number;
  idleDays: number;
}

export interface ReasoningStep {
  label: string;
  status: 'valid' | 'warning' | 'error' | 'pending';
  detail: string;
}

export interface BottleneckPrediction {
  officeName: string;
  estimatedDays: number;
  riskOfDevolution: number;
  historicalBottlenecks: string[];
  criticalPath: string;
  impactIfFixed: number;
}

export interface LegalAudit {
  citationFederal: string[];
  citationMunicipal: string[];
  justification: string;
  fiscalizationRisk: 'Low' | 'Medium' | 'High';
  consolidatedStatus: boolean;
}

export interface AishaAnalysis {
  confidenceScore: number;
  reasoningTree: ReasoningStep[];
  prediction: BottleneckPrediction;
  audit: LegalAudit;
  suggestedCorrection: string;
  humanFeedbackRequired: boolean;
  priorityScore: number;
}

export interface Unit {
  id: string;
  designation: string;
  area_privativa: number;
  occupantId: string;
  isIndependent: boolean;
}

export interface LandProperty {
  id: string;
  cadastralCode: string;
  zone: string;
  sector: string;
  block: string;
  area_sqm: number;
  registryArea_sqm?: number;
  gisMetadata?: GisMetadata;
  units: Unit[];
  confrontantes_lista: any[];
  confrontantes: {
    norte: string;
    sul: string;
    leste: string;
    oeste: string;
  };
}

export interface RuralCar {
  id: string;
  receiptNumber: string;
  status: 'Inscrito' | 'Em Análise' | 'Cancelado' | 'Suspenso';
  appArea: number;
  legalReserveArea: number;
  appGeom?: any;
  legalReserveGeom?: any;
}

export interface RuralCcir {
  id: string;
  code: string;
  status: string;
  area: number;
  fiscalModule: number;
}

export interface RuralVertex {
  id: string;
  type: 'M' | 'P' | 'V';
  latitude: number;
  longitude: number;
  easting?: number;
  northing?: number;
  azimuth?: string;
  distance?: number;
  confrontante?: string;
}

export interface Municipio {
  id: string;
  nome: string;
  uf: string;
  valor_modulo_fiscal_ha: number;
}

export interface DadosAmbientais {
  id: string;
  propriedade_id: string;
  area_reserva_legal_ha: number;
  area_app_ha: number;
  area_uso_consolidado_ha: number;
  vegetacao_nativa_ha: number;
  status_car: 'Ativo' | 'Pendente' | 'Suspenso';
}

export interface DadosProdutivos {
  id: string;
  propriedade_id: string;
  tipo_exploracao: string;
  area_efetivamente_utilizada_ha: number;
  area_aproveitavel_ha: number;
  indice_produtividade: number;
}

export interface RuralProperty {
  id: string;
  nome_imovel: string;
  codigo_incra?: string;
  numero_matricula?: string;
  registro_car?: string;
  nirf?: string;
  area_total_ha: number;
  municipio_id?: string;
  geomPoligono: any;
  fiscalModule: string;
  originRegistry: string;
  car?: RuralCar; // Mantendo compatibilidade com código existente, mas idealmente migrar para DadosAmbientais
  ccir?: RuralCcir; // Mantendo compatibilidade com código existente, mas idealmente migrar para DadosProdutivos
  dados_ambientais?: DadosAmbientais;
  dados_produtivos?: DadosProdutivos;
  adaNumber?: string;
  vertices: RuralVertex[];
  confrontantes: string[];
  motherGlebeId?: string;
}

export interface ReurbProcess {
  id: string;
  title: string;
  type: ReurbType;
  status: ProcessStatus;
  neighborhood: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  aiInsights: string[];
  createdAt: string;
  property: LandProperty;
  occupant: {
    name: string;
    cpf: string;
    income: number;
  };
  ruralDetails?: RuralProperty;
  security?: {
    merkleRoot: string;
    timestamp: string;
  };
}

export interface GEDDocument {
  id: string;
  processId?: string;
  propertyId?: string;
  title: string;
  category: 
    | 'Cadastro e Titularidade' 
    | 'Regularização Fundiária (REURB)' 
    | 'Loteamento e Parcelamento' 
    | 'Desapropriação e Utilidade' 
    | 'Controle Territorial e Georreferenciamento' 
    | 'Ocupação e Habitação Social' 
    | 'Licenciamento e Integração' 
    | 'Administrativo Interno';
  type: string;
  fileName: string;
  fileSize: string;
  version: number;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Assinado';
  hash: string;
  uploadedBy: string;
  uploadedAt: string;
  signatures: { userName: string; signedAt: string; role: string }[];
  history: { version: number; fileName: string; hash: string; uploadedBy: string; uploadedAt: string }[];
}

export interface GEDWorkflow {
  id: string;
  documentId: string;
  documentTitle: string;
  originSector: string;
  destSector: string;
  status: 'Pendente' | 'Concluído' | 'Recusado';
  responsibleUser: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

