# Mapeamento de módulos para a arquitetura de dados v1.2

Este documento liga os módulos atuais do frontend às tabelas da nova base para orientar a próxima etapa de implementação.

## 1. Gestão territorial

- `components/TerritoryManager.tsx`
  - Tabelas: `territory_zones`, `territory_sectors`, `territory_blocks`
  - Papel: administrar a hierarquia territorial e a navegação por zona, setor e quadra.
- `components/LotEditor.tsx`
  - Tabelas: `properties`, `territory_blocks`
  - Papel: editar o lote individual, seus confrontantes, geometria e atributos cadastrais.
- `components/GISModule.tsx`
  - Tabelas: `territory_zones`, `territory_sectors`, `territory_blocks`, `properties`, `conflicts`
  - Papel: visualização espacial, interseções, camadas e leitura geográfica.

## 2. Processo e regularização

- `components/ProcessList.tsx`
  - Tabelas: `processes`, `properties`, `occupants`
  - Papel: listar e operar o fluxo REURB por protocolo.
- `components/ConflictModule.tsx`
  - Tabelas: `conflicts`, `properties`
  - Papel: tratar sobreposições, invasões e divergências territoriais.
- `components/VirtualAnalyst.tsx`
  - Tabelas: `ai_analyses`, `processes`, `legislation_library`
  - Papel: consumir a IA/Aisha para diagnóstico e recomendação.

## 3. Social e ocupação

- `components/FamilyManager.tsx`
  - Tabelas: `occupants`, `family_members`, `properties`
  - Papel: cadastro social da família, ocupante principal e composição familiar.
- `components/PortalCidadao.tsx`
  - Tabelas: `occupants`, `processes`, `ged_documents`
  - Papel: visão do cidadão sobre andamento, documentos e pendências.

## 4. GED e fluxo documental

- `components/GEDModule.tsx`
  - Tabelas: `ged_documents`, `ged_document_versions`, `ged_document_signatures`, `ged_workflows`
  - Papel: repositório documental, versionamento, assinatura e tramitação.
- `components/ExportModule.tsx`
  - Tabelas: `ged_documents`, `processes`, `integrity_logs`
  - Papel: emissão de relatórios, PDFs e pacotes de exportação.

## 5. Rural

- `components/RuralModule.tsx`
  - Tabelas: `municipios`, `rural_properties`, `dados_ambientais`, `dados_produtivos`, `rural_vertices`
  - Papel: cadastro rural, SIGEF/INCRA, CAR, CCIR e perímetro georreferenciado.
- `components/SigefSearchModal.tsx`
  - Tabelas: `rural_properties`, `rural_vertices`
  - Papel: importar ou simular consulta SIGEF para preenchimento assistido.

## 6. Governança e acesso

- `components/UserManagement.tsx`
  - Tabelas: `users`, `user_groups`, `group_permissions`
  - Papel: RBAC, perfis e permissões.
- `contexts/AuthContext.tsx`
  - Tabelas: `users`, `security_audit_logs`
  - Papel: autenticação, sessão e recuperação do usuário logado.

## 7. Legislação e inteligência

- `components/LegislationModule.tsx`
  - Tabelas: `legislation_library`, `territory_zones`
  - Papel: base normativa e consulta por vínculo territorial.
- `services/geminiService.ts`
  - Tabelas: `ai_analyses`, `security_audit_logs`
  - Papel: chamar a Aisha via backend e registrar a rastreabilidade.

## 8. Ordem sugerida de integração

1. `TerritoryManager` e `LotEditor`
2. `FamilyManager`
3. `ProcessList`
4. `GEDModule`
5. `RuralModule`
6. `ConflictModule`
7. `LegislationModule` e `VirtualAnalyst`

## 9. Observação técnica

As tabelas novas foram criadas sem remover as estruturas já usadas pelo backend atual. Isso permite migrar módulo por módulo, mantendo o sistema operacional durante a transição.