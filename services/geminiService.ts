import { GeminiResponse } from "../types";

export const analyzeCreditReport = async (reportData: { content: string; mimeType: string }): Promise<GeminiResponse> => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const result = await response.json();
        return result as GeminiResponse;

    } catch (error) {
        console.error("Error calling backend service:", error);
        if (error instanceof Error) {
            // Forward the error message from the backend or network error
            throw new Error(`${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the server.");
    }
};
