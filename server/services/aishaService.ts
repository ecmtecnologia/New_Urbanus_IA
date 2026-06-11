import { GoogleGenAI, Type } from '@google/genai';
import { env } from '../env';

let aiClient: GoogleGenAI | null = null;

function getAishaClient(): GoogleGenAI {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  return aiClient;
}

function buildPrompt(processData: unknown, modelType: 'fast' | 'deep'): string {
  return `
Voce e AISHA v1.2, inteligencia juridica e urbanistica senior da plataforma Urbanus IA.

CONTEXTO AMPLIADO DO LOTE (10 PILARES):
${JSON.stringify(processData)}

SUA TAREFA:
Realizar uma Auditoria Multidimensional de Lote baseada na Lei 13.465/17.
MODO DE OPERACAO: ${modelType === 'deep' ? 'ANALISE PROFUNDA (Raciocinio Complexo)' : 'ANALISE RAPIDA (Triagem)'}

NOVOS PROTOCOLOS DE ANALISE (v1.2):
1. CONFORMIDADE TERRITORIAL: compare REGISTRO CARTORIAL x INSCRICAO MUNICIPAL e reporte divergencias.
2. PARAMETROS URBANISTICOS: analise zoneamento (gabarito, taxa de ocupacao, permeabilidade) e aponte inconformidades.
3. INFRAESTRUTURA E CONSOLIDACAO: verifique agua/energia/esgoto para fundamentacao REURB.
4. ANALISE FUNDIARIA E VINCULO: avalie modo de aquisicao e tempo de ocupacao, destacando riscos.
5. GEO-PROCESSAMENTO: valide coerencia de coordenadas e perimetro do nucleo.
6. PROTOCOLO RURAL (REURB-R): CAR, SIGEF, APP, Reserva Legal, Modulo Fiscal e georreferenciamento INCRA.

RETORNE SOMENTE JSON no schema definido.
`.trim();
}

export async function analyzeWithAisha(processData: unknown, modelType: 'fast' | 'deep') {
  const ai = getAishaClient();
  const modelName = modelType === 'deep' ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model: modelName,
    contents: buildPrompt(processData, modelType),
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          confidenceScore: { type: Type.NUMBER },
          priorityScore: { type: Type.NUMBER },
          reasoningTree: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                status: { type: Type.STRING },
                detail: { type: Type.STRING },
              },
            },
          },
          prediction: {
            type: Type.OBJECT,
            properties: {
              officeName: { type: Type.STRING },
              estimatedDays: { type: Type.NUMBER },
              riskOfDevolution: { type: Type.NUMBER },
              historicalBottlenecks: { type: Type.ARRAY, items: { type: Type.STRING } },
              criticalPath: { type: Type.STRING },
              impactIfFixed: { type: Type.NUMBER },
            },
          },
          audit: {
            type: Type.OBJECT,
            properties: {
              citationFederal: { type: Type.ARRAY, items: { type: Type.STRING } },
              citationMunicipal: { type: Type.ARRAY, items: { type: Type.STRING } },
              justification: { type: Type.STRING },
              fiscalizationRisk: { type: Type.STRING },
              consolidatedStatus: { type: Type.BOOLEAN },
            },
          },
          suggestedCorrection: { type: Type.STRING },
          humanFeedbackRequired: { type: Type.BOOLEAN },
        },
      },
    },
  });

  if (!response.text) {
    throw new Error('AISHA returned an empty response.');
  }

  return JSON.parse(response.text);
}
