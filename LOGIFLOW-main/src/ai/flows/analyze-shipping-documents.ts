
'use server';

/**
 * @fileOverview Allows users to chat with an AI about an uploaded shipping document.
 *
 * - chatWithShippingDocument - A function that handles the conversation about a shipping document.
 * - ChatWithShippingDocumentInput - The input type for the chatWithShippingDocument function.
 * - ChatWithShippingDocumentOutput - The return type for the chatWithShippingDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithShippingDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      'The shipping document as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
  userQuery: z.string().describe('The user question or query about the document.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('Previous conversation history related to this document.'),
});

export type ChatWithShippingDocumentInput = z.infer<
  typeof ChatWithShippingDocumentInputSchema
>;

const ChatWithShippingDocumentOutputSchema = z.object({
  botResponse: z.string().describe('The AI assistant response to the user query about the document.'),
});

export type ChatWithShippingDocumentOutput = z.infer<
  typeof ChatWithShippingDocumentOutputSchema
>;

export async function chatWithShippingDocument(
  input: ChatWithShippingDocumentInput
): Promise<ChatWithShippingDocumentOutput> {
  return chatWithShippingDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithShippingDocumentPrompt',
  input: {schema: ChatWithShippingDocumentInputSchema},
  output: {schema: ChatWithShippingDocumentOutputSchema},
  prompt: `You are an AI assistant specialized in answering questions about uploaded shipping documents.
The user has uploaded a document and will ask questions about its content.
Use the content of the document provided to answer the user's questions.
Refer to previous parts of the conversation if relevant and helpful. Be concise and focus on the document's content.

{{#if chatHistory}}
Conversation History (about this document):
{{#each chatHistory}}
{{role}}: {{{content}}}
{{/each}}
{{/if}}

User's current question about the document: {{{userQuery}}}

Document Content is provided below:
{{media url=documentDataUri}}

Your Answer (based *only* on the document and chat history provided):
`,
});

const chatWithShippingDocumentFlow = ai.defineFlow(
  {
    name: 'chatWithShippingDocumentFlow',
    inputSchema: ChatWithShippingDocumentInputSchema,
    outputSchema: ChatWithShippingDocumentOutputSchema,
  },
  async (input: any) => {
    const {output} = await prompt(input);
    return output!;
  }
);

