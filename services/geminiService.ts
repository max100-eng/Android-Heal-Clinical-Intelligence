import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ImageType, AnalysisResult } from "../types";

// Instrucción de sistema para definir el comportamiento del modelo
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
11. ELECTROMIOGRAFÍA (EMG): Análisis de actividad eléctrica muscular.
12. ESPIROMETRÍA: Análisis de FVC, FEV1, relación FEV1/FVC.
13. EEG: Identificación de ondas (alfa, beta, theta, delta).
14. HOLTER: Análisis de ritmo cardíaco extendido.

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
    case ImageType.EMG: return "Interpreta este trazado de Electromiografía (EMG).";
    case ImageType.SPIROMETRY: return "Analiza estos resultados de Espirometría.";
    case ImageType.EEG: return "Analiza este trazado de EEG.";
    case ImageType.HOLTER: return "Interpreta este informe de Holter cardíaco.";
    default: return "Realiza una interpretación clínica exhaustiva.";
  }
};

// Inicialización del cliente de IA con la clave del archivo .env.local
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

export const analyzeImage = async (
  base64Data: string,
  mimeType: string,
  imageType: ImageType
): Promise<AnalysisResult> => {
  if (!base64Data) throw new Error("No hay datos de imagen para analizar.");
  if (!process.env.API_KEY) throw new Error("API_KEY no configurada en el servidor.");

  // Usamos gemini-1.5-pro que es el modelo más estable para análisis médico visual
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  // Configuración de la generación con esquema JSON estricto
  const generationConfig = {
    temperature: 0.1, // Baja temperatura para mayor precisión médica
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        modalityDetected: { type: SchemaType.STRING },
        clinicalFindings: { type: SchemaType.STRING },
        differentialDiagnoses: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              condition: { type: SchemaType.STRING },
              probability: { type: SchemaType.STRING, enum: ["High", "Moderate", "Low"] },
              reasoning: { type: SchemaType.STRING }
            },
            required: ["condition", "probability", "reasoning"]
          }
        },
        suggestedFollowUp: { type: SchemaType.STRING },
        confidenceScore: { type: SchemaType.NUMBER },
        urgentAlert: { type: SchemaType.BOOLEAN },
      },
      required: ["modalityDetected", "clinicalFindings", "differentialDiagnoses", "suggestedFollowUp", "confidenceScore", "urgentAlert"]
    },
  };

  const result = await model.generateContent({
    contents: [{
      role: "user",
      parts: [
        { inlineData: { data: base64Data, mimeType: mimeType.split(';')[0] || 'image/png' } },
        { text: getModalityPrompt(imageType) }
      ]
    }],
    generationConfig
  });

  const response = await result.response;
  const text = response.text();
  
  if (!text) throw new Error("Respuesta no válida.");
  
  try {
    return JSON.parse(text) as AnalysisResult;
  } catch (e) {
    console.error("Error parseando JSON:", text);
    throw new Error("Error al procesar el informe clínico estructurado.");
  }
};