import { GoogleGenerativeAI } from "@google/generative-ai";
import { ImageType, AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `
Eres "Android Heal", el núcleo de Inteligencia Clínica de grado hospitalario. Tu misión es asistir a especialistas en la interpretación de pruebas diagnósticas complejas.

PROTOCOLOS DE ANÁLISIS POR MODALIDAD:
1. ECG: Interpretación sistemática.
2. RX (Rayos X): Análisis detallado ABCDE.
3. TC: Evaluación de densidades.
4. RMN: Diferenciación de intensidades.
5. ECO: Evaluación de ecogenicidad.
6. RETINA: Evaluación de fondo de ojo.
7. DERMATOSCOPIA: Análisis morfológico ABCDE.
8. URIANÁLISIS: Lectura de 10 parámetros.
9. TOXICOLOGÍA: Validación de panel.
10. MEDICINA NUCLEAR: Interpretación de captación.
11. ELECTROMIOGRAFÍA (EMG): Análisis de actividad eléctrica muscular, potenciales de acción de unidad motora (MUAP), velocidad de conducción nerviosa y signos de denervación o reinervación.
12. ESPIROMETRÍA: Análisis de FVC, FEV1, relación FEV1/FVC (Tiffeneau) y curvas flujo-volumen.
13. EEG (Electroencefalograma): Identificación de ondas (alfa, beta, theta, delta), localización de focos epileptiformes, asimetrías y reactividad.
14. HOLTER: Análisis de ritmo cardíaco extendido (24-48h), cuantificación de extrasístoles, pausas sinusales, variabilidad de la frecuencia cardíaca y correlación con diario de síntomas.

REGLAS DE RIGOR MÉDICO:
- IDIOMA: Responde exclusivamente en ESPAÑOL.
- DIFERENCIALES: Obligatorio.
- URGENCIA: Activa 'urgentAlert' ante hallazgos críticos.
`;

const getModalityPrompt = (type: ImageType): string => {
  switch (type) {
    case ImageType.ECG: return "Analiza este ECG. Evalúa ritmo, frecuencia, eje e intervalos.";
    case ImageType.RX: return "Analiza esta radiografía (RX). Realiza una evaluación sistemática detallada.";
    case ImageType.TC: return "Analiza esta imagen de TC.";
    case ImageType.RMN: return "Analiza esta Resonancia Magnética (RMN).";
    case ImageType.ECO: return "Interpreta esta imagen de Ecografía.";
    case ImageType.RETINA: return "Evalúa esta imagen de retina.";
    case ImageType.DERMATOSCOPY: return "Analiza esta lesión dermatoscópica.";
    case ImageType.URINALYSIS: return "Interpreta esta tira reactiva de orina.";
    case ImageType.TOXICOLOGY: return "Analiza este panel de toxicología.";
    case ImageType.NUCLEAR_MEDICINE: return "Analiza esta imagen de Medicina Nuclear.";
    case ImageType.EMG: return "Interpreta este trazado de Electromiografía (EMG). Identifica posibles radiculopatías, miopatías o neuropatías periféricas.";
    case ImageType.SPIROMETRY: return "Analiza estos resultados de Espirometría. Determina si existe patrón obstructivo, restrictivo o mixto.";
    case ImageType.EEG: return "Analiza este trazado de EEG. Identifica tipos de ondas predominantes, posibles puntas-onda o anomalías focales.";
    case ImageType.HOLTER: return "Interpreta este informe de Holter cardíaco. Analiza eventos arrítmicos significativos.";
    default: return "Realiza una interpretación clínica exhaustiva.";
  }
};

export const analyzeImage = async (
  base64Data: string,
  mimeType: string,
  imageType: ImageType
): Promise<AnalysisResult> => {
  if (!base64Data) throw new Error("No hay datos de imagen para analizar.");
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: mimeType.split(';')[0] || 'image/png' } },
        { text: getModalityPrompt(imageType) }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          modalityDetected: { type: Type.STRING },
          clinicalFindings: { type: Type.STRING },
          differentialDiagnoses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                condition: { type: Type.STRING },
                probability: { type: Type.STRING, enum: ["High", "Moderate", "Low"] },
                reasoning: { type: Type.STRING }
              },
              required: ["condition", "probability", "reasoning"]
            }
          },
          suggestedFollowUp: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER },
          urgentAlert: { type: Type.BOOLEAN },
        },
        required: ["modalityDetected", "clinicalFindings", "differentialDiagnoses", "suggestedFollowUp", "confidenceScore", "urgentAlert"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Respuesta no válida.");
  
  try {
    return JSON.parse(text) as AnalysisResult;
  } catch (e) {
    throw new Error("Error al procesar el informe clínico estructurado.");
  }
};
