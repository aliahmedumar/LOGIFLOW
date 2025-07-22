
'use server';
/**
 * @fileOverview A Genkit flow for reviewing carrier contracts.
 *
 * - reviewCarrierContract - A function that analyzes a contract document.
 * - ReviewCarrierContractInput - The input type for the reviewCarrierContract function.
 * - ReviewCarrierContractOutput - The return type for the reviewCarrierContract function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewCarrierContractInputSchema = z.object({
  contractDataUri: z
    .string()
    .describe(
      'The carrier contract document as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type ReviewCarrierContractInput = z.infer<typeof ReviewCarrierContractInputSchema>;

const ReviewCarrierContractOutputSchema = z.object({
  keyClauses: z.array(z.object({
    clauseType: z.string().describe("Type of clause, e.g., 'Liability Limit', 'Payment Terms', 'Force Majeure'."),
    summary: z.string().describe("A brief summary of the clause."),
    details: z.string().optional().describe("Specific details or exact wording if critical."),
  })).describe('Key clauses identified in the contract.'),
  pricingSummary: z.string().describe('A summary of the pricing terms, rates, and any potential hidden fees mentioned.'),
  complianceIssues: z.array(z.object({
    issue: z.string().describe("Description of the potential compliance issue or unfavorable term."),
    recommendation: z.string().optional().describe("Suggestion for addressing the issue."),
  })).describe('Potential compliance issues or unfavorable terms found.'),
  overallAssessment: z.string().describe('A brief overall assessment of the contract from a logistics favorability perspective.'),
});
export type ReviewCarrierContractOutput = z.infer<typeof ReviewCarrierContractOutputSchema>;

export async function reviewCarrierContract(
  input: ReviewCarrierContractInput
): Promise<ReviewCarrierContractOutput> {
  return reviewCarrierContractFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reviewContractPrompt',
  input: {schema: ReviewCarrierContractInputSchema},
  output: {schema: ReviewCarrierContractOutputSchema},
  prompt: `You are an AI Logistics Contract Review Agent.
  Analyze the provided carrier contract document. Your goal is to identify and summarize key clauses, pricing terms, and any potential compliance issues or unfavorable terms for the shipper.

  Contract Document: {{media url=contractDataUri}}

  Please extract the following:
  1.  Key Clauses: Identify critical clauses (e.g., Liability Limits, Payment Terms, Volume Commitments, Demurrage/Detention, Force Majeure, Termination). For each, provide type, summary, and critical details.
  2.  Pricing Summary: Summarize all pricing information, including base rates, surcharges, accessorial fees, and payment conditions. Highlight any potentially hidden or ambiguous costs.
  3.  Compliance Issues & Unfavorable Terms: List any terms that deviate from industry standards, are overly restrictive, or pose a risk to the shipper. Suggest how to address them if possible.
  4.  Overall Assessment: Provide a brief overall assessment of how favorable this contract is for the shipper.

  Focus on clarity and actionable insights.
  `,
});

const reviewCarrierContractFlow = ai.defineFlow(
  {
    name: 'reviewCarrierContractFlow',
    inputSchema: ReviewCarrierContractInputSchema,
    outputSchema: ReviewCarrierContractOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
