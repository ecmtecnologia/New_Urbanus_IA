
import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Users, 
  FileText, 
  Phone, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  CheckCircle2,
  Paperclip,
  ChevronDown,
  PenTool,
  Eraser
} from 'lucide-react';
import { createOccupant, deleteOccupant, listOccupants, updateOccupant, uploadOccupantDocument, uploadOccupantGedDocumentVersion, listOccupantGedDocumentVersions } from '../services/familyService';

type TabType = 'RESPONSAVEL' | 'ENDERECO' | 'MEMBROS' | 'DOCUMENTOS' | 'CONTATOS';

interface FamilyManagerProps {
  onCancel?: () => void;
  initialProcessId?: string | null;
}

const FamilyManager: React.FC<FamilyManagerProps> = ({ onCancel, initialProcessId = null }) => {
  const [activeTab, setActiveTab] = useState<TabType>('RESPONSAVEL');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [occupantId, setOccupantId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State Unificado para o Ocupante
  const [familyData, setFamilyData] = useState({
    responsavel: {
      nome: 'Maria da Silva Oliveira',
      cpf: '123.456.789-00',
      rg: '123456 SSP/MA',
      nascimento: '1985-05-12',
      estadoCivil: 'União Estável',
      renda: '1412',
      integrantes: '4',
      nis: '123.45678.90-1',
      escolaridade: 'Médio',
      profissao: 'Vendedora Autônoma',
      conjuge: {
        nome: 'João Carlos Pereira',
        cpf: '333.222.111-00',
        rg: '987654 SSP/MA',
        profissao: '',
        renda: ''
      },
      modalidade: 'REURB-S (Social)',
      status: 'Ativo'
    },
    endereco: {
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: '',
      bairro: 'Vila Sul',
      cep: '65000-000',
      cidade: 'São Luís',
      estado: 'MA'
    },
    membros: [] as any[],
    documentos: [] as any[],
    contatos: [
      { id: '1', telefone: '(98) 98888-7777', email: 'maria@email.com' }
    ]
  });

  // States para Formulários de Listas
  const [newMember, setNewMember] = useState({ nome: '', parentesco: '', cpf: '', nascimento: '' });
  const [newDoc, setNewDoc] = useState({ tipo: '', numero: '', arquivo: null as any });
  const [newContact, setNewContact] = useState({ telefone: '', email: '' });
  const [documentVersions, setDocumentVersions] = useState<Record<string, any[]>>({});
  const [loadingVersionsFor, setLoadingVersionsFor] = useState<string | null>(null);

  const handleLoadVersions = async (documentId: string, gedDocumentId?: string) => {
    if (!occupantId || !gedDocumentId) {
      return;
    }

    try {
      setLoadingVersionsFor(documentId);
      const versions = await listOccupantGedDocumentVersions(occupantId, gedDocumentId);
      setDocumentVersions((prev) => ({
        ...prev,
        [documentId]: versions,
      }));
    } catch (error: any) {
      alert(`Falha ao carregar histórico de versões: ${error?.message ?? 'erro desconhecido'}`);
    } finally {
      setLoadingVersionsFor(null);
    }
  };

  const handleUploadNewVersion = async (documentId: string, gedDocumentId?: string) => {
    if (!occupantId) {
      alert('Cadastro da família não encontrado.');
      return;
    }

    if (!gedDocumentId) {
      alert('Documento sem vínculo GED para versionar.');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.png,.jpg,.jpeg';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const result = await uploadOccupantGedDocumentVersion(occupantId, gedDocumentId, file);
        setFamilyData({
          ...familyData,
          documentos: familyData.documentos.map((doc) => {
            if (doc.id !== documentId) return doc;
            return {
              ...doc,
              fileName: result.file_name,
              fileUrl: result.file_url,
              gedStatus: result.ged_status,
              gedCurrentVersion: result.ged_current_version,
            };
          }),
        });
        alert('Nova versão enviada com sucesso ao GED.');
      } catch (error: any) {
        alert(`Falha ao enviar nova versão: ${error?.message ?? 'erro desconhecido'}`);
      }
    };

    input.click();
  };

  const handleAttachDocument = async () => {
    if (!newDoc.tipo) {
      alert('Selecione o tipo de documento.');
      return;
    }

    if (!occupantId) {
      alert('Salve o cadastro da família primeiro para habilitar upload real de documentos.');
      return;
    }

    if (!newDoc.arquivo) {
      alert('Selecione um arquivo para upload.');
      return;
    }

    try {
      const uploaded = await uploadOccupantDocument(occupantId, newDoc.arquivo, {
        document_type: newDoc.tipo,
        document_number: newDoc.numero,
      });

      setFamilyData({
        ...familyData,
        documentos: [
          {
            id: uploaded.id,
            tipo: uploaded.document_type,
            numero: uploaded.document_number ?? '',
            arquivo: null,
            fileName: uploaded.file_name,
            fileUrl: uploaded.file_url,
            gedDocumentId: uploaded.ged_document_id,
            gedStatus: uploaded.ged_status,
            gedCurrentVersion: uploaded.ged_current_version,
          },
          ...familyData.documentos,
        ],
      });
      setNewDoc({ tipo: '', numero: '', arquivo: null });
    } catch (error: any) {
      alert(`Falha no upload do documento: ${error?.message ?? 'erro desconhecido'}`);
    }
  };

  useEffect(() => {
    const loadInitialOccupant = async () => {
      try {
        const items = await listOccupants(initialProcessId ? { process_id: initialProcessId } : undefined);
        if (!items.length) {
          return;
        }

        const first = items[0] as any;
        setOccupantId(first.id ?? null);
        setFamilyData((prev) => ({
          ...prev,
          responsavel: {
            ...prev.responsavel,
            nome: first.name ?? prev.responsavel.nome,
            cpf: first.cpf ?? prev.responsavel.cpf,
            rg: first.rg ?? prev.responsavel.rg,
            nascimento: first.birth_date ?? prev.responsavel.nascimento,
            estadoCivil: first.civil_status ?? prev.responsavel.estadoCivil,
            renda: first.monthly_income ? String(first.monthly_income) : prev.responsavel.renda,
            integrantes: first.family_members_count ? String(first.family_members_count) : prev.responsavel.integrantes,
            nis: first.nis_number ?? prev.responsavel.nis,
            escolaridade: first.education_level ?? prev.responsavel.escolaridade,
            profissao: first.profession ?? prev.responsavel.profissao,
            conjuge: {
              ...prev.responsavel.conjuge,
              ...(first.spouse_data ?? {}),
            },
          },
          membros: (first.members ?? []).map((member: any) => ({
            id: member.id,
            nome: member.name,
            parentesco: member.relation,
            cpf: member.cpf ?? '',
            nascimento: member.birth_date ?? '',
          })),
          contatos: [
            ...((first.contacts ?? []).map((contact: any) => ({
              id: contact.id,
              telefone: contact.phone ?? '',
              email: contact.email ?? '',
            }))),
            ...((first.contacts ?? []).length === 0 ? [{ id: '1', telefone: first.phone ?? '', email: first.email ?? '' }] : []),
          ],
          documentos: (first.documents ?? []).map((document: any) => ({
            id: document.id,
            tipo: document.document_type,
            numero: document.document_number ?? '',
            arquivo: null,
            fileName: document.file_name,
            fileUrl: document.file_url,
            gedDocumentId: document.ged_document_id,
            gedStatus: document.ged_status,
            gedCurrentVersion: document.ged_current_version,
          })),
          endereco: {
            logradouro: first.address?.street ?? prev.endereco.logradouro,
            numero: first.address?.number ?? prev.endereco.numero,
            complemento: first.address?.complement ?? prev.endereco.complemento,
            bairro: first.address?.neighborhood ?? prev.endereco.bairro,
            cep: first.address?.zip_code ?? prev.endereco.cep,
            cidade: first.address?.city ?? prev.endereco.cidade,
            estado: first.address?.state ?? prev.endereco.estado,
          },
        }));
      } catch (error) {
        console.error('Erro ao carregar família inicial:', error);
      }
    };

    void loadInitialOccupant();
  }, []);

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      const primaryContact = familyData.contatos[0] ?? { telefone: '', email: '' };
      const payload = {
        process_id: initialProcessId ?? undefined,
        name: familyData.responsavel.nome,
        cpf: familyData.responsavel.cpf,
        rg: familyData.responsavel.rg,
        birth_date: familyData.responsavel.nascimento,
        civil_status: familyData.responsavel.estadoCivil,
        monthly_income: familyData.responsavel.renda ? Number(familyData.responsavel.renda) : undefined,
        nis_number: familyData.responsavel.nis,
        profession: familyData.responsavel.profissao,
        education_level: familyData.responsavel.escolaridade,
        family_members_count: familyData.responsavel.integrantes ? Number(familyData.responsavel.integrantes) : undefined,
        spouse_data: familyData.responsavel.conjuge,
        phone: primaryContact.telefone,
        email: primaryContact.email,
        members: familyData.membros.map((member) => ({
          name: member.nome,
          relation: member.parentesco,
          cpf: member.cpf,
          birth_date: member.nascimento,
        })),
        contacts: familyData.contatos.map((contact, index) => ({
          phone: contact.telefone,
          email: contact.email,
          is_primary: index === 0,
        })),
        documents: familyData.documentos.map((document) => ({
          document_type: document.tipo,
          document_number: document.numero,
          file_name: document.fileName ?? document.arquivo?.name,
          file_url: document.fileUrl,
        })),
        address: {
          street: familyData.endereco.logradouro,
          number: familyData.endereco.numero,
          complement: familyData.endereco.complemento,
          neighborhood: familyData.endereco.bairro,
          zip_code: familyData.endereco.cep,
          city: familyData.endereco.cidade,
          state: familyData.endereco.estado,
        },
      };

      if (occupantId) {
        const updated = await updateOccupant(occupantId, payload);
        setOccupantId(updated.id ?? occupantId);
      } else {
        const created = await createOccupant(payload);
        setOccupantId(created.id ?? null);
      }

      alert('Alterações salvas com sucesso na Base de Dados Unificada!');
      if (onCancel) onCancel();
    } catch (error: any) {
      alert(`Falha ao salvar família: ${error?.message ?? 'erro desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFamily = async () => {
    if (!occupantId) {
      alert('Nenhum cadastro persistido para excluir.');
      return;
    }

    const confirmed = confirm('Deseja realmente excluir este cadastro familiar? Esta ação não pode ser desfeita.');
    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteOccupant(occupantId);
      alert('Cadastro familiar excluído com sucesso.');
      if (onCancel) onCancel();
    } catch (error: any) {
      alert(`Falha ao excluir família: ${error?.message ?? 'erro desconhecido'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Signature Canvas Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = signatureCanvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.closePath();
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      offsetX: (clientX - rect.left) * scaleX,
      offsetY: (clientY - rect.top) * scaleY
    };
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = () => {
    setShowSignatureModal(false);
    alert('Assinatura digital capturada com sucesso!');
  };

  const renderResponsavel = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nome do Responsável</label>
          <input 
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none shadow-sm"
            value={familyData.responsavel.nome}
            onChange={(e) => setFamilyData({...familyData, responsavel: {...familyData.responsavel, nome: e.target.value}})}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">CPF</label>
            <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.responsavel.cpf} readOnly />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">RG</label>
            <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.responsavel.rg} readOnly />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Data de Nascimento</label>
            <div className="relative">
              <input type="date" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none appearance-none" value={familyData.responsavel.nascimento} readOnly />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Estado Civil</label>
            <div className="relative">
              <select 
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none appearance-none"
                value={familyData.responsavel.estadoCivil}
                onChange={(e) => setFamilyData({...familyData, responsavel: {...familyData.responsavel, estadoCivil: e.target.value}})}
              >
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="União Estável">União Estável</option>
                <option value="Viúvo(a)">Viúvo(a)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Renda Familiar Mensal (R$)</label>
            <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.responsavel.renda} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nº de Integrantes que Residem</label>
            <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.responsavel.integrantes} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nº do NIS / PIS / PASEP</label>
            <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.responsavel.nis} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Escolaridade</label>
            <div className="relative">
              <select className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none appearance-none">
                <option>{familyData.responsavel.escolaridade}</option>
                <option>Fundamental</option>
                <option>Médio</option>
                <option>Superior</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Profissão / Atividade</label>
          <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.responsavel.profissao} />
        </div>

        {/* Card do Cônjuge - Fiel ao visual verde claro */}
        {familyData.responsavel.estadoCivil !== 'Solteiro(a)' && (
          <div className="bg-emerald-50/40 border border-emerald-100 rounded-[2rem] p-8 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">👩‍❤️‍👨</span>
                <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest">Dados do Cônjuge</h4>
             </div>
             <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-emerald-700/50 uppercase mb-2 ml-1">Nome do Cônjuge</label>
                  <input className="w-full px-5 py-4 bg-white border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.responsavel.conjuge.nome} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-emerald-700/50 uppercase mb-2 ml-1">CPF do Cônjuge</label>
                    <input className="w-full px-5 py-4 bg-white border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.responsavel.conjuge.cpf} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-emerald-700/50 uppercase mb-2 ml-1">RG do Cônjuge</label>
                    <input className="w-full px-5 py-4 bg-white border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.responsavel.conjuge.rg} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-emerald-700/50 uppercase mb-2 ml-1">Profissão do Cônjuge</label>
                    <input 
                      className="w-full px-5 py-4 bg-white border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" 
                      value={familyData.responsavel.conjuge.profissao} 
                      onChange={(e) => setFamilyData({...familyData, responsavel: {...familyData.responsavel, conjuge: {...familyData.responsavel.conjuge, profissao: e.target.value}}})}
                      placeholder="Ex: Auxiliar Administrativo"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-emerald-700/50 uppercase mb-2 ml-1">Renda do Cônjuge (R$)</label>
                    <input 
                      className="w-full px-5 py-4 bg-white border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" 
                      value={familyData.responsavel.conjuge.renda} 
                      onChange={(e) => setFamilyData({...familyData, responsavel: {...familyData.responsavel, conjuge: {...familyData.responsavel.conjuge, renda: e.target.value}}})}
                      placeholder="Ex: 1412"
                    />
                  </div>
                </div>
             </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 pt-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Modalidade Sugerida</label>
            <div className="relative">
              <select className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none appearance-none">
                <option>{familyData.responsavel.modalidade}</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Status do Processo</label>
            <div className="relative">
              <select className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none appearance-none">
                <option>{familyData.responsavel.status}</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEndereco = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Logradouro</label>
          <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.endereco.logradouro} onChange={(e) => setFamilyData({ ...familyData, endereco: { ...familyData.endereco, logradouro: e.target.value } })} />
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Número</label>
            <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.endereco.numero} onChange={(e) => setFamilyData({ ...familyData, endereco: { ...familyData.endereco, numero: e.target.value } })} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Complemento</label>
            <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.endereco.complemento} onChange={(e) => setFamilyData({ ...familyData, endereco: { ...familyData.endereco, complemento: e.target.value } })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Bairro</label>
            <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.endereco.bairro} onChange={(e) => setFamilyData({ ...familyData, endereco: { ...familyData.endereco, bairro: e.target.value } })} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">CEP</label>
            <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.endereco.cep} onChange={(e) => setFamilyData({ ...familyData, endereco: { ...familyData.endereco, cep: e.target.value } })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Cidade</label>
            <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.endereco.cidade} onChange={(e) => setFamilyData({ ...familyData, endereco: { ...familyData.endereco, cidade: e.target.value } })} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Estado</label>
            <input className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold shadow-sm outline-none" value={familyData.endereco.estado} onChange={(e) => setFamilyData({ ...familyData, endereco: { ...familyData.endereco, estado: e.target.value } })} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembros = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
            <Plus className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Adicionar Integrante à Família</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nome Completo</label>
            <input 
              className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-slate-700 font-bold shadow-sm outline-none" 
              placeholder="Ex: João da Silva"
              value={newMember.nome}
              onChange={(e) => setNewMember({...newMember, nome: e.target.value})}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Grau de Parentesco</label>
            <div className="relative">
              <select 
                className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-slate-700 font-bold shadow-sm outline-none appearance-none"
                value={newMember.parentesco}
                onChange={(e) => setNewMember({...newMember, parentesco: e.target.value})}
              >
                <option value="">Selecione...</option>
                <option>Filho(a)</option>
                <option>Enteado(a)</option>
                <option>Pai/Mãe</option>
                <option>Irmão/Irmã</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">CPF</label>
            <input 
              className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-slate-700 font-bold shadow-sm outline-none" 
              placeholder="000.000.000-00"
              value={newMember.cpf}
              onChange={(e) => setNewMember({...newMember, cpf: e.target.value})}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Data de Nascimento</label>
            <input 
              type="date"
              className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-slate-700 font-bold shadow-sm outline-none"
              value={newMember.nascimento}
              onChange={(e) => setNewMember({...newMember, nascimento: e.target.value})}
            />
          </div>
        </div>
        
        <button 
          onClick={() => {
            if (newMember.nome) {
              setFamilyData({...familyData, membros: [...familyData.membros, {...newMember, id: Date.now().toString()}]});
              setNewMember({ nome: '', parentesco: '', cpf: '', nascimento: '' });
            }
          }}
          className="w-full md:w-auto mt-8 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20"
        >
          Adicionar Membro
        </button>
      </div>

      <div className="min-h-[200px] border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-10">
        {familyData.membros.length === 0 ? (
          <>
            <Users className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhum integrante adicionado</p>
          </>
        ) : (
          <div className="w-full space-y-4">
             {familyData.membros.map(m => (
               <div key={m.id} className="w-full p-6 bg-white border border-slate-100 rounded-3xl flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                        {m.nome[0]}
                     </div>
                     <div>
                        <p className="font-bold text-slate-900">{m.nome}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">{m.parentesco} • {m.cpf}</p>
                     </div>
                  </div>
                  <button onClick={() => setFamilyData({...familyData, membros: familyData.membros.filter(x => x.id !== m.id)})} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-all">
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderDocumentos = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-8">
        <h4 className="text-sm font-black text-slate-800 mb-8 ml-1">Anexar Documento Digitalizado</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tipo de Documento</label>
            <div className="relative">
              <select 
                className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-slate-700 font-bold shadow-sm outline-none appearance-none"
                value={newDoc.tipo}
                onChange={(e) => setNewDoc({...newDoc, tipo: e.target.value})}
              >
                <option value="">Selecione o Tipo...</option>
                <option>RG / Identidade</option>
                <option>CPF</option>
                <option>Certidão Nascimento</option>
                <option>Certidão Casamento</option>
                <option>Comprovante Renda</option>
                <option>Comprovante Residência</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nº Documento</label>
            <input 
              className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-slate-700 font-bold shadow-sm outline-none" 
              placeholder="Opcional"
              value={newDoc.numero}
              onChange={(e) => setNewDoc({...newDoc, numero: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Arquivo (PDF, JPG, PNG)</label>
            <div className="flex items-center gap-3">
               <label className="flex-1 px-5 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-emerald-100 transition-all flex items-center justify-center gap-2">
                  <Paperclip className="w-3 h-3" /> Escolher Ficheiro
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setNewDoc({ ...newDoc, arquivo: file });
                    }}
                  />
               </label>
               <span className="text-[8px] text-slate-400 italic">{newDoc.arquivo?.name ?? 'Nenhum selecionado'}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-8">
          <button 
            onClick={handleAttachDocument}
            className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20"
          >
            Upload no GED
          </button>
        </div>
      </div>

      <div className="min-h-[200px] border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-10">
        {familyData.documentos.length === 0 ? (
          <>
            <div className="w-12 h-16 bg-slate-100 rounded-lg flex flex-col gap-1 p-3 mb-4 opacity-50">
               <div className="h-1 bg-slate-300 w-full rounded"></div>
               <div className="h-1 bg-slate-300 w-1/2 rounded"></div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhum documento digitalizado</p>
          </>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
             {familyData.documentos.map(d => (
              <div key={d.id} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                     <FileText className="w-6 h-6 text-emerald-600" />
                     <div>
                        <p className="font-bold text-slate-900">{d.tipo}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Nº {d.numero || 'S/N'}</p>
                        {d.fileName && <p className="text-[10px] text-slate-400">{d.fileName}</p>}
                        {d.gedDocumentId && (
                          <p className="text-[10px] text-blue-600 font-black uppercase">
                            GED {d.gedStatus ?? 'Pendente'} | v{d.gedCurrentVersion ?? 1}
                          </p>
                        )}
                        {d.fileUrl && (
                          <a
                            href={d.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-black text-emerald-600 hover:underline uppercase"
                          >
                            Visualizar arquivo
                          </a>
                        )}
                     </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setFamilyData({...familyData, documentos: familyData.documentos.filter(x => x.id !== d.id)})} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-all">
                         <Trash2 className="w-4 h-4" />
                      </button>
                      {d.gedDocumentId && (
                        <button
                          onClick={() => handleUploadNewVersion(d.id, d.gedDocumentId)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="Enviar nova versão"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                      )}
                      {d.gedDocumentId && (
                        <button
                          onClick={() => handleLoadVersions(d.id, d.gedDocumentId)}
                          className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all"
                          title="Ver histórico"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {loadingVersionsFor === d.id && (
                    <p className="mt-3 text-[10px] text-slate-400">Carregando histórico...</p>
                  )}
                  {(documentVersions[d.id]?.length ?? 0) > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                      {documentVersions[d.id].map((version: any) => (
                        <div key={version.id} className="flex items-center justify-between gap-3">
                          <p>
                            v{version.version_number} - {version.file_name} - {new Date(version.created_at).toLocaleString('pt-BR')}
                          </p>
                          {version.file_url && (
                            <a
                              href={version.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-black text-emerald-600 hover:underline uppercase"
                            >
                              Download
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderContatos = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowSignatureModal(true)}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
        >
          <PenTool className="w-4 h-4" />
          Coletar Assinatura Digital
        </button>
      </div>

      <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-10">
        <h4 className="text-sm font-black text-slate-800 mb-8 ml-1">Adicionar Contato</h4>
        <div className="flex flex-wrap md:flex-nowrap items-end gap-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Telefone / Whatsapp</label>
            <input 
              className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-slate-700 font-bold shadow-sm outline-none" 
              placeholder="(00) 00000-0000"
              value={newContact.telefone}
              onChange={(e) => setNewContact({...newContact, telefone: e.target.value})}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">E-mail</label>
            <input 
              className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-slate-700 font-bold shadow-sm outline-none" 
              placeholder="email@exemplo.com"
              value={newContact.email}
              onChange={(e) => setNewContact({...newContact, email: e.target.value})}
            />
          </div>
          <button 
            onClick={() => {
              if (newContact.telefone || newContact.email) {
                setFamilyData({...familyData, contatos: [...familyData.contatos, {...newContact, id: Date.now().toString()}]});
                setNewContact({ telefone: '', email: '' });
              }
            }}
            className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 whitespace-nowrap"
          >
            Salvar Contato
          </button>
        </div>
      </div>

      <div className="space-y-4">
         {familyData.contatos.map(c => (
           <div key={c.id} className="p-8 bg-white border border-slate-100 rounded-[2rem] flex justify-between items-center shadow-sm group hover:border-emerald-200 transition-all">
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-900">{c.telefone || 'Sem telefone'}</p>
                    <p className="text-xs text-slate-400 font-medium">{c.email || 'Sem e-mail'}</p>
                 </div>
              </div>
              <button onClick={() => setFamilyData({...familyData, contatos: familyData.contatos.filter(x => x.id !== c.id)})} className="p-3 text-rose-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                 <X className="w-5 h-5" />
              </button>
           </div>
         ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-emerald-500 animate-in fade-in duration-500">
      {/* Header Fiel à barra verde superior */}
      <div className="h-3 bg-emerald-500 w-full" />
      
      <div className="p-10 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gerenciar Família</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Base de Dados Unificada</p>
        </div>
        
        {/* Navigation Tabs - Fiel ao visual arredondado cinza */}
        <div className="bg-slate-50 p-1.5 rounded-2xl flex flex-wrap gap-1 shadow-inner">
          {[
            { id: 'RESPONSAVEL', label: 'Responsável', icon: User },
            { id: 'ENDERECO', label: 'Endereço', icon: MapPin },
            { id: 'MEMBROS', label: 'Membros', icon: Users },
            { id: 'DOCUMENTOS', label: 'Documentos', icon: FileText },
            { id: 'CONTATOS', label: 'Contatos', icon: Phone },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-emerald-600 shadow-md shadow-slate-200' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-10 pt-6">
        {activeTab === 'RESPONSAVEL' && renderResponsavel()}
        {activeTab === 'ENDERECO' && renderEndereco()}
        {activeTab === 'MEMBROS' && renderMembros()}
        {activeTab === 'DOCUMENTOS' && renderDocumentos()}
        {activeTab === 'CONTATOS' && renderContatos()}
      </div>

      {/* Footer Fiel às imagens com botão verde flutuante */}
      <div className="p-10 pt-4 flex justify-end items-center gap-8 border-t border-slate-50">
        <button
          onClick={handleDeleteFamily}
          disabled={!occupantId || isDeleting || isSaving}
          className="px-6 py-3 bg-rose-50 text-rose-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? 'Excluindo...' : 'Excluir Família'}
        </button>
        <button 
          onClick={onCancel}
          className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
        >
          Cancelar
        </button>
        <button 
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-10 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/30 flex items-center gap-2"
        >
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      {/* Modal de Assinatura Digital */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Assinatura Digital</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coleta Biométrica</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSignatureModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center gap-4">
              <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden relative group">
                <canvas
                  ref={signatureCanvasRef}
                  width={400}
                  height={200}
                  className="w-full h-[200px] cursor-crosshair touch-none bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <div className="absolute bottom-2 right-2 opacity-50 pointer-events-none text-[8px] font-black text-slate-300 uppercase">
                  Área de Assinatura
                </div>
              </div>
              
              <p className="text-center text-xs text-slate-500 max-w-xs">
                Utilize o mouse ou o dedo para assinar no campo acima. Esta assinatura será vinculada legalmente ao processo.
              </p>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between gap-4">
              <button 
                onClick={clearSignature}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <Eraser className="w-4 h-4" /> Limpar
              </button>
              <button 
                onClick={saveSignature}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirmar Assinatura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyManager;
