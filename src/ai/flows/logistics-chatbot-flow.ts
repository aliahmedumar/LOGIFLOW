
'use server';
/**
 * @fileOverview A Genkit flow for a logistics chatbot.
 *
 * - logisticsChatbotFlow - A function that takes a user query and returns a bot response.
 * - LogisticsChatbotInput - The input type for the logisticsChatbotFlow function.
 * - LogisticsChatbotOutput - The return type for the logisticsChatbotFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LogisticsChatbotInputSchema = z.object({
  userQuery: z.string().describe('The query or message from the user.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('Previous conversation history.'),
});
export type LogisticsChatbotInput = z.infer<typeof LogisticsChatbotInputSchema>;

const LogisticsChatbotOutputSchema = z.object({
  botResponse: z.string().describe('The response from the AI chatbot.'),
});
export type LogisticsChatbotOutput = z.infer<typeof LogisticsChatbotOutputSchema>;

export async function logisticsChatbot(
  input: LogisticsChatbotInput
): Promise<LogisticsChatbotOutput> {
  return logisticsChatbotFlow(input);
}

// For a real RAG system, you would add tools for document retrieval here.
// For now, it's a simple generative prompt.
const prompt = ai.definePrompt({
  name: 'logisticsChatbotPrompt',
  input: {schema: LogisticsChatbotInputSchema},
  output: {schema: LogisticsChatbotOutputSchema},
  prompt: `You are LogiBot, a helpful AI assistant for LogiFlow, a shipping and logistics platform.
  Answer user questions about shipment tracking, ETAs, and standard operating procedures for freight handlers.
  Be concise and helpful. If you don't know the answer, say so.

  {{#if chatHistory}}
  Conversation History:
  {{#each chatHistory}}
  {{role}}: {{{content}}}
  {{/each}}
  {{/if}}

  User: {{{userQuery}}}
  LogiBot:
`,
});

const logisticsChatbotFlow = ai.defineFlow(
  {
    name: 'logisticsChatbotFlow',
    inputSchema: LogisticsChatbotInputSchema,
    outputSchema: LogisticsChatbotOutputSchema,
  },
  async (input: any) => {
    const {output} = await prompt(input);
    return output!;
  }
);
