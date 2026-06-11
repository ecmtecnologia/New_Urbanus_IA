import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Layers, 
  Search, 
  Plus, 
  X, 
  ChevronRight, 
  Download, 
  CheckCircle2, 
  User, 
  Clock, 
  ArrowRight, 
  Upload, 
  History, 
  PenTool, 
  ShieldCheck, 
  Building2, 
  FileLock, 
  AlertTriangle,
  FolderOpen,
  Filter,
  Check,
  Send,
  Loader2,
  Trash2,
  Bookmark,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GEDDocument, GEDWorkflow } from '../types';

// Categorias das imagens mapeadas perfeitamente para o GED
const CATEGORIES = [
  'Cadastro e Titularidade',
  'Regularização Fundiária (REURB)',
  'Loteamento e Parcelamento',
  'Desapropriação e Utilidade',
  'Controle Territorial e Georreferenciamento',
  'Ocupação e Habitação Social',
  'Licenciamento e Integração',
  'Administrativo Interno'
];

// Tipos de documentos correspondentes a todos os itens descritos nas imagens
const DOCUMENT_TYPES: Record<string, string[]> = {
  'Cadastro e Titularidade': [
    'Matrícula de Imóvel',
    'Escritura Pública',
    'Contrato de Compra e Venda',
    'Certidão de Registro de Imóveis',
    'Certidão Negativa',
    'Carnê de IPTU',
    'CCIR / ITR',
    'Mapa Cadastral'
  ],
  'Regularização Fundiária (REURB)': [
    'Processo de Regularização',
    'Planta e Memorial',
    'Levantamento Topográfico',
    'Cadastro Social',
    'Termo de Legitimação',
    'CRF',
    'Projeto Urbanístico',
    'Relatório Técnico'
  ],
  'Loteamento e Parcelamento': [
    'Projeto de Loteamento',
    'Aprovação Urbanística',
    'Licença Ambiental',
    'Cronograma de Obras',
    'ART/RRT',
    'Termo de Compromisso',
    'Documentação de Infraestrutura'
  ],
  'Desapropriação e Utilidade': [
    'Decreto de Utilidade Pública',
    'Laudo de Avaliação',
    'Processo Judicial',
    'Acordo e Indenização',
    'Mapa de Área Afetada',
    'Documentos de Posse'
  ],
  'Controle Territorial e Georreferenciamento': [
    'Mapa GIS/Georreferenciado',
    'Imagens Aéreas e Ortofotos',
    'Plantas Urbanas',
    'Arquivos CAD',
    'Levantamentos Geodésicos',
    'Zoneamento Urbano'
  ],
  'Ocupação e Habitação Social': [
    'Cadastro Socioeconômico',
    'Contrato Habitacional',
    'Dossiê Familiar',
    'Comprovante de Residência',
    'Processos de Reassentamento',
    'Programas Habitacionais'
  ],
  'Licenciamento e Integração': [
    'Documentos de Obra',
    'Alvará',
    'Parecer Jurídico',
    'Parecer Ambiental'
  ],
  'Administrativo Interno': [
    'Ofício',
    'Protocolo',
    'Ata',
    'Fluxos de Aprovação',
    'Processos Digitais',
    'Relatórios Gerenciais'
  ]
};

