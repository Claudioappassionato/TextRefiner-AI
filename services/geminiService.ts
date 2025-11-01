
import { GoogleGenAI, Type } from "@google/genai";
import type { Options, RefinedTextResponse, ChartData } from '../types';

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        refinedText: { 
            type: Type.STRING, 
            description: "The final, corrected, improved, and (if requested) expanded text." 
        },
        revisionSummary: {
            type: Type.ARRAY,
            description: "A bulleted list (max 5 points) of the most important revisions applied (e.g., 'Corrected grammatical errors', 'Improved cohesion between paragraphs', 'Added examples').",
            items: { type: Type.STRING }
        },
        accuracyReport: {
            type: Type.STRING,
            description: "A brief report on the accuracy corrections made. If verification was not requested or no errors were found, leave an empty string."
        },
        chartSuggestions: {
            type: Type.ARRAY,
            description: "An array of objects representing data for suggested charts. If not requested or not applicable, leave an empty array.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "Title of the chart." },
                    type: { type: Type.STRING, description: "Suggested chart type ('bar', 'line', 'pie')." },
                    dataKey: { type: Type.STRING, description: "The key in the data objects that represents the value or metric." },
                    nameKey: { type: Type.STRING, description: "The key in the data objects that represents the label or category." },
                    data: {
                        type: Type.ARRAY,
                        description: "Data for the chart, as an array of objects with keys and values.",
                        items: { 
                            type: Type.OBJECT,
                            properties: {
                                // Dynamic properties, so we can't be more specific here.
                                // Let's define the two most common keys
                                label: { type: Type.STRING, description: "The label for a data point (e.g., a year, a category)." },
                                value: { type: Type.NUMBER, description: "The value for a data point." },
                            },
                        }
                    }
                },
                required: ["title", "type", "data", "dataKey", "nameKey"]
            }
        }
    },
    required: ["refinedText", "revisionSummary", "accuracyReport"]
};


export const refineText = async (text: string, options: Options): Promise<RefinedTextResponse> => {
    // The user was instructed to set GEMINI_API_KEY, so we should use that.
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable not set. Please ensure it is configured correctly in your .env.local file.");
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    let instructions = `You are an expert editor and fact-checker named TextRefiner AI. Your primary goal is to return a refined version of the user's text according to their specified options.

User Text:
---
${text}
---

Follow these instructions EXACTLY:

1.  **Core Task: Correction and Refinement.**
    - First, perform a complete correction of spelling, grammar, syntax, and punctuation.
    - Improve the overall flow and clarity. Eliminate repetitions and convoluted sentences to make the text more readable.
    - The language of your output must match the original text's language.
`;

    if (options.isAcademic) {
        instructions += `
2.  **Style Tone: Academic.**
    - Rewrite the text in a formal, academic style. Use precise terminology, maintain an objective tone, and ensure a rigorous logical structure.
`;
    } else if (options.maintainTone) {
        instructions += `
2.  **Style Tone: Maintain Original.**
    - Maintain the original narrative tone and style as much as possible. Your corrections should be seamless and not flatten the author's voice.
`;
    } else {
        instructions += `
2.  **Style Tone: Neutral.**
    - Apply corrections using a neutral, clear, and standard writing style.
`;
    }
    
    const additionalTasks = [];
    if (options.expand) {
        additionalTasks.push(`**Expansion:** After all other corrections and style adjustments are complete, expand the resulting text by approximately 20%. The final output MUST be longer than the original text provided by the user. Achieve this by adding relevant details, clarifying examples, further insights, and logical connections. The expansion must feel natural and enrich the text, not just add filler content.`);
    }
    if (options.verifyAccuracy) {
        additionalTasks.push(`**Accuracy Check:** Carefully check all data, names, dates, and historical or scientific references against reliable sources. Correct any inaccuracies found and briefly mention the corrections in the accuracy report.`);
    }
    if (options.addCharts) {
        let chartInstruction = `**Chart Generation:** Identify sections of the text that contain quantifiable data suitable for visualization. If you find opportunities, generate data for a maximum of 2 charts. `;
        
        if (options.chartType === 'automatic') {
            chartInstruction += `Based on the nature of the data, choose the most appropriate chart type from the following options: 'bar' (for comparing categories), 'line' (for showing trends over time), or 'pie' (for showing parts of a whole). `;
        } else {
            chartInstruction += `You MUST generate a '${options.chartType}' chart. If the data is not suitable for this specific chart type, do not generate a chart for that data. `;
        }
        
        chartInstruction += `Ensure 'dataKey' and 'nameKey' correctly match the keys within your generated 'data' objects.`;
        
        additionalTasks.push(chartInstruction);
    }

    if (additionalTasks.length > 0) {
        instructions += `
3.  **Additional Tasks:**
`;
        instructions += additionalTasks.map(task => `- ${task}`).join('\n');
    }

    instructions += `

**Final Output Instructions:**
- Respond EXCLUSIVELY with a JSON object that follows the provided schema. 
- Do not include any text, notes, or apologies before or after the JSON object.
- The 'refinedText' field should contain the complete, final version of the text after all requested operations.`;


    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: instructions,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    try {
        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString) as RefinedTextResponse;
        return parsedJson;
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text);
        throw new Error("Received an invalid response from the AI model.");
    }
};
