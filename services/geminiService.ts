
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, AnalysisInput } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzePersonality(input: AnalysisInput): Promise<AnalysisResult> {
  const parts: any[] = [];
  
  let promptText = `Analyze the combined data and synthesize a professional person encyclopedia card.
    INTEGRATE ALL INPUTS into two distinct categories:
    1. [Business Aptitude]: Professional skills, work style, strengths, and recommended business roles.
    2. [Person/Community]: Personality, values, how they interact with others, and community fit.

    Output in Japanese. Be insightful and encouraging.
    Format as JSON according to the schema.`;

  if (input.text) promptText += `\n\n[Text]:\n${input.text}`;
  if (input.url) promptText += `\n\n[URL]:\n${input.url}`;

  input.files.forEach((file) => {
    parts.push({
      inlineData: {
        data: file.base64,
        mimeType: file.mimeType
      }
    });
  });

  parts.push({ text: promptText });

  const response = await ai.models.generateContent({
    // Free tier friendly model for local development
    model: "gemini-2.5-flash",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          catchphrase: { type: Type.STRING },
          summary: { type: Type.STRING },
          scores: {
            type: Type.OBJECT,
            properties: {
              sociability: { type: Type.NUMBER },
              logic: { type: Type.NUMBER },
              curiosity: { type: Type.NUMBER },
              cooperation: { type: Type.NUMBER },
              action: { type: Type.NUMBER },
            },
            required: ["sociability", "logic", "curiosity", "cooperation", "action"],
          },
          businessAptitude: {
            type: Type.OBJECT,
            properties: {
              workStyle: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              suitableRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["workStyle", "strengths", "suitableRoles"],
          },
          personCommunity: {
            type: Type.OBJECT,
            properties: {
              socialStyle: { type: Type.STRING },
              values: { type: Type.ARRAY, items: { type: Type.STRING } },
              interactionTips: { type: Type.STRING },
              optimalPlace: { type: Type.STRING },
            },
            required: ["socialStyle", "values", "interactionTips", "optimalPlace"],
          },
          type: { type: Type.STRING },
        },
        required: ["catchphrase", "summary", "scores", "businessAptitude", "personCommunity", "type"],
      },
      systemInstruction: "You are an elite talent analyst. Create a sophisticated, encouraging person-profile focusing on professional aptitude and personal social charm.",
    },
  });

  const result = JSON.parse(response.text || '{}');
  return result as AnalysisResult;
}
