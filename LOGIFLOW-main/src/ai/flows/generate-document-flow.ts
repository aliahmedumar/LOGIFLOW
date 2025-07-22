'use server';
/**
 * @fileOverview A Genkit flow for generating various shipping and logistics documents.
 *
 * - generateDocument - A function that takes a document type and returns the generated document content and filename.
 * - GenerateDocumentInput - The input type for the generateDocument function.
 * - GenerateDocumentOutput - The return type for the generateDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDocumentInputSchema = z.object({
  documentType: z.enum(['Invoice', 'Bill of Lading', 'Packing List', 'Arrival Notice'])
    .describe('The type of document to generate.'),
  // We can add more specific fields here later if needed, e.g., orderId, customerInfo
});
export type GenerateDocumentInput = z.infer<typeof GenerateDocumentInputSchema>;

const GenerateDocumentOutputSchema = z.object({
  fileName: z.string().describe('The suggested filename for the generated document (e.g., Invoice_INV12345.txt).'),
  documentContent: z.string().describe('The full text content of the generated document.'),
});
export type GenerateDocumentOutput = z.infer<typeof GenerateDocumentOutputSchema>;

export async function generateDocument(
  input: GenerateDocumentInput
): Promise<GenerateDocumentOutput> {
  return generateDocumentFlow(input);
}

const generateDocumentPrompt = ai.definePrompt({
  name: 'generateDocumentPrompt',
  input: {schema: GenerateDocumentInputSchema},
  output: {schema: GenerateDocumentOutputSchema},
  prompt: `You are an AI assistant specialized in generating logistics and shipping documents.
  Generate the content for the specified document type: {{{documentType}}}.

  The document should be complete and realistic, with plausible placeholder data for all necessary fields.
  The output should be plain text, suitable for a .txt file.

  Examples of fields to include:
  - If Invoice:
    - Your Company Name, Address, Contact Info
    - Customer Name, Address
    - Invoice Number (e.g., INVXXXXX), Invoice Date, Due Date
    - Line items with Description, Quantity, Unit Price, Total Price
    - Subtotal, Tax (if applicable), Total Amount Due
    - Payment Instructions, Notes
  - If Bill of Lading:
    - Shipper Name/Address, Consignee Name/Address, Notify Party
    - B/L Number, Booking Number, Vessel/Voyage
    - Port of Loading, Port of Discharge, Place of Receipt, Place of Delivery
    - Marks & Numbers, Description of Goods, Gross Weight, Measurement
    - Freight & Charges, Terms (e.g., FOB, CIF)
  - If Packing List:
    - Shipper, Consignee
    - Invoice Number, Date
    - Packing List Number
    - Details of packages (e.g., Carton No., Description of Goods, Quantity per carton, Total Quantity, Net Weight, Gross Weight, Dimensions)
    - Totals for packages, weight, volume.
  - If Arrival Notice:
    - Shipping Line, Vessel/Voyage
    - B/L Number
    - Consignee
    - Port of Discharge, ETA
    - Container Numbers, Cargo Details (Weight, Volume)
    - Location for pickup, Charges due (e.g., THC, Demurrage if applicable)
    - Contact information.

  Ensure the fileName is appropriate for the document type (e.g., Invoice_INV<random_number>.txt, BOL_<random_number>.txt).
  Generate distinct and plausible data for each request.
  The documentContent should be the full text of the document.
`,
});

const generateDocumentFlow = ai.defineFlow(
  {
    name: 'generateDocumentFlow',
    inputSchema: GenerateDocumentInputSchema,
    outputSchema: GenerateDocumentOutputSchema,
  },
  async (input) => {
    const {output} = await generateDocumentPrompt(input);
    if (!output) {
        throw new Error('AI failed to generate document content.');
    }
    // Ensure a default filename if AI fails to provide one, though it should.
    if (!output.fileName) {
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        output.fileName = `${input.documentType.replace(/\s+/g, '_')}_${randomSuffix}.txt`;
    }
    return output;
  }
);
