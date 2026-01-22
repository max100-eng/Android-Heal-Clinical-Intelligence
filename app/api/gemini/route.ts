import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { base64, mimeType, modality } = await req.json();

    if (!base64 || !mimeType || !modality) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros en la solicitud" }),
        { status: 400 }
      );
    }

    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API Key de Gemini no configurada" }),
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `
Eres un médico especialista en interpretación de imágenes clínicas.
Analiza la imagen enviada (modalidad: ${modality}) y devuelve un JSON con esta estructura:

{
  "modalityDetected": "${modality}",
  "confidenceScore": 85,
  "urgentAlert": false,
  "clinicalFindings": "Descripción detallada...",
  "differentialDiagnoses": [
    {"condition": "Diagnóstico 1", "probability": "Alta"},
    {"condition": "Diagnóstico 2", "probability": "Media"}
  ],
  "suggestedFollowUp": "Recomendaciones..."
}
`;

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

    // Intentar extraer JSON del texto
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: "No se pudo parsear la respuesta del modelo" }),
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error en /api/gemini:", error);
    return new Response(
      JSON.stringify({ error: "Error procesando la imagen" }),
      { status: 500 }
    );
  }
}
