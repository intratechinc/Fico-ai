import cors from 'cors';
import path from 'path';
// Fix: Use a single, standard import for express.
// Fix: Import Request and Response types directly from express
import express, { Request, Response } from 'express';
// Fix: Add imports to define __dirname in an ES module context.
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix: Let app type be inferred from express() call
const app = express();
const port = process.env.PORT || 8080;

app.use(cors({
  origin: ['https://ai-fico-simulator.web.app'],
}));
app.use(express.json({ limit: '10mb' }));

// `__dirname` is available in CommonJS. In Cloud Run, it will resolve to the directory of the running script, which is `/workspace/backend/dist`.
// The static assets are at the root, so we need to go up two directories.
const publicPath = path.join(__dirname, '..', '..');
app.use(express.static(publicPath));

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey });

const systemInstruction = `
You are an expert FICO credit score analyst. Your task is to analyze a user's credit report data, extract key financial metrics, and generate a set of personalized, actionable goals for score improvement.

**Analysis and Extraction:**
1.  Parse the provided credit report (which could be plain text, JSON, or PDF content).
2.  Extract the following data points into a structured JSON object under the key \`credit_data\`:
    *   \`accounts\`: An array of credit accounts (revolving, installment, mortgage). For each account, extract \`type\`, \`balance\`, \`limit\`, \`status\`, and a summarized \`payment_history\` string.
    *   \`collections\`: An array of collection accounts, with \`type\`, \`amount\`, and \`status\`.
    *   \`late_payments\`: Total number of late payments across all accounts.
    *   \`inquiries\`: Total number of hard inquiries in the last 2 years.
    *   \`average_account_age_months\`: The average age of all credit accounts in months.
    *   \`credit_mix\`: An object detailing the number of \`revolving\`, \`installment\`, and \`mortgage\` accounts.

**Personalized Goal Generation:**
1.  Based on the extracted data, create 3-5 personalized goals for the user. These goals should be realistic and address the biggest opportunities for score improvement.
2.  Return these goals in an array under the key \`personalized_goals\`.
3.  Each goal object must contain:
    *   \`goal_id\`: A unique string identifier.
    *   \`title\`: A concise, motivating title. **This title MUST follow the exact format: "Increase Score by X Points"**, where X is the total potential point increase from completing the goal.
    *   \`category\` - One of 'Payment History', 'Amounts Owed', 'Length of Credit History', 'Credit Mix', 'New Credit'.
    *   \`timeframe_months\` - A realistic number of months to achieve the goal.
    *   \`action_plan\`: An array of step-by-step actions. Each step must have:
        *   \`step\`: A clear, actionable description (e.g., "Pay down credit card balance by $500").
        *   \`impact\`: The estimated FICO point increase for completing that specific step.

**CRITICAL RULE: Mathematical Accuracy**
*   For each generated goal, the sum of all \`impact\` values in the \`action_plan\` array **MUST EXACTLY EQUAL** the number of points 'X' stated in the goal's \`title\`. For example, if the title is "Increase Score by 45 Points", the sum of the impacts in the action plan must be precisely 45. This is non-negotiable.

**Output Format:**
Your entire response MUST be a single, valid JSON object with two top-level keys: \`credit_data\` and \`personalized_goals\`, conforming to the schemas described below. Do not include any text, markdown, or explanations outside of this JSON object.
`;

const schema = {
  type: Type.OBJECT,
  properties: {
    credit_data: {
      type: Type.OBJECT,
      properties: {
        accounts: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              balance: { type: Type.NUMBER },
              limit: { type: Type.NUMBER },
              status: { type: Type.STRING },
              payment_history: { type: Type.STRING },
            },
          },
        },
        collections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              status: { type: Type.STRING },
            },
          },
        },
        late_payments: { type: Type.INTEGER },
        inquiries: { type: Type.INTEGER },
        average_account_age_months: { type: Type.INTEGER },
        credit_mix: {
          type: Type.OBJECT,
          properties: {
            revolving: { type: Type.INTEGER },
            installment: { type: Type.INTEGER },
            mortgage: { type: Type.INTEGER },
          },
        },
      },
    },
    personalized_goals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          goal_id: { type: Type.STRING },
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          timeframe_months: { type: Type.INTEGER },
          action_plan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.STRING },
                impact: { type: Type.NUMBER },
              },
            },
          },
        },
      },
    },
  },
};

// Fix: Use imported Request and Response types for route handlers
app.post('/api/analyze', async (req: Request, res: Response) => {
    const { content, mimeType } = req.body;

    if (!content || !mimeType) {
        return res.status(400).json({ error: 'Missing content or mimeType in request body' });
    }

    let reportPart;
    if (mimeType === 'application/pdf' && content.includes(',')) {
        reportPart = {
            inlineData: {
                mimeType: mimeType,
                data: content.split(',')[1],
            },
        };
    } else {
        reportPart = { text: content };
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [reportPart] },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: schema,
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) {
            return res.status(500).json({ error: "Received an empty response from the AI service." });
        }
        
        const result = JSON.parse(jsonText) as GeminiResponse;
        res.json(result);

    } catch (error) {
        console.error("Error analyzing credit report with Gemini:", error);
        if (error instanceof Error) {
            if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
                return res.status(429).json({ error: "The AI service is currently busy due to high traffic. Please wait a few moments and try again." });
            }
            if (error.message.includes('SAFETY')) {
                return res.status(400).json({ error: "The request was blocked due to safety settings. Please check your input." });
            }
            if (error.message.includes('API key')) {
                return res.status(500).json({ error: "Invalid API key provided to the backend server." });
            }
        }
        res.status(500).json({ error: "An unexpected error occurred on the server." });
    }
});

// Fix: Use imported Request and Response types for route handlers
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});