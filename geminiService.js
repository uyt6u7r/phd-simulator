import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

const projectSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    difficulty: { type: Type.INTEGER },
    potential: { type: Type.INTEGER },
    novelty: { type: Type.INTEGER },
    feasibility: { type: Type.INTEGER },
    resources: { type: Type.INTEGER },
    attraction: { type: Type.INTEGER }
  },
  required: ["title", "description", "difficulty", "potential"]
};

export const generateResearchTopic = async (field) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a research topic for ${field}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: projectSchema,
        temperature: 0.8,
      }
    });
    if (response.text) return JSON.parse(response.text);
    throw new Error("No text");
  } catch (error) {
    console.error(error);
    return {
      title: "Analysis of API Errors",
      description: "Why things break.",
      difficulty: 50, potential: 50, novelty: 20, feasibility: 90, resources: 30, attraction: 40
    };
  }
};