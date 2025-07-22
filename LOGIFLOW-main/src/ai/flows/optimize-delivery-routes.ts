'use server';

/**
 * @fileOverview This file defines a Genkit flow for optimizing delivery routes using AI.
 *
 * - optimizeDeliveryRoutes - A function that takes delivery details and returns an optimized route.
 * - OptimizeDeliveryRoutesInput - The input type for the optimizeDeliveryRoutes function.
 * - OptimizeDeliveryRoutesOutput - The return type for the optimizeDeliveryRoutes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeDeliveryRoutesInputSchema = z.object({
  startLocation: z.string().describe('The starting location for the delivery route.'),
  destinations: z
    .array(z.string())
    .describe('An array of destination addresses for the deliveries.'),
  trafficConditions: z.string().describe('Real-time traffic conditions along the route.'),
  weatherConditions: z.string().describe('Weather conditions along the route.'),
  deliverySchedules: z.string().describe('Delivery schedules and time windows.'),
});
export type OptimizeDeliveryRoutesInput = z.infer<typeof OptimizeDeliveryRoutesInputSchema>;

const OptimizeDeliveryRoutesOutputSchema = z.object({
  optimizedRoute: z
    .array(z.string())
    .describe('An array of addresses representing the optimized delivery route.'),
  estimatedDeliveryTime: z.string().describe('The estimated total delivery time for the route.'),
  estimatedCostSavings: z.string().describe('The estimated cost savings from the optimized route.'),
});
export type OptimizeDeliveryRoutesOutput = z.infer<typeof OptimizeDeliveryRoutesOutputSchema>;

export async function optimizeDeliveryRoutes(
  input: OptimizeDeliveryRoutesInput
): Promise<OptimizeDeliveryRoutesOutput> {
  return optimizeDeliveryRoutesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeDeliveryRoutesPrompt',
  input: {schema: OptimizeDeliveryRoutesInputSchema},
  output: {schema: OptimizeDeliveryRoutesOutputSchema},
  prompt: `You are an AI logistics expert specializing in delivery route optimization.

  Given the following delivery details, please provide an optimized delivery route that minimizes costs and improves delivery times.

  Start Location: {{{startLocation}}}
  Destinations: {{#each destinations}}{{{this}}}, {{/each}}
  Traffic Conditions: {{{trafficConditions}}}
  Weather Conditions: {{{weatherConditions}}}
  Delivery Schedules: {{{deliverySchedules}}}

  Consider all factors to suggest the most efficient route, including estimated delivery time and potential cost savings.
  Output the optimized route as an array of addresses, the estimated delivery time, and the estimated cost savings.
`,
});

const optimizeDeliveryRoutesFlow = ai.defineFlow(
  {
    name: 'optimizeDeliveryRoutesFlow',
    inputSchema: OptimizeDeliveryRoutesInputSchema,
    outputSchema: OptimizeDeliveryRoutesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