// Dados simulados realistas contemplando TODOS os itens das imagens
const MOCK_DOCUMENTS: GEDDocument[] = [
  // 1. Cadastro e Titularidade
  {
    id: 'doc-1',
    processId: '1',
    title: 'Matrícula N° 45.901 - Gleba Esperança',
    category: 'Cadastro e Titularidade',
    type: 'Matrícula de Imóvel',
    fileName: 'matricula_45901_esperanca.pdf',
    fileSize: '3.4 MB',
    version: 2,
    status: 'Aprovado',
    hash: 'a7b9e0f31c82d56e7e4a90f12c34d56789e0bc12fa34df56e7890bc1234def90',
    uploadedBy: 'Dr. Lucas Siqueira',
    uploadedAt: '2026-05-10',
    signatures: [],
    history: [
      { version: 1, fileName: 'matricula_45901_esboco.pdf', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', uploadedBy: 'Dra. Amanda Luz', uploadedAt: '2026-05-02' },
      { version: 2, fileName: 'matricula_45901_esperanca.pdf', hash: 'a7b9e0f31c82d56e7e4a90f12c34d56789e0bc12fa34df56e7890bc1234def90', uploadedBy: 'Dr. Lucas Siqueira', uploadedAt: '2026-05-10' }
    ]
  },
  {
    id: 'doc-2',
    processId: '1',
    title: 'Escritura Pública de Compra e Venda - Quadra 04 Lote 12',
    category: 'Cadastro e Titularidade',
    type: 'Escritura Pública',
    fileName: 'escritura_compra_venda_q4_l12.pdf',
    fileSize: '4.8 MB',
    version: 1,
    status: 'Assinado',
    hash: 'fc817293a0bcf81739b981273918a092839b819283a0bc19283ab9281a0398cb',
    uploadedBy: 'Dr. Lucas Siqueira',
    uploadedAt: '2026-05-12',
    signatures: [{ userName: 'Dr. Lucas Siqueira', role: 'Jurídico', signedAt: '2026-05-12' }],
    history: [{ version: 1, fileName: 'escritura_compra_venda_q4_l12.pdf', hash: 'fc817293a0bcf81739b981273918a092839b819283a0bc19283ab9281a0398cb', uploadedBy: 'Dr. Lucas Siqueira', uploadedAt: '2026-05-12' }]
  },
  {
    id: 'doc-3',
    title: 'Contrato Particular de Promessa de Compra e Venda',
    category: 'Cadastro e Titularidade',
    type: 'Contrato de Compra e Venda',
    fileName: 'contrato_compra_venda_silva.pdf',
    fileSize: '1.2 MB',
    version: 1,
    status: 'Pendente',
    hash: 'bc837d9238ebc912e7311d0bbfbc9321f8a846ce23d0926712bc9bf921da8431',
    uploadedBy: 'Dra. Amanda Luz',
    uploadedAt: '2026-05-18',
    signatures: [],
    history: [{ version: 1, fileName: 'contrato_compra_venda_silva.pdf', hash: 'bc837d9238ebc912e7311d0bbfbc9321f8a846ce23d0926712bc9bf921da8431', uploadedBy: 'Dra. Amanda Luz', uploadedAt: '2026-05-18' }]
  },
  {
    id: 'doc-4',
    title: 'Certidão de Registro de Imóvel e Ônus',
    category: 'Cadastro e Titularidade',
    type: 'Certidão de Registro de Imóveis',
    fileName: 'certidao_registro_imoveis_onus.pdf',
    fileSize: '2.1 MB',
    version: 1,
    status: 'Aprovado',
    hash: 'dc8273bd912837bc9d92837bc90293d9a923dbcd4726ef3d5e2e8ac8203f9011',
    uploadedBy: 'Dr. Lucas Siqueira',
    uploadedAt: '2026-05-15',
    signatures: [],
    history: [{ version: 1, fileName: 'certidao_registro_imoveis_onus.pdf', hash: 'dc8273bd912837bc9d92837bc90293d9a923dbcd4726ef3d5e2e8ac8203f9011', uploadedBy: 'Dr. Lucas Siqueira', uploadedAt: '2026-05-15' }]
  },
  {
    id: 'doc-5',
    title: 'Certidão Negativa de Tributos Imobiliários',
    category: 'Cadastro e Titularidade',
    type: 'Certidão Negativa',
    fileName: 'certidao_negativa_tributos_mun.pdf',
    fileSize: '950 KB',
    version: 1,
    status: 'Aprovado',
    hash: 'ad8e928cd91b72e8cb9e8cbb0c7aa928cbdd83bbbcda9e9ecbc0192834b928cd',
    uploadedBy: 'Felipe Ramos',
    uploadedAt: '2026-05-20',
    signatures: [],
    history: [{ version: 1, fileName: 'certidao_negativa_tributos_mun.pdf', hash: 'ad8e928cd91b72e8cb9e8cbb0c7aa928cbdd83bbbcda9e9ecbc0192834b928cd', uploadedBy: 'Felipe Ramos', uploadedAt: '2026-05-20' }]
  },
  {
    id: 'doc-6',
    title: 'Carnê de IPTU Exercício 2026',
    category: 'Cadastro e Titularidade',
    type: 'Carnê de IPTU',
    fileName: 'iptu_2026_esperanca.pdf',
    fileSize: '1.5 MB',
    version: 1,
    status: 'Aprovado',
    hash: '0981a2839b8192d1a3c0a4c0eb3daeef3c7ffaaecbdde01a0bc19a82c038ffca',
    uploadedBy: 'Felipe Ramos',
    uploadedAt: '2026-05-21',
    signatures: [],
    history: [{ version: 1, fileName: 'iptu_2026_esperanca.pdf', hash: '0981a2839b8192d1a3c0a4c0eb3daeef3c7ffaaecbdde01a0bc19a82c038ffca', uploadedBy: 'Felipe Ramos', uploadedAt: '2026-05-21' }]
  },
  {
    id: 'doc-7',
    processId: '3',
    title: 'Certificado de Cadastro de Imóvel Rural (CCIR / ITR 2025)',
    category: 'Cadastro e Titularidade',
    type: 'CCIR / ITR',
    fileName: 'ccir_2025_fazenda_luzia.pdf',
    fileSize: '1.9 MB',
    version: 1,
    status: 'Aprovado',
    hash: 'fc23c8ddaeef329abb9a29e8bcada79a321dccfbe92bc9e29a39ecda92876bfd',
    uploadedBy: 'Eng. Roberto Santos',
    uploadedAt: '2026-04-12',
    signatures: [],
    history: [{ version: 1, fileName: 'ccir_2025_fazenda_luzia.pdf', hash: 'fc23c8ddaeef329abb9a29e8bcada79a321dccfbe92bc9e29a39ecda92876bfd', uploadedBy: 'Eng. Roberto Santos', uploadedAt: '2026-04-12' }]
  },

  // 2. Regularização Fundiária (REURB)
  {
    id: 'doc-8',
    processId: '1',
    title: 'Processo Administrativo REURB-S N° 102/2026',
    category: 'Regularização Fundiária (REURB)',
    type: 'Processo de Regularização',
    fileName: 'processo_reurb_s_102_2026.pdf',
    fileSize: '15.4 MB',
    version: 1,
    status: 'Pendente',
    hash: '718293bc9d871ab9c02d93e1a0df923bcbbdd72cc8da0bc21cdab92d1fa3c70c',
    uploadedBy: 'Dr. Lucas Siqueira',
    uploadedAt: '2026-05-01',
    signatures: [],
    history: [{ version: 1, fileName: 'processo_reurb_s_102_2026.pdf', hash: '718293bc9d871ab9c02d93e1a0df923bcbbdd72cc8da0bc21cdab92d1fa3c70c', uploadedBy: 'Dr. Lucas Siqueira', uploadedAt: '2026-05-01' }]
  },
  {
    id: 'doc-9',
    processId: '1',
    title: 'Planta de Demarcação e Memorial Descritivo - Lote Q04 L12',
    category: 'Regularização Fundiária (REURB)',
    type: 'Planta e Memorial',
    fileName: 'memorial_descritivo_q4_l12.pdf',
    fileSize: '2.5 MB',
    version: 2,
    status: 'Assinado',
    hash: 'fe8293bc8fa7c91d8f7b3a9c7d0d0e1b2c3ab4c5d6e7f8a9b0c1d2e3f4a5b6c7',
    uploadedBy: 'Eng. Roberto Santos',
    uploadedAt: '2026-05-15',
    signatures: [
      { userName: 'Eng. Roberto Santos', role: 'Engenheiro Responsável', signedAt: '2026-05-15' }
    ],
    history: [
      { version: 1, fileName: 'memorial_descritivo_q4_l12_draft.pdf', hash: 'c98dfbc9871ab9c0e29bca0b0df23c0bbfdd72fc8da2bc31cdab22d1fa2c300c', uploadedBy: 'Eng. Roberto Santos', uploadedAt: '2026-05-08' },
      { version: 2, fileName: 'memorial_descritivo_q4_l12.pdf', hash: 'fe8293bc8fa7c91d8f7b3a9c7d0d0e1b2c3ab4c5d6e7f8a9b0c1d2e3f4a5b6c7', uploadedBy: 'Eng. Roberto Santos', uploadedAt: '2026-05-15' }
    ]
  },
  {
    id: 'doc-10',
    title: 'Levantamento Topográfico Cadastral da ZEIS Flores',
    category: 'Regularização Fundiária (REURB)',
    type: 'Levantamento Topográfico',
    fileName: 'levantamento_topo_zeis_flores.pdf',
    fileSize: '8.2 MB',
    version: 1,
    status: 'Aprovado',
    hash: 'da3c29abbfbe9b940eabc27bbac3d9ef92bc8203f90112cb9e8c078cf90212db',
    uploadedBy: 'Eng. Roberto Santos',
    uploadedAt: '2026-05-09',
    signatures: [],
    history: [{ version: 1, fileName: 'levantamento_topo_zeis_flores.pdf', hash: 'da3c29abbfbe9b940eabc27bbac3d9ef92bc8203f90112cb9e8c078cf90212db', uploadedBy: 'Eng. Roberto Santos', uploadedAt: '2026-05-09' }]
  },
  {
    id: 'doc-11',
    processId: '1',
    title: 'Estudo Técnico de Demarcação e CRF Coletiva',
    category: 'Regularização Fundiária (REURB)',
    type: 'CRF',
    fileName: 'crf_coletiva_loteamento_flores.pdf',
    fileSize: '4.3 MB',
    version: 1,
    status: 'Assinado',
    hash: 'bc725dbda0192e20ab718a280c7dcf92aefbcbd731dcf9ad9efd8a29cf0d1fa2',
    uploadedBy: 'Dr. Lucas Siqueira',
    uploadedAt: '2026-05-22',
    signatures: [
      { userName: 'Dr. Lucas Siqueira', role: 'Presidente Comissão REURB', signedAt: '2026-05-22' }
    ],
    history: [{ version: 1, fileName: 'crf_coletiva_loteamento_flores.pdf', hash: 'bc725dbda0192e20ab718a280c7dcf92aefbcbd731dcf9ad9efd8a29cf0d1fa2', uploadedBy: 'Dr. Lucas Siqueira', uploadedAt: '2026-05-22' }]
  },

  // 3. Loteamento e Parcelamento
  {
    id: 'doc-12',
    title: 'Projeto de Parcelamento Residencial das Flores',
    category: 'Loteamento e Parcelamento',
    type: 'Projeto de Loteamento',
    fileName: 'projeto_loteamento_residencial_flores.dwg',
    fileSize: '11.4 MB',
    version: 1,
    status: 'Pendente',
    hash: 'fc0192d192bc9da9ebcacbddefaaec7ffaa90f12c321dcdbe92bc9eafbd09a2d',
    uploadedBy: 'Eng. Roberto Santos',
    uploadedAt: '2026-05-05',
    signatures: [],
    history: [{ version: 1, fileName: 'projeto_loteamento_residencial_flores.dwg', hash: 'fc0192d192bc9da9ebcacbddefaaec7ffaa90f12c321dcdbe92bc9eafbd09a2d', uploadedBy: 'Eng. Roberto Santos', uploadedAt: '2026-05-05' }]
  },
  {
    id: 'doc-13',
    title: 'Decreto de Aprovação do Loteamento - Decreto 401/26',
    category: 'Loteamento e Parcelamento',
    type: 'Aprovação Urbanística',
    fileName: 'decreto_401_2026_aprovacao_urb.pdf',
    fileSize: '1.8 MB',
    version: 1,
    status: 'Aprovado',
    hash: 'ad12fd7cbe32eb7a2bda9eef3d02a9eb789cda9eefbcda98a7cfbe982ca0acdb',
    uploadedBy: 'Dra. Amanda Luz',
    uploadedAt: '2026-05-11',
    signatures: [],
    history: [{ version: 1, fileName: 'decreto_401_2026_aprovacao_urb.pdf', hash: 'ad12fd7cbe32eb7a2bda9eef3d02a9eb789cda9eefbcda98a7cfbe982ca0acdb', uploadedBy: 'Dra. Amanda Luz', uploadedAt: '2026-05-11' }]
  },
  {
    id: 'doc-14',
    title: 'Licença Ambiental de Instalação N° 34.901/LAI',
    category: 'Loteamento e Parcelamento',
    type: 'Licença Ambiental',
    fileName: 'licenca_ambiental_instalacao_flores.pdf',
    fileSize: '3.1 MB',
    version: 1,
    status: 'Aprovado',
    hash: 'dc77ea9cbfaec321dcdbe90fbcaeecdafeefcaaecdafeebfecbdafeca928cbde',
    uploadedBy: 'Eng. Roberto Santos',
    uploadedAt: '2026-05-14',
    signatures: [],
    history: [{ version: 1, fileName: 'licenca_ambiental_instalacao_flores.pdf', hash: 'dc77ea9cbfaec321dcdbe90fbcaeecdafeefcaaecdafeebfecbdafeca928cbde', uploadedBy: 'Eng. Roberto Santos', uploadedAt: '2026-05-14' }]
  },
  {
    id: 'doc-15',
    title: 'ART N° 2026110904 - Medição Topográfica de Precisão',
    category: 'Loteamento e Parcelamento',
    type: 'ART/RRT',
    fileName: 'art_2026110904_crea.pdf',
    fileSize: '820 KB',
    version: 1,
    status: 'Assinado',
    hash: 'fccaedbfcaec928fbaecda7abecdffe128cbdaebda7fbacbdafecbe71dcaefbd',
    uploadedBy: 'Eng. Roberto Santos',
    uploadedAt: '2026-05-10',
    signatures: [{ userName: 'Eng. Roberto Santos', role: 'Engenheiro Cadastrado', signedAt: '2026-05-10' }],
    history: [{ version: 1, fileName: 'art_2026110904_crea.pdf', hash: 'fccaedbfcaec928fbaecda7abecdffe128cbdaebda7fbacbdafecbe71dcaefbd', uploadedBy: 'Eng. Roberto Santos', uploadedAt: '2026-05-10' }]
  },

  // 4. Desapropriação e Utilidade
  {
    id: 'doc-16',
    title: 'Decreto de Expropriação por Utilidade Pública N° 456/26',
    category: 'Desapropriação e Utilidade',
    type: 'Decreto de Utilidade Pública',
    fileName: 'decreto_expropriacao_utilidade_pub_456.pdf',
    fileSize: '2.3 MB',
    version: 1,
    status: 'Aprovado',
    hash: 'e82bebad9128fbaecdaeecdfbaecf7ebcd6291a92ebd81a0293ebcdaecba0a12',
    uploadedBy: 'Dra. Amanda Luz',
    uploadedAt: '2026-05-02',
    signatures: [],
    history: [{ version: 1, fileName: 'decreto_expropriacao_utilidade_pub_456.pdf', hash: 'e82bebad9128fbaecdaeecdfbaecf7ebcd6291a92ebd81a0293ebcdaecba0a12', uploadedBy: 'Dra. Amanda Luz', uploadedAt: '2026-05-02' }]
  },
  {
    id: 'doc-17',
    title: 'Laudo Pericial de Avaliação Mercadológica de Imóveis',
    category: 'Desapropriação e Utilidade',
    type: 'Laudo de Avaliação',
    fileName: 'laudo_avaliacao_mercado_vicosa.pdf',
    fileSize: '6.7 MB',
    version: 1,
    status: 'Assinado',
    hash: 'ccfaeb7fbcaeecda789b9acf8a0cbefda12bcda9e20ebcdf8928cfbae0aa8cda',
    uploadedBy: 'Eng. Roberto Santos',
    uploadedAt: '2026-05-19',
    signatures: [{ userName: 'Eng. Roberto Santos', role: 'Perito Avaliador', signedAt: '2026-05-19' }],
    history: [{ version: 1, fileName: 'laudo_avaliacao_mercado_vicosa.pdf', hash: 'ccfaeb7fbcaeecda789b9acf8a0cbefda12bcda9e20ebcdf8928cfbae0aa8cda', uploadedBy: 'Eng. Roberto Santos', uploadedAt: '2026-05-19' }]
  },

  // 5. Controle Territorial
  {
    id: 'doc-18',
    title: 'Mapa GIS de Unificação e Quadras de REURB',
    category: 'Controle Territorial e Georreferenciamento',
    type: 'Mapa GIS/Georreferenciado',
    fileName: 'mapa_gis_unidades_flores.qgz',
    fileSize: '20.1 MB',
    version: 2,
    status: 'Aprovado',
    hash: 'fc89312ab9230bcdaffdaee76fe0bcda12cbdfaeecdabe9fbcdaecde82abdaea',
    uploadedBy: 'Eng. Roberto Santos',
    uploadedAt: '2026-05-16',
    signatures: [],
    history: [
      { version: 1, fileName: 'mapa_gis_unidades_flores_v1.qgz', hash: 'bcdeaffda2310bcddb7caefabda89e9fbc029cbd89e0cbdef22faecdaea0cbcd', uploadedBy: 'Eng. Roberto Santos', uploadedAt: '2026-05-04' },
      { version: 2, fileName: 'mapa_gis_unidades_flores.qgz', hash: 'fc89312ab9230bcdaffdaee76fe0bcda12cbdfaeecdabe9fbcdaecde82abdaea', uploadedBy: 'Eng. Roberto Santos', uploadedAt: '2026-05-16' }
    ]
  },

  // 6. Ocupação e Habitação Social
  {
    id: 'doc-19',
    processId: '1',
    title: 'Contrato de Concessão de Direito Real de Uso (CDRU)',
    category: 'Ocupação e Habitação Social',
    type: 'Contrato Habitacional',
    fileName: 'cdru_concessao_silva.pdf',
    fileSize: '2.3 MB',
    version: 1,
    status: 'Assinado',
    hash: 'adbcfaeb09cdaefba09cbafe12cbd8fa9efcaedfacebcdaebfaecdaebfacedbcda',
    uploadedBy: 'Dr. Lucas Siqueira',
    uploadedAt: '2026-05-22',
    signatures: [
      { userName: 'Dr. Lucas Siqueira', role: 'Presidente Reg. Fundiária', signedAt: '2026-05-22' },
      { userName: 'Maria da Silva Oliveira', role: 'Beneficiária (Ocupante)', signedAt: '2026-05-22' }
    ],
    history: [{ version: 1, fileName: 'cdru_concessao_silva.pdf', hash: 'adbcfaeb09cdaefba09cbafe12cbd8fa9efcaedfacebcdaebfaecdaebfacedbcda', uploadedBy: 'Dr. Lucas Siqueira', uploadedAt: '2026-05-22' }]
  },

  // 7. Licenciamento
  {
    id: 'doc-20',
    title: 'Parecer Jurídico de Admissibilidade da REURB-S',
    category: 'Licenciamento e Integração',
    type: 'Parecer Jurídico',
    fileName: 'parecer_juridico_regularizacao_s.pdf',
    fileSize: '3.1 MB',
    version: 1,
    status: 'Assinado',
    hash: 'fc892baecdaeb789baec781a0bcdefabdae9821cbdbe9ae9bcdaefbaecdebda11',
    uploadedBy: 'Dr. Lucas Siqueira',
    uploadedAt: '2026-05-21',
    signatures: [{ userName: 'Dr. Lucas Siqueira', role: 'Consultor Jurídico Adjunto', signedAt: '2026-05-21' }],
    history: [{ version: 1, fileName: 'parecer_juridico_regularizacao_s.pdf', hash: 'fc892baecdaeb789baec781a0bcdefabdae9821cbdbe9ae9bcdaefbaecdebda11', uploadedBy: 'Dr. Lucas Siqueira', uploadedAt: '2026-05-21' }]
  }
];

const MOCK_WORKFLOWS: GEDWorkflow[] = [
  {
    id: 'wf-1',
    documentId: 'doc-9',
    documentTitle: 'Planta de Demarcação e Memorial Descritivo - Lote Q04 L12',
    originSector: 'Engenharia e Topografia',
    destSector: 'Assessoria Jurídica',
    status: 'Pendente',
    responsibleUser: 'Dr. Lucas Siqueira',
    notes: 'Solicito parecer jurídico e análise de confrontantes referente ao memorial descritivo gerado pela topografia.',
    createdAt: '2026-05-16',
    updatedAt: '2026-05-16'
  },
  {
    id: 'wf-2',
    documentId: 'doc-12',
    documentTitle: 'Projeto de Parcelamento Residencial das Flores',
    originSector: 'Engenharia e Topografia',
    destSector: 'Secretaria de Planejamento Urbano',
    status: 'Pendente',
    responsibleUser: 'Felipe Ramos',
    notes: 'Encaminho projeto para aprovação e posterior assinatura do decreto de regularização.',
    createdAt: '2026-05-18',
    updatedAt: '2026-05-18'
  },
  {
    id: 'wf-3',
    documentId: 'doc-20',
    documentTitle: 'Parecer Jurídico de Admissibilidade da REURB-S',
    originSector: 'Assessoria Jurídica',
    destSector: 'Comissão Especial de REURB',
    status: 'Concluído',
    responsibleUser: 'Dra. Amanda Luz',
    notes: 'Parecer pela total admissibilidade, preenchendo todos os requisitos legais constitucionais e ambientais.',
    createdAt: '2026-05-21',
    updatedAt: '2026-05-22'
  }
];

const GEDModule: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<GEDDocument[]>(MOCK_DOCUMENTS);
  const [workflows, setWorkflows] = useState<GEDWorkflow[]>(MOCK_WORKFLOWS);
  
  // States para filtros e busca
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');

  // Controladores de Modais e Detalhes
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<GEDDocument | null>(null);
  const [detailTab, setDetailTab] = useState<'details' | 'history' | 'signature' | 'route'>('details');

  // Adição de Novo Documento
  const [newDoc, setNewDoc] = useState({
    title: '',
    category: 'Cadastro e Titularidade',
    type: '',
    fileName: '',
    fileSize: '1.8 MB'
  });

  // Upload de Versão
  const [newVersionFile, setNewVersionFile] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Assinatura Eletrônica (Canvas)
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef({ lastX: 0, lastY: 0 });

  // Tramitação / Envio
  const [tramite, setTramite] = useState({
    destSector: 'Assessoria Jurídica',
    notes: ''
  });

  // Configurações do Select Auxiliar para os Document Types
  useEffect(() => {
    if (newDoc.category) {
      setNewDoc(prev => ({ ...prev, type: DOCUMENT_TYPES[prev.category][0] }));
    }
  }, [newDoc.category]);

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title || !newDoc.fileName) {
      alert('Por favor, preencha o título e selecione ou digite o nome do arquivo.');
      return;
    }

    const created: GEDDocument = {
      id: `doc-${Date.now()}`,
      title: newDoc.title,
      category: newDoc.category as any,
      type: newDoc.type,
      fileName: newDoc.fileName,
      fileSize: newDoc.fileSize,
      version: 1,
      status: 'Pendente',
      hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      uploadedBy: user?.name || 'Operador',
      uploadedAt: new Date().toISOString().split('T')[0],
      signatures: [],
      history: [
        {
          version: 1,
          fileName: newDoc.fileName,
          hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          uploadedBy: user?.name || 'Operador',
          uploadedAt: new Date().toISOString().split('T')[0]
        }
      ]
    };

    setDocuments(prev => [created, ...prev]);
    setShowAddModal(false);
    // Reset form
    setNewDoc({
      title: '',
      category: 'Cadastro e Titularidade',
      type: DOCUMENT_TYPES['Cadastro e Titularidade'][0],
      fileName: '',
      fileSize: '1.2 MB'
    });
  };

  const handleUploadNewVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocument || !newVersionFile) return;

    const nextVer = selectedDocument.version + 1;
    const newHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    const updatedHistory = [
      ...selectedDocument.history,
      {
        version: nextVer,
        fileName: newVersionFile,
        hash: newHash,
        uploadedBy: user?.name || 'Operador',
        uploadedAt: new Date().toISOString().split('T')[0]
      }
    ];

    const updatedDoc: GEDDocument = {
      ...selectedDocument,
      version: nextVer,
      fileName: newVersionFile,
      hash: newHash,
      history: updatedHistory,
      status: 'Pendente' // Redefine para pendente ao subir nova versão
    };

    setDocuments(prev => prev.map(d => d.id === selectedDocument.id ? updatedDoc : d));
    setSelectedDocument(updatedDoc);
    setNewVersionFile('');
    setDetailTab('history');
  };

  const handleTramitarDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocument || !tramite.destSector) return;

    const newWf: GEDWorkflow = {
      id: `wf-${Date.now()}`,
      documentId: selectedDocument.id,
      documentTitle: selectedDocument.title,
      originSector: 'Comissão de REURB',
      destSector: tramite.destSector,
      status: 'Pendente',
      responsibleUser: tramite.destSector.includes('Jurídica') ? 'Dr. Lucas Siqueira' : 'Dra. Amanda Luz',
      notes: tramite.notes,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setWorkflows(prev => [newWf, ...prev]);
    setTramite({ destSector: 'Assessoria Jurídica', notes: '' });
    alert(`Documento tramitado com sucesso para o setor: ${tramite.destSector}`);
    setSelectedDocument(null);
  };

  // Funções de desenho da assinatura eletrônica
  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    drawingRef.current = { lastX: x, lastY: y };
    setIsDrawing(true);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = '#059669'; // Emerald-600
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();

    drawingRef.current = { lastX: x, lastY: y };
  };

  const handleStopDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleApplySignature = () => {
    if (!selectedDocument) return;

    const updatedDoc: GEDDocument = {
      ...selectedDocument,
      status: 'Assinado',
      signatures: [
        ...selectedDocument.signatures,
        {
          userName: user?.name || 'Operador Responsável',
          role: user?.role === 'MASTER' ? 'Prefeito / Diretor Master' : 'Analista Municipal',
          signedAt: new Date().toISOString().split('T')[0]
        }
      ]
    };

    setDocuments(prev => prev.map(d => d.id === selectedDocument.id ? updatedDoc : d));
    setSelectedDocument(updatedDoc);
    alert('Documento assinado digitalmente com sucesso!');
  };

  const deleteDocument = (id: string) => {
    if (confirm('Tem certeza que deseja marcar este documento para arquivamento/lixeira no GED?')) {
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
    }
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) || 
                          d.fileName.toLowerCase().includes(search.toLowerCase()) || 
                          d.type.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? d.category === selectedCategory : true;
    const matchesStatus = selectedStatus === 'Todos' ? true : d.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Top Banner & Stats */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl border border-white/5">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-600/30 text-emerald-400 font-bold border border-emerald-500/20 rounded-full text-xs uppercase tracking-wider">Módulo GED & BPM</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-slate-400 text-xs">V1.3 Ativo</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight leading-tight">Central de Gestão de Documentos (GED)</h2>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Repositório único integrado com suporte a versionamento automático, tramitação digital inter-secretarias, assinaturas biométricas digitais e conformidade com requisitos de regularização territorial.
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3.5 bg-emerald-600 text-white hover:bg-emerald-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2 self-stretch xl:self-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Importar Documento (GED)
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        
        {/* Left Filters Sidebar */}
        <div className="space-y-6 xl:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-500" /> Categorias Administrativas
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-xs uppercase transition-all flex justify-between items-center ${
                    selectedCategory === null 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Todos os Documentos</span>
                  <span className="bg-slate-200/50 text-slate-600 px-2 py-0.5 rounded-md font-mono text-[10px]">{documents.length}</span>
                </button>
                {CATEGORIES.map(cat => {
                  const count = documents.filter(d => d.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-xs uppercase transition-all flex justify-between items-start gap-2 ${
                        selectedCategory === cat 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      <span className="bg-slate-200/50 text-slate-600 px-2 py-0.5 rounded-md font-mono text-[10px] shrink-0">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Status de Aprovação</h3>
              <div className="grid grid-cols-2 gap-2">
                {['Todos', 'Pendente', 'Aprovado', 'Assinado'].map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`py-2 px-3 rounded-xl font-bold text-[10px] uppercase tracking-wide border transition-all text-center ${
                      selectedStatus === st 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GED Quick Problem Warning box */}
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex gap-3">
              <div className="bg-amber-100 text-amber-800 p-2 rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide">Fim da Fragmentação</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evite arquivos soltos em pastas de rede, emails ou mídias físicas. Centralize plantas, escrituras, laudos e editais no GED para auditoria e rastreabilidade imediata.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Central Document Explorer List */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Internal Explorer controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar documento por título, extensão ou tipo específico..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm text-slate-700 transition-all placeholder:text-slate-400"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:inline">Exibindo:</span>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-black font-mono">
                {filteredDocs.length} documentos
              </span>
            </div>
          </div>

          {/* Grid/List of Documents */}
          <div className="grid grid-cols-1 gap-4">
            {filteredDocs.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
                <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-base">Nenhum documento encontrado</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Ajuste seus filtros de categorias ou digite uma busca diferente no campo de pesquisa.
                </p>
              </div>
            ) : (
              filteredDocs.map(doc => {
                const isSelected = selectedDocument?.id === doc.id;
                return (
                  <div 
                    key={doc.id}
                    className={`bg-white rounded-2xl border transition-all p-5 shadow-sm group hover:shadow-md ${
                      isSelected 
                        ? 'border-emerald-500 ring-1 ring-emerald-500' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row gap-4 items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl group-hover:bg-emerald-100 transition-colors shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">{doc.category}</span>
                            <span className="text-slate-400 text-xs">•</span>
                            <span className="font-medium text-xs text-slate-500">{doc.type}</span>
                            <span className="text-slate-400 text-xs">•</span>
                            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">V{doc.version}</span>
                          </div>
                          
                          <h4 className="font-extrabold text-slate-900 text-sm md:text-base leading-tight">
                            {doc.title}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 font-medium text-xs pt-1">
                            <span className="flex items-center gap-1"><Upload className="w-3.5 h-3.5" /> {doc.fileName} ({doc.fileSize})</span>
                            <span className="hidden md:inline">•</span>
                            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Enviado por {doc.uploadedBy} em {doc.uploadedAt}</span>
                          </div>

                          {doc.signatures.length > 0 && (
                            <div className="flex items-center gap-1.5 pt-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                                Assinado por: {doc.signatures.map(s => s.userName).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 justify-end">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider leading-none ml-auto lg:ml-0 ${
                          doc.status === 'Assinado' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          doc.status === 'Aprovado' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          doc.status === 'Rejeitado' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {doc.status}
                        </span>

                        <button 
                          onClick={() => {
                            setSelectedDocument(doc);
                            setDetailTab('details');
                          }}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                        >
                          Analisar
                        </button>
                        
                        <button 
                          onClick={() => deleteDocument(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Arquivar/Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Workflow & Tramitações Log Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" /> Fluxos de Tramitação de Processos e Documentos (BPM)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-4xl">
              Confira os caminhos processuais digitais percorridos pelos memoriais, laudos e decretos entre as secretarias de Fazenda, Meio Ambiente, Planejamento e o setor Jurídico.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Documento / Processo</th>
                    <th className="py-3 px-4">Origem</th>
                    <th className="py-3 px-4"></th>
                    <th className="py-3 px-4">Destino</th>
                    <th className="py-3 px-4">Data Envio</th>
                    <th className="py-3 px-4">Responsável</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {workflows.map(wf => (
                    <tr key={wf.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800 max-w-xs truncate">{wf.documentTitle}</td>
                      <td className="py-3 px-4 font-medium text-slate-600">{wf.originSector}</td>
                      <td className="py-3 px-4 text-slate-400 text-center"><ArrowRight className="w-3.5 h-3.5 inline mx-auto text-emerald-500" /></td>
                      <td className="py-3 px-4 font-bold text-emerald-800">{wf.destSector}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{wf.createdAt}</td>
                      <td className="py-3 px-4 text-slate-500">{wf.responsibleUser}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          wf.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {wf.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Document Details Overlay/Drawer */}
      {selectedDocument && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setSelectedDocument(null)}
          />
          
          <div className="relative bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{selectedDocument.category}</span>
                <h3 className="text-lg font-black leading-tight max-w-md">{selectedDocument.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedDocument(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs inside drawer */}
            <div className="flex border-b border-slate-100 bg-slate-50 px-6 pt-3 gap-4 shrink-0 overflow-x-auto">
              <button
                onClick={() => setDetailTab('details')}
                className={`pb-3 px-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 shrink-0 ${
                  detailTab === 'details' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Detalhes
              </button>
              <button
                onClick={() => setDetailTab('history')}
                className={`pb-3 px-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 shrink-0 ${
                  detailTab === 'history' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Histórico de Versões
              </button>
              <button
                onClick={() => setDetailTab('signature')}
                className={`pb-3 px-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 shrink-0 ${
                  detailTab === 'signature' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Assinatura Digital
              </button>
              <button
                onClick={() => setDetailTab('route')}
                className={`pb-3 px-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 shrink-0 ${
                  detailTab === 'route' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Tramitar (Rota BPM)
              </button>
            </div>

            {/* Content Drawer */}
            <div className="flex-1 p-6 space-y-6">
              
              {detailTab === 'details' && (
                <div className="space-y-6">
                  {/* General Info Card */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">Identificação do Arquivo</h4>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold block">Categoria de Destino</span>
                        <span className="font-extrabold text-slate-800">{selectedDocument.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">Tipo Específico</span>
                        <span className="font-extrabold text-slate-800">{selectedDocument.type}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">Versão Atual</span>
                        <span className="font-extrabold text-emerald-600">V{selectedDocument.version}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">Status no GED</span>
                        <span className="font-extrabold text-slate-800">{selectedDocument.status}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 font-bold block">Nome do Arquivo Físico</span>
                        <span className="font-mono font-bold text-slate-600 bg-white border border-slate-100 px-2 py-0.5 rounded text-[10px] block truncate text-left mt-0.5">
                          {selectedDocument.fileName} ({selectedDocument.fileSize})
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 font-bold block">Hash Criptográfico SHA-256 (Garantia de Integridade)</span>
                        <span className="font-mono text-slate-500 bg-white border border-slate-100 px-2 py-1 rounded text-[10px] block truncate text-left mt-0.5">
                          {selectedDocument.hash}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Document Signature Panel */}
                  <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 space-y-4">
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Assinaturas Eletrônicas Coletadas
                    </h4>
                    {selectedDocument.signatures.length === 0 ? (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Este documento ainda não possui assinaturas registradas. Acesse a aba **"Assinatura Digital"** acima para registrar sua anuência no arquivo.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {selectedDocument.signatures.map((sig, i) => (
                          <div key={i} className="bg-white border border-emerald-200/50 p-4 rounded-xl flex justify-between items-center text-xs">
                            <div className="space-y-1">
                              <p className="font-extrabold text-slate-800">{sig.userName}</p>
                              <p className="text-slate-400">{sig.role}</p>
                            </div>
                            <div className="text-right text-[10px] font-mono text-slate-400 space-y-1">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold uppercase tracking-wider block">CONVALIDADO</span>
                              <span>Em {sig.signedAt}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailTab === 'history' && (
                <div className="space-y-6">
                  {/* Form to upload new version */}
                  <form onSubmit={handleUploadNewVersion} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-3">
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">Subir Nova Versão</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Selecione um arquivo atualizado. Isso gerará uma nova versão incremental automatizada no GED (ex: V{selectedDocument.version} → V{selectedDocument.version + 1}).
                    </p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nome do novo arquivo (ex: planta_modificada.dwg)"
                        value={newVersionFile}
                        onChange={(e) => setNewVersionFile(e.target.value)}
                        className="flex-1 px-4 py-2 bg-white rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-xs select-none placeholder:text-slate-400"
                      />
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                      >
                        Salvar Versão
                      </button>
                    </div>
                  </form>

                  {/* Version List */}
                  <div className="space-y-4">
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-500" /> Histórico Completo de Alterações
                    </h4>
                    <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-4">
                      {selectedDocument.history.map((hist, idx) => (
                        <div key={idx} className="relative space-y-1">
                          <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-4 ring-emerald-100"></div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-mono">VERSÃO {hist.version}</span>
                            <span className="text-slate-400 text-xs">•</span>
                            <span className="text-slate-400 text-xs font-mono font-medium">{hist.uploadedAt}</span>
                          </div>
                          <p className="font-bold text-slate-800 text-xs text-left">{hist.fileName}</p>
                          <p className="text-[10px] text-slate-400 font-mono pl-1">Hash SHA-256: {hist.hash.substring(0, 32)}...</p>
                          <p className="text-[10px] text-slate-400 font-medium pl-1">Enviado por: {hist.uploadedBy}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'signature' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 text-left space-y-2">
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">Painel de Assinatura Eletrônica</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      De acordo com as leis do sistema Urbanus IA, você pode carimbar sua anuência digital usando o painel biométrico ou seu carimbo técnico abaixo.
                    </p>
                  </div>

                  {/* Pad de Assinatura Canvas */}
                  <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-4 flex flex-col items-center gap-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desenhe sua assinatura no espaço abaixo</h5>
                    
                    <canvas 
                      ref={canvasRef}
                      width={500}
                      height={180}
                      onMouseDown={handleStartDraw}
                      onMouseMove={handleDraw}
                      onMouseUp={handleStopDraw}
                      onMouseLeave={handleStopDraw}
                      className="bg-slate-50 rounded-2xl border border-slate-200 cursor-crosshair w-full max-w-[500px]"
                    />

                    <div className="flex gap-2">
                      <button 
                        onClick={clearCanvas}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs uppercase"
                      >
                        Limpar Área
                      </button>
                      <button 
                        onClick={handleApplySignature}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/15"
                      >
                        Confirmar e Assinar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'route' && (
                <div className="space-y-6">
                  <form onSubmit={handleTramitarDocument} className="space-y-4">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-2">
                      <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">Roteador Digital BPM (Tramitação)</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Envie este documento diretamente para o fluxo de auditoria de outro setor (Assessoria Jurídica, Secretaria de Planejamento Urbano, Tributação Municipal, Meio Ambiente ou Comissão Especial de REURB).
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase ml-1">Secretaria / Setor Destinatário</label>
                      <select 
                        value={tramite.destSector}
                        onChange={(e) => setTramite(prev => ({ ...prev, destSector: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none"
                      >
                        <option value="Assessoria Jurídica">Assessoria Jurídica (Procuradoria)</option>
                        <option value="Secretaria de Planejamento Urbano">Secretaria de Planejamento Urbano (Obras)</option>
                        <option value="Secretaria de Fazenda e Tributação">Secretaria de Fazenda e Tributação (IPTU)</option>
                        <option value="Secretaria de Meio Ambiente">Secretaria de Meio Ambiente (Pareceres)</option>
                        <option value="Comissão Especial de REURB">Comissão Especial de REURB (Diretoria)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase ml-1">Observações / Instruções de Rota</label>
                      <textarea 
                        rows={4}
                        placeholder="Escreva detalhes do que precisa ser analisado pelo setor de destino..."
                        value={tramite.notes}
                        onChange={(e) => setTramite(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-medium text-xs outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/15"
                    >
                      Iniciar Tramitação Digital
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Bookmark className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-black tracking-tight">Importar Documento do Processo</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-1">Título do Documento</label>
                <input 
                  type="text"
                  placeholder="Ex: Contrato de Compra e Venda Lote 12"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-medium text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-1">Categoria de Arquivamento</label>
                <select 
                  value={newDoc.category}
                  onChange={(e) => setNewDoc({...newDoc, category: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-bold text-xs select-none focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-1">Tipo de Documento</label>
                <select 
                  value={newDoc.type}
                  onChange={(e) => setNewDoc({...newDoc, type: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-bold text-xs select-none focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {DOCUMENT_TYPES[newDoc.category]?.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-1">Nome do Arquivo</label>
                <input 
                  type="text"
                  placeholder="Ex: certidao_negativa_reurb.pdf"
                  value={newDoc.fileName}
                  onChange={(e) => setNewDoc({...newDoc, fileName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-medium text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-1">Tamanho do Arquivo</label>
                <input 
                  type="text"
                  value={newDoc.fileSize}
                  onChange={(e) => setNewDoc({...newDoc, fileSize: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-bold text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all mt-4"
              >
                Importar para o GED
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GEDModule;
