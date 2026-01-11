import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function analyzeImage({
  base64,
  mimeType,
  modality
}: {
  base64: string;
  mimeType: string;
  modality: string;
}) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("API Key de Gemini no configurada");
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Eres un médico especialista en interpretación de imágenes clínicas. Analiza la siguiente imagen de tipo: ${modality}.

Proporciona un análisis clínico estructurado en formato JSON con esta estructura exacta:
{
  "modalityDetected": "${modality}",
  "confidenceScore": 85,
  "urgentAlert": false,
  "clinicalFindings": "Descripción detallada de los hallazgos...",
  "differentialDiagnoses": [
    {"condition": "Diagnóstico 1", "probability": "Alta"},
    {"condition": "Diagnóstico 2", "probability": "Media"}
  ],
  "suggestedFollowUp": "Recomendaciones específicas..."
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType
        }
      },
      prompt
    ]);

    const text = result.response.text();
    
    // Intentar extraer JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("No se pudo parsear la respuesta del modelo");
  } catch (error) {
    console.error("Error en analyzeImage:", error);
    throw error;
  }
}
