import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from '../types';

const getAiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateChatResponse = async (history: ChatMessage[]): Promise<string> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';
    
    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));
    
    // The last message is the new user prompt, which shouldn't be in the history for the API call
    const currentPrompt = contents.pop();
    if (!currentPrompt) return "I can't respond to an empty message.";

    const chat = ai.chats.create({
        model,
        history: contents
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message: currentPrompt.parts[0].text });
    return response.text;
};

export const analyzeImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';
    
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType,
        },
    };
    
    const textPart = {
        text: prompt,
    };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, textPart] },
    });
    
    return response.text;
};

export const generateStoryFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';

    const prompt = `Analyze the mood, scene, and subjects in this image. Based on your analysis, write an evocative and compelling opening paragraph for a story set in this world. The paragraph should be around 100-150 words and set a clear tone (e.g., mystery, adventure, romance, horror).`;

    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType,
        },
    };

    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, textPart] },
    });
    
    return response.text;
};

export const generateSpeech = async (text: string): Promise<string> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash-preview-tts';

    const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: `Read this story in an expressive, engaging voice: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from API.");
    }
    
    return base64Audio;
};
