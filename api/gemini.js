import { streamText } from "ai";

export default async function handler(req, res) {
  try {
    const { base64, mimeType, modality } = req.body;

    if (!base64 || !mimeType) {
      return res.status(400).json({ error: "Missing image data" });
    }

    const result = await streamText({
      model: "google/gemini-2.5-flash",
      apiKey: process.env.AI_GATEWAY_KEY,
      baseURL: process.env.AI_GATEWAY_URL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analiza esta imagen médica (${modality}) y proporciona hallazgos clínicos en español.`
            },
            {
              type: "input_image",
              image: {
                data: base64,
                mimeType: mimeType
              }
            }
          ]
        }
      ]
    });

    res.status(200).json({ result: result.text });
  } catch (error) {
    console.error("Error en Gemini:", error);
    res.status(500).json({ error: "Error procesando la imagen" });
  }
}

