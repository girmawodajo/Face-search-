
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SearchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function performFaceSearch(base64Image: string): Promise<{ text: string; results: SearchResult[] }> {
  // Extract only the base64 part if it includes the data URL prefix
  const base64Data = base64Image.split(',')[1] || base64Image;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data,
          },
        },
        {
          text: "Identify this person and specifically find all their public social media profiles (LinkedIn, Instagram, X/Twitter, Facebook, TikTok, YouTube, Pinterest, etc.) using Google Search. List the social media accounts found and provide a summary of who this person is and where they are active. If no public information exists, explain that clearly.",
        },
      ],
    },
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "No detailed information found.";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const results: SearchResult[] = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title || "Web Link",
      url: chunk.web.uri,
    }));

  return { text, results };
}
