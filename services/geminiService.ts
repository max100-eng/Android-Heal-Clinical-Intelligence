
import { GoogleGenAI, Type } from "@google/genai";
import { ImageType, AnalysisResult, ChatMessage } from "../types";

const SYSTEM_INSTRUCTION = `
Eres "Android Heal", el núcleo de Inteligencia Clínica de grado hospitalario. Tu misión es asistir a especialistas en la interpretación de pruebas diagnósticas complejas.

PROTOCOLOS DE ANÁLISIS POR MODALIDAD:
1. ECG: Interpretación sistemática (Frecuencia, Ritmo, Eje, PR, QRS, ST-T, QTc). Detección de arritmias, bloqueos e isquemia.
2. RX (Rayos X): Análisis mediante método ABCDE. Evaluación de opacidades, lucencias, siluetas y estructuras óseas.
3. TC (Tomografía Computarizada): Evaluación de densidades (Hounsfield), anatomía segmentaria y realce de contraste si aplica. Identificación de masas, hemorragias o procesos inflamatorios.
4. RMN (Resonancia Magnética): Diferenciación de intensidades en T1, T2 y FLAIR. Análisis de edema, captación de gadolinio y morfología de tejidos blandos.
5. ECO (Ecografía/Ultrasonido): Evaluación de ecogenicidad (hiperecoico, isoecoico, hipoecoico, anecoico), sombras acústicas, refuerzo posterior y Doppler.
6. RETINA: Evaluación de fondo de ojo. Clasificación de Retinopatía Diabética, Glaucoma (cup/disk ratio) y Degeneración Macular.
7. DERMATOSCOPIA: Análisis morfológico (Asimetría, Bordes, Color, Estructuras). Clasificación de riesgo de melanoma y lesiones benignas.
8. URIANÁLISIS (Urostick 10): Lectura obligatoria de los 10 parámetros estándar: Leucocitos, Nitritos, Urobilinógeno, Proteínas, pH, Sangre, Gravedad Específica, Cetonas, Bilirrubina y Glucosa.
9. TOXICOLOGÍA: Validación de línea de Control y Test para positividad de sustancias.
10. MEDICINA NUCLEAR: Interpretación de gammagrafías, PET/CT o SPECT. Análisis de captación de trazadores (Hot spots / Cold spots) y metabolismo fisiológico vs patológico.

REGLAS DE RIGOR MÉDICO:
- IDIOMA: Responde exclusivamente en ESPAÑOL.
- EVIDENCIA: Describe hallazgos visuales específicos antes de concluir diagnósticos.
- DIFERENCIALES: Obligatorio incluir diagnósticos diferenciales con razonamiento clínico basado en la imagen.
- URGENCIA: Activa 'urgentAlert' inmediatamente ante hallazgos de compromiso vital (ej: Elevación ST, Neumotórax, Hemorragia Intracraneal, Toxicidad aguda).
`;

const getModalityPrompt = (type: ImageType): string => {
  switch (type) {
    case ImageType.ECG:
      return "Analiza este ECG. Evalúa ritmo, frecuencia, eje e intervalos. Busca específicamente supradesnivel o infradesnivel del segmento ST. Describe hallazgos morfológicos.";
    case ImageType.RX:
      return "Analiza esta radiografía (RX). Describe sistemáticamente campos pulmonares, silueta cardiaca, diafragma y estructuras óseas visibles. Busca infiltrados, fracturas o nódulos.";
    case ImageType.TC:
      return "Analiza esta imagen de Tomografía Computarizada (TC). Identifica la región anatómica, evalúa densidades y busca anomalías estructurales, colecciones o masas. Indica si hay signos de isquemia, hemorragia o inflamación.";
    case ImageType.RMN:
      return "Analiza esta Resonancia Magnética (RMN). Identifica la secuencia (T1, T2, FLAIR) y describe las intensidades de señal en los tejidos. Busca lesiones desmielinizantes, tumores o anomalías vasculares.";
    case ImageType.ECO:
      return "Interpreta esta imagen de Ecografía (ECO). Describe la ecogenicidad de los órganos o estructuras visibles. Busca cálculos, quistes, masas o alteraciones del flujo si hay Doppler.";
    case ImageType.RETINA:
      return "Evalúa esta imagen de retina. Analiza la papila óptica, mácula y arcadas vasculares. Busca exudados, hemorragias o signos de neuropatía óptica.";
    case ImageType.DERMATOSCOPY:
      return "Analiza esta lesión dermatoscópica. Evalúa la red pigmentaria y estructuras vasculares. Indica riesgo de malignidad según criterios internacionales.";
    case ImageType.URINALYSIS:
      return "Interpreta esta tira reactiva de orina según el modelo Urostick 10 parámetros. Identifica y cuantifica: Leucocitos, Nitritos, Urobilinógeno, Proteínas, pH, Sangre, Gravedad Específica, Cetonas, Bilirrubina y Glucosa.";
    case ImageType.TOXICOLOGY:
      return "Analiza este panel de toxicología. Verifica la línea de control (C) para validez y determina positividad si falta la línea de Test (T).";
    case ImageType.NUCLEAR_MEDICINE:
      return "Analiza esta imagen de Medicina Nuclear (PET/SPECT/Gammagrafía). Describe la distribución del radiofármaco. Identifica focos de hipercaptación (hot spots) o hipocaptación patológica.";
    default:
      return "Realiza una interpretación clínica exhaustiva de esta prueba diagnóstica.";
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
          urgentAlert: { type: Type.BOOLEAN }
        },
        required: [
          "modalityDetected", 
          "clinicalFindings", 
          "differentialDiagnoses", 
          "suggestedFollowUp", 
          "confidenceScore", 
          "urgentAlert"
        ]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("El motor clínico no devolvió una respuesta válida.");
  
  try {
    return JSON.parse(text) as AnalysisResult;
  } catch (e) {
    console.error("JSON Parsing error:", e, text);
    throw new Error("Error al procesar el informe clínico estructurado.");
  }
};

export const chatWithClinicalAI = async (
  history: ChatMessage[],
  newMessage: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    })),
    config: {
      systemInstruction: "Eres el Consultor Clínico de Android Heal. Responde dudas técnicas basándote en el caso analizado. Sé conciso y profesional. Responde siempre en Español.",
    }
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text;
};
