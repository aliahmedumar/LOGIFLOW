
'use server';
/**
 * @fileOverview A Genkit flow for forecasting shipment risk.
 *
 * - forecastShipmentRisk - A function that takes shipment details and returns a risk forecast.
 * - ForecastShipmentRiskInput - The input type for the forecastShipmentRisk function.
 * - ForecastShipmentRiskOutput - The return type for the forecastShipmentRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastShipmentRiskInputSchema = z.object({
  shipmentId: z.string().describe('The unique identifier for the shipment.'),
  currentStatus: z.string().describe('The current status of the shipment (e.g., In Transit, At Port, Delayed).'),
  originPort: z.string().describe('The port of origin for the shipment.'),
  destinationPort: z.string().describe('The destination port for the shipment.'),
  carrier: z.string().describe('The shipping carrier responsible for the shipment.'),
  estimatedTimeOfArrival: z.string().describe('The original estimated time of arrival (YYYY-MM-DD).'),
  historicalDataSummary: z.string().optional().describe('A summary of historical performance, known issues on similar routes, with this carrier, or at the specified ports.'),
});
export type ForecastShipmentRiskInput = z.infer<typeof ForecastShipmentRiskInputSchema>;

const ForecastShipmentRiskOutputSchema = z.object({
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe('The predicted risk level for the shipment.'),
  potentialIssues: z.array(z.string()).describe('A list of specific potential issues that might cause delays or exceptions, directly linked to the input data.'),
  confidenceScore: z.number().min(0).max(1).describe('A score between 0 and 1 indicating the confidence in this prediction.'),
  recommendedActions: z.array(z.string()).describe('Suggested actions to mitigate potential risks, tailored to the risk level.'),
});
export type ForecastShipmentRiskOutput = z.infer<typeof ForecastShipmentRiskOutputSchema>;

export async function forecastShipmentRisk(
  input: ForecastShipmentRiskInput
): Promise<ForecastShipmentRiskOutput> {
  return forecastShipmentRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forecastShipmentRiskPrompt',
  input: {schema: ForecastShipmentRiskInputSchema},
  output: {schema: ForecastShipmentRiskOutputSchema},
  prompt: `You are an AI Shipment Risk Forecaster for LogiFlow. Your task is to analyze the provided shipment details and any historical context to predict the risk of delays or operational exceptions. Output your analysis in the specified JSON format.

Shipment Details:
- ID: {{{shipmentId}}}
- Current Status: {{{currentStatus}}}
- Origin Port: {{{originPort}}}
- Destination Port: {{{destinationPort}}}
- Carrier: {{{carrier}}}
- Original Estimated Time of Arrival (ETA): {{{estimatedTimeOfArrival}}}
{{#if historicalDataSummary}}- Historical Context/Notes: {{{historicalDataSummary}}}{{/if}}

Based on these details, provide:
1.  **riskLevel**: Categorize the risk as 'Low', 'Medium', or 'High'.
    *   Consider a 'High' risk if \`currentStatus\` is 'Delayed'.
    *   If \`destinationPort\` is mentioned as problematic (e.g., "Los Angeles, USA", "Port of Long Beach") in \`historicalDataSummary\` or is known for congestion, and status is not yet 'Delivered', lean towards 'Medium' or 'High'.
    *   If \`historicalDataSummary\` mentions "poor carrier performance for {{{carrier}}}" or "frequent customs issues at {{{destinationPort}}}", increase risk.
    *   If all inputs seem nominal (e.g., 'In Transit', reliable carrier mentioned in notes) and \`historicalDataSummary\` is positive or neutral, lean towards 'Low'.
2.  **potentialIssues**: A list of specific potential issues (1-3 items). These should be plausible and directly tied to the input data.
    *   Example if \`currentStatus\` is 'At Customs': "Potential customs clearance delay at {{{destinationPort}}}."
    *   Example if \`destinationPort\` is "Port of Hamburg" and \`historicalDataSummary\` states "Congestion at Hamburg": "Risk of port congestion at Port of Hamburg leading to berthing delays."
    *   Example if \`carrier\` is "OceanPro Logistics" and \`historicalDataSummary\` says "OceanPro has equipment shortages": "Possible delay due to equipment availability issues with OceanPro Logistics."
    *   If status is 'Delayed', one issue should be "Further delays possible due to current 'Delayed' status."
3.  **confidenceScore**: A score from 0.0 to 1.0 indicating confidence.
    *   If \`historicalDataSummary\` is detailed and supports the risk level (e.g., "Carrier {{{carrier}}} has 95% on-time record for this lane"), confidence should be higher (e.g., 0.8-0.9 for Low risk).
    *   If \`historicalDataSummary\` is sparse or absent, confidence might be moderate (e.g., 0.6-0.75), unless other factors (\`currentStatus\`='Delayed') strongly indicate a risk.
4.  **recommendedActions**: A list of 1-3 actionable recommendations.
    *   For 'High' risk: "Immediately notify consignee of high potential for delay. Explore alternative transport options if cargo is critical. Prepare for potential demurrage/detention charges."
    *   For 'Medium' risk: "Alert customer of potential medium risk. Proactively verify documentation with carrier and customs broker. Monitor shipment updates twice daily."
    *   For 'Low' risk: "Continue standard monitoring procedures. Confirm ETA with {{{carrier}}} 24-48 hours prior to scheduled arrival."

Be specific and ensure your reasoning for potentialIssues directly references the provided input fields. Ensure the output is a valid JSON object matching the defined schema.
`,
});

const forecastShipmentRiskFlow = ai.defineFlow(
  {
    name: 'forecastShipmentRiskFlow',
    inputSchema: ForecastShipmentRiskInputSchema,
    outputSchema: ForecastShipmentRiskOutputSchema,
  },
  async (input: any) => {
    const {output} = await prompt(input);
    // Ensure confidence score is within bounds, LLMs might not always respect constraints
    if (output && output.confidenceScore > 1) output.confidenceScore = 1;
    if (output && output.confidenceScore < 0) output.confidenceScore = 0;
    return output!;
  }
);
