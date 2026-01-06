import { streamText } from "ai";

const result = await streamText({
  model: "google/gemini-2.5-flash",
  apiKey: process.env.AI_GATEWAY_KEY,
  baseURL: process.env.AI_GATEWAY_URL,
