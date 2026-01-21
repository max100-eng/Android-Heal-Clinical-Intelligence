import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  try {
    const { base64, mimeType, modality } = await request.json();

    if (!base64 || !mimeType) {
      return Response.json(
        { error: "Faltan datos de la imagen" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64,
                mimeType
              }
            },
            { text: `Analiza esta imagen (${modality})` }
          ]
        }
      ]
    });

    const text = result.response.text();

    return Response.json({
      result: text
    });

  } catch (error) {
    console.error("Error en /api/gemini:", error);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

